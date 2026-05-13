import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try to find registration in NKV first
  const { data: nkvReg } = await supabase
    .from('nkv_registrations')
    .select('id')
    .eq('id', id)
    .single()

  if (nkvReg) {
    // Fetch NKV documents from registration_documents table
    const { data: docs, error } = await supabase
      .from('registration_documents')
      .select('id, document_type, file_url, file_name')
      .eq('registration_id', id)
      .eq('registration_type', 'nkv')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(docs || [])
  }

  // Try Dokter Hewan
  const { data: dokterReg } = await supabase
    .from('dokter_hewan_registrations')
    .select('id')
    .eq('id', id)
    .single()

  if (dokterReg) {
    // For Dokter Hewan, fetch documents directly from registration record
    const { data: reg } = await supabase
      .from('dokter_hewan_registrations')
      .select(`
        color_photo_url,
        diploma_url,
        competency_cert_url,
        professional_recommendation_url
      `)
      .eq('id', id)
      .single()

    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Transform URLs into document objects
    const docTypes = [
      { field: 'color_photo_url', label: 'Pas Photo' },
      { field: 'diploma_url', label: 'Ijazah' },
      { field: 'competency_cert_url', label: 'Sertifikat Kompetensi' },
      { field: 'professional_recommendation_url', label: 'Rekomendasi Profesional' }
    ] as const

    const docs = docTypes
      .filter(doc => reg[doc.field])
      .map((doc, index) => ({
        id: `dh-${id}-${index}`,
        document_type: doc.label,
        file_url: reg[doc.field],
        file_name: doc.label.toLowerCase().replace(' ', '_') + '.pdf'
      }))

    return NextResponse.json(docs)
  }

  return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
}

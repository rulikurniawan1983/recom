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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const body = await request.json()
  const { assessment_score, assessment_notes, recommendation_file_url } = body

  if (assessment_score === undefined || assessment_score < 0 || assessment_score > 100) {
    return NextResponse.json(
      { error: 'Skor penilaian harus antara 0-100' },
      { status: 400 }
    )
  }

  if (!assessment_notes) {
    return NextResponse.json(
      { error: 'Catatan penilaian wajib diisi' },
      { status: 400 }
    )
  }

  // Find registration type
  const { data: nkvReg } = await supabase
    .from('nkv_registrations')
    .select('id')
    .eq('id', id)
    .single()

  const { data: dokterReg } = await supabase
    .from('dokter_hewan_registrations')
    .select('id')
    .eq('id', id)
    .single()

  const { data: vetReg } = await supabase
    .from('veterinary_registrations')
    .select('id')
    .eq('id', id)
    .single()

  const isNKV = !!nkvReg
  const isDokterHewan = !!dokterReg
  const isVeterinary = !!vetReg

  if (!isNKV && !isDokterHewan && !isVeterinary) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  const tableName = isNKV ? 'nkv_registrations' : isDokterHewan ? 'dokter_hewan_registrations' : 'veterinary_registrations'
  const isApproved = assessment_score >= 75
  const newStatus = isApproved ? 'approved' : 'rejected'

  // Update registration
  const updateData: Record<string, unknown> = {
    status: newStatus,
    assessment_score,
    assessment_notes,
    updated_at: new Date().toISOString()
  }

  if (recommendation_file_url) {
    updateData.recommendation_file_url = recommendation_file_url
  }

  if (isApproved) {
    updateData.approved_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from(tableName)
    .update(updateData)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Add tracking log
  await supabase.from('tracking_logs').insert({
    nkv_registration_id: isNKV ? id : null,
    dokter_hewan_registration_id: isDokterHewan ? id : null,
    veterinary_registration_id: isVeterinary ? id : null,
    registration_type: isNKV ? 'NKV' : isDokterHewan ? 'Dokter Hewan' : 'Veterinary',
    status: newStatus,
    notes: assessment_notes,
    created_by: null,
    created_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true, status: newStatus })
}

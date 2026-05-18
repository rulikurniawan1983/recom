import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current user to verify admin role
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role to fetch documents
    const serviceSupabase = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Try NKV registration first
    const { data: nkvReg } = await serviceSupabase
      .from('nkv_registrations')
      .select('id')
      .eq('id', id)
      .single()

    if (nkvReg) {
      const { data: docs, error } = await serviceSupabase
        .from('registration_documents')
        .select('id, document_type, file_url, file_name, status, admin_notes, verified_at, uploaded_at')
        .eq('registration_id', id)
        .eq('registration_type', 'nkv')
        .order('uploaded_at', { ascending: true })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(docs || [])
    }

    // Try Dokter Hewan registration
    const { data: dokterReg } = await serviceSupabase
      .from('dokter_hewan_registrations')
      .select('id')
      .eq('id', id)
      .single()

    if (dokterReg) {
      const { data: docs } = await serviceSupabase
        .from('registration_documents')
        .select('id, document_type, file_url, file_name, status, admin_notes, verified_at, uploaded_at')
        .eq('registration_id', id)
        .eq('registration_type', 'dokter_hewan')
        .order('uploaded_at', { ascending: true })

      if (docs && docs.length > 0) {
        return NextResponse.json(docs)
      }

      // If records exist in registration_documents, return them
      if (docs && docs.length > 0) {
        return NextResponse.json(docs)
      }

      // Fallback: read from dokter_hewan_registrations columns
      const { data: reg } = await serviceSupabase
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

      const docTypes = [
        { field: 'color_photo_url', label: 'Pas Photo' },
        { field: 'diploma_url', label: 'Ijazah' },
        { field: 'competency_cert_url', label: 'Sertifikat Kompetensi' },
        { field: 'professional_recommendation_url', label: 'Rekomendasi Profesional' }
      ] as const

      const fallbackDocs = docTypes
        .filter(doc => reg[doc.field])
        .map((doc, index) => ({
          id: `dh-fallback-${id}-${index}`,
          document_type: doc.label,
          file_url: reg[doc.field],
          file_name: `${doc.label.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          status: 'pending',
          uploaded_at: new Date().toISOString(),
          admin_notes: null,
          verified_at: null,
        }))

      return NextResponse.json(fallbackDocs)
    }

    // Try Veterinary registration
    const { data: vetReg } = await serviceSupabase
      .from('veterinary_registrations')
      .select('id')
      .eq('id', id)
      .single()

    if (vetReg) {
      const { data: docs, error } = await serviceSupabase
        .from('registration_documents')
        .select('id, document_type, file_url, file_name, status, admin_notes, verified_at, uploaded_at')
        .eq('registration_id', id)
        .eq('registration_type', 'veterinary')
        .order('uploaded_at', { ascending: true })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(docs || [])
    }

    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

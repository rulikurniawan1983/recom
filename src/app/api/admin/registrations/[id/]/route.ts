import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role key for admin access (bypass RLS)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' },
        { status: 500 }
      )
    }

    const serviceSupabase = createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    let fullReg: any = null

    // First check NKV registrations
    const { data: nkvReg, error: nkvCheckError } = await serviceSupabase
      .from('nkv_registrations')
      .select('id')
      .eq('id', id)
      .single()

    if (nkvCheckError) {
      console.error('Error checking NKV registration:', nkvCheckError)
    }

    if (nkvReg) {
      // NKV registration found - fetch full details
      const { data: nkvData, error: nkvError } = await serviceSupabase
        .from('nkv_registrations')
        .select(`
          id,
          user_id,
          registration_number,
          business_name,
          business_address,
          business_phone,
          business_email,
          business_type,
          product_type,
          product_description,
          status,
          verification_notes,
          inspector_id,
          inspection_date,
          inspection_notes,
          assessment_score,
          assessment_notes,
          recommendation_file_url,
          created_at,
          updated_at,
          approved_at,
          profiles(full_name, email),
          business_units(id, name, address, phone, email, business_type),
          product_types(id, name, description, category),
          registration_documents(id, document_type, file_url, file_name, status, uploaded_at, admin_notes),
          tracking_logs(id, status, created_at, notes, created_by)
        `)
        .eq('id', id)
        .single()

      if (nkvError) {
        console.error('Error fetching NKV registration:', nkvError)
        return NextResponse.json(
          { error: 'Gagal mengambil data NKV: ' + nkvError.message },
          { status: 500 }
        )
      }

      if (nkvData) {
        fullReg = { ...nkvData, type: 'NKV' }
      }
} else {
       // Check Dokter Hewan registrations
       const { data: dhData, error: dhError } = await serviceSupabase
         .from('dokter_hewan_registrations')
         .select(`
           id,
           user_id,
           registration_number,
           full_name,
           birth_place_date,
           ktp_address,
           clinic_address,
           phone,
           email,
           color_photo_url,
           diploma_url,
           competency_cert_url,
           professional_recommendation_url,
           nib_number,
           strv_number,
           status,
           verification_notes,
           inspection_notes,
           assessment_notes,
           recommendation_file_url,
           created_at,
           updated_at,
           approved_at,
           profiles(full_name, email),
           registration_documents(id, document_type, file_url, file_name, status, uploaded_at, admin_notes),
           tracking_logs(id, status, created_at, notes, created_by)
         `)
        .eq('id', id)
        .single()

      if (dhError) {
        console.error('Error fetching Dokter Hewan registration:', dhError)
        return NextResponse.json(
          { error: 'Gagal mengambil data Dokter Hewan: ' + dhError.message },
          { status: 500 }
        )
      }

      if (dhData) {
        fullReg = { ...dhData, type: 'Dokter Hewan' }
      }
    }

    if (!fullReg) {
      return NextResponse.json(
        { error: 'Registrasi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(fullReg)
  } catch (error: any) {
    console.error('Error fetching registration detail:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengambil detail' },
      { status: 500 }
    )
  }
}
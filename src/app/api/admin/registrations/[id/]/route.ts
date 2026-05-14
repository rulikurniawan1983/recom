import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    const id = segments[segments.length - 1]

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

    // Check NKV first
    const { data: nkvReg } = await serviceSupabase
      .from('nkv_registrations')
      .select('id')
      .eq('id', id)
      .single()

    if (nkvReg) {
      const { data: nkvData, error: nkvError } = await serviceSupabase
        .from('nkv_registrations')
        .select('*')
        .eq('id', id)
        .single()

      if (nkvError) {
        console.error('NKV fetch error:', nkvError)
        return NextResponse.json(
          { error: 'Gagal mengambil data NKV: ' + nkvError.message },
          { status: 500 }
        )
      }

      if (nkvData) {
        const [profileResult, docsResult, trackingResult] = await Promise.all([
          serviceSupabase.from('profiles').select('full_name, email').eq('id', nkvData.user_id).single(),
          serviceSupabase.from('registration_documents').select('*').eq('registration_id', id),
          serviceSupabase.from('tracking_logs').select('*').eq('nkv_registration_id', id),
        ])

        let buResult: any = null
        let ptResult: any = null
        if (nkvData.business_unit_id) {
          buResult = await serviceSupabase.from('business_units').select('*').eq('id', nkvData.business_unit_id).single()
        }
        if (nkvData.product_type_id) {
          ptResult = await serviceSupabase.from('product_types').select('*').eq('id', nkvData.product_type_id).single()
        }

        fullReg = {
          ...nkvData,
          type: 'NKV',
          profiles: profileResult.data ? [profileResult.data] : [],
          business_units: buResult?.data || null,
          product_types: ptResult?.data || null,
          registration_documents: docsResult.data || [],
          tracking_logs: trackingResult.data || [],
        }
      }
    } else {
      const { data: dhData, error: dhError } = await serviceSupabase
        .from('dokter_hewan_registrations')
        .select('*')
        .eq('id', id)
        .single()

      if (dhError) {
        console.error('DH fetch error:', dhError)
        return NextResponse.json(
          { error: 'Gagal mengambil data Dokter Hewan: ' + dhError.message },
          { status: 500 }
        )
      }

      if (dhData) {
        const [profileResult, docsResult, trackingResult] = await Promise.all([
          serviceSupabase.from('profiles').select('full_name, email').eq('id', dhData.user_id).single(),
          serviceSupabase.from('registration_documents').select('*').eq('registration_id', id),
          serviceSupabase.from('tracking_logs').select('*').eq('dokter_hewan_registration_id', id),
        ])

        fullReg = {
          ...dhData,
          type: 'Dokter Hewan',
          profiles: profileResult.data ? [profileResult.data] : [],
          registration_documents: docsResult.data || [],
          tracking_logs: trackingResult.data || [],
        }
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
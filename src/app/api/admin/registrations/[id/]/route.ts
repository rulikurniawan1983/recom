import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Service key not configured' },
      { status: 500 }
    )
  }

  try {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    const id = segments[segments.length - 1]

    if (!id || id === 'route.ts') {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check if NKV
    const { data: nkvCheck, error: checkError } = await serviceSupabase
      .from('nkv_registrations')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError)
    }

    let result: any = null

    if (nkvCheck) {
      // NKV Registration
      const { data, error } = await serviceSupabase
        .from('nkv_registrations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('NKV error:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      if (data) {
        result = { ...data, regType: 'NKV' }
      }
    } else {
      // Dokter Hewan Registration
      const { data, error } = await serviceSupabase
        .from('dokter_hewan_registrations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('DH error:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      if (data) {
        result = { ...data, regType: 'Dokter Hewan' }
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Registrasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Safe JSON serialization
    const safeResult = JSON.parse(JSON.stringify(result))
    return NextResponse.json(safeResult)
  } catch (error: any) {
    console.error('Detail API error:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}
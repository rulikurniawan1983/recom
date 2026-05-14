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

    // Determine registration type first
    const { data: nkvReg } = await serviceSupabase
      .from('nkv_registrations')
      .select('id')
      .eq('id', id)
      .single()

    let fullReg: any = null

    if (nkvReg) {
      const { data, error } = await serviceSupabase
        .from('nkv_registrations')
        .select(`
          *,
          profiles!inner(full_name, email),
          business_units(name, address, phone, email, business_type),
          product_types(name, description, category),
          registration_documents(
            id, document_type, file_url, file_name, status, uploaded_at, admin_notes
          ),
          tracking_logs(id, status, created_at, notes, created_by)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        fullReg = { ...data, type: 'NKV' as const }
      }
    } else {
      const { data, error } = await serviceSupabase
        .from('dokter_hewan_registrations')
        .select(`
          *,
          profiles!inner(full_name, email),
          registration_documents(
            id, document_type, file_url, file_name, status, uploaded_at, admin_notes
          ),
          tracking_logs(id, status, created_at, notes, created_by)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        fullReg = { ...data, type: 'Dokter Hewan' as const }
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
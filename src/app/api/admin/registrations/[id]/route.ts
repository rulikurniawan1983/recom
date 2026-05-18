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
    console.log('[GET /api/admin/registrations/[id]] Fetching registration with id:', id)

    // Verify admin auth and get supabase client with session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user found - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log('User does not have admin role')
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    console.log('Admin verified, proceeding with query')

    // Use the same supabase client (with user session) to fetch registration
    // Admin RLS policy allows viewing all registrations
    let { data: nkvReg, error: nkvError } = await supabase
      .from('nkv_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (nkvError) {
      console.error('NKV query error:', nkvError)
      // If error is not "No rows found", return error
      if (nkvError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to query NKV registrations', details: nkvError.message },
          { status: 500 }
        )
      }
    }

    if (nkvReg) {
      console.log('Found in NKV table')
      // Fetch documents with type filter
      const { data: docs } = await supabase
        .from('registration_documents')
        .select('*')
        .eq('registration_id', id)
        .eq('registration_type', 'nkv')
      return NextResponse.json({
        ...nkvReg,
        regType: 'NKV',
        documents: docs || []
      })
    }

    // Try Dokter Hewan
    let { data: dokterReg, error: dokterError } = await supabase
      .from('dokter_hewan_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (dokterError) {
      console.error('Dokter query error:', dokterError)
      if (dokterError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to query Dokter Hewan registrations', details: dokterError.message },
          { status: 500 }
        )
      }
    }

    if (dokterReg) {
      console.log('Found in Dokter Hewan table')
      const { data: docs } = await supabase
        .from('registration_documents')
        .select('*')
        .eq('registration_id', id)
        .eq('registration_type', 'dokter_hewan')
      return NextResponse.json({
        ...dokterReg,
        regType: 'Dokter Hewan',
        documents: docs || []
      })
    }

    // Try Veterinary (Pelayanan Kesehatan Hewan)
    let { data: vetReg, error: vetError } = await supabase
      .from('veterinary_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (vetError) {
      console.error('Veterinary query error:', vetError)
      if (vetError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to query Veterinary registrations', details: vetError.message },
          { status: 500 }
        )
      }
    }

    if (vetReg) {
      console.log('Found in Veterinary table')
      const { data: docs } = await supabase
        .from('registration_documents')
        .select('*')
        .eq('registration_id', id)
        .eq('registration_type', 'veterinary')
      return NextResponse.json({
        ...vetReg,
        regType: 'Veterinary',
        documents: docs || []
      })
    }

    console.log(`Registration not found for id: ${id}`)
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  } catch (error) {
    console.error('Get registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify admin auth
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
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Use service role for deletion (bypass RLS)
    const serviceSupabase = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check if registration exists in any of the three tables
    const { data: nkvReg } = await serviceSupabase
      .from('nkv_registrations')
      .select('id')
      .eq('id', id)
      .single()

    const { data: dokterReg } = await serviceSupabase
      .from('dokter_hewan_registrations')
      .select('id')
      .eq('id', id)
      .single()

    const { data: vetReg } = await serviceSupabase
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

    // Manually delete registration_documents (polymorphic, no FK cascade)
    await serviceSupabase
      .from('registration_documents')
      .delete()
      .eq('registration_id', id)

    // Delete registration — ON DELETE CASCADE will automatically remove:
    // - tracking_logs
    // - inspection_schedules
    // - registration_comments
    let tableName: string
    if (isNKV) tableName = 'nkv_registrations'
    else if (isDokterHewan) tableName = 'dokter_hewan_registrations'
    else tableName = 'veterinary_registrations'

    const { error: deleteError } = await serviceSupabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log(`Admin ${user.email} deleted ${tableName} id:${id}`)

    return NextResponse.json({ success: true, message: 'Permohonan berhasil dihapus' })
  } catch (error) {
    console.error('Delete registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

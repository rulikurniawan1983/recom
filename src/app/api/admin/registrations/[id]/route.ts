import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
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

    // Check if registration exists in either table
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

    const isNKV = !!nkvReg
    const isDokterHewan = !!dokterReg

    if (!isNKV && !isDokterHewan) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Manually delete registration_documents (polymorphic, no FK cascade)
    await serviceSupabase
      .from('registration_documents')
      .delete()
      .eq('registration_id', id)

    // Delete registration - ON DELETE CASCADE will automatically remove:
    // - tracking_logs (via dual FK cascade)
    // - inspection_schedules (via dual FK cascade)
    // - registration_comments (via dual FK cascade)
    const tableName = isNKV ? 'nkv_registrations' : 'dokter_hewan_registrations'

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

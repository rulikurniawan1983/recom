import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

export async function POST(
  request: NextRequest,
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

    const { action, notes } = await request.json()

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!notes) {
      return NextResponse.json({ error: 'Notes are required' }, { status: 400 })
    }

    // Update registration status using service role
    const serviceSupabase = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Determine registration type — try all three tables
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

    const tableName = isNKV ? 'nkv_registrations'
      : isDokterHewan ? 'dokter_hewan_registrations'
      : 'veterinary_registrations'

    const registrationType = isNKV ? 'NKV'
      : isDokterHewan ? 'Dokter Hewan'
      : 'Veterinary'

    let newStatus: string = ''

    if (action === 'approve') {
      newStatus = 'document_verification'
    } else if (action === 'reject') {
      newStatus = 'rejected'
    } else if (action === 'request_revision') {
      newStatus = 'revision_requested'
    }

    const { error: updateError } = await serviceSupabase
      .from(tableName)
      .update({
        status: newStatus,
        verification_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If NKV and approved, mark all documents as approved and set verified_at
    if (tableName === 'nkv_registrations' && action === 'approve') {
      const { error: docUpdateError } = await serviceSupabase
        .from('registration_documents')
        .update({ 
          status: 'approved',
          verified_at: new Date().toISOString() 
        })
        .eq('registration_id', id)

      if (docUpdateError) {
        console.error('Failed to update document verification status:', docUpdateError)
      }
    }

    // Add tracking log
    await serviceSupabase.from('tracking_logs').insert({
      nkv_registration_id: isNKV ? id : null,
      dokter_hewan_registration_id: isDokterHewan ? id : null,
      veterinary_registration_id: isVeterinary ? id : null,
      registration_type: registrationType,
      status: newStatus,
      notes: notes,
      created_by: user.id,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

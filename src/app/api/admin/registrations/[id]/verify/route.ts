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
  const { action, notes, status } = body

  if (!action || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (!notes) {
    return NextResponse.json({ error: 'Notes are required' }, { status: 400 })
  }

  // Update registration status
  const newStatus = action === 'approve' ? 'document_verification' : 'revision_requested'
  
  const { data: reg } = await supabase
    .from('nkv_registrations')
    .select('id')
    .eq('id', id)
    .single()

  const tableName = reg ? 'nkv_registrations' : 'dokter_hewan_registrations'

  const { error: updateError } = await supabase
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

  // Add tracking log
  await supabase.from('tracking_logs').insert({
    nkv_registration_id: tableName === 'nkv_registrations' ? id : null,
    dokter_hewan_registration_id: tableName === 'dokter_hewan_registrations' ? id : null,
    registration_type: tableName === 'nkv_registrations' ? 'NKV' : 'Dokter Hewan',
    status: newStatus,
    notes: notes,
    created_by: null, // Service role, no specific user
    created_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}

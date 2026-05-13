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
  const { scheduled_date, scheduled_time, location, notes } = body

  if (!scheduled_date || !scheduled_time || !location) {
    return NextResponse.json(
      { error: 'Tanggal, waktu, dan lokasi wajib diisi' },
      { status: 400 }
    )
  }

  // Find registration type
  const { data: nkvReg } = await supabase
    .from('nkv_registrations')
    .select('id')
    .eq('id', id)
    .single()

  const isNKV = !!nkvReg
  const registrationType = isNKV ? 'NKV' : 'Dokter Hewan'

  // Create inspection schedule
  const { error: scheduleError } = await supabase
    .from('inspection_schedules')
    .insert({
      nkv_registration_id: isNKV ? id : null,
      dokter_hewan_registration_id: isNKV ? null : id,
      inspector_id: null, // Service role, no specific inspector
      scheduled_date: scheduled_date,
      scheduled_time: scheduled_time,
      location,
      notes,
      status: 'scheduled',
      created_at: new Date().toISOString()
    })

  if (scheduleError) {
    return NextResponse.json({ error: scheduleError.message }, { status: 500 })
  }

  // Update registration status to field_inspection
  const tableName = isNKV ? 'nkv_registrations' : 'dokter_hewan_registrations'
  
  const { error: updateError } = await supabase
    .from(tableName)
    .update({
      status: 'field_inspection',
      inspection_date: `${scheduled_date}T${scheduled_time}`,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Add tracking log
  await supabase.from('tracking_logs').insert({
    nkv_registration_id: isNKV ? id : null,
    dokter_hewan_registration_id: isNKV ? null : id,
    registration_type: registrationType,
    status: 'field_inspection',
    notes: `Pemeriksaan lapangan dijadwalkan pada ${new Date(scheduled_date).toLocaleDateString('id-ID')} pukul ${scheduled_time} di ${location}`,
    created_by: null,
    created_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}

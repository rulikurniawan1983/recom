import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Generate tracking API endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  if (!code) {
    return NextResponse.json({ error: 'Kode tracking diperlukan' }, { status: 400 })
  }

  // Normalize tracking code: trim whitespace and convert to uppercase
  const normalizedCode = code.trim().toUpperCase()

  const supabase = await createClient()

  try {
    // Try to find in NKV registrations
    const { data: nkvData, error: nkvError } = await supabase
      .from('nkv_registrations')
      .select(`
        id,
        registration_number,
        status,
        created_at,
        verification_notes
      `)
      .eq('registration_number', normalizedCode)
      .single()

    if (nkvData) {
      // Fetch tracking logs for this NKV registration
      const { data: nkvLogs } = await supabase
        .from('tracking_logs')
        .select('status, created_at, notes')
        .eq('nkv_registration_id', nkvData.id)
        .order('created_at', { ascending: true })

      return NextResponse.json({
        registration_number: nkvData.registration_number,
        type: 'NKV',
        status: nkvData.status,
        created_at: nkvData.created_at,
        description: nkvData.verification_notes,
        tracking_logs: nkvLogs || []
      })
    }

    // Try to find in Dokter Hewan registrations
    const { data: dokterData, error: dokterError } = await supabase
      .from('dokter_hewan_registrations')
      .select(`
        id,
        registration_number,
        status,
        created_at,
        verification_notes
      `)
      .eq('registration_number', normalizedCode)
      .single()

    if (dokterData) {
      // Fetch tracking logs for this Dokter Hewan registration
      const { data: dokterLogs } = await supabase
        .from('tracking_logs')
        .select('status, created_at, notes')
        .eq('dokter_hewan_registration_id', dokterData.id)
        .order('created_at', { ascending: true })

      return NextResponse.json({
        registration_number: dokterData.registration_number,
        type: 'Dokter Hewan',
        status: dokterData.status,
        created_at: dokterData.created_at,
        description: dokterData.verification_notes,
        tracking_logs: dokterLogs || []
      })
    }

    return NextResponse.json({ error: 'Nomor tracking tidak ditemukan' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

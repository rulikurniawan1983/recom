import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Generate tracking API endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  if (!code) {
    return NextResponse.json({ error: 'Kode tracking diperlukan' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    // Try to find in NKV registrations
    const { data: nkvData, error: nkvError } = await supabase
      .from('nkv_registrations')
      .select(`
        registration_number,
        status,
        created_at,
        verification_notes,
        user:profiles!inner(full_name, email)
      `)
      .eq('registration_number', code)
      .single()

    if (nkvData) {
      return NextResponse.json({
        registration_number: nkvData.registration_number,
        type: 'NKV',
        status: nkvData.status,
        created_at: nkvData.created_at,
        description: nkvData.verification_notes
      })
    }

    // Try to find in Dokter Hewan registrations
    const { data: dokterData, error: dokterError } = await supabase
      .from('dokter_hewan_registrations')
      .select(`
        registration_number,
        status,
        created_at,
        verification_notes,
        full_name
      `)
      .eq('registration_number', code)
      .single()

    if (dokterData) {
      return NextResponse.json({
        registration_number: dokterData.registration_number,
        type: 'Dokter Hewan',
        status: dokterData.status,
        created_at: dokterData.created_at,
        description: dokterData.verification_notes
      })
    }

    return NextResponse.json({ error: 'Nomor tracking tidak ditemukan' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
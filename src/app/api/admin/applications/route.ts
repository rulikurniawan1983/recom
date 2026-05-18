import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const [nkvResult, dokterResult, vetResult] = await Promise.all([
      supabase
        .from('nkv_registrations')
        .select(`
          id,
          registration_number,
          status,
          created_at,
          business_name,
          business_email,
          business_phone
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('dokter_hewan_registrations')
        .select(`
          id,
          registration_number,
          status,
          created_at,
          full_name,
          email,
          phone
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('veterinary_registrations')
        .select(`
          id,
          registration_number,
          status,
          created_at,
          owner_name,
          owner_phone,
          pet_name,
          user_id
        `)
        .order('created_at', { ascending: false }),
    ])

    const nkvRegs = nkvResult.data || []
    const dokterRegs = dokterResult.data || []
    const vetRegs = vetResult.data || []

    const combined = [
      ...nkvRegs.map(reg => ({
        id: reg.id,
        registration_number: reg.registration_number,
        status: reg.status,
        created_at: reg.created_at,
        type: 'NKV',
        applicant_name: reg.business_name || 'N/A',
        email: reg.business_email || 'N/A',
        phone: reg.business_phone || 'N/A'
      })),
      ...dokterRegs.map(reg => ({
        id: reg.id,
        registration_number: reg.registration_number,
        status: reg.status,
        created_at: reg.created_at,
        type: 'Dokter Hewan',
        applicant_name: reg.full_name || 'N/A',
        email: reg.email || 'N/A',
        phone: reg.phone || 'N/A'
      })),
      ...vetRegs.map(reg => ({
        id: reg.id,
        registration_number: reg.registration_number,
        status: reg.status,
        created_at: reg.created_at,
        type: 'Veterinary',
        applicant_name: reg.owner_name || reg.pet_name || 'N/A',
        email: 'N/A',
        phone: reg.owner_phone || 'N/A'
      }))
    ]

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(combined)
  } catch (error) {
    console.error('Admin applications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

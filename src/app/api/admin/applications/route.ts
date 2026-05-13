import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

export async function GET() {
  try {
    // Get the current user from session cookies
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

    // Check if user is admin
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

    // Fetch all registrations using service role client (bypasses RLS)
    const serviceSupabase = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const [nkvResult, dokterResult] = await Promise.all([
      serviceSupabase
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
      serviceSupabase
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
        .order('created_at', { ascending: false })
    ])

    const nkvRegs = nkvResult.data || []
    const dokterRegs = dokterResult.data || []

    if (nkvResult.error) {
      console.error('NKV fetch error:', nkvResult.error)
    }
    if (dokterResult.error) {
      console.error('Dokter fetch error:', dokterResult.error)
    }

    // Transform to unified format
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
      }))
    ]

    // Sort by created_at descending
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    console.log(`Admin API: User ${user.email} fetched ${combined.length} records`)

    return NextResponse.json(combined)
  } catch (error) {
    console.error('Admin applications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase-server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
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
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Fetch veterinary registrations with related data
    const { data: veterinaryRegistrations, error } = await supabase
      .from('veterinary_registrations')
      .select(`
        *,
        pets (name, species, breed),
        profiles (full_name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching veterinary registrations:', error)
      return NextResponse.json({ error: 'Failed to fetch veterinary registrations' }, { status: 500 })
    }
    
    // Transform the data to match the AdminRegistration type
    const transformed = (veterinaryRegistrations || []).map(reg => ({
      id: reg.id,
      registration_number: reg.registration_number,
      status: reg.status,
      created_at: reg.created_at,
      type: 'Veterinary' as const,
      applicant_name: reg.profiles?.full_name || reg.pet_name || 'Unknown',
      email: reg.profiles?.email || '',
      phone: reg.owner_phone || '',
      tracking_logs: reg.tracking_logs || []
    }))
    
    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error in veterinary-registrations route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
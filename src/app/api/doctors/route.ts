import { NextResponse } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

// Create standalone doctor (no user required)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { 
    full_name, 
    email, 
    phone, 
    clinic_name, 
    clinic_address,
    license_number, 
    specialization, 
    years_of_experience, 
    biography 
  } = body

  const { data, error } = await supabase
    .from('doctors')
    .insert({
      user_id: null,
      full_name,
      email,
      phone,
      clinic_name,
      clinic_address,
      license_number,
      specialization,
      years_of_experience,
      biography
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
  
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { user_id, license_number, specialization, years_of_experience, biography } = body

  // Check if user_id already has a doctor record
  const { data: existingDoctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user_id)
    .single()

  if (existingDoctor) {
    return NextResponse.json(
      { error: 'User already has a doctor record' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('doctors')
    .insert({
      user_id,
      license_number,
      specialization,
      years_of_experience,
      biography
    })
    .select(`
      *,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
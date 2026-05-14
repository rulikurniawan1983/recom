import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles (full_name, email)
      `)
      .eq('is_active', true)
      .order('profiles.full_name', { ascending: true })

    if (error) {
      console.error('Error fetching doctors:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch doctors' },
        { status: 500 }
      )
    }

    return NextResponse.json({ doctors: doctors || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/doctors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

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

    const { data: schedules, error } = await supabase
      .from('inspection_schedules')
      .select('*')
      .order('scheduled_date', { ascending: false })

    if (error) {
      console.error('Error fetching schedules:', error.message)
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
    }

    return NextResponse.json({ schedules: schedules || [] })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error', detail: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      registration_id,
      registration_type,
      scheduled_date,
      scheduled_time,
      location,
      inspector_id,
      notes
    } = body

    const { data, error } = await supabase
      .from('inspection_schedules')
      .insert({
        registration_id,
        registration_type,
        scheduled_date,
        scheduled_time,
        location,
        inspector_id: inspector_id || user.id,
        notes,
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
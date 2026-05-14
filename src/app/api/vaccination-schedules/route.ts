import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctor_id')
    const date = searchParams.get('date')

    let query = supabase
      .from('vaccination_schedules')
      .select(`
        *,
        doctors (
          id,
          specialization,
          profiles (full_name, email)
        )
      `)
      .eq('is_active', true)

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    const { data: schedules, error } = await query.order('date', { ascending: true })

    if (error) {
      console.error('Error fetching vaccination schedules:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      )
    }

    // Filter out full schedules client-side
    const availableSchedules = (schedules || []).filter(
      schedule => (schedule.current_patients || 0) < (schedule.max_patients || 0)
    )

    return NextResponse.json({ schedules: availableSchedules })
  } catch (error) {
    console.error('Unexpected error in GET /api/vaccination-schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or doctor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: doctorRecord } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin' && !doctorRecord) {
      return NextResponse.json(
        { error: 'Only admins and doctors can create schedules' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      doctor_id,
      date,
      start_time,
      end_time,
      max_patients,
      location,
      notes
    } = body

    if (!doctor_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Doctor ID, date, start_time, and end_time are required' },
        { status: 400 }
      )
    }

    // If user is doctor, ensure they only create schedules for themselves
    let finalDoctorId = doctor_id
    if (doctorRecord && profile?.role !== 'admin') {
      finalDoctorId = doctorRecord.id
    }

    const { data: schedule, error } = await supabase
      .from('vaccination_schedules')
      .insert({
        doctor_id: finalDoctorId,
        date,
        start_time,
        end_time,
        max_patients: max_patients || 20,
        location: location || null,
        notes: notes || null
      })
      .select(`
        *,
        doctors (
          id,
          specialization,
          profiles (full_name, email)
        )
      `)
      .single()

    if (error) {
      console.error('Error creating schedule:', error.message)
      return NextResponse.json(
        { error: 'Failed to create schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/vaccination-schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

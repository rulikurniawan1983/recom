import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctor_id')
    const date = searchParams.get('date')
    const consultationType = searchParams.get('type') // 'online' or 'offline'

    let query = supabase
      .from('consultation_schedules')
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

    if (consultationType) {
      query = query.or(`consultation_type=${consultationType},consultation_type=both`)
    }

    const { data: schedules, error } = await query.order('date', { ascending: true })

    if (error) {
      console.error('Error fetching consultation schedules:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      )
    }

    const availableSchedules = (schedules || []).filter(
      schedule => (schedule.current_patients || 0) < (schedule.max_patients || 0)
    )

    return NextResponse.json({ schedules: availableSchedules })
  } catch (error) {
    console.error('Unexpected error in GET /api/consultation-schedules:', error)
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin' && !doctor) {
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
      consultation_type,
      meeting_link,
      location,
      notes
    } = body

    if (!doctor_id || !date || !start_time || !end_time || !consultation_type) {
      return NextResponse.json(
        { error: 'Doctor ID, date, start_time, end_time, and consultation_type are required' },
        { status: 400 }
      )
    }

    let finalDoctorId = doctor_id
    if (doctor && profile?.role !== 'admin') {
      finalDoctorId = doctor.id
    }

    const { data: schedule, error } = await supabase
      .from('consultation_schedules')
      .insert({
        doctor_id: finalDoctorId,
        date,
        start_time,
        end_time,
        max_patients: max_patients || 15,
        consultation_type,
        meeting_link: meeting_link || null,
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
    console.error('Unexpected error in POST /api/consultation-schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

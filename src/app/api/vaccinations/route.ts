import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: vaccinations, error } = await supabase
      .from('vaccinations')
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          profiles (full_name, email)
        )
      `)
      .order('created_at', { ascending: false })

    // Filter based on user role
    let filteredVaccinations = vaccinations || []

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (doctor) {
        // Doctor - show only assigned vaccinations
        filteredVaccinations = filteredVaccinations.filter(
          v => v.doctor_id === doctor.id
        )
      } else {
        // Regular user - show only own vaccinations
        filteredVaccinations = filteredVaccinations.filter(
          v => v.user_id === user.id
        )
      }
    }

    if (error) {
      console.error('Error fetching vaccinations:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch vaccinations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ vaccinations: filteredVaccinations })
  } catch (error) {
    console.error('Unexpected error in GET /api/vaccinations:', error)
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

    const body = await request.json()
    const {
      pet_id,
      doctor_id,
      schedule_id,
      vaccination_date,
      notes
    } = body

    if (!pet_id || !vaccination_date) {
      return NextResponse.json(
        { error: 'Pet ID and vaccination date are required' },
        { status: 400 }
      )
    }

    // Verify pet ownership
    const { data: pet } = await supabase
      .from('pets')
      .select('user_id, name')
      .eq('id', pet_id)
      .single()

    if (!pet || pet.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Pet not found or unauthorized' },
        { status: 404 }
      )
    }

    // If schedule_id provided, verify availability
    let _doctor_id = doctor_id
    if (schedule_id) {
      const { data: schedule, error: scheduleError } = await supabase
        .from('vaccination_schedules')
        .select('*')
        .eq('id', schedule_id)
        .single()

      if (scheduleError || !schedule) {
        return NextResponse.json(
          { error: 'Invalid schedule' },
          { status: 400 }
        )
      }

      if (schedule.current_patients >= schedule.max_patients) {
        return NextResponse.json(
          { error: 'Schedule is full' },
          { status: 400 }
        )
      }

      if (schedule.date !== vaccination_date) {
        return NextResponse.json(
          { error: 'Schedule date does not match vaccination date' },
          { status: 400 }
        )
      }

      _doctor_id = schedule.doctor_id
    }

    if (!_doctor_id) {
      return NextResponse.json(
        { error: 'Doctor ID or schedule ID is required' },
        { status: 400 }
      )
    }

    // Create vaccination booking
    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .insert({
        pet_id,
        user_id: user.id,
        doctor_id: _doctor_id,
        schedule_id: schedule_id || null,
        vaccination_date,
        notes: notes || null,
        status: 'pending'
      })
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          profiles (full_name, email)
        ),
        vaccination_schedules (
          date,
          start_time,
          location
        )
      `)
      .single()

    if (error) {
      console.error('Error creating vaccination:', error.message)
      return NextResponse.json(
        { error: 'Failed to create vaccination booking' },
        { status: 500 }
      )
    }

    // Create notification for admin and doctor
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (admins) {
      for (const admin of admins) {
        await supabase.from('notifications').insert({
          user_id: admin.id,
          type: 'booking_confirmed',
          title: 'Booking Vaksinasi Baru',
          message: `Booking vaksinasi untuk hewan ${pet.name} pada ${vaccination_date}`,
          data: { vaccination_id: vaccination.id }
        })
      }
    }

    // Notify doctor
    if (_doctor_id) {
      const { data: doctorProfile } = await supabase
        .from('doctors')
        .select('user_id')
        .eq('id', _doctor_id)
        .single()

      if (doctorProfile) {
        await supabase.from('notifications').insert({
          user_id: doctorProfile.user_id,
          type: 'booking_confirmed',
          title: 'Booking Vaksinasi Baru',
          message: `Ada booking vaksinasi untuk hewan ${pet.name} pada ${vaccination_date}`,
          data: { vaccination_id: vaccination.id }
        })
      }
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'booking_confirmed',
      title: 'Booking Vaksinasi Berhasil',
      message: `Booking vaksinasi untuk ${pet.name} telah dibuat. Silakan tunggu konfirmasi dari klinik.`,
      data: { vaccination_id: vaccination.id }
    })

    return NextResponse.json({ vaccination }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/vaccinations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

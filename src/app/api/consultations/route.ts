import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: consultations, error } = await supabase
      .from('consultations')
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          specialization,
          profiles (full_name, email)
        )
      `)
      .order('created_at', { ascending: false })

    let filteredConsultations = consultations || []

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
        filteredConsultations = filteredConsultations.filter(
          c => c.doctor_id === doctor.id
        )
      } else {
        filteredConsultations = filteredConsultations.filter(
          c => c.user_id === user.id
        )
      }
    }

    if (error) {
      console.error('Error fetching consultations:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch consultations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ consultations: filteredConsultations })
  } catch (error) {
    console.error('Unexpected error in GET /api/consultations:', error)
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
      consultation_type,
      scheduled_date,
      scheduled_time,
      meeting_link,
      location,
      documents_urls,
      symptoms
    } = body

    if (!pet_id || !doctor_id || !consultation_type || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: 'Pet ID, doctor ID, consultation type, date, and time are required' },
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
    if (schedule_id) {
      const { data: schedule, error: scheduleError } = await supabase
        .from('consultation_schedules')
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

      // Validate consultation type matches schedule
      if (schedule.consultation_type !== 'both' && schedule.consultation_type !== consultation_type) {
        return NextResponse.json(
          { error: `Schedule does not support ${consultation_type} consultations` },
          { status: 400 }
        )
      }
    }

    // Create consultation booking
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        pet_id,
        user_id: user.id,
        doctor_id,
        schedule_id: schedule_id || null,
        consultation_type,
        scheduled_date,
        scheduled_time,
        meeting_link: meeting_link || null,
        location: location || null,
        documents_urls: documents_urls || [],
        symptoms: symptoms || null,
        status: 'pending'
      })
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          specialization,
          profiles (full_name, email)
        )
      `)
      .single()

    if (error) {
      console.error('Error creating consultation:', error.message)
      return NextResponse.json(
        { error: 'Failed to create consultation booking' },
        { status: 500 }
      )
    }

    // Notify admin and doctor
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (admins) {
      for (const admin of admins) {
        await supabase.from('notifications').insert({
          user_id: admin.id,
          type: 'booking_confirmed',
          title: 'Booking Konsultasi Baru',
          message: `Booking konsultasi untuk hewan ${pet.name} pada ${scheduled_date}`,
          data: { consultation_id: consultation.id }
        })
      }
    }

    const { data: doctorProfile } = await supabase
      .from('doctors')
      .select('user_id')
      .eq('id', doctor_id)
      .single()

    if (doctorProfile) {
      await supabase.from('notifications').insert({
        user_id: doctorProfile.user_id,
        type: 'booking_confirmed',
        title: 'Booking Konsultasi Baru',
        message: `Ada booking konsultasi untuk hewan ${pet.name}`,
        data: { consultation_id: consultation.id }
      })
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'booking_confirmed',
      title: 'Booking Konsultasi Berhasil',
      message: `Booking konsultasi untuk ${pet.name} telah dibuat.`,
      data: { consultation_id: consultation.id }
    })

    return NextResponse.json({ consultation }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/consultations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

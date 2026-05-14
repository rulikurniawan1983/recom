import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: treatments, error } = await supabase
      .from('treatments')
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          profiles (full_name, email, full_name)
        )
      `)
      .order('created_at', { ascending: false })

    let filteredTreatments = treatments || []

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
        filteredTreatments = filteredTreatments.filter(
          t => t.doctor_id === doctor.id
        )
      } else {
        filteredTreatments = filteredTreatments.filter(
          t => t.user_id === user.id
        )
      }
    }

    if (error) {
      console.error('Error fetching treatments:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch treatments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ treatments: filteredTreatments })
  } catch (error) {
    console.error('Unexpected error in GET /api/treatments:', error)
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
      symptoms,
      medical_history,
      photos_urls,
      videos_urls
    } = body

    if (!pet_id || !doctor_id || !symptoms) {
      return NextResponse.json(
        { error: 'Pet ID, doctor ID, and symptoms are required' },
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
        .from('treatment_schedules')
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
    }

    // Create treatment booking
    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert({
        pet_id,
        user_id: user.id,
        doctor_id,
        schedule_id: schedule_id || null,
        symptoms,
        medical_history: medical_history || null,
        photos_urls: photos_urls || [],
        videos_urls: videos_urls || [],
        status: 'pending',
        payment_status: 'unpaid'
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
      console.error('Error creating treatment:', error.message)
      return NextResponse.json(
        { error: 'Failed to create treatment booking' },
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
          title: 'Booking Pengobatan Baru',
          message: `Booking pengobatan untuk hewan ${pet.name}`,
          data: { treatment_id: treatment.id }
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
        title: 'Booking Pengobatan Baru',
        message: `Ada booking pengobatan untuk hewan ${pet.name}`,
        data: { treatment_id: treatment.id }
      })
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'booking_confirmed',
      title: 'Booking Pengobatan Berhasil',
      message: `Booking pengobatan untuk ${pet.name} telah dibuat. Silakan tunggu konfirmasi dari dokter.`,
      data: { treatment_id: treatment.id }
    })

    return NextResponse.json({ treatment }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/treatments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    let query = supabase
      .from('medical_records')
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          profiles (full_name, email)
        )
      `)

    if (profile?.role === 'admin') {
      // Admins can see all records
    } else {
      // Check if user is a doctor
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (doctor) {
        // Doctors can see records for their patients
        query = query.or(
          `doctor_id=${doctor.id},pet_id IN (SELECT pet_id FROM vaccinations WHERE doctor_id=${doctor.id}),pet_id IN (SELECT pet_id FROM treatments WHERE doctor_id=${doctor.id}),pet_id IN (SELECT pet_id FROM consultations WHERE doctor_id=${doctor.id})`
        )
      } else {
        // Regular users can only see their pets' records
        query = query.eq('user_id', user.id)
      }
    }

    const { data: records, error } = await query.order('date', { ascending: false })

    if (error) {
      console.error('Error fetching medical records:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch medical records' },
        { status: 500 }
      )
    }

    return NextResponse.json({ records: records || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/medical-records:', error)
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

    // Only doctors and admins can create medical records
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
        { error: 'Only doctors and admins can create medical records' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      pet_id,
      record_type,
      reference_id,
      doctor_id,
      date,
      findings,
      diagnosis,
      prescription,
      recommendations,
      attachments,
      notes
    } = body

    if (!pet_id || !record_type || !date) {
      return NextResponse.json(
        { error: 'Pet ID, record type, and date are required' },
        { status: 400 }
      )
    }

    // Verify pet exists and user has access
    const { data: pet } = await supabase
      .from('pets')
      .select('user_id')
      .eq('id', pet_id)
      .single()

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // If doctor is creating, use their own doctor_id
    let finalDoctorId = doctor_id
    if (doctor && !doctor_id) {
      finalDoctorId = doctor.id
    }

    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        pet_id,
        record_type,
        reference_id: reference_id || null,
        doctor_id: finalDoctorId || null,
        date,
        findings: findings || null,
        diagnosis: diagnosis || null,
        prescription: prescription || null,
        recommendations: recommendations || null,
        attachments: attachments || [],
        notes: notes || null
      })
      .select(`
        *,
        pets (name, species, breed),
        doctors (
          id,
          profiles (full_name)
        )
      `)
      .single()

    if (error) {
      console.error('Error creating medical record:', error.message)
      return NextResponse.json(
        { error: 'Failed to create medical record' },
        { status: 500 }
      )
    }

    // Notify pet owner
    await supabase.from('notifications').insert({
      user_id: pet.user_id,
      type: 'status_update',
      title: 'Riwayat Medis Diperbarui',
      message: `Riwayat medis untuk hewan peliharaan Anda telah diperbarui pada ${date}`,
      data: { record_id: record.id }
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/medical-records:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

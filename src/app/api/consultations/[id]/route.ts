import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        pets (id, name, species, breed, age_years, age_months, gender)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
      }
      console.error('Error fetching consultation:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch consultation' },
        { status: 500 }
      )
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = data?.user_id === user.id
    const isDoctor = data?.doctor_id && (
      await supabase
        .from('doctors')
        .select('id')
        .eq('id', data?.doctor_id)
        .eq('user_id', user.id)
        .single()
    )

    if (profile?.role !== 'admin' && !isOwner && !isDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized to view this consultation' },
        { status: 403 }
      )
    }

    return NextResponse.json({ consultation: data })
  } catch (error) {
    console.error('Unexpected error in GET /api/consultations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      doctor_id,
      status,
      diagnosis,
      prescription,
      consultation_notes,
      meeting_link,
      rating,
      review
    } = body

    // Get existing consultation
    const { id } = await params
    const { data: existing, error: fetchError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = existing.user_id === user.id
    const isAssignedDoctor = existing.doctor_id && (
      await supabase
        .from('doctors')
        .select('id')
        .eq('id', existing.doctor_id)
        .eq('user_id', user.id)
        .single()
    )

    // Build update object based on permissions
    const updateData: any = {}

    if (profile?.role === 'admin') {
      // Admins can update everything
      if (status !== undefined) updateData.status = status
      if (doctor_id !== undefined) updateData.doctor_id = doctor_id
      if (diagnosis !== undefined) updateData.diagnosis = diagnosis
      if (prescription !== undefined) updateData.prescription = prescription
      if (consultation_notes !== undefined) updateData.consultation_notes = consultation_notes
      if (meeting_link !== undefined) updateData.meeting_link = meeting_link
    } else if (isAssignedDoctor) {
      // Doctors can update status, diagnosis, prescription, notes
      if (status !== undefined) updateData.status = status
      if (diagnosis !== undefined) updateData.diagnosis = diagnosis
      if (prescription !== undefined) updateData.prescription = prescription
      if (consultation_notes !== undefined) updateData.consultation_notes = consultation_notes
      if (meeting_link !== undefined) updateData.meeting_link = meeting_link
    } else if (isOwner) {
      // User can only rate and review after completion
      if (existing.status === 'completed') {
        if (rating !== undefined) updateData.rating = rating
        if (review !== undefined) updateData.review = review
        updateData.is_rated = true
      } else {
        return NextResponse.json(
          { error: 'Can only rate after consultation is completed' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unauthorized to update this consultation' },
        { status: 403 }
      )
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: consultation, error: updateError } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating consultation:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to update consultation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ consultation })
  } catch (error) {
    console.error('Unexpected error in PUT /api/consultations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

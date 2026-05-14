import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .select(`
        *,
        pets (id, name, species, breed, age_years, age_months, gender),
        doctors (id, specialization, profiles (full_name, email)),
        vaccination_schedules (date, start_time, end_time, location, notes)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vaccination not found' }, { status: 404 })
      }
      console.error('Error fetching vaccination:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch vaccination' },
        { status: 500 }
      )
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = vaccination.user_id === user.id
    const isDoctor = vaccination.doctor_id && (
      await supabase
        .from('doctors')
        .select('id')
        .eq('id', vaccination.doctor_id)
        .eq('user_id', user.id)
        .single()
    )

    if (profile?.role !== 'admin' && !isOwner && !isDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized to view this vaccination' },
        { status: 403 }
      )
    }

    return NextResponse.json({ vaccination })
  } catch (error) {
    console.error('Unexpected error in GET /api/vaccinations/[id]:', error)
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
      status,
      doctor_id,
      vaccination_date,
      batch_number,
      notes,
      admin_notes,
      qr_code,
      ticket_id
    } = body

    // Get existing vaccination
    const { id } = await params
    const { data: existing, error: fetchError } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Vaccination not found' }, { status: 404 })
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

    // Only admins and assigned doctors can update status
    if (profile?.role !== 'admin' && !isAssignedDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized to update this vaccination' },
        { status: 403 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (profile?.role === 'admin') {
      if (status !== undefined) updateData.status = status
      if (doctor_id !== undefined) updateData.doctor_id = doctor_id
      if (vaccination_date !== undefined) updateData.vaccination_date = vaccination_date
      if (batch_number !== undefined) updateData.batch_number = batch_number
      if (notes !== undefined) updateData.notes = notes
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes
      if (qr_code !== undefined) updateData.qr_code = qr_code
      if (ticket_id !== undefined) updateData.ticket_id = ticket_id
    } else {
      // Doctor can only update status and add notes
      if (status !== undefined) updateData.status = status
      if (notes !== undefined) updateData.notes = notes
    }

    const { data: vaccination, error: updateError } = await supabase
      .from('vaccinations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating vaccination:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to update vaccination' },
        { status: 500 }
      )
    }

    return NextResponse.json({ vaccination })
  } catch (error) {
    console.error('Unexpected error in PUT /api/vaccinations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

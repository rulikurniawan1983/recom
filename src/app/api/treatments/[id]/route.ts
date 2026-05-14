import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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
      diagnosis,
      prescription,
      treatment_notes,
      follow_up_date
    } = body

    // Get existing treatment
    const { id } = await params
    const { data: existing, error: fetchError } = await supabase
      .from('treatments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }

    // Check permissions: admin or assigned doctor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAssignedDoctor = existing.doctor_id && (
      await supabase
        .from('doctors')
        .select('id')
        .eq('id', existing.doctor_id)
        .eq('user_id', user.id)
        .single()
    )

    if (profile?.role !== 'admin' && !isAssignedDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized to update this treatment' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis
    if (prescription !== undefined) updateData.prescription = prescription
    if (treatment_notes !== undefined) updateData.treatment_notes = treatment_notes
    if (follow_up_date !== undefined) updateData.follow_up_date = follow_up_date

    const { data: treatment, error: updateError } = await supabase
      .from('treatments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating treatment:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to update treatment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ treatment })
  } catch (error) {
    console.error('Unexpected error in PUT /api/treatments/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

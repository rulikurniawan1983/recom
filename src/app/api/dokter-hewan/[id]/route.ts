import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the current user to verify ownership
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the registration belongs to the user
    const { data: registration, error: fetchError } = await supabase
      .from('dokter_hewan_registrations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the registration
    const { error: deleteError } = await supabase
      .from('dokter_hewan_registrations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Dokter Hewan registration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: PUT endpoint for updating Dokter Hewan registration (for edit functionality)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the current user to verify ownership
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the registration belongs to the user
    const { data: registration, error: fetchError } = await supabase
      .from('dokter_hewan_registrations')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only allow editing if in draft or submitted status
    if (!['draft', 'submitted'].includes(registration.status)) {
      return NextResponse.json(
        { error: 'Cannot edit registration in current status' },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    // Remove fields that shouldn't be updated via this endpoint
    const allowedUpdates = [
      'full_name',
      'phone',
      'email',
      'clinic_address',
      'nib_number',
      'strv_number',
      // Note: document updates would be handled separately
    ]

    const filteredUpdates: Record<string, any> = {}
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    filteredUpdates.updated_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('dokter_hewan_registrations')
      .update(filteredUpdates)
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating Dokter Hewan registration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
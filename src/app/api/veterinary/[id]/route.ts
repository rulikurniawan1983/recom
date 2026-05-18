import { createClient } from '@/lib/supabase-server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Allow owner or admin
    const isAdmin = profile?.role === 'admin'

    const { data: reg, error } = await supabase
      .from('veterinary_registrations')
      .select(`
        *,
        profiles (full_name, email)
      `)
      .eq('id', id)
      .single()

    if (error || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (!isAdmin && reg.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch related documents
    const { data: documents } = await supabase
      .from('registration_documents')
      .select('*')
      .eq('registration_id', id)
      .eq('registration_type', 'veterinary')
      .order('uploaded_at', { ascending: true })

    return NextResponse.json({
      ...reg,
      regType: 'Veterinary',
      registration_documents: documents || [],
    })
  } catch (error) {
    console.error('GET /api/veterinary/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owner can update, and only in draft/submitted status
    const { data: reg, error: fetchError } = await supabase
      .from('veterinary_registrations')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (reg.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!['draft', 'submitted'].includes(reg.status)) {
      return NextResponse.json(
        { error: 'Cannot edit registration in current status' },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    const allowedUpdates = [
      'pet_name', 'pet_type', 'pet_breed', 'pet_age', 'pet_gender',
      'owner_name', 'owner_phone', 'owner_address',
    ]

    const filteredUpdates: Record<string, any> = {}
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    filteredUpdates.updated_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('veterinary_registrations')
      .update(filteredUpdates)
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/veterinary/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership
    const { data: reg, error: fetchError } = await supabase
      .from('veterinary_registrations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (reg.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete associated document records
    await supabase
      .from('registration_documents')
      .delete()
      .eq('registration_id', id)
      .eq('registration_type', 'veterinary')

    // The registration itself — ON DELETE CASCADE will clean up tracking_logs and inspection_schedules
    const { error: deleteError } = await supabase
      .from('veterinary_registrations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/veterinary/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

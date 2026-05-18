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

    // Check admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { license_number, specialization, years_of_experience, biography, is_active } = body
    const { id } = await params

    const updateData: any = {}
    if (license_number !== undefined) updateData.license_number = license_number
    if (specialization !== undefined) updateData.specialization = specialization
    if (years_of_experience !== undefined) updateData.years_of_experience = years_of_experience
    if (biography !== undefined) updateData.biography = biography
    if (is_active !== undefined) updateData.is_active = Boolean(is_active)

    const { error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating doctor:', error.message)
      return NextResponse.json(
        { error: 'Failed to update doctor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Doctor updated successfully' })
  } catch (error) {
    console.error('Unexpected error in PUT /api/doctors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

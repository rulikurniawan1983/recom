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

    const { data: pet, error } = await supabase
      .from('pets')
      .select(`
        *,
        vaccinations (id, vaccination_date, status, vaccine_type, qr_code, ticket_id),
        treatments (id, scheduled_date, status, diagnosis),
        consultations (id, scheduled_date, status, consultation_type)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
      }
      console.error('Error fetching pet:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch pet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pet })
  } catch (error) {
    console.error('Unexpected error in GET /api/pets/[id]:', error)
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
      name,
      species,
      breed,
      age_years,
      age_months,
      gender,
      weight_kg,
      color,
      distinctive_features,
      health_history,
      vaccination_history,
      is_active
    } = body

    // Verify ownership
    const { id } = await params
    const { data: existingPet } = await supabase
      .from('pets')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found or unauthorized' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (species !== undefined) updateData.species = species
    if (breed !== undefined) updateData.breed = breed
    if (age_years !== undefined) updateData.age_years = age_years
    if (age_months !== undefined) updateData.age_months = age_months
    if (gender !== undefined) updateData.gender = gender
    if (weight_kg !== undefined) updateData.weight_kg = weight_kg
    if (color !== undefined) updateData.color = color
    if (distinctive_features !== undefined) updateData.distinctive_features = distinctive_features
    if (health_history !== undefined) updateData.health_history = health_history
    if (vaccination_history !== undefined) updateData.vaccination_history = vaccination_history
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: pet, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pet:', error.message)
      return NextResponse.json(
        { error: 'Failed to update pet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pet })
  } catch (error) {
    console.error('Unexpected error in PUT /api/pets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { id } = await params
    const { data: existingPet } = await supabase
      .from('pets')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found or unauthorized' }, { status: 404 })
    }

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('pets')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting pet:', error.message)
      return NextResponse.json(
        { error: 'Failed to delete pet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Pet deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/pets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

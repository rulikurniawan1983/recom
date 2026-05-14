import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: pets, error } = await supabase
      .from('pets')
      .select(`
        *,
        vaccinations (
          id,
          vaccination_date,
          status,
          vaccine_type,
          qr_code,
          ticket_id
        ),
        treatments (
          id,
          scheduled_date,
          status,
          diagnosis
        ),
        consultations (
          id,
          scheduled_date,
          status,
          consultation_type
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pets:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch pets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pets: pets || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/pets:', error)
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
      vaccination_history
    } = body

    if (!name || !species || !gender) {
      return NextResponse.json(
        { error: 'Name, species, and gender are required' },
        { status: 400 }
      )
    }

    const { data: pet, error } = await supabase
      .from('pets')
      .insert({
        user_id: user.id,
        name,
        species,
        breed: breed || null,
        age_years: age_years || 0,
        age_months: age_months || 0,
        gender,
        weight_kg: weight_kg || null,
        color: color || null,
        distinctive_features: distinctive_features || null,
        health_history: health_history || null,
        vaccination_history: vaccination_history || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pet:', error.message)
      return NextResponse.json(
        { error: 'Failed to create pet' },
        { status: 500 }
      )
    }

    // Create notification for successful pet registration
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Hewan Peliharaan Terdaftar',
      message: `Hewan peliharaan ${name} telah berhasil didaftarkan.`,
      data: { pet_id: pet.id }
    })

    return NextResponse.json({ pet }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/pets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('pet_id')

    let query = supabase
      .from('pet_documents')
      .select(`
        *,
        pets (name, species, breed)
      `)
      .order('uploaded_at', { ascending: false })

    if (petId) {
      query = query.eq('pet_id', petId)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Filter by user's own pets
      const { data: userPets } = await supabase
        .from('pets')
        .select('id')
        .eq('user_id', user.id)

      if (userPets && userPets.length > 0) {
        const petIds = userPets.map(p => p.id)
        query = query.in('pet_id', petIds)
      } else {
        // User has no pets, return empty
        return NextResponse.json({ documents: [] })
      }
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Error fetching pet documents:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ documents: documents || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/pet-documents:', error)
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
      file_name,
      file_url,
      file_type,
      document_type,
      description
    } = body

    if (!pet_id || !file_name || !file_url) {
      return NextResponse.json(
        { error: 'Pet ID, file name, and URL are required' },
        { status: 400 }
      )
    }

    // Verify pet ownership
    const { data: pet } = await supabase
      .from('pets')
      .select('user_id')
      .eq('id', pet_id)
      .single()

    if (!pet || pet.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Pet not found or unauthorized' },
        { status: 404 }
      )
    }

    const { data: document, error } = await supabase
      .from('pet_documents')
      .insert({
        pet_id,
        user_id: user.id,
        file_name,
        file_url,
        file_type: file_type || null,
        document_type: document_type || null,
        description: description || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error uploading document:', error.message)
      return NextResponse.json(
        { error: 'Failed to upload document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/pet-documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

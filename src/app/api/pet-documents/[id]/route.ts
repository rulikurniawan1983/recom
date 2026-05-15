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

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('pet_id')

    const { id } = await params

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
      const { data: userPets } = await supabase
        .from('pets')
        .select('id')
        .eq('user_id', user.id)

      if (userPets && userPets.length > 0) {
        const petIds = userPets.map(p => p.id)
        query = query.in('pet_id', petIds)
      } else {
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: petId } = await params

    // Verify pet ownership
    const { data: pet } = await supabase
      .from('pets')
      .select('user_id')
      .eq('id', petId)
      .single()

    if (!pet || pet.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Pet not found or unauthorized' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      file_name,
      file_url,
      file_type,
      document_type,
      description
    } = body

    if (!file_name || !file_url) {
      return NextResponse.json(
        { error: 'File name and URL are required' },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from('pet_documents')
      .insert({
        pet_id: petId,
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

    // Notify user of successful upload
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Dokumen Terunggah',
      message: `Dokumen "${file_name}" berhasil diunggah untuk hewan peliharaan.`,
      data: { document_id: document.id }
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/pet-documents:', error)
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

    // Verify document ownership
    const { id } = await params
    const { data: document } = await supabase
      .from('pet_documents')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!document || document.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Document not found or unauthorized' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('pet_documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error.message)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/pet-documents/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
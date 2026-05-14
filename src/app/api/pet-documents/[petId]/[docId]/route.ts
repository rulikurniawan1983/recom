import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ petId: string; docId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { petId, docId } = await params

    // Verify pet ownership or admin/doctor access
    const { data: pet } = await supabase
      .from('pets')
      .select('user_id')
      .eq('id', petId)
      .single()

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = pet.user_id === user.id
    const isDoctor = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin' && !isOwner && !isDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized to view these documents' },
        { status: 403 }
      )
    }

    const { data: documents, error } = await supabase
      .from('pet_documents')
      .select('*')
      .eq('pet_id', petId)
      .order('uploaded_at', { ascending: false })

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
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { petId } = await params

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
  { params }: { params: Promise<{ petId: string; docId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { petId, docId } = await params

    // Verify document ownership
    const { data: document } = await supabase
      .from('pet_documents')
      .select('user_id')
      .eq('id', docId)
      .eq('pet_id', petId)
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
      .eq('id', docId)

    if (error) {
      console.error('Error deleting document:', error.message)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/pet-documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

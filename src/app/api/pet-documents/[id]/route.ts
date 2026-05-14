import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params

    // Verify admin auth
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { status: newStatus, notes } = await request.json()

    if (!newStatus || !['pending', 'approved', 'rejected', 'revision_requested'].includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Use service role to update document
    const serviceSupabase = createServiceClient(supabaseUrl, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const updateData: { status: string; admin_notes?: string; verified_at?: string } = {
      status: newStatus
    }

    if (notes) {
      updateData.admin_notes = notes
    }

    // Set verified_at timestamp if approved
    if (newStatus === 'approved') {
      updateData.verified_at = new Date().toISOString()
    }

    const { error: updateError } = await serviceSupabase
      .from('registration_documents')
      .update(updateData)
      .eq('id', docId)
      .eq('registration_id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

// If all documents approved, move to document_verification
     if (newStatus === 'approved') {
       const { data: docs } = await serviceSupabase
         .from('registration_documents')
         .select('status')
         .eq('registration_id', id)

       const allApproved = docs && docs.every(doc => doc.status === 'approved')

       if (allApproved) {
         // Determine registration type
         const { data: nkvCheck } = await serviceSupabase
           .from('nkv_registrations')
           .select('id')
           .eq('id', id)
           .single()

         const isNKV = !!nkvCheck
         const tableName = isNKV ? 'nkv_registrations' : 'dokter_hewan_registrations'

         await serviceSupabase
           .from(tableName)
           .update({ status: 'document_verification' })
           .eq('id', id)

         // Add tracking log
         await serviceSupabase.from('tracking_logs').insert({
           nkv_registration_id: isNKV ? id : null,
           dokter_hewan_registration_id: isNKV ? null : id,
           registration_type: isNKV ? 'NKV' : 'Dokter Hewan',
           status: 'document_verification',
           notes: 'Semua dokumen telah diverifikasi dan disetujui',
           created_by: user.id,
           created_at: new Date().toISOString()
         })
       }
     }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update document status error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
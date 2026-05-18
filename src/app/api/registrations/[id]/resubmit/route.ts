import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if registration belongs to user — try all three tables
    const { data: nkvReg } = await supabase
      .from('nkv_registrations')
      .select('id, user_id, status, registration_number')
      .eq('id', id)
      .single()

    let tableName: string | null = null
    let regNumber: string | null = null

    if (nkvReg && nkvReg.user_id === user.id) {
      tableName = 'nkv_registrations'
      regNumber = nkvReg.registration_number
    } else {
      const { data: dhReg } = await supabase
        .from('dokter_hewan_registrations')
        .select('id, user_id, status, registration_number')
        .eq('id', id)
        .single()

      if (dhReg && dhReg.user_id === user.id) {
        tableName = 'dokter_hewan_registrations'
        regNumber = dhReg.registration_number
      } else {
        const { data: vetReg } = await supabase
          .from('veterinary_registrations')
          .select('id, user_id, status, registration_number')
          .eq('id', id)
          .single()

        if (vetReg && vetReg.user_id === user.id) {
          tableName = 'veterinary_registrations'
          regNumber = vetReg.registration_number
        }
      }
    }

    if (!tableName || !regNumber) {
      return NextResponse.json(
        { error: 'Registrasi tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      )
    }

    // Only allow resubmit if status is revision_requested
    const { data: currentReg } = await supabase
      .from(tableName)
      .select('status')
      .eq('id', id)
      .single()

    if (!currentReg || currentReg.status !== 'revision_requested') {
      return NextResponse.json(
        { error: 'Registrasi harus dalam status revisi untuk diajukan kembali' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { documentUrls = [] } = body as { documentUrls: Array<{ file_name: string; file_url: string; document_type: string }> }

    // Update status back to submitted and clear revision notes
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: 'submitted',
        verification_notes: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create new document records for uploaded revision files
    if (documentUrls.length > 0) {
      const docRecords = documentUrls.map((doc: { file_name: string; file_url: string; document_type: string }) => ({
        registration_id: id,
        registration_type: tableName === 'nkv_registrations' ? 'nkv' : tableName === 'dokter_hewan_registrations' ? 'dokter_hewan' : 'veterinary',
        document_type: doc.document_type,
        file_url: doc.file_url,
        file_name: doc.file_name,
        status: 'pending' as const,
        uploaded_at: new Date().toISOString(),
        admin_notes: null,
        verified_at: null,
      }))

      const { error: docError } = await supabase
        .from('registration_documents')
        .insert(docRecords)

      if (docError) {
        console.error('Failed to save revision document records:', docError)
      }
    }

    // Add tracking log
    const isNKV = tableName === 'nkv_registrations'
    const isDH = tableName === 'dokter_hewan_registrations'
    await supabase.from('tracking_logs').insert({
      nkv_registration_id: isNKV ? id : null,
      dokter_hewan_registration_id: isDH ? id : null,
      veterinary_registration_id: !isNKV && !isDH ? id : null,
      registration_type: isNKV ? 'NKV' : isDH ? 'Dokter Hewan' : 'Veterinary',
      status: 'submitted',
      notes: `Pemohon mengajukan ulang setelah revisi diminta oleh admin`,
      created_by: user.id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Permohonan berhasil diajukan kembali',
      registration_number: regNumber,
    })
  } catch (error) {
    console.error('Resubmit error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengajukan ulang' },
      { status: 500 }
    )
  }
}

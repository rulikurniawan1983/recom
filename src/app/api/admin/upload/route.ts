import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY is required')
}

const supabase = createClient(supabaseUrl, serviceKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const registrationId = formData.get('registrationId') as string

    if (!file || !registrationId) {
      return NextResponse.json(
        { error: 'File dan registrationId wajib diisi' },
        { status: 400 }
      )
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Hanya file PDF yang diizinkan' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    // Convert File to Blob
    const blob = new Blob([file], { type: file.type })
    const fileName = `recommendations/${registrationId}/${Date.now()}-${file.name}`

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('registration-documents')
      .upload(fileName, blob, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Gagal mengupload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('registration-documents')
      .getPublicUrl(uploadData.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: uploadData.path
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

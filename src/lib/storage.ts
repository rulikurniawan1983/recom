'use client'

import { supabase } from './supabase'

export const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE
}

export const uploadDocument = async (
  file: File,
  userId: string,
  registrationId?: string
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${registrationId || 'temp'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('registration-documents')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('registration-documents')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export const uploadRegistrationDocument = async (
  file: File,
  registrationId: string,
  documentType: string
): Promise<string | null> => {
  if (!file) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `registrations/${registrationId}/${documentType}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('registration-documents')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false // Set to true if you want to replace existing files
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('registration-documents')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
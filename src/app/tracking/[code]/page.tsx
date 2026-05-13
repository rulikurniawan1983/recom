import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TrackingClient from './tracking-client'

export default async function TrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const normalizedCode = code.trim().toUpperCase()
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Try NKV first
  let { data: registration } = await supabase
    .from('nkv_registrations')
    .select(`
      id,
      registration_number,
      status,
      created_at,
      verification_notes,
      recommendation_file_url,
      user_id
    `)
    .eq('registration_number', normalizedCode)
    .single()

  // If not found or not owned by user (and not admin), try Dokter Hewan
  if (registration) {
    if (!isAdmin && registration.user_id !== user.id) {
      registration = null
    }
  }

  let type: 'NKV' | 'Dokter Hewan' = 'NKV'
  
  if (!registration) {
    const { data: dokterData } = await supabase
      .from('dokter_hewan_registrations')
      .select(`
        id,
        registration_number,
        status,
        created_at,
        verification_notes,
        recommendation_file_url,
        user_id
      `)
      .eq('registration_number', normalizedCode)
      .single()
    
    if (dokterData) {
      if (!isAdmin && dokterData.user_id !== user.id) {
        registration = null
      } else {
        registration = dokterData
        type = 'Dokter Hewan'
      }
    }
  }

  if (!registration) {
    redirect('/dashboard')
  }

  // Fetch tracking logs based on type
  let trackingLogs: Array<{ status: string; created_at: string; notes?: string }> = []
  if (registration && 'id' in registration) {
    const logQuery = type === 'NKV'
      ? supabase
          .from('tracking_logs')
          .select('status, created_at, notes')
          .eq('nkv_registration_id', registration.id)
          .order('created_at', { ascending: true })
      : supabase
          .from('tracking_logs')
          .select('status, created_at, notes')
          .eq('dokter_hewan_registration_id', registration.id)
          .order('created_at', { ascending: true })

    const { data: logs } = await logQuery
    trackingLogs = logs || []
  }

  return <TrackingClient registration={{ ...registration, tracking_logs: trackingLogs }} type={type} />
}

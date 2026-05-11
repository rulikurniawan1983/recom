import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TrackingClient from './tracking-client'

export default async function TrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Try NKV first
  let { data: registration } = await supabase
    .from('nkv_registrations')
    .select(`*, tracking_logs(*)`)
    .eq('registration_number', code)
    .eq('user_id', user.id)
    .single()

  let type = 'NKV'
  
  if (!registration) {
    const { data: dokterData } = await supabase
      .from('dokter_hewan_registrations')
      .select(`*, tracking_logs(*)`)
      .eq('registration_number', code)
      .eq('user_id', user.id)
      .single()
    
    if (dokterData) {
      registration = dokterData
      type = 'Dokter Hewan'
    }
  }

  if (!registration) {
    redirect('/dashboard')
  }

  return <TrackingClient registration={registration} type={type} />
}
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
import type { Profile, NKVRegistration, DokterHewanRegistration } from '@/lib/types'
import { TrackingModalProvider } from '@/contexts/tracking-modal-context'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, phone, company_name, created_at, updated_at')
    .eq('id', user.id)
    .single()

  // Redirect admin users to admin dashboard
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  }

  const { data: nkvRegistrations } = await supabase
    .from('nkv_registrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: dokterRegistrations } = await supabase
    .from('dokter_hewan_registrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <TrackingModalProvider>
      <DashboardClient 
        user={user} 
        profile={profile as Profile | null} 
        nkvRegistrations={(nkvRegistrations ?? []) as NKVRegistration[]} 
        dokterRegistrations={(dokterRegistrations ?? []) as DokterHewanRegistration[]} 
      />
    </TrackingModalProvider>
  )
}

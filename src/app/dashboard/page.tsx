import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

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
    .select('*')
    .eq('id', user.id)
    .single()

  // Redirect admin users to admin dashboard
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  }

  const { data: nkvRegistrations } = await supabase
    .from('nkv_registrations')
    .select(`*, tracking_logs(status, created_at)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: dokterRegistrations } = await supabase
    .from('dokter_hewan_registrations')
    .select(`*, tracking_logs(status, created_at)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <DashboardClient user={user} profile={profile} nkvRegistrations={nkvRegistrations || []} dokterRegistrations={dokterRegistrations || []} />
}
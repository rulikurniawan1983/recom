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

  console.log('Fetching registrations for user:', user.id)

  const { data: nkvRegistrations, error: nkvError } = await supabase
    .from('nkv_registrations')
    .select(`*, tracking_logs(status, created_at)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: dokterRegistrations, error: dokterError } = await supabase
    .from('dokter_hewan_registrations')
    .select(`*, tracking_logs(status, created_at)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (nkvError) {
    console.error('Error fetching NKV registrations:', nkvError);
    console.error('Error message:', nkvError.message);
    console.error('Error details:', JSON.stringify(nkvError));
  }
  
  if (dokterError) {
    console.error('Error fetching Dokter Hewan registrations:', dokterError);
    console.error('Error message:', dokterError.message);
    console.error('Error details:', JSON.stringify(dokterError));
  }
  
  if (dokterError) {
    console.error('Error fetching Dokter Hewan registrations:', dokterError)
  }

  console.log('NKV Registrations:', nkvRegistrations)
  console.log('Dokter Hewan Registrations:', dokterRegistrations)

  return <DashboardClient user={user} profile={profile} nkvRegistrations={nkvRegistrations || []} dokterRegistrations={dokterRegistrations || []} />
}
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

  // Fetch NKV registrations without trying to auto-join tracking_logs
  let { data: nkvRegistrations, error: nkvError } = await supabase
    .from('nkv_registrations')
    .select(`*`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch Dokter Hewan registrations without trying to auto-join tracking_logs
  let { data: dokterRegistrations, error: dokterError } = await supabase
    .from('dokter_hewan_registrations')
    .select(`*`)
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

  // Fetch tracking logs separately for each registration if needed
  // For now, we'll pass empty tracking_logs arrays since the UI can handle empty arrays
  const processedNVKRegistrations = nkvRegistrations ? 
    nkvRegistrations.map(reg => ({ ...reg, tracking_logs: [] })) : [];
    
  const processedDokterRegistrations = dokterRegistrations ? 
    dokterRegistrations.map(reg => ({ ...reg, tracking_logs: [] })) : [];

  console.log('Processed NKV Registrations:', processedNVKRegistrations);
  console.log('Processed Dokter Hewan Registrations:', processedDokterRegistrations);

  return <DashboardClient user={user} profile={profile} nkvRegistrations={processedNVKRegistrations} dokterRegistrations={processedDokterRegistrations} />
}
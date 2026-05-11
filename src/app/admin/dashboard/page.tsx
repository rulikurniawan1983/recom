import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './admin-dashboard-client'

export default async function AdminDashboardPage() {
  // Create a service role client to bypass RLS for admin operations
  const serviceSupabase = createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  console.log('Fetching all registrations for admin dashboard')
  console.log('Current user:', user.id, user.email)
  console.log('Profile:', profile)

  // Let's try to get a simple count first
  try {
    const { count: nkvCount, error: nkvCountError } = await serviceSupabase
      .from('nkv_registrations')
      .select('*', { count: 'exact', head: true })
    
    const { count: dokterCount, error: dokterCountError } = await serviceSupabase
      .from('dokter_hewan_registrations')
      .select('*', { count: 'exact', head: true })
      
    console.log('NKV Count:', nkvCount, 'Error:', nkvCountError)
    console.log('Dokter Hewan Count:', dokterCount, 'Error:', dokterCountError)
  } catch (countError) {
    console.error('Count error:', countError)
  }

  // Let's try to get just one record from each table to see if we can read them at all
  try {
    const { data: nkvSample, error: nkvSampleError } = await serviceSupabase
      .from('nkv_registrations')
      .select('*')
      .limit(1)
      
    const { data: dokterSample, error: dokterSampleError } = await serviceSupabase
      .from('dokter_hewan_registrations')
      .select('*')
      .limit(1)
      
    console.log('NKV Sample:', nkvSample, 'Error:', nkvSampleError)
    console.log('Dokter Hewan Sample:', dokterSample, 'Error:', dokterSampleError)
  } catch (sampleError) {
    console.error('Sample error:', sampleError)
  }

  // Fetch all registrations using service role client to bypass RLS
  const [nkvResult, dokterResult] = await Promise.all([
    serviceSupabase
      .from('nkv_registrations')
      .select('*')
      .order('created_at', { ascending: false }),
    serviceSupabase
      .from('dokter_hewan_registrations')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  if (nkvResult.error) {
    console.error('Error fetching NKV registrations:', nkvResult.error)
  }
  
  if (dokterResult.error) {
    console.error('Error fetching Dokter Hewan registrations:', dokterResult.error)
  }

  console.log('Raw NKV Result:', JSON.stringify(nkvResult, null, 2))
  console.log('Raw Dokter Hewan Result:', JSON.stringify(dokterResult, null, 2))

  const allRegistrations = [
    ...(nkvResult.data || []).map(r => ({ ...r, type: 'NKV' as const })),
    ...(dokterResult.data || []).map(r => ({ ...r, type: 'Dokter Hewan' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log('Processed allRegistrations count:', allRegistrations.length)
  console.log('First few registrations:', JSON.stringify(allRegistrations.slice(0, 3), null, 2))

  return (
    <AdminDashboardClient
      profile={profile}
      user={user}
      allRegistrations={allRegistrations}
    />
  )
}
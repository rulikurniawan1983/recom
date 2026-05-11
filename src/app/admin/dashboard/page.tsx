import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './admin-dashboard-client'

export default async function AdminDashboardPage() {
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

  // Let's try to get ALL data first without any filters to see what's in the database
  const [nkvResult, dokterResult] = await Promise.all([
    supabase
      .from('nkv_registrations')
      .select('*') // Select all columns to see what's available
      .order('created_at', { ascending: false }),
    supabase
      .from('dokter_hewan_registrations')
      .select('*') // Select all columns to see what's available
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

  // Let's also try a simple count query
  const [nkvCountResult, dokterCountResult] = await Promise.all([
    supabase
      .from('nkv_registrations')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('dokter_hewan_registrations')
      .select('*', { count: 'exact', head: true }),
  ])

  console.log('NKV Count Result:', nkvCountResult)
  console.log('Dokter Hewan Count Result:', dokterCountResult)

  const allRegistrations = [
    ...(nkvResult.data || []).map(r => ({ ...r, type: 'NKV' as const })),
    ...(dokterResult.data || []).map(r => ({ ...r, type: 'Dokter Hewan' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log('Processed allRegistrations count:', allRegistrations.length)
  console.log('First few registrations:', allRegistrations.slice(0, 3))

  return (
    <AdminDashboardClient
      profile={profile}
      user={user}
      allRegistrations={allRegistrations}
    />
  )
}
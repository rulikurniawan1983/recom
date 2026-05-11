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

  // Fetch all registrations
  const [nkvResult, dokterResult] = await Promise.all([
    supabase
      .from('nkv_registrations')
      .select(`
        id,
        status,
        created_at,
        registration_number
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('dokter_hewan_registrations')
      .select(`
        id,
        status,
        created_at,
        registration_number,
        full_name
      `)
      .order('created_at', { ascending: false }),
  ])

  const allRegistrations = [
    ...(nkvResult.data || []).map(r => ({ ...r, type: 'NKV' as const })),
    ...(dokterResult.data || []).map(r => ({ ...r, type: 'Dokter Hewan' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <AdminDashboardClient
      profile={profile}
      user={user}
      allRegistrations={allRegistrations}
    />
  )
}
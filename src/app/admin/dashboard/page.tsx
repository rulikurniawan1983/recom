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
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VetDashboardShell from '@/components/vet-dashboard-shell'
import HistoryList from '@/components/history/history-list'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  // Fetch all records
  const { data: vaccinations } = await supabase.from('vaccinations')
    .select(`
      *,
      pets (name, species, breed),
      doctors (profiles (full_name))
    `)
    .eq('user_id', user.id)
    .order('vaccination_date', { ascending: false })

  const { data: treatments } = await supabase.from('treatments')
    .select(`
      *,
      pets (name, species, breed),
      doctors (profiles (full_name))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: consultations } = await supabase.from('consultations')
    .select(`
      *,
      pets (name, species, breed),
      doctors (profiles (full_name))
    `)
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: false })

  return (
    <VetDashboardShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Riwayat Pelayanan</h2>
          <p className="text-gray-500 mt-1">History vaksinasi, pengobatan, dan konsultasi</p>
        </div>

        <HistoryList
          vaccinations={vaccinations || []}
          treatments={treatments || []}
          consultations={consultations || []}
        />
      </div>
    </VetDashboardShell>
  )
}

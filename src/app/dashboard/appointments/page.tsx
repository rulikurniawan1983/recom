import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VetDashboardShell from '@/components/vet-dashboard-shell'
import UpcomingAppointments from '@/components/dashboard/upcoming-appointments'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  const { data: vaccinations } = await supabase.from('vaccinations')
    .select(`
      *,
      pets (name, species, breed),
      doctors (profiles (full_name))
    `)
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .order('vaccination_date', { ascending: true })

  const { data: treatments } = await supabase.from('treatments')
    .select(`
      *,
      pets (name, species, breed),
      doctors (profiles (full_name))
    `)
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .order('created_at', { ascending: false })

  const { data: consultations } = await supabase.from('consultations')
    .select(`
      *,
      pets (name, species, breed),
      doctors (profiles (full_name))
    `)
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_date', { ascending: true })

  return (
    <VetDashboardShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Jadwal Saya</h2>
          <p className="text-gray-500 mt-1">Kelola semua janji temu dan booking</p>
        </div>

        <UpcomingAppointments
          vaccinations={vaccinations || []}
          treatments={treatments || []}
          consultations={consultations || []}
        />
      </div>
    </VetDashboardShell>
  )
}

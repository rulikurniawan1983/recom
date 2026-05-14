import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VetDashboardShell from '@/components/vet-dashboard-shell'
import VaccinationList from '@/components/vaccinations/vaccination-list'
import BookVaccinationButton from '@/components/vaccinations/book-vaccination-button'

export default async function VaccinationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Fetch user's pets
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('name')

  // Fetch vaccinations with details
  const { data: vaccinations } = await supabase
    .from('vaccinations')
    .select(`
      *,
      pets (name, species, breed),
      doctors (
        id,
        specialization,
        profiles (full_name, email)
      ),
      vaccination_schedules (
        date,
        start_time,
        location
      )
    `)
    .eq('user_id', user.id)
    .order('vaccination_date', { ascending: false })

  return (
    <VetDashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Vaksinasi Rabies</h2>
            <p className="text-gray-500 mt-1">Kelola jadwal vaksinasi untuk hewan peliharaan Anda</p>
          </div>
          <BookVaccinationButton pets={pets || []} />
        </div>

        {!pets || pets.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada hewan peliharaan
            </h3>
            <p className="text-gray-500">
              Anda perlu mendaftarkan hewan peliharaan terlebih dahulu sebelum melakukan booking vaksinasi.
            </p>
            <a
              href="/dashboard/pets"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Tambah Hewan Sekarang
            </a>
          </div>
        ) : (
          <VaccinationList vaccinations={vaccinations || []} pets={pets} />
        )}
      </div>
    </VetDashboardShell>
  )
}

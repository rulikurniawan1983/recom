import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VetDashboardShell from '@/components/vet-dashboard-shell'
import TreatmentList from '@/components/treatments/treatment-list'
import BookTreatmentButton from '@/components/treatments/book-treatment-button'
import { Stethoscope } from 'lucide-react'

export default async function TreatmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('name')

  const { data: treatments } = await supabase
    .from('treatments')
    .select(`
      *,
      pets (name, species, breed),
      doctors (
        id,
        specialization,
        profiles (full_name, email)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <VetDashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pengobatan Hewan</h2>
            <p className="text-gray-500 mt-1">Kelola permintaan pengobatan dan pemeriksaan kesehatan</p>
          </div>
          <BookTreatmentButton pets={pets || []} />
        </div>

        {!pets || pets.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Stethoscope className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada hewan peliharaan
            </h3>
            <p className="text-gray-500">
              Anda perlu mendaftarkan hewan peliharaan terlebih dahulu.
            </p>
            <a
              href="/dashboard/pets"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Tambah Hewan Sekarang
            </a>
          </div>
        ) : (
          <TreatmentList treatments={treatments || []} pets={pets} />
        )}
      </div>
    </VetDashboardShell>
  )
}

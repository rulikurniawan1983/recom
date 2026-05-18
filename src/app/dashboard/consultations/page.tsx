import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VetDashboardShell from '@/components/vet-dashboard-shell'
import ConsultationList from '@/components/consultations/consultation-list'
import BookConsultationButton from '@/components/consultations/book-consultation-button'
import { Video } from 'lucide-react'

export default async function ConsultationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  const { data: pets } = await supabase.from('pets')
    .select('id, name, species, breed').eq('user_id', user.id).eq('is_active', true).order('name')

  const { data: consultations } = await supabase.from('consultations')
    .select(`
      *,
      pets (name, species, breed),
      doctors (id, specialization, profiles (full_name, email))
    `)
    .eq('user_id', user.id)
    .order('scheduled_date', { ascending: false })

  return (
    <VetDashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Konsultasi</h2>
            <p className="text-gray-500 mt-1">Kelua jadwal konsultasi online atau offline dengan dokter</p>
          </div>
          <BookConsultationButton pets={pets || []} userId={user.id} />
        </div>

        {!pets || pets.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada hewan peliharaan</h3>
            <p className="text-gray-500">Anda perlu mendaftarkan hewan terlebih dahulu.</p>
            <a href="/dashboard/pets" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Tambah Hewan Sekarang
            </a>
          </div>
        ) : (
          <ConsultationList consultations={consultations || []} pets={pets} />
        )}
      </div>
    </VetDashboardShell>
  )
}

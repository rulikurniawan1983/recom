import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VetDashboardShell from '@/components/vet-dashboard-shell'
import PetGrid from '@/components/pets/pet-grid'
import AddPetButton from '@/components/pets/add-pet-button'

export default async function PetsPage() {
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

  // Fetch pets
  const { data: pets } = await supabase
    .from('pets')
    .select(`
      *,
      vaccinations (
        id,
        vaccination_date,
        status,
        vaccine_type,
        qr_code
      ),
      treatments (
        id,
        scheduled_date,
        status
      ),
      consultations (
        id,
        scheduled_date,
        status,
        consultation_type
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <VetDashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hewan Peliharaan</h2>
            <p className="text-gray-500 mt-1">Kelola data hewan peliharaan Anda</p>
          </div>
          <AddPetButton />
        </div>

        <PetGrid pets={pets || []} />
      </div>
    </VetDashboardShell>
  )
}

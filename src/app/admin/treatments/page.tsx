import { createClient } from '@/lib/supabase-server'
import AdminShell from '@/components/admin-shell'
import AdminTreatmentsTable from '@/components/admin/admin-treatments-table'

export default async function AdminTreatmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: treatments } = await supabase.from('treatments')
    .select(`
      *,
      pets (name, species, breed),
      doctors (id, profiles (full_name, email))
    `)
    .order('created_at', { ascending: false })

  const { data: doctors } = await supabase.from('doctors')
    .select('id, profiles (full_name)')

  // Transform doctors to match the expected Doctor interface
  const transformedDoctors = (doctors || []).map((doctor) => ({
    id: doctor.id,
    profiles: Array.isArray(doctor.profiles) ? doctor.profiles[0] || null : doctor.profiles,
  }))

  return (
    <AdminShell userEmail={user?.email || 'admin'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pengobatan</h1>
          <p className="text-gray-600 mt-1">Konfirmasi dan kelola permintaan pengobatan hewan</p>
        </div>
        <AdminTreatmentsTable treatments={treatments || []} doctors={transformedDoctors} />
      </div>
    </AdminShell>
  )
}

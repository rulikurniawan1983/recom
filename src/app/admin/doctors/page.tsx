import { createClient } from '@/lib/supabase-server'
import AdminShell from '@/components/admin-shell'
import AdminDoctorsTable from '@/components/admin/admin-doctors-table'

export default async function AdminDoctorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctors } = await supabase.from('doctors')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminShell userEmail={user?.email || 'admin'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Dokter</h1>
          <p className="text-gray-600 mt-1">Lihat dan kelola data dokter hewan</p>
        </div>
        <AdminDoctorsTable doctors={doctors || []} />
      </div>
    </AdminShell>
  )
}

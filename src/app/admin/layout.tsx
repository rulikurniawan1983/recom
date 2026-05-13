import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Admin Dashboard - SLIDER',
  description: 'Admin panel for managing registrations'
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-4 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-blue-200">SLIDER System</p>
        </div>
        <nav className="space-y-2">
          <a
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            Semua Permohonan
          </a>
          <a
            href="/admin/verification"
            className="block px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            Verifikasi NKV
          </a>
          <a
            href="/admin/verification/dokter-hewan"
            className="block px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            Verifikasi Dokter Hewan
          </a>
          <a
            href="/admin/users"
            className="block px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            Pengguna
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-blue-900 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
          <a href="/admin" className="text-sm">
            Semua Permohonan
          </a>
        </div>
        {children}
      </main>
    </div>
  )
}

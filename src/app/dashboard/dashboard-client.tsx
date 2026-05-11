'use client'

import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DashboardClientProps {
  user: User
  profile: Profile | null
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Sistem Rekomendasi NKV</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.full_name || user.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Selamat Datang, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Anda login sebagai Admin Dinas Perikanan dan Peternakan'
              : 'Kelola pendaftaran Rekomendasi NKV untuk unit usaha Anda'
            }
          </p>
        </div>

        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  )
}

function UserDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pendaftaran Baru</CardTitle>
          <CardDescription>
            Buat pendaftaran rekomendasi NKV baru untuk unit usaha Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/registration/new">
            <Button className="w-full">Daftar Sekarang</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Pendaftaran</CardTitle>
          <CardDescription>
            Lihat status dan riwayat pendaftaran NKV Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/registration">
            <Button variant="outline" className="w-full">Lihat Status</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Verifikasi Dokumen</CardTitle>
          <CardDescription>
            Tinjau dokumen pendaftar yang menunggu verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/verification">
            <Button className="w-full">Lihat Dokumen</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jadwal Pemeriksaan</CardTitle>
          <CardDescription>
            Kelola jadwal pemeriksaan lapangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/inspection">
            <Button variant="outline" className="w-full">Kelola Jadwal</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penilaian & Rekomendasi</CardTitle>
          <CardDescription>
            Beri penilaian dan rekomendasi untuk pendaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/assessment">
            <Button variant="outline" className="w-full">Proses Penilaian</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

interface DashboardClientProps {
  user: User
  profile: any
  nkvRegistrations: any[]
  dokterRegistrations: any[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  document_verification: 'Verifikasi Dokumen',
  field_inspection: 'Pemeriksaan Lapangan',
  assessment: 'Penilaian',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  revision_requested: 'Perlu Revisi'
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  document_verification: 'bg-yellow-100 text-yellow-800',
  field_inspection: 'bg-purple-100 text-purple-800',
  assessment: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_requested: 'bg-red-100 text-red-800'
}

export default function DashboardClient({ user, profile, nkvRegistrations, dokterRegistrations }: DashboardClientProps) {
  console.log('DashboardClient render started with:', { 
    userId: user?.id, 
    nkvRegistrations: nkvRegistrations.length, 
    dokterRegistrations: dokterRegistrations.length 
  })

  const router = useRouter()
  const supabase = createClient()

  const handleLogout = () => {
    router.push('/logout')
  }

  const allRegistrations = [
    ...nkvRegistrations.map(r => ({ ...r, type: 'NKV' })),
    ...dokterRegistrations.map(r => ({ ...r, type: 'Dokter Hewan' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  console.log('Processed allRegistrations count:', allRegistrations.length)

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm">
      <header className="bg-white/90 backdrop-blur-sm shadow-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Dashboard Pengguna</h1>
            <p className="text-sm text-blue-700">Sistem Rekomendasi Veteriner</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.full_name || user.email}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700 border-red-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Selamat Datang, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-blue-700 mt-1">Kelola dan pantau permohonan rekomendasi Anda</p>
          {user.email && (
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        {/* Action Buttons - Simplified */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Link href="/nkv/register" className="flex-1 sm:max-w-xs">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Rekomendasi NKV
            </button>
          </Link>
          <Link href="/dokter-hewan/register" className="flex-1 sm:max-w-xs">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Praktek Dokter Hewan
            </button>
          </Link>
        </div>

        {/* Registration History - Main Focus */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Riwayat Permohonan</h2>
          {allRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-blue-500">Belum ada permohonan. Buat permohonan baru di atas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allRegistrations.map((reg, index) => {
                console.log('Rendering registration at index', index, ':', reg.registration_number)
                return (
                  <div key={reg.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-blue-900">{reg.registration_number}</h3>
                        <p className="text-sm text-blue-600 flex items-center gap-2">
                          {reg.type} • {new Date(reg.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                        {getStatusLabel(reg.status)}
                      </span>
                    </div>
                    
                    {reg.tracking_logs && reg.tracking_logs.length > 0 && (
                      <div className="text-xs text-blue-600 mb-2">
                        <strong>Update Terakhir:</strong> {getStatusLabel(reg.tracking_logs[0].status)} - {new Date(reg.tracking_logs[0].created_at).toLocaleDateString('id-ID')}
                      </div>
                    )}
                    
                    <div className="mt-2">
                      {reg.recommendation_file_url ? (
                        <a 
                          href={reg.recommendation_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          📄 Unduh Rekomendasi
                        </a>
                      ) : reg.status === 'revision_requested' ? (
                        <span className="text-sm text-red-600">⚠️ Perlu revisi - Silakan cek detail</span>
                      ) : (
                        <Link href={`/tracking/${reg.registration_number}`} className="text-sm text-blue-600 hover:underline">
                          🔍 Cek Detail
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Helper functions for status labels and colors
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    document_verification: 'Verifikasi Dokumen',
    field_inspection: 'Pemeriksaan Lapangan',
    assessment: 'Penilaian',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    revision_requested: 'Perlu Revisi'
  }
  return labels[status] || status
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    document_verification: 'bg-yellow-100 text-yellow-800',
    field_inspection: 'bg-purple-100 text-purple-800',
    assessment: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    revision_requested: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
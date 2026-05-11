'use client'

import { Profile } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { FileText, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react'

interface AdminDashboardClientProps {
  profile: Profile
  user: User
  allRegistrations: Array<{
    id: string
    registration_number: string
    status: string
    created_at: string
    type: 'NKV' | 'Dokter Hewan'
    full_name?: string
  }>
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

const STATUS_PROGRESS: Record<string, number> = {
  draft: 10,
  submitted: 25,
  document_verification: 50,
  field_inspection: 70,
  assessment: 85,
  approved: 100,
  rejected: 100,
  revision_requested: 50
}

const STEPS = [
  { key: 'draft', label: 'Pengisian Form' },
  { key: 'submitted', label: 'Pengajuan' },
  { key: 'document_verification', label: 'Verifikasi Dokumen' },
  { key: 'field_inspection', label: 'Pemeriksaan Lapangan' },
  { key: 'assessment', label: 'Penilaian' },
  { key: 'approved', label: 'Selesai' }
]

export default function AdminDashboardClient({ profile, user, allRegistrations }: AdminDashboardClientProps) {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/logout')
  }

  const stats = {
    total: allRegistrations.length,
    approved: allRegistrations.filter(r => r.status === 'approved').length,
    inProgress: allRegistrations.filter(r => !['approved', 'rejected'].includes(r.status)).length,
    revision: allRegistrations.filter(r => r.status === 'revision_requested').length
  }

  const RenderTimeline = ({ status }: { status: string }) => {
    const currentStep = STEPS.findIndex(s => s.key === status) === -1 ? 1 : STEPS.findIndex(s => s.key === status)
    
    return (
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
              ${idx <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {idx + 1}
            </div>
            <span className="text-[10px] mt-1 text-center hidden sm:block">{step.label}</span>
          </div>
        ))}
      </div>
    )
  }

  const RegistrationCard = ({ reg }: { reg: any }) => (
    <Card className="mb-4 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-sm text-blue-900">{reg.registration_number}</p>
            <p className="text-xs text-blue-600">
              {reg.type} • {new Date(reg.created_at).toLocaleDateString('id-ID')}
              {reg.full_name && ` • ${reg.full_name}`}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
            {STATUS_LABELS[reg.status]}
          </span>
        </div>

        <RenderTimeline status={reg.status} />

        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{ width: `${STATUS_PROGRESS[reg.status] || 0}%` }}
          ></div>
        </div>

        <Link href={reg.type === 'NKV' ? '/admin/verification' : '/admin/verification/dokter-hewan'}>
          <Button size="sm" variant="outline">Verifikasi</Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm">
      <header className="bg-white/90 backdrop-blur-sm shadow-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Dashboard Admin</h1>
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
            Selamat Datang, Admin {profile?.full_name?.split(' ')[0] || 'Admin'}!
          </h2>
          <p className="text-blue-700 mt-1">Dashboard untuk monitoring seluruh permohonan</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  <p className="text-xs text-blue-600">Total Permohonan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                  <p className="text-xs text-green-600">Disetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                  <p className="text-xs text-yellow-600">Dalam Proses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-red-900">{stats.revision}</p>
                  <p className="text-xs text-red-600">Perlu Revisi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration History */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Semua Permohonan</h3>
          {allRegistrations.length === 0 ? (
            <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-600">Belum ada permohonan</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {allRegistrations.map(reg => (
                <RegistrationCard key={reg.id} reg={reg} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
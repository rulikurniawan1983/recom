'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Activity,
  XCircle,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RegistrationDetailModal from '@/components/registration-detail-modal'
import { ServiceSelectionModal } from '@/components/service-selection-modal'
import type { Profile, NKVRegistration, DokterHewanRegistration, VeterinaryRegistration, RegistrationStatus } from '@/lib/types'

type Registration = (NKVRegistration & { type: 'NKV' }) | (DokterHewanRegistration & { type: 'Dokter Hewan' }) | (VeterinaryRegistration & { type: 'Veterinary' });

import type { User } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: any
  profile: Profile | null
  nkvRegistrations: NKVRegistration[]
  dokterRegistrations: DokterHewanRegistration[]
  veterinaryRegistrations: VeterinaryRegistration[]
}

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  document_verification: 'Verifikasi Dokumen',
  field_inspection: 'Pemeriksaan Lapangan',
  assessment: 'Penilaian',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  revision_requested: 'Perlu Revisi',
}

const STATUS_COLORS: Record<RegistrationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  document_verification: 'bg-yellow-100 text-yellow-800',
  field_inspection: 'bg-purple-100 text-purple-800',
  assessment: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_requested: 'bg-red-100 text-red-800',
}

export default function DashboardClient({ user, profile, nkvRegistrations, dokterRegistrations, veterinaryRegistrations }: DashboardClientProps) {
  const router = useRouter()
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'NKV' | 'Dokter Hewan' | 'Veterinary'>('all')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingResult, setTrackingResult] = useState<Registration | null>(null)
  const [showServiceModal, setShowServiceModal] = useState(false)

  const allRegistrations: Registration[] = [
    ...nkvRegistrations.map(r => ({ ...r, type: 'NKV' as const })),
    ...dokterRegistrations.map(r => ({ ...r, type: 'Dokter Hewan' as const })),
    ...veterinaryRegistrations.map(r => ({ ...r, type: 'Veterinary' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filteredRegistrations = allRegistrations.filter(reg => {
    const matchesSearch = searchQuery === '' ||
      reg.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.type === 'NKV' && reg.business_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reg.type === 'Dokter Hewan' && reg.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reg.type === 'Veterinary' && (reg.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) || reg.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    const matchesType = typeFilter === 'all' || reg.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: allRegistrations.length,
    draft: allRegistrations.filter(r => r.status === 'draft').length,
    submitted: allRegistrations.filter(r => r.status === 'submitted').length,
    processing: allRegistrations.filter(r =>
      ['document_verification', 'field_inspection', 'assessment'].includes(r.status)
    ).length,
    approved: allRegistrations.filter(r => r.status === 'approved').length,
    rejected: allRegistrations.filter(r => r.status === 'rejected' || r.status === 'revision_requested').length,
  }

  const handleResubmit = async (id: string, files?: Array<{ file_name: string; file_url: string; document_type: string }>) => {
    if (!confirm('Apakah Anda yakin ingin mengajukan ulang permohonan ini?')) return
    try {
      const res = await fetch(`/api/registrations/${id}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrls: files || [] })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Permohonan berhasil diajukan kembali')
        window.location.reload()
      } else {
        alert(data.error || 'Gagal mengajukan ulang')
      }
    } catch {
      alert('Terjadi kesalahan')
    }
  }

  const handleTrackFromModal = async () => {
    if (!trackingCode.trim()) return
    try {
      const res = await fetch(`/api/tracking/${trackingCode.trim()}`)
      const data = await res.json()
      if (res.ok) {
        const reg: Registration = {
          ...data,
          type: data.type,
          registration_number: data.registration_number,
          status: data.status,
          created_at: data.created_at,
          user_id: '',
        }
        setTrackingResult(reg)
        setSelectedRegistration(reg)
      } else {
        alert(data.error || 'Nomor tracking tidak ditemukan')
      }
    } catch {
      alert('Terjadi kesalahan saat mencari')
    }
  }

  const getStatusBadge = (status: RegistrationStatus) => (
    <Badge variant="secondary" className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )

  const getTrackingStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      document_verification: 'bg-yellow-100 text-yellow-800',
      field_inspection: 'bg-purple-100 text-purple-800',
      assessment: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revision_requested: 'bg-red-100 text-red-800',
    }
    return (
      <Badge variant="secondary" className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {STATUS_LABELS[status as RegistrationStatus] || status}
      </Badge>
    )
  }

  const renderTrackingTimeline = (reg: Registration) => {
    const STATUS_ORDER = ['submitted', 'document_verification', 'field_inspection', 'assessment', 'approved']
    const currentIdx = STATUS_ORDER.indexOf(reg.status)
    const isRejected = reg.status === 'rejected' || reg.status === 'revision_requested'

    return (
      <div className="relative mt-6">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          {STATUS_ORDER.map((statusKey, index) => {
            const isCompleted = currentIdx > index
            const isCurrent = currentIdx === index && !isRejected
            const isRejectedStep = isRejected && currentIdx === index

            return (
              <div key={statusKey} className="relative flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  isCompleted || reg.status === 'approved' ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-600 text-white' :
                  isRejectedStep ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted || reg.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                    isCurrent ? <Clock className="w-5 h-5" /> :
                    isRejectedStep ? <XCircle className="w-5 h-5" /> :
                    <div className="w-3 h-3 rounded-full bg-gray-400" />}
                </div>
                <div className="flex-1 pt-1">
                  <span className={`font-medium ${
                    isCompleted || reg.status === 'approved' ? 'text-green-700' :
                    isCurrent ? 'text-blue-900' :
                    isRejectedStep ? 'text-red-700' :
                    'text-gray-500'
                  }`}>
                    {STATUS_LABELS[statusKey as RegistrationStatus]}
                  </span>
                  {isCurrent && !isRejected && (
                    <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Sedang diproses
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">VetSys</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/logout')} className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {profile?.full_name?.split(' ')[0] || 'User'}! Kelola dan pantau permohonan Anda.</p>
        </div>

        {/* ── LAYANAN KHUSUS ── */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-3">Layanan Khusus</p>
        <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-3">

          {/* ── Card: Pelayanan Kesehatan Hewan ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">Pelayanan Kesehatan Hewan</h3>
            <p className="text-xs text-gray-500 mb-3">Booking vaksinasi, pengobatan, dan konsultasi dokter hewan dalam satu dashboard.</p>
            <ul className="space-y-1 mb-4">
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Booking <strong>Vaksinasi Rabies</strong> — pilih jadwal, e-ticket QR</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> <strong>Pengobatan Hewan</strong> — formulir keluhan, upload foto/video</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> <strong>Konsultasi</strong> online / offline, pilih dokter</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Reminder jadwal &amp; notifikasi booking</li>
            </ul>
            <a href="/dashboard/vaccinations" className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium text-center rounded-lg transition-colors">Lihat Layanan</a>
          </div>

          {/* ── Card: Rekomendasi Praktek Dokter Hewan ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">Rekomendasi Praktek Dokter Hewan</h3>
            <p className="text-xs text-gray-500 mb-3">Rekomendasi resmi dari Dinas Peternakan sebagai syarat izin praktek dokter hewan.</p>
            <ul className="space-y-1 mb-4">
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Pendaftaran online — KTP, STRV, sertifikat kompetensi</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Verifikasi dokumen oleh admin</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Pemeriksaan lapangan fasilitas klinik</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Sertifikat rekomendasi — unduh PDF</li>
            </ul>
            <a href="/dokter-hewan/register" className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-medium text-center rounded-lg transition-colors">Daftar Rekomendasi</a>
          </div>

          {/* ── Card: Rekomendasi Nomor Kontrol Veteriner ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">Rekomendasi Nomor Kontrol Veteriner</h3>
            <p className="text-xs text-gray-500 mb-3">Ajukan NKV untuk usaha peternakan dan kesehatan hewan dengan tracking transparan.</p>
            <ul className="space-y-1 mb-4">
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Formulir data usaha &amp; produk pangan hewan</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Upload IUI, sertifikat kompetensi, dokumen usaha</li>
              <li className="text-xs text-gray-600 flex items-start gap-1.5"><Check className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" /> Verifikasi &amp; penilaian oleh tim Dinas</li>
            </ul>
            <a href="/nkv/register" className="block w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium text-center rounded-lg transition-colors">Ajukan Rekomendasi</a>
          </div>

        </div>
        {/* ── AKHIR LAYANAN KHUSUS ── */}
        {/* ── AKHIR NAVIGASI ────────────────────────────────── */}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Permohonan" value={stats.total} icon={<FileText className="h-4 w-4 text-blue-600" />} />
          <StatCard title="Draft" value={stats.draft} icon={<Clock className="h-4 w-4 text-gray-600" />} />
          <StatCard title="Diproses" value={stats.processing} icon={<Activity className="h-4 w-4 text-yellow-600" />} />
          <StatCard title="Disetujui" value={stats.approved} icon={<CheckCircle className="h-4 w-4 text-green-600" />} />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari nomor registrasi, nama usaha, atau nama lengkap..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'NKV' | 'Dokter Hewan' | 'Veterinary')} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
              <option value="all">Semua Jenis</option>
              <option value="NKV">NKV</option>
              <option value="Dokter Hewan">Dokter Hewan</option>
              <option value="Veterinary">Pelayanan Kesehatan Hewan</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Permohonan</CardTitle>
            <CardDescription>{filteredRegistrations.length} permohonan ditemukan</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Registrasi</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Tidak ada permohonan yang sesuai</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                             <p className="font-semibold text-gray-900">{reg.registration_number}</p>
                             <p className="text-sm text-gray-500">
                               {reg.type === 'NKV'
                                 ? reg.business_name
                                 : reg.type === 'Dokter Hewan'
                                   ? reg.full_name
                                   : reg.owner_name || reg.pet_name}
                             </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-300 text-blue-700">{reg.type}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{new Date(reg.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedRegistration(reg)} className="h-8">
                              <Eye className="h-3 w-3 mr-1" /> Detail
                            </Button>
                            {(reg.status === 'draft' || reg.status === 'submitted') && (
                              <>
                                <Button variant="default" size="sm" onClick={() => setSelectedRegistration(reg)} className="h-8">
                                  <Edit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                {reg.status === 'draft' && (
                                  <Button variant="destructive" size="sm" onClick={() => setSelectedRegistration(reg)} className="h-8">
                                    <Trash2 className="h-3 w-3 mr-1" /> Hapus
                                  </Button>
                                )}
                              </>
                            )}
                            {reg.status === 'revision_requested' && (
                              <Button variant="default" size="sm" onClick={() => handleResubmit(reg.id)} className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                                <ArrowLeft className="h-3 w-3 mr-1" /> Ajukan Ulang
                              </Button>
                            )}
                            {reg.recommendation_file_url && reg.status === 'approved' && (
                              <Button variant="outline" size="sm" onClick={() => window.open(reg.recommendation_file_url!, '_blank', 'noopener,noreferrer')} className="h-8">
                                <Download className="h-3 w-3 mr-1" /> Unduh
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Registration Detail Modal */}
        {selectedRegistration && (
          <RegistrationDetailModal
                 isOpen={true}
                 onClose={() => { setSelectedRegistration(null); setTrackingResult(null); }}
                 registration={selectedRegistration}
                 onUpdate={async () => { window.location.reload(); }}
                 onDelete={async () => { window.location.reload(); }}
                 onResubmit={handleResubmit}
               />
        )}
      </main>

      {/* Tracking Modal - Simplified inline version */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Lacak Permohonan</h2>
              <button onClick={() => { setShowTrackingModal(false); setTrackingResult(null); setTrackingCode(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!trackingResult ? (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tracking-code">Nomor Registrasi</Label>
                    <Input id="tracking-code" placeholder="Contoh: NKV-2024-ABC123" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} className="text-center tracking-wider" />
                  </div>
                  <Button onClick={handleTrackFromModal} disabled={!trackingCode.trim()} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" /> Lacak
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nomor Pendaftaran</p>
                    <p className="font-semibold">{trackingResult.registration_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jenis</p>
                    <p className="font-semibold">{trackingResult.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-semibold">{new Date(trackingResult.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {getTrackingStatusBadge(trackingResult.status)}
                  </div>
                </div>
                {renderTrackingTimeline(trackingResult)}
                <Button variant="outline" onClick={() => { setTrackingResult(null); setTrackingCode(''); }} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Cari Lainnya
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        open={showServiceModal}
        onOpenChange={setShowServiceModal}
      />
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  )
}

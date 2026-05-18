'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  LogOut,
  Syringe,
  Stethoscope,
  Video,
  ClipboardCheck as AssessIcon,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  File,
  Plus,
  RefreshCw,
  Filter,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import VerifyModal from '@/components/admin/verify-modal'
import ScheduleInspectionModal from '@/components/admin/schedule-modal'
import AssessModal from '@/components/admin/assess-modal'
import DeleteModal from '@/components/admin/delete-modal'
import CreateUserModal from '@/components/admin/create-user-modal'
import DeleteUserModal from '@/components/admin/delete-user-modal'
import RegistrationDetailModal from '@/components/registration-detail-modal'
import type { RegistrationStatus, Profile, NKVRegistration, DokterHewanRegistration, VeterinaryRegistration } from '@/lib/types'

type Registration = (NKVRegistration & { type: 'NKV' }) | (DokterHewanRegistration & { type: 'Dokter Hewan' }) | (VeterinaryRegistration & { type: 'Veterinary' })

type AdminRegistration = {
  id: string
  registration_number: string
  status: RegistrationStatus
  created_at: string
  type: 'NKV' | 'Dokter Hewan' | 'Veterinary'
  applicant_name: string
  email: string
  phone: string
  tracking_logs?: Array<{ id: string; status: string; created_at: string }>
}

type ServiceTab = 'all' | 'NKV' | 'Dokter Hewan' | 'Veterinary'

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

const TYPE_COLORS: Record<string, string> = {
  NKV: 'bg-blue-50 text-blue-700 border-blue-200',
  'Dokter Hewan': 'bg-green-50 text-green-700 border-green-200',
  Veterinary: 'bg-amber-50 text-amber-700 border-amber-200',
}

function getStatusBadge(status: RegistrationStatus) {
  return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
}

function getTypeBadge(type: string) {
  return <Badge variant="outline" className={TYPE_COLORS[type] || 'bg-gray-50 text-gray-700'}>{type}</Badge>
}

export default function AdminPage() {
  const router = useRouter()

  // ── Data ──
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [dailyStats, setDailyStats] = useState<any>(null)

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')
  const [serviceTab, setServiceTab] = useState<ServiceTab>('all')

  // ── Selection ──
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  // ── Verify modal ──
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | 'request_revision'>('approve')
  const [verifyReg, setVerifyReg] = useState<AdminRegistration | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Schedule modal ──
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleReg, setScheduleReg] = useState<AdminRegistration | null>(null)
  const [scheduling, setScheduling] = useState(false)

  // ── Assess modal ──
  const [assessOpen, setAssessOpen] = useState(false)
  const [assessReg, setAssessReg] = useState<AdminRegistration | null>(null)
  const [assessing, setAssessing] = useState(false)

  // ── Delete modal ──
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteReg, setDeleteReg] = useState<AdminRegistration | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Create user modal ──
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)

  // ── Delete user modal ──
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null)
  const [deletingUser, setDeletingUser] = useState(false)

  // ── View mode: dashboard | applications | users ──
  const [viewMode, setViewMode] = useState<'dashboard' | 'applications' | 'users'>('dashboard')

  // ─────────────────────────────────────────────────────
  // Data fetch
  // ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [regRes, whoamiRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/applications'),
        fetch('/api/admin/whoami'),
        fetch('/api/admin/users'),
        fetch('/api/admin/daily-stats').catch(() => ({ ok: false } as Response)),
      ])

      if (regRes.ok) {
        const data = await regRes.json()
        setRegistrations(Array.isArray(data) ? data : [])
      } else {
        setError('Gagal memuat data permohonan')
      }

      if (whoamiRes.ok) {
        const data = await whoamiRes.json()
        setUserEmail(data.user?.email || 'Admin')
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(Array.isArray(data) ? data : [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setDailyStats(data)
      }
    } catch {
      setError('Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: registrations.length,
      submitted: registrations.filter(r => r.status === 'submitted').length,
      document_verification: registrations.filter(r => r.status === 'document_verification').length,
      field_inspection: registrations.filter(r => r.status === 'field_inspection').length,
      assessment: registrations.filter(r => r.status === 'assessment').length,
      approved: registrations.filter(r => r.status === 'approved').length,
      rejected: registrations.filter(r => r.status === 'rejected' || r.status === 'revision_requested').length,
      nkv: registrations.filter(r => r.type === 'NKV').length,
      dokter: registrations.filter(r => r.type === 'Dokter Hewan').length,
      veterinary: registrations.filter(r => r.type === 'Veterinary').length,
      needsAction: registrations.filter(r => ['submitted', 'document_verification', 'revision_requested'].includes(r.status as any)).length,
    }
  }, [registrations])

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = !searchQuery ||
        reg.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
      const matchesType = serviceTab === 'all' || reg.type === serviceTab
      return matchesSearch && matchesStatus && matchesType
    })
  }, [registrations, searchQuery, statusFilter, serviceTab])

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      !searchQuery ||
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [users, searchQuery])

  // ─────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────
  const openDetailModal = async (reg: AdminRegistration) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat detail')

      let fullReg: Registration | null = null
      if (data.regType === 'NKV') fullReg = { ...data, type: 'NKV' as const }
      else if (data.regType === 'Dokter Hewan') fullReg = { ...data, type: 'Dokter Hewan' as const }
      else if (data.regType === 'Veterinary') fullReg = { ...data, type: 'Veterinary' as const }

      if (fullReg) { setSelectedReg(fullReg); setShowDetailModal(true) }
      else alert('Data permohonan tidak ditemukan')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memuat detail permohonan')
    } finally {
      setDetailLoading(false)
    }
  }

  // — Verify —
  const openVerifyModal = (reg: AdminRegistration, action: 'approve' | 'reject' | 'request_revision') => {
    setVerifyReg(reg); setVerifyAction(action); setVerifyOpen(true)
  }
  const handleVerify = async (notes: string) => {
    if (!verifyReg) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/registrations/${verifyReg.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: verifyAction,
          notes,
          status: verifyAction === 'approve' ? 'document_verification'
               : verifyAction === 'request_revision' ? 'revision_requested'
               : 'rejected',
        }),
      })
      if (res.ok) { setVerifyOpen(false); fetchData() }
      else { const err = await res.json(); alert(err.error || 'Gagal melakukan verifikasi') }
    } catch { alert('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  // — Schedule —
  const openScheduleModal = (reg: AdminRegistration) => {
    setScheduleReg(reg); setScheduleOpen(true)
  }
  const handleSchedule = async ({ scheduled_date, scheduled_time, location, notes }: { scheduled_date: string; scheduled_time: string; location: string; notes: string }) => {
    if (!scheduleReg) return
    setScheduling(true)
    try {
      const res = await fetch(`/api/admin/registrations/${scheduleReg.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_date, scheduled_time, location, notes }),
      })
      if (res.ok) { setScheduleOpen(false); fetchData(); alert('Pemeriksaan lapangan berhasil dijadwalkan') }
      else { const err = await res.json(); alert(err.error || 'Gagal menjadwalkan') }
    } catch { alert('Terjadi kesalahan') }
    finally { setScheduling(false) }
  }

  // — Assess —
  const openAssessModal = (reg: AdminRegistration) => {
    setAssessReg(reg); setAssessOpen(true)
  }
  const handleAssess = async ({ assessment_score, assessment_notes, recommendation_file_url }: { assessment_score: number; assessment_notes: string; recommendation_file_url: string }) => {
    if (!assessReg) return
    setAssessing(true)
    try {
      const res = await fetch(`/api/admin/registrations/${assessReg.id}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_score: assessment_score < 75 ? assessment_score : assessment_score, assessment_notes: assessment_notes, recommendation_file_url: recommendation_file_url || null }),
      })
      if (res.ok) { setAssessOpen(false); fetchData(); const data = await res.json(); alert(data.status === 'approved' ? `Disetujui — skor ${assessment_score}` : `Ditolak — skor ${assessment_score}`) }
      else { const err = await res.json(); alert(err.error || 'Gagal melakukan penilaian') }
    } catch { alert('Terjadi kesalahan') }
    finally { setAssessing(false) }
  }

  // — Delete —
  const openDeleteModal = (reg: AdminRegistration) => {
    setDeleteReg(reg); setDeleteOpen(true)
  }
  const handleDelete = async () => {
    if (!deleteReg) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/registrations/${deleteReg.id}`, { method: 'DELETE' })
      if (res.ok) { setDeleteOpen(false); fetchData() }
      else { const err = await res.json(); alert(err.error || 'Gagal menghapus') }
    } catch { alert('Terjadi kesalahan') }
    finally { setDeleting(false) }
  }

  // — User create / delete —
  const handleCreateUser = async ({ email, password, fullName, role }: { email: string; password: string; fullName: string; role: 'user' | 'admin' }) => {
    setCreatingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role }),
      })
      if (res.ok) { setCreateUserOpen(false); fetchData(); alert('Pengguna berhasil dibuat') }
      else { const err = await res.json(); alert(err.error || 'Gagal membuat pengguna') }
    } catch { alert('Terjadi kesalahan') }
    finally { setCreatingUser(false) }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return
    setDeletingUser(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' })
      if (res.ok) { setDeleteUserOpen(false); fetchData(); alert('Pengguna berhasil dihapus') }
      else { const err = await res.json(); alert(err.error || 'Gagal menghapus pengguna') }
    } catch { alert('Terjadi kesalahan') }
    finally { setDeletingUser(false) }
  }

  const openDeleteUserModal = (user: Profile) => { setDeleteUser(user); setDeleteUserOpen(true) }

  // ─────────────────────────────────────────────────────
  // View helpers
  // ─────────────────────────────────────────────────────
  const actionButtons = (reg: AdminRegistration) => (
    <div className="flex items-center gap-1 flex-wrap">
      <Button variant="outline" size="sm" onClick={() => openDetailModal(reg)} disabled={detailLoading} className="h-7 text-xs">
        <Eye className="h-3 w-3 mr-1" /> Detail
      </Button>
      {reg.status === 'submitted' && (
        <Button size="sm" onClick={() => openVerifyModal(reg, 'approve')} className="h-7 text-xs bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-3 w-3 mr-1" /> Verifikasi
        </Button>
      )}
      {reg.status === 'document_verification' && (
        <>
          <Button variant="outline" size="sm" onClick={() => openVerifyModal(reg, 'approve')} className="h-7 text-xs bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Setujui
          </Button>
          <Button variant="outline" size="sm" onClick={() => openScheduleModal(reg)} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <Calendar className="h-3 w-3 mr-1" /> Jadwal
          </Button>
        </>
      )}
      {(reg.status === 'field_inspection' || reg.status === 'assessment') && (
        <Button size="sm" onClick={() => openAssessModal(reg)} className="h-7 text-xs bg-purple-600 hover:bg-purple-700">
          <AssessIcon className="h-3 w-3 mr-1" /> Penilaian
        </Button>
      )}
      {reg.status !== 'draft' && reg.status !== 'approved' && reg.status !== 'rejected' && (
        <Button variant="outline" size="sm" onClick={() => openVerifyModal(reg, 'request_revision')} className="h-7 text-xs text-yellow-600 border-yellow-300">
          <RefreshCw className="h-3 w-3 mr-1" /> Revisi
        </Button>
      )}
      {reg.status !== 'approved' && reg.status !== 'rejected' && reg.status !== 'draft' && (
        <Button variant="outline" size="sm" onClick={() => openVerifyModal(reg, 'reject')} className="h-7 text-xs text-red-600 border-red-300">
          <XCircle className="h-3 w-3 mr-1" /> Tolak
        </Button>
      )}
      {reg.status === 'draft' && (
        <Button variant="destructive" size="sm" onClick={() => openDeleteModal(reg)} className="h-7 text-xs">
          <Trash2 className="h-3 w-3 mr-1" /> Hapus
        </Button>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────
  // Render table / user table
  // ─────────────────────────────────────────────────────
  const renderRegistrationsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Semua Permohonan</CardTitle>
        <CardDescription>{filteredRegistrations.length} dari {registrations.length} permohonan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 text-red-400" />
            <p>{error}</p>
            <Button onClick={fetchData} className="mt-3" size="sm">Coba Lagi</Button>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada permohonan yang sesuai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Registrasi</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map(reg => (
                  <TableRow key={reg.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">{reg.registration_number}</TableCell>
                    <TableCell>{getTypeBadge(reg.type)}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{reg.applicant_name}</p>
                      <p className="text-xs text-gray-500">{reg.email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{new Date(reg.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{getStatusBadge(reg.status)}</TableCell>
                    <TableCell className="text-right">{actionButtons(reg)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderUsersTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pengguna</CardTitle>
        <CardDescription>{filteredUsers.length} dari {users.length} pengguna</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada pengguna</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-sm">{user.full_name || 'Tanpa Nama'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                        {user.role === 'admin' ? 'Admin' : 'Pengguna'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'admin' ? (
                        <Button variant="destructive" size="sm" onClick={() => openDeleteUserModal(user)} className="h-7 text-xs">
                          <Trash2 className="h-3 w-3 mr-1" /> Hapus
                        </Button>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // ─────────────────────────────────────────────────────
  // Sidebar
  // ─────────────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications' as const, label: 'Semua Permohonan', icon: FileText },
    { id: 'users' as const, label: 'Daftar Pengguna', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 -translate-x-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 h-14 px-5 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin VetSys</span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  viewMode === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}

            <div className="my-2 border-t border-gray-200" />
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Layanan</p>

            <button onClick={() => router.push('/admin/vaccinations')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Syringe className="h-4 w-4 text-green-600" /> Vaksinasi
            </button>
            <button onClick={() => router.push('/admin/treatments')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Stethoscope className="h-4 w-4 text-yellow-600" /> Pengobatan
            </button>
            <button onClick={() => router.push('/admin/consultations')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Video className="h-4 w-4 text-purple-600" /> Konsultasi
            </button>
            <button onClick={() => router.push('/admin/verification')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <File className="h-4 w-4" /> Verifikasi NKV &amp; Praktek
            </button>
          </nav>

          <div className="px-3 py-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                {userEmail.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/logout')} className="w-full text-red-600 hover:bg-red-50 justify-start h-8 text-xs">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60">
        {/* Mobile header */}
        <header className="bg-white border-b border-gray-200 lg:hidden h-14 px-4 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">Admin VetSys</span>
          <Button variant="ghost" size="sm" onClick={() => router.push('/logout')} className="text-red-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <div className="p-4 lg:p-8">
          {/* Dashboard View */}
          {viewMode === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-500 text-sm mt-0.5">Ringkasan sistem rekomendasi online</p>
              </div>

              {/* Need-action alert */}
              {stats.needsAction > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="py-3 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800"><strong>{stats.needsAction}</strong> permohonan membutuhkan tindakan Anda.</p>
                  </CardContent>
                </Card>
              )}

              {/* Service stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Rekomendasi NKV</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold text-gray-900">{stats.nkv}</div><p className="text-xs text-gray-500">total permohonan</p></CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Rekomendasi Praktek Dokter</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold text-gray-900">{stats.dokter}</div><p className="text-xs text-gray-500">total permohonan</p></CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Pelayanan Kesehatan Hewan</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold text-gray-900">{stats.veterinary}</div><p className="text-xs text-gray-500">total permohonan</p></CardContent>
                </Card>
              </div>

              {/* Quick status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Diajukan', count: stats.submitted, color: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Verifikasi', count: stats.document_verification, color: 'text-yellow-700', bg: 'bg-yellow-50' },
                  { label: 'Sedang Diproses', count: stats.field_inspection + stats.assessment, color: 'text-purple-700', bg: 'bg-purple-50' },
                  { label: 'Disetujui', count: stats.approved, color: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Ditolak / Revisi', count: stats.rejected, color: 'text-red-700', bg: 'bg-red-50' },
                ].map(s => (
                  <Card key={s.label} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4">
                      <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                      <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Applications View */}
          {viewMode === 'applications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Semua Permohonan</h1>
                  <p className="text-gray-500 text-sm">Kelola dan verifikasi semua aplikasi</p>
                </div>
              </div>

              {/* Service type tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {([{ key: 'NKV', label: 'NKV' }, { key: 'Dokter Hewan', label: 'Praktek' }, { key: 'Veterinary', label: 'Hewan' }] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setServiceTab(tab.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      serviceTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Cari nomor registrasi, nama, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 text-sm" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[160px]"
                    >
                      <option value="all">Semua Status</option>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {renderRegistrationsTable()}
            </div>
          )}

          {/* Users View */}
          {viewMode === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Daftar Pengguna</h1>
                  <p className="text-gray-500 text-sm">Kelola akun dan hak akses</p>
                </div>
                <Button size="sm" onClick={() => setCreateUserOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1.5" /> Tambah
                </Button>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Cari nama atau email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 text-sm" />
                  </div>
                </CardContent>
              </Card>

              {renderUsersTable()}
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      <VerifyModal
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        regNumber={verifyReg?.registration_number || ''}
        action={verifyAction}
        onConfirm={handleVerify}
        loading={submitting}
      />

      <ScheduleInspectionModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        regNumber={scheduleReg?.registration_number || ''}
        onConfirm={handleSchedule}
        loading={scheduling}
      />

      <AssessModal
        open={assessOpen}
        onOpenChange={setAssessOpen}
        regNumber={assessReg?.registration_number || ''}
        onConfirm={handleAssess}
        loading={assessing}
      />

      <DeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        regNumber={deleteReg?.registration_number || ''}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <CreateUserModal
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onConfirm={handleCreateUser}
        loading={creatingUser}
      />

       {showDetailModal && selectedReg && (
         <RegistrationDetailModal
           isOpen={showDetailModal}
           onClose={() => { setShowDetailModal(false); setSelectedReg(null) }}
           registration={selectedReg}
           onUpdate={fetchData}
           onDelete={fetchData}
           onResubmit={fetchData}
         />
       )}

      <DeleteUserModal
        open={deleteUserOpen}
        onOpenChange={setDeleteUserOpen}
        user={deleteUser}
        onConfirm={handleDeleteUser}
        loading={deletingUser}
      />
    </div>
  )
}

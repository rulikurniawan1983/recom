'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Eye,
  MoreVertical,
  LayoutDashboard,
  ListFilter
} from 'lucide-react'

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

interface Registration {
  id: string
  registration_number: string
  type: 'NKV' | 'Dokter Hewan'
  status: string
  created_at: string
  applicant_name: string
  email?: string
  phone?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard')

  const fetchRegistrations = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/applications')
      if (response.ok) {
        const data = await response.json()
        setRegistrations(Array.isArray(data) ? data : [])
      } else {
        const err = await response.json()
        setError(err.error || 'Gagal memuat data permohonan')
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
      setError('Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function load() {
      await fetchRegistrations()
    }
    load()
  }, [])

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    const matchesType = typeFilter === 'all' || reg.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: registrations.length,
    approved: registrations.filter(r => r.status === 'approved').length,
    inProgress: registrations.filter(r => !['approved', 'rejected'].includes(r.status)).length,
    revision: registrations.filter(r => r.status === 'revision_requested').length,
    submitted: registrations.filter(r => r.status === 'submitted').length,
    verification: registrations.filter(r => r.status === 'document_verification').length,
    inspection: registrations.filter(r => r.status === 'field_inspection').length,
    assessment: registrations.filter(r => r.status === 'assessment').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-blue-600 text-lg">Memuat data dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchRegistrations} className="bg-blue-600 hover:bg-blue-700">
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-900">Dashboard Admin</h1>
            <p className="text-sm text-blue-700">Sistem Rekomendasi Veteriner</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('dashboard')}
                className={viewMode === 'dashboard' ? 'bg-blue-600' : ''}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-blue-600' : ''}
              >
                <ListFilter className="w-4 h-4 mr-2" />
                Tabel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'dashboard' ? (
          <>
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

            {/* Secondary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-blue-200 bg-white/80">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-blue-900">{stats.submitted}</p>
                  <p className="text-xs text-blue-600">Diajukan</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-white/80">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-yellow-900">{stats.verification}</p>
                  <p className="text-xs text-yellow-600">Verifikasi Dokumen</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-white/80">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-purple-900">{stats.inspection}</p>
                  <p className="text-xs text-purple-600">Pemeriksaan Lapangan</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-white/80">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-orange-900">{stats.assessment}</p>
                  <p className="text-xs text-orange-600">Penilaian</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Permohonan Terbaru</h3>
              {registrations.length === 0 ? (
                <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
                  <CardContent className="pt-6 text-center py-12">
                    <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-600">Belum ada permohonan</p>
                    <p className="text-sm text-blue-500 mt-1">Data akan muncul setelah ada pendaftaran baru</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {registrations.slice(0, 10).map((reg) => (
                    <Card key={reg.id} className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm text-blue-900">{reg.registration_number}</p>
                            <p className="text-xs text-blue-600">
                              {reg.type} • {reg.applicant_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(reg.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
                            {STATUS_LABELS[reg.status] || reg.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Table View */
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900 text-2xl">Daftar Permohonan</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                  <Input
                    placeholder="Cari nomor registrasi atau nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <span className="mr-2">⚡</span>
                      Status: {statusFilter === 'all' ? 'Semua' : STATUS_LABELS[statusFilter]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      Semua Status
                    </DropdownMenuItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <DropdownMenuItem key={value} onClick={() => setStatusFilter(value)}>
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <span className="mr-2">📁</span>
                      Jenis: {typeFilter === 'all' ? 'Semua' : typeFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                      Semua Jenis
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('NKV')}>
                      Hanya NKV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('Dokter Hewan')}>
                      Hanya Dokter Hewan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-900">No. Registrasi</TableHead>
                      <TableHead className="text-blue-900">Jenis</TableHead>
                      <TableHead className="text-blue-900">Pemohon</TableHead>
                      <TableHead className="text-blue-900">Tanggal</TableHead>
                      <TableHead className="text-blue-900">Status</TableHead>
                      <TableHead className="text-blue-900 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-lg">Tidak ada data permohonan</p>
                            <p className="text-sm">
                              {registrations.length === 0
                                ? 'Belum ada permohonan terdaftar dalam sistem.'
                                : 'Tidak ada hasil yang sesuai dengan filter.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <TableRow key={reg.id} className="hover:bg-blue-50/50">
                          <TableCell className="font-mono text-sm">{reg.registration_number}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reg.type === 'NKV' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {reg.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{reg.applicant_name}</p>
                              <p className="text-xs text-gray-500">{reg.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(reg.created_at).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status]}`}>
                              {STATUS_LABELS[reg.status] || reg.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/tracking/${reg.registration_number}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/admin/verification?registration=${reg.registration_number}`)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Verifikasi
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

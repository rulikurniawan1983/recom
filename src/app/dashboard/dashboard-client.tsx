'use client';

import { useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RegistrationDetailModal from '@/components/registration-detail-modal';
import type { Profile, NKVRegistration, DokterHewanRegistration, RegistrationStatus } from '@/lib/types';

type Registration = (NKVRegistration & { type: 'NKV' }) | (DokterHewanRegistration & { type: 'Dokter Hewan' });

interface DashboardClientProps {
  user: User;
  profile: Profile | null;
  nkvRegistrations: NKVRegistration[];
  dokterRegistrations: DokterHewanRegistration[];
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
};

const STATUS_COLORS: Record<RegistrationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  document_verification: 'bg-yellow-100 text-yellow-800',
  field_inspection: 'bg-purple-100 text-purple-800',
  assessment: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_requested: 'bg-red-100 text-red-800',
};

export default function DashboardClient({ user, profile, nkvRegistrations, dokterRegistrations }: DashboardClientProps) {
  const router = useRouter();
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'NKV' | 'Dokter Hewan'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const allRegistrations: Registration[] = useMemo(() => {
    const registrations = [
      ...nkvRegistrations.map(r => ({ ...r, type: 'NKV' as const })),
      ...dokterRegistrations.map(r => ({ ...r, type: 'Dokter Hewan' as const }))
    ];
    return registrations.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [nkvRegistrations, dokterRegistrations]);

  const filteredRegistrations = useMemo(() => {
    return allRegistrations.filter(reg => {
      const matchesSearch = searchQuery === '' || 
        reg.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reg.type === 'NKV' && reg.business_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reg.type === 'Dokter Hewan' && reg.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      const matchesType = typeFilter === 'all' || reg.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allRegistrations, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = allRegistrations.length;
    const draft = allRegistrations.filter(r => r.status === 'draft').length;
    const submitted = allRegistrations.filter(r => r.status === 'submitted').length;
    const processing = allRegistrations.filter(r => 
      ['document_verification', 'field_inspection', 'assessment'].includes(r.status)
    ).length;
    const approved = allRegistrations.filter(r => r.status === 'approved').length;
    const rejected = allRegistrations.filter(r => r.status === 'rejected' || r.status === 'revision_requested').length;

    return { total, draft, submitted, processing, approved, rejected };
  }, [allRegistrations]);

  const handleUpdateRegistration = async () => {
    router.refresh();
  };

  const handleDeleteRegistration = async () => {
    router.refresh();
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    return (
      <Badge variant="secondary" className={STATUS_COLORS[status]}>
        {STATUS_LABELS[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">VetSys</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700"
            >
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <Link
              href="/nkv/register"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
              Permohonan NKV
            </Link>
            <Link
              href="/dokter-hewan/register"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
              Praktek Dokter Hewan
            </Link>
            <Link
              href="/tracking"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
              Lacak Permohonan
            </Link>
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/logout')}
              className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">VetSys</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Selamat datang, {profile?.full_name?.split(' ')[0] || 'User'}! Kelola dan pantau permohonan rekomendasi Anda.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Permohonan</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <p className="text-xs text-gray-500 mt-1">Semua permohonan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
                <Clock className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                <p className="text-xs text-gray-500 mt-1">Belum diajukan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Diproses</CardTitle>
                <Activity className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.processing}</div>
                <p className="text-xs text-gray-500 mt-1">Dalam verifikasi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Disetujui</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
                <p className="text-xs text-gray-500 mt-1">Selesai</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <a
              href="/nkv/register"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Permohonan NKV Baru
            </a>
            <a
              href="/dokter-hewan/register"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 h-10 px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Praktek Dokter Hewan Baru
            </a>
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3"
              >
                Tabel
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="px-3"
              >
                Kartu
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nomor registrasi, nama usaha, atau nama lengkap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Diajukan</option>
                <option value="document_verification">Verifikasi Dokumen</option>
                <option value="field_inspection">Pemeriksaan Lapangan</option>
                <option value="assessment">Penilaian</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="revision_requested">Perlu Revisi</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'NKV' | 'Dokter Hewan')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="all">Semua Jenis</option>
                <option value="NKV">NKV</option>
                <option value="Dokter Hewan">Dokter Hewan</option>
              </select>
            </div>
          </div>

          {/* Registration List - Table View */}
          {viewMode === 'table' ? (
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Permohonan</CardTitle>
                <CardDescription>
                  {filteredRegistrations.length} permohonan ditemukan
                </CardDescription>
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
                                <p className="font-semibold text-gray-900">
                                  {reg.registration_number}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {reg.type === 'NKV' ? reg.business_name : reg.full_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                {reg.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(reg.created_at).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(reg.status)}
                            </TableCell>
                            <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRegistration(reg)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            {(reg.status === 'draft' || reg.status === 'submitted') && (
                              <>
                                <DropdownMenuItem onClick={() => setSelectedRegistration(reg)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Permohonan
                                </DropdownMenuItem>
                                {reg.status === 'draft' && (
                                  <DropdownMenuItem 
                                    onClick={() => setSelectedRegistration(reg)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Permohonan
                                  </DropdownMenuItem>
                                )}
                              </>
                             )}
                             {reg.recommendation_file_url && reg.status === 'approved' && (
                               <div
                                 onClick={() => {
                                   window.open(reg.recommendation_file_url!, '_blank', 'noopener,noreferrer');
                                 }}
                                 className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                               >
                                 <Download className="h-4 w-4 mr-2" />
                                 Unduh Rekomendasi
                               </div>
                             )}
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
          ) : (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegistrations.length === 0 ? (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 mb-2">Belum ada permohonan.</p>
                      <a
                        href="/nkv/register"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Buat Permohonan Baru
                      </a>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredRegistrations.map((reg) => (
                  <Card key={reg.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {reg.registration_number}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {reg.type} • {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRegistration(reg)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            {(reg.status === 'draft' || reg.status === 'submitted') && (
                              <>
                                <DropdownMenuItem onClick={() => setSelectedRegistration(reg)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Permohonan
                                </DropdownMenuItem>
                                {reg.status === 'draft' && (
                                  <DropdownMenuItem 
                                    onClick={() => setSelectedRegistration(reg)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Permohonan
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {reg.recommendation_file_url && reg.status === 'approved' && (
                              <div
                                onClick={() => {
                                  window.open(reg.recommendation_file_url!, '_blank', 'noopener,noreferrer');
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Unduh Rekomendasi
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">
                            {reg.type === 'NKV' ? reg.business_name : reg.full_name}
                          </span>
                          {getStatusBadge(reg.status)}
                        </div>
                        {reg.tracking_logs && reg.tracking_logs.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                                Update: {STATUS_LABELS[reg.tracking_logs[0].status as RegistrationStatus]} • {new Date(reg.tracking_logs[0].created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRegistration(reg)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                          {reg.status === 'draft' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setSelectedRegistration(reg)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Hapus
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <RegistrationDetailModal
          isOpen={true}
          onClose={() => setSelectedRegistration(null)}
          registration={selectedRegistration}
          onUpdate={handleUpdateRegistration}
          onDelete={handleDeleteRegistration}
        />
      )}
    </div>
  );
}

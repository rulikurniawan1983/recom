'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
 import { 
   BarChart3, 
   CheckCircle, 
   Clock, 
   XCircle, 
   FileText, 
   Eye,
   MoreVertical,
   Trash2,
   LayoutDashboard,
   ListFilter,
   AlertCircle,
   LogOut,
   Shield,
   File,
   Users,
   X,
   Menu,
   Search,
   Calendar,
   ClipboardCheck
 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RegistrationStatus, Profile } from '@/lib/types';

type AdminRegistration = {
  id: string;
  registration_number: string;
  status: RegistrationStatus;
  created_at: string;
  type: 'NKV' | 'Dokter Hewan';
  applicant_name: string;
  email: string;
  phone: string;
};

interface Document {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  verified?: boolean;
  verified_at?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  admin_notes?: string;
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

const TYPE_COLORS: Record<string, string> = {
  'NKV': 'bg-blue-50 text-blue-700 border-blue-200',
  'Dokter Hewan': 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'NKV' | 'Dokter Hewan'>('all');
  const [viewMode, setViewMode] = useState<'dashboard' | 'table' | 'users'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<AdminRegistration | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
   const [documentsTab, setDocumentsTab] = useState('documents');
   const [showDocumentsModal, setShowDocumentsModal] = useState(false);

   // Document action modals
   const [docActionOpen, setDocActionOpen] = useState(false);
   const [actionDoc, setActionDoc] = useState<Document | null>(null);
   const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision'>('approve');
   const [actionNotes, setActionNotes] = useState('');
   const [updatingDoc, setUpdatingDoc] = useState(false);

   // Inspection scheduling
   const [scheduleOpen, setScheduleOpen] = useState(false);
   const [scheduleDate, setScheduleDate] = useState('');
   const [scheduleTime, setScheduleTime] = useState('');
   const [scheduleLocation, setScheduleLocation] = useState('');
   const [scheduleNotes, setScheduleNotes] = useState('');
   const [scheduling, setScheduling] = useState(false);

   // Assessment
   const [assessOpen, setAssessOpen] = useState(false);
   const [assessmentScore, setAssessmentScore] = useState<number>(0);
   const [assessmentNotes, setAssessmentNotes] = useState('');
   const [recommendationFileUrl, setRecommendationFileUrl] = useState('');
   const [assessing, setAssessing] = useState(false);

   // Document preview
   const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
   const [previewOpen, setPreviewOpen] = useState(false);

  // User creation modal
   const [createUserOpen, setCreateUserOpen] = useState(false);
   const [creatingUser, setCreatingUser] = useState(false);

   const [newUserEmail, setNewUserEmail] = useState('');
   const [newUserName, setNewUserName] = useState('');
   const [newUserPassword, setNewUserPassword] = useState('');
   const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

   const [deleteUserOpen, setDeleteUserOpen] = useState(false);
   const [deletingUser, setDeletingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Verification modal
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | 'request_revision'>('approve');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // User email
  const [userEmail, setUserEmail] = useState<string>('admin@example.com');

  // Stats calculation
  const stats = useMemo(() => {
    const total = registrations.length;
    const draft = registrations.filter(r => r.status === 'draft').length;
    const submitted = registrations.filter(r => r.status === 'submitted').length;
    const documentVerification = registrations.filter(r => r.status === 'document_verification').length;
    const fieldInspection = registrations.filter(r => r.status === 'field_inspection').length;
    const assessment = registrations.filter(r => r.status === 'assessment').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected' || r.status === 'revision_requested').length;
    const revisionRequested = registrations.filter(r => r.status === 'revision_requested').length;
    
    return {
      total,
      draft,
      submitted,
      documentVerification,
      fieldInspection,
      assessment,
      approved,
      rejected,
      revisionRequested,
      inProgress: documentVerification + fieldInspection + assessment,
      needsAction: submitted + documentVerification + revisionRequested
    };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = searchQuery === '' ||
        reg.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.applicant_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      const matchesType = typeFilter === 'all' || reg.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [registrations, searchQuery, statusFilter, typeFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      searchQuery === '' ||
      (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Computed variants for view toggle buttons
  const dashboardVariant = viewMode === 'dashboard' ? 'default' : 'outline';
  const tableVariant = viewMode === 'table' ? 'default' : 'outline';

  const fetchData = useCallback(async () => {
    // Defer state updates to avoid synchronous setState in effect
    await new Promise(resolve => setTimeout(resolve, 0));
    setLoading(true);
    setError(null);
    try {
      const [regRes, userRes, usersRes] = await Promise.all([
        fetch('/api/admin/applications'),
        fetch('/api/admin/whoami'),
        fetch('/api/admin/users')
      ]);

      if (regRes.ok) {
        const data = await regRes.json();
        setRegistrations(Array.isArray(data) ? data : []);
      } else {
        setError('Gagal memuat data permohonan');
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUserEmail(data.user?.email || 'Admin');
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      }
    } catch {
      setError('Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  }, []); // end useCallback fetchData

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchDocuments = async (reg: AdminRegistration) => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail.trim() || !newUserName.trim() || !newUserPassword.trim()) {
      alert('Semua field harus diisi');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserName,
          role: newUserRole
        })
      });

      if (res.ok) {
        setCreateUserOpen(false);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPassword('');
        setNewUserRole('user');
        fetchData();
        alert('Pengguna berhasil dibuat');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal membuat pengguna');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setDeleteUserOpen(false);
        fetchData();
        alert('Pengguna berhasil dihapus');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus pengguna');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setDeletingUser(false);
    }
  };

   const openDeleteUserModal = (user: Profile) => {
     setSelectedUser(user);
     setDeleteUserOpen(true);
   };

   const openDocumentsModal = (reg: AdminRegistration) => {
     setSelectedReg(reg);
     setDocumentsTab('documents');
     fetchDocuments(reg);
     setShowDocumentsModal(true);
   };

   const openVerifyModal = (reg: AdminRegistration, action: 'approve' | 'reject' | 'request_revision') => {
     setSelectedReg(reg);
     setVerifyAction(action);
     setVerifyNotes('');
     setShowDocumentsModal(false); // Close documents modal if open
     setVerifyOpen(true);
   };

   const openDocActionModal = (doc: Document, action: 'approve' | 'reject' | 'revision') => {
     setActionDoc(doc);
     setActionType(action);
     setActionNotes('');
     setDocActionOpen(true);
   };

    const openDeleteModal = (reg: AdminRegistration) => {
      setSelectedReg(reg);
      setShowDocumentsModal(false); // Close documents modal if open
      setDeleteOpen(true);
    };

    const openScheduleModal = (reg: AdminRegistration) => {
      setSelectedReg(reg);
      // Pre-fill with reasonable defaults
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      setScheduleDate(tomorrow.toISOString().split('T')[0]);
      setScheduleTime('09:00');
      setScheduleLocation('');
      setScheduleNotes('');
      setScheduleOpen(true);
    };

    const openAssessModal = (reg: AdminRegistration) => {
      setSelectedReg(reg);
      setAssessmentScore(0);
      setAssessmentNotes('');
      setRecommendationFileUrl('');
      setAssessOpen(true);
    };

    const openDocPreview = (doc: Document) => {
      setPreviewDoc(doc);
      setPreviewOpen(true);
    };

   const handleVerification = async () => {
     if (!selectedReg) return;
     setSubmitting(true);
     try {
       const res = await fetch(`/api/admin/registrations/${selectedReg.id}/verify`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           action: verifyAction,
           notes: verifyNotes,
           status: verifyAction === 'approve' ? 'document_verification' :
                  verifyAction === 'request_revision' ? 'revision_requested' : 'rejected'
         })
       });

       if (res.ok) {
         setVerifyOpen(false);
         fetchData();
       } else {
         const err = await res.json();
         alert(err.error || 'Gagal melakukan verifikasi');
       }
     } catch (err) {
       alert('Terjadi kesalahan');
     } finally {
       setSubmitting(false);
     }
   };

    const handleDocAction = async () => {
      if (!actionDoc || !selectedReg) return;
      setUpdatingDoc(true);
      try {
        const newStatus = actionType === 'approve' ? 'approved' :
                          actionType === 'reject' ? 'rejected' : 'revision_requested';

        const res = await fetch(`/api/admin/registrations/${selectedReg.id}/documents/${actionDoc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            notes: actionNotes
          })
        });

        if (res.ok) {
          setDocActionOpen(false);
          // Refresh documents list
          fetchDocuments(selectedReg);
          fetchData();
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal memperbarui dokumen');
        }
      } catch (err) {
        alert('Terjadi kesalahan');
      } finally {
        setUpdatingDoc(false);
      }
    };

    const handleSchedule = async () => {
      if (!selectedReg) return;
      setScheduling(true);
      try {
        const res = await fetch(`/api/admin/registrations/${selectedReg.id}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduled_date: scheduleDate,
            scheduled_time: scheduleTime,
            location: scheduleLocation,
            notes: scheduleNotes
          })
        });

        if (res.ok) {
          setScheduleOpen(false);
          fetchData();
          alert('Pemeriksaan lapangan berhasil dijadwalkan');
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal menjadwalkan pemeriksaan');
        }
      } catch (err) {
        alert('Terjadi kesalahan');
      } finally {
        setScheduling(false);
      }
    };

    const handleAssess = async () => {
      if (!selectedReg) return;
      if (assessmentScore < 0 || assessmentScore > 100) {
        alert('Skor penilaian harus antara 0-100');
        return;
      }
      if (!assessmentNotes.trim()) {
        alert('Catatan penilaian wajib diisi');
        return;
      }

      setAssessing(true);
      try {
        const res = await fetch(`/api/admin/registrations/${selectedReg.id}/assess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessment_score: assessmentScore,
            assessment_notes: assessmentNotes,
            recommendation_file_url: recommendationFileUrl || null
          })
        });

        if (res.ok) {
          setAssessOpen(false);
          fetchData();
          const result = await res.json();
          alert(result.status === 'approved' 
            ? `Permohonan disetujui dengan skor ${assessmentScore}` 
            : `Permohonan ditolak dengan skor ${assessmentScore}`);
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal melakukan penilaian');
        }
      } catch (err) {
        alert('Terjadi kesalahan');
      } finally {
        setAssessing(false);
      }
    };

  const handleDelete = async () => {
    if (!selectedReg) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/registrations/${selectedReg.id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setDeleteOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus permohonan');
      }
      } catch {
        alert('Terjadi kesalahan');
      } finally {
      setDeleting(false);
    }
  };

   const getStatusBadge = (status: RegistrationStatus) => {
     return (
       <Badge variant="secondary" className={STATUS_COLORS[status]}>
         {STATUS_LABELS[status]}
       </Badge>
     );
   };

   const getTypeBadge = (type: string) => {
     return (
       <Badge variant="outline" className={TYPE_COLORS[type] || 'bg-gray-50 text-gray-700'}>
         {type}
       </Badge>
     );
   };

   const getDocStatusBadge = (status?: string) => {
     const safeStatus = status || 'pending';
     const colors: Record<string, string> = {
       pending: 'bg-yellow-100 text-yellow-800',
       approved: 'bg-green-100 text-green-800',
       rejected: 'bg-red-100 text-red-800',
       revision_requested: 'bg-orange-100 text-orange-800',
     };
     const labels: Record<string, string> = {
       pending: 'Menunggu',
       approved: 'Disetujui',
       rejected: 'Ditolak',
       revision_requested: 'Perlu Revisi',
     };
     return (
       <Badge variant="secondary" className={colors[safeStatus] || 'bg-gray-100 text-gray-800'}>
         {labels[safeStatus] || safeStatus}
       </Badge>
     );
   };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ListFilter className="h-5 w-5" />
              Semua Permohonan
            </button>
            <button
              onClick={() => setViewMode('users')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'users' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              Kelola Pengguna
            </button>
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {userEmail?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/logout')}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Dashboard View */}
          {viewMode === 'dashboard' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Dashboard Admin
                </h1>
                <p className="text-gray-600 mt-1">
                  Ringkasan sistem rekomendasi online
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Permohonan</CardTitle>
                    <FileText className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    <p className="text-xs text-gray-500 mt-1">Semua aplikasi</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Perlu Verifikasi</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats.submitted + stats.documentVerification}</div>
                    <p className="text-xs text-gray-500 mt-1">Diajukan & verifikasi dokumen</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Diproses</CardTitle>
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
                    <p className="text-xs text-gray-500 mt-1">Pemeriksaan & penilaian</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Disetujui</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
                    <p className="text-xs text-gray-500 mt-1">Selesai</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = registrations.filter(r => r.status === key).length;
                  return (
                    <Card key={key} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-900">{count}</div>
                        <p className="text-xs text-gray-600 truncate">{label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari nomor registrasi, nama, atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[160px]"
                      >
                        <option value="all">Semua Status</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
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
                </CardContent>
              </Card>

              {/* Applications List - Dashboard View */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Permohonan</CardTitle>
                  <CardDescription>
                    {filteredRegistrations.length} dari {registrations.length} permohonan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="space-y-4 p-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                          <div className="h-12 bg-gray-200 rounded w-full" />
                          <div className="h-12 bg-gray-200 rounded w-32" />
                          <div className="h-12 bg-gray-200 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-600">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
                      <p>{error}</p>
                      <Button onClick={fetchData} className="mt-4">
                        Coba Lagi
                      </Button>
                    </div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Tidak ada permohonan yang sesuai</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No. Registrasi</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telepon</TableHead>
                            <TableHead>Jenis</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRegistrations.map((reg) => (
                            <TableRow key={reg.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {reg.registration_number}
                              </TableCell>
                              <TableCell>{reg.applicant_name}</TableCell>
                              <TableCell>{reg.email}</TableCell>
                              <TableCell>{reg.phone}</TableCell>
                              <TableCell>
                                {getTypeBadge(reg.type)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(reg.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                     <DropdownMenuItem onClick={() => window.open(`/admin/registrations/${reg.id}`, '_blank')}>
                                       <Eye className="h-4 w-4 mr-2" />
                                       Lihat Detail
                                     </DropdownMenuItem>

                                     {reg.status === 'submitted' && (
                                       <DropdownMenuItem onClick={() => openVerifyModal(reg, 'approve')}>
                                         <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                         Verifikasi Dokumen
                                       </DropdownMenuItem>
                                     )}

                                     {reg.status === 'document_verification' && (
                                       <>
                                         <DropdownMenuItem onClick={() => openDocumentsModal(reg)}>
                                           <File className="h-4 w-4 mr-2 text-blue-600" />
                                           Lihat/Verifikasi Dokumen
                                         </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => openScheduleModal(reg)}>
                                           <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                           Jadwalkan Pemeriksaan Lapangan
                                         </DropdownMenuItem>
                                       </>
                                     )}

                                     {(reg.status === 'field_inspection' || reg.status === 'assessment') && (
                                       <DropdownMenuItem onClick={() => openAssessModal(reg)}>
                                         <ClipboardCheck className="h-4 w-4 mr-2 text-purple-600" />
                                         Input Penilaian
                                       </DropdownMenuItem>
                                     )}

                                     {reg.status !== 'draft' && reg.status !== 'approved' && reg.status !== 'rejected' && (
                                       <DropdownMenuItem onClick={() => openVerifyModal(reg, 'request_revision')}>
                                         <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                         Minta Revisi
                                       </DropdownMenuItem>
                                     )}

                                     {reg.status !== 'approved' && reg.status !== 'rejected' && reg.status !== 'draft' && (
                                       <DropdownMenuItem onClick={() => openVerifyModal(reg, 'reject')}>
                                         <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                         Tolak
                                       </DropdownMenuItem>
                                     )}

                                     {reg.status === 'draft' && (
                                       <DropdownMenuItem 
                                         onClick={() => openDeleteModal(reg)}
                                         className="text-red-600"
                                       >
                                         <Trash2 className="h-4 w-4 mr-2" />
                                         Hapus
                                       </DropdownMenuItem>
                                     )}
                                   </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Table View - All Applications */}
          {viewMode === 'table' && (
            <>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      Semua Permohonan
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Kelola dan verifikasi semua aplikasi
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={dashboardVariant}
                      size="sm"
                      onClick={() => setViewMode('dashboard')}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant={tableVariant}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      Tabel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari nomor registrasi, nama, atau usaha..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[160px]"
                      >
                        <option value="all">Semua Status</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
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
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Permohonan</CardTitle>
                  <CardDescription>
                    {filteredRegistrations.length} dari {registrations.length} permohonan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="space-y-4 p-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                          <div className="h-12 bg-gray-200 rounded w-full" />
                          <div className="h-12 bg-gray-200 rounded w-32" />
                          <div className="h-12 bg-gray-200 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-600">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
                      <p>{error}</p>
                      <Button onClick={fetchData} className="mt-4">
                        Coba Lagi
                      </Button>
                    </div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
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
                          {filteredRegistrations.map((reg) => (
                            <TableRow key={reg.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {reg.registration_number}
                              </TableCell>
                              <TableCell>
                                {getTypeBadge(reg.type)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {reg.applicant_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {reg.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {new Date(reg.created_at).toLocaleDateString('id-ID')}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(reg.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  {/* Always show "Lihat Detail" button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDocumentsModal(reg)}
                                    className="h-8"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Lihat Detail
                                  </Button>

                                  {/* Submitted – Verifikasi Dokumen */}
                                  {reg.status === 'submitted' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => openVerifyModal(reg, 'approve')}
                                      className="h-8 bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Verifikasi Dokumen
                                    </Button>
                                  )}

                                  {/* Document Verification – Actions for each document */}
                                  {reg.status === 'document_verification' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openDocumentsModal(reg)}
                                        className="h-8"
                                      >
                                        <File className="h-4 w-4 mr-1" />
                                        Dokumen
                                      </Button>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => openScheduleModal(reg)}
                                        className="h-8 bg-blue-600 hover:bg-blue-700"
                                      >
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Jadwalkan
                                      </Button>
                                    </>
                                  )}

                                  {/* Field Inspection / Assessment – Input Penilaian */}
                                  {(reg.status === 'field_inspection' || reg.status === 'assessment') && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => openAssessModal(reg)}
                                      className="h-8 bg-purple-600 hover:bg-purple-700"
                                    >
                                      <ClipboardCheck className="h-4 w-4 mr-1" />
                                      Input Penilaian
                                    </Button>
                                  )}

                                  {/* Minta Revisi – except draft/approved/rejected */}
                                  {reg.status !== 'draft' && reg.status !== 'approved' && reg.status !== 'rejected' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openVerifyModal(reg, 'request_revision')}
                                      className="h-8 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                    >
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Minta Revisi
                                    </Button>
                                  )}

                                  {/* Tolak – except final/draft */}
                                  {reg.status !== 'approved' && reg.status !== 'rejected' && reg.status !== 'draft' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openVerifyModal(reg, 'reject')}
                                      className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Tolak
                                    </Button>
                                  )}

                                  {/* Hapus – only for draft */}
                                  {reg.status === 'draft' && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => openDeleteModal(reg)}
                                      className="h-8"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Hapus
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Users View */}
          {viewMode === 'users' && (
            <>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      Kelola Pengguna
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Konfigurasi akun dan hak akses pengguna
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setCreateUserOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Tambah pengguna
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('dashboard')}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      Tabel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama atau email pengguna..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} dari {users.length} pengguna
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="space-y-4 p-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                          <div className="h-12 bg-gray-200 rounded w-full" />
                          <div className="h-12 bg-gray-200 rounded w-32" />
                          <div className="h-12 bg-gray-200 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Tidak ada pengguna yang ditemukan</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead>Perusahaan</TableHead>
                            <TableHead>Tanggal Daftar</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {user.full_name || 'Tanpa Nama'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                                  className={
                                    user.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                                      : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {user.role === 'admin' ? 'Admin' : 'Pengguna'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {user.company_name || '-'}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {new Date(user.created_at).toLocaleDateString('id-ID')}
                              </TableCell>
                               <TableCell className="text-right">
                                 {user.role !== 'admin' ? (
                                   <Button
                                     variant="destructive"
                                     size="sm"
                                     onClick={() => openDeleteUserModal(user)}
                                     className="h-8"
                                   >
                                     <Trash2 className="h-4 w-4 mr-1" />
                                     Hapus
                                   </Button>
                                 ) : (
                                   <span className="text-gray-400 text-sm">-</span>
                                 )}
                               </TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
             </>
           )}

            {/* Main content closing tag for layout */}
          </main>
        </div> {/* Close inner wrapper div */}

          {/* Documents Modal */}
          <Dialog open={showDocumentsModal} onOpenChange={(open) => {
              if (!open) {
                setShowDocumentsModal(false);
                // Only clear selectedReg if no other modal is using it
                if (!docActionOpen && !verifyOpen && !deleteOpen && !scheduleOpen && !assessOpen) {
                  setSelectedReg(null);
                }
              }
            }}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detail Permohonan</DialogTitle>
                  <DialogDescription>
                    {selectedReg?.registration_number} • {selectedReg?.type}
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={documentsTab} onValueChange={setDocumentsTab} defaultValue="documents">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="documents">Dokumen</TabsTrigger>
                    <TabsTrigger value="info">Informasi</TabsTrigger>
                    <TabsTrigger value="history">Riwayat</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="space-y-4 mt-4">
                    {/* Status Banner */}
                    {selectedReg?.type === 'NKV' && selectedReg.status === 'document_verification' && documents.length > 0 && (
                      <div className={`p-4 rounded-lg border ${
                        documents.every(doc => doc.status === 'approved')
                          ? 'bg-green-50 border-green-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {documents.every(doc => doc.status === 'approved') ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">
                                Semua dokumen telah diverifikasi. Siap untuk menjadwalkan pemeriksaan lapangan.
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-5 w-5 text-yellow-600" />
                              <span className="font-medium text-yellow-800">
                                Dokumen masih memerlukan verifikasi. Lengkapi verifikasi semua dokumen.
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {loadingDocs ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : documents.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada dokumen</p>
                    ) : (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => openDocPreview(doc)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <File className="h-10 w-10 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{doc.document_type}</p>
                                <p className="text-sm text-gray-500 truncate">{doc.file_name}</p>
                                {doc.admin_notes && (
                                  <p className="text-xs text-gray-600 mt-1 italic">Catatan: {doc.admin_notes}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {getDocStatusBadge(doc.status ?? 'pending')}
                                  {doc.verified_at && (
                                    <span className="text-xs text-gray-500">
                                      Diverifikasi: {new Date(doc.verified_at).toLocaleDateString('id-ID')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDocPreview(doc)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Lihat
                              </Button>
                              {/* Show action buttons only for NKV documents */}
                              {selectedReg?.type === 'NKV' && doc.status !== 'approved' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => openDocActionModal(doc, 'approve')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Setujui
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => openDocActionModal(doc, 'revision')}
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Revisi
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => openDocActionModal(doc, 'reject')}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Tolak
                                  </Button>
                                </>
                              )}
                              {selectedReg?.type === 'NKV' && doc.status === 'approved' && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Nomor Registrasi</p>
                          <p className="text-gray-900">{selectedReg?.registration_number}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Jenis</p>
                          <p>{selectedReg?.type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          <p>{selectedReg && getStatusBadge(selectedReg.status)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tanggal Pembuatan</p>
                          <p>{selectedReg && new Date(selectedReg.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-600">Nama Pemohon / Unit Usaha</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedReg?.applicant_name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-blue-600">{selectedReg?.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Telepon</p>
                          <p>{selectedReg?.phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    <p className="text-center text-gray-500 py-8">Riwayat status akan segera tersedia</p>
                  </TabsContent>
                </Tabs>

                 <DialogFooter>
                   {/* Show "Jadwalkan Pemeriksaan" button when all NKV documents are approved */}
                   {selectedReg?.type === 'NKV' && selectedReg.status === 'document_verification' && documents.length > 0 && documents.every(doc => doc.status === 'approved') && (
                     <Button
                       variant="default"
                       onClick={() => {
                         setShowDocumentsModal(false);
                         openScheduleModal(selectedReg!);
                       }}
                       className="bg-blue-600 hover:bg-blue-700 mr-auto"
                     >
                       <Calendar className="h-4 w-4 mr-2" />
                       Jadwalkan Pemeriksaan Lapangan
                     </Button>
                   )}
                   <Button
                     variant="outline"
                     onClick={() => setSelectedReg(null)}
                     className="text-black border-gray-300 hover:bg-gray-100"
                   >
                     Tutup
                   </Button>
                 </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Verification Modal */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyAction === 'approve' ? 'Verifikasi Dokumen' : 
               verifyAction === 'reject' ? 'Tolak Permohonan' : 'Minta Revisi'}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'approve' 
                ? 'Konfirmasi bahwa dokumen telah sesuai dan lanjutkan ke tahap berikutnya.'
                : verifyAction === 'reject'
                ? 'Tolak permohonan ini. Berikan alasan penolakan.'
                : 'Minta pemohon untuk merevisi dokumen.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Permohonan</p>
              <p className="font-medium">{selectedReg?.registration_number}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedReg?.type}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan</label>
              <Textarea
                placeholder="Berikan catatan atau instruksi..."
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleVerification}
              disabled={submitting}
              variant={verifyAction === 'approve' ? 'default' : 'destructive'}
            >
              {submitting ? 'Memproses...' : 
               verifyAction === 'approve' ? 'Verifikasi' :
               verifyAction === 'reject' ? 'Tolak' : 'Kirim Revisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Document Action Modal */}
       <Dialog open={docActionOpen} onOpenChange={setDocActionOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>
               {actionType === 'approve' ? 'Setujui Dokumen' :
                actionType === 'reject' ? 'Tolak Dokumen' : 'Minta Revisi Dokumen'}
             </DialogTitle>
             <DialogDescription>
               {actionType === 'approve'
                 ? 'Konfirmasi bahwa dokumen ini telah sesuai.'
                 : actionType === 'reject'
                 ? 'Tolak dokumen ini. Berikan alasan penolakan.'
                 : 'Minta pemohon untuk merevisi dokumen ini.'}
             </DialogDescription>
           </DialogHeader>

           <div className="space-y-4 py-4">
             <div className="p-4 bg-gray-50 rounded-lg">
               <p className="text-sm text-gray-600">Dokumen</p>
               <p className="font-medium">{actionDoc?.document_type}</p>
               <p className="text-sm text-gray-600 mt-1">{actionDoc?.file_name}</p>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium">Catatan {actionType === 'approve' ? '(opsional)' : ''}</label>
               <Textarea
                 placeholder={actionType === 'approve' ? 'Berikan catatan jika diperlukan...' : 'Berikan alasan...'}
                 value={actionNotes}
                 onChange={(e) => setActionNotes(e.target.value)}
                 rows={4}
               />
             </div>
           </div>

           <DialogFooter>
             <Button variant="outline" onClick={() => setDocActionOpen(false)}>
               Batal
             </Button>
             <Button
               onClick={handleDocAction}
               disabled={updatingDoc}
               variant={actionType === 'approve' ? 'default' : 'destructive'}
             >
               {updatingDoc ? 'Memproses...' :
                actionType === 'approve' ? 'Setujui' :
                actionType === 'reject' ? 'Tolak' : 'Kirim Revisi'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Inspection Modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Pemeriksaan Lapangan</DialogTitle>
            <DialogDescription>
              Atur tanggal, waktu, dan lokasi pemeriksaan lapangan untuk permohonan ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Permohonan</p>
              <p className="font-medium">{selectedReg?.registration_number}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedReg?.type} • {selectedReg?.applicant_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal</label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Waktu</label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lokasi</label>
              <Input
                placeholder="Contoh: Kantor Dinas, Alamat lengkap..."
                value={scheduleLocation}
                onChange={(e) => setScheduleLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan (opsional)</label>
              <Textarea
                placeholder="Instruksi atau catatan tambahan..."
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSchedule} disabled={scheduling}>
              {scheduling ? 'Memproses...' : 'Jadwalkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment Modal */}
      <Dialog open={assessOpen} onOpenChange={setAssessOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Input Penilaian Pemeriksaan</DialogTitle>
            <DialogDescription>
              Masukkan skor dan catatan hasil pemeriksaan lapangan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Permohonan</p>
              <p className="font-medium">{selectedReg?.registration_number}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedReg?.type}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Skor Penilaian (0-100)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={assessmentScore}
                onChange={(e) => setAssessmentScore(parseInt(e.target.value) || 0)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Skor minimal 75 untuk disetujui
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan Penilaian <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="Detail hasil pemeriksaan, temuan, dan rekomendasi..."
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL File Rekomendasi (opsional)</label>
              <Input
                placeholder="https://example.com/file.pdf"
                value={recommendationFileUrl}
                onChange={(e) => setRecommendationFileUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Link ke file PDF rekomendasi yang dapat diunduh
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAssess}
              disabled={assessing}
              variant={assessmentScore >= 75 ? 'default' : 'destructive'}
            >
              {assessing ? 'Memproses...' : 'Simpan Penilaian'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pratinjau Dokumen</DialogTitle>
            <DialogDescription>
              {previewDoc?.document_type} • {previewDoc?.file_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {previewDoc && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {/* PDF and image previews using iframe */}
                {previewDoc.file_url.match(/\.(pdf|PDF)$/) ? (
                  <iframe
                    src={previewDoc.file_url}
                    className="w-full h-[70vh]"
                    title={previewDoc.file_name}
                  />
                ) : previewDoc.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <div className="flex justify-center p-4">
                    <img
                      src={previewDoc.file_url}
                      alt={previewDoc.document_type}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <File className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Tidak dapat mempratinjau file ini</p>
                    <Button
                      variant="default"
                      onClick={() => window.open(previewDoc.file_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Buka File di Tab Baru
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Document Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jenis Dokumen</p>
                  <p className="text-gray-900">{previewDoc?.document_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Nama File</p>
                  <p className="text-gray-900">{previewDoc?.file_name}</p>
                </div>
                {previewDoc?.status && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="mt-1">{previewDoc && getDocStatusBadge(previewDoc.status)}</div>
                  </div>
                )}
                {previewDoc?.verified_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diverifikasi</p>
                    <p className="text-gray-900">{new Date(previewDoc.verified_at).toLocaleDateString('id-ID')}</p>
                  </div>
                )}
              </div>
              {previewDoc?.admin_notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600">Catatan Admin</p>
                  <p className="text-gray-900 mt-1">{previewDoc.admin_notes}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
                  <Button
                    variant="default"
                    onClick={() => window.open(previewDoc?.file_url, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Buka di Tab Baru
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewOpen(false)}
                    className="text-black border-gray-300 hover:bg-gray-100"
                  >
                    Tutup
                  </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal for Registration */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Permohonan</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus permohonan ini?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-900">{selectedReg?.registration_number}</p>
              <p className="text-sm text-red-700">{selectedReg?.type}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
       <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Tambah Pengguna Baru</DialogTitle>
             <DialogDescription>
               Buat akun pengguna baru dengan peran yang ditentukan
             </DialogDescription>
           </DialogHeader>

           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Nama Lengkap</label>
               <Input
                 placeholder="Masukkan nama lengkap"
                 value={newUserName}
                 onChange={(e) => setNewUserName(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Email</label>
               <Input
                 type="email"
                 placeholder="nama@example.com"
                 value={newUserEmail}
                 onChange={(e) => setNewUserEmail(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Password</label>
               <Input
                 type="password"
                 placeholder="Password minimal 6 karakter"
                 value={newUserPassword}
                 onChange={(e) => setNewUserPassword(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Peran</label>
               <select
                 value={newUserRole}
                 onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                 className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
               >
                 <option value="user">Pengguna</option>
                 <option value="admin">Admin</option>
               </select>
             </div>
           </div>

           <DialogFooter>
             <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
               Batal
             </Button>
             <Button onClick={handleCreateUser} disabled={creatingUser}>
               {creatingUser ? 'Membuat...' : 'Buat Pengguna'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Delete User Confirmation Modal */}
       <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Hapus Pengguna</DialogTitle>
             <DialogDescription>
               Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus pengguna ini?
             </DialogDescription>
           </DialogHeader>

           <div className="py-4">
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
               <p className="font-medium text-red-900">{selectedUser?.full_name}</p>
               <p className="text-sm text-red-700">{selectedUser?.email}</p>
               <p className="text-xs text-red-600 mt-1">Peran: {selectedUser?.role}</p>
             </div>
           </div>

           <DialogFooter>
             <Button variant="outline" onClick={() => setDeleteUserOpen(false)}>
               Batal
             </Button>
             <Button
               variant="destructive"
               onClick={handleDeleteUser}
               disabled={deletingUser}
             >
               {deletingUser ? 'Menghapus...' : 'Ya, Hapus'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
}

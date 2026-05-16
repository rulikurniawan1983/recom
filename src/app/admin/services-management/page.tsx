'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Syringe,
  Stethoscope,
  Video,
  FileText,
  Users,
  ClipboardList,
  Calendar,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
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
  Badge,
} from '@/components/ui/badge';

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Syringe,
  Stethoscope,
  Video,
  FileText,
  Users,
  ClipboardList,
  Calendar,
};

export default function ServicesManagementPage() {
  const router = useRouter();
  const [services, setServices] = useState<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    isActive: boolean;
    createdAt: string;
  }>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any>(null);

  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceIcon, setServiceIcon] = useState('Heart');
  const [serviceColor, setServiceColor] = useState('blue');
  const [serviceBgColor, setServiceBgColor] = useState('blue');
  const [isActive, setIsActive] = useState(true);

  // Icon options
  const iconOptions = [
    { name: 'Heart', component: <Heart className="h-5 w-5" /> },
    { name: 'Syringe', component: <Syringe className="h-5 w-5" /> },
    { name: 'Stethoscope', component: <Stethoscope className="h-5 w-5" /> },
    { name: 'Video', component: <Video className="h-5 w-5" /> },
    { name: 'FileText', component: <FileText className="h-5 w-5" /> },
    { name: 'Users', component: <Users className="h-5 w-5" /> },
    { name: 'ClipboardList', component: <ClipboardList className="h-5 w-5" /> },
    { name: 'Calendar', component: <Calendar className="h-5 w-5" /> },
  ];

  // Color options
  const colorOptions = [
    { name: 'blue', label: 'Biru', class: 'bg-blue-100 text-blue-800' },
    { name: 'green', label: 'Hijau', class: 'bg-green-100 text-green-800' },
    { name: 'orange', label: 'Oranye', class: 'bg-orange-100 text-orange-800' },
    { name: 'purple', label: 'Ungu', class: 'bg-purple-100 text-purple-800' },
    { name: 'cyan', label: 'Birua Muda', class: 'bg-cyan-100 text-cyan-800' },
    { name: 'red', label: 'Merah', class: 'bg-red-100 text-red-800' },
    { name: 'yellow', label: 'Kuning', class: 'bg-yellow-100 text-yellow-800' },
    { name: 'indigo', label: 'Nila', class: 'bg-indigo-100 text-indigo-800' },
  ];

  const colorBgOptions: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100',
    cyan: 'bg-cyan-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    indigo: 'bg-indigo-100',
  };

  const colorTextOptions: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    cyan: 'text-cyan-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    indigo: 'text-indigo-600',
  };

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/services');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch services');
      }
      const data = await res.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat layanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setServiceName('');
    setServiceDescription('');
    setServiceIcon('Heart');
    setServiceColor('blue');
    setServiceBgColor('blue');
    setIsActive(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddServiceModal(true);
  };

  const openEditModal = (svc: any) => {
    setServiceToEdit(svc);
    setServiceName(svc.name);
    setServiceDescription(svc.description || '');
    setServiceIcon(svc.icon);
    setServiceColor(svc.color);
    setServiceBgColor(svc.bgColor);
    setIsActive(svc.isActive);
    setShowEditServiceModal(true);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceName,
          description: serviceDescription,
          icon: serviceIcon,
          color: serviceColor,
          bgColor: colorBgOptions[serviceColor] || 'bg-blue-100',
          isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add service');
      }
      setShowAddServiceModal(false);
      resetForm();
      fetchServices();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceToEdit) return;
    try {
      const res = await fetch(`/api/admin/services/${serviceToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceName,
          description: serviceDescription,
          icon: serviceIcon,
          color: serviceColor,
          bgColor: colorBgOptions[serviceColor] || 'bg-blue-100',
          isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update service');
      }
      setShowEditServiceModal(false);
      resetForm();
      fetchServices();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete service');
      }
      fetchServices();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const toggleActive = async (svc: any) => {
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !svc.isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to toggle service');
      }
      fetchServices();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const getBadgeForColor = (colorName: string) => {
    return colorOptions.find(c => c.name === colorName) || colorOptions[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
              ← Kembali ke Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Manajemen Layanan Kesehatan Hewan
                </CardTitle>
                <CardDescription>Tambah, edit, atau hapus layanan klinik hewan</CardDescription>
              </div>
              <Button onClick={openAddModal}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Layanan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 mb-4 flex items-center justify-between">
                {error}
                <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                  ✕
                </Button>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada layanan. Tambahkan layanan pertama Anda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Ikon</TableHead>
                      <TableHead>Warna</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((svc) => {
                      const IconComponent = iconMap[svc.icon] || Heart;
                      const badge = getBadgeForColor(svc.color);
                      return (
                        <TableRow key={svc.id}>
                          <TableCell>
                            <p className="font-medium text-gray-900">{svc.name}</p>
                            <p className="text-xs text-gray-500">{svc.description || 'Tidak ada deskripsi'}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <IconComponent className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-xs text-gray-500">{svc.icon}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={badge.class}>
                              {badge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button onClick={() => toggleActive(svc)} className="cursor-pointer">
                              <Badge
                                variant={svc.isActive ? 'default' : 'secondary'}
                                className={
                                  svc.isActive
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                }
                              >
                                {svc.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(svc.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(svc)}
                                className="h-8"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteService(svc.id)}
                                className="h-8"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Layanan Baru</h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                  <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <Input value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setServiceIcon(opt.name)}
                        className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                          serviceIcon === opt.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        title={opt.name}
                      >
                        {opt.component}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => {
                          setServiceColor(opt.name);
                          setServiceBgColor(opt.name);
                        }}
                        className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                          serviceColor === opt.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Badge variant="secondary" className={opt.class}>{opt.label}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="add-is-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="add-is-active" className="text-sm font-medium text-gray-700">Layanan aktif</label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddServiceModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceModal && serviceToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Layanan</h2>
              <form onSubmit={handleEditService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                  <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <Input value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setServiceIcon(opt.name)}
                        className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                          serviceIcon === opt.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        title={opt.name}
                      >
                        {opt.component}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => {
                          setServiceColor(opt.name);
                          setServiceBgColor(opt.name);
                        }}
                        className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                          serviceColor === opt.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Badge variant="secondary" className={opt.class}>{opt.label}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-is-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="edit-is-active" className="text-sm font-medium text-gray-700">Layanan aktif</label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditServiceModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan Perubahan</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

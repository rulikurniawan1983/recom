'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import type { NKVRegistration, DokterHewanRegistration } from '@/lib/types';
import { uploadRegistrationDocument, validateFileSize } from '@/lib/storage';

type Registration = (NKVRegistration & { type: 'NKV' }) | (DokterHewanRegistration & { type: 'Dokter Hewan' });

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onResubmit?: (id: string, files: Array<{ file_name: string; file_url: string; document_type: string }>) => Promise<void>;
}

function getStatusLabel(status: string): string {
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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-700 text-gray-300 border border-gray-600',
    submitted: 'bg-blue-900/50 text-blue-300 border border-blue-700',
    document_verification: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    field_inspection: 'bg-purple-900/50 text-purple-300 border border-purple-700',
    assessment: 'bg-orange-900/50 text-orange-300 border border-orange-700',
    approved: 'bg-green-900/50 text-green-300 border border-green-700',
    rejected: 'bg-red-900/50 text-red-300 border border-red-700',
    revision_requested: 'bg-red-900/50 text-red-300 border border-red-700'
  }
  return colors[status] || 'bg-gray-700 text-gray-300 border border-gray-600'
}

const DOCUMENT_OPTIONS = [
  { value: 'surat-pernyataan', label: 'Surat Pernyataan Revisi' },
  { value: 'dokumen-pendukung', label: 'Dokumen Pendukung' },
  { value: 'surat-izin', label: 'Surat Izin Usaha' },
  { value: 'sertifikat', label: 'Sertifikat' },
  { value: 'foto', label: 'Foto / Pas Foto' },
  { value: 'dokumen-lain', label: 'Dokumen Lainnya' },
] as const;

export default function RegistrationDetailModal({
  isOpen,
  onClose,
  registration,
  onUpdate,
  onDelete,
  onResubmit
}: RegistrationDetailModalProps) {
  interface FormData {
    business_name?: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    business_type?: string;
    product_type?: string;
    product_description?: string;
    full_name?: string;
    phone?: string;
    email?: string;
    clinic_address?: string;
    nib_number?: string;
    strv_number?: string;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
  const [resubmitFiles, setResubmitFiles] = useState<Array<{ file: File; documentType: string; fileUrl: string | null; uploading: boolean }>>([]);
  const [resubmitUploading, setResubmitUploading] = useState(false);

  const handleClose = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setResubmitFiles([]);
    onClose();
  };

  const canEdit = registration.status === 'draft' || registration.status === 'submitted';
  const canDelete = registration.status === 'draft';
  const canResubmit = registration.status === 'revision_requested';

  const handleEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
    if (registration.type === 'NKV') {
      setFormData({
        business_name: registration.business_name || '',
        business_address: registration.business_address || '',
        business_phone: registration.business_phone || '',
        business_email: registration.business_email || '',
        business_type: registration.business_type || '',
        product_type: registration.product_type || '',
        product_description: registration.product_description || ''
      });
    } else if (registration.type === 'Dokter Hewan') {
      setFormData({
        full_name: registration.full_name || '',
        phone: registration.phone || '',
        email: registration.email || '',
        clinic_address: registration.clinic_address || '',
        nib_number: registration.nib_number || '',
        strv_number: registration.strv_number || ''
      });
    }
  };

  const handleSave = async () => {
    if (!registration.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = registration.type === 'NKV'
        ? `/api/nkv/${registration.id}`
        : `/api/dokter-hewan/${registration.id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Permohonan berhasil diperbarui');
        setIsEditing(false);
        await onUpdate(registration.id, formData as Record<string, unknown>);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Gagal memperbarui permohonan');
      }
    } catch (err) {
      console.error('Error updating registration:', err);
      setError('Terjadi kesalahan saat memperbarui permohonan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!registration.id) return;
    setShowDeleteConfirm(false);
    setLoading(true);
    setError(null);

    try {
      const endpoint = registration.type === 'NKV'
        ? `/api/nkv/${registration.id}`
        : `/api/dokter-hewan/${registration.id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        await onDelete(registration.id);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Gagal menghapus permohonan');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      setError('Terjadi kesalahan saat menghapus permohonan');
      setLoading(false);
    }
  };

  const handleAddResubmitFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file)) {
      setError('Ukuran file melebihi 1MB');
      e.target.value = '';
      return;
    }

    const docInput = e.target as HTMLInputElement & { dataset: { docType?: string } };
    const docType = docInput.dataset.docType || 'Dokumen Lainnya';

    setResubmitFiles(prev => [...prev, { file, documentType: docType, fileUrl: null, uploading: false }]);
    setError(null);
    e.target.value = '';
  }, []);

  const handleRemoveResubmitFile = useCallback((index: number) => {
    setResubmitFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleResubmitFiles = async () => {
    if (!registration.id || !onResubmit) return;
    setResubmitUploading(true);
    setError(null);

    try {
      const uploadResults = await Promise.all(
        resubmitFiles.map(async (item) => {
          try {
            const fileUrl = await uploadRegistrationDocument(
              item.file,
              registration.id,
              item.documentType
            );
            return { ...item, fileUrl, uploading: false };
          } catch {
            return { ...item, fileUrl: null, uploading: false };
          }
        })
      );

      const successfulUploads = uploadResults.filter(r => r.fileUrl !== null);

      if (successfulUploads.length === 0 && resubmitFiles.length > 0) {
        setError('Gagal mengunggah semua dokumen. Silakan coba lagi.');
        setResubmitUploading(false);
        return;
      }

      const documentData = successfulUploads.map(r => ({
        file_name: r.file.name,
        file_url: r.fileUrl!,
        document_type: r.documentType,
      }));

      await onResubmit(registration.id, documentData);

      setSuccess('Permohonan berhasil diajukan kembali');
      setResubmitFiles([]);
      onClose();
    } catch (err) {
      console.error('Error resubmitting registration:', err);
      setError('Terjadi kesalahan saat mengajukan ulang');
    } finally {
      setResubmitUploading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Detail Permohonan
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 bg-gray-900">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 text-green-200 rounded-lg">
              {success}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="mb-4 p-4 bg-red-900/40 border-2 border-red-600 rounded-lg">
              <h4 className="font-semibold text-red-100 mb-2">Konfirmasi Hapus</h4>
              <p className="text-red-200 mb-4">
                Apakah Anda yakin ingin menghapus permohonan <strong className="text-white">{registration.registration_number}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Menghapus...' : 'Ya, Hapus'}
                </Button>
              </div>
            </div>
          )}

          {/* Resubmit Confirmation Dialog */}
          {showResubmitConfirm && (
            <div className="mb-4 p-4 bg-blue-900/40 border-2 border-blue-600 rounded-lg">
              <h4 className="font-semibold text-blue-100 mb-2">Konfirmasi Ajukan Ulang</h4>
              <p className="text-blue-200 mb-4">
                Apakah Anda yakin ingin mengajukan ulang permohonan <strong className="text-white">{registration.registration_number}</strong>?
                Setelah diajukan ulang, status akan berubah menjadi &quot;Diajukan&quot; dan menunggu verifikasi admin.
              </p>

              {/* File Upload Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Unggah Dokumen Revisi
                </label>
                <div className="space-y-2">
                  {resubmitFiles.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-900/30 p-2 rounded">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-blue-100 truncate">{item.file.name}</span>
                        <span className="text-xs text-blue-400">({item.documentType})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.uploading && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
                        {item.fileUrl && <span className="text-xs text-green-400">✓</span>}
                        {!item.fileUrl && !item.uploading && <span className="text-xs text-red-400">✗</span>}
                        <button
                          onClick={() => handleRemoveResubmitFile(index)}
                          className="text-gray-400 hover:text-red-400 text-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <select className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200" defaultValue="">
                    <option value="">Pilih tipe dokumen</option>
                    {DOCUMENT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer flex items-center gap-1 transition-colors">
                    <Upload className="h-4 w-4" />
                    Pilih File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.png,.jpeg"
                      onChange={(e) => {
                        const select = e.target.previousElementSibling?.previousElementSibling as HTMLSelectElement;
                        const docType = select?.value || 'Dokumen Lainnya';
                        const clonedEvent = {
                          ...e,
                          target: { ...e.target, dataset: { docType } }
                        } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleAddResubmitFile(clonedEvent);
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-blue-300/60 mt-1">Maksimal 1MB per file. Format: PDF, JPG, PNG</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResubmitConfirm(false)}
                  disabled={resubmitUploading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Batal
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleResubmitFiles}
                  disabled={resubmitUploading || resubmitFiles.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {resubmitUploading ? 'Mengunggah & Mengajukan...' : 'Ya, Ajukan Ulang'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6 text-gray-200">
            {/* Registration Info */}
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                Nomor Registrasi: {registration.registration_number}
              </h3>
              <p className="text-sm text-gray-400">
                {registration.type} • {new Date(registration.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                {getStatusLabel(registration.status)}
              </span>
              {registration.status === 'revision_requested' && (
                <span className="text-sm text-red-400 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  Admin meminta revisi - silakan perbarui data dan ajukan kembali
                </span>
              )}
            </div>

            {/* Form Fields */}
            {!isEditing && (
              <>
                {registration.type === 'NKV' && (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-300">Nama Unit Usaha:</p>
                        <p className="text-blue-300">{registration.business_name || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Alamat:</p>
                        <p className="text-blue-300">{registration.business_address || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Telepon:</p>
                        <p className="text-blue-300">{registration.business_phone || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Email:</p>
                        <p className="text-blue-300">{registration.business_email || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Jenis Usaha:</p>
                        <p className="text-blue-300">{registration.business_type || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Jenis Produk:</p>
                        <p className="text-blue-300">{registration.product_type || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Deskripsi Produk:</p>
                        <p className="text-blue-300">{registration.product_description || '-'}</p>
                      </div>
                    </div>
                  </>
                )}
                {registration.type === 'Dokter Hewan' && (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-300">Nama Lengkap:</p>
                        <p className="text-blue-300">{registration.full_name || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Telepon:</p>
                        <p className="text-blue-300">{registration.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Email:</p>
                        <p className="text-blue-300">{registration.email || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">Alamat Klinik:</p>
                        <p className="text-blue-300">{registration.clinic_address || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">NIB:</p>
                        <p className="text-blue-300">{registration.nib_number || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">STRV:</p>
                        <p className="text-blue-300">{registration.strv_number || '-'}</p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Edit Form */}
            {isEditing && (
              <div className="space-y-4">
                {registration.type === 'NKV' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Nama Unit Usaha</label>
                      <Input
                        value={formData.business_name || ''}
                        onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Alamat</label>
                      <Textarea
                        value={formData.business_address || ''}
                        onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                        required
                        rows={3}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Telepon</label>
                      <Input
                        value={formData.business_phone || ''}
                        onChange={(e) => setFormData({...formData, business_phone: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                      <Input
                        value={formData.business_email || ''}
                        onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                        type="email"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Jenis Usaha</label>
                      <select
                        value={formData.business_type || ''}
                        onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                        className="w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 text-white"
                        required
                      >
                        <option value="">Pilih jenis usaha</option>
                        <option value="rph-ruminansia">RPH Ruminansia</option>
                        <option value="rph-babi">RPH Babi</option>
                        <option value="rpu">Rumah Potong Unggas (RPU)</option>
                        <option value="rph-lainnya">RPH Lainnya</option>
                        <option value="budidaya-unggas-petelur">Usaha budidaya unggas petelur</option>
                        <option value="budidaya-unggas-perah">Usaha budidaya unggas perah</option>
                        <option value="pengolahan-daging">Unit pengolahan daging</option>
                        <option value="pengolahan-susu">Unit pengolahan susu</option>
                        <option value="pengolahan-telur">Unit pengolahan telur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Jenis Produk</label>
                      <select
                        value={formData.product_type || ''}
                        onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                        className="w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 text-white"
                      >
                        <option value="">Pilih jenis produk</option>
                        <option value="daging-sapi">Daging Sapi</option>
                        <option value="daging-kambing">Daging Kambing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Deskripsi Produk</label>
                      <Textarea
                        value={formData.product_description || ''}
                        onChange={(e) => setFormData({...formData, product_description: e.target.value})}
                        rows={3}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </>
                )}
                {registration.type === 'Dokter Hewan' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Nama Lengkap</label>
                      <Input
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Telepon</label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        type="email"
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Alamat Klinik</label>
                      <Textarea
                        value={formData.clinic_address || ''}
                        onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                        required
                        rows={3}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">NIB</label>
                      <Input
                        value={formData.nib_number || ''}
                        onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Documents Section */}
            <div>
              <h3 className="font-medium text-blue-300 mb-2">Lihat Rekomendasi dan Dokumen yang Diunggah:</h3>
              <p className="text-sm text-gray-400">
                {registration.type === 'NKV'
                  ? (registration.recommendation_file_url
                    ? <a href={registration.recommendation_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                        Lihat Rekomendasi
                      </a>
                    : 'Belum ada dokumen yang diunggah')
                  : (registration.color_photo_url || registration.diploma_url || registration.competency_cert_url || registration.professional_recommendation_url
                    ? <div className="space-y-1">
                        {registration.color_photo_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Pas Photo: </span>
                            <a href={registration.color_photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                        {registration.diploma_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Diploma: </span>
                            <a href={registration.diploma_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                        {registration.competency_cert_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Sertifikat Kompetensi: </span>
                            <a href={registration.competency_cert_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                        {registration.professional_recommendation_url && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Rekomendasi Profesional: </span>
                            <a href={registration.professional_recommendation_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                      </div>
                    : 'Belum ada dokumen yang diunggah'
                  )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-800 border-t border-gray-700 flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Tutup
          </Button>

          {!isEditing && canEdit && (
            <Button
              variant="secondary"
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            >
              Edit Permohonan
            </Button>
          )}

          {!isEditing && canDelete && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Hapus Permohonan
            </Button>
          )}

          {!isEditing && canResubmit && onResubmit && (
            <Button
              variant="default"
              onClick={() => setShowResubmitConfirm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ajukan Ulang
            </Button>
          )}

          {!canEdit && !canResubmit && !isEditing && (
            <span className="text-sm text-gray-500 flex items-center py-2">
              Permohonan dalam status &quot;{getStatusLabel(registration.status)}&quot; tidak dapat diedit
            </span>
          )}

          {isEditing && (
            <>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Batal
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
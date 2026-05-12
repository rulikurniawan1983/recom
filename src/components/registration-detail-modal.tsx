'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function RegistrationDetailModal({
  isOpen,
  onClose,
  registration,
  onUpdate,
  onDelete
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

  const handleClose = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize form data with current registration values
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
      // Determine which API endpoint to call based on registration type
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
        // Notify parent to refresh data
        await onUpdate(registration.id, formData);
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

    if (!window.confirm('Yakin ingin menghapus permohonan ini?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine which API endpoint to call based on registration type
      const endpoint = registration.type === 'NKV' 
        ? `/api/nkv/${registration.id}` 
        : `/api/dokter-hewan/${registration.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Notify parent to delete the registration
        await onDelete(registration.id);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Gagal menghapus permohonan');
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      setError('Terjadi kesalahan saat menghapus permohonan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-start p-6">
          <h2 className="text-xl font-bold text-blue-900">
            Detail Permohonan
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}

           {success && (
             <div className="mb-4 p-3 bg-green-50 text-green-600 rounded">
               {success}
             </div>
           )}

          <div className="space-y-6">
            {/* Registration Info */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Nomor Registrasi: {registration.registration_number}
              </h3>
              <p className="text-sm text-gray-600">
                {registration.type} • {new Date(registration.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium">
                {registration.status === 'draft' ? 'Draft' :
                 registration.status === 'submitted' ? 'Diajukan' :
                 registration.status === 'document_verification' ? 'Verifikasi Dokumen' :
                 registration.status === 'field_inspection' ? 'Pemeriksaan Lapangan' :
                 registration.status === 'assessment' ? 'Penilaian' :
                 registration.status === 'approved' ? 'Disetujui' :
                 registration.status === 'rejected' ? 'Ditolak' :
                 registration.status === 'revision_requested' ? 'Perlu Revisi' : registration.status}
              </span>
            </div>

            {/* Form Fields */}
            {!isEditing && (
              <>
                {registration.type === 'NKV' && (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Nama Unit Usaha:</p>
                        <p className="text-blue-600">{registration.business_name || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Alamat:</p>
                        <p className="text-blue-600">{registration.business_address || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Telepon:</p>
                        <p className="text-blue-600">{registration.business_phone || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Email:</p>
                        <p className="text-blue-600">{registration.business_email || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Jenis Usaha:</p>
                        <p className="text-blue-600">{registration.business_type || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Jenis Produk:</p>
                        <p className="text-blue-600">{registration.product_type || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Deskripsi Produk:</p>
                        <p className="text-blue-600">{registration.product_description || '-'}</p>
                      </div>
                    </div>
                  </>
                )}
                {registration.type === 'Dokter Hewan' && (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Nama Lengkap:</p>
                        <p className="text-blue-600">{registration.full_name || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Telepon:</p>
                        <p className="text-blue-600">{registration.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Email:</p>
                        <p className="text-blue-600">{registration.email || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Alamat Klinik:</p>
                        <p className="text-blue-600">{registration.clinic_address || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">NIB:</p>
                        <p className="text-blue-600">{registration.nib_number || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">STRV:</p>
                        <p className="text-blue-600">{registration.strv_number || '-'}</p>
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
                      <label className="block text-sm font-medium mb-1">Nama Unit Usaha</label>
                      <Input
                        value={formData.business_name || ''}
                        onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Alamat</label>
                      <Textarea
                        value={formData.business_address || ''}
                        onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                        required
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telepon</label>
                      <Input
                        value={formData.business_phone || ''}
                        onChange={(e) => setFormData({...formData, business_phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        value={formData.business_email || ''}
                        onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenis Usaha</label>
                      <select
                        value={formData.business_type || ''}
                        onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
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
                      <label className="block text-sm font-medium mb-1">Jenis Produk</label>
                      <select
                        value={formData.product_type || ''}
                        onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="">Pilih jenis produk</option>
                        <option value="daging-sapi">Daging Sapi</option>
                         <option value="daging-kambing">Daging Kambing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Deskripsi Produk</label>
                      <Textarea
                        value={formData.product_description || ''}
                        onChange={(e) => setFormData({...formData, product_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </>
                )}
                {registration.type === 'Dokter Hewan' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                      <Input
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telepon</label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        type="email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Alamat Klinik</label>
                      <Textarea
                        value={formData.clinic_address || ''}
                        onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                        required
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NIB</label>
                      <Input
                        value={formData.nib_number || ''}
                        onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
                      />
</div>
                   </>
                 )}
               </div>
             )}

             {/* Documents Section */}
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Dokumen yang Diunggah:</h3>
              {/* This would be populated with actual document data */}
              <p className="text-sm text-gray-500">
                {registration.type === 'NKV' 
                  ? (registration.recommendation_file_url ? 
                    <a href={registration.recommendation_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Lihat Rekomendasi
                    </a>
                    : 'Belum ada dokumen yang diunggah')
                  : (registration.color_photo_url || registration.diploma_url || registration.competency_cert_url || registration.professional_recommendation_url
                    ? <div className="space-y-1">
                        {registration.color_photo_url && (
                          <div className="flex items-center gap-2">
                            <span>Pas Photo: </span>
                            <a href={registration.color_photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                        {registration.diploma_url && (
                          <div className="flex items-center gap-2">
                            <span>Diploma: </span>
                            <a href={registration.diploma_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                        {registration.competency_cert_url && (
                          <div className="flex items-center gap-2">
                            <span>Sertifikat Kompetensi: </span>
                            <a href={registration.competency_cert_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              Lihat Dokumen
                            </a>
                          </div>
                        )}
                        {registration.professional_recommendation_url && (
                          <div className="flex items-center gap-2">
                            <span>Rekomendasi Profesional: </span>
                            <a href={registration.professional_recommendation_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
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
        <div className="CardFooter">
          <Button variant="outline" onClick={handleClose}>
            Tutup
          </Button>
          {!isEditing && (
            <>
              <Button 
                variant="outline" 
                onClick={handleEdit}
                className="mr-2"
              >
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                className="mr-2"
              >
                Hapus
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button 
variant="secondary"
                 onClick={handleSave}
                 className="mr-2"
               >
                Simpan
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="mr-2"
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
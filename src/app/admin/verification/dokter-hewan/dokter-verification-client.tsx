'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AdminDokterVerificationClientProps {
  registrations: Array<{
    id: string
    registration_number: string
    profiles?: { full_name: string | null; email: string }
    full_name: string
    phone: string
    email: string
    clinic_address: string
    nib_number: string | null
    strv_number: string | null
    color_photo_url: string | null
    diploma_url: string | null
    competency_cert_url: string | null
    professional_recommendation_url: string | null
    created_at: string
  }>
}

export default function AdminDokterVerificationClient({ registrations }: AdminDokterVerificationClientProps) {
  const [selectedReg, setSelectedReg] = useState<AdminDokterVerificationClientProps['registrations'][0] | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (id: string, status: 'document_verification' | 'revision_requested') => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/dokter-hewan/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })

      if (response.ok) {
        setSelectedReg(null)
        setNotes('')
        window.location.reload()
      } else {
        const error = await response.json()
        console.error('Update failed:', error)
        alert('Gagal memperbarui status: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Terjadi kesalahan saat memperbarui status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verifikasi Dokumen - Praktek Dokter Hewan</h1>
      
      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-black text-lg font-medium">Tidak ada pendaftaran dokter hewan yang menunggu verifikasi</p>
          <p className="text-gray-500 text-sm mt-2">Silakan tunggu hingga ada pendaftaran baru</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Card key={reg.id} className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">{reg.registration_number}</CardTitle>
                <CardDescription className="text-black">
                  {reg.profiles?.full_name} - {reg.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    <p className="text-black"><strong>Nama:</strong> {reg.full_name}</p>
                    <p className="text-black"><strong>No. Telepon:</strong> {reg.phone}</p>
                    <p className="text-black"><strong>Alamat Klinik:</strong> {reg.clinic_address}</p>
                    <p className="text-black"><strong>NIB:</strong> {reg.nib_number || '-'}</p>
                    <p className="text-black"><strong>STRV:</strong> {reg.strv_number || '-'}</p>
                    <p className="text-black"><strong>Tanggal Daftar:</strong> {new Date(reg.created_at).toLocaleDateString('id-ID')}</p>
                    <p className="text-black"><strong>Dokumen yang Diunggah:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                       {reg.color_photo_url && (
                         <li key="color-photo">
                           Pas Photo: 
                           <a href={reg.color_photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                             Lihat Dokumen
                           </a>
                           <button 
                             onClick={() => {
                               if (reg.color_photo_url) {
                                 const printWindow = window.open(reg.color_photo_url, '_blank');
                                 if (printWindow) {
                                   printWindow.focus();
                                   printWindow.print();
                                 }
                               }
                             }}
                             className="text-blue-600 hover:underline text-xs ml-2"
                           >
                             Cetak PDF
                           </button>
                         </li>
                       )}
                       {reg.diploma_url && (
                         <li key="diploma">
                           Ijazah: 
                           <a href={reg.diploma_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                             Lihat Dokumen
                           </a>
                           <button 
                             onClick={() => {
                               if (reg.diploma_url) {
                                 const printWindow = window.open(reg.diploma_url, '_blank');
                                 if (printWindow) {
                                   printWindow.focus();
                                   printWindow.print();
                                 }
                               }
                             }}
                             className="text-blue-600 hover:underline text-xs ml-2"
                           >
                             Cetak PDF
                           </button>
                         </li>
                       )}
                      {reg.competency_cert_url && (
                        <li key="competency-cert">
                          Sertifikat Kompetensi: 
                          <a href={reg.competency_cert_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Lihat Dokumen
                          </a>
                        </li>
                      )}
                      {reg.professional_recommendation_url && (
                        <li key="professional-recommendation">
                          Rekomendasi Profesional: 
                          <a href={reg.professional_recommendation_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Lihat Dokumen
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                 <div className="mt-4 flex space-x-2">
                   <Button onClick={() => setSelectedReg(reg)}>
                     Verifikasi
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       )}

      {selectedReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-black">Verifikasi Dokumen</CardTitle>
              <CardDescription className="text-black">
                {selectedReg.registration_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Catatan Verifikasi
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan verifikasi..."
                  rows={4}
                  className="text-black"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReg(null)
                    setNotes('')
                  }}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify(selectedReg.id, 'revision_requested')}
                  disabled={loading}
                >
                  Minta Revisi
                </Button>
                <Button
                  onClick={() => handleVerify(selectedReg.id, 'document_verification')}
                  disabled={loading}
                >
                  Verifikasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

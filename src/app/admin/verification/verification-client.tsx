'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminVerificationClientProps {
  registrations: Array<{
    id: string
    registration_number: string
    profiles?: { full_name: string | null; email: string }
    business_units?: { name: string }
    created_at: string
    registration_documents?: Array<{ id: string; document_type: string; file_name: string; file_url: string }>
  }>
}

export default function AdminVerificationClient({ registrations }: AdminVerificationClientProps) {
  const [selectedReg, setSelectedReg] = useState<AdminVerificationClientProps['registrations'][0] | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    location: '',
  })

  const handleVerify = async (id: string, status: 'document_verification' | 'revision_requested') => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/nkv/${id}/status`, {
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

  const handleScheduleInspection = async () => {
    if (!selectedReg) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: selectedReg.id,
          registration_type: 'nkv',
          scheduled_date: scheduleData.scheduled_date,
          scheduled_time: scheduleData.scheduled_time,
          location: scheduleData.location,
        }),
      })

      if (response.ok) {
        setShowScheduleModal(false)
        alert('Jadwal pemeriksaan berhasil dibuat')
        window.location.reload()
      } else {
        alert('Gagal membuat jadwal pemeriksaan')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verifikasi Dokumen NKV</h1>
      
      {registrations.length === 0 ? (
        <p className="text-gray-600">Tidak ada pendaftaran yang menunggu verifikasi</p>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Card key={reg.id}>
              <CardHeader>
                <CardTitle>{reg.registration_number}</CardTitle>
                <CardDescription>
                  {reg.profiles?.full_name} - {reg.business_units?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                   <p><strong>Email:</strong> {reg.profiles?.email}</p>
                   <p><strong>Tanggal Daftar:</strong> {new Date(reg.created_at).toLocaleDateString('id-ID')}</p>
                   <p><strong>Dokumen:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                      {reg.registration_documents?.map((doc) => (
                        <li key={doc.id}>
                          {doc.document_type} - 
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {doc.file_name}
                          </a>
                          <button 
                            onClick={() => {
                              if (doc.file_url) {
                                const printWindow = window.open(doc.file_url, '_blank');
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
                      ))}
                    </ul>
                 </div>
                <div className="mt-4 flex space-x-2">
                  <Button onClick={() => setSelectedReg(reg)}>
                    Verifikasi
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedReg(reg)
                    setShowScheduleModal(true)
                  }}>
                    Jadwalkan Pemeriksaan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {selectedReg && !showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verifikasi Dokumen</CardTitle>
              <CardDescription>
                {selectedReg.registration_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catatan Verifikasi
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan verifikasi..."
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReg(null)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
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

      {/* Schedule Inspection Modal */}
      {showScheduleModal && selectedReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Jadwalkan Pemeriksaan Lapangan</CardTitle>
              <CardDescription>
                {selectedReg.registration_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scheduled_date">Tanggal</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={scheduleData.scheduled_date}
                  onChange={(e) => setScheduleData({...scheduleData, scheduled_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="scheduled_time">Waktu</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={scheduleData.scheduled_time}
                  onChange={(e) => setScheduleData({...scheduleData, scheduled_time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Lokasi Pemeriksaan</Label>
                <Input
                  id="location"
                  value={scheduleData.location}
                  onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})}
                  placeholder="Alamat lokasi pemeriksaan"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setSelectedReg(null)
                  }}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button onClick={handleScheduleInspection} disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
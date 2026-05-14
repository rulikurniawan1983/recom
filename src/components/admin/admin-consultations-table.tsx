'use client'

import { useState } from 'react'
import { Video, CheckCircle, XCircle, Clock, Search, Link as LinkIcon } from 'lucide-react'

interface Doctor {
  id: string
  profiles: { full_name: string | null }
}

interface Consultation {
  id: string
  consultation_type: 'online' | 'offline'
  scheduled_date: string
  scheduled_time: string
  meeting_link: string | null
  location: string | null
  status: string
  is_rated: boolean
  rating: number | null
  review: string | null
  symptoms: string | null
  diagnosis: string | null
  prescription: string | null
  consultation_notes: string | null
  pets: { name: string; species: string; breed: string | null }
  doctors: { id: string; profiles: { full_name: string | null } } | null
}

interface AdminConsultationsTableProps {
  consultations: Consultation[]
  doctors: Doctor[]
}

export default function AdminConsultationsTable({ consultations, doctors }: AdminConsultationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [notes, setNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = c.pets?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      confirmed: 'Terkonfirmasi',
      in_progress: 'Berlangsung',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const formatTime = (timeStr: string) => new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const handleUpdate = async (id: string, data: any) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed')
      window.location.reload()
    } catch (err) {
      alert('Gagal memperbarui')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Cari nama hewan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="confirmed">Terkonfirmasi</option>
          <option value="in_progress">Berlangsung</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hewan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jadwal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{consultation.pets?.name}</div>
                    <div className="text-sm text-gray-500">{consultation.pets?.species}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{formatDate(consultation.scheduled_date)}</div>
                    <div className="text-xs text-gray-500">{formatTime(consultation.scheduled_time)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${consultation.consultation_type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {consultation.consultation_type === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {consultation.doctors ? `Dr. ${consultation.doctors.profiles?.full_name}` : '-'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(consultation.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedConsultation(consultation)
                        setNotes(consultation.consultation_notes || '')
                        setDiagnosis(consultation.diagnosis || '')
                        setPrescription(consultation.prescription || '')
                        setMeetingLink(consultation.meeting_link || '')
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Detail & Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredConsultations.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada data konsultasi</div>
        )}
      </div>

      {/* Update Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              Detail Konsultasi: {selectedConsultation.pets?.name}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipe:</span> {selectedConsultation.consultation_type === 'online' ? 'Online' : 'Offline'}
                </div>
                <div>
                  <span className="text-gray-500">Jadwal:</span> {formatDate(selectedConsultation.scheduled_date)} {formatTime(selectedConsultation.scheduled_time)}
                </div>
              </div>
              {selectedConsultation.symptoms && (
                <div>
                  <label className="block text-sm font-medium mb-1">Keluhan</label>
                  <p className="text-gray-700 bg-gray-50 p-2 rounded">{selectedConsultation.symptoms}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resep</label>
                <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} rows={3} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded" />
              </div>
              {selectedConsultation.consultation_type === 'online' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Link Meeting</label>
                  <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="w-full p-2 border rounded" placeholder="https://meet.google.com/..." />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedConsultation(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
              <button
                onClick={() => handleUpdate(selectedConsultation.id, {
                  diagnosis,
                  prescription,
                  consultation_notes: notes,
                  meeting_link: meetingLink
                })}
                disabled={updating === selectedConsultation.id}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {updating === selectedConsultation.id ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

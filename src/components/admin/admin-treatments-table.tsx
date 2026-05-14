'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Stethoscope, Search } from 'lucide-react'

interface Doctor {
  id: string
  profiles: { full_name: string | null }
}

interface Treatment {
  id: string
  symptoms: string
  diagnosis: string | null
  prescription: string | null
  treatment_notes: string | null
  status: string
  payment_status: string
  follow_up_date: string | null
  created_at: string
  pets: { name: string; species: string; breed: string | null }
  doctors: { id: string; profiles: { full_name: string | null } } | null
}

interface AdminTreatmentsTableProps {
  treatments: Treatment[]
  doctors: Doctor[]
}

export default function AdminTreatmentsTable({ treatments, doctors }: AdminTreatmentsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [notes, setNotes] = useState('')
  const [followUp, setFollowUp] = useState('')

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.pets?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
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

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID')

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/treatments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, diagnosis, prescription, treatment_notes: notes, follow_up_date: followUp || null })
      })
      if (!res.ok) throw new Error('Failed')
      window.location.reload()
    } catch (err) {
      alert('Gagal memperbarui')
    } finally {
      setUpdating(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedTreatment) return
    setUpdating(selectedTreatment.id)
    try {
      const res = await fetch(`/api/treatments/${selectedTreatment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis, prescription, treatment_notes: notes, follow_up_date: followUp || null })
      })
      if (!res.ok) throw new Error('Failed')
      setSelectedTreatment(null)
      window.location.reload()
    } catch (err) {
      alert('Gagal menyimpan')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama hewan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keluhan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTreatments.map((treatment) => (
                <tr key={treatment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{treatment.pets?.name}</div>
                    <div className="text-sm text-gray-500">{treatment.pets?.species}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-xs truncate">{treatment.symptoms}</div>
                  </td>
                  <td className="px-6 py-4">
                    {treatment.doctors ? `Dr. ${treatment.doctors.profiles?.full_name}` : '-'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(treatment.status)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${treatment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {treatment.payment_status === 'paid' ? 'Lunas' : 'Belum'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedTreatment(treatment)
                        setDiagnosis(treatment.diagnosis || '')
                        setPrescription(treatment.prescription || '')
                        setNotes(treatment.treatment_notes || '')
                        setFollowUp(treatment.follow_up_date || '')
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Catatan Medis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medical Notes Modal */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              Catatan Medis: {selectedTreatment.pets?.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Keluhan</label>
                <p className="text-gray-700 bg-gray-50 p-2 rounded">{selectedTreatment.symptoms}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resep Obat</label>
                <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} rows={3} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan / Tindakan</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Follow-up (opsional)</label>
                <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedTreatment(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveNotes} disabled={updating === selectedTreatment.id} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
                {updating === selectedTreatment.id ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

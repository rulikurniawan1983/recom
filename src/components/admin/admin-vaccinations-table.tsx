'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, User, Calendar, Search, Filter } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Doctor {
  id: string
  profiles: { full_name: string | null }
}

interface Vaccination {
  id: string
  vaccination_date: string
  status: string
  vaccine_type: string
  batch_number: string | null
  notes: string | null
  admin_notes: string | null
  qr_code: string | null
  ticket_id: string | null
  pets: { name: string; species: string; breed: string | null }
  doctors: { id: string; profiles: { full_name: string | null } } | null
}

interface AdminVaccinationsTableProps {
  vaccinations: Vaccination[]
  doctors?: Doctor[]
  loading?: boolean
  onBack?: () => void
}

export default function AdminVaccinationsTable({ vaccinations, doctors = [], loading, onBack }: AdminVaccinationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<Vaccination | null>(null)
  const [assignDoctor, setAssignDoctor] = useState<Vaccination | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const filteredVaccinations = vaccinations.filter(v => {
    const matchesSearch =
      v.pets?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800'
    }
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      confirmed: 'Terkonfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      no_show: 'Tidak Hadir'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const handleStatusUpdate = async (vaccinationId: string, newStatus: string) => {
    setUpdating(vaccinationId)
    try {
      const response = await fetch(`/api/vaccinations/${vaccinationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, admin_notes: adminNotes })
      })

      if (!response.ok) {
        alert('Gagal memperbarui status')
      } else {
        window.location.reload()
      }
    } catch (err) {
      alert('Terjadi kesalahan')
    } finally {
      setUpdating(null)
    }
  }

  const handleAssignDoctor = async () => {
    if (!assignDoctor || !selectedDoctor) return
    setUpdating(assignDoctor.id)
    try {
      const response = await fetch(`/api/vaccinations/${assignDoctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoctor })
      })

      if (!response.ok) {
        alert('Gagal menugaskan dokter')
      } else {
        setAssignDoctor(null)
        setSelectedDoctor('')
        window.location.reload()
      }
    } catch (err) {
      alert('Terjadi kesalahan')
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vaksinasi</h1>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Kembali ke Dashboard
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Memuat data vaksinasi...</div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama hewan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Terkonfirmasi</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hewan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jadwal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dokter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket / QR
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVaccinations.map((vaccination) => (
                <tr key={vaccination.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {vaccination.pets?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vaccination.pets?.species} {vaccination.pets?.breed && `• ${vaccination.pets.breed}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(vaccination.vaccination_date)}
                    </div>
                    {vaccination.doctors && (
                      <div className="text-xs text-gray-500">
                        Dr. {vaccination.doctors.profiles?.full_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vaccination.doctors ? (
                      <span className="text-sm text-gray-900">
                        Dr. {vaccination.doctors.profiles?.full_name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Belum ditugaskan</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vaccination.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vaccination.ticket_id ? (
                      <div className="text-xs">
                        <div className="font-mono text-gray-700">{vaccination.ticket_id}</div>
                        {vaccination.qr_code && (
                          <div className="text-gray-500 truncate max-w-[150px]" title={vaccination.qr_code}>
                            {vaccination.qr_code}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowDetails(vaccination)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Detail"
                      >
                        Detail
                      </button>

                      {vaccination.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(vaccination.id, 'confirmed')}
                            disabled={updating === vaccination.id}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Konfirmasi"
                          >
                            {updating === vaccination.id ? '...' : 'Konfirmasi'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(vaccination.id, 'cancelled')}
                            disabled={updating === vaccination.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Batalkan"
                          >
                            Batalkan
                          </button>
                        </>
                      )}

                      {vaccination.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(vaccination.id, 'completed')}
                          disabled={updating === vaccination.id}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Selesai"
                        >
                          Selesai
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setAssignDoctor(vaccination)
                          setSelectedDoctor(vaccination.doctors?.id || '')
                        }}
                        className="text-teal-600 hover:text-teal-800"
                        title="Tugaskan Dokter"
                      >
                        Dokter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

{filteredVaccinations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Tidak ada data vaksinasi
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

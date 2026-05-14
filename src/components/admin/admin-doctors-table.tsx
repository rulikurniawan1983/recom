'use client'

import { useState } from 'react'
import { Search, User, Eye, ToggleLeft, ToggleRight } from 'lucide-react'

interface Doctor {
  id: string
  license_number: string
  specialization: string | null
  years_of_experience: number | null
  biography: string | null
  is_active: boolean
  created_at: string
  profiles: { full_name: string | null; email: string }
}

interface AdminDoctorsTableProps {
  doctors: Doctor[]
}

export default function AdminDoctorsTable({ doctors }: AdminDoctorsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredDoctors = doctors.filter(d =>
    d.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleActive = async (doctor: Doctor) => {
    setUpdatingId(doctor.id)
    try {
      const res = await fetch(`/api/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !doctor.is_active })
      })
      if (!res.ok) throw new Error('Failed')
      window.location.reload()
    } catch (err) {
      alert('Gagal mengubah status')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID')

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama dokter atau nomor lisensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Lisensi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengalaman</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {doctor.profiles?.full_name || 'Nama tidak tersedia'}
                        </div>
                        <div className="text-sm text-gray-500">{doctor.profiles?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{doctor.specialization || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{doctor.license_number}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {doctor.years_of_experience ? `${doctor.years_of_experience} tahun` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${doctor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {doctor.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(doctor)}
                        disabled={updatingId === doctor.id}
                        className={`${doctor.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} text-sm font-medium disabled:opacity-50`}
                        title={doctor.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {updatingId === doctor.id ? '...' : doctor.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada data dokter</div>
        )}
      </div>
    </div>
  )
}

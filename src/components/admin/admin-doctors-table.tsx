'use client'

import { useState } from 'react'
import { Search, User, Eye, ToggleLeft, ToggleRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Doctor {
  id: string
  user_id: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  clinic_name: string | null
  clinic_address: string | null
  license_number: string
  specialization: string | null
  years_of_experience: number | null
  biography: string | null
  is_active: boolean
  created_at: string
}

interface AdminDoctorsTableProps {
  doctors: Doctor[]
}

export default function AdminDoctorsTable({ doctors: initialDoctors }: AdminDoctorsTableProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    clinic_name: '',
    clinic_address: '',
    license_number: '',
    specialization: '',
    years_of_experience: '',
    biography: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const filteredDoctors = doctors.filter(d =>
    d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
      setDoctors(prev => prev.map(d => d.id === doctor.id ? { ...d, is_active: !d.is_active } : d))
    } catch (err) {
      alert('Gagal mengubah status')
    } finally {
      setUpdatingId(null)
    }
  }

  const openAddModal = () => {
    setEditingDoctor(null)
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      clinic_name: '',
      clinic_address: '',
      license_number: '',
      specialization: '',
      years_of_experience: '',
      biography: '',
    })
    setShowModal(true)
  }

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      full_name: doctor.full_name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      clinic_name: doctor.clinic_name || '',
      clinic_address: doctor.clinic_address || '',
      license_number: doctor.license_number,
      specialization: doctor.specialization || '',
      years_of_experience: doctor.years_of_experience?.toString() || '',
      biography: doctor.biography || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        ...formData,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
      }

      let res: Response
      if (editingDoctor) {
        res = await fetch(`/api/doctors/${editingDoctor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      } else {
          res = await fetch('/api/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      }

      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      
      if (editingDoctor) {
        setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? { ...d, ...data.data } : d))
      } else {
        setDoctors(prev => [data.data, ...prev])
      }
      setShowModal(false)
    } catch (err) {
      alert('Gagal menyimpan data dokter')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari nama dokter atau nomor lisensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openAddModal} className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Dokter
        </Button>
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
                          {doctor.full_name || 'Nama tidak tersedia'}
                        </div>
                        <div className="text-sm text-gray-500">{doctor.email || '-'}</div>
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
                        onClick={() => openEditModal(doctor)}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                        title="Edit"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Edit Dokter' : 'Tambah Dokter Baru'}</DialogTitle>
            <DialogDescription>
              {editingDoctor ? 'Ubah data dokter' : 'Buat profil dokter baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">No. Telepon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nomor Lisensi *</label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Klinik</label>
              <Input
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat Klinik</label>
              <textarea
                value={formData.clinic_address}
                onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Spesialisasi</label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pengalaman (tahun)</label>
              <Input
                type="number"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Biografi</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                disabled={submitting}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : editingDoctor ? 'Simpan Perubahan' : 'Tambah Dokter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
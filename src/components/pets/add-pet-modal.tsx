'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AddPetModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddPetModal({ isOpen, onClose }: AddPetModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age_years: 0,
    age_months: 0,
    gender: 'jantan',
    weight_kg: '',
    color: '',
    distinctive_features: '',
    health_history: ''
  })

  const speciesOptions = [
    'Anjing',
    'Kucing',
    'Sapi',
    'Kambing',
    'Kelinci',
    'Burung',
    'Reptil',
    'Ikan',
    'Lainnya'
  ]

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        species: '',
        breed: '',
        age_years: 0,
        age_months: 0,
        gender: 'jantan',
        weight_kg: '',
        color: '',
        distinctive_features: '',
        health_history: ''
      })
      setError('')
    }
  }, [isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Anda harus login terlebih dahulu')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('pets')
        .insert({
          user_id: user.id,
          name: formData.name,
          species: formData.species,
          breed: formData.breed || null,
          age_years: formData.age_years || 0,
          age_months: formData.age_months || 0,
          gender: formData.gender,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          color: formData.color || null,
          distinctive_features: formData.distinctive_features || null,
          health_history: formData.health_history || null
        })

      if (error) {
        throw new Error(error.message)
      }

      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Tambah Hewan Baru</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Hewan *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Contoh: Budi, Milo, etc"
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Hewan *
              </label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Pilih jenis...</option>
                {speciesOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ras / Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Contoh: Labrador, Persian, etc"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="jantan">Jantan</option>
                <option value="betina">Betina</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            {/* Age Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umur (Tahun)
              </label>
              <input
                type="number"
                name="age_years"
                value={formData.age_years}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Age Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umur (Bulan)
              </label>
              <input
                type="number"
                name="age_months"
                value={formData.age_months}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Berat (kg)
              </label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                step="0.1"
                min={0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warna Bulu
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Contoh: Coklat, Putih, Belang, etc"
              />
            </div>

            {/* Distinctive Features */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciri Khas (opsional)
              </label>
              <input
                type="text"
                name="distinctive_features"
                value={formData.distinctive_features}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Ciri khas fisik, seperti belang, cacat, dll"
              />
            </div>

            {/* Health History */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Riwayat Kesehatan (opsional)
              </label>
              <textarea
                name="health_history"
                value={formData.health_history}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Vaksinasi sebelumnya, penyakit yang pernah diderita, alergi, operasi, dll"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Hewan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditPetPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const speciesOptions = ['Anjing', 'Kucing', 'Sapi', 'Kambing', 'Kelinci', 'Burung', 'Reptil', 'Ikan', 'Lainnya']

  useEffect(() => {
    fetchPet()
  }, [petId])

  const fetchPet = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single()

    if (error || !data) {
      setError('Hewan tidak ditemukan')
      return
    }

    // Verify ownership
    if (data.user_id !== user.id) {
      setError('Tidak memiliki akses')
      return
    }

    setFormData({
      name: data.name || '',
      species: data.species || '',
      breed: data.breed || '',
      age_years: data.age_years || 0,
      age_months: data.age_months || 0,
      gender: data.gender || 'jantan',
      weight_kg: data.weight_kg?.toString() || '',
      color: data.color || '',
      distinctive_features: data.distinctive_features || '',
      health_history: data.health_history || ''
    })
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('pets')
      .update({
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
      .eq('id', petId)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard/pets')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Hapus hewan ini? Tindakan ini tidak dapat dibatalkan.')) return

    const { error } = await supabase
      .from('pets')
      .update({ is_active: false })
      .eq('id', petId)

    if (error) {
      alert('Gagal menghapus')
    } else {
      router.push('/dashboard/pets')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Hewan</h2>
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nama *</label>
              <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jenis *</label>
              <select name="species" value={formData.species} onChange={handleChange} required className="w-full p-2 border rounded">
                <option value="">Pilih...</option>
                {speciesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ras/Breed</label>
              <input name="breed" value={formData.breed} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jenis Kelamin *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full p-2 border rounded">
                <option value="jantan">Jantan</option>
                <option value="betina">Betina</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Umur (Tahun)</label>
              <input type="number" name="age_years" value={formData.age_years} onChange={handleChange} min={0} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Umur (Bulan)</label>
              <input type="number" name="age_months" value={formData.age_months} onChange={handleChange} min={0} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Berat (kg)</label>
              <input type="number" step="0.1" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Warna Bulu</label>
              <input name="color" value={formData.color} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Ciri Khas</label>
              <input name="distinctive_features" value={formData.distinctive_features} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Riwayat Kesehatan</label>
              <textarea name="health_history" value={formData.health_history} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Hapus Hewan
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

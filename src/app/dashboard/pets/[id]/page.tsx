'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { X } from 'lucide-react'
import { Link } from 'next/router'

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pet, setPet] = useState(null)
  const [vaccinations, setVaccinations] = useState([])
  const [treatments, setTreatments] = useState([])
  const [consultations, setConsultations] = useState([])

  const supabase = createClient()

  useEffect(() => {
    fetchPetData()
  }, [petId])

  const fetchPetData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch pet data
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .eq('user_id', user.id)
        .single()

      if (petError || !petData) {
        setError('Hewan tidak ditemukan atau Anda tidak memiliki akses')
        return
      }

      setPet(petData)

      // Fetch vaccinations
      const { data: vacData, error: vacError } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('pet_id', petId)
        .order('vaccination_date', { ascending: false })

      if (!vacError) {
        setVaccinations(vacData || [])
      }

      // Fetch treatments
      const { data: treatData, error: treatError } = await supabase
        .from('treatments')
        .select('*')
        .eq('pet_id', petId)
        .order('scheduled_date', { ascending: false })

      if (!treatError) {
        setTreatments(treatData || [])
      }

      // Fetch consultations
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .select('*')
        .eq('pet_id', petId)
        .order('scheduled_date', { ascending: false })

      if (!consultError) {
        setConsultations(consultData || [])
      }

      setLoading(false)
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data')
      setLoading(false)
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'jantan': return 'Jantan'
      case 'betina': return 'Betina'
      default: return gender
    }
  }

  const getAgeString = (years: number, months: number) => {
    const parts = []
    if (years > 0) parts.push(`${years} tahun`)
    if (months > 0) parts.push(`${months} bulan`)
    return parts.join(' ') || '0 bulan'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-gray-500">Data hewan tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {pet.species} {pet.breed && `• ${pet.breed}`}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href={`/dashboard/pets/${pet.id}/edit`}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </Link>
            <button 
              onClick={() => router.push('/dashboard/pets')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                 title="Kembali ke daftar hewan" />
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
              <p className="text-base text-gray-900">{getGenderLabel(pet.gender)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Umur</p>
              <p className="text-base text-gray-900">{getAgeString(pet.age_years, pet.age_months)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Berat</p>
              <p className="text-base text-gray-900">
                {pet.weight_kg ? `${pet.weight_kg} kg` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Warna Bulu</p>
              <p className="text-base text-gray-900">
                {pet.color || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ciri Khas</p>
              <p className="text-base text-gray-900">
                {pet.distinctive_features || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Health History */}
        {pet.health_history && (
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Kesehatan</h2>
            <p className="text-gray-700">{pet.health_history}</p>
          </div>
        )}

        {/* Vaccinations */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Riwayat Vaksinasi ({vaccinations.length})
          </h2>
          {vaccinations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data vaksinasi</p>
          ) : (
            <div className="space-y-4">
              {vaccinations.map((vac) => (
                <div key={vac.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {vac.vaccine_type || 'Vaksin'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tanggal: {new Date(vac.vaccination_date).toLocaleDateString('id-ID')}
                      </p>
                      {vac.status && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vac.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : vac.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vac.status.charAt(0).toUpperCase() + vac.status.slice(1)}
                        </span>
                      )}
                    </div>
                    {vac.qr_code && (
                      <div className="flex items-center">
                        {/* QR code display would go here */}
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-sm">
                          QR
                        </div>
                      </div>
                    )}
                  </div>
                  {vac.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      Catatan: {vac.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Treatments */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Riwayat Pengobatan ({treatments.length})
          </h2>
          {treatments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data pengobatan</p>
          ) : (
            <div className="space-y-4">
              {treatments.map((treat) => (
                <div key={treat.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {treat.treatment_type || 'Pengobatan'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tanggal: {new Date(treat.scheduled_date).toLocaleDateString('id-ID')}
                      </p>
                      {treat.status && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          treat.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : treat.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {treat.status.charAt(0).toUpperCase() + treat.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {treat.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      Deskripsi: {treat.description}
                    </p>
                  )}
                  {treat.medication && (
                    <p className="mt-2 text-sm text-gray-600">
                      Obat: {treat.medication}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consultations */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Riwayat Konsultasi ({consultations.length})
          </h2>
          {consultations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data konsultasi</p>
          ) : (
            <div className="space-y-4">
              {consultations.map((cons) => (
                <div key={cons.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {cons.consultation_type || 'Konsultasi'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tanggal: {new Date(cons.scheduled_date).toLocaleDateString('id-ID')}
                      </p>
                      {cons.status && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          cons.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : cons.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cons.status.charAt(0).toUpperCase() + cons.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  {cons.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      Catatan: {cons.notes}
                    </p>
                  )}
                  {cons.vet_name && (
                    <p className="mt-2 text-sm text-gray-600">
                      Dokter: {cons.vet_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
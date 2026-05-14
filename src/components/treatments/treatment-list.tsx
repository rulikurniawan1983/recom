'use client'

import { Stethoscope, Calendar, FileText, Clock, DollarSign } from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
}

interface Doctor {
  id: string
  specialization: string | null
  profiles: {
    full_name: string | null
  }
}

interface Treatment {
  id: string
  symptoms: string
  diagnosis: string | null
  prescription: string | null
  status: string
  payment_status: string
  follow_up_date: string | null
  created_at: string
  pets: Pet
  doctors: Doctor
}

interface TreatmentListProps {
  treatments: Treatment[]
  pets: Pet[]
}

export default function TreatmentList({ treatments }: TreatmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu'
      case 'confirmed': return 'Terkonfirmasi'
      case 'in_progress': return 'Berlangsung'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {treatments.map((treatment) => (
        <div
          key={treatment.id}
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {treatment.pets?.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                  {getStatusText(treatment.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  treatment.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {treatment.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {treatment.pets?.species} {treatment.pets?.breed && `- ${treatment.pets.breed}`}
              </p>

              {treatment.doctors?.profiles?.full_name && (
                <p className="text-sm text-teal-600 mb-2">
                  Dr. {treatment.doctors.profiles.full_name}
                  {treatment.doctors.specialization && ` • ${treatment.doctors.specialization}`}
                </p>
              )}

              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">Keluhan:</span> {treatment.symptoms}
                  </div>
                </div>

                {treatment.diagnosis && (
                  <div className="flex items-start gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Diagnosis:</span> {treatment.diagnosis}
                    </div>
                  </div>
                )}

                {treatment.prescription && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Resep:</span> {treatment.prescription}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Dibuat: {formatDate(treatment.created_at)}
                </div>

                {treatment.follow_up_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Follow-up: {formatDate(treatment.follow_up_date)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 md:min-w-[140px]">
              <div className="flex-1 md:flex-none p-3 bg-gray-50 rounded-lg text-center">
                <DollarSign className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Pembayaran</p>
                <p className={`text-sm font-semibold ${
                  treatment.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {treatment.payment_status === 'paid' ? 'Lunas' : 'Belum'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {treatments.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Stethoscope className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada permintaan pengobatan
          </h3>
          <p className="text-gray-500">
            Buat permintaan pengobatan untuk hewan peliharaan Anda.
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { Video, Calendar, Clock, Monitor } from 'lucide-react'

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
  pets: Pet
  doctors: Doctor
}

interface ConsultationListProps {
  consultations: Consultation[]
  pets: Pet[]
}

export default function ConsultationList({ consultations }: ConsultationListProps) {
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <div key={consultation.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{consultation.pets?.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                  {consultation.status === 'pending' ? 'Menunggu' :
                   consultation.status === 'confirmed' ? 'Terkonfirmasi' :
                   consultation.status === 'completed' ? 'Selesai' : consultation.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  consultation.consultation_type === 'online'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  <div className="flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    {consultation.consultation_type === 'online' ? 'Online' : 'Offline'}
                  </div>
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Dr. {consultation.doctors?.profiles?.full_name}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDate(consultation.scheduled_date)}
              <Clock className="h-4 w-4 ml-4 mr-2 text-gray-400" />
              {formatTime(consultation.scheduled_time)}
            </div>

            {consultation.meeting_link && (
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-2 text-blue-500" />
                <a href={consultation.meeting_link} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">
                  Link Meeting
                </a>
              </div>
            )}

            {consultation.location && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Lokasi: {consultation.location}
              </div>
            )}

            {consultation.diagnosis && (
              <div className="mt-3 pt-3 border-t">
                <p className="font-medium">Diagnosis:</p>
                <p className="text-gray-700">{consultation.diagnosis}</p>
              </div>
            )}

            {consultation.prescription && (
              <div className="mt-2">
                <p className="font-medium">Resep:</p>
                <p className="text-gray-700">{consultation.prescription}</p>
              </div>
            )}
          </div>

          {consultation.status === 'completed' && consultation.is_rated && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < (consultation.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              {consultation.review && (
                <p className="text-sm text-gray-600 mt-1">"{consultation.review}"</p>
              )}
            </div>
          )}
        </div>
      ))}

      {consultations.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada konsultasi</h3>
          <p className="text-gray-500">Jadwalkan konsultasi dengan dokter hewan.</p>
        </div>
      )}
    </div>
  )
}

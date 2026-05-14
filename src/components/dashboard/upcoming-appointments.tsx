'use client'

import { Syringe, Stethoscope, Video, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  vaccination_date?: string
  scheduled_date?: string
  scheduled_time?: string
  created_at?: string
  status: string
  pets: {
    name: string
    species: string
    breed: string | null
  }
  doctors: {
    profiles: {
      full_name: string | null
    }
  } | null
}

interface UpcomingAppointmentsProps {
  vaccinations: Appointment[]
  treatments: Appointment[]
  consultations: Appointment[]
}

export default function UpcomingAppointments({
  vaccinations,
  treatments,
  consultations
}: UpcomingAppointmentsProps) {
  const sections = [
    {
      title: 'Vaksinasi Rabies',
      icon: Syringe,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: vaccinations,
      dateKey: 'vaccination_date' as const,
      href: '/dashboard/vaccinations'
    },
    {
      title: 'Pengobatan',
      icon: Stethoscope,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      items: treatments,
      dateKey: 'created_at' as const, // We'll use created_at as appointment date
      href: '/dashboard/treatments'
    },
    {
      title: 'Konsultasi',
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: consultations,
      dateKey: 'scheduled_date' as const,
      href: '/dashboard/consultations'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <div key={section.title} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${section.color}`} />
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
              </div>
              <Link
                href={section.href}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="divide-y">
              {section.items.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Icon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Tidak ada {section.title.toLowerCase()}</p>
                </div>
              ) : (
                section.items.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.pets?.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.pets?.species} {item.pets?.breed && `- ${item.pets.breed}`}
                        </p>
                        {item.doctors?.profiles?.full_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Dr. {item.doctors.profiles.full_name}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="inline-flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item[section.dateKey] || null)}
                          </span>
                          {item.scheduled_time && (
                            <span className="inline-flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.scheduled_time}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status === 'pending' ? 'Menunggu' :
                         item.status === 'confirmed' ? 'Terkonfirmasi' :
                         item.status === 'completed' ? 'Selesai' :
                         item.status === 'cancelled' ? 'Dibatalkan' :
                         item.status === 'in_progress' ? 'Berlangsung' : item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

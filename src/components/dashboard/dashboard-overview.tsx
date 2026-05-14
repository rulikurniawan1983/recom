'use client'

import { Heart, Syringe, Stethoscope, Video } from 'lucide-react'

interface DashboardOverviewProps {
  petsCount: number
  upcomingVaccinations: number
  upcomingTreatments: number
  upcomingConsultations: number
}

export default function DashboardOverview({
  petsCount,
  upcomingVaccinations,
  upcomingTreatments,
  upcomingConsultations
}: DashboardOverviewProps) {
  const stats = [
    {
      label: 'Hewan Peliharaan',
      value: petsCount,
      icon: Heart,
      color: 'bg-blue-100 text-blue-600',
      href: '/dashboard/pets'
    },
    {
      label: 'Vaksinasi Aktif',
      value: upcomingVaccinations,
      icon: Syringe,
      color: 'bg-green-100 text-green-600',
      href: '/dashboard/vaccinations'
    },
    {
      label: 'Pengobatan Aktif',
      value: upcomingTreatments,
      icon: Stethoscope,
      color: 'bg-yellow-100 text-yellow-600',
      href: '/dashboard/treatments'
    },
    {
      label: 'Konsultasi Aktif',
      value: upcomingConsultations,
      icon: Video,
      color: 'bg-purple-100 text-purple-600',
      href: '/dashboard/consultations'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <a
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

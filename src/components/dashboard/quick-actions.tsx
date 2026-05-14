'use client'

import { PlusCircle, Syringe, Stethoscope, Video, Heart } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      title: 'Tambah Hewan Baru',
      description: 'Daftarkan hewan peliharaan baru',
      icon: PlusCircle,
      color: 'bg-blue-100 text-blue-600',
      href: '/dashboard/pets/new'
    },
    {
      title: 'Booking Vaksinasi',
      description: 'Jadwalkan vaksinasi rabies',
      icon: Syringe,
      color: 'bg-green-100 text-green-600',
      href: '/dashboard/vaccinations/book'
    },
    {
      title: 'Booking Pengobatan',
      description: 'Jadwalkan pemeriksaan kesehatan',
      icon: Stethoscope,
      color: 'bg-yellow-100 text-yellow-600',
      href: '/dashboard/treatments/book'
    },
    {
      title: 'Konsultasi',
      description: 'Chat atau video call dengan dokter',
      icon: Video,
      color: 'bg-purple-100 text-purple-600',
      href: '/dashboard/consultations/book'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <Link
          href="/dashboard/pets"
          className="flex items-center justify-center w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
        >
          <Heart className="h-5 w-5 mr-2" />
          Lihat Semua Hewan
        </Link>
      </div>
    </div>
  )
}

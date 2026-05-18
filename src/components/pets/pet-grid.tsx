'use client'

import { Edit, Trash2, Syringe, Stethoscope, Video, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  age_years: number
  age_months: number
  gender: 'jantan' | 'betina' | 'lainnya'
  weight_kg: number | null
  color: string | null
  distinctive_features: string | null
  health_history: string | null
  vaccinations: Array<{ id: string; status: string }> | null
  treatments: Array<{ id: string; status: string }> | null
  consultations: Array<{ id: string; status: string }> | null
}

interface PetGridProps {
  pets: Pet[]
}

export default function PetGrid({ pets }: PetGridProps) {
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

const getActiveCount = (items: { id: string; status: string }[] | null) => {
  if (!items) return 0
  return items.filter(i => i.status === 'pending' || i.status === 'confirmed').length
}

  if (pets.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border">
        <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada hewan peliharaan</h3>
        <p className="text-gray-500">Mulai dengan menambahkan hewan peliharaan pertama Anda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Pet Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-600">
                  {pet.species} {pet.breed && `• ${pet.breed}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/pets/${pet.id}/edit`}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm('Hapus hewan ini? Tindakan ini tidak dapat dibatalkan.')) return
                    await supabase.from('pets').update({ is_active: false }).eq('id', pet.id)
                    window.location.reload()
                  }}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {getGenderLabel(pet.gender)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {getAgeString(pet.age_years, pet.age_months)}
              </span>
              {pet.weight_kg && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {pet.weight_kg} kg
                </span>
              )}
              {pet.color && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {pet.color}
                </span>
              )}
            </div>

            {pet.health_history && (
              <div className="mt-3 text-sm text-gray-600">
                <strong>Catatan kesehatan:</strong> {pet.health_history}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-50 px-6 py-4 grid grid-cols-3 gap-4 border-t">
            <Link href={`/dashboard/vaccinations?pet=${pet.id}`} className="text-center group">
              <div className="flex items-center justify-center">
                <Syringe className="h-5 w-5 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900">{getActiveCount(pet.vaccinations)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Vaksinasi</p>
            </Link>
            <Link href={`/dashboard/treatments?pet=${pet.id}`} className="text-center group">
              <div className="flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-yellow-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900">{getActiveCount(pet.treatments)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Pengobatan</p>
            </Link>
            <Link href={`/dashboard/consultations?pet=${pet.id}`} className="text-center group">
              <div className="flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900">{getActiveCount(pet.consultations)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Konsultasi</p>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

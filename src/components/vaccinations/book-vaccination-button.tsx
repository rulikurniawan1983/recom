'use client'

import { Syringe } from 'lucide-react'
import { useState } from 'react'
import BookVaccinationModal from '@/components/vaccinations/book-vaccination-modal'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
}

export default function BookVaccinationButton({ pets, userId }: { pets: Pet[]; userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  if (pets.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        <Syringe className="h-5 w-5" />
        Booking Vaksinasi
      </button>

      <BookVaccinationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pets={pets}
        userId={userId}
        onBookingComplete={() => window.location.reload()}
      />
    </>
  )
}

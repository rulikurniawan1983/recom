'use client'

import { Stethoscope } from 'lucide-react'
import { useState } from 'react'
import TreatmentBookingModal from '@/components/treatments/book-treatment-modal'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
}

export default function BookTreatmentButton({ pets, userId }: { pets: Pet[]; userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  if (pets.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
      >
        <Stethoscope className="h-5 w-5" />
        Booking Pengobatan
      </button>
      <TreatmentBookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pets={pets}
        userId={userId}
      />
    </>
  )
}

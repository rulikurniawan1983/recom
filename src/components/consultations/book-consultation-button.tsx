'use client'

import { Video } from 'lucide-react'
import { useState } from 'react'
import ConsultationBookingModal from '@/components/consultations/book-consultation-modal'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
}

export default function BookConsultationButton({ pets, userId }: { pets: Pet[]; userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  if (pets.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
      >
        <Video className="h-5 w-5" />
        Booking Konsultasi
      </button>
      <ConsultationBookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pets={pets}
        userId={userId}
      />
    </>
  )
}

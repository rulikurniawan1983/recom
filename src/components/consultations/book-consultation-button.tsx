'use client'

import { Video } from 'lucide-react'
import { useState } from 'react'

export default function BookConsultationButton({ pets }: { pets: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  if (pets.length === 0) return null
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
        <Video className="h-5 w-5" /> Booking Konsultasi
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Booking Konsultasi</h2>
            <p className="text-gray-500 mb-4">Fitur booking konsultasi sedang dikembangkan.</p>
            <button onClick={() => setIsOpen(false)} className="w-full py-2 bg-purple-600 text-white rounded-lg">Tutup</button>
          </div>
        </div>
      )}
    </>
  )
}

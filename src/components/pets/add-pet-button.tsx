'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import AddPetModal from '@/components/pets/add-pet-modal'

interface AddPetButtonProps {
  userId: string
}

export default function AddPetButton({ userId }: AddPetButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
      >
        <Plus className="h-5 w-5" />
        Tambah Hewan
      </button>

      <AddPetModal isOpen={isOpen} onClose={() => setIsOpen(false)} userId={userId} />
    </>
  )
}

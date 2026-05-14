'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart, Calendar, Pill, Stethoscope, Clipboard } from 'lucide-react'
import Link from 'next/link'

interface ServiceOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  bgColor: string
}

const services: ServiceOption[] = [
  {
    id: 'register-pet',
    title: 'Registrasi Hewan',
    description: 'Daftarkan hewan peliharaan baru ke sistem',
    icon: <Heart className="h-8 w-8" />,
    href: '/dashboard/pets/register',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'vaccination',
    title: 'Booking Vaksinasi',
    description: 'Jadwalkan vaksinasi untuk hewan Anda',
    icon: <Calendar className="h-8 w-8" />,
    href: '/dashboard/vaccinations',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'medicine',
    title: 'Pembelian Obat',
    description: 'Pesan obat dan perawatan medis',
    icon: <Pill className="h-8 w-8" />,
    href: '/dashboard/treatments',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'consultation',
    title: 'Konsultasi Dokter',
    description: 'Konsultasi dengan dokter hewan profesional',
    icon: <Stethoscope className="h-8 w-8" />,
    href: '/dashboard/consultations',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'medical-records',
    title: 'Rekam Medis',
    description: 'Akses riwayat kesehatan hewan Anda',
    icon: <Clipboard className="h-8 w-8" />,
    href: '/dashboard/history',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
]

export function ServiceSelectionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Pilih Layanan Kesehatan Hewan</DialogTitle>
          <DialogDescription className="text-center text-base">
            Pilih layanan yang ingin Anda akses
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.href}
              onClick={() => onOpenChange(false)}
            >
              <div className="group h-full bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${service.bgColor} ${service.color} mb-4 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HeartPulse,
  Syringe,
  Stethoscope,
  Video,
  FileText,
  Calendar,
  Bell,
  PlusCircle,
  ClipboardList,
  UserPlus,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Beranda', icon: HeartPulse },
  { href: '/dashboard/pets', label: 'Hewan Saya', icon: HeartPulse },
  { href: '/dashboard/doctors', label: 'Tambah Dokter', icon: UserPlus },
  { href: '/dashboard/vaccinations', label: 'Vaksinasi', icon: Syringe },
  { href: '/dashboard/treatments', label: 'Pengobatan', icon: Stethoscope },
  { href: '/dashboard/consultations', label: 'Konsultasi', icon: Video },
  { href: '/dashboard/history', label: 'Riwayat', icon: FileText },
  { href: '/dashboard/appointments', label: 'Jadwal', icon: Calendar },
]

export default function VetDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
            <HeartPulse className="h-8 w-8" />
            Klinik Hewan
          </h1>
          <p className="text-sm text-gray-500 mt-1">Pelayanan Kesehatan Hewan</p>
        </div>

           <nav className="flex-1 p-4 space-y-1">
           {navItems.map((item) => {
             const Icon = item.icon
             const isActive = pathname === item.href ||
               (item.href !== '/dashboard' && pathname.startsWith(item.href))

             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                   isActive
                     ? 'bg-teal-50 text-teal-700 font-medium'
                     : 'text-gray-700 hover:bg-gray-100'
                 }`}
               >
                 <Icon className="h-5 w-5" />
                 {item.label}
               </Link>
             )
           })}
         </nav>

        <div className="p-4 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-teal-600">Klinik Hewan</h1>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
          {/* Mobile nav */}
          <div className="flex overflow-x-auto border-t py-2 px-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-1 text-xs whitespace-nowrap ${
                    isActive ? 'text-teal-600' : 'text-gray-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-0 mt-16 md:mt-0 p-6">
          {children}
        </main>



        {/* Service Selection Modal */}
        <ServiceSelectionModal
          open={showServiceModal}
          onOpenChange={setShowServiceModal}
        />
      </div>
    )
  }

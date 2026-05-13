'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn, Search } from 'lucide-react'
import { TrackingModalProvider, useTrackingModal } from '@/contexts/tracking-modal-context'

function HomePageContent() {
  const { openTrackingModal } = useTrackingModal()

  return (
    <div className="min-h-screen flex flex-col bg-blue-100/80 backdrop-blur-sm">
      {/* Navbar - Dark Blue */}
      <header className="bg-blue-900 backdrop-blur-sm border-b border-blue-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-lg font-bold text-white">SLIDER</div>
          <div className="flex gap-3">
            {/* Login Button */}
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Single Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900">Layanan Informasi</h2>
            <p className="mt-2 text-blue-600">Pilih layanan yang Anda butuhkan</p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: NKV */}
            <Link href="/nkv/register" className="group block">
              <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-white/80 backdrop-blur hover:bg-white/90 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-6 text-center">
                  <div className="text-5xl mb-3">🏭</div>
                  <h3 className="font-bold text-xl text-blue-900 mb-2">NKV</h3>
                  <p className="text-blue-600">Rekomendasi Nomor Kontrol Veteriner</p>
                </div>
              </div>
            </Link>

            {/* Card 2: Dokter Hewan */}
            <Link href="/dokter-hewan/register" className="group block">
              <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-white/80 backdrop-blur hover:bg-white/90 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-6 text-center">
                  <div className="text-5xl mb-3">🩺</div>
                  <h3 className="font-bold text-xl text-blue-900 mb-2">Dokter Hewan</h3>
                  <p className="text-blue-600">Rekomendasi Praktek Dokter Hewan</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Tracking Section */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Cek Status Permohonan</h3>
            <p className="text-blue-600 mb-4">Masukkan nomor tracking Anda untuk melihat status permohonan</p>
            <Button
              variant="outline"
              onClick={openTrackingModal}
              className="bg-white/80 backdrop-blur-sm hover:bg-blue-50 text-blue-600 border-blue-300"
            >
              <Search className="w-4 h-4 mr-2" />
              Buka Form Cek Status
            </Button>
          </div>
        </div>
      </main>

      {/* Footer - Dark Blue */}
      <footer className="bg-blue-900 border-t border-blue-800 p-4">
        <p className="text-center text-white text-sm">
          Copyright 2026 - DINAS PERIKANAN DAN PETERNAKAN KABUPATEN BOGOR
        </p>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <TrackingModalProvider>
      <HomePageContent />
    </TrackingModalProvider>
  )
}

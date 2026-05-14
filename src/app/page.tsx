'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn, Search, Shield, FileText, Stethoscope, CheckCircle, Calendar, Pill, Clipboard, QrCode, Syringe, Heart } from 'lucide-react'
import { TrackingModalProvider, useTrackingModal } from '@/contexts/tracking-modal-context'

function HomePageContent() {
  const { openTrackingModal } = useTrackingModal()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Modern Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
               <div className="flex flex-col">
                 <span className="text-xl font-bold text-gray-900 leading-tight">SLIDER - VETSYS</span>
                 <span className="text-xs text-gray-500">Sistem Layanan Digital Kesehatan Hewan</span>
               </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50">
                  <LogIn className="w-4 h-4 mr-2" />
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Screen */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Sistem Terpadu Kesehatan Hewan
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Selamat Datang di<br />
                <span className="text-blue-600">SLIDER - VETSYS</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Platform digital all-in-one untuk kesehatan hewan peliharaan Anda. 
                Booking vaksinasi, konsultasi dokter, pembelian obat, dan rekam medis digital.
              </p>

              {/* Quick CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all px-8 py-5 text-base">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={openTrackingModal}
                  className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-5 text-base"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Lacak Permohonan
                </Button>
              </div>
            </div>

            {/* Three Main Services */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Veterinary Healthcare Service */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Pelayanan Kesehatan Hewan</h2>
                <p className="text-blue-100 text-sm mb-4">
                 booking vaksinasi, konsultasi dokter, pembelian obat, dan rekam medis digital untuk hewan peliharaan Anda.
                </p>
                <Link href="/services/veterinary">
                  <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 w-full">
                    Lihat Layanan
                  </Button>
                </Link>
              </div>

              {/* NKV Registration */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Nomor Kontrol Veteriner (NKV)</h2>
                <p className="text-green-100 text-sm mb-4">
                  Rekomendasi NKV untuk usaha kesehatan hewan. Proses cepat dan terpercaya.
                </p>
                <Link href="/nkv/register">
                  <Button size="sm" className="bg-white text-green-600 hover:bg-green-50 w-full">
                    Ajukan NKV
                  </Button>
                </Link>
              </div>

              {/* Doctor Registration */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Rekomendasi Praktek Dokter Hewan</h2>
                <p className="text-purple-100 text-sm mb-4">
                  Ajukan rekomendasi untuk Praktek Dokter Hewan (PDH) di wilayah Anda.
                </p>
                <Link href="/dokter-hewan/register">
                  <Button size="sm" className="bg-white text-purple-600 hover:bg-purple-50 w-full">
                    Ajukan PDH
                  </Button>
                </Link>
              </div>
            </div>

            {/* Feature Highlights - Veterinary Services */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Fitur Pelayanan Kesehatan Hewan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Syringe className="h-6 w-6" />, title: 'Booking Vaksinasi', desc: 'Jadwalkan vaksinasi hewan' },
                  { icon: <Pill className="h-6 w-6" />, title: 'Pembelian Obat', desc: 'Belanja obat online' },
                  { icon: <Clipboard className="h-6 w-6" />, title: 'Konsultasi', desc: 'Chat dengan dokter hewan' },
                  { icon: <QrCode className="h-6 w-6" />, title: 'E-Ticket', desc: 'Tiket digital dengan QR' },
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-3">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Proses Cepat (3 hari kerja)
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Sistem Resmi Pemerintah
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                Tracking Real-time
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white">SLIDER - VETSYS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="#kontak" className="hover:text-white transition-colors">Kontak</Link>
              <Link href="#panduan" className="hover:text-white transition-colors">Panduan</Link>
              <Link href="/tracking" className="hover:text-white transition-colors">Lacak Permohonan</Link>
            </div>
            <p className="text-xs text-gray-500">© 2026 VETSYS - SLIDER</p>
          </div>
        </div>
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

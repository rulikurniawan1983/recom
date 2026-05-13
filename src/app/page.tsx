'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn, Search, Shield, FileText, Stethoscope, CheckCircle } from 'lucide-react'
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
                <span className="text-xl font-bold text-gray-900 leading-tight">SLIDER</span>
                <span className="text-xs text-gray-500 -mt-1">Dinas Peternakan</span>
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
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-5xl mx-auto">
            
            {/* Hero Header */}
            <div className="text-center mb-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
                <Shield className="h-3 w-3" />
                Sistem Resmi Dinas Peternakan & Perikanan Kabupaten Bogor
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                REKOMENDASI{' '}
                <span className="text-blue-600">ONLINE</span>
              </h1>

              {/* Subheading */}
              <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Layanan rekomendasi Nomor Kontrol Veteriner (NKV) dan Praktek Dokter Hewan 
                secara digital. Cepat, mudah, dan transparan.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
                <Link href="/nkv/register">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all px-8 py-5 text-base">
                    <FileText className="mr-2 h-5 w-5" />
                    Ajukan NKV
                  </Button>
                </Link>
                <Link href="/dokter-hewan/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-5 text-base">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Ajukan Praktek Dokter Hewan
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={openTrackingModal}
                  className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-5 text-base"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Lacak Permohonan
                </Button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-xs text-gray-500">Permohonan Diproses</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">95%</div>
                <div className="text-xs text-gray-500">Tingkat Persetujuan</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-xl md:text-2xl font-bold text-purple-600">&lt;3 hari</div>
                <div className="text-xs text-gray-500">Waktu Respons</div>
              </div>
            </div>

            {/* Quick Features Grid */}
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Proses Cepat</h3>
                <p className="text-xs text-gray-600">Respon maksimal 3 hari kerja</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Shield className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Terpercaya</h3>
                <p className="text-xs text-gray-600">Sistem resmi pemerintah</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Search className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Tracking Real-time</h3>
                <p className="text-xs text-gray-600">Pantau status permohonan</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white">SLIDER - Dinas Peternakan & Perikanan</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="#kontak" className="hover:text-white transition-colors">Kontak</Link>
              <Link href="#cara-pakai" className="hover:text-white transition-colors">Panduan</Link>
              <Link href="/tracking" className="hover:text-white transition-colors">Lacak</Link>
            </div>
            <p className="text-xs text-gray-500">© 2026 Din Peternakan & Perikanan Bogor</p>
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

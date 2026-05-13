'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowLeft } from 'lucide-react'

function TrackingPageContent() {
  const router = useRouter()
  const [trackingCode, setTrackingCode] = useState('')

  const handleSearch = () => {
    if (trackingCode.trim()) {
      router.push(`/tracking/${trackingCode.trim()}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lacak Permohonan</h1>
            <p className="text-gray-600">
              Masukkan nomor registrasi untuk melihat status permohonan Anda
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="tracking-code" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Registrasi
              </label>
              <Input
                id="tracking-code"
                type="text"
                placeholder="Contoh: NKV-2024-00123"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg text-center tracking-wider"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!trackingCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Search className="h-4 w-4 mr-2" />
              Lacak Permohonan
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Nomor registrasi dapat ditemukan di email konfirmasi atau di dashboard Anda
            </p>
          </div>
        </div>

        {/* Help Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">Butuh bantuan?</h3>
          <p className="text-sm text-blue-700">
            Jika Anda lupa nomor registrasi, silakan hubungi admin atau cek email konfirmasi yang dikirimkan saat pembuatan.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TrackingPage() {
  return (
    <div>
      <TrackingPageContent />
    </div>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import TrackingModal from '@/components/tracking/tracking-modal'

export default function HomePage() {
  const businessCards = [
    { icon: '🏭', label: 'RPH Unggas', info: 'Rumah Pemotongan Unggas' },
    { icon: '🐷', label: 'RPH Babi', info: 'Rumah Pemotongan Babi' },
    { icon: '🐄', label: 'RPH Sapi', info: 'Rumah Pemotongan Ruminansia' },
    { icon: '🥚', label: 'Petelur', info: 'Budidaya Unggas Petelur' },
    { icon: '🥛', label: 'Sapi Perah', info: 'Budidaya Sapi Perah' },
    { icon: '🧈', label: 'Pengolahan Susu', info: 'Unit Pengolahan Susu' },
    { icon: '🥩', label: 'Pengolahan Daging', info: 'Unit Pengolahan Daging' },
    { icon: '🍯', label: 'Pengolahan Madu', info: 'Unit Pengolahan Madu' },
    { icon: '❄️', label: 'Cold Storage', info: 'Gudang Pendingin' },
    { icon: '🛒', label: 'Meat Shop', info: 'Toko/Kios Daging' },
    { icon: '📦', label: 'Packaging', info: 'Pengemasan Telur' },
    { icon: '🚛', label: 'Distribusi', info: 'Usaha Impor/Ekspor' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-blue-100/80 backdrop-blur-sm">
      {/* Navbar - Dark Blue */}
      <header className="bg-blue-900 backdrop-blur-sm border-b border-blue-800 p-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">SLIDER</h1>
          <div className="flex gap-2">
            <TrackingModal />
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
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Title */}
          <div className="text-center mb-8">
            <p className="text-lg text-blue-600">Pilih Rekomendasi</p>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
            <Link href="/nkv/register">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <button className="relative w-full py-4 text-lg font-bold bg-orange-500 rounded-xl shadow-xl flex items-center justify-center text-white">
                  <span className="text-3xl mr-2">🏭</span> NKV
                </button>
              </div>
            </Link>
            <Link href="/dokter-hewan/register">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <button className="relative w-full py-4 text-lg font-bold bg-blue-500 rounded-xl shadow-xl flex items-center justify-center text-white">
                  <span className="text-3xl mr-2">🩺</span> DOKTER HEWAN
                </button>
              </div>
            </Link>
          </div>

          {/* Business Grid */}
          <div>
            <h3 className="text-center text-blue-900 font-bold mb-4">Jenis Rekomendasi</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {businessCards.map((item, i) => (
                <div key={i} className="bg-white/80 rounded-lg p-3 text-center border border-blue-200 shadow-md">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-bold text-blue-900">{item.label}</p>
                  <p className="text-[10px] text-blue-600">{item.info}</p>
                </div>
              ))}
            </div>
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
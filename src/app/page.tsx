import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope, FileText } from 'lucide-react'
import TrackingModal from '@/components/tracking/tracking-modal'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-blue-100/80 backdrop-blur-sm">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-blue-900">REKOMENDASI ONLINE</h1>
          <p className="text-xs text-blue-600">Dinas Perikanan dan Peternakan Kabupaten Bogor</p>
        </div>
        <div className="flex gap-2">
          <TrackingModal />
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Sistem Rekomendasi Veteriner Online
            </h2>
            <p className="text-blue-700">
              Ajukan permohonan NKV atau Praktek Dokter Hewan secara digital
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-blue-800">Nomor Kontrol Veteriner (NKV)</CardTitle>
                <CardDescription>
                  Rekomendasi NKV untuk unit usaha produk hewan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-600 space-y-1 mb-4">
                  <li>• Produk daging, telur, susu, terpakai</li>
                  <li>• Verifikasi dokumen digital</li>
                  <li>• Tracking proses real-time</li>
                </ul>
                <Link href="/nkv/register">
                  <Button variant="outline" className="w-full">Ajukan NKV</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Praktek Dokter Hewan</CardTitle>
                <CardDescription>
                  Rekomendasi praktik dokter hewan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-600 space-y-1 mb-4">
                  <li>• Klinik dokter hewan</li>
                  <li>• Verifikasi STRV & NIB</li>
                  <li>• Proses cepat 5 langkah</li>
                </ul>
                <Link href="/dokter-hewan/register">
                  <Button variant="outline" className="w-full">Ajukan Praktek</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Process */}
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-4">Proses Pengajuan: Isi Form → Upload Dokumen → Verifikasi → Selesai</h3>
            <p className="text-sm text-blue-600">
              © 2024 Dinas Perikanan dan Peternakan Kabupaten Bogor
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
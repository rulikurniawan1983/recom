import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DokterHewanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-lg flex items-center justify-center">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            REKOMENDASI PRAKTEK DOKTER HEWAN
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-gray-900">1. Pendaftaran Online</h3>
            <p className="text-sm text-gray-600">Klik Rekomendasi Praktek Dokter Hewan</p>
            <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
              <li>Data pribadi</li>
              <li>Lokasi praktik</li>
              <li>Dokumen: NIB, Sertifikat kompetensi, KTP, STRV</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold text-gray-900">2. Verifikasi Dokumen</h3>
            <p className="text-sm text-gray-600">Verifikasi oleh Dinas Perikanan dan Peternakan Kabupaten Bogor</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-bold text-gray-900">3. Pemeriksaan Lapangan</h3>
            <p className="text-sm text-gray-600">Pemeriksaan fasilitas klinik, kebersihan, prosedur pelayanan</p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-bold text-gray-900">4. Penilaian dan Rekomendasi</h3>
            <p className="text-sm text-gray-600">Laporan bisa di-print PDF</p>
          </div>
          
          <div className="border-l-4 border-indigo-500 pl-4">
            <h3 className="font-bold text-gray-900">5. Unduh Rekomendasi</h3>
            <p className="text-sm text-gray-600">Unduh dari website sebagai bukti resmi</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/dokter-hewan/register">
            <Button>Daftar Sekarang</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
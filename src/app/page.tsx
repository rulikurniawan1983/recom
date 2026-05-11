import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Rekomendasi NKV</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistem Rekomendasi NKV
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Layanan online untuk mendapatkan Rekomendasi NKV (Neraca Keseimbangan Vitalitas) 
            untuk unit usaha produk hewan
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pendaftaran Online</h3>
            <p className="text-gray-600">
              Isi formulir pendaftaran dengan data unit usaha, jenis produk hewan, 
              dan dokumen perusahaan. Dapatkan nomor registrasi sebagai bukti permohonan.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Verifikasi Dokumen</h3>
            <p className="text-gray-600">
              Tim verifikator Dinas Perikanan dan Peternakan memeriksa kelengkapan berkas. 
              Jika ada kekurangan, pemohon diminta melengkapi dokumen.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pemeriksaan Lapangan</h3>
            <p className="text-gray-600">
              Petugas menjadwalkan kunjungan ke lokasi usaha untuk pemeriksaan 
              fasilitas produksi, kebersihan, dan standar higiene serta sanitasi.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-orange-600 font-bold text-xl">4</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Penilaian & Rekomendasi</h3>
            <p className="text-gray-600">
              Hasil pemeriksaan dituangkan dalam laporan. Jika memenuhi syarat, 
              rekomendasi NKV disetujui. Jika ada ketidaksesuaian, pemohon 
              diberi kesempatan memperbaiki.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-indigo-600 font-bold text-xl">5</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Unduh Rekomendasi</h3>
            <p className="text-gray-600">
              Setelah disetujui, pemohon menerima notifikasi melalui sistem online. 
              Dokumen rekomendasi NKV dapat diunduh langsung dari website.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button size="lg" className="px-8">
              Mulai Pendaftaran
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
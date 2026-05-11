import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 relative overflow-hidden">
      {/* 3D Floating Icons Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-yellow-400 rounded-lg transform rotate-12 shadow-2xl opacity-80 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-pink-400 rounded-full shadow-xl opacity-70 animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-blue-400 rounded-xl transform -rotate-6 shadow-2xl opacity-60"></div>
        <div className="absolute bottom-20 right-40 w-14 h-14 bg-green-400 rounded-lg shadow-xl opacity-75 animate-pulse"></div>
      </div>

      <header className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* 3D Logo Icon */}
            <div className="relative w-12 h-12 transform hover:rotate-6 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg transform -rotate-3"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                NKV
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Rekomendasi NKV</h1>
          </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 relative">
            {/* Large 3D Icon */}
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-3xl transform rotate-6 animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-xl shadow-xl transform -rotate-3"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-white drop-shadow-lg">🐄</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistem Rekomendasi NKV
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Layanan online untuk mendapatkan Rekomendasi Nomor Kontrol Veteriner (NKV) 
            sesuai Peraturan Menteri Pertanian No. 11 Tahun 2020
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Dasar Hukum
          </h3>
          <p className="text-gray-700 mb-4">
            <strong>Peraturan Menteri Pertanian Republik Indonesia Nomor 11 Tahun 2020</strong> tentang Nomor Kontrol Veteriner ditetapkan oleh Menteri Pertanian pada tanggal 30 September 2020.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tujuan NKV:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Mengendalikan distribusi produk hewan yang bersifat vital</li>
                <li>Mencegah penyebaran penyakit hewan</li>
                <li>Melindungi kesehatan hewan dan kehidupan manusia</li>
                <li>Mewujudkan tata kelola produk hewan yang baik</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Produk yang dikendalikan:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Daging sapi, ayam, babi, dan lainnya</li>
                <li>Telur untuks, telur ayam negeri</li>
                <li>Susu dan produk olahannya</li>
                <li>Terpakai dan bahan hewani lainnya</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 transform rotate-3">
              <span className="text-blue-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pendaftaran Online</h3>
            <p className="text-gray-600">
              Isi formulir pendaftaran dengan data unit usaha, jenis produk hewan, 
              dan dokumen perusahaan. Dapatkan nomor registrasi sebagai bukti permohonan.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 transform -rotate-3">
              <span className="text-green-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Verifikasi Dokumen</h3>
            <p className="text-gray-600">
              Tim verifikator Dinas Perikanan dan Peternakan memeriksa kelengkapan berkas. 
              Jika ada kekurangan, pemohon diminta melengkapi dokumen.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 transform rotate-3">
              <span className="text-purple-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Pemeriksaan Lapangan</h3>
            <p className="text-gray-600">
              Petugas menjadwalkan kunjungan ke lokasi usaha untuk pemeriksaan 
              fasilitas produksi, kebersihan, dan standar higiene serta sanitasi.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 transform -rotate-3">
              <span className="text-orange-600 font-bold text-xl">4</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Penilaian & Rekomendasi</h3>
            <p className="text-gray-600">
              Hasil pemeriksaan dituangkan dalam laporan. Jika memenuhi syarat, 
              rekomendasi NKV disetujui. Jika ada ketidaksesuaian, pemohon 
              diberi kesempatan memperbaiki.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 transform rotate-3">
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
            <Button size="lg" className="px-8 transform hover:scale-110 transition-transform">
              Mulai Pendaftaran NKV
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
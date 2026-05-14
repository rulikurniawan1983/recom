import { Heart, Calendar, Pill, Stethoscope, Clipboard, QrCode, Shield, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const services = [
  {
    icon: <Heart className="h-12 w-12" />,
    title: 'Registrasi Hewan',
    description: 'Daftarkan hewan peliharaan Anda dengan data lengkap, riwayat kesehatan, dan foto. Sistem akan menghasilkan ID unik untuk setiap hewan.',
    features: ['Data hewan lengkap', 'Riwayat kesehatan', 'Foto profil hewan', 'ID unik hewan'],
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/pets/register',
    buttonText: 'Daftarkan Hewan',
  },
  {
    icon: <Calendar className="h-12 w-12" />,
    title: 'Booking Vaksinasi',
    description: 'Jadwalkan vaksinasi untuk hewan Anda. Pilih jadwal dokter, dan terima e-ticket dengan QR code untuk verifikasi di klinik.',
    features: ['Pilih jadwal dokter', 'Pilih lokasi klinik', 'E-ticket dengan QR', 'Reminder otomatis'],
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/vaccinations',
    buttonText: 'Booking Vaksinasi',
  },
  {
    icon: <Pill className="h-12 w-12" />,
    title: 'Pembelian Obat & Perawatan',
    description: 'Pesan obat dan perawatan medis sesuai resep dokter. Pengiriman ke alamat Anda atau pickup di klinik.',
    features: ['Resep dokter', 'Pengiriman ke lokasi', 'Status pesanan real-time', 'Riwayat pembelian'],
    color: 'bg-orange-100 text-orange-600',
    href: '/dashboard/treatments',
    buttonText: 'Lihat Layanan',
  },
  {
    icon: <Stethoscope className="h-12 w-12" />,
    title: 'Konsultasi Dokter',
    description: 'Konsultasi dengan dokter hewan berpengalaman melalui chat atau video call. Dapatkan diagnosis dan rekomendasi treatment.',
    features: ['Konsultasi online', 'Dokter spesialis', 'ReKAM MEDIS digital', 'Follow-up terjadwal'],
    color: 'bg-purple-100 text-purple-600',
    href: '/dashboard/consultations',
    buttonText: 'Konsultasi Sekarang',
  },
  {
    icon: <Clipboard className="h-12 w-12" />,
    title: 'Rekam Medis Digital',
    description: 'Akses riwayat kesehatan lengkap hewan Anda: vaksinasi, diagnosis, resep, dan hasil pemeriksaan laboratorium.',
    features: ['Riwayat vaksinasi', 'Diagnosis penyakit', 'Resep obat', 'Hasil lab digital'],
    color: 'bg-cyan-100 text-cyan-600',
    href: '/dashboard/history',
    buttonText: 'Lihat Riwayat',
  },
  {
    icon: <QrCode className="h-12 w-12" />,
    title: 'E-Ticket & QR Code',
    description: 'Setiap booking menghasilkan e-ticket dengan QR code unik. Scan QR di klinik untuk verifikasi cepat dan penanganan prioritas.',
    features: ['QR code unik', 'Verifikasi cepat', 'Priority service', 'Proof of service'],
    color: 'bg-pink-100 text-pink-600',
    href: '/dashboard/appointments',
    buttonText: 'Lihat E-Ticket',
  },
]

const benefits = [
  { icon: <Shield className="h-6 w-6" />, title: 'Terpercaya', desc: 'Dokter hewan bersertifikat & terdaftar' },
  { icon: <Clock className="h-6 w-6" />, title: 'Respons Cepat', desc: 'Respon dalam 1x24 jam' },
  { icon: <Users className="h-6 w-6" />, title: '500+ Dokter', desc: 'Jaringan dokter di seluruh Indonesia' },
]

export default function VeterinaryServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pelayanan Kesehatan Hewan
          </h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-8">
            Platform digital lengkap untuk kesehatan hewan peliharaan Anda. 
            Booking, konsultasi, pembelian obat, dan rekam medis dalam satu aplikasi.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 px-8 py-5 text-lg">
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Layanan Lengkap</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Akses semua layanan kesehatan hewan dalam satu platform terintegrasi.
              Daftarkan hewan, booking vaksinasi, konsultasi dokter, dan kelola rekam medis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${service.color} mb-5`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      {service.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Memulai?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Daftarkan hewan peliharaan Anda sekarang dan nikmati layanan kesehatan hewan terintegrasi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-5">
                Daftar Gratis
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-5">
                Masuk ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

const STEP_NAMES = [
  'Data Unit Usaha',
  'Jenis Produk Hewan',
  'Upload Dokumen',
  'Review & Submit',
]

export default function RegistrationForm() {
  const [step, setStep] = useState(1)
  const router = useRouter()

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pendaftaran Rekomendasi NKV</h1>
          <p className="text-gray-600 mt-2">
            Ikuti 4 langkah mudah untuk mendapatkan rekomendasi NKV
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {STEP_NAMES.map((name, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {idx + 1}
              </div>
              <span className="text-xs mt-2 text-center">{name}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEP_NAMES[step - 1]}</CardTitle>
            <CardDescription>
              Langkah {step} dari {STEP_NAMES.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Kembali
            </Button>
          )}
          {step < STEP_NAMES.length ? (
            <Button onClick={nextStep} className="ml-auto">
              Lanjut
            </Button>
          ) : (
            <Button onClick={() => router.push('/dashboard')} className="ml-auto">
              Submit Pendaftaran
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Nama Unit Usaha</Label>
        <Input id="businessName" placeholder="PT. Contoh Usaha" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessAddress">Alamat</Label>
        <Textarea id="businessAddress" placeholder="Alamat lengkap unit usaha" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessPhone">No. Telepon</Label>
        <Input id="businessPhone" placeholder="021 xxxx xxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessEmail">Email Perusahaan</Label>
        <Input id="businessEmail" type="email" placeholder="contact@usaha.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessType">Jenis Usaha</Label>
        <Input id="businessType" placeholder="Produksi/Pengolahan/Distribusi" />
      </div>
    </div>
  )
}

function Step2() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productType">Jenis Produk Hewan</Label>
        <select id="productType" className="w-full rounded-md border border-gray-300 px-3 py-2">
          <option value="">Pilih jenis produk</option>
          <option value="daging">Daging</option>
          <option value="telur">Telur</option>
          <option value="susu">Susu</option>
          <option value="terpakai">Terpakai</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="productDescription">Deskripsi Produk</Label>
        <Textarea id="productDescription" placeholder="Deskripsi jenis produk hewan" />
      </div>
    </div>
  )
}

function Step3() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessLicense">Izin Usaha</Label>
        <Input id="businessLicense" type="file" accept=".pdf,.jpg,.png" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vetCertificate">Sertifikat Veteriner</Label>
        <Input id="vetCertificate" type="file" accept=".pdf,.jpg,.png" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sanitaryCert">Sertifikat Sanitasi</Label>
        <Input id="sanitaryCert" type="file" accept=".pdf,.jpg,.png" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="otherDocs">Dokumen Lainnya</Label>
        <Input id="otherDocs" type="file" accept=".pdf,.jpg,.png" />
      </div>
    </div>
  )
}

function Step4() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Langkah Selanjutnya:</h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Verifikasi Dokumen - Tim verifikator akan memeriksa kelengkapan berkas</li>
          <li>Pemeriksaan Lapangan - Jadwal kunjungan akan dihubungi</li>
          <li>Penilaian & Rekomendasi - Proses penilaian dan persetujuan</li>
          <li>Unduh Rekomendasi - Dokumen NKV dapat diunduh setelah disetujui</li>
        </ol>
      </div>
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          Pastikan semua dokumen yang diupload sudah benar dan lengkap sebelum submit.
        </p>
      </div>
    </div>
  )
}
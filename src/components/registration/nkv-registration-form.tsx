'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { validateFileSize, MAX_FILE_SIZE } from '@/lib/storage'
import SuccessModal from './success-modal'

interface NKVFormData {
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  businessType: string
  productId: string
  productDescription: string
  documents: {
    businessLicense: File | null
    vetCertificate: File | null
    sanitaryCert: File | null
    otherDocs: File | null
  }
}

export default function NKVRegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [formData, setFormData] = useState<NKVFormData>({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessType: '',
    productId: '',
    productDescription: '',
    documents: {
      businessLicense: null,
      vetCertificate: null,
      sanitaryCert: null,
      otherDocs: null,
    },
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Generate tracking code
      const year = new Date().getFullYear()
      const random = Math.random().toString(36).substr(2, 6).toUpperCase()
      const regNumber = `NKV-${year}-${random}`
      
      // Save to Supabase
      const { error: submitError } = await supabase
        .from('nkv_registrations')
        .insert({
          user_id: user.id,
          registration_number: regNumber,
          business_name: formData.businessName,
          business_address: formData.businessAddress,
          business_phone: formData.businessPhone,
          business_email: formData.businessEmail,
          business_type: formData.businessType,
          product_type: formData.productId,
          product_description: formData.productDescription,
          status: 'submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (submitError) throw submitError

      setTrackingCode(regNumber)
      setShowSuccess(true)
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? String((err as { message?: string }).message) 
        : 'Gagal menyimpan pendaftaran'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-900">Pendaftaran Rekomendasi NKV</h1>
          <p className="text-blue-700 mt-2">
            Isi form berikut untuk mendapatkan rekomendasi Nomor Kontrol Veteriner
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Data Unit Usaha</CardTitle>
              <CardDescription>Informasi mengenai unit usaha Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nama Unit Usaha</Label>
                <Input 
                  id="businessName" 
                  placeholder="PT. Contoh Usaha" 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Alamat</Label>
                <Textarea 
                  id="businessAddress" 
                  placeholder="Alamat lengkap unit usaha" 
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">No. Telepon</Label>
                <Input 
                  id="businessPhone" 
                  placeholder="021 xxxx xxxx" 
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Email Perusahaan</Label>
                <Input 
                  id="businessEmail" 
                  type="email" 
                  placeholder="contact@usaha.com" 
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({...formData, businessEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Jenis Usaha</Label>
                <select 
                  id="businessType" 
                  className="w-full rounded-md border border-blue-300 px-3 py-2 text-blue-800"
                  value={formData.businessType}
                  onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                  required
                >
                  <option value="">Pilih jenis usaha</option>
                  <optgroup label="Rumah Potong Hewan">
                    <option value="rph-ruminansia">RPH Ruminansia</option>
                    <option value="rph-babi">RPH Babi</option>
                    <option value="rpu">Rumah Potong Unggas (RPU)</option>
                    <option value="rph-lainnya">RPH Lainnya</option>
                  </optgroup>
                  <optgroup label="Budidaya Ternak">
                    <option value="budidaya-unggas-petelur">Usaha budidaya unggas petelur</option>
                    <option value="budidaya-unggas-perah">Usaha budidaya unggas perah</option>
                  </optgroup>
                  <optgroup label="Produksi/Pengolahan Produk Hewan">
                    <option value="pengolahan-daging">Unit pengolahan daging</option>
                    <option value="pengolahan-susu">Unit pengolahan susu</option>
                    <option value="pengolahan-telur">Unit pengolahan telur</option>
                    <option value="pengolahan-madu">Unit pengolahan madu</option>
                    <option value="pengolahan-walet">Unit pengolahan sarang burung walet</option>
                  </optgroup>
                  <optgroup label="Tempat Penyimpanan">
                    <option value="gudang-pendingin">Gudang berpendingin (cold storage)</option>
                  </optgroup>
                  <optgroup label="Pemasaran/Ritel">
                    <option value="kios-daging">Kios daging</option>
                    <option value="ritel-produk-hewan">Ritel produk hewan</option>
                    <option value="tempat-penjualan">Tempat penjualan</option>
                  </optgroup>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Jenis Produk Hewan</CardTitle>
              <CardDescription>Pilih jenis produk hewan yang dihasilkan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Jenis Produk Hewan</Label>
                <select 
                  id="productId" 
                  className="w-full rounded-md border border-blue-300 px-3 py-2 text-blue-800"
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                >
                  <option value="">Pilih jenis produk</option>
                  <option value="daging-sapi">Daging Sapi</option>
                  <option value="daging-kambing">Daging Kambing</option>
                  <option value="daging-babi">Daging Babi</option>
                  <option value="daging-ayam">Daging Ayam</option>
                  <option value="telur-ayam">Telur Ayam</option>
                  <option value="susu-sapi">Susu Sapi</option>
                  <option value="madu">Madu</option>
                  <option value="sarang-walet">Sarang Burung Walet</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDescription">Deskripsi Produk</Label>
                <Textarea 
                  id="productDescription" 
                  placeholder="Deskripsi jenis produk hewan" 
                  value={formData.productDescription}
                  onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Upload Dokumen</CardTitle>
              <CardDescription>Upload dokumen yang diperlukan sesuai template di bawah ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessLicense">Form Surat Permohonan (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-blue-600 mb-1">
                  <a href="/data/Form Surat Permohonan.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="businessLicense" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && !validateFileSize(file)) {
                      setError('Ukuran file melebihi 1MB')
                      e.target.value = ''
                      return
                    }
                    setFormData({
                      ...formData, 
                      documents: {...formData.documents, businessLicense: file || null}
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vetCertificate">Form Data Umum dan Data Khusus (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-gray-500 mb-1">
                  <a href="/data/Form Data Umum dan Data Khusus.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="vetCertificate" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && !validateFileSize(file)) {
                      setError('Ukuran file melebihi 1MB')
                      e.target.value = ''
                      return
                    }
                    setFormData({
                      ...formData, 
                      documents: {...formData.documents, vetCertificate: file || null}
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sanitaryCert">Form SOP Pembersihan (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-blue-600 mb-1">
                  <a href="/data/Form SOP Pembersihan.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="sanitaryCert" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && !validateFileSize(file)) {
                      setError('Ukuran file melebihi 1MB')
                      e.target.value = ''
                      return
                    }
                    setFormData({
                      ...formData, 
                      documents: {...formData.documents, sanitaryCert: file || null}
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherDocs">Form Surat Pernyataan Keabsahan Dokumen (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-blue-600 mb-1">
                  <a href="/data/Form Surat Pernyataan Keabsahan Dokumen.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="otherDocs" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && !validateFileSize(file)) {
                      setError('Ukuran file melebihi 1MB')
                      e.target.value = ''
                      return
                    }
                    setFormData({
                      ...formData, 
                      documents: {...formData.documents, otherDocs: file || null}
                    })
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Konfirmasi</CardTitle>
              <CardDescription>Langkah selanjutnya setelah pengajuan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Langkah Selanjutnya:</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Verifikasi Dokumen - Tim verifikator akan memeriksa kelengkapan berkas</li>
                  <li>Pemeriksaan Lapangan - Jadwal kunjungan akan dihubungi</li>
                  <li>Penilaian & Rekomendasi - Proses penilaian dan persetujuan</li>
                  <li>Unduh Rekomendasi - Dokumen NKV dapat diunduh setelah disetujui</li>
                </ol>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg mt-4">
                <p className="text-sm text-yellow-800">
                  Pastikan semua dokumen yang diupload sudah benar dan lengkap sebelum submit.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Submit Pendaftaran'}
          </Button>
        </form>
      </div>

      <SuccessModal 
        isOpen={showSuccess}
        trackingCode={trackingCode}
        onClose={() => {
          setShowSuccess(false)
          router.push('/dashboard')
        }}
      />
    </div>
  )
}
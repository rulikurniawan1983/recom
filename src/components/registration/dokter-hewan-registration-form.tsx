'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { validateFileSize, MAX_FILE_SIZE, uploadRegistrationDocument } from '@/lib/storage'
import SuccessModal from './success-modal'

interface DokterHewanFormData {
  fullName: string
  birthPlace: string
  birthDate: string
  ktpAddress: string
  clinicAddress: string
  phone: string
  email: string
  documents: {
    colorPhoto: File | null
    diploma: File | null
    competencyCert: File | null
    professionalRecommendation: File | null
  }
  documentUrls: {
    colorPhoto: string | null
    diploma: string | null
    competencyCert: string | null
    professionalRecommendation: string | null
  }
}

export default function DokterHewanRegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [formData, setFormData] = useState<DokterHewanFormData>({
    fullName: '',
    birthPlace: '',
    birthDate: '',
    ktpAddress: '',
    clinicAddress: '',
    phone: '',
    email: '',
    documents: {
      colorPhoto: null,
      diploma: null,
      competencyCert: null,
      professionalRecommendation: null,
    },
    documentUrls: {
      colorPhoto: null,
      diploma: null,
      competencyCert: null,
      professionalRecommendation: null,
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

        // Format birth place and date
        const birthPlaceDate = formData.birthDate 
          ? formData.birthPlace 
            ? `${formData.birthPlace}, ${new Date(formData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : new Date(formData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : formData.birthPlace

        // Generate tracking code
        const year = new Date().getFullYear()
        const random = Math.random().toString(36).substr(2, 6).toUpperCase()
        const regNumber = `DKH-${year}-${random}`

        // Upload documents and get URLs
        const documentUrls = await uploadDocuments(formData.documents, regNumber)

        // Save to Supabase with document URLs
        const { data: registration, error: submitError } = await supabase
          .from('dokter_hewan_registrations')
          .insert({
            user_id: user.id,
            registration_number: regNumber,
            full_name: formData.fullName,
            birth_place_date: birthPlaceDate,
            ktp_address: formData.ktpAddress,
            clinic_address: formData.clinicAddress,
            phone: formData.phone,
            email: formData.email,
            color_photo_url: documentUrls.colorPhoto,
            diploma_url: documentUrls.diploma,
            competency_cert_url: documentUrls.competencyCert,
            professional_recommendation_url: documentUrls.professionalRecommendation,
            status: 'submitted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

       if (submitError) throw submitError

       // Save document records to registration_documents table
       if (registration) {
         await saveDocumentRecords(registration.id, documentUrls)
       }

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

   const saveDocumentRecords = async (
     registrationId: string,
     documentUrls: Record<string, string | null>
   ) => {
     const docTypes = [
       { key: 'colorPhoto', label: 'Pas Photo' },
       { key: 'diploma', label: 'Ijazah' },
       { key: 'competencyCert', label: 'Sertifikat Kompetensi' },
       { key: 'professionalRecommendation', label: 'Rekomendasi Profesional' },
     ] as const

     const records = docTypes
       .filter(doc => documentUrls[doc.key])
       .map(doc => ({
         registration_id: registrationId,
         registration_type: 'dokter_hewan',
         document_type: doc.label,
         file_url: documentUrls[doc.key]!,
         file_name: `${doc.label.toLowerCase().replace(/\s+/g, '_')}.pdf`,
         status: 'pending',
         uploaded_at: new Date().toISOString(),
         admin_notes: null,
       }))

     if (records.length === 0) return

     const { error } = await supabase
       .from('registration_documents')
       .insert(records)

     if (error) {
       console.error('Failed to save document records:', error)
     }
   }

  const uploadDocuments = async (
    documents: DokterHewanFormData['documents'],
    regNumber: string
  ) => {
    const urls: Record<string, string | null> = {
      colorPhoto: null,
      diploma: null,
      competencyCert: null,
      professionalRecommendation: null
    }

    // Upload each document if it exists
    if (documents.colorPhoto) {
      urls.colorPhoto = await uploadRegistrationDocument(
        documents.colorPhoto,
        regNumber,
        'color-photo'
      ) || null
    }

    if (documents.diploma) {
      urls.diploma = await uploadRegistrationDocument(
        documents.diploma,
        regNumber,
        'diploma'
      ) || null
    }

    if (documents.competencyCert) {
      urls.competencyCert = await uploadRegistrationDocument(
        documents.competencyCert,
        regNumber,
        'competency-cert'
      ) || null
    }

    if (documents.professionalRecommendation) {
      urls.professionalRecommendation = await uploadRegistrationDocument(
        documents.professionalRecommendation,
        regNumber,
        'professional-recommendation'
      ) || null
    }

    return urls
  }

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-900">Pendaftaran Rekomendasi Praktek Dokter Hewan</h1>
          <p className="text-blue-700 mt-2">
            Isi form berikut untuk mendapatkan rekomendasi praktek dokter hewan
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
              <CardTitle className="text-blue-800">Data Pribadi</CardTitle>
              <CardDescription>Informasi pribadi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input 
                  id="fullName" 
                  placeholder="Dr. Nama Lengkap" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir</Label>
                <Input 
                  id="birthPlace" 
                  placeholder="Contoh: Jakarta" 
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input 
                  id="birthDate" 
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ktpAddress">Alamat KTP</Label>
                <Textarea 
                  id="ktpAddress" 
                  placeholder="Alamat sesuai KTP" 
                  value={formData.ktpAddress}
                  onChange={(e) => setFormData({...formData, ktpAddress: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input 
                  id="phone" 
                  placeholder="08xx xxxx xxxx" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Data Praktik</CardTitle>
              <CardDescription>Informasi mengenai praktik/klinik Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Alamat Praktik/Klinik</Label>
                <Textarea 
                  id="clinicAddress" 
                  placeholder="Alamat lengkap praktik/klinik dokter hewan" 
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Upload Dokumen</CardTitle>
              <CardDescription>Upload dokumen yang diperlukan (maksimal 1MB per file)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colorPhoto">Pas Photo Berwarna 4x6 cm (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <Input 
                  id="colorPhoto" 
                  type="file" 
                  accept=".pdf,.jpg,.png" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && !validateFileSize(file)) {
                      setError('Ukuran file melebihi 1MB')
                      e.target.value = ''
                      return
                    }
                    setFormData({
                      ...formData, 
                      documents: {...formData.documents, colorPhoto: file || null},
                      documentUrls: {...formData.documentUrls, colorPhoto: null} // Reset URL when file changes
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diploma">Fotokopi Ijazah Dokter Hewan (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <Input 
                  id="diploma" 
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
                      documents: {...formData.documents, diploma: file || null},
                      documentUrls: {...formData.documentUrls, diploma: null} // Reset URL when file changes
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competencyCert">Fotokopi Sertifikat Kompetensi Dokter Hewan Indonesia (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <Input 
                  id="competencyCert" 
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
                      documents: {...formData.documents, competencyCert: file || null},
                      documentUrls: {...formData.documentUrls, competencyCert: null} // Reset URL when file changes
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalRecommendation">Fotokopi Rekomendasi Organisasi Profesi Dokter Hewan (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <Input 
                  id="professionalRecommendation" 
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
                      documents: {...formData.documents, professionalRecommendation: file || null},
                      documentUrls: {...formData.documentUrls, professionalRecommendation: null} // Reset URL when file changes
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
                  <li>Unduh Rekomendasi - Dokumen resmi dapat diunduh setelah disetujui</li>
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
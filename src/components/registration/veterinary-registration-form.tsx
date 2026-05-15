'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadRegistrationDocument, validateFileSize, MAX_FILE_SIZE } from '@/lib/storage'
import SuccessModal from './success-modal'

interface VeterinaryFormData {
  petName: string
  petType: string
  petBreed: string
  petAge: string
  petGender: string
  ownerName: string
  ownerPhone: string
  ownerAddress: string
  documents: {
    petPhoto: File | null
    vaccinationRecord: File | null
    healthCertificate: File | null
    otherDocs: File | null
  }
  documentUrls: {
    petPhoto: string | null
    vaccinationRecord: string | null
    healthCertificate: string | null
    otherDocs: string | null
  }
}

export default function VeterinaryRegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [formData, setFormData] = useState<VeterinaryFormData>({
    petName: '',
    petType: '',
    petBreed: '',
    petAge: '',
    petGender: '',
    ownerName: '',
    ownerPhone: '',
    ownerAddress: '',
    documents: {
      petPhoto: null,
      vaccinationRecord: null,
      healthCertificate: null,
      otherDocs: null,
    },
    documentUrls: {
      petPhoto: null,
      vaccinationRecord: null,
      healthCertificate: null,
      otherDocs: null,
    },
  })
  const router = useRouter()

  const handleFileChange = (type: keyof VeterinaryFormData['documents'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && !validateFileSize(file)) {
      setError('Ukuran file melebihi 1MB')
      e.target.value = ''
      return
    }
    setFormData({
      ...formData, 
      documents: {
        ...formData.documents,
        [type]: file || null
      },
      documentUrls: {
        ...formData.documentUrls,
        [type]: null
      }
    })
  }

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
      const regNumber = `VET-${year}-${random}`

      // Upload documents and get URLs
      const documentUrls = await uploadDocuments(formData.documents, regNumber)

      // Save to Supabase with document URLs
      const { data: registration, error: submitError } = await supabase
        .from('veterinary_registrations')
        .insert({
          user_id: user.id,
          registration_number: regNumber,
          pet_name: formData.petName,
          pet_type: formData.petType,
          pet_breed: formData.petBreed,
          pet_age: formData.petAge,
          pet_gender: formData.petGender,
          owner_name: formData.ownerName,
          owner_phone: formData.ownerPhone,
          owner_address: formData.ownerAddress,
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
      { key: 'petPhoto', label: 'Foto Hewan' },
      { key: 'vaccinationRecord', label: 'Rekam Vaksinasi' },
      { key: 'healthCertificate', label: 'Sertifikat Kesehatan' },
      { key: 'otherDocs', label: 'Dokumen Pendukung Lain' },
    ] as const

    const records = docTypes
      .filter(doc => documentUrls[doc.key])
      .map(doc => ({
        registration_id: registrationId,
        registration_type: 'veterinary',
        document_type: doc.label,
        file_url: documentUrls[doc.key]!,
        file_name: `${doc.label.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
        admin_notes: null,
      }))

    if (records.length === 0) return

    try {
      const { data, error } = await supabase
        .from('registration_documents')
        .insert(records)

      if (error) {
        console.error('Failed to save document records:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          records: records
        })
      } else {
        console.log('Successfully saved document records:', data)
      }
    } catch (err) {
      console.error('Unexpected error saving document records:', err)
    }
  }

  const uploadDocuments = async (
    documents: VeterinaryFormData['documents'],
    regNumber: string
  ) => {
    const urls: Record<string, string | null> = {
      petPhoto: null,
      vaccinationRecord: null,
      healthCertificate: null,
      otherDocs: null
    }

    // Upload each document if it exists
    if (documents.petPhoto) {
      urls.petPhoto = await uploadRegistrationDocument(
        documents.petPhoto,
        regNumber,
        'pet-photo'
      ) || null
    }

    if (documents.vaccinationRecord) {
      urls.vaccinationRecord = await uploadRegistrationDocument(
        documents.vaccinationRecord,
        regNumber,
        'vaccination-record'
      ) || null
    }

    if (documents.healthCertificate) {
      urls.healthCertificate = await uploadRegistrationDocument(
        documents.healthCertificate,
        regNumber,
        'health-certificate'
      ) || null
    }

    if (documents.otherDocs) {
      urls.otherDocs = await uploadRegistrationDocument(
        documents.otherDocs,
        regNumber,
        'other-docs'
      ) || null
    }

    return urls
  }

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-900">Pendaftaran Hewan Peliharaan</h1>
          <p className="text-blue-700 mt-2">
            Isi form berikut untuk mendaftarkan hewan peliharaan Anda
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
              <CardTitle className="text-blue-800">Data Hewan</CardTitle>
              <CardDescription>Informasi mengenai hewan peliharaan Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Nama Hewan</Label>
                <Input 
                  id="petName" 
                  placeholder="Nama hewan peliharaan" 
                  value={formData.petName}
                  onChange={(e) => setFormData({...formData, petName: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petType">Jenis Hewan</Label>
                <select 
                  id="petType" 
                  className="w-full rounded-md border border-blue-300 px-3 py-2 text-blue-800"
                  value={formData.petType}
                  onChange={(e) => setFormData({...formData, petType: e.target.value})}
                  required
                >
                  <option value="">Pilih jenis hewan</option>
                  <option value="anjing">Anjing</option>
                  <option value="kucing">Kucing</option>
                  <option value="burung">Burung</option>
                  <option value="kelinci">Kelinci</option>
                  <option value="hamster">Hamster</option>
                  <option value="ikan">Ikan</option>
                  <option value="reptil">Reptil</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="petBreed">Ras</Label>
                <Input 
                  id="petBreed" 
                  placeholder="Ras hewan" 
                  value={formData.petBreed}
                  onChange={(e) => setFormData({...formData, petBreed: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petAge">Umur</Label>
                <Input 
                  id="petAge" 
                  placeholder="Umur hewan (tahun/bulan)" 
                  value={formData.petAge}
                  onChange={(e) => setFormData({...formData, petAge: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petGender">Jenis Kelamin</Label>
                <select 
                  id="petGender" 
                  className="w-full rounded-md border border-blue-300 px-3 py-2 text-blue-800"
                  value={formData.petGender}
                  onChange={(e) => setFormData({...formData, petGender: e.target.value})}
                  required
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="jantan">Jantan</option>
                  <option value="betina">Betina</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Data Pemilik</CardTitle>
              <CardDescription>Informasi mengenai pemilik hewan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nama Pemilik</Label>
                <Input 
                  id="ownerName" 
                  placeholder="Nama lengkap pemilik" 
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">No. Telepon</Label>
                <Input 
                  id="ownerPhone" 
                  placeholder="08xx xxxx xxxx" 
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerAddress">Alamat Lengkap</Label>
                <Textarea 
                  id="ownerAddress" 
                  placeholder="Alamat lengkap pemilik" 
                  value={formData.ownerAddress}
                  onChange={(e) => setFormData({...formData, ownerAddress: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Upload Dokumen</CardTitle>
              <CardDescription>Upload dokumen yang diperlukan (opsional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="petPhoto">Foto Hewan (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-blue-600 mb-1">
                  <a href="/data/Form Surat Permohonan.pdf" download className="text-blue-600 hover:underline">Contoh Foto</a>
                </div>
                <Input 
                  id="petPhoto" 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={(e) => handleFileChange('petPhoto', e)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccinationRecord">Rekam Vaksinasi (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-gray-500 mb-1">
                  <a href="/data/Form Data Umum dan Data Khusus.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="vaccinationRecord" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFileChange('vaccinationRecord', e)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthCertificate">Sertifikat Kesehatan (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-blue-600 mb-1">
                  <a href="/data/Form SOP Pembersihan.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="healthCertificate" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFileChange('healthCertificate', e)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherDocs">Dokumen Pendukung Lain (Max {MAX_FILE_SIZE / 1024 / 1024}MB)</Label>
                <div className="text-xs text-blue-600 mb-1">
                  <a href="/data/Form Surat Pernyataan Keabsahan Dokumen.pdf" download className="text-blue-600 hover:underline">Download Template</a>
                </div>
                <Input 
                  id="otherDocs" 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => handleFileChange('otherDocs', e)}
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
                  <li>Verifikasi Data - Tim verifikator akan memeriksa kelengkapan berkas</li>
                  <li>Konfirmasi Pemilik - Hubungi pemilik untuk konfirmasi data</li>
                  <li>Pendataan Hewan - Data hewan akan dimasukkan ke sistem</li>
                  <li>Unduh Bukti Pendaftaran - Bukti pendaftaran dapat diunduh setelah disetujui</li>
                </ol>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg mt-4">
                <p className="text-sm text-yellow-800">
                  Pastikan semua informasi yang diisi sudah benar dan lengkap sebelum submit.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Submit Pendaftaran Hewan'}
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
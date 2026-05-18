'use client'

import { useEffect, useState, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Calendar, Clock, User, MapPin, FileText, Image, Video, Stethoscope } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Step = 'pet' | 'form' | 'doctor' | 'schedule' | 'confirm'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
}

interface Doctor {
  id: string
  specialization: string | null
  profiles?: { full_name: string | null }
}

interface TreatmentSchedule {
  id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  location: string | null
  doctors: Doctor
}

interface TreatmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  pets: Pet[]
  userId: string
}

interface UploadedFile {
  name: string
  url: string
  type: string
}

export default function TreatmentBookingModal({
  isOpen, onClose, pets, userId
}: TreatmentBookingModalProps) {
  const [step, setStep] = useState<Step>('pet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  // Step data
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [symptoms, setSymptoms] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [photoFiles, setPhotoFiles] = useState<UploadedFile[]>([])
  const [videoFiles, setVideoFiles] = useState<UploadedFile[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<TreatmentSchedule | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [schedules, setSchedules] = useState<TreatmentSchedule[]>([])

  useEffect(() => {
    if (isOpen) fetchDoctors()
  }, [isOpen])

  useEffect(() => {
    // Reset when modal closes
    if (!isOpen) resetForm()
  }, [isOpen])

  useEffect(() => {
    if (selectedDoctor && selectedDate) fetchSchedules()
  }, [selectedDoctor, selectedDate])

  const resetForm = () => {
    setStep('pet')
    setSelectedPet(null)
    setSymptoms('')
    setMedicalHistory('')
    setPhotoFiles([])
    setVideoFiles([])
    setSelectedDoctor(null)
    setSelectedDate('')
    setSelectedSchedule(null)
    setDoctors([])
    setSchedules([])
    setError('')
  }

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select('id, specialization, profiles (full_name, email)')
      .eq('is_active', true)
      .order('profiles.full_name')
    if (data) {
      const mapped = data.map((d: any) => ({
        id: d.id,
        specialization: d.specialization,
        profiles: Array.isArray(d.profiles) ? d.profiles[0] || null : d.profiles,
      }))
      setDoctors(mapped)
    }
  }

  const fetchSchedules = async () => {
    if (!selectedDoctor || !selectedDate) return
    setLoading(true)
    const { data } = await supabase
      .from('treatment_schedules')
      .select('*, doctors (id, specialization, profiles (full_name, email))')
      .eq('doctor_id', selectedDoctor.id)
      .eq('date', selectedDate)
      .eq('is_active', true)
      .lte('current_patients', 'max_patients')
    if (data) {
      setSchedules(data as unknown as TreatmentSchedule[])
    }
    setLoading(false)
  }

  const handleFileUpload = async (files: FileList | null, type: 'photo' | 'video') => {
    if (!files) return
    setUploading(true)
    const uploaded: UploadedFile[] = []
    try {
      for (const file of Array.from(files)) {
        const id = Date.now() + Math.random()
        const { error } = await supabase.storage
          .from('pet-documents')
          .upload(`${userId}/${id}-${file.name}`, file)
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('pet-documents')
            .getPublicUrl(`${userId}/${id}-${file.name}`)
          uploaded.push({ name: file.name, url: publicUrl, type: file.type })
        }
      }
      type === 'photo' ? setPhotoFiles(prev => [...prev, ...uploaded]) : setVideoFiles(prev => [...prev, ...uploaded])
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedPet || !selectedDoctor || !selectedSchedule || !symptoms.trim()) {
      setError('Mohon lengkapi semua field yang wajib diisi')
      return
    }
    setLoading(true)
    setError('')
    try {
      const bookingPhotos = photoFiles.map(f => f.url)
      const bookingVideos = videoFiles.map(f => f.url)

      const { error } = await supabase
        .from('treatments')
        .insert({
          pet_id: selectedPet.id,
          user_id: userId,
          doctor_id: selectedDoctor.id,
          schedule_id: selectedSchedule.id,
          symptoms: symptoms.trim(),
          medical_history: medicalHistory.trim() || null,
          photos_urls: bookingPhotos,
          videos_urls: bookingVideos,
          status: 'pending',
          payment_status: 'unpaid',
        })

      if (error) throw error

      // Notify admin
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
      if (admins) {
        for (const admin of admins) {
          await supabase.from('notifications').insert({
            user_id: admin.id,
            type: 'booking_confirmed',
            title: 'Booking Pengobatan Baru',
            message: `Booking pengobatan untuk hewan ${selectedPet.name} - keluhan: ${symptoms.substring(0, 50)}`,
            data: { treatment_id: '' },
          })
        }
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal membuat booking pengobatan')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const steps: Step[] = ['pet', 'form', 'doctor', 'schedule', 'confirm']
  const currentIdx = steps.indexOf(step)

  const canGoNext = (): boolean => {
    if (step === 'pet') return !!selectedPet
    if (step === 'form') return symptoms.trim().length >= 10
    if (step === 'doctor') return !!selectedDoctor
    if (step === 'schedule') return !!selectedSchedule
    return false
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Pengobatan</h2>
            <p className="text-gray-500 text-sm mt-1">Isi formulir keluhan dan jadwalkan pemeriksaan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  idx <= currentIdx ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-10 h-1 mx-1 rounded ${idx < currentIdx ? 'bg-teal-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 max-w-md mx-auto">
            <span>Hewan</span>
            <span>Keluhan</span>
            <span>Dokter</span>
            <span>Jadwal</span>
            <span>Konfirmasi</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Step 1: Select Pet */}
          {step === 'pet' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Pilih Hewan Peliharaan</h3>
              <div className="space-y-2">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => { setSelectedPet(pet); setStep('form') }}
                    className={`w-full p-4 border-2 rounded-lg text-left flex items-center gap-4 ${
                      selectedPet?.id === pet.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {pet.species === 'Anjing' ? '🐕' : pet.species === 'Kucing' ? '🐈' : '🐾'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{pet.name}</p>
                      <p className="text-sm text-gray-500">{pet.species} {pet.breed && '• ' + pet.breed}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Fill Complaint Form */}
          {step === 'form' && selectedPet && (
            <div>
              <button onClick={() => setStep('pet')} className="text-sm text-teal-600 hover:text-teal-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-4">Keluhan untuk {selectedPet.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gejala / Keluhan *
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    rows={4}
                    placeholder="Jelaskan gejala yang dialami hewan, durasi, dan tingkat keparahan..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">{symptoms.length} karakter (min. 10)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Riwayat Penyakit (opsional)
                  </label>
                  <textarea
                    value={medicalHistory}
                    onChange={e => setMedicalHistory(e.target.value)}
                    rows={3}
                    placeholder="Penyakit sebelumnya, alergi, operasi, dll..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Foto Hewan (opsional)
                  </label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {photoFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        <Image className="h-3 w-3" /> {f.name}
                      </span>
                    ))}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleFileUpload(e.target.files, 'photo')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Image className="h-4 w-4 inline mr-1" />
                    {uploading ? 'Mengunggah...' : 'Tambah Foto'}
                  </button>
                </div>
                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Video (opsional)
                  </label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {videoFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        <Video className="h-3 w-3" /> {f.name}
                      </span>
                    ))}
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={e => handleFileUpload(e.target.files, 'video')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Video className="h-4 w-4 inline mr-1" />
                    Tambah Video
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Doctor */}
          {step === 'doctor' && selectedPet && (
            <div>
              <button onClick={() => setStep('form')} className="text-sm text-teal-600 hover:text-teal-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-3">Pilih Dokter</h3>
              <div className="grid grid-cols-1 gap-2">
                {doctors.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDoctor(doc); setStep('schedule') }}
                    className={`p-4 border-2 rounded-lg text-left hover:border-teal-300 transition-colors ${
                      selectedDoctor?.id === doc.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {doc.profiles?.full_name || 'Dokter Hewan'}
                        </p>
                        <p className="text-sm text-gray-500">{doc.specialization || 'Dokter Hewan Umum'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Schedule */}
          {step === 'schedule' && selectedDoctor && (
            <div>
              <button onClick={() => setStep('doctor')} className="text-sm text-teal-600 hover:text-teal-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-3">
                Pilih Jadwal — Dr. {selectedDoctor.profiles?.full_name}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {selectedDate && (
                loading ? (
                  <div className="text-center py-8 text-gray-500">Memuat jadwal...</div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Tidak ada jadwal tersedia untuk tanggal ini</p>
                    <p className="text-xs text-gray-400 mt-1">Coba tanggal lain atau dokter lain</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedules.map(sch => (
                      <button
                        key={sch.id}
                        onClick={() => setSelectedSchedule(sch)}
                        className={`w-full p-4 border-2 rounded-lg text-left hover:border-teal-300 transition-colors ${
                          selectedSchedule?.id === sch.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {sch.start_time} — {sch.end_time}
                              </p>
                              {sch.location && (
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {sch.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            sch.current_patients >= sch.max_patients
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {sch.current_patients}/{sch.max_patients} slot
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 'confirm' && selectedPet && selectedDoctor && selectedSchedule && (
            <div>
              <button onClick={() => setStep('schedule')} className="text-sm text-teal-600 hover:text-teal-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-4">Konfirmasi Booking Pengobatan</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPet.name}</p>
                    <p className="text-sm text-gray-500">{selectedPet.species} {selectedPet.breed && '• ' + selectedPet.breed}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Dokter</p>
                  <p className="font-medium text-gray-900">
                    Dr. {selectedDoctor.profiles?.full_name || 'Dokter Hewan'}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Tanggal & Jam</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedSchedule.date).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{selectedSchedule.start_time} — {selectedSchedule.end_time}</p>
                  {selectedSchedule.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {selectedSchedule.location}
                    </p>
                  )}
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Keluhan</p>
                  <p className="text-sm text-gray-700">{symptoms}</p>
                </div>

                {medicalHistory && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-500">Riwayat Penyakit</p>
                    <p className="text-sm text-gray-700">{medicalHistory}</p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Lampiran</p>
                  <p className="text-sm text-gray-700">
                    {photoFiles.length} foto, {videoFiles.length} video
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Batal
          </button>

          <div className="flex gap-2">
            {currentIdx > 0 && (
              <button
                onClick={() => {
                  const prev: Step[] = ['pet', 'form', 'doctor', 'schedule', 'confirm']
                  setStep(prev[currentIdx - 1])
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
            )}
            {step !== 'confirm' && step !== 'pet' && (
              <button
                onClick={() => {
                  const next: Step[] = ['pet', 'form', 'doctor', 'schedule', 'confirm']
                  if (currentIdx < next.length - 1) { setStep(next[currentIdx + 1]) }
                }}
                disabled={!canGoNext()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1"
              >
                Lanjutkan <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {step === 'confirm' && (
              <button
                onClick={handleBooking}
                disabled={loading}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Konfirmasi Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

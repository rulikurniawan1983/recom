'use client'

import { useEffect, useState, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Calendar, Clock, User, Video, Monitor, Upload, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Step = 'prefer' | 'pet' | 'doctor' | 'schedule' | 'docs' | 'confirm'

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

interface ConsultationSchedule {
  id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  consultation_type: 'online' | 'offline' | 'both'
  meeting_link: string | null
  location: string | null
  doctors: Doctor
}

interface ConsultationBookingModalProps {
  isOpen: boolean
  onClose: () => void
  pets: Pet[]
  userId: string
}

interface UploadedFile {
  name: string
  url: string
}

export default function ConsultationBookingModal({
  isOpen, onClose, pets, userId
}: ConsultationBookingModalProps) {
  const [step, setStep] = useState<Step>('prefer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  // Step data
  const [consultationType, setConsultationType] = useState<'online' | 'offline'>('online')
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<ConsultationSchedule | null>(null)

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [schedules, setSchedules] = useState<ConsultationSchedule[]>([])
  const docInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) fetchDoctors()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) resetForm()
  }, [isOpen])

  useEffect(() => {
    if (selectedDoctor && selectedDate) fetchSchedules()
  }, [selectedDoctor, selectedDate])

  const resetForm = () => {
    setStep('prefer')
    setConsultationType('online')
    setSelectedPet(null)
    setDoctorNotes('')
    setDocuments([])
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
      setDoctors(mapped as unknown as Doctor[])
    }
  }

  const fetchSchedules = async () => {
    if (!selectedDoctor || !selectedDate) return
    setLoading(true)
    const typeParam = consultationType
    const { data } = await supabase
      .from('consultation_schedules')
      .select('*, doctors (id, specialization, profiles (full_name, email))')
      .eq('doctor_id', selectedDoctor.id)
      .eq('date', selectedDate)
      .eq('is_active', true)
      .or(`consultation_type=${typeParam},consultation_type=both`)
      .lte('current_patients', 'max_patients')
    if (data) {
      setSchedules(data as unknown as ConsultationSchedule[])
    }
    setLoading(false)
  }

  const handleDocUpload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const id = Date.now() + Math.random()
        await supabase.storage.from('pet-documents').upload(`${userId}/${id}-${file.name}`, file)
        const { data: { publicUrl } } = supabase.storage.from('pet-documents').getPublicUrl(`${userId}/${id}-${file.name}`)
        setDocuments(prev => [...prev, { name: file.name, url: publicUrl }])
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedPet || !selectedDoctor || !selectedSchedule) {
      setError('Mohon lengkapi semua field')
      return
    }
    setLoading(true)
    setError('')
    try {
      const meetingLink = consultationType === 'online'
        ? selectedSchedule.meeting_link || `https://meet.vetsys.id/${selectedSchedule.id}`
        : null
      const location = consultationType === 'offline'
        ? selectedSchedule.location || 'Klinik Hewan'
        : null

      const { error } = await supabase
        .from('consultations')
        .insert({
          pet_id: selectedPet.id,
          user_id: userId,
          doctor_id: selectedDoctor.id,
          schedule_id: selectedSchedule.id,
          consultation_type: consultationType,
          scheduled_date: selectedSchedule.date,
          scheduled_time: selectedSchedule.start_time,
          meeting_link: meetingLink,
          location: location,
          documents_urls: documents.map(d => d.url),
          symptoms: doctorNotes.trim() || null,
          status: 'pending',
        })
      if (error) throw error

      // Notify admin & doctor
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
      if (admins) {
        for (const admin of admins) {
          await supabase.from('notifications').insert({
            user_id: admin.id,
            type: 'booking_confirmed',
            title: 'Booking Konsultasi Baru',
            message: `Booking konsultasi ${consultationType} untuk ${selectedPet.name}`,
            data: {},
          })
        }
      }
      const { data: docProfile } = await supabase.from('doctors').select('user_id').eq('id', selectedDoctor.id).single()
      if (docProfile?.user_id) {
        await supabase.from('notifications').insert({
          user_id: docProfile.user_id,
          type: 'booking_confirmed',
          title: 'Booking Konsultasi Baru',
          message: `Ada booking konsultasi ${consultationType} untuk hewan ${selectedPet.name}`,
          data: {},
        })
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal membuat booking konsultasi')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const steps: Step[] = ['prefer', 'pet', 'doctor', 'schedule', 'docs', 'confirm']
  const currentIdx = steps.indexOf(step)

  const canNext = (): boolean => {
    if (step === 'prefer') return true
    if (step === 'pet') return !!selectedPet
    if (step === 'doctor') return !!selectedDoctor
    if (step === 'schedule') return !!selectedSchedule
    if (step === 'docs') return true
    return false
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Konsultasi</h2>
            <p className="text-gray-500 text-sm mt-1">Pilih jenis konsultasi dan jadwalkan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                  idx <= currentIdx ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${idx < currentIdx ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          {/* Step: Prefer Online/Offline */}
          {step === 'prefer' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Pilih Jenis Konsultasi</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setConsultationType('online'); setStep('pet') }}
                  className={`p-6 border-2 rounded-xl text-center hover:border-purple-400 transition-colors ${
                    consultationType === 'online' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <Video className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-900">Online</p>
                  <p className="text-sm text-gray-500">Chat atau Video Call</p>
                </button>
                <button
                  onClick={() => { setConsultationType('offline'); setStep('pet') }}
                  className={`p-6 border-2 rounded-xl text-center hover:border-purple-400 transition-colors ${
                    consultationType === 'offline' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <Monitor className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-900">Offline</p>
                  <p className="text-sm text-gray-500">Datang ke Klinik</p>
                </button>
              </div>
            </div>
          )}

          {/* Step: Pet */}
          {step === 'pet' && (
            <div>
              <button onClick={() => setStep('prefer')} className="text-sm text-purple-600 hover:text-purple-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-3">Pilih Hewan</h3>
              <div className="space-y-2">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => { setSelectedPet(pet); setStep('doctor') }}
                    className={`w-full p-4 border-2 rounded-lg text-left flex items-center gap-3 ${
                      selectedPet?.id === pet.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {pet.species === 'Anjing' ? '🐕' : pet.species === 'Kucing' ? '🐈' : '🐾'}
                    </div>
                    <div>
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-gray-500">{pet.species}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Doctor */}
          {(step === 'doctor' || step === 'schedule' || step === 'docs' || step === 'confirm') && selectedPet && (
            <div>
              <button onClick={() => setStep('pet')} className="text-sm text-purple-600 hover:text-purple-700 mb-3">
                ← Kembali
              </button>
              {step === 'doctor' && (
                <>
                  <h3 className="font-medium text-gray-900 mb-3">Pilih Dokter</h3>
                  <div className="space-y-2">
                    {doctors.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedDoctor(doc); setStep('schedule') }}
                        className={`w-full p-4 border-2 rounded-lg text-left hover:border-purple-300 transition-colors ${
                          selectedDoctor?.id === doc.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">Dr. {doc.profiles?.full_name || 'Dokter Hewan'}</p>
                            <p className="text-sm text-gray-500">{doc.specialization || 'Dokter Hewan Umum'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step: Schedule */}
          {step === 'schedule' && selectedDoctor && (
            <div>
              <button onClick={() => setStep('doctor')} className="text-sm text-purple-600 hover:text-purple-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-3">
                Pilih Jadwal — Dr. {selectedDoctor.profiles?.full_name}
                <span className="ml-2 text-sm text-gray-500">
                  ({consultationType === 'online' ? 'Online' : 'Offline'})
                </span>
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {selectedDate && (
                loading ? (
                  <div className="text-center py-8 text-gray-500">Memuat jadwal...</div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Tidak ada jadwal {consultationType} tersedia untuk tanggal ini</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedules.map(sch => (
                      <button
                        key={sch.id}
                        onClick={() => setSelectedSchedule(sch)}
                        className={`w-full p-4 border-2 rounded-lg text-left hover:border-purple-300 transition-colors ${
                          selectedSchedule?.id === sch.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{sch.start_time} — {sch.end_time}</p>
                              {sch.meeting_link && consultationType === 'online' && (
                                <p className="text-sm text-blue-600 flex items-center gap-1">
                                  <Video className="h-3 w-3" /> Link meeting tersedia
                                </p>
                              )}
                              {sch.location && consultationType === 'offline' && (
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Monitor className="h-3 w-3" /> {sch.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            sch.current_patients >= sch.max_patients
                              ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {sch.current_patients}/{sch.max_patients}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* Step: Upload Documents */}
          {step === 'docs' && selectedSchedule && (
            <div>
              <button onClick={() => setStep('schedule')} className="text-sm text-purple-600 hover:text-purple-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-3">Dokumen & Riwayat Medis (Opsional)</h3>
              <p className="text-gray-500 text-sm mb-4">
                Unggah dokumen medis, riwayat penyakit, atau hasil lab untuk membantu dokter.
              </p>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {documents.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                      <FileText className="h-3 w-3" /> {d.name}
                    </span>
                  ))}
                </div>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={e => handleDocUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  {uploading ? 'Mengunggah...' : 'Klik untuk upload dokumen (opsional)'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && selectedPet && selectedDoctor && selectedSchedule && (
            <div>
              <button onClick={() => consultationType === 'online' ? setStep('schedule') : setStep('docs')}
                className="text-sm text-purple-600 hover:text-purple-700 mb-3">
                ← Kembali
              </button>
              <h3 className="font-medium text-gray-900 mb-4">Konfirmasi Konsultasi</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedPet.name}</p>
                    <p className="text-sm text-gray-500">{selectedPet.species}</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Dokter</p>
                  <p className="font-medium">Dr. {selectedDoctor.profiles?.full_name || 'Dokter Hewan'}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Tanggal & Jam</p>
                  <p className="font-medium">
                    {new Date(selectedSchedule.date).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{selectedSchedule.start_time} — {selectedSchedule.end_time}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Jenis</p>
                  <p className="font-medium">
                    {consultationType === 'online' ? 'Konsultasi Online (Video)' : 'Konsultasi Offline di Klinik'}
                  </p>
                </div>
                {consultationType === 'online' && selectedSchedule.meeting_link && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-500">Link Meeting</p>
                    <a href={selectedSchedule.meeting_link} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all">
                      {selectedSchedule.meeting_link}
                    </a>
                  </div>
                )}
                {consultationType === 'offline' && selectedSchedule.location && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="text-sm">{selectedSchedule.location}</p>
                  </div>
                )}
                {doctorNotes && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-500">Catatan untuk Dokter</p>
                    <p className="text-sm">{doctorNotes}</p>
                  </div>
                )}
                {documents.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-500">Dokumen ({documents.length} file)</p>
                    {documents.map((d, i) => (
                      <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-xs break-all">
                        {d.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Batal</button>
          <div className="flex gap-2">
            {currentIdx > 0 && (
              <button
                onClick={() => {
                  const prev: Step[] = ['prefer', 'pet', 'doctor', 'schedule', 'docs', 'confirm']
                  setStep(prev[currentIdx - 1])
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
            )}
            {step !== 'confirm' && (
              <button
                onClick={() => {
                  if (step === 'prefer') { setStep('pet') }
                  else if (step === 'pet' && selectedPet) { setStep('doctor') }
                  else if (step === 'doctor' && selectedDoctor) { setStep('schedule') }
                  else if (step === 'schedule' && selectedSchedule) { setStep('docs') }
                }}
                disabled={!canNext()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
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
                {loading ? 'Mengirim...' : 'Konfirmasi Konsultasi'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

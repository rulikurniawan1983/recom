'use client'

import { useEffect, useState } from 'react'
import { X, Calendar, Clock, User, MapPin, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
}

interface Doctor {
  id: string
  specialization: string | null
  profiles: {
    full_name: string | null
  }
}

interface VaccinationSchedule {
  id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  location: string | null
  doctors: Doctor
}

interface BookVaccinationModalProps {
  isOpen: boolean
  onClose: () => void
  pets: Pet[]
  userId: string
  onBookingComplete?: () => void
}

export default function BookVaccinationModal({
  isOpen,
  onClose,
  pets,
  userId,
  onBookingComplete
}: BookVaccinationModalProps) {
  const [step, setStep] = useState<'pet' | 'doctor' | 'schedule' | 'confirm'>('pet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<VaccinationSchedule | null>(null)
  const [vaccinationDate, setVaccinationDate] = useState('')
  const [notes, setNotes] = useState('')

  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSchedules()
    }
  }, [selectedDoctor, selectedDate])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setStep('pet')
    setSelectedPet(null)
    setSelectedDoctor(null)
    setSelectedDate('')
    setSelectedSchedule(null)
    setVaccinationDate('')
    setNotes('')
    setSchedules([])
    setError('')
  }

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        profiles (full_name, email)
      `)
      .eq('is_active', true)
      .order('profiles.full_name')

     if (!error && data) {
       // Transform profiles from array to single object
       const transformedDoctors = data.map((doctor: any) => ({
         ...doctor,
         profiles: Array.isArray(doctor.profiles) ? doctor.profiles[0] || null : doctor.profiles,
       }))
       setDoctors(transformedDoctors as Doctor[])
     }
  }

  const fetchSchedules = async () => {
    if (!selectedDoctor || !selectedDate) return

    setLoading(true)
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .select(`
        *,
        doctors (
          id,
          specialization,
          profiles (full_name, email)
        )
      `)
      .eq('doctor_id', selectedDoctor.id)
      .eq('date', selectedDate)
      .eq('is_active', true)
      .lte('current_patients', 'max_patients')

    if (!error && data) {
      setSchedules(data as VaccinationSchedule[])
    }
    setLoading(false)
  }

  const handleBooking = async () => {
    if (!selectedPet || !selectedSchedule || !vaccinationDate) return

    setLoading(true)
    setError('')

    try {
      const { error: bookingError } = await supabase
        .from('vaccinations')
        .insert({
          pet_id: selectedPet.id,
          user_id: userId,
          doctor_id: selectedDoctor?.id,
          schedule_id: selectedSchedule.id,
          vaccination_date: vaccinationDate,
          notes: notes || null,
          status: 'pending',
          ticket_id: null,
          qr_code: null,
        })

      if (bookingError) throw bookingError

      onBookingComplete?.()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Booking Vaksinasi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['pet', 'doctor', 'schedule', 'confirm'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-teal-600 text-white'
                    : idx < ['pet', 'doctor', 'schedule', 'confirm'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && <div className="w-12 h-1 bg-gray-200 mx-1 rounded" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Select Pet */}
          {step === 'pet' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Pilih Hewan Peliharaan</h3>
              <div className="grid grid-cols-1 gap-3">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPet(pet)
                      setStep('doctor')
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedPet?.id === pet.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">
                          {pet.species === 'Anjing' ? '🐕' : pet.species === 'Kucing' ? '🐈' : '🐾'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-sm text-gray-500">
                          {pet.species} {pet.breed && `• ${pet.breed}`}
                        </p>
                      </div>
                      {selectedPet?.id === pet.id && (
                        <Check className="h-5 w-5 text-teal-600 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Doctor/Date */}
          {step === 'doctor' && selectedPet && (
            <div>
              <button
                onClick={() => setStep('pet')}
                className="text-sm text-teal-600 hover:text-teal-700 mb-4"
              >
                ← Kembali ke pilih hewan
              </button>
              <h3 className="font-medium text-gray-900 mb-4">Pilih Dokter & Tanggal</h3>

              <div className="space-y-4">
                {/* Select Doctor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Dokter
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {doctors.map(doctor => (
                      <button
                        key={doctor.id}
                        onClick={() => {
                          setSelectedDoctor(doctor)
                          setStep('schedule')
                        }}
                        className="p-4 border-2 rounded-lg text-left hover:border-teal-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium">Dr. {doctor.profiles.full_name}</p>
                            <p className="text-sm text-gray-500">{doctor.specialization || 'Dokter Hewan'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Schedule */}
          {step === 'schedule' && selectedDoctor && (
            <div>
              <button
                onClick={() => setStep('doctor')}
                className="text-sm text-teal-600 hover:text-teal-700 mb-4"
              >
                ← Kembali ke pilih dokter
              </button>

              <h3 className="font-medium text-gray-900 mb-4">
                Pilih Tanggal Vaksinasi
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {selectedDate && (
                <>
                  {loading ? (
                    <div className="text-center py-8">Memuat jadwal...</div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Tidak ada jadwal tersedia untuk tanggal ini</p>
                      <p className="text-sm text-gray-400 mt-1">Pilih tanggal lain atau dokter lain</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {schedules.map(schedule => (
                        <button
                          key={schedule.id}
                          onClick={() => setSelectedSchedule(schedule)}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                            selectedSchedule?.id === schedule.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Clock className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium">
                                  {new Date(schedule.date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                  })}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {schedule.start_time} - {schedule.end_time}
                                </p>
                                {schedule.location && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {schedule.location}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">
                                {schedule.current_patients}/{schedule.max_patients} pasien
                              </p>
                              <span className="text-xs text-gray-500">
                                {schedule.current_patients >= schedule.max_patients
                                  ? 'Penuh'
                                  : `Sisa ${schedule.max_patients - schedule.current_patients} slot`}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedPet && selectedDoctor && selectedSchedule && (
            <div>
              <button
                onClick={() => setStep('schedule')}
                className="text-sm text-teal-600 hover:text-teal-700 mb-4"
              >
                ← Kembali ke jadwal
              </button>

              <h3 className="font-medium text-gray-900 mb-4">Konfirmasi Booking</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Hewan</p>
                    <p className="font-medium">{selectedPet.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedPet.species} {selectedPet.breed && `• ${selectedPet.breed}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dokter</p>
                    <p className="font-medium">Dr. {selectedDoctor.profiles.full_name}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization || 'Dokter Hewan'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-1">Tanggal Vaksinasi</p>
                  <p className="font-medium">{vaccinationDate || selectedSchedule.date}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-1">Jadwal Klinik</p>
                  <p>
                    {new Date(selectedSchedule.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <p className="text-sm">
                    {selectedSchedule.start_time} - {selectedSchedule.end_time}
                  </p>
                  {selectedSchedule.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedSchedule.location}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Kondisi hewan, gejala, atau permintaan khusus..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Batal
          </button>

          {step === 'pet' && (
            <button
              onClick={() => pets.length === 1 ? setStep('doctor') : null}
              disabled={!selectedPet}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              Lanjutkan
            </button>
          )}

          {step === 'doctor' && selectedDoctor && (
            <button
              onClick={() => setStep('schedule')}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Lanjutkan
            </button>
          )}

          {step === 'schedule' && selectedSchedule && (
            <>
              <input
                type="date"
                value={vaccinationDate}
                onChange={(e) => setVaccinationDate(e.target.value)}
                min={selectedSchedule.date}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Tanggal vaksinasi"
              />
              <button
                onClick={() => setStep('confirm')}
                disabled={!vaccinationDate}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                Lanjutkan
              </button>
            </>
          )}

          {step === 'confirm' && (
            <button
              onClick={handleBooking}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Konfirmasi Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Syringe, Calendar, Clock, MapPin, QrCode, FileText } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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
  location: string | null
  doctors: Doctor
}

interface Vaccination {
  id: string
  vaccination_date: string
  status: string
  vaccine_type: string
  batch_number: string | null
  qr_code: string | null
  ticket_id: string | null
  notes: string | null
  admin_notes: string | null
  pets: Pet
  doctors?: Doctor
  vaccination_schedules?: VaccinationSchedule
}

interface VaccinationListProps {
  vaccinations: Vaccination[]
  pets: Pet[]
}

export default function VaccinationList({ vaccinations, pets }: VaccinationListProps) {
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Konfirmasi'
      case 'confirmed': return 'Terkonfirmasi'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      case 'no_show': return 'Tidak Hadir'
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Separate vaccinations by status
  const activeVaccinations = vaccinations.filter(
    v => v.status === 'pending' || v.status === 'confirmed'
  )
  const completedVaccinations = vaccinations.filter(
    v => v.status === 'completed'
  )

  const renderVaccinationCard = (vaccination: Vaccination, showCompleted = false) => (
    <div
      key={vaccination.id}
      className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
        showCompleted ? 'opacity-75' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {vaccination.pets?.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vaccination.status)}`}>
                {getStatusText(vaccination.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {vaccination.pets?.species} {vaccination.pets?.breed && `- ${vaccination.pets.breed}`}
            </p>
            {vaccination.doctors?.profiles?.full_name && (
              <p className="text-sm text-gray-600">
                Dr. {vaccination.doctors.profiles.full_name}
                {vaccination.doctors.specialization && ` • ${vaccination.doctors.specialization}`}
              </p>
            )}
          </div>
          {vaccination.ticket_id && (
            <button
              onClick={() => setSelectedVaccination(vaccination)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              <QrCode className="h-4 w-4" />
              Lihat E-Ticket
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {formatDate(vaccination.vaccination_date)}
          </div>
          {vaccination.vaccination_schedules?.start_time && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {formatTime(vaccination.vaccination_schedules.start_time)}
              {vaccination.vaccination_schedules.location && (
                <>
                  <span className="mx-2">•</span>
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {vaccination.vaccination_schedules.location}
                </>
              )}
            </div>
          )}
          {vaccination.vaccine_type && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2 text-gray-400" />
              Vaksin: {vaccination.vaccine_type}
            </div>
          )}
          {vaccination.batch_number && (
            <div className="text-xs text-gray-500">
              Batch: {vaccination.batch_number}
            </div>
          )}
          {vaccination.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
              <strong>Catatan:</strong> {vaccination.notes}
            </div>
          )}
        </div>

        {vaccination.status === 'completed' && vaccination.qr_code && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Ticket ID:</span>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                {vaccination.ticket_id}
              </code>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-500">QR Code:</span>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs break-all">
                {vaccination.qr_code}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Active Vaccinations */}
      {activeVaccinations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vaksinasi Aktif ({activeVaccinations.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeVaccinations.map(v => renderVaccinationCard(v))}
          </div>
        </div>
      )}

      {/* Completed Vaccinations */}
      {completedVaccinations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Riwayat Vaksinasi ({completedVaccinations.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedVaccinations.map(v => renderVaccinationCard(v, true))}
          </div>
        </div>
      )}

      {vaccinations.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Syringe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada vaksinasi
          </h3>
          <p className="text-gray-500">
            Mulai dengan booking vaksinasi rabies untuk hewan peliharaan Anda.
          </p>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedVaccination && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVaccination(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-200 mx-auto mb-4 flex items-center justify-center">
                {/* QR Code would be rendered here */}
                <div className="text-6xl font-bold text-gray-400">
                  {selectedVaccination.qr_code?.substring(4, 10)}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">E-Ticket Vaksinasi</h3>
              <p className="text-gray-600 mb-4">
                {selectedVaccination.pets?.name} • {selectedVaccination.vaccination_date}
              </p>
              <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ticket ID:</span>
                  <span className="font-mono font-medium">{selectedVaccination.ticket_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">QR Code:</span>
                  <span className="font-mono text-xs break-all">{selectedVaccination.qr_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dokter:</span>
                  <span>Dr. {selectedVaccination.doctors?.profiles?.full_name}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVaccination(null)}
                className="mt-6 w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

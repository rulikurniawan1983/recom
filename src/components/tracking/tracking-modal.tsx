'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Clock, CheckCircle, XCircle } from 'lucide-react'

interface TrackingLog {
  status: string
  created_at: string
  notes?: string
}

interface TrackingResult {
  registration_number: string
  type: 'NKV' | 'Dokter Hewan'
  status: string
  created_at: string
  description?: string
  tracking_logs?: TrackingLog[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  document_verification: 'Verifikasi Dokumen',
  field_inspection: 'Pemeriksaan Lapangan',
  assessment: 'Penilaian',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  revision_requested: 'Perlu Revisi'
}

const STATUS_ORDER = [
  'submitted',
  'document_verification',
  'field_inspection',
  'assessment',
  'approved'
]

interface TrackingModalUIProps {
  isOpen: boolean
  onClose: () => void
}

export default function TrackingModalUI({ isOpen, onClose }: TrackingModalUIProps) {
  const [trackingCode, setTrackingCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!trackingCode.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/tracking/${trackingCode}`)
      const data = await response.json()

      if (response.ok) {
        setResult({
          registration_number: data.registration_number,
          type: data.type,
          status: data.status,
          created_at: data.created_at,
          description: data.description,
          tracking_logs: data.tracking_logs || []
        })
      } else {
        setError(data.error || 'Nomor tracking tidak ditemukan')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencari. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setTrackingCode('')
    setResult(null)
    setError(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  // Calculate current step index for progress visualization
  const getCurrentStepIndex = () => {
    if (!result) return -1
    return STATUS_ORDER.indexOf(result.status)
  }

  const isStatusRejected = () => {
    return result?.status === 'rejected' || result?.status === 'revision_requested'
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader>
        <div className="flex items-center justify-between">
          <ModalTitle className="text-blue-900">Cek Status Permohonan</ModalTitle>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>
      </ModalHeader>

      <ModalContent>
        {!result ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="tracking-input" className="text-sm font-medium text-blue-800 mb-1 block">
                Masukkan Kode Tracking
              </label>
              <Input
                id="tracking-input"
                placeholder="Contoh: NKV-2024-00123"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="border-blue-300 text-black"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading || !trackingCode.trim()}
                className="flex-1"
              >
                {loading ? 'Mencari...' : 'Cari'}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Registration Details */}
            <div className="border-b border-blue-200 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nomor Pendaftaran</p>
                  <p className="font-semibold text-blue-900">{result.registration_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Permohonan</p>
                  <p className="font-semibold text-blue-900">{result.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
                  <p className="font-semibold text-blue-900">
                    {new Date(result.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    result.status === 'approved' ? 'bg-green-100 text-green-800' :
                    result.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    result.status === 'revision_requested' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {STATUS_LABELS[result.status]}
                  </span>
                </div>
                {result.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Catatan</p>
                    <p className="text-sm text-blue-900 bg-blue-50 p-2 rounded">{result.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Proses Permohonan</h4>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Progress Steps */}
                <div className="space-y-4">
                  {STATUS_ORDER.map((statusKey, index) => {
                    const isCompleted = getCurrentStepIndex() > index
                    const isCurrent = getCurrentStepIndex() === index && !isStatusRejected()
                    const isRejectedStep = isStatusRejected() && getCurrentStepIndex() === index
                    const logEntry = result.tracking_logs?.find(log => log.status === statusKey)

                    return (
                      <div key={statusKey} className="relative flex items-start gap-3 pl-1">
                        {/* Icon Circle */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted || result.status === 'approved' ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-600 text-white' :
                          isRejectedStep ? 'bg-red-500 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted || result.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isCurrent ? (
                            <Clock className="w-4 h-4" />
                          ) : isRejectedStep ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              isCompleted || result.status === 'approved' ? 'text-green-700' :
                              isCurrent ? 'text-blue-900' :
                              isRejectedStep ? 'text-red-700' :
                              'text-gray-500'
                            }`}>
                              {STATUS_LABELS[statusKey]}
                            </span>
                            {logEntry && (
                              <span className="text-xs text-gray-500">
                                {new Date(logEntry.created_at).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                          {logEntry?.notes && (
                            <p className="text-xs text-gray-600 mt-1">{logEntry.notes}</p>
                          )}
                          {isCurrent && !isRejectedStep && (
                            <p className="text-xs text-blue-600 mt-1">Sedang diproses</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Tutup
            </Button>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

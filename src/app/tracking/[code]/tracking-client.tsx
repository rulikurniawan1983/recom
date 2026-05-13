'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react'

const STATUS_ORDER = [
  'submitted',
  'document_verification',
  'field_inspection',
  'assessment',
  'approved'
]

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

interface TrackingLog {
  id?: string
  status: string
  created_at: string
  notes?: string
}

interface TrackingClientProps {
  registration: {
    registration_number: string
    status: string
    created_at: string
    verification_notes?: string
    tracking_logs?: TrackingLog[]
    recommendation_file_url?: string
  }
  type: 'NKV' | 'Dokter Hewan'
}

export default function TrackingClient({ registration, type }: TrackingClientProps) {
  const getCurrentStepIndex = () => {
    return STATUS_ORDER.indexOf(registration.status)
  }

  const isStatusRejected = () => {
    return registration.status === 'rejected' || registration.status === 'revision_requested'
  }

  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Detail Permohonan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nomor Pendaftaran</p>
                <p className="font-semibold text-blue-900">{registration.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Permohonan</p>
                <p className="font-semibold text-blue-900">{type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
                <p className="font-semibold text-blue-900">
                  {new Date(registration.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                  registration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  registration.status === 'revision_requested' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {STATUS_LABELS[registration.status]}
                </span>
              </div>
              {registration.verification_notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Catatan</p>
                  <p className="text-blue-900 bg-blue-50 p-3 rounded">{registration.verification_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Proses Permohonan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Progress Steps */}
              <div className="space-y-6">
                {STATUS_ORDER.map((statusKey, index) => {
                  const isCompleted = getCurrentStepIndex() > index
                  const isCurrent = getCurrentStepIndex() === index && !isStatusRejected()
                  const isRejectedStep = isStatusRejected() && getCurrentStepIndex() === index
                  const logEntry = registration.tracking_logs?.find(log => log.status === statusKey)

                  return (
                    <div key={statusKey} className="relative flex items-start gap-4">
                      {/* Icon Circle */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        isCompleted || registration.status === 'approved' ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-600 text-white' :
                        isRejectedStep ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted || registration.status === 'approved' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5" />
                        ) : isRejectedStep ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-400" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${
                            isCompleted || registration.status === 'approved' ? 'text-green-700' :
                            isCurrent ? 'text-blue-900' :
                            isRejectedStep ? 'text-red-700' :
                            'text-gray-500'
                          }`}>
                            {STATUS_LABELS[statusKey]}
                          </span>
                          {logEntry && (
                            <span className="text-sm text-gray-500">
                              {new Date(logEntry.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        {logEntry?.notes && (
                          <p className="text-sm text-gray-600 mt-1">{logEntry.notes}</p>
                        )}
                        {isCurrent && !isStatusRejected() && (
                          <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Sedang diproses
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {registration.recommendation_file_url && (
              <div className="mt-6 pt-4 border-t border-blue-200">
                <a
                  href={registration.recommendation_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Unduh Rekomendasi
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Kembali
          </Button>
        </div>
      </div>
    </div>
  )
}
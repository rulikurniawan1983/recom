'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TrackingClientProps {
  registration: {
    registration_number: string
    status: string
    created_at: string
    verification_notes?: string
    tracking_logs?: Array<{ status: string; created_at: string }>
    recommendation_file_url?: string
  }
  type: 'NKV' | 'Dokter Hewan'
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

export default function TrackingClient({ registration, type }: TrackingClientProps) {
  return (
    <div className="min-h-screen bg-blue-100/80 backdrop-blur-sm py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Detail Permohonan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {new Date(registration.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-blue-900">{STATUS_LABELS[registration.status]}</p>
            </div>
            {registration.verification_notes && (
              <div>
                <p className="text-sm text-gray-600">Catatan</p>
                <p className="text-blue-900">{registration.verification_notes}</p>
              </div>
            )}
            {registration.recommendation_file_url && (
              <div>
                <a 
                  href={registration.recommendation_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Unduh Rekomendasi
                </a>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
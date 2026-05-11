'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Clock, CheckCircle, XCircle } from 'lucide-react'

interface TrackingResult {
  registration_number: string
  type: 'NKV' | 'Dokter Hewan'
  status: string
  created_at: string
  current_step?: string
  description?: string
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

export default function TrackingModal() {
  const [isOpen, setIsOpen] = useState(false)
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
          current_step: STATUS_LABELS[data.status] || 'Unknown',
          description: data.description
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

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="bg-white/80 backdrop-blur-sm"
      >
        <Search className="w-4 h-4 mr-2" />
        Cek Status Permohonan
      </Button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); resetModal(); }}>
        <ModalHeader>
          <div className="flex items-center justify-between">
            <ModalTitle className="text-blue-900">Cek Status Permohonan</ModalTitle>
            <button
              onClick={() => { setIsOpen(false); resetModal(); }}
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
                <label className="text-sm font-medium text-blue-800 mb-1 block">
                  Masukkan Kode Tracking
                </label>
                <Input
                  placeholder="Contoh: NKV-2024-00123"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-blue-300"
                />
              </div>
              
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
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
                  onClick={() => { setIsOpen(false); resetModal(); }}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {result.status === 'approved' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : result.status === 'rejected' ? (
                    <XCircle className="h-8 w-8 text-red-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <h3 className="font-semibold text-blue-900">{result.registration_number}</h3>
                <p className="text-sm text-blue-600">{result.type}</p>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-700">Status Saat Ini</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'approved' ? 'bg-green-100 text-green-800' :
                    result.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    result.status === 'revision_requested' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {STATUS_LABELS[result.status] || result.status}
                  </span>
                </div>
                
                <div className="text-xs text-blue-600">
                  <p>Tanggal Pengajuan: {new Date(result.created_at).toLocaleDateString('id-ID')}</p>
                  {result.description && <p className="mt-1">{result.description}</p>}
                </div>
              </div>
              
              <Button 
                onClick={() => { setIsOpen(false); resetModal(); }}
                variant="outline"
                className="w-full"
              >
                Tutup
              </Button>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface DocumentVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registrationNumber: string
  docCount: number
  approvedCount: number
  onApproveAll: () => Promise<void>
  onRequestRevision: (notes: string) => Promise<void>
  onReject: (notes: string) => Promise<void>
  loading: boolean
}

export default function DocumentVerificationModal({
  open,
  onOpenChange,
  registrationNumber,
  docCount,
  approvedCount,
  onApproveAll,
  onRequestRevision,
  onReject,
  loading,
}: DocumentVerificationModalProps) {
  const [revisionNotes, setRevisionNotes] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const allApproved = docCount > 0 && approvedCount === docCount

  const handleApproveAll = async () => {
    setActionLoading(true)
    await onApproveAll()
    setActionLoading(false)
    onOpenChange(false)
  }

  const handleRevision = async () => {
    if (!revisionNotes.trim()) return
    setActionLoading(true)
    await onRequestRevision(revisionNotes)
    setRevisionNotes('')
    setActionLoading(false)
    onOpenChange(false)
  }

  const handleReject = async () => {
    if (!rejectNotes.trim()) return
    setActionLoading(true)
    await onReject(rejectNotes)
    setRejectNotes('')
    setActionLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); else { setRevisionNotes(''); setRejectNotes(''); }}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Verifikasi Dokumen
            <Badge variant="outline">{registrationNumber}</Badge>
          </DialogTitle>
          <DialogDescription>
            {approvedCount} dari {docCount} dokumen sudah diverifikasi.
            {allApproved && ' Semua dokumen siap — lakukan verifikasi awal atau jadwalkan pemeriksaan lapangan.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!allApproved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              Verifikasi semua dokumen terlebih dahulu sebelum melanjutkan ke tahap berikutnya.
            </div>
          )}
          {allApproved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              Semua dokumen telah diverifikasi. Anda dapat:
              <br />• Lakukan verifikasi awal (ke tahap Penilaian)
              <br />• Jadwalkan pemeriksaan lapangan
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="revision-notes">Catatan Revisi / Penolakan</Label>
            <Textarea
              id="revision-notes"
              placeholder="Apa yang perlu diperbaiki oleh pemohon..."
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleReject}
              disabled={!rejectNotes.trim() || actionLoading || loading}
            >
              Tolak
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              onClick={handleRevision}
              disabled={!revisionNotes.trim() || actionLoading || loading}
            >
              Minta Revisi
            </Button>
          </div>
          <Button onClick={handleApproveAll} disabled={!allApproved || actionLoading || loading} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            {actionLoading ? 'Menyimpan...' : '✓ Verifikasi Dokumen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

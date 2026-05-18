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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface VerifyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regNumber: string
  action: 'approve' | 'reject' | 'request_revision'
  onConfirm: (notes: string) => Promise<void>
  loading: boolean
}

export default function VerifyModal({ open, onOpenChange, regNumber, action, onConfirm, loading }: VerifyModalProps) {
  const [notes, setNotes] = useState('')

  const titles: Record<string, string> = {
    approve: 'Verifikasi Permohonan',
    reject: 'Tolak Permohonan',
    request_revision: 'Minta Revisi',
  }

  const descriptions: Record<string, string> = {
    approve: `Yakin menyetujui ${regNumber}? Status akan berubah menjadi "Verifikasi Dokumen".`,
    reject: `Yakin menolak ${regNumber}?`,
    request_revision: `Minta pemohon merevisi dokumen untuk ${regNumber}.`,
  }

  const icons: Record<string, React.ReactNode> = {
    approve: <CheckCircle className="h-5 w-5 text-green-600" />,
    reject: <AlertCircle className="h-5 w-5 text-red-600" />,
    request_revision: <RefreshCw className="h-5 w-5 text-yellow-600" />,
  }

  const buttonStyles: Record<string, string> = {
    approve: 'bg-green-600 hover:bg-green-700',
    reject: 'bg-red-600 hover:bg-red-700',
    request_revision: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {icons[action]}
            <DialogTitle>{titles[action]}</DialogTitle>
          </div>
          <DialogDescription>
            {descriptions[action]}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="verify-notes">Catatan {action !== 'approve' ? '(wajib)' : '(opsional)'}</Label>
            <Textarea
              id="verify-notes"
              placeholder={action === 'approve' ? 'Catatan tambahan...' : action === 'reject' ? 'Alasan penolakan...' : 'Apa yang perlu diperbaiki?'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={() => onConfirm(notes)} disabled={loading} className={buttonStyles[action]}>
            {loading ? 'Menyimpan...' : action === 'approve' ? 'Verifikasi' : action === 'reject' ? 'Tolak' : 'Kirim Revisi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

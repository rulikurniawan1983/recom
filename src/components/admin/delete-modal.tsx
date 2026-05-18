'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

interface DeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regNumber: string
  onConfirm: () => Promise<void>
  loading: boolean
}

export default function DeleteModal({ open, onOpenChange, regNumber, onConfirm, loading }: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <DialogTitle>Hapus Permohonan</DialogTitle>
          </div>
          <DialogDescription>
            Hapus <strong>{regNumber}</strong>? Tindakan ini tidak dapat dibatalkan. Semua data terkait akan dihapus secara permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={loading} variant="destructive">
            {loading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

interface DeleteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { full_name: string | null; email: string } | null
  onConfirm: () => Promise<void>
  loading: boolean
}

export default function DeleteUserModal({ open, onOpenChange, user, onConfirm, loading }: DeleteUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <DialogTitle>Hapus Pengguna</DialogTitle>
          </div>
          <DialogDescription>
            Hapus <strong>{user?.full_name || user?.email}</strong>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
          <Button onClick={onConfirm} disabled={loading} variant="destructive">Hapus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

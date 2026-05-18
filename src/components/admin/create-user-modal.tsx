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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Users, UserCog } from 'lucide-react'

interface CreateUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: { email: string; password: string; fullName: string; role: 'user' | 'admin' }) => Promise<void>
  loading: boolean
}

export default function CreateUserModal({ open, onOpenChange, onConfirm, loading }: CreateUserModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')

  const reset = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setRole('user')
  }

  const handleConfirm = async () => {
    await onConfirm({ email, password, fullName, role })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </div>
          <DialogDescription>
            Buat akun baru untuk mengakses sistem.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input id="new-email" type="email" placeholder="nama@contoh.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-name">Nama Lengkap</Label>
            <Input id="new-name" placeholder="Nama lengkap pengguna" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Kata Sandi</Label>
            <Input id="new-password" type="password" placeholder="Min. 6 karakter" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role">Peran</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  role === 'user'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-200'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="h-4 w-4 inline mr-1" />
                Pengguna
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  role === 'admin'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 ring-2 ring-purple-200'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <UserCog className="h-4 w-4 inline mr-1" />
                Admin
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !email.trim() || !password.trim() || !fullName.trim()} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Membuat...' : 'Buat Pengguna'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

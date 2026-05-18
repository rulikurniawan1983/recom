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
import { ClipboardCheck, Calendar, MapPin, FileText } from 'lucide-react'

interface ScheduleInspectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regNumber: string
  onConfirm: (data: { scheduled_date: string; scheduled_time: string; location: string; notes: string }) => Promise<void>
  loading: boolean
}

export default function ScheduleInspectionModal({ open, onOpenChange, regNumber, onConfirm, loading }: ScheduleInspectionModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const defaultDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  }

  const handleOpen = () => {
    setDate(defaultDate())
    setTime('09:00')
    setLocation('')
    setNotes('')
  }

  const handleConfirm = async () => {
    await onConfirm({ scheduled_date: date, scheduled_time: time, location, notes })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); else handleOpen(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <DialogTitle>Jadwalkan Pemeriksaan Lapangan</DialogTitle>
          </div>
          <DialogDescription>
            Jadwalkan pemeriksaan lapangan untuk {regNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sched-date"><Calendar className="h-3.5 w-3.5 inline mr-1" />Tanggal</Label>
              <Input id="sched-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sched-time">Jam</Label>
              <Input id="sched-time" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-location"><MapPin className="h-3.5 w-3.5 inline mr-1" />Lokasi</Label>
            <Input id="sched-location" placeholder="Alamat lokasi pemeriksaan..." value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched-notes"><FileText className="h-3.5 w-3.5 inline mr-1" />Catatan</Label>
            <Input id="sched-notes" placeholder="Catatan untuk tim pemeriksa..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !date || !location} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Menyimpan...' : 'Jadwalkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ClipboardCheck } from 'lucide-react'

interface AssessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regNumber: string
  onConfirm: (data: { assessment_score: number; assessment_notes: string; recommendation_file_url: string }) => Promise<void>
  loading: boolean
}

export default function AssessModal({ open, onOpenChange, regNumber, onConfirm, loading }: AssessModalProps) {
  const [score, setScore] = useState(0)
  const [notes, setNotes] = useState('')
  const [recUrl, setRecUrl] = useState('')

  const handleOpen = () => {
    setScore(0)
    setNotes('')
    setRecUrl('')
  }

  const handleConfirm = async () => {
    await onConfirm({ assessment_score: score, assessment_notes: notes, recommendation_file_url: recUrl })
  }

  const isApproved = score >= 75

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); else handleOpen(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-purple-600" />
            <DialogTitle>Penilaian Permohonan</DialogTitle>
          </div>
          <DialogDescription>
            Masukkan skor 0–100 untuk {regNumber}. Nilai ≥ 75 disetujui, nilai &lt; 75 ditolak.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="assess-score">Skor Penilaian (0–100)</Label>
            <div className="flex items-center gap-4">
              <input
                id="assess-score"
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={e => setScore(parseInt(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <div className={`w-16 text-center text-xl font-bold rounded-lg px-2 py-1 ${
                isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {score}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 — Ditolak</span>
              <span>75 — Disetujui</span>
              <span>100</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assess-notes">Catatan Penilaian</Label>
            <Textarea
              id="assess-notes"
              placeholder="Alasan dan catatan untuk skor ini..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assess-url">URL Rekomendasi (opsional)</Label>
            <Input
              id="assess-url"
              placeholder="https://example.com/rekomendasi.pdf"
              value={recUrl}
              onChange={e => setRecUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !notes.trim()} className={isApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
            {loading ? 'Menyimpan...' : isApproved ? `Setujui (Skor ${score})` : `Tolak (Skor ${score})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

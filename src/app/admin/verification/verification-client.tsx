'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase'
import { NKVRegistration } from '@/lib/types'

interface AdminVerificationClientProps {
  registrations: any[]
}

export default function AdminVerificationClient({ registrations }: AdminVerificationClientProps) {
  const [selectedReg, setSelectedReg] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleVerify = async (id: string, status: 'document_verification' | 'revision_requested') => {
    setLoading(true)
    
    const { error } = await supabase
      .from('nkv_registrations')
      .update({ 
        status,
        verification_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (!error) {
      setSelectedReg(null)
      setNotes('')
      // Refresh page
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verifikasi Dokumen</h1>
      
      {registrations.length === 0 ? (
        <p className="text-gray-600">Tidak ada pendaftaran yang menunggu verifikasi</p>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Card key={reg.id}>
              <CardHeader>
                <CardTitle>{reg.registration_number}</CardTitle>
                <CardDescription>
                  {reg.profiles?.full_name} - {reg.business_units?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {reg.profiles?.email}</p>
                  <p><strong>Tanggal Daftar:</strong> {new Date(reg.created_at).toLocaleDateString('id-ID')}</p>
                  <p><strong>Dokumen:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {reg.registration_documents?.map((doc: any) => (
                      <li key={doc.id}>{doc.document_type} - {doc.file_name}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button onClick={() => setSelectedReg(reg)}>
                    Verifikasi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verifikasi Dokumen</CardTitle>
              <CardDescription>
                {selectedReg.registration_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catatan Verifikasi
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan verifikasi..."
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReg(null)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  onClick={() => handleVerify(selectedReg.id, 'revision_requested')}
                  disabled={loading}
                >
                  Minta Revisi
                </Button>
                <Button
                  onClick={() => handleVerify(selectedReg.id, 'document_verification')}
                  disabled={loading}
                >
                  Verifikasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { CheckCircle, Copy } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  trackingCode: string
  onClose: () => void
}

export default function SuccessModal({ isOpen, trackingCode, onClose }: SuccessModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="text-center text-blue-900">Pendaftaran Berhasil!</ModalTitle>
      </ModalHeader>
      
      <ModalContent>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Kode Tracking Anda</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <code className="text-lg font-mono font-bold text-blue-900">{trackingCode}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-800"
              >
                {copied ? 'Tersalin!' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-blue-600">
            <p>Gunakan kode tracking ini untuk memantau status permohonan Anda.</p>
            <p className="mt-1">Simpan kode ini dengan baik.</p>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Mengerti
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}
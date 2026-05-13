'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import TrackingModalUI from '@/components/tracking/tracking-modal'

interface TrackingModalContextType {
  isOpen: boolean
  openTrackingModal: () => void
  closeTrackingModal: () => void
}

const TrackingModalContext = createContext<TrackingModalContextType | undefined>(undefined)

export function TrackingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openTrackingModal = useCallback(() => setIsOpen(true), [])
  const closeTrackingModal = useCallback(() => setIsOpen(false), [])

  return (
    <TrackingModalContext.Provider value={{ isOpen, openTrackingModal, closeTrackingModal }}>
      {children}
      <TrackingModalUI isOpen={isOpen} onClose={closeTrackingModal} />
    </TrackingModalContext.Provider>
  )
}

export function useTrackingModal() {
  const context = useContext(TrackingModalContext)
  if (context === undefined) {
    throw new Error('useTrackingModal must be used within a TrackingModalProvider')
  }
  return context
}

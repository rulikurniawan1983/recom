'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AdminDokterVerificationClient from './dokter-verification-client'

interface AdminVerificationSubPageProps {
  initialRegistrations?: Array<{
    id: string
    registration_number: string
    profiles?: { full_name: string | null; email: string }
    full_name: string
    phone: string
    email: string
    clinic_address: string
    nib_number: string | null
    strv_number: string | null
    color_photo_url: string | null
    diploma_url: string | null
    competency_cert_url: string | null
    professional_recommendation_url: string | null
    created_at: string
  }>
}

export default function AdminVerificationSubPage({ initialRegistrations }: AdminVerificationSubPageProps = {}) {
  const [registrations, setRegistrations] = useState(initialRegistrations || [])
  const [loading, setLoading] = useState(!initialRegistrations)

  useEffect(() => {
    if (initialRegistrations) return
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('dokter_hewan_registrations')
          .select(`
            *,
            profiles(full_name, email)
          `)
          .eq('status', 'submitted')
          .order('created_at', { ascending: false })

        setRegistrations(data || [])
      } catch {
        setRegistrations([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [initialRegistrations])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return <AdminDokterVerificationClient registrations={registrations} />
}
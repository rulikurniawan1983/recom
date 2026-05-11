'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut()
      setTimeout(() => router.push('/'), 1500)
    }
    logout()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-gradient-shift">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-xl font-medium">Logging out...</p>
        <p className="text-red-100 text-sm mt-2">Redirecting to homepage</p>
      </div>
    </div>
  )
}
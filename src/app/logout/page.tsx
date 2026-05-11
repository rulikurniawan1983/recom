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
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-blue-900 text-xl font-medium">Logging out...</p>
        <p className="text-gray-600 text-sm mt-2">Redirecting to homepage</p>
      </div>
    </div>
  )
}
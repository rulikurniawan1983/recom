'use client'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [settingsData, setSettingsData] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    language: 'id',
    timezone: 'Asia/Jakarta'
  })
  const router = useRouter()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // For now, we'll use default settings since we don't have a settings table
      // In a real app, you would fetch from a user_settings table
      setLoading(false)
    } catch (err) {
      setError('Gagal memuat pengaturan')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // In a real app, you would save to a user_settings table
      // For now, we'll just show success
      setSuccess('Pengaturan berhasil disimpan')
      setLoading(false)
    } catch (err) {
      setError('Gagal menyimpan pengaturan')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Memuat pengaturan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-6">
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="notifications">Notifikasi</Label>
              <div className="flex items-center">
                <Input 
                  id="notifications" 
                  type="checkbox" 
                  checked={settingsData.notifications}
                  onChange={(e) => setSettingsData({...settingsData, notifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Terima notifikasi untuk permohonan dan pembaruan</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="emailUpdates">Pembaruan lewat Email</Label>
              <div className="flex items-center">
                <Input 
                  id="emailUpdates" 
                  type="checkbox" 
                  checked={settingsData.emailUpdates}
                  onChange={(e) => setSettingsData({...settingsData, emailUpdates: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Terima email untuk konfirmasi dan newsletter</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="smsUpdates">Pembaruan lewat SMS</Label>
              <div className="flex items-center">
                <Input 
                  id="smsUpdates" 
                  type="checkbox" 
                  checked={settingsData.smsUpdates}
                  onChange={(e) => setSettingsData({...settingsData, smsUpdates: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Terima SMS untuknotifikasi penting</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="language">Bahasa</Label>
              <select 
                id="language" 
                value={settingsData.language}
                onChange={(e) => setSettingsData({...settingsData, language: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="timezone">Zona Waktu</Label>
              <select 
                id="timezone" 
                value={settingsData.timezone}
                onChange={(e) => setSettingsData({...settingsData, timezone: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                <option value="Asia/Pontianak">WIB (Pontianak)</option>
                <option value="Asia/Makassar">WITA (Makassar)</option>
                <option value="Asia/Jayapura">WIT (Jayapura)</option>
              </select>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
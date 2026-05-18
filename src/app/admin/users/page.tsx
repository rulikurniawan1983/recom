'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  phone: string
  company_name: string
  created_at: string
}

export default function PromoteUserPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/promote')
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || 'Gagal mengambil data pengguna')
          return
        }
        
        setProfiles(data.profiles || [])
      } catch {
        setError('Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfiles()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/promote?search=${encodeURIComponent(search)}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Gagal mengambil data pengguna')
        return
      }
      
      setProfiles(data.profiles || [])
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async (userId: string, role: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Gagal mengubah role pengguna')
        return
      }
      
      setSuccess(data.message)
      handleSearch({ preventDefault: () => {} } as React.FormEvent)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini? Semua data terkait akan dihapus.')) {
      return
    }
    
    setDeletingId(userId)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch(`/api/admin/promote/${userId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Gagal menghapus user')
        return
      }
      
      setSuccess(data.message)
      setProfiles(profiles.filter(p => p.id !== userId))
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Kelola Pengguna</CardTitle>
            <CardDescription>Ubah role pengguna menjadi admin</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Cari berdasarkan email atau nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                Cari
              </Button>
            </form>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {profiles.length === 0 && !loading ? (
                <p className="text-center text-gray-500 py-4">Tidak ada pengguna ditemukan</p>
              ) : (
                profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-blue-900">{profile.full_name || 'Tanpa nama'}</p>
                      <p className="text-sm text-blue-700">{profile.email}</p>
                      <p className="text-xs text-gray-500">
                        {profile.company_name && `${profile.company_name} • `}
                        {new Date(profile.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={profile.role}
                        onChange={(e) => handlePromote(profile.id, e.target.value)}
                        disabled={loading}
                        className="rounded-md border border-blue-300 px-3 py-2 text-sm text-blue-800 bg-white"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(profile.id)}
                        disabled={loading || deletingId === profile.id}
                      >
                        {deletingId === profile.id ? 'Hapus...' : 'Hapus'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
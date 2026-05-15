'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { FileText, Stethoscope } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [regType, setRegType] = useState<'nkv' | 'dokter-hewan' | 'veterinary' | ''>('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          phone: phone || null,
          company_name: companyName || null,
          role: 'user',
        }, { onConflict: 'id' })

        if (profileError) {
          setError(profileError.message)
          return
        }
      }

      setSuccess(true)

       // Redirect to appropriate registration form
       setTimeout(() => {
         if (regType === 'nkv') {
           router.push('/nkv/register')
         } else if (regType === 'dokter-hewan') {
           router.push('/dokter-hewan/register')
         } else if (regType === 'veterinary') {
           router.push('/services/veterinary/register')
         } else {
           router.push('/dashboard')
         }
       }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
<CardHeader className="text-center">
  <CardTitle className="text-2xl font-bold">Daftar Akun</CardTitle>
  <CardDescription>
    Buat akun untuk mengakses semua layanan SLIDER - VETSYS: pelayanan kesehatan hewan, rekomendasi NKV, dan rekomendasi praktek dokter hewan
  </CardDescription>
</CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                Pendaftaran berhasil! Mengalihkan ke form permohonan...
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                placeholder="Nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                placeholder="08xx xxxx xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nama Perusahaan/Unit Usaha (opsional)</Label>
              <Input
                id="companyName"
                placeholder="Nama perusahaan/unit usaha"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

              {/* Registration Type Selection */}
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium text-gray-700">Pilih Jenis Permohonan</Label>
                <select 
                  value={regType}
                  onChange={(e) => setRegType(e.target.value as 'nkv' | 'dokter-hewan' | 'veterinary' | '')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-blue-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih jenis permohonan</option>
                  <option value="veterinary">Pelayanan Kesehatan Hewan</option>
                  <option value="nkv">Nomor Kontrol Veteriner (NKV)</option>
                  <option value="dokter-hewan">Rekomendasi Praktek Dokter Hewan</option>
                </select>
              </div>

            <Button type="submit" className="w-full" disabled={loading || !regType}>
              {loading ? 'Loading...' : 'Daftar & Lanjut ke Formulir'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Sudah punya akun? </span>
              <Link href="/login" className="text-blue-600 hover:underline">
                Login disini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
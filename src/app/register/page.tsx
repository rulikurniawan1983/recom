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
  const [regType, setRegType] = useState<'nkv' | 'dokter-hewan' | null>(null)
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
        } else {
          router.push('/login')
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
            Buat akun untuk mengakses sistem rekomendasi
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegType('nkv')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    regType === 'nkv'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className={`h-6 w-6 ${regType === 'nkv' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${regType === 'nkv' ? 'text-blue-700' : 'text-gray-700'}`}>
                      NKV
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:block">
                      Nomor Kontrol Veteriner
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRegType('dokter-hewan')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    regType === 'dokter-hewan'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Stethoscope className={`h-6 w-6 ${regType === 'dokter-hewan' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${regType === 'dokter-hewan' ? 'text-blue-700' : 'text-gray-700'}`}>
                      Dokter Hewan
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:block">
                      Praktek Dokter Hewan
                    </span>
                  </div>
                </button>
              </div>
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
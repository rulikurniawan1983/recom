'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { EyeOff, Eye, Mail, Lock, User, Loader2, Shield } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session && data.user) {
        try {
          const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: data.session }),
          })
          if (!res.ok) console.warn('Session sync failed')
        } catch (e) {
          console.warn('Session sync error:', e)
        }
        
        // Check if user is admin and redirect accordingly
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        // Debug: log profile data
        console.log('Profile check:', { profile, profileError, userEmail: data.user.email })
        
        // Check if admin by role OR by known admin email
        const isAdmin = profile?.role === 'admin' || 
                        data.user.email === 'admin@recom.com' ||
                        data.user.email === 'rulikurniawan1983@gmail.com'
        
        if (isAdmin) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Welcome */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SLIDER - VETSYS</h1>
          <p className="text-sm text-gray-600">
            Sistem Layanan Digital Kesehatan Hewan
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-center text-gray-900">
              Masuk ke Akun Anda
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-500">
              Selamat datang kembali! Masukkan kredensial Anda untuk mengakses layanan kami.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 pr-3"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    aria-label="Show password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor="remember-me" className="text-gray-600">
                    Ingat saya
                  </Label>
                </div>
                <Link href="#" className="text-blue-500 hover:text-blue-600 hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>
              
              {/* Submit Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sedang masuk...</span>
                  </div>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Divider or Alternative Login */}
        <div className="relative text-center text-sm mt-6">
          <div className="relative">
            <span className="px-2 bg-gradient-to-br from-blue-50 via-white to-blue-50">
              atau masuk dengan
            </span>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
        </div>
        
        {/* Social Login (Placeholder) */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full flex items-center justify-center gap-3 text-sm font-medium text-gray-600 border-gray-300 hover:border-gray-400">
            <User className="h-4 w-4" />
            Lanjut dengan Email
          </Button>
        </div>

        {/* Register Link */}
        <div className="text-center text-sm mt-6">
          <span className="text-gray-500">
            Belum punya akun?
          </span>
          <Link href="/register" className="text-blue-600 font-medium hover:text-blue-700">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}
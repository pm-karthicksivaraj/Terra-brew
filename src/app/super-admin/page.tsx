'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Globe, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

// Deterministic pseudo-random to avoid SSR/client mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export default function SuperAdminPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('admin@terrabrew.platform')
  const [password, setPassword] = useState('Admin@2024')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()
  const { t2, lang, setLang } = useI18n()

  useEffect(() => { setMounted(true) }, [])

  // If already authenticated as platform admin, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isPlatformAdmin) {
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/super-admin/dashboard'
      window.location.href = callbackUrl
    }
  }, [status, session])


  // Pre-compute particle positions using deterministic random
  const particles = Array.from({ length: 15 }, (_, i) => ({
    width: 3 + seededRandom(i * 3 + 1) * 6,
    height: 3 + seededRandom(i * 3 + 2) * 6,
    left: seededRandom(i * 3 + 3) * 100,
    top: seededRandom(i * 3 + 4) * 100,
    opacity: 0.08 + seededRandom(i * 3 + 5) * 0.15,
    duration: 8 + seededRandom(i * 3 + 6) * 6,
    delay: seededRandom(i * 3 + 7) * 4,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/platform-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || t2('Thông tin đăng nhập không hợp lệ', 'Invalid credentials'))
        toast.error(data.error || t2('Đăng nhập thất bại', 'Login failed'))
        return
      }

      toast.success(t2('Đăng nhập thành công!', 'Login successful!'))
      // Full page reload to ensure SessionProvider picks up the new cookie.
      // router.push() doesn't trigger SessionProvider refetch since it's a SPA navigation.
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/super-admin/dashboard'
      window.location.href = callbackUrl
    } catch {
      setError(t2('Lỗi kết nối máy chủ', 'Server connection error'))
      toast.error(t2('Lỗi kết nối máy chủ', 'Server connection error'))
    } finally {
      setLoading(false)
    }
  }

  // Don't render any DOM until client-side mounted to prevent removeChild
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <Shield className="w-8 h-8 animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-coffee-900" />

      {/* Floating elements — pure CSS */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `rgba(212, 165, 116, ${p.opacity})`,
            animation: `saFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{ animation: 'saFadeUp 0.6s ease-out both' }}
      >
        <Card className="bg-white/95 backdrop-blur-xl border-stone-200/30 shadow-2xl shadow-black/20 rounded-2xl">
          <CardHeader className="pb-2 pt-8 px-8">
            <div
              className="flex flex-col items-center mb-4"
              style={{ animation: 'saScaleIn 0.5s ease-out 0.2s both' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center shadow-lg mb-4">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800">{t2('Quản trị Nền tảng', 'Platform Admin')}</h1>
              <p className="text-stone-500 text-sm mt-1">Terra Brew</p>
            </div>
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1.5 text-stone-500 hover:text-stone-800 text-xs">
                <Globe className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'English' : 'Tiếng Việt'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-stone-700 text-xs font-medium">{t2('Email', 'Email')}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-stone-50/50 border-stone-200 focus:border-stone-500 rounded-xl h-11 text-sm" required />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 text-xs font-medium">{t2('Mật khẩu', 'Password')}</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-stone-50/50 border-stone-200 focus:border-stone-500 rounded-xl h-11 text-sm pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-xs text-stone-600">
                <p className="font-medium mb-1">{t2('Tài khoản quản trị nền tảng', 'Platform admin credentials')}</p>
                <p className="text-stone-400">admin@terrabrew.platform / Admin@2024</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900 text-white h-11 rounded-xl shadow-lg transition-all text-sm font-medium">
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang đăng nhập...', 'Signing in...')}</>) : t2('Đăng nhập', 'Sign In')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => { window.location.href = '/login' }} className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors">
                {t2('← Quay lại đăng nhập tổ chức', '← Back to tenant login')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Coffee, Globe, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
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

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('admin@metrang-coffee.terrabrew.com')
  const [password, setPassword] = useState('Admin@2024')
  const [tenantSlug, setTenantSlug] = useState('metrang-coffee')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()
  const { t2, lang, setLang } = useI18n()

  useEffect(() => { setMounted(true) }, [])

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !session.user.isPlatformAdmin) {
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/dashboard'
      window.location.href = callbackUrl
    }
  }, [status, session])


  // Pre-compute particle positions using deterministic random
  const particles = Array.from({ length: 20 }, (_, i) => ({
    width: 4 + seededRandom(i * 3 + 1) * 8,
    height: 4 + seededRandom(i * 3 + 2) * 8,
    left: seededRandom(i * 3 + 3) * 100,
    top: seededRandom(i * 3 + 4) * 100,
    opacity: 0.1 + seededRandom(i * 3 + 5) * 0.2,
    duration: 6 + seededRandom(i * 3 + 6) * 8,
    xShift: seededRandom(i * 3 + 7) * 20 - 10,
    delay: seededRandom(i * 3 + 8) * 5,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantSlug }),
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
      const callbackUrl = params.get('callbackUrl') || '/dashboard'
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
      <div className="min-h-screen flex items-center justify-center bg-coffee-900">
        <div className="flex flex-col items-center gap-3 text-coffee-400">
          <Coffee className="w-8 h-8 animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-800 via-coffee-900 to-stone-900" />

      {/* Floating particles — pure CSS */}
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
            animation: `loginFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Gradient orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #d4a574, transparent)',
          top: '-10%',
          right: '-10%',
          animation: 'loginPulse 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #8b5a1e, transparent)',
          bottom: '-5%',
          left: '-5%',
          animation: 'loginPulse 12s ease-in-out infinite',
        }}
      />

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{ animation: 'loginFadeUp 0.6s ease-out 0.2s both' }}
      >
        <Card className="bg-white/95 backdrop-blur-xl border-coffee-200/30 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-8 px-8">
            <div
              className="flex flex-col items-center mb-4"
              style={{ animation: 'loginScaleIn 0.5s ease-out 0.4s both' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-lg shadow-coffee-400/30 mb-4">
                <Coffee className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-coffee-900">Terra Brew</h1>
              <p className="text-coffee-500 text-sm mt-1">
                {t2('Đăng nhập vào Nền tảng', 'Sign in to Platform')}
              </p>
            </div>

            {/* Language toggle */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                className="gap-1.5 text-coffee-500 hover:text-coffee-800 hover:bg-coffee-50 text-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'English' : 'Tiếng Việt'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tenant Slug */}
              <div className="space-y-2">
                <Label htmlFor="tenantSlug" className="text-coffee-700 text-xs font-medium">
                  {t2('Mã Tổ chức', 'Tenant Slug')}
                </Label>
                <Input
                  id="tenantSlug"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="metrang"
                  className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11 text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-coffee-700 text-xs font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t2('Nhập email của bạn', 'Enter your email')}
                  className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11 text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-coffee-700 text-xs font-medium">
                  {t2('Mật khẩu', 'Password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11 text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Demo info */}
              <div className="bg-coffee-50 border border-coffee-200/50 rounded-xl p-3 text-xs text-coffee-600">
                <p className="font-medium mb-1">{t2('Tài khoản demo đã được điền sẵn', 'Demo credentials pre-filled')}</p>
                <p className="text-coffee-500">admin@metrang-coffee.terrabrew.com / Admin@2024 / metrang-coffee</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white h-11 rounded-xl shadow-lg shadow-coffee-400/20 transition-all duration-300 hover:shadow-xl text-sm font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t2('Đang đăng nhập...', 'Signing in...')}
                  </>
                ) : (
                  t2('Đăng nhập', 'Sign In')
                )}
              </Button>
            </form>

            {/* Seed data link */}
            <div className="mt-4 text-center">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/seed', { method: 'POST' })
                    const data = await res.json()
                    if (data.success) {
                      toast.success(t2('Đã tải dữ liệu mẫu thành công!', 'Sample data loaded!'))
                    } else {
                      toast.error(data.error || 'Error')
                    }
                  } catch {
                    toast.error(t2('Lỗi khi tải dữ liệu mẫu', 'Error loading sample data'))
                  }
                }}
                className="text-xs text-coffee-500 hover:text-coffee-700 underline underline-offset-2 transition-colors"
              >
                {t2('Tải dữ liệu mẫu (Đầy đủ)', 'Load Sample Data (Full Pipeline)')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom text */}
        <p className="text-center text-coffee-400/60 text-xs mt-6">
          © 2024 Terra Brew — {t2('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
        </p>
      </div>
    </div>
  )
}

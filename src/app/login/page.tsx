'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Coffee, Globe, Eye, EyeOff, Loader2, AlertCircle,
  ArrowLeft, Building2, MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'
import { getEntityTypeLabel, getEntityTypeIcon } from '@/lib/module-config'

// Deterministic pseudo-random to avoid SSR/client mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

interface TenantOption {
  tenantId: string
  tenantName: string
  tenantSlug: string
  entityType: string
  countryCode: string
  country: string
  currency: string
  language: string
  userId: string
  userName: string
  role: string
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('admin@metrang-coffee.terrabrew.com')
  const [password, setPassword] = useState('Admin@2024')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Two-step flow state
  const [step, setStep] = useState<'credentials' | 'select-org'>('credentials')
  const [tenants, setTenants] = useState<TenantOption[]>([])

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

  // Step 1: Submit email + password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
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

      if (data.requiresTenantSelection) {
        // Multiple tenants found — show org picker
        setTenants(data.tenants)
        setStep('select-org')
        return
      }

      // Single tenant — auto-login success
      toast.success(t2('Đăng nhập thành công!', 'Login successful!'))
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

  // Step 2: Select a specific tenant
  const handleSelectTenant = async (tenantId: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login/select-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantId }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || t2('Đăng nhập thất bại', 'Login failed'))
        toast.error(data.error || t2('Đăng nhập thất bại', 'Login failed'))
        return
      }

      toast.success(t2('Đăng nhập thành công!', 'Login successful!'))
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

  const handleBackToLogin = () => {
    setStep('credentials')
    setTenants([])
    setError('')
  }

  // Don't render any DOM until client-side mounted to prevent removeChild
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#561C24]">
        <div className="flex flex-col items-center gap-3 text-[#C7B7A3]">
          <Coffee className="w-8 h-8 animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#561C24] via-[#6D2932] to-[#3d1419]" />

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
            background: `rgba(199, 183, 163, ${p.opacity})`,
            animation: `loginFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Gradient orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #C7B7A3, transparent)',
          top: '-10%',
          right: '-10%',
          animation: 'loginPulse 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #6D2932, transparent)',
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
        <Card className="bg-white/95 backdrop-blur-xl border-[#C7B7A3]/30 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-8 px-8">
            <div
              className="flex flex-col items-center mb-4"
              style={{ animation: 'loginScaleIn 0.5s ease-out 0.4s both' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D2932] to-[#561C24] flex items-center justify-center shadow-lg shadow-[#6D2932]/30 mb-4">
                <Coffee className="w-9 h-9 text-[#E8D8C4]" />
              </div>
              <h1 className="text-2xl font-bold text-[#561C24]" style={{ fontFamily: 'Space Mono, monospace' }}>
                Terra Brew
              </h1>
              <p className="text-[#6D2932]/70 text-sm mt-1">
                {step === 'credentials'
                  ? t2('Đăng nhập vào Nền tảng', 'Sign in to Platform')
                  : t2('Chọn Tổ chức', 'Select Organization')
                }
              </p>
            </div>

            {/* Language toggle */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                className="gap-1.5 text-[#6D2932] hover:text-[#561C24] hover:bg-[#E8D8C4]/40 text-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'English' : 'Tiếng Việt'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            {step === 'credentials' ? (
              /* ───── Step 1: Email + Password ───── */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#561C24] text-xs font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t2('Nhập email của bạn', 'Enter your email')}
                    className="bg-[#E8D8C4]/30 border-[#C7B7A3] focus:border-[#6D2932] focus:ring-[#6D2932]/20 rounded-xl h-11 text-sm"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#561C24] text-xs font-medium">
                    {t2('Mật khẩu', 'Password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-[#E8D8C4]/30 border-[#C7B7A3] focus:border-[#6D2932] focus:ring-[#6D2932]/20 rounded-xl h-11 text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D2932]/60 hover:text-[#561C24]"
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
                <div className="bg-[#E8D8C4]/30 border border-[#C7B7A3]/50 rounded-xl p-3 text-xs text-[#6D2932]">
                  <p className="font-medium mb-1">{t2('Tài khoản demo đã được điền sẵn', 'Demo credentials pre-filled')}</p>
                  <p className="text-[#6D2932]/70">admin@metrang-coffee.terrabrew.com / Admin@2024</p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#6D2932] to-[#561C24] hover:from-[#561C24] hover:to-[#3d1419] text-[#E8D8C4] h-11 rounded-xl shadow-lg shadow-[#6D2932]/20 transition-all duration-300 hover:shadow-xl text-sm font-medium"
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
            ) : (
              /* ───── Step 2: Select Organization ───── */
              <div className="space-y-4">
                <p className="text-[#6D2932] text-sm text-center">
                  {t2(
                    'Email của bạn thuộc nhiều tổ chức. Vui lòng chọn:',
                    'Your email belongs to multiple organizations. Please select one:'
                  )}
                </p>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Tenant cards */}
                <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                  {tenants.map((tenant) => {
                    const icon = getEntityTypeIcon(tenant.entityType)
                    const typeLabel = getEntityTypeLabel(tenant.entityType, lang as 'vi' | 'en')

                    return (
                      <button
                        key={tenant.tenantId}
                        type="button"
                        onClick={() => handleSelectTenant(tenant.tenantId)}
                        disabled={loading}
                        className="w-full text-left p-4 rounded-xl border border-[#C7B7A3]/60 bg-[#E8D8C4]/30 hover:bg-[#C7B7A3]/30 hover:border-[#6D2932]/40 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D2932] to-[#561C24] flex items-center justify-center text-lg shrink-0 shadow-sm">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-[#6D2932]/60 shrink-0" />
                              <span className="font-semibold text-[#561C24] text-sm truncate">
                                {tenant.tenantName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-xs text-[#6D2932]/70 bg-[#C7B7A3]/30 px-2 py-0.5 rounded-md">
                                {typeLabel}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[#6D2932]/60">
                                <MapPin className="w-3 h-3" />
                                {tenant.country}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#6D2932]/60">
                              <span>{tenant.currency}</span>
                              <span>·</span>
                              <span>{tenant.language}</span>
                            </div>
                          </div>
                          {loading && (
                            <Loader2 className="w-4 h-4 animate-spin text-[#6D2932]/70 shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-[#6D2932]/70 hover:text-[#561C24] text-sm transition-colors w-full justify-center pt-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t2('Quay lại đăng nhập', 'Back to login')}
                </button>
              </div>
            )}

            {/* Seed data link & platform admin — always visible */}
            {step === 'credentials' && (
              <>
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
                    className="text-xs text-[#6D2932]/70 hover:text-[#561C24] underline underline-offset-2 transition-colors"
                  >
                    {t2('Tải dữ liệu mẫu (Đầy đủ)', 'Load Sample Data (Full Pipeline)')}
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <button
                    onClick={() => window.location.href = '/super-admin'}
                    className="text-xs text-[#6D2932]/60 hover:text-[#561C24] transition-colors"
                  >
                    {t2('Đăng nhập Quản trị nền tảng →', 'Platform Admin Login →')}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bottom text */}
        <p className="text-center text-[#C7B7A3]/60 text-xs mt-6">
          © 2024 Terra Brew — {t2('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Globe, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [email, setEmail] = useState('admin@metrang-coffee.terrabrew.com')
  const [password, setPassword] = useState('Admin@2024')
  const [tenantSlug, setTenantSlug] = useState('metrang-coffee')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('tenant-login', {
        email,
        password,
        tenantSlug,
        redirect: false,
      })

      if (result?.error) {
        setError(t('Thông tin đăng nhập không hợp lệ', 'Invalid credentials'))
        toast.error(t('Đăng nhập thất bại', 'Login failed'))
      } else {
        toast.success(t('Đăng nhập thành công!', 'Login successful!'))
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError(t('Lỗi kết nối máy chủ', 'Server connection error'))
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-800 via-coffee-900 to-stone-900" />
        <div className="relative z-10 w-full max-w-md mx-4">
          <Card className="bg-white/95 backdrop-blur-xl border-coffee-200/30 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 pt-8 px-8">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-lg shadow-coffee-400/30 mb-4">
                  <Coffee className="w-9 h-9 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-coffee-900">Terra Brew</h1>
                <p className="text-coffee-500 text-sm mt-1">Đăng nhập vào Nền tảng</p>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3 text-coffee-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-800 via-coffee-900 to-stone-900" />

      {/* Floating particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(212, 165, 116, ${0.1 + Math.random() * 0.2})`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4a574, transparent)', top: '-10%', right: '-10%' }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5a1e, transparent)', bottom: '-5%', left: '-5%' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/95 backdrop-blur-xl border-coffee-200/30 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-8 px-8">
            {/* Logo */}
            <motion.div
              className="flex flex-col items-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-lg shadow-coffee-400/30 mb-4">
                <Coffee className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-coffee-900">Terra Brew</h1>
              <p className="text-coffee-500 text-sm mt-1">
                {t('Đăng nhập vào Nền tảng', 'Sign in to Platform')}
              </p>
            </motion.div>

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
                  {t('Mã Tổ chức', 'Tenant Slug')}
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
                  placeholder={t('Nhập email của bạn', 'Enter your email')}
                  className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11 text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-coffee-700 text-xs font-medium">
                  {t('Mật khẩu', 'Password')}
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
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-xs"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Demo info */}
              <div className="bg-coffee-50 border border-coffee-200/50 rounded-xl p-3 text-xs text-coffee-600">
                <p className="font-medium mb-1">{t('Tài khoản demo đã được điền sẵn', 'Demo credentials pre-filled')}</p>
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
                    {t('Đang đăng nhập...', 'Signing in...')}
                  </>
                ) : (
                  t('Đăng nhập', 'Sign In')
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
                      toast.success(t('Đã tải dữ liệu mẫu thành công!', 'Sample data loaded!'))
                    } else {
                      toast.error(data.error || 'Error')
                    }
                  } catch {
                    toast.error(t('Lỗi khi tải dữ liệu mẫu', 'Error loading sample data'))
                  }
                }}
                className="text-xs text-coffee-500 hover:text-coffee-700 underline underline-offset-2 transition-colors"
              >
                {t('Tải dữ liệu mẫu (Đầy đủ)', 'Load Sample Data (Full Pipeline)')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom text */}
        <p className="text-center text-coffee-400/60 text-xs mt-6">
          © 2024 Terra Brew — {t('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
        </p>
      </motion.div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Coffee, Globe, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SuperAdminLoginPage() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [email, setEmail] = useState('admin@terrabrew.platform')
  const [password, setPassword] = useState('ChangeMe!2024Secure')
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
      const result = await signIn('platform-login', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('Thông tin đăng nhập không hợp lệ', 'Invalid credentials'))
      } else {
        toast.success(t('Đăng nhập thành công!', 'Login successful!'))
        router.push('/super-admin/dashboard')
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
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-coffee-900" />
        <div className="relative z-10 w-full max-w-md mx-4">
          <Card className="bg-white/95 backdrop-blur-xl border-stone-200/30 shadow-2xl shadow-black/20 rounded-2xl">
            <CardHeader className="pb-2 pt-8 px-8">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center shadow-lg mb-4">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-stone-800">Quản trị Nền tảng</h1>
                <p className="text-stone-500 text-sm mt-1">Terra Brew</p>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3 text-stone-400">
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-coffee-900" />

      {/* Floating elements */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3 + Math.random() * 6,
            height: 3 + Math.random() * 6,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(212, 165, 116, ${0.08 + Math.random() * 0.15})`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4 }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/95 backdrop-blur-xl border-stone-200/30 shadow-2xl shadow-black/20 rounded-2xl">
          <CardHeader className="pb-2 pt-8 px-8">
            <motion.div className="flex flex-col items-center mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center shadow-lg mb-4">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800">{t('Quản trị Nền tảng', 'Platform Admin')}</h1>
              <p className="text-stone-500 text-sm mt-1">Terra Brew</p>
            </motion.div>
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
                <Label className="text-stone-700 text-xs font-medium">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-stone-50/50 border-stone-200 focus:border-stone-500 rounded-xl h-11 text-sm" required />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 text-xs font-medium">{t('Mật khẩu', 'Password')}</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-stone-50/50 border-stone-200 focus:border-stone-500 rounded-xl h-11 text-sm pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-xs" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 text-xs text-stone-600">
                <p className="font-medium mb-1">{t('Tài khoản quản trị nền tảng', 'Platform admin credentials')}</p>
                <p className="text-stone-400">admin@terrabrew.platform / ChangeMe!2024Secure</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900 text-white h-11 rounded-xl shadow-lg transition-all text-sm font-medium">
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Đang đăng nhập...', 'Signing in...')}</>) : t('Đăng nhập', 'Sign In')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => router.push('/login')} className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors">
                {t('← Quay lại đăng nhập tổ chức', '← Back to tenant login')}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

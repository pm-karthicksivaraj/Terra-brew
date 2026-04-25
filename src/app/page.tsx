'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Globe, ChevronRight, Leaf, Shield, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const floatingBeans = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 12 + Math.random() * 24,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 5,
}))

const features = [
  { icon: Leaf, title: 'Truy xuất Nguồn gốc', titleEn: 'Full Traceability', desc: 'Từ nông trại đến tách cà phê', descEn: 'From farm to cup' },
  { icon: Shield, title: 'Bảo mật Dữ liệu', titleEn: 'Data Security', desc: 'Mã hóa AES-256 & Chuỗi khối', descEn: 'AES-256 & Blockchain' },
  { icon: TrendingUp, title: 'Phân tích Thời gian thực', titleEn: 'Real-time Analytics', desc: 'Bảng điều khiển thông minh', descEn: 'Smart dashboards' },
]

export default function LandingPage() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col relative" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-50 via-amber-50 to-stone-100" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="flex items-center justify-between px-6 md:px-12 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-coffee-800 tracking-tight">Terra Brew</span>
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-coffee-500 via-coffee-600 to-coffee-800 flex items-center justify-center shadow-2xl shadow-coffee-400/30">
                  <Coffee className="w-14 h-14 md:w-20 md:h-20 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-coffee-900 mb-4 leading-tight">Terra Brew</h1>
              <p className="text-lg md:text-2xl text-coffee-600 mb-3 font-medium">Nền tảng Truy xuất Nguồn gốc Cà phê</p>
              <div className="flex items-center justify-center gap-2 text-coffee-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-50 via-amber-50 to-stone-100" />

      {/* Floating coffee beans */}
      {floatingBeans.map((bean) => (
        <motion.div
          key={bean.id}
          className="absolute text-coffee-200/30 pointer-events-none select-none"
          style={{ left: `${bean.x}%`, top: `${bean.y}%` }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: bean.duration,
            repeat: Infinity,
            delay: bean.delay,
            ease: 'easeInOut',
          }}
        >
          <Coffee size={bean.size} />
        </motion.div>
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4a574, transparent)', top: '10%', right: '-5%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5a1e, transparent)', bottom: '5%', left: '-3%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-coffee-800 tracking-tight">Terra Brew</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="gap-2 text-coffee-700 hover:text-coffee-900 hover:bg-coffee-100"
            >
              <Globe className="w-4 h-4" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
          </motion.div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Logo */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-coffee-500 via-coffee-600 to-coffee-800 flex items-center justify-center shadow-2xl shadow-coffee-400/30">
                <Coffee className="w-14 h-14 md:w-20 md:h-20 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-coffee-900 mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Terra Brew
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-coffee-600 mb-3 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {t('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
            </motion.p>

            <motion.p
              className="text-sm md:text-base text-coffee-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {t(
                'Giải pháp toàn diện cho chuỗi cung ứng cà phê — từ nông trại, thu hoạch, chế biến đến thị trường. Được bảo vệ bởi chuỗi khối và mã hóa AES-256.',
                'End-to-end solution for the coffee supply chain — from farm, harvest, processing to market. Protected by blockchain and AES-256 encryption.'
              )}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-coffee-400/25 transition-all duration-300 hover:shadow-xl hover:shadow-coffee-400/40"
                onClick={() => router.push('/login')}
              >
                {t('Vào Nền tảng', 'Enter Platform')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-coffee-300 text-coffee-700 hover:bg-coffee-50 px-8 py-6 text-base rounded-xl"
                onClick={() => router.push('/super-admin')}
              >
                {t('Quản trị Nền tảng', 'Platform Admin')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-coffee-200/50 hover:border-coffee-300/80 hover:shadow-lg transition-all duration-300 group"
                whileHover={{ y: -4, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.15 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center mb-4 group-hover:from-coffee-200 group-hover:to-coffee-300 transition-colors">
                  <feature.icon className="w-6 h-6 text-coffee-700" />
                </div>
                <h3 className="font-bold text-coffee-800 mb-1 text-sm">
                  {t(feature.title, feature.titleEn)}
                </h3>
                <p className="text-coffee-500 text-xs leading-relaxed">
                  {t(feature.desc, feature.descEn)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 px-4">
          <p className="text-xs text-coffee-400">
            © 2024 Terra Brew — {t('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
          </p>
        </footer>
      </div>
    </div>
  )
}

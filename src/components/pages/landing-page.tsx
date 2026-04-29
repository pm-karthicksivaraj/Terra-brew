'use client'

import { useState, useMemo } from 'react'
import { Coffee, Globe, ChevronRight, Leaf, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// Deterministic pseudo-random to avoid SSR/client mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export default function LandingPage() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const router = useRouter()

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const floatingBeans = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 5 + 1) * 100,
      y: seededRandom(i * 5 + 2) * 100,
      size: 12 + seededRandom(i * 5 + 3) * 24,
      duration: 8 + seededRandom(i * 5 + 4) * 12,
      delay: seededRandom(i * 5 + 5) * 5,
    })),
  [])

  const features = [
    { icon: Leaf, title: 'Truy xuất Nguồn gốc', titleEn: 'Full Traceability', desc: 'Từ nông trại đến tách cà phê', descEn: 'From farm to cup' },
    { icon: Shield, title: 'Bảo mật Dữ liệu', titleEn: 'Data Security', desc: 'Mã hóa AES-256 & Chuỗi khối', descEn: 'AES-256 & Blockchain' },
    { icon: TrendingUp, title: 'Phân tích Thời gian thực', titleEn: 'Real-time Analytics', desc: 'Bảng điều khiển thông minh', descEn: 'Smart dashboards' },
  ]

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-amber-50 to-stone-100" />

      {/* Floating coffee beans — pure CSS */}
      {floatingBeans.map((bean) => (
        <div
          key={bean.id}
          className="absolute text-muted/30 pointer-events-none select-none"
          style={{
            left: `${bean.x}%`,
            top: `${bean.y}%`,
            animation: `beanFloat ${bean.duration}s ease-in-out ${bean.delay}s infinite, beanRotate ${bean.duration}s linear ${bean.delay}s infinite`,
          }}
        >
          <Coffee size={bean.size} />
        </div>
      ))}

      {/* Gradient orbs — pure CSS */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4a574, transparent)', top: '10%', right: '-5%', animation: 'orbPulse 8s ease-in-out infinite' }}
      />
      <div
        className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5a1e, transparent)', bottom: '5%', left: '-3%', animation: 'orbPulse 10s ease-in-out infinite' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6" style={{ animation: 'fadeIn 0.6s ease-out both' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Terra Brew</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Globe className="w-4 h-4" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div
            className="text-center max-w-4xl mx-auto"
            style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
          >
            {/* Logo */}
            <div
              className="mb-8 flex justify-center"
              style={{ animation: 'scaleIn 0.5s ease-out 0.3s both' }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                <Coffee className="w-14 h-14 md:w-20 md:h-20 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight"
              style={{ animation: 'fadeIn 0.6s ease-out 0.5s both' }}
            >
              Terra Brew
            </h1>

            <p
              className="text-lg md:text-2xl text-muted-foreground mb-3 font-medium"
              style={{ animation: 'fadeIn 0.6s ease-out 0.7s both' }}
            >
              {t('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
            </p>

            <p
              className="text-sm md:text-base text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ animation: 'fadeIn 0.6s ease-out 0.8s both' }}
            >
              {t(
                'Giải pháp toàn diện cho chuỗi cung ứng cà phê — từ nông trại, thu hoạch, chế biến đến thị trường. Được bảo vệ bởi chuỗi khối và mã hóa AES-256.',
                'End-to-end solution for the coffee supply chain — from farm, harvest, processing to market. Protected by blockchain and AES-256 encryption.'
              )}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              style={{ animation: 'fadeIn 0.6s ease-out 0.9s both' }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
                onClick={() => router.push('/login')}
              >
                {t('Vào Nền tảng', 'Enter Platform')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-muted px-8 py-6 text-base rounded-xl"
                onClick={() => router.push('/super-admin')}
              >
                {t('Quản trị Nền tảng', 'Platform Admin')}
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full"
            style={{ animation: 'fadeIn 0.6s ease-out 1.1s both' }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-border/80 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-primary transition-colors">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm">
                  {t(feature.title, feature.titleEn)}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t(feature.desc, feature.descEn)}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 px-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Terra Brew — {t('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
          </p>
        </footer>
      </div>

      {/* CSS Keyframes */}
    </div>
  )
}

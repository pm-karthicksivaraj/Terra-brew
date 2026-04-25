'use client'

import dynamic from 'next/dynamic'
import { Coffee, Loader2 } from 'lucide-react'

const LandingContent = dynamic(() => import('@/components/pages/landing-page'), {
  ssr: false,
  loading: () => (
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
  ),
})

export default function Page() {
  return <LandingContent />
}

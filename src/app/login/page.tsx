'use client'

import dynamic from 'next/dynamic'
import { Coffee, Loader2 } from 'lucide-react'

const LoginContent = dynamic(() => import('@/components/pages/login-page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center relative" style={{ fontFamily: '"Space Mono", monospace' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-800 via-coffee-900 to-stone-900" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl border border-coffee-200/30 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
          <div className="pb-2 pt-8 px-8">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center shadow-lg shadow-coffee-400/30 mb-4">
                <Coffee className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-coffee-900">Terra Brew</h1>
              <p className="text-coffee-500 text-sm mt-1">Đăng nhập vào Nền tảng</p>
            </div>
          </div>
          <div className="px-8 pb-8 pt-4">
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3 text-coffee-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
})

export default function LoginPage() {
  return <LoginContent />
}

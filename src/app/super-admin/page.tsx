'use client'

import dynamic from 'next/dynamic'
import { Shield, Loader2 } from 'lucide-react'

const SuperAdminLoginContent = dynamic(() => import('@/components/pages/super-admin-login-page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center relative" style={{ fontFamily: '"Space Mono", monospace' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-coffee-900" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl border border-stone-200/30 shadow-2xl shadow-black/20 rounded-2xl">
          <div className="pb-2 pt-8 px-8">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center shadow-lg mb-4">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800">Quản trị Nền tảng</h1>
              <p className="text-stone-500 text-sm mt-1">Terra Brew</p>
            </div>
          </div>
          <div className="px-8 pb-8 pt-4">
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3 text-stone-400">
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

export default function SuperAdminPage() {
  return <SuperAdminLoginContent />
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Shield, Loader2, Plus, Pencil, Trash2, ArrowLeft,
  Check, X, TrendingUp, TrendingDown, GripVertical,
  Eye, EyeOff, RefreshCw, Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface PriceTicker {
  id: string
  code: string
  name: string
  exchange: string
  unit: string
  currency: string
  basePrice: number
  volatility: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface SimulatedPrice {
  code: string
  price: number
  change: number
  changePercent: number
  isUp: boolean
  dayHigh: number
  dayLow: number
}

const DEFAULT_FORM = {
  code: '',
  name: '',
  exchange: '',
  unit: 'USD/mt',
  currency: 'USD',
  basePrice: 0,
  volatility: 10,
  isActive: true,
  sortOrder: 0,
}

// Seeded pseudo-random for preview simulation
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function simulatePrice(basePrice: number, volatility: number, code: string): SimulatedPrice {
  const now = new Date()
  const minuteSeed = Math.floor(now.getTime() / 60000)
  const changeSeed = seededRandom(minuteSeed + code.charCodeAt(0) * 137)
  const changePercent = (changeSeed - 0.5) * volatility / basePrice * 2
  const currentPrice = +(basePrice * (1 + changePercent)).toFixed(2)
  const change = +(basePrice * changePercent).toFixed(2)
  const changePercentStr = +(changePercent * 100).toFixed(2)
  const isUp = change >= 0

  const highSeed = seededRandom(minuteSeed + (code.charCodeAt(1) || 0) * 251 + 1)
  const lowSeed = seededRandom(minuteSeed + (code.charCodeAt(2) || 0) * 379 + 2)
  const dayHigh = +(currentPrice * (1 + Math.abs(highSeed) * volatility / basePrice * 0.5)).toFixed(2)
  const dayLow = +(currentPrice * (1 - Math.abs(lowSeed) * volatility / basePrice * 0.5)).toFixed(2)

  return { code, price: currentPrice, change, changePercent: changePercentStr, isUp, dayHigh, dayLow }
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export default function PriceTickersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2, lang, setLang } = useI18n()
  const [tickers, setTickers] = useState<PriceTicker[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTicker, setEditingTicker] = useState<PriceTicker | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PriceTicker | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [previewPrices, setPreviewPrices] = useState<Record<string, SimulatedPrice>>({})

  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch(`/api/price-tickers?activeOnly=${!showInactive}`)
      const data = await res.json()
      if (data.success) setTickers(data.data || [])
    } catch (err) {
      console.error('Failed to fetch price tickers:', err)
    } finally {
      setLoading(false)
    }
  }, [showInactive])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/super-admin')
    } else if (status === 'authenticated') {
      if (!session?.user?.isPlatformAdmin) {
        router.push('/login')
      } else {
        fetchTickers()
      }
    }
  }, [status, router, session, fetchTickers])

  // Update preview prices every minute
  useEffect(() => {
    const updatePreviews = () => {
      const previews: Record<string, SimulatedPrice> = {}
      for (const t of tickers) {
        previews[t.id] = simulatePrice(t.basePrice, t.volatility, t.code)
      }
      // Also preview form if editing/creating
      if (form.code && form.basePrice > 0) {
        previews['form'] = simulatePrice(form.basePrice, form.volatility || 10, form.code)
      }
      setPreviewPrices(previews)
    }
    updatePreviews()
    const interval = setInterval(updatePreviews, 60000)
    return () => clearInterval(interval)
  }, [tickers, form.code, form.basePrice, form.volatility])

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setEditingTicker(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (ticker: PriceTicker) => {
    setForm({
      code: ticker.code,
      name: ticker.name,
      exchange: ticker.exchange,
      unit: ticker.unit,
      currency: ticker.currency,
      basePrice: ticker.basePrice,
      volatility: ticker.volatility,
      isActive: ticker.isActive,
      sortOrder: ticker.sortOrder,
    })
    setEditingTicker(ticker)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingTicker) {
        const res = await fetch(`/api/price-tickers/${editingTicker.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t2('Đã cập nhật ticker', 'Ticker updated'))
          setDialogOpen(false)
          resetForm()
          fetchTickers()
        } else {
          toast.error(data.error || 'Error')
        }
      } else {
        const res = await fetch('/api/price-tickers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t2('Đã tạo ticker', 'Ticker created'))
          setDialogOpen(false)
          resetForm()
          fetchTickers()
        } else {
          toast.error(data.error || 'Error')
        }
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (ticker: PriceTicker) => {
    try {
      const res = await fetch(`/api/price-tickers/${ticker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ticker.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(
          ticker.isActive
            ? t2('Đã vô hiệu hóa ticker', 'Ticker deactivated')
            : t2('Đã kích hoạt ticker', 'Ticker activated')
        )
        fetchTickers()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/price-tickers/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t2('Đã xóa ticker', 'Ticker deleted'))
        setDeleteTarget(null)
        fetchTickers()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    }
  }

  // ─── Loading ──────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
            <Shield className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <p className="text-stone-400">{t2('Không có quyền', 'Unauthorized')}</p>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-stone-800/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/super-admin/dashboard')}
              className="text-stone-400 hover:text-stone-200 gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              {t2('Quay lại', 'Back')}
            </Button>
            <Separator orientation="vertical" className="h-6 bg-stone-700" />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-500 to-stone-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-100">{t2('Quản lý Giá Ticker', 'Price Tickers Management')}</h1>
              <p className="text-[10px] text-stone-500">{t2('Quản trị nền tảng', 'Platform Administration')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1 text-stone-400 hover:text-stone-200 text-xs">
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/super-admin' })} className="text-stone-500 hover:text-red-400 text-xs">
              <Shield className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-stone-500" />
              {t2('Giá Ticker', 'Price Tickers')}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {t2('Quản lý dữ liệu giá hàng hóa cho trang chủ', 'Manage commodity price data for the landing page')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={showInactive} onCheckedChange={setShowInactive} />
              <Label className="text-xs text-stone-400">{t2('Hiện ẩn', 'Show Inactive')}</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-stone-700 text-stone-300 hover:bg-stone-800"
              onClick={() => { fetchTickers(); toast.success(t2('Đã làm mới', 'Refreshed')) }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t2('Làm mới', 'Refresh')}
            </Button>
            <Button
              className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl hover:from-stone-500 hover:to-stone-700"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4" />
              {t2('Thêm Ticker', 'Add Ticker')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
            <CardContent className="p-4">
              <p className="text-[10px] text-stone-500 mb-1">{t2('Tổng ticker', 'Total Tickers')}</p>
              <p className="text-xl font-bold text-stone-100">{tickers.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
            <CardContent className="p-4">
              <p className="text-[10px] text-stone-500 mb-1">{t2('Đang hoạt động', 'Active')}</p>
              <p className="text-xl font-bold text-emerald-400">{tickers.filter(t => t.isActive).length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
            <CardContent className="p-4">
              <p className="text-[10px] text-stone-500 mb-1">{t2('Đã ẩn', 'Inactive')}</p>
              <p className="text-xl font-bold text-stone-400">{tickers.filter(t => !t.isActive).length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
            <CardContent className="p-4">
              <p className="text-[10px] text-stone-500 mb-1">{t2('Sàn giao dịch', 'Exchanges')}</p>
              <p className="text-xl font-bold text-stone-100">{new Set(tickers.map(t => t.exchange)).size}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickers Table */}
        {tickers.length === 0 ? (
          <Card className="rounded-2xl border border-stone-800 bg-stone-900/50">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <h3 className="text-stone-300 font-medium mb-1">{t2('Chưa có ticker nào', 'No tickers yet')}</h3>
              <p className="text-xs text-stone-600 mb-4">
                {t2('Thêm ticker giá hàng hóa để hiển thị trên trang chủ', 'Add commodity price tickers to display on the landing page')}
              </p>
              <Button
                className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl"
                onClick={openCreate}
              >
                <Plus className="w-4 h-4" />
                {t2('Thêm Ticker đầu tiên', 'Add First Ticker')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickers.map((ticker) => {
              const preview = previewPrices[ticker.id]
              return (
                <Card key={ticker.id} className={`rounded-2xl border ${ticker.isActive ? 'border-stone-800' : 'border-stone-800/50 opacity-70'} bg-stone-900/50 backdrop-blur transition-all hover:border-stone-700`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-stone-700 cursor-grab" />
                          <div className={`w-9 h-9 rounded-xl ${ticker.isActive ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-stone-600 to-stone-800'} flex items-center justify-center shrink-0`}>
                            <span className="text-[10px] font-bold text-white">{ticker.code.slice(0, 2)}</span>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-stone-100 font-mono">{ticker.code}</p>
                            <Badge className={`text-[9px] border-0 ${ticker.isActive ? 'bg-emerald-900/30 text-emerald-400' : 'bg-stone-800 text-stone-500'}`}>
                              {ticker.isActive ? t2('HĐ', 'ON') : t2('Tắt', 'OFF')}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-400 truncate">{ticker.name}</p>
                          <p className="text-[10px] text-stone-600">{ticker.exchange} · {ticker.unit}</p>
                        </div>
                      </div>

                      {/* Center: Live Preview */}
                      {preview && ticker.isActive && (
                        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-stone-800/40">
                          <div>
                            <p className="text-[9px] text-stone-500 uppercase">{t2('Giá hiện tại', 'Current')}</p>
                            <p className={`text-lg font-bold ${preview.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                              {preview.price.toLocaleString()}
                              <span className="text-[10px] text-stone-500 ml-1">{ticker.currency}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-500 uppercase">{t2('Thay đổi', 'Change')}</p>
                            <div className={`flex items-center gap-1 text-xs font-medium ${preview.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                              {preview.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {preview.isUp ? '+' : ''}{preview.changePercent}%
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-[9px] text-stone-500 uppercase">{t2('Cao/Thấp', 'H/L')}</p>
                            <p className="text-[10px] text-stone-400">
                              {preview.dayHigh.toLocaleString()} / {preview.dayLow.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs text-stone-400 hover:text-stone-200"
                          onClick={() => toggleActive(ticker)}
                        >
                          {ticker.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {ticker.isActive ? t2('Ẩn', 'Hide') : t2('Hiện', 'Show')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs text-stone-400 hover:text-stone-200"
                          onClick={() => openEdit(ticker)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {t2('Sửa', 'Edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs text-stone-400 hover:text-red-400"
                          onClick={() => setDeleteTarget(ticker)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* ─── Create/Edit Dialog ──────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader>
            <DialogTitle className="text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-stone-500" />
              {editingTicker
                ? t2('Chỉnh sửa Ticker', 'Edit Ticker')
                : t2('Thêm Ticker mới', 'Add New Ticker')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="KC"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500 font-mono"
                  required
                  disabled={!!editingTicker}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t2('Tên', 'Name')} *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ICE Coffee C (Arabica)"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-stone-400">{t2('Sàn giao dịch', 'Exchange')} *</Label>
                <Input
                  value={form.exchange}
                  onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                  placeholder="ICE Futures US"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t2('Đơn vị', 'Unit')}</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="USD/mt"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t2('Tiền tệ', 'Currency')}</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  placeholder="USD"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t2('Giá cơ bản', 'Base Price')} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.basePrice || ''}
                  onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
                  placeholder="192.45"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t2('Biến động', 'Volatility')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.volatility || ''}
                  onChange={(e) => setForm({ ...form, volatility: parseFloat(e.target.value) || 0 })}
                  placeholder="10"
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t2('Thứ tự', 'Sort Order')}</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label className="text-xs text-stone-400">{t2('Hoạt động', 'Active')}</Label>
              </div>
            </div>

            {/* Live Preview in Dialog */}
            {form.code && form.basePrice > 0 && previewPrices['form'] && (
              <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                <p className="text-[10px] text-stone-500 uppercase mb-2">{t2('Xem trước trực tiếp', 'Live Preview')}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold text-stone-100">
                      {previewPrices['form'].price.toLocaleString()}
                      <span className="text-[10px] text-stone-500 ml-1">{form.currency}</span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${previewPrices['form'].isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {previewPrices['form'].isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {previewPrices['form'].isUp ? '+' : ''}{previewPrices['form'].changePercent}%
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setDialogOpen(false); resetForm() }}
                className="text-stone-400"
              >
                {t2('Hủy', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingTicker ? t2('Cập nhật', 'Update') : t2('Tạo', 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-100">{t2('Xác nhận xóa', 'Confirm Delete')}</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-400">
              {t2(
                `Bạn có chắc muốn xóa ticker "${deleteTarget?.code}"? Hành động này không thể hoàn tác.`,
                `Are you sure you want to delete ticker "${deleteTarget?.code}"? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-stone-800 border-stone-700 text-stone-300">{t2('Hủy', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-700 text-white hover:bg-red-600">
              {t2('Xóa', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

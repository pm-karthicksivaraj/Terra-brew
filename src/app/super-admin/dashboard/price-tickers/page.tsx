'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Plus, Pencil, Trash2, Loader2,
  ArrowLeft, DollarSign, BarChart3, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

const COFFEE_BROWN = '#6D2932'

interface PriceTicker {
  id: string
  commodity: string
  price: number
  currency: string
  change: number
  changePercent: number
  unit: string
  source: string | null
  high52w: number | null
  low52w: number | null
  lastUpdated: string
  isActive: boolean
  createdAt: string
}

const EMPTY_FORM = {
  commodity: '',
  price: '',
  currency: 'USD',
  change: '0',
  changePercent: '0',
  unit: 'per lb',
  source: '',
  high52w: '',
  low52w: '',
  isActive: true,
}

export default function PriceTickersPage() {
  const router = useRouter()
  const [tickers, setTickers] = useState<PriceTicker[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchTickers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/price-tickers')
      const data = await res.json()
      if (data.success) {
        setTickers(data.data?.tickers || [])
      }
    } catch {
      toast.error('Failed to load price tickers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickers()
  }, [fetchTickers])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (ticker: PriceTicker) => {
    setEditingId(ticker.id)
    setForm({
      commodity: ticker.commodity,
      price: String(ticker.price),
      currency: ticker.currency,
      change: String(ticker.change),
      changePercent: String(ticker.changePercent),
      unit: ticker.unit,
      source: ticker.source || '',
      high52w: ticker.high52w !== null ? String(ticker.high52w) : '',
      low52w: ticker.low52w !== null ? String(ticker.low52w) : '',
      isActive: ticker.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.commodity || !form.price) {
      toast.error('Commodity and price are required')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        commodity: form.commodity,
        price: parseFloat(form.price),
        currency: form.currency,
        change: parseFloat(form.change) || 0,
        changePercent: parseFloat(form.changePercent) || 0,
        unit: form.unit,
        source: form.source || null,
        high52w: form.high52w ? parseFloat(form.high52w) : null,
        low52w: form.low52w ? parseFloat(form.low52w) : null,
        isActive: form.isActive,
      }

      let res
      if (editingId) {
        res = await fetch(`/api/price-tickers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/price-tickers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Ticker updated' : 'Ticker created')
        setDialogOpen(false)
        fetchTickers()
      } else {
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save ticker')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this price ticker?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/price-tickers/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Ticker deleted')
        fetchTickers()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Failed to delete ticker')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (ticker: PriceTicker) => {
    try {
      const res = await fetch(`/api/price-tickers/${ticker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ticker.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(ticker.isActive ? 'Ticker deactivated' : 'Ticker activated')
        fetchTickers()
      }
    } catch {
      toast.error('Failed to update ticker')
    }
  }

  // Summary stats
  const activeCount = tickers.filter(t => t.isActive).length
  const avgPrice = tickers.length ? tickers.reduce((s, t) => s + t.price, 0) / tickers.length : 0

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-sm border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-1.5" onClick={() => router.push('/super-admin/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6 bg-stone-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COFFEE_BROWN }}>
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-bold">Price Tickers</h1>
            </div>
          </div>
          <Button size="sm" className="gap-1.5 text-white" style={{ backgroundColor: COFFEE_BROWN }} onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Ticker
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Total Tickers</p>
                  <p className="text-2xl font-bold">{tickers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Active</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COFFEE_BROWN}33` }}>
                  <DollarSign className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Avg Price</p>
                  <p className="text-2xl font-bold">${avgPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="pb-3 border-b border-stone-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: COFFEE_BROWN }} />
                Live Price Tickers
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-1" onClick={fetchTickers}>
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
              </div>
            ) : tickers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <DollarSign className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No price tickers yet</p>
                <Button size="sm" className="mt-3 text-white gap-1.5" style={{ backgroundColor: COFFEE_BROWN }} onClick={openCreate}>
                  <Plus className="w-4 h-4" /> Add First Ticker
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-800 hover:bg-transparent">
                    <TableHead className="text-stone-400 text-xs uppercase">Commodity</TableHead>
                    <TableHead className="text-stone-400 text-xs uppercase">Price</TableHead>
                    <TableHead className="text-stone-400 text-xs uppercase">Change</TableHead>
                    <TableHead className="text-stone-400 text-xs uppercase">Source</TableHead>
                    <TableHead className="text-stone-400 text-xs uppercase">52W Range</TableHead>
                    <TableHead className="text-stone-400 text-xs uppercase">Status</TableHead>
                    <TableHead className="text-stone-400 text-xs uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickers.map((t) => (
                    <TableRow key={t.id} className="border-stone-800 hover:bg-stone-800/50">
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold">{t.commodity}</p>
                          <p className="text-xs text-stone-400">{t.unit} · {t.currency}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold font-mono">{t.currency === 'USD' ? '$' : t.currency} {t.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {t.change >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className={`text-sm font-mono font-medium ${t.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)} ({t.changePercent >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-stone-400">{t.source || '—'}</TableCell>
                      <TableCell className="text-xs text-stone-400 font-mono">
                        {t.low52w !== null && t.high52w !== null ? `${t.low52w.toFixed(2)} – ${t.high52w.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={t.isActive} onCheckedChange={() => handleToggleActive(t)} className="data-[state=checked]:bg-emerald-500" />
                          <Badge className={`${t.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-700 text-stone-400'} text-[10px] border-0`}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-stone-400 hover:text-white" onClick={() => openEdit(t)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(t.id)} disabled={deleting === t.id}>
                            {deleting === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: COFFEE_BROWN }} />
              {editingId ? 'Edit Price Ticker' : 'Add Price Ticker'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Commodity *</Label>
                <Input
                  placeholder="e.g. Robusta, Arabica"
                  value={form.commodity}
                  onChange={e => setForm(f => ({ ...f, commodity: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Currency</Label>
                <Input
                  placeholder="USD"
                  value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Change</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.change}
                  onChange={e => setForm(f => ({ ...f, change: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Change %</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.changePercent}
                  onChange={e => setForm(f => ({ ...f, changePercent: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Unit</Label>
                <Input
                  placeholder="per lb"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">Source / Exchange</Label>
                <Input
                  placeholder="e.g. ICE Futures"
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">52-Week High</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={form.high52w}
                  onChange={e => setForm(f => ({ ...f, high52w: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-sm">52-Week Low</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={form.low52w}
                  onChange={e => setForm(f => ({ ...f, low52w: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} className="data-[state=checked]:bg-emerald-500" />
              <Label className="text-stone-300 text-sm">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-stone-400">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="text-white gap-1.5" style={{ backgroundColor: COFFEE_BROWN }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

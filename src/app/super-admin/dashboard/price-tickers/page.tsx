'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Plus, Pencil, Trash2, Loader2,
  ArrowLeft, DollarSign, BarChart3, RefreshCw, Search,
  Eye, EyeOff, ChevronDown, ChevronUp, ExternalLink,
  Filter, X,
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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

type SortField = 'commodity' | 'price' | 'change' | 'changePercent' | 'lastUpdated' | 'isActive'
type SortDir = 'asc' | 'desc'

export default function PriceTickersPage() {
  const router = useRouter()
  const [tickers, setTickers] = useState<PriceTicker[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PriceTicker | null>(null)

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  // Sorting
  const [sortField, setSortField] = useState<SortField>('commodity')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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

  // Derived data
  const currencies = useMemo(() => {
    const set = new Set(tickers.map(t => t.currency))
    return Array.from(set).sort()
  }, [tickers])

  const filteredTickers = useMemo(() => {
    let result = [...tickers]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.commodity.toLowerCase().includes(q) ||
        (t.source && t.source.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (statusFilter === 'active') result = result.filter(t => t.isActive)
    if (statusFilter === 'inactive') result = result.filter(t => !t.isActive)

    // Currency filter
    if (currencyFilter !== 'all') result = result.filter(t => t.currency === currencyFilter)

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'commodity': cmp = a.commodity.localeCompare(b.commodity); break
        case 'price': cmp = a.price - b.price; break
        case 'change': cmp = a.change - b.change; break
        case 'changePercent': cmp = a.changePercent - b.changePercent; break
        case 'lastUpdated': cmp = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(); break
        case 'isActive': cmp = Number(b.isActive) - Number(a.isActive); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [tickers, searchQuery, statusFilter, currencyFilter, sortField, sortDir])

  const activeCount = tickers.filter(t => t.isActive).length
  const avgPrice = tickers.length ? tickers.reduce((s, t) => s + t.price, 0) / tickers.length : 0
  const gainersCount = tickers.filter(t => t.change > 0).length
  const losersCount = tickers.filter(t => t.change < 0).length

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
      const payload: Record<string, unknown> = {
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/price-tickers/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Ticker deleted')
        setDeleteTarget(null)
        fetchTickers()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Failed to delete ticker')
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-0.5" />
      : <ChevronDown className="w-3 h-3 ml-0.5" />
  }

  const formatCurrency = (price: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', VND: '₫', BRL: 'R$', JPY: '¥',
    }
    const sym = symbols[currency] || currency + ' '
    return `${sym}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCurrencyFilter('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || currencyFilter !== 'all'

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100" style={{ fontSize: '17px' }}>
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
              <div>
                <h1 className="text-base font-bold leading-tight">Price Tickers</h1>
                <p className="text-[11px] text-stone-500">Manage commodity price data for tenant dashboards</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-1" onClick={fetchTickers}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button size="sm" className="gap-1.5 text-white" style={{ backgroundColor: COFFEE_BROWN }} onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add Ticker
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-700/50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-stone-300" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold">{tickers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">Active</p>
                  <p className="text-lg font-bold text-emerald-400">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COFFEE_BROWN}33` }}>
                  <DollarSign className="w-4 h-4" style={{ color: COFFEE_BROWN }} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">Avg Price</p>
                  <p className="text-lg font-bold">${avgPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 text-emerald-400 rotate-45" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">Gainers</p>
                  <p className="text-lg font-bold text-emerald-400">{gainersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 text-red-400 -rotate-45" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">Losers</p>
                  <p className="text-lg font-bold text-red-400">{losersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="bg-stone-900 border-stone-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="relative flex-1 w-full md:max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <Input
                  placeholder="Search by commodity or source..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-stone-800 border-stone-700 text-sm h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-stone-500" />
                  <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-[120px] h-9 bg-stone-800 border-stone-700 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-[110px] h-9 bg-stone-800 border-stone-700 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="all">All Currencies</SelectItem>
                    {currencies.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="h-9 text-xs text-stone-400 hover:text-white gap-1" onClick={clearFilters}>
                    <X className="w-3 h-3" /> Clear
                  </Button>
                )}
              </div>
              <div className="ml-auto text-xs text-stone-500">
                {filteredTickers.length} of {tickers.length} tickers
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="pb-3 border-b border-stone-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: COFFEE_BROWN }} />
                Live Price Tickers
              </CardTitle>
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
                <p className="text-xs text-stone-600 mt-1">Add your first commodity price ticker to get started</p>
                <Button size="sm" className="mt-3 text-white gap-1.5" style={{ backgroundColor: COFFEE_BROWN }} onClick={openCreate}>
                  <Plus className="w-4 h-4" /> Add First Ticker
                </Button>
              </div>
            ) : filteredTickers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <Search className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No tickers match your filters</p>
                <Button variant="ghost" size="sm" className="mt-3 text-stone-400 gap-1.5" onClick={clearFilters}>
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-800 hover:bg-transparent">
                      <TableHead
                        className="text-stone-400 text-[11px] uppercase cursor-pointer hover:text-stone-200 select-none"
                        onClick={() => handleSort('commodity')}
                      >
                        <span className="flex items-center">Commodity <SortIcon field="commodity" /></span>
                      </TableHead>
                      <TableHead
                        className="text-stone-400 text-[11px] uppercase cursor-pointer hover:text-stone-200 select-none"
                        onClick={() => handleSort('price')}
                      >
                        <span className="flex items-center">Price <SortIcon field="price" /></span>
                      </TableHead>
                      <TableHead className="text-stone-400 text-[11px] uppercase">Currency</TableHead>
                      <TableHead
                        className="text-stone-400 text-[11px] uppercase cursor-pointer hover:text-stone-200 select-none"
                        onClick={() => handleSort('change')}
                      >
                        <span className="flex items-center">Change <SortIcon field="change" /></span>
                      </TableHead>
                      <TableHead
                        className="text-stone-400 text-[11px] uppercase cursor-pointer hover:text-stone-200 select-none"
                        onClick={() => handleSort('changePercent')}
                      >
                        <span className="flex items-center">Change % <SortIcon field="changePercent" /></span>
                      </TableHead>
                      <TableHead className="text-stone-400 text-[11px] uppercase">Unit</TableHead>
                      <TableHead className="text-stone-400 text-[11px] uppercase">Source</TableHead>
                      <TableHead className="text-stone-400 text-[11px] uppercase hidden xl:table-cell">52W High</TableHead>
                      <TableHead className="text-stone-400 text-[11px] uppercase hidden xl:table-cell">52W Low</TableHead>
                      <TableHead
                        className="text-stone-400 text-[11px] uppercase cursor-pointer hover:text-stone-200 select-none"
                        onClick={() => handleSort('isActive')}
                      >
                        <span className="flex items-center">Active <SortIcon field="isActive" /></span>
                      </TableHead>
                      <TableHead
                        className="text-stone-400 text-[11px] uppercase cursor-pointer hover:text-stone-200 select-none hidden lg:table-cell"
                        onClick={() => handleSort('lastUpdated')}
                      >
                        <span className="flex items-center">Last Updated <SortIcon field="lastUpdated" /></span>
                      </TableHead>
                      <TableHead className="text-stone-400 text-[11px] uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickers.map((t) => (
                      <TableRow
                        key={t.id}
                        className={`border-stone-800 hover:bg-stone-800/50 transition-colors ${!t.isActive ? 'opacity-50' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.isActive ? 'bg-stone-800' : 'bg-stone-800/50'}`}>
                              {t.change >= 0
                                ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                                : <TrendingDown className="w-4 h-4 text-red-400" />
                              }
                            </div>
                            <span className="text-sm font-semibold whitespace-nowrap">{t.commodity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold font-mono">{formatCurrency(t.price, t.currency)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-400">{t.currency}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-mono font-medium ${t.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium ${t.changePercent >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {t.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(t.changePercent).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-stone-400 whitespace-nowrap">{t.unit}</TableCell>
                        <TableCell className="text-xs text-stone-400">{t.source || '—'}</TableCell>
                        <TableCell className="text-xs text-stone-400 font-mono hidden xl:table-cell">
                          {t.high52w !== null ? formatCurrency(t.high52w, t.currency) : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-stone-400 font-mono hidden xl:table-cell">
                          {t.low52w !== null ? formatCurrency(t.low52w, t.currency) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={t.isActive}
                              onCheckedChange={() => handleToggleActive(t)}
                              className="data-[state=checked]:bg-emerald-500 scale-75"
                            />
                            <Badge className={`${t.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-700/50 text-stone-500'} text-[10px] border-0`}>
                              {t.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-stone-500 hidden lg:table-cell whitespace-nowrap">
                          {formatDate(t.lastUpdated)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-stone-400 hover:text-white"
                              onClick={() => openEdit(t)}
                              title="Edit ticker"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400/70 hover:text-red-400"
                              onClick={() => setDeleteTarget(t)}
                              title="Delete ticker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: COFFEE_BROWN }}>
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              {editingId ? 'Edit Price Ticker' : 'Add Price Ticker'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Commodity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Commodity *</Label>
                <Input
                  placeholder="e.g. Robusta, Arabica"
                  value={form.commodity}
                  onChange={e => setForm(f => ({ ...f, commodity: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono h-9"
                />
              </div>
            </div>

            {/* Currency, Change, Change% */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                    <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                    <SelectItem value="VND">VND (&#8363;)</SelectItem>
                    <SelectItem value="BRL">BRL (R$)</SelectItem>
                    <SelectItem value="JPY">JPY (&yen;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Change</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.change}
                  onChange={e => setForm(f => ({ ...f, change: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Change %</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.changePercent}
                  onChange={e => setForm(f => ({ ...f, changePercent: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono h-9"
                />
              </div>
            </div>

            {/* Unit & Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="per lb">per lb</SelectItem>
                    <SelectItem value="per kg">per kg</SelectItem>
                    <SelectItem value="per bag">per bag</SelectItem>
                    <SelectItem value="per MT">per MT</SelectItem>
                    <SelectItem value="per bushel">per bushel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">Source / Exchange</Label>
                <Input
                  placeholder="e.g. ICE Futures"
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm h-9"
                />
              </div>
            </div>

            {/* 52W Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">52-Week High</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={form.high52w}
                  onChange={e => setForm(f => ({ ...f, high52w: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300 text-xs">52-Week Low</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={form.low52w}
                  onChange={e => setForm(f => ({ ...f, low52w: e.target.value }))}
                  className="bg-stone-800 border-stone-700 text-sm font-mono h-9"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-1 border-t border-stone-800">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} className="data-[state=checked]:bg-emerald-500" />
              <div>
                <Label className="text-stone-300 text-sm">Active</Label>
                <p className="text-[11px] text-stone-500">Active tickers are visible on tenant dashboards</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-stone-400">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="text-white gap-1.5" style={{ backgroundColor: COFFEE_BROWN }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-100 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Price Ticker
            </AlertDialogTitle>
            <AlertDialogDescription className="text-stone-400">
              Are you sure you want to delete <span className="text-stone-200 font-medium">&ldquo;{deleteTarget?.commodity}&rdquo;</span>?
              This action cannot be undone and the ticker will be permanently removed from all tenant dashboards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-stone-800 border-stone-700 text-stone-300 hover:text-stone-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-700 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, Plus, Search, CheckCircle2, AlertCircle, Loader2, Eye, DollarSign, ArrowUpDown } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  fulfilled: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const TYPE_COLORS: Record<string, string> = {
  spot: 'bg-amber-100 text-amber-800 border-amber-200',
  forward: 'bg-teal-100 text-teal-800 border-teal-200',
  term: 'bg-purple-100 text-purple-800 border-purple-200',
}

const CHART_COLORS = ['#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516']

interface TradingContract {
  id: string
  contractNumber?: string
  contractType: string
  commodity?: string
  quantityKg?: number
  pricePerKg?: number
  totalValue?: number
  currency?: string
  status: string
  counterpartyVerified?: boolean
  qualityLinkedPricing?: boolean
  grade?: string
  deliveryPort?: string
  buyer?: { companyName: string }
  createdAt: string
}

export default function TradingDeskPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<TradingContract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<TradingContract | null>(null)
  const [form, setForm] = useState<any>({ contractType: 'spot', commodity: 'coffee', currency: 'EUR' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter && typeFilter !== 'all') params.set('contractType', typeFilter)
      const res = await fetch(`/api/trading-desk?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: items.length,
    active: items.filter(c => c.status === 'active').length,
    totalValue: items.reduce((sum, c) => sum + (c.totalValue || 0), 0),
    verified: items.filter(c => c.counterpartyVerified).length,
    qlp: items.filter(c => c.qualityLinkedPricing).length,
  }

  const statusChartData = Object.entries(STATUS_COLORS).map(([key]) => ({
    name: key,
    value: items.filter(c => c.status === key).length,
  })).filter(d => d.value > 0)

  const typeChartData = Object.entries(TYPE_COLORS).map(([key]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: items.filter(c => c.contractType === key).length,
  })).filter(d => d.value > 0)

  async function handleCreate() {
    try {
      const res = await fetch('/api/trading-desk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ contractType: 'spot', commodity: 'coffee', currency: 'EUR' })
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" /> Trading Desk
              </h1>
              <p className="text-sm text-muted-foreground">Manage contracts, counterparty verification, and quality-linked pricing</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Contract</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Trading Contract</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contract Type</label>
                      <Select value={form.contractType} onValueChange={v => setForm({ ...form, contractType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spot">Spot</SelectItem>
                          <SelectItem value="forward">Forward</SelectItem>
                          <SelectItem value="term">Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Grade</label>
                      <Input placeholder="G2, Screen 16+" value={form.grade || ''} onChange={e => setForm({ ...form, grade: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity (kg)</label>
                      <Input type="number" placeholder="18000" value={form.quantityKg || ''} onChange={e => setForm({ ...form, quantityKg: parseFloat(e.target.value) || null })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price/kg</label>
                      <Input type="number" step="0.01" placeholder="4.50" value={form.pricePerKg || ''} onChange={e => setForm({ ...form, pricePerKg: parseFloat(e.target.value) || null })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency</label>
                      <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="VND">VND</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delivery Port</label>
                    <Input placeholder="Hamburg" value={form.deliveryPort || ''} onChange={e => setForm({ ...form, deliveryPort: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="qlp" checked={form.qualityLinkedPricing || false} onChange={e => setForm({ ...form, qualityLinkedPricing: e.target.checked })} />
                    <label htmlFor="qlp" className="text-sm">Quality-Linked Pricing</label>
                  </div>
                  <Button onClick={handleCreate} className="w-full">Create Contract</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Contracts', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Active', value: stats.active, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Total Value', value: `${(stats.totalValue / 1000).toFixed(0)}k`, bg: 'bg-amber-100', color: 'text-amber-600' },
            { label: 'Verified', value: stats.verified, bg: 'bg-blue-100', color: 'text-blue-600' },
            { label: 'Q-Linked', value: stats.qlp, bg: 'bg-teal-100', color: 'text-teal-600' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.keys(TYPE_COLORS).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Qty (kg)</TableHead>
                    <TableHead>Price/kg</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Q-Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                  ) : items.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No contracts found</p></TableCell></TableRow>
                  ) : items.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setDetailItem(item)}>
                      <TableCell className="font-medium font-mono text-xs">{item.contractNumber || item.id.slice(0, 8)}</TableCell>
                      <TableCell><Badge className={`${TYPE_COLORS[item.contractType] || 'bg-gray-100 text-gray-800'} border text-xs capitalize`}>{item.contractType}</Badge></TableCell>
                      <TableCell className="text-sm">{item.buyer?.companyName || '—'}</TableCell>
                      <TableCell>{item.quantityKg?.toLocaleString() || '—'}</TableCell>
                      <TableCell>{item.pricePerKg ? `${item.pricePerKg} ${item.currency}` : '—'}</TableCell>
                      <TableCell className="font-medium">{item.totalValue ? `${item.totalValue.toLocaleString()} ${item.currency}` : '—'}</TableCell>
                      <TableCell><Badge className={`${STATUS_COLORS[item.status] || ''} border text-xs capitalize`}>{item.status}</Badge></TableCell>
                      <TableCell>{item.counterpartyVerified ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}</TableCell>
                      <TableCell>{item.qualityLinkedPricing ? <Badge className="bg-teal-100 text-teal-800 border border-teal-200 text-xs">QLP</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Contract Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{detailItem.contractNumber || detailItem.id.slice(0, 8)}</span>
                  <Badge className={`${STATUS_COLORS[detailItem.status]} border capitalize`}>{detailItem.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Type:</span><p><Badge className={`${TYPE_COLORS[detailItem.contractType]} border capitalize text-xs`}>{detailItem.contractType}</Badge></p></div>
                  <div><span className="text-muted-foreground">Buyer:</span><p className="font-medium">{detailItem.buyer?.companyName || '—'}</p></div>
                  <div><span className="text-muted-foreground">Quantity:</span><p>{detailItem.quantityKg?.toLocaleString()} kg</p></div>
                  <div><span className="text-muted-foreground">Price/kg:</span><p>{detailItem.pricePerKg} {detailItem.currency}</p></div>
                  <div><span className="text-muted-foreground">Total Value:</span><p className="font-bold">{detailItem.totalValue?.toLocaleString()} {detailItem.currency}</p></div>
                  <div><span className="text-muted-foreground">Grade:</span><p>{detailItem.grade || '—'}</p></div>
                  <div><span className="text-muted-foreground">Counterparty Verified:</span><p>{detailItem.counterpartyVerified ? '✅ Yes' : '❌ No'}</p></div>
                  <div><span className="text-muted-foreground">Quality-Linked Pricing:</span><p>{detailItem.qualityLinkedPricing ? '✅ Yes' : '❌ No'}</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}

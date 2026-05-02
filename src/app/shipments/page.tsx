'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Ship, Plus, Search, Loader2, MapPin, Package, CalendarDays, ArrowRight } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800 border-gray-200',
  booked: 'bg-blue-100 text-blue-800 border-blue-200',
  in_transit: 'bg-orange-100 text-orange-800 border-orange-200',
  arrived: 'bg-teal-100 text-teal-800 border-teal-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_ICONS: Record<string, string> = {
  planned: '📋', booked: '📦', in_transit: '🚢', arrived: '📍', delivered: '✅', cancelled: '❌',
}

const TIMELINE_STEPS = ['planned', 'booked', 'in_transit', 'arrived', 'delivered']

interface Shipment {
  id: string
  shipmentId?: string
  status: string
  originCountry?: string
  destinationCountry?: string
  portOfLoading?: string
  portOfDischarge?: string
  totalWeightKg?: number
  totalBags?: number
  commodity?: string
  grade?: string
  estimatedDeparture?: string
  estimatedArrival?: string
  vesselName?: string
  containerNumber?: string
  createdAt: string
}

export default function ShipmentsPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Shipment | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [form, setForm] = useState<any>({ status: 'planned', commodity: 'coffee' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/shipments?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: items.length,
    inTransit: items.filter(s => s.status === 'in_transit').length,
    delivered: items.filter(s => s.status === 'delivered').length,
    planned: items.filter(s => s.status === 'planned' || s.status === 'booked').length,
  }

  function getTimelineProgress(status: string): number {
    const idx = TIMELINE_STEPS.indexOf(status)
    return idx >= 0 ? idx + 1 : 0
  }

  async function handleCreate() {
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ status: 'planned', commodity: 'coffee' })
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Ship className="w-6 h-6 text-primary" /> Shipment Tracking
              </h1>
              <p className="text-sm text-muted-foreground">Track and manage export shipments</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Shipment</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Shipment</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Origin Country</label>
                      <Input placeholder="VN" value={form.originCountry || ''} onChange={e => setForm({ ...form, originCountry: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destination</label>
                      <Input placeholder="DE" value={form.destinationCountry || ''} onChange={e => setForm({ ...form, destinationCountry: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Port of Loading</label>
                      <Input placeholder="HCM" value={form.portOfLoading || ''} onChange={e => setForm({ ...form, portOfLoading: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Port of Discharge</label>
                      <Input placeholder="HAM" value={form.portOfDischarge || ''} onChange={e => setForm({ ...form, portOfDischarge: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weight (kg)</label>
                      <Input type="number" placeholder="18000" value={form.totalWeightKg || ''} onChange={e => setForm({ ...form, totalWeightKg: parseFloat(e.target.value) || null })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Total Bags</label>
                      <Input type="number" placeholder="300" value={form.totalBags || ''} onChange={e => setForm({ ...form, totalBags: parseInt(e.target.value) || null })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Commodity</label>
                      <Select value={form.commodity} onValueChange={v => setForm({ ...form, commodity: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coffee">Coffee</SelectItem>
                          <SelectItem value="cocoa">Cocoa</SelectItem>
                          <SelectItem value="palm_oil">Palm Oil</SelectItem>
                          <SelectItem value="rubber">Rubber</SelectItem>
                          <SelectItem value="soy">Soy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Grade</label>
                      <Input placeholder="G2, Screen 16+" value={form.grade || ''} onChange={e => setForm({ ...form, grade: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full">Create Shipment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Shipments', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'In Transit', value: stats.inTransit, bg: 'bg-orange-100', color: 'text-orange-600' },
            { label: 'Delivered', value: stats.delivered, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Planned/Booked', value: stats.planned, bg: 'bg-gray-100', color: 'text-gray-600' },
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

        {/* Filters & View Toggle */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search shipments..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="text-xs">Table</Button>
              <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} className="text-xs">Cards</Button>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : viewMode === 'table' ? (
          <FadeIn delay={0.2}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead>ETD</TableHead>
                      <TableHead>ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Ship className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No shipments found</p></TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setDetailItem(item)}>
                        <TableCell className="font-medium">{item.shipmentId || item.id.slice(0, 8)}</TableCell>
                        <TableCell><Badge className={`${STATUS_COLORS[item.status] || ''} border`}>{STATUS_ICONS[item.status]} {item.status?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />{item.originCountry || '?'}
                            <ArrowRight className="w-3 h-3" />{item.destinationCountry || '?'}
                          </div>
                        </TableCell>
                        <TableCell>{item.totalWeightKg ? `${item.totalWeightKg.toLocaleString()} kg` : '—'}</TableCell>
                        <TableCell>{item.commodity || 'coffee'}</TableCell>
                        <TableCell className="text-xs">{item.estimatedDeparture ? new Date(item.estimatedDeparture).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-xs">{item.estimatedArrival ? new Date(item.estimatedArrival).toLocaleDateString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm cursor-pointer" onClick={() => setDetailItem(item)}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.shipmentId || item.id.slice(0, 8)}</span>
                      <Badge className={`${STATUS_COLORS[item.status] || ''} border text-xs`}>{STATUS_ICONS[item.status]} {item.status?.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{item.portOfLoading || item.originCountry || '?'}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{item.portOfDischarge || item.destinationCountry || '?'}</span>
                    </div>
                    {/* Timeline */}
                    <div className="flex items-center gap-1">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const progress = getTimelineProgress(item.status)
                        const isActive = idx < progress
                        return (
                          <div key={step} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-green-500' : 'bg-muted'}`} />
                            <span className="text-[9px] text-muted-foreground capitalize">{step.replace('_', ' ')}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.totalWeightKg ? `${item.totalWeightKg.toLocaleString()} kg` : '—'}</span>
                      <span>{item.commodity || 'coffee'}</span>
                    </div>
                  </CardContent>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Detail Dialog with Timeline */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Shipment Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{detailItem.shipmentId || detailItem.id.slice(0, 8)}</span>
                  <Badge className={`${STATUS_COLORS[detailItem.status]} border`}>{detailItem.status?.replace('_', ' ')}</Badge>
                </div>
                {/* Status Timeline */}
                <div className="flex items-center gap-2 py-3">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const progress = getTimelineProgress(detailItem.status)
                    const isActive = idx < progress
                    const isCurrent = step === detailItem.status
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : isActive ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {isActive ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] ${isCurrent ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{step.replace('_', ' ')}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Route:</span><p>{detailItem.originCountry || '?'} → {detailItem.destinationCountry || '?'}</p></div>
                  <div><span className="text-muted-foreground">Weight:</span><p>{detailItem.totalWeightKg ? `${detailItem.totalWeightKg.toLocaleString()} kg` : '—'}</p></div>
                  <div><span className="text-muted-foreground">Commodity:</span><p>{detailItem.commodity || 'coffee'}</p></div>
                  <div><span className="text-muted-foreground">Grade:</span><p>{detailItem.grade || '—'}</p></div>
                  <div><span className="text-muted-foreground">ETD:</span><p>{detailItem.estimatedDeparture ? new Date(detailItem.estimatedDeparture).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">ETA:</span><p>{detailItem.estimatedArrival ? new Date(detailItem.estimatedArrival).toLocaleDateString() : '—'}</p></div>
                  {detailItem.vesselName && <div><span className="text-muted-foreground">Vessel:</span><p>{detailItem.vesselName}</p></div>}
                  {detailItem.containerNumber && <div><span className="text-muted-foreground">Container:</span><p className="font-mono text-xs">{detailItem.containerNumber}</p></div>}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

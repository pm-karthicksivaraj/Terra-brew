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
import { Truck, Ship, Anchor, FileCheck, MapPin, Plus, Loader2, Package, Clock, ArrowRight, Globe, Container } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800 border-gray-200',
  booked: 'bg-blue-100 text-blue-800 border-blue-200',
  in_transit: 'bg-orange-100 text-orange-800 border-orange-200',
  arrived: 'bg-teal-100 text-teal-800 border-teal-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const TIMELINE_STEPS = ['planned', 'booked', 'in_transit', 'arrived', 'delivered']

interface LogisticsShipment {
  id: string
  shipmentId?: string
  status: string
  originCountry?: string
  destinationCountry?: string
  portOfLoading?: string
  portOfDischarge?: string
  vesselName?: string
  containerNumber?: string
  freightForwarder?: string
  customsBroker?: string
  estimatedDeparture?: string
  estimatedArrival?: string
  totalWeightKg?: number
  commodity?: string
  createdAt: string
  trackingUpdates?: { status: string; timestamp: string; location?: string; note?: string }[]
}

export default function LogisticsPage() {
  const { data: session } = useSession()
  const [shipments, setShipments] = useState<LogisticsShipment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<LogisticsShipment | null>(null)
  const [form, setForm] = useState<any>({ status: 'planned', commodity: 'coffee' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/shipments?${params}`)
      const data = await res.json()
      if (data.success) setShipments(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    planned: shipments.filter(s => s.status === 'planned').length,
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
    } catch (e) { console.error(e) }
  }

  // Generate mock tracking updates for timeline view
  function getTrackingUpdates(shipment: LogisticsShipment) {
    const progress = getTimelineProgress(shipment.status)
    const updates = TIMELINE_STEPS.slice(0, progress).map((step, idx) => ({
      status: step,
      timestamp: shipment.estimatedDeparture ? new Date(new Date(shipment.estimatedDeparture).getTime() + idx * 86400000 * 3).toISOString() : new Date(Date.now() - (progress - idx) * 86400000 * 3).toISOString(),
      location: idx === 0 ? shipment.portOfLoading || shipment.originCountry || 'Origin' : idx === progress - 1 ? shipment.portOfDischarge || shipment.destinationCountry || 'Destination' : 'In transit',
      note: `Status updated to ${step.replace('_', ' ')}`,
    }))
    return updates.reverse()
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Anchor className="w-6 h-6 text-primary" /> Logistics Integration Hub
              </h1>
              <p className="text-sm text-muted-foreground">Freight forwarding, customs, and shipment management</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New Logistics Entry</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Logistics Entry</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Origin</label><Input placeholder="VN" value={form.originCountry || ''} onChange={e => setForm({ ...form, originCountry: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Destination</label><Input placeholder="DE" value={form.destinationCountry || ''} onChange={e => setForm({ ...form, destinationCountry: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Port of Loading</label><Input placeholder="HCM" value={form.portOfLoading || ''} onChange={e => setForm({ ...form, portOfLoading: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Port of Discharge</label><Input placeholder="HAM" value={form.portOfDischarge || ''} onChange={e => setForm({ ...form, portOfDischarge: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Vessel Name</label><Input placeholder="MSC Fantasia" value={form.vesselName || ''} onChange={e => setForm({ ...form, vesselName: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Container #</label><Input placeholder="MSCU1234567" value={form.containerNumber || ''} onChange={e => setForm({ ...form, containerNumber: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Freight Forwarder</label><Input placeholder="Kuehne+Nagel" value={form.freightForwarder || ''} onChange={e => setForm({ ...form, freightForwarder: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Customs Broker</label><Input placeholder="Broker name" value={form.customsBroker || ''} onChange={e => setForm({ ...form, customsBroker: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Weight (kg)</label><Input type="number" placeholder="18000" value={form.totalWeightKg || ''} onChange={e => setForm({ ...form, totalWeightKg: parseFloat(e.target.value) || null })} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Commodity</label>
                      <Select value={form.commodity || 'coffee'} onValueChange={v => setForm({ ...form, commodity: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coffee">Coffee</SelectItem>
                          <SelectItem value="cocoa">Cocoa</SelectItem>
                          <SelectItem value="palm_oil">Palm Oil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full">Create Logistics Entry</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Shipments', value: stats.total, icon: Ship, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'In Transit', value: stats.inTransit, icon: Truck, bg: 'bg-orange-100', color: 'text-orange-600' },
            { label: 'Delivered', value: stats.delivered, icon: FileCheck, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Planned', value: stats.planned, icon: Anchor, bg: 'bg-gray-100', color: 'text-gray-600' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-5 h-5 ${card.color}`} /></div>
                    <div><p className="text-2xl font-bold">{card.value}</p><p className="text-xs text-muted-foreground">{card.label}</p></div>
                  </div>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Filter */}
        <FadeIn delay={0.1}>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {/* Shipment Cards with Logistics Details */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : shipments.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Anchor className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No shipments found</p>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 gap-4">
            {shipments.map((s) => {
              const trackingUpdates = getTrackingUpdates(s)
              return (
                <StaggerItem key={s.id}>
                  <MotionCard {...hoverScale} className="rounded-xl border shadow-sm cursor-pointer" onClick={() => setDetailItem(s)}>
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{s.shipmentId || s.id.slice(0, 8)}</span>
                        </div>
                        <Badge className={`${STATUS_COLORS[s.status] || ''} border text-xs capitalize`}>{s.status?.replace('_', ' ')}</Badge>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>{s.portOfLoading || s.originCountry || '?'}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span>{s.portOfDischarge || s.destinationCountry || '?'}</span>
                      </div>

                      {/* Logistics Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {s.vesselName && <div className="flex items-center gap-1"><Ship className="w-3 h-3 text-muted-foreground" />{s.vesselName}</div>}
                        {s.containerNumber && <div className="flex items-center gap-1"><Package className="w-3 h-3 text-muted-foreground" /><span className="font-mono">{s.containerNumber}</span></div>}
                        {s.freightForwarder && <div className="flex items-center gap-1"><Truck className="w-3 h-3 text-muted-foreground" />{s.freightForwarder}</div>}
                        {s.customsBroker && <div className="flex items-center gap-1"><FileCheck className="w-3 h-3 text-muted-foreground" />{s.customsBroker}</div>}
                      </div>

                      {/* Timeline Progress Bar */}
                      <div className="flex items-center gap-1">
                        {TIMELINE_STEPS.map((step, idx) => {
                          const progress = getTimelineProgress(s.status)
                          const isActive = idx < progress
                          return <div key={step} className={`h-1.5 flex-1 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted'}`} />
                        })}
                      </div>

                      {/* Latest Tracking Update */}
                      {trackingUpdates.length > 0 && (
                        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                          <Clock className="w-3 h-3 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">{trackingUpdates[0].note}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(trackingUpdates[0].timestamp).toLocaleString()} · {trackingUpdates[0].location}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </MotionCard>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}

        {/* Detail Dialog with Timeline */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Logistics Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{detailItem.shipmentId || detailItem.id.slice(0, 8)}</span>
                  <Badge className={`${STATUS_COLORS[detailItem.status]} border capitalize`}>{detailItem.status?.replace('_', ' ')}</Badge>
                </div>

                {/* Tracking Timeline */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Tracking Timeline</h4>
                  {getTrackingUpdates(detailItem).map((update, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary ring-2 ring-primary/30' : 'bg-green-500'}`} />
                        {idx < getTrackingUpdates(detailItem).length - 1 && <div className="w-0.5 h-8 bg-green-200" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium capitalize">{update.status.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{update.location}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                  <div><span className="text-muted-foreground">Route:</span><p>{detailItem.originCountry || '?'} → {detailItem.destinationCountry || '?'}</p></div>
                  <div><span className="text-muted-foreground">Weight:</span><p>{detailItem.totalWeightKg ? `${detailItem.totalWeightKg.toLocaleString()} kg` : '—'}</p></div>
                  <div><span className="text-muted-foreground">Vessel:</span><p>{detailItem.vesselName || '—'}</p></div>
                  <div><span className="text-muted-foreground">Container:</span><p className="font-mono text-xs">{detailItem.containerNumber || '—'}</p></div>
                  <div><span className="text-muted-foreground">Forwarder:</span><p>{detailItem.freightForwarder || '—'}</p></div>
                  <div><span className="text-muted-foreground">Customs Broker:</span><p>{detailItem.customsBroker || '—'}</p></div>
                  <div><span className="text-muted-foreground">ETD:</span><p>{detailItem.estimatedDeparture ? new Date(detailItem.estimatedDeparture).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">ETA:</span><p>{detailItem.estimatedArrival ? new Date(detailItem.estimatedArrival).toLocaleDateString() : '—'}</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

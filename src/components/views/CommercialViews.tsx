'use client'

import { useEffect, useState } from 'react'
import { useAppStore, type ViewName } from '@/lib/store'
import * as api from '@/lib/spa-api'
import { AnimatedPage, FadeIn, ScaleIn } from '@/components/ui/animations'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Pencil, Trash2, Loader2, Ship, Handshake, FileText,
  Store, CreditCard, QrCode, Printer, BarChart3, ChevronLeft,
} from 'lucide-react'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700', Inactive: 'bg-gray-100 text-gray-700',
    Compliant: 'bg-emerald-100 text-emerald-700', 'Non-compliant': 'bg-red-100 text-red-700',
    Pending: 'bg-amber-100 text-amber-700', Open: 'bg-blue-100 text-blue-700',
    Paid: 'bg-emerald-100 text-emerald-700', Closed: 'bg-gray-100 text-gray-700',
    planned: 'bg-gray-100 text-gray-700', booked: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-amber-100 text-amber-700', arrived: 'bg-teal-100 text-teal-700',
    delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700', approved: 'bg-emerald-100 text-emerald-700',
  }
  return <Badge className={colors[status] || 'bg-gray-100 text-gray-700'}>{status || 'N/A'}</Badge>
}

// ═══════════════════════════════════════════════════════
// SHIPMENTS VIEW
// ═══════════════════════════════════════════════════════

export function ShipmentsView() {
  const { setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({
    shipmentId: '', status: 'planned', originCountry: '', destinationCountry: '',
    portOfLoading: '', portOfDischarge: '', vesselName: '', containerNumber: '',
    totalWeightKg: '', totalBags: '', grade: '', bookingNumber: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getShipments().then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createShipment(form)
      setShowForm(false)
      api.getShipments().then(data => setItems(data.items || data))
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  return (
    <AnimatedPage viewKey="shipments">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Shipments ({items.length})</h2>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> New Shipment</Button>
        </div></FadeIn>

        {showForm && (
          <FadeIn><Card><CardContent className="p-4">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Shipment ID</Label><Input value={form.shipmentId} onChange={e => setForm({...form, shipmentId: e.target.value})} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="booked">Booked</SelectItem><SelectItem value="in_transit">In Transit</SelectItem><SelectItem value="arrived">Arrived</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Origin Country</Label><Input value={form.originCountry} onChange={e => setForm({...form, originCountry: e.target.value})} /></div>
              <div className="space-y-1"><Label>Destination</Label><Input value={form.destinationCountry} onChange={e => setForm({...form, destinationCountry: e.target.value})} /></div>
              <div className="space-y-1"><Label>Port of Loading</Label><Input value={form.portOfLoading} onChange={e => setForm({...form, portOfLoading: e.target.value})} /></div>
              <div className="space-y-1"><Label>Total Weight (kg)</Label><Input type="number" value={form.totalWeightKg} onChange={e => setForm({...form, totalWeightKg: e.target.value})} /></div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2"><Button type="submit" className="bg-emerald-700" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent></Card></FadeIn>
        )}

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div> : (
          <FadeIn delay={0.1}><div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.shipmentId || `SHP-${item.id.slice(-6)}`}</p>
                      <p className="text-xs text-muted-foreground">{item.originCountry || '—'} → {item.destinationCountry || '—'}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {item.vesselName && <span>Vessel: {item.vesselName}</span>}
                        {item.totalWeightKg && <span>Weight: {item.totalWeightKg}kg</span>}
                        {item.containerNumber && <span>Container: {item.containerNumber}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(item.status)}
                      <motion.button whileHover={{ scale: 1.15 }} className="h-7 w-7 rounded-md text-red-600 hover:bg-red-50 flex items-center justify-center" onClick={() => { api.deleteShipment(item.id).then(() => setItems(items.filter(i => i.id !== item.id))) }}><Trash2 className="h-3.5 w-3.5" /></motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No shipments</div>}
          </div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// BUYERS VIEW
// ═══════════════════════════════════════════════════════

export function BuyersView() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ companyName: '', contactPerson: '', email: '', phone: '', address: '', city: '', country: '', taxId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getBuyers().then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createBuyer(form)
      setShowForm(false)
      api.getBuyers().then(data => setItems(data.items || data))
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  return (
    <AnimatedPage viewKey="buyers">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Buyers ({items.length})</h2>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Add Buyer</Button>
        </div></FadeIn>
        {showForm && (
          <FadeIn><Card><CardContent className="p-4">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Company Name <span className="text-red-500">*</span></Label><Input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required /></div>
              <div className="space-y-1"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="space-y-1"><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div className="space-y-1"><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2"><Button type="submit" className="bg-emerald-700" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent></Card></FadeIn>
        )}
        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.1}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">{item.companyName?.charAt(0) || '?'}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.companyName}</p>
                      <p className="text-xs text-muted-foreground">{item.contactPerson || '—'}</p>
                      <p className="text-xs text-muted-foreground">{item.city}{item.country ? `, ${item.country}` : ''}</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.15 }} className="h-7 w-7 rounded-md text-red-600 hover:bg-red-50 flex items-center justify-center" onClick={() => { api.deleteBuyer(item.id).then(() => setItems(items.filter(i => i.id !== item.id))) }}><Trash2 className="h-3.5 w-3.5" /></motion.button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// TRADING CONTRACTS VIEW
// ═══════════════════════════════════════════════════════

export function TradingContractsView() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTradingContracts().then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <AnimatedPage viewKey="trading-contracts">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><h2 className="text-2xl font-bold">Trading Contracts ({items.length})</h2></FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.1}><div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm"><thead className="bg-gradient-to-r from-slate-50 to-slate-100/80"><tr>
              <th className="text-left p-3 font-medium">Contract</th><th className="text-left p-3 font-medium">Buyer</th><th className="text-left p-3 font-medium hidden md:table-cell">Quantity</th><th className="text-left p-3 font-medium hidden md:table-cell">Value</th><th className="text-left p-3 font-medium">Status</th>
            </tr></thead><tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t hover:bg-emerald-50/50">
                  <td className="p-3 font-medium">{item.contractReference || item.id.slice(-8)}</td>
                  <td className="p-3">{item.buyer?.companyName || '—'}</td>
                  <td className="p-3 hidden md:table-cell">{item.quantityKg ? `${item.quantityKg}kg` : '—'}</td>
                  <td className="p-3 hidden md:table-cell">{item.totalValue ? `$${item.totalValue.toLocaleString()}` : '—'}</td>
                  <td className="p-3">{statusBadge(item.status)}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No contracts</td></tr>}
            </tbody></table>
          </div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// CREDIT SCORE VIEW (with gauge)
// ═══════════════════════════════════════════════════════

export function CreditScoreView() {
  const { currentUser } = useAppStore()
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFarmers().then(data => { setFarmers((data.items || data).filter((f: any) => f.creditScore)); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const avgScore = farmers.length ? Math.round(farmers.reduce((sum, f) => sum + (f.creditScore || 0), 0) / farmers.length) : 0
  const scoreColor = avgScore >= 700 ? 'text-emerald-600' : avgScore >= 500 ? 'text-amber-600' : 'text-red-600'
  const scoreLabel = avgScore >= 700 ? 'Excellent' : avgScore >= 500 ? 'Fair' : 'Poor'

  return (
    <AnimatedPage viewKey="credit-score">
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn><h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-emerald-600" /> Credit Score</h2></FadeIn>

        {/* Gauge Chart */}
        <FadeIn delay={0.1}>
          <Card><CardContent className="p-8 flex flex-col items-center">
            <div className="relative w-48 h-24">
              <svg viewBox="0 0 200 100" className="w-full">
                <path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="oklch(0.93 0 0)" strokeWidth="12" strokeLinecap="round" />
                <path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="oklch(0.53 0.15 155)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(avgScore / 850) * 251.2} 251.2`} />
              </svg>
              <div className="absolute inset-0 flex items-end justify-center pb-1">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${scoreColor}`}>{avgScore}</p>
                  <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Average credit score across {farmers.length} farmers</p>
          </CardContent></Card>
        </FadeIn>

        {/* Score Distribution */}
        <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Farmer Credit Scores</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {farmers.sort((a, b) => (b.creditScore || 0) - (a.creditScore || 0)).map(farmer => (
                    <div key={farmer.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-emerald-50/30">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{farmer.fullName?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{farmer.fullName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{farmer.farmerCode || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${(farmer.creditScore || 0) >= 700 ? 'text-emerald-600' : (farmer.creditScore || 0) >= 500 ? 'text-amber-600' : 'text-red-600'}`}>{farmer.creditScore || 0}</p>
                        <Progress value={((farmer.creditScore || 0) / 850) * 100} className="h-1.5 w-20" />
                      </div>
                    </div>
                  ))}
                  {farmers.length === 0 && <div className="text-center py-8 text-muted-foreground">No credit score data</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// QR SCANNER / LABEL PRINTER
// ═══════════════════════════════════════════════════════

export function QrScanView() {
  const [scanResult, setScanResult] = useState<string | null>(null)

  return (
    <AnimatedPage viewKey="qr-scan">
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn><h2 className="text-2xl font-bold flex items-center gap-2"><QrCode className="h-6 w-6 text-emerald-600" /> QR Scanner</h2></FadeIn>
        <FadeIn delay={0.1}>
          <Card><CardContent className="p-8 flex flex-col items-center">
            <div className="w-64 h-64 border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center bg-emerald-50/30">
              <QrCode className="h-24 w-24 text-emerald-300" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Point your camera at a QR code to scan</p>
            <Button className="mt-4 bg-emerald-700 hover:bg-emerald-800" onClick={() => setScanResult('DEMO-FARMER-001')}>Demo Scan</Button>
            {scanResult && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg w-full max-w-sm text-center">
                <p className="text-sm font-medium">Scanned: {scanResult}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setScanResult(null)}>Clear</Button>
              </div>
            )}
          </CardContent></Card>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

export function QrLabelView() {
  return (
    <AnimatedPage viewKey="qr-label">
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn><h2 className="text-2xl font-bold flex items-center gap-2"><Printer className="h-6 w-6 text-emerald-600" /> Print Labels</h2></FadeIn>
        <FadeIn delay={0.1}>
          <Card><CardContent className="p-6">
            <p className="text-muted-foreground text-sm mb-4">Generate and print QR code labels for your coffee batches and shipments.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {['Farmer QR', 'Batch QR', 'Shipment QR'].map(label => (
                <Card key={label} className="border-dashed border-2 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center">
                    <QrCode className="h-16 w-16 text-emerald-400 mb-2" />
                    <p className="text-sm font-medium">{label}</p>
                    <Button variant="outline" size="sm" className="mt-2">Generate</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent></Card>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// ADMIN REPORTS
// ═══════════════════════════════════════════════════════

export function AdminReportsView() {
  return (
    <AnimatedPage viewKey="admin-reports">
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn><h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-emerald-600" /> Admin Reports</h2></FadeIn>
        <FadeIn delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Farmer Enrollment', desc: 'Monthly farmer registration trends', icon: '📊' },
              { title: 'Harvest Yield', desc: 'Yield analysis by crop and region', icon: '🌾' },
              { title: 'Procurement Summary', desc: 'Purchase volumes and payments', icon: '💰' },
              { title: 'Processing Efficiency', desc: 'Outturn ratios and QC results', icon: '⚙️' },
              { title: 'EUDR Compliance', desc: 'Compliance status overview', icon: '🛡️' },
              { title: 'Credit Scores', desc: 'Farmer financial health analysis', icon: '💳' },
            ].map(report => (
              <Card key={report.title} className="cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">{report.icon}</div>
                  <p className="font-medium text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Satellite, AlertTriangle, TreePine, ShieldCheck, Plus, Loader2, Eye, MapPin, Layers } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

const RISK_COLORS: Record<string, string> = {
  negligible: 'bg-green-50 text-green-800 border-green-200',
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

const RISK_BAR_COLORS: Record<string, string> = {
  negligible: '#22c55e',
  low: '#4ade80',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

interface DeforestationAssessment {
  id: string
  assessmentDate: string
  riskScore?: number
  riskCategory: string
  deforestationDetected: boolean
  forestLossPct?: number
  confidenceLevel?: number
  provider?: string
  dataSource?: string
  geolocationLat?: number
  geolocationLng?: number
  farmLandId?: string
  farmLand?: { farmName: string; latitude?: number; longitude?: number }
  satelliteImageryRef?: string
  notes?: string
  createdAt: string
}

export default function DeforestationPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<DeforestationAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<DeforestationAssessment | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [form, setForm] = useState<any>({ riskCategory: 'low', status: 'pending' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (riskFilter && riskFilter !== 'all') params.set('riskCategory', riskFilter)
      const res = await fetch(`/api/deforestation?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [riskFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: items.length,
    deforestationDetected: items.filter(i => i.deforestationDetected).length,
    lowRisk: items.filter(i => i.riskCategory === 'low' || i.riskCategory === 'negligible').length,
    highRisk: items.filter(i => i.riskCategory === 'high' || i.riskCategory === 'critical').length,
    avgScore: items.length > 0 ? Math.round(items.reduce((s, i) => s + (i.riskScore || 0), 0) / items.length) : 0,
  }

  const riskChartData = Object.entries(RISK_COLORS).map(([key]) => ({
    name: key,
    value: items.filter(i => i.riskCategory === key).length,
    fill: RISK_BAR_COLORS[key],
  })).filter(d => d.value > 0)

  async function handleCreate() {
    try {
      const res = await fetch('/api/deforestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ riskCategory: 'low', status: 'pending' })
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  function getRiskScoreColor(score?: number): string {
    if (!score) return 'text-gray-500'
    if (score > 70) return 'text-red-600'
    if (score > 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  function getRiskBarWidth(score?: number): number {
    if (!score) return 0
    return Math.min(score, 100)
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Satellite className="w-6 h-6 text-primary" /> Deforestation Risk Assessment
              </h1>
              <p className="text-sm text-muted-foreground">Satellite imagery analysis and deforestation monitoring</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Assessment</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Deforestation Assessment</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Farm Land ID</label>
                    <Input placeholder="Enter farm land ID" value={form.farmLandId || ''} onChange={e => setForm({ ...form, farmLandId: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Risk Category</label>
                      <Select value={form.riskCategory} onValueChange={v => setForm({ ...form, riskCategory: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="negligible">Negligible</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Risk Score</label>
                      <Input type="number" min="0" max="100" placeholder="0-100" value={form.riskScore || ''} onChange={e => setForm({ ...form, riskScore: parseInt(e.target.value) || null })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Latitude</label>
                      <Input type="number" step="0.0001" placeholder="11.9404" value={form.geolocationLat || ''} onChange={e => setForm({ ...form, geolocationLat: parseFloat(e.target.value) || null })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Longitude</label>
                      <Input type="number" step="0.0001" placeholder="108.4584" value={form.geolocationLng || ''} onChange={e => setForm({ ...form, geolocationLng: parseFloat(e.target.value) || null })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Satellite Imagery Ref</label>
                    <Input placeholder="SAT-2024-001" value={form.satelliteImageryRef || ''} onChange={e => setForm({ ...form, satelliteImageryRef: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea placeholder="Assessment notes..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
                  </div>
                  <Button onClick={handleCreate} className="w-full">Create Assessment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Assessments', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Deforested', value: stats.deforestationDetected, bg: 'bg-red-100', color: 'text-red-600' },
            { label: 'Low Risk', value: stats.lowRisk, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'High Risk', value: stats.highRisk, bg: 'bg-orange-100', color: 'text-orange-600' },
            { label: 'Avg Score', value: stats.avgScore, bg: 'bg-amber-100', color: 'text-amber-600' },
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
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Risk Levels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="negligible">Negligible</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 bg-muted rounded-lg p-1 ml-auto">
              <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} className="text-xs">Cards</Button>
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="text-xs">Table</Button>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : viewMode === 'cards' ? (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm cursor-pointer" onClick={() => setDetailItem(item)}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${RISK_COLORS[item.riskCategory] || ''} border capitalize text-xs`}>{item.riskCategory}</Badge>
                      {item.deforestationDetected ? <Badge className="bg-red-100 text-red-800 border border-red-200 text-xs">⚠ Deforested</Badge> : <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">✓ Clear</Badge>}
                    </div>
                    {/* Risk Score Visual */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className={`font-bold ${getRiskScoreColor(item.riskScore)}`}>{item.riskScore ?? '—'}/100</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${item.riskScore && item.riskScore > 70 ? 'bg-red-500' : item.riskScore && item.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${getRiskBarWidth(item.riskScore)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{item.farmLand?.farmName || 'Unknown Farm'}</p>
                      <p>{new Date(item.assessmentDate).toLocaleDateString()}</p>
                      {item.forestLossPct != null && <p>Forest Loss: {item.forestLossPct.toFixed(2)}%</p>}
                      {item.confidenceLevel != null && <p>Confidence: {(item.confidenceLevel * 100).toFixed(0)}%</p>}
                    </div>
                    {/* Map Placeholder */}
                    {(item.geolocationLat || item.farmLand?.latitude) && (
                      <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
                        <div className="text-center">
                          <MapPin className="w-4 h-4 mx-auto text-muted-foreground/50 mb-1" />
                          <span className="text-[10px] text-muted-foreground">
                            {item.geolocationLat || item.farmLand?.latitude}, {item.geolocationLng || item.farmLand?.longitude}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Farm Land</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Category</TableHead>
                      <TableHead>Forest Loss %</TableHead>
                      <TableHead>Deforestation</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground"><Satellite className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No assessments found</p></TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setDetailItem(item)}>
                        <TableCell className="text-xs">{new Date(item.assessmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.farmLand?.farmName || '—'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{item.provider || item.dataSource}</Badge></TableCell>
                        <TableCell className={`font-medium ${getRiskScoreColor(item.riskScore)}`}>{item.riskScore != null ? `${item.riskScore}/100` : '—'}</TableCell>
                        <TableCell><Badge className={`${RISK_COLORS[item.riskCategory] || ''} border capitalize text-xs`}>{item.riskCategory}</Badge></TableCell>
                        <TableCell>{item.forestLossPct != null ? `${item.forestLossPct.toFixed(2)}%` : '—'}</TableCell>
                        <TableCell>{item.deforestationDetected ? <Badge className="bg-red-100 text-red-800 text-xs">Detected</Badge> : <Badge className="bg-green-100 text-green-800 text-xs">Clear</Badge>}</TableCell>
                        <TableCell>{item.confidenceLevel != null ? `${(item.confidenceLevel * 100).toFixed(0)}%` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Risk Distribution Chart */}
        {riskChartData.length > 0 && (
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader><CardTitle className="text-base">Risk Category Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {riskChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Assessment Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${RISK_COLORS[detailItem.riskCategory]} border capitalize`}>{detailItem.riskCategory}</Badge>
                  {detailItem.deforestationDetected ? <Badge className="bg-red-100 text-red-800">Deforested</Badge> : <Badge className="bg-green-100 text-green-800">Clear</Badge>}
                </div>
                {/* Risk Score Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk Score</span>
                    <span className={`font-bold ${getRiskScoreColor(detailItem.riskScore)}`}>{detailItem.riskScore ?? '—'}/100</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${detailItem.riskScore && detailItem.riskScore > 70 ? 'bg-red-500' : detailItem.riskScore && detailItem.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${getRiskBarWidth(detailItem.riskScore)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Farm:</span><p>{detailItem.farmLand?.farmName || '—'}</p></div>
                  <div><span className="text-muted-foreground">Date:</span><p>{new Date(detailItem.assessmentDate).toLocaleDateString()}</p></div>
                  <div><span className="text-muted-foreground">Provider:</span><p>{detailItem.provider || detailItem.dataSource || '—'}</p></div>
                  <div><span className="text-muted-foreground">Forest Loss:</span><p>{detailItem.forestLossPct != null ? `${detailItem.forestLossPct.toFixed(2)}%` : '—'}</p></div>
                  <div><span className="text-muted-foreground">Confidence:</span><p>{detailItem.confidenceLevel != null ? `${(detailItem.confidenceLevel * 100).toFixed(0)}%` : '—'}</p></div>
                  <div><span className="text-muted-foreground">Sat Ref:</span><p className="font-mono text-xs">{detailItem.satelliteImageryRef || '—'}</p></div>
                </div>
                {/* Map Placeholder */}
                {(detailItem.geolocationLat || detailItem.farmLand?.latitude) && (
                  <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <MapPin className="w-5 h-5 mx-auto text-muted-foreground/50 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        Lat: {detailItem.geolocationLat || detailItem.farmLand?.latitude}, Lng: {detailItem.geolocationLng || detailItem.farmLand?.longitude}
                      </p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">Map visualization placeholder</p>
                    </div>
                  </div>
                )}
                {detailItem.notes && <div className="text-sm"><span className="text-muted-foreground">Notes:</span><p className="mt-1 p-3 bg-muted rounded-lg">{detailItem.notes}</p></div>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, AlertTriangle, CheckCircle2, Clock, Plus, Search, Loader2, Eye, FileCheck } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_review: 'bg-blue-100 text-blue-800 border-blue-200',
  compliant: 'bg-green-100 text-green-800 border-green-200',
  non_compliant: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

const RISK_CHART_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

const STATUS_CHART_COLORS: Record<string, string> = {
  pending: '#eab308',
  in_review: '#3b82f6',
  compliant: '#22c55e',
  non_compliant: '#ef4444',
  expired: '#9ca3af',
}

interface EudrRecord {
  id: string
  complianceId: string
  batchId?: string
  status: string
  riskLevel: string
  deforestationRiskScore?: number
  validUntil?: string
  notes?: string
  farmerId?: string
  farmLandId?: string
  createdAt: string
  farmer?: { name: string }
  farmLand?: { farmName: string }
}

export default function EudrCompliancePage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<EudrRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [riskFilter, setRiskFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<EudrRecord | null>(null)
  const [form, setForm] = useState({
    complianceId: '',
    farmerId: '',
    farmLandId: '',
    status: 'pending',
    riskLevel: 'low',
    notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/eudr-compliance?${params}`)
      const data = await res.json()
      if (data.success) {
        const records = data.data?.data || []
        setItems(records)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === 'compliant').length,
    pending: items.filter(i => i.status === 'pending' || i.status === 'in_review').length,
    nonCompliant: items.filter(i => i.status === 'non_compliant').length,
    expired: items.filter(i => i.status === 'expired').length,
    highRisk: items.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length,
  }

  const filteredItems = items.filter(item => {
    if (riskFilter && item.riskLevel !== riskFilter) return false
    return true
  })

  const statusChartData = Object.entries(STATUS_COLORS).map(([key]) => ({
    name: key.replace('_', ' '),
    value: items.filter(i => i.status === key).length,
    color: STATUS_CHART_COLORS[key],
  })).filter(d => d.value > 0)

  const riskChartData = Object.entries(RISK_COLORS).map(([key]) => ({
    name: key,
    value: items.filter(i => i.riskLevel === key).length,
    fill: RISK_CHART_COLORS[key],
  }))

  async function handleCreate() {
    try {
      const res = await fetch('/api/eudr-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ complianceId: '', farmerId: '', farmLandId: '', status: 'pending', riskLevel: 'low', notes: '' })
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
                <Shield className="w-6 h-6 text-primary" /> EUDR Compliance Hub
              </h1>
              <p className="text-sm text-muted-foreground">EU Deforestation Regulation compliance management</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Assessment</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create EUDR Assessment</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compliance ID *</label>
                    <Input placeholder="EUDR-2024-001" value={form.complianceId} onChange={e => setForm({ ...form, complianceId: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Farmer ID</label>
                    <Input placeholder="Enter farmer ID" value={form.farmerId} onChange={e => setForm({ ...form, farmerId: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Farm Land ID</label>
                    <Input placeholder="Enter farm land ID" value={form.farmLandId} onChange={e => setForm({ ...form, farmLandId: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="compliant">Compliant</SelectItem>
                          <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Risk Level</label>
                      <Select value={form.riskLevel} onValueChange={v => setForm({ ...form, riskLevel: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
                  </div>
                  <Button onClick={handleCreate} className="w-full">Create Assessment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Shield, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Compliant', value: stats.compliant, icon: CheckCircle2, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Pending/Review', value: stats.pending, icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
            { label: 'Non-Compliant', value: stats.nonCompliant, icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
            { label: 'High Risk', value: stats.highRisk, icon: AlertTriangle, bg: 'bg-orange-100', color: 'text-orange-600' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-5 h-5 ${card.color}`} /></div>
                    <div>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Records</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            {/* Filters */}
            <FadeIn delay={0.1}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search compliance records..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Risk Levels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FadeIn>

            {/* Data Table */}
            <FadeIn delay={0.2}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Compliance ID</TableHead>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Loading records...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p>No compliance records found</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredItems.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium font-mono text-xs">{item.complianceId || '—'}</TableCell>
                          <TableCell>{item.farmer?.name || item.farmerId || '—'}</TableCell>
                          <TableCell>
                            <Badge className={`${STATUS_COLORS[item.status] || ''} border capitalize`}>
                              {item.status?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${RISK_COLORS[item.riskLevel] || ''} border capitalize`}>
                              {item.riskLevel || '—'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.deforestationRiskScore != null ? (
                              <span className={`font-medium ${item.deforestationRiskScore > 70 ? 'text-red-600' : item.deforestationRiskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {item.deforestationRiskScore}/100
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell>{item.validUntil ? new Date(item.validUntil).toLocaleDateString() : '—'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDetailItem(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <FadeIn>
                <Card>
                  <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
                  <CardContent>
                    {statusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                            {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-muted-foreground py-12">No data available</p>}
                  </CardContent>
                </Card>
              </FadeIn>
              <FadeIn delay={0.1}>
                <Card>
                  <CardHeader><CardTitle className="text-base">Risk Level Distribution</CardTitle></CardHeader>
                  <CardContent>
                    {riskChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
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
                    ) : <p className="text-center text-muted-foreground py-12">No data available</p>}
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Compliance Record Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Compliance ID:</span><p className="font-mono font-medium">{detailItem.complianceId}</p></div>
                  <div><span className="text-muted-foreground">Batch ID:</span><p className="font-mono">{detailItem.batchId || '—'}</p></div>
                  <div><span className="text-muted-foreground">Status:</span><p><Badge className={`${STATUS_COLORS[detailItem.status]} border capitalize`}>{detailItem.status?.replace('_', ' ')}</Badge></p></div>
                  <div><span className="text-muted-foreground">Risk Level:</span><p><Badge className={`${RISK_COLORS[detailItem.riskLevel]} border capitalize`}>{detailItem.riskLevel}</Badge></p></div>
                  <div><span className="text-muted-foreground">Risk Score:</span><p className="font-medium">{detailItem.deforestationRiskScore != null ? `${detailItem.deforestationRiskScore}/100` : '—'}</p></div>
                  <div><span className="text-muted-foreground">Valid Until:</span><p>{detailItem.validUntil ? new Date(detailItem.validUntil).toLocaleDateString() : '—'}</p></div>
                </div>
                {detailItem.notes && (
                  <div className="text-sm"><span className="text-muted-foreground">Notes:</span><p className="mt-1 p-3 bg-muted rounded-lg">{detailItem.notes}</p></div>
                )}
                <div className="text-xs text-muted-foreground">Created: {new Date(detailItem.createdAt).toLocaleString()}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

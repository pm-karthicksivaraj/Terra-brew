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
import { ShieldCheck, Plus, Loader2, Eye, Filter, Calendar, User, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  passed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_ICONS: Record<string, string> = {
  requested: '📋', scheduled: '📅', in_progress: '🔍', passed: '✅', failed: '❌', expired: '⏰',
}

const VERIFICATION_TYPE_LABELS: Record<string, string> = {
  eudr: 'EUDR',
  organic: 'Organic',
  fairtrade: 'Fairtrade',
  rainforest: 'Rainforest Alliance',
  utz: 'UTZ',
  '4c': '4C',
}

const VERIFICATION_TYPE_COLORS: Record<string, string> = {
  eudr: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  organic: 'bg-green-100 text-green-800 border-green-200',
  fairtrade: 'bg-blue-100 text-blue-800 border-blue-200',
  rainforest: 'bg-teal-100 text-teal-800 border-teal-200',
  utz: 'bg-amber-100 text-amber-800 border-amber-200',
  '4c': 'bg-purple-100 text-purple-800 border-purple-200',
}

const CHART_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#9ca3af']

interface QCVerification {
  id: string
  verificationType: string
  entityType: string
  entityId?: string
  status: string
  inspectorName?: string
  scheduledDate?: string
  completedDate?: string
  validUntil?: string
  notes?: string
  createdAt: string
}

export default function QcVerificationsPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<QCVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<QCVerification | null>(null)
  const [form, setForm] = useState<any>({ verificationType: 'eudr', entityType: 'farmer', status: 'requested' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter && typeFilter !== 'all') params.set('verificationType', typeFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/qc-verifications?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: items.length,
    passed: items.filter(v => v.status === 'passed').length,
    pending: items.filter(v => ['requested', 'scheduled', 'in_progress'].includes(v.status)).length,
    failed: items.filter(v => v.status === 'failed').length,
  }

  const statusChartData = Object.entries(STATUS_COLORS).map(([key]) => ({
    name: key.replace('_', ' '),
    value: items.filter(v => v.status === key).length,
  })).filter(d => d.value > 0)

  async function handleCreate() {
    try {
      const res = await fetch('/api/qc-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ verificationType: 'eudr', entityType: 'farmer', status: 'requested' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" /> QC Verifications
              </h1>
              <p className="text-sm text-muted-foreground">Quality control verification portal for certification bodies</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Request Verification</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request QC Verification</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Type</label>
                    <Select value={form.verificationType} onValueChange={v => setForm({ ...form, verificationType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(VERIFICATION_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity Type</label>
                    <Select value={form.entityType} onValueChange={v => setForm({ ...form, entityType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="farmland">Farm Land</SelectItem>
                        <SelectItem value="batch">Batch</SelectItem>
                        <SelectItem value="shipment">Shipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entity ID</label>
                    <Input placeholder="Enter entity ID" value={form.entityId || ''} onChange={e => setForm({ ...form, entityId: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scheduled Date</label>
                    <Input type="date" value={form.scheduledDate || ''} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea placeholder="Notes..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
                  </div>
                  <Button onClick={handleCreate} className="w-full">Request Verification</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Passed', value: stats.passed, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, bg: 'bg-yellow-100', color: 'text-yellow-600' },
            { label: 'Failed', value: stats.failed, bg: 'bg-red-100', color: 'text-red-600' },
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Verification Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(VERIFICATION_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {/* Table & Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          <FadeIn delay={0.2} className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                    ) : items.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No verifications found</p></TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 cursor-pointer transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                            <Badge className={`${VERIFICATION_TYPE_COLORS[item.verificationType] || 'bg-gray-100 text-gray-800'} border text-xs uppercase`}>
                              {VERIFICATION_TYPE_LABELS[item.verificationType] || item.verificationType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">{item.entityType}</span>
                          {item.entityId && <span className="text-xs text-muted-foreground ml-1">({item.entityId.slice(0, 8)}...)</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[item.status] || ''} border text-xs`}>
                            {STATUS_ICONS[item.status]} {item.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.inspectorName || '—'}</TableCell>
                        <TableCell className="text-xs">{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-xs">{item.validUntil ? new Date(item.validUntil).toLocaleDateString() : '—'}</TableCell>
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

          <FadeIn delay={0.3}>
            <Card>
              <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
              <CardContent>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                        {statusChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data</p>}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Verification Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${VERIFICATION_TYPE_COLORS[detailItem.verificationType]} border uppercase text-xs`}>
                    {VERIFICATION_TYPE_LABELS[detailItem.verificationType] || detailItem.verificationType}
                  </Badge>
                  <Badge className={`${STATUS_COLORS[detailItem.status]} border text-xs`}>
                    {STATUS_ICONS[detailItem.status]} {detailItem.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Entity:</span><p className="capitalize">{detailItem.entityType} {detailItem.entityId ? `(${detailItem.entityId.slice(0, 8)}...)` : ''}</p></div>
                  <div><span className="text-muted-foreground">Inspector:</span><p>{detailItem.inspectorName || 'Not assigned'}</p></div>
                  <div><span className="text-muted-foreground">Scheduled:</span><p>{detailItem.scheduledDate ? new Date(detailItem.scheduledDate).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">Completed:</span><p>{detailItem.completedDate ? new Date(detailItem.completedDate).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">Valid Until:</span><p>{detailItem.validUntil ? new Date(detailItem.validUntil).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">Created:</span><p>{new Date(detailItem.createdAt).toLocaleDateString()}</p></div>
                </div>
                {detailItem.notes && <div className="text-sm"><span className="text-muted-foreground">Notes:</span><p className="mt-1 p-3 bg-muted rounded-lg">{detailItem.notes}</p></div>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

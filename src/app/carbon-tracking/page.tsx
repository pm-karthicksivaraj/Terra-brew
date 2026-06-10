'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Activity, Plus, Search, Loader2, Eye, Trash2,
  TrendingDown, TrendingUp, Leaf, Cloud, Factory,
  Zap, ArrowDownRight, ArrowUpRight, Minus, Filter, X,
  CheckCircle2, Clock, AlertTriangle, XCircle, BarChart3
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid
} from 'recharts'

// ─── Constants ───────────────────────────────────────────────────

const BRAND_COLOR = '#6D2932'

const VERIFICATION_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

const VERIFICATION_CHART_COLORS: Record<string, string> = {
  pending: '#eab308', verified: '#22c55e', rejected: '#ef4444',
}

// ─── Types ───────────────────────────────────────────────────────

interface CarbonTrackingRecord {
  id: string
  tenantId: string
  batchId?: string
  farmerId?: string
  farmLandId?: string
  eudrComplianceId?: string
  createdBy?: string
  trackingId?: string
  reportingPeriod?: string
  scope1Emissions?: number
  scope2Emissions?: number
  scope3Emissions?: number
  totalEmissions?: number
  emissionsPerKg?: number
  carbonSequestered?: number
  netEmissions?: number
  methodology?: string
  dataSources?: string
  verificationStatus?: string
  verifiedBy?: string
  verificationDate?: string
  notes?: string
  metadata?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer?: { id: string; fullName: string; farmerCode?: string }
  farmLand?: { id: string; farmName: string }
  eudrCompliance?: { id: string; complianceId: string; status?: string }
}

interface CreateForm {
  trackingId: string
  batchId: string
  farmerId: string
  farmLandId: string
  eudrComplianceId: string
  reportingPeriod: string
  scope1Emissions: string
  scope2Emissions: string
  scope3Emissions: string
  carbonSequestered: string
  methodology: string
  notes: string
}

const emptyForm: CreateForm = {
  trackingId: '',
  batchId: '',
  farmerId: '',
  farmLandId: '',
  eudrComplianceId: '',
  reportingPeriod: '',
  scope1Emissions: '',
  scope2Emissions: '',
  scope3Emissions: '',
  carbonSequestered: '',
  methodology: '',
  notes: '',
}

// ─── Main Page Component ─────────────────────────────────────────

export default function CarbonTrackingPage() {
  const { data: session } = useSession()
  const tenantId = session?.user?.tenantId

  const [records, setRecords] = useState<CarbonTrackingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CreateForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<CarbonTrackingRecord | null>(null)

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/carbon-tracking?tenantId=${tenantId}&pageSize=100`)
      const json = await res.json()
      if (json.success && json.data?.data) {
        setRecords(json.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch carbon tracking records:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter(r => {
      if (search) {
        const q = search.toLowerCase()
        const match = (
          (r.trackingId || '').toLowerCase().includes(q) ||
          (r.batchId || '').toLowerCase().includes(q) ||
          (r.reportingPeriod || '').toLowerCase().includes(q) ||
          (r.methodology || '').toLowerCase().includes(q) ||
          (r.farmer?.fullName || '').toLowerCase().includes(q)
        )
        if (!match) return false
      }
      if (statusFilter !== 'all' && r.verificationStatus !== statusFilter) return false
      return true
    })
  }, [records, search, statusFilter])

  // KPI calculations
  const kpis = useMemo(() => {
    const totalEmissions = records.reduce((s, r) => s + (r.totalEmissions || 0), 0)
    const totalSequestered = records.reduce((s, r) => s + (r.carbonSequestered || 0), 0)
    const totalNet = records.reduce((s, r) => s + (r.netEmissions || 0), 0)
    const withPerKg = records.filter(r => r.emissionsPerKg != null && r.emissionsPerKg > 0)
    const avgPerKg = withPerKg.length > 0
      ? withPerKg.reduce((s, r) => s + (r.emissionsPerKg || 0), 0) / withPerKg.length
      : 0
    return { totalEmissions, totalSequestered, totalNet, avgPerKg }
  }, [records])

  // Chart data
  const verificationChartData = useMemo(() => {
    return Object.entries(VERIFICATION_CHART_COLORS).map(([key, color]) => ({
      name: key, value: records.filter(r => r.verificationStatus === key).length, color,
    })).filter(d => d.value > 0)
  }, [records])

  const scopeBreakdownData = useMemo(() => {
    const scope1 = records.reduce((s, r) => s + (r.scope1Emissions || 0), 0)
    const scope2 = records.reduce((s, r) => s + (r.scope2Emissions || 0), 0)
    const scope3 = records.reduce((s, r) => s + (r.scope3Emissions || 0), 0)
    return [
      { name: 'Scope 1 (Direct)', value: scope1, fill: '#ef4444' },
      { name: 'Scope 2 (Energy)', value: scope2, fill: '#f97316' },
      { name: 'Scope 3 (Supply Chain)', value: scope3, fill: '#eab308' },
    ].filter(d => d.value > 0)
  }, [records])

  // Auto-calculate form totals
  const formTotals = useMemo(() => {
    const s1 = parseFloat(form.scope1Emissions) || 0
    const s2 = parseFloat(form.scope2Emissions) || 0
    const s3 = parseFloat(form.scope3Emissions) || 0
    const seq = parseFloat(form.carbonSequestered) || 0
    const total = s1 + s2 + s3
    const net = total - seq
    return { total, net }
  }, [form])

  // Create record
  const handleCreate = async () => {
    if (!tenantId) return
    setSubmitting(true)
    try {
      const body: any = {
        trackingId: form.trackingId || undefined,
        batchId: form.batchId || undefined,
        farmerId: form.farmerId || undefined,
        farmLandId: form.farmLandId || undefined,
        eudrComplianceId: form.eudrComplianceId || undefined,
        reportingPeriod: form.reportingPeriod || undefined,
        scope1Emissions: parseFloat(form.scope1Emissions) || undefined,
        scope2Emissions: parseFloat(form.scope2Emissions) || undefined,
        scope3Emissions: parseFloat(form.scope3Emissions) || undefined,
        carbonSequestered: parseFloat(form.carbonSequestered) || undefined,
        methodology: form.methodology || undefined,
        notes: form.notes || undefined,
      }
      const res = await fetch('/api/carbon-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setCreateOpen(false)
        setForm(emptyForm)
        fetchRecords()
      } else {
        alert(json.error || 'Failed to create record')
      }
    } catch (err) {
      console.error('Failed to create record:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete record
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/carbon-tracking/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setDeleteConfirm(null)
        setDetailItem(null)
        fetchRecords()
      }
    } catch (err) {
      console.error('Failed to delete record:', err)
    }
  }

  // Format number
  const fmt = (n?: number | null, decimals = 2) => {
    if (n == null) return '—'
    return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: BRAND_COLOR }}>
                <Activity className="w-6 h-6" /> Carbon Tracking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage carbon emissions, sequestration, and net carbon footprint across your supply chain
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1 text-xs whitespace-nowrap" style={{ backgroundColor: BRAND_COLOR, color: 'white' }}>
                  <Plus className="w-4 h-4" /> New Carbon Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2" style={{ color: BRAND_COLOR }}>
                    <Activity className="w-5 h-5" /> Create Carbon Tracking Record
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Identification */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identification</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Tracking ID</Label>
                        <Input placeholder="CT-2024-XXX" value={form.trackingId} onChange={e => setForm({ ...form, trackingId: e.target.value })} className="font-mono text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Batch ID</Label>
                        <Input placeholder="BATCH-XXX" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Farmer ID</Label>
                        <Input placeholder="Farmer ID" value={form.farmerId} onChange={e => setForm({ ...form, farmerId: e.target.value })} className="font-mono text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Farm Land ID</Label>
                        <Input placeholder="Farm Land ID" value={form.farmLandId} onChange={e => setForm({ ...form, farmLandId: e.target.value })} className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">EUDR Compliance ID</Label>
                        <Input placeholder="EUDR compliance reference" value={form.eudrComplianceId} onChange={e => setForm({ ...form, eudrComplianceId: e.target.value })} className="font-mono text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Reporting Period</Label>
                        <Input placeholder="e.g., Q1 2024, 2024" value={form.reportingPeriod} onChange={e => setForm({ ...form, reportingPeriod: e.target.value })} className="font-mono text-sm" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Emissions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emissions (kg CO2e)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1"><Factory className="w-3 h-3" /> Scope 1 (Direct)</Label>
                        <Input type="number" step="0.01" placeholder="0.00" value={form.scope1Emissions} onChange={e => setForm({ ...form, scope1Emissions: e.target.value })} className="font-mono text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1"><Zap className="w-3 h-3" /> Scope 2 (Energy)</Label>
                        <Input type="number" step="0.01" placeholder="0.00" value={form.scope2Emissions} onChange={e => setForm({ ...form, scope2Emissions: e.target.value })} className="font-mono text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1"><Cloud className="w-3 h-3" /> Scope 3 (Supply)</Label>
                        <Input type="number" step="0.01" placeholder="0.00" value={form.scope3Emissions} onChange={e => setForm({ ...form, scope3Emissions: e.target.value })} className="font-mono text-sm" />
                      </div>
                    </div>

                    {/* Auto-calculated totals */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg border">
                      <div>
                        <span className="text-xs text-muted-foreground">Total Emissions</span>
                        <p className="text-sm font-bold font-mono" style={{ color: BRAND_COLOR }}>{fmt(formTotals.total)}</p>
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1"><Leaf className="w-3 h-3 text-green-600" /> Carbon Sequestered</Label>
                        <Input type="number" step="0.01" placeholder="0.00" value={form.carbonSequestered} onChange={e => setForm({ ...form, carbonSequestered: e.target.value })} className="font-mono text-sm" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Net Emissions</span>
                        <p className={`text-sm font-bold font-mono ${formTotals.net < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {fmt(formTotals.net)}
                          {formTotals.net < 0 ? <ArrowDownRight className="w-3 h-3 inline ml-1" /> : formTotals.net > 0 ? <ArrowUpRight className="w-3 h-3 inline ml-1" /> : <Minus className="w-3 h-3 inline ml-1" />}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Method & Notes */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Method & Notes</h4>
                    <div className="space-y-2">
                      <Label className="text-xs">Methodology</Label>
                      <Select value={form.methodology || ''} onValueChange={v => setForm({ ...form, methodology: v })}>
                        <SelectTrigger><SelectValue placeholder="Select methodology" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GHG Protocol">GHG Protocol</SelectItem>
                          <SelectItem value="ISO 14064">ISO 14064</SelectItem>
                          <SelectItem value="PAS 2050">PAS 2050</SelectItem>
                          <SelectItem value="SBTi">SBTi</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Notes</Label>
                      <Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="text-sm" />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="text-xs">Cancel</Button>
                  <Button size="sm" onClick={handleCreate} disabled={submitting} className="text-xs gap-1" style={{ backgroundColor: BRAND_COLOR, color: 'white' }}>
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Create Record
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* KPI Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Emissions', value: `${fmt(kpis.totalEmissions, 1)} kg`, sub: 'CO2e', icon: Cloud, bg: 'bg-red-100', color: 'text-red-600', trend: kpis.totalEmissions > 0 ? 'up' : 'neutral' },
            { label: 'Carbon Sequestered', value: `${fmt(kpis.totalSequestered, 1)} kg`, sub: 'CO2e', icon: Leaf, bg: 'bg-green-100', color: 'text-green-600', trend: 'down' },
            { label: 'Net Emissions', value: `${fmt(kpis.totalNet, 1)} kg`, sub: 'CO2e', icon: kpis.totalNet < 0 ? TrendingDown : TrendingUp, bg: kpis.totalNet < 0 ? 'bg-green-100' : 'bg-orange-100', color: kpis.totalNet < 0 ? 'text-green-600' : 'text-orange-600', trend: kpis.totalNet < 0 ? 'down' : 'up' },
            { label: 'Avg per Kg', value: `${fmt(kpis.avgPerKg)}`, sub: 'kg CO2e/kg', icon: BarChart3, bg: 'bg-amber-100', color: 'text-amber-600', trend: 'neutral' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-4 h-4 ${card.color}`} /></div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold font-mono truncate">{card.value}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <FadeIn>
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {verificationChartData.length > 0 ? (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={verificationChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                          label={(props: any) => `${props.name ?? ''} (${props.value ?? 0})`}>
                          {verificationChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scope Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {scopeBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={scopeBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {scopeBreakdownData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Filters */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by tracking ID, batch, farmer..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Verification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={fetchRecords}>
              <Activity className="w-3 h-3" /> Refresh
            </Button>
          </div>
        </FadeIn>

        {/* Data Table */}
        <FadeIn delay={0.1}>
          <Card className="rounded-xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono text-xs">Tracking ID</TableHead>
                        <TableHead className="text-xs">Batch</TableHead>
                        <TableHead className="text-xs">Farmer</TableHead>
                        <TableHead className="text-xs">Period</TableHead>
                        <TableHead className="text-xs text-right">Scope 1</TableHead>
                        <TableHead className="text-xs text-right">Scope 2</TableHead>
                        <TableHead className="text-xs text-right">Scope 3</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                        <TableHead className="text-xs text-right">Sequestered</TableHead>
                        <TableHead className="text-xs text-right">Net</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                            <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No carbon tracking records found</p>
                            <p className="text-xs mt-1">Create a new record to start tracking your carbon footprint</p>
                          </TableCell>
                        </TableRow>
                      ) : filtered.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-mono text-xs font-medium" style={{ color: BRAND_COLOR }}>
                            {item.trackingId || '—'}
                          </TableCell>
                          <TableCell className="text-xs font-mono">{item.batchId || '—'}</TableCell>
                          <TableCell className="text-xs">{item.farmer?.fullName || item.farmerId || '—'}</TableCell>
                          <TableCell className="text-xs">{item.reportingPeriod || '—'}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{fmt(item.scope1Emissions)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{fmt(item.scope2Emissions)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{fmt(item.scope3Emissions)}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-medium">{fmt(item.totalEmissions)}</TableCell>
                          <TableCell className="text-xs text-right font-mono text-green-600">{fmt(item.carbonSequestered)}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-medium">
                            <span className={item.netEmissions != null && item.netEmissions < 0 ? 'text-green-600' : 'text-red-600'}>
                              {fmt(item.netEmissions)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${VERIFICATION_COLORS[item.verificationStatus || 'pending'] || ''} border capitalize text-xs`}>
                              {item.verificationStatus || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDetailItem(item)}>
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => setDeleteConfirm(item.id)}>
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
        </FadeIn>

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono flex items-center gap-2" style={{ color: BRAND_COLOR }}>
                <Activity className="w-5 h-5" /> {detailItem?.trackingId || 'Carbon Record'}
              </DialogTitle>
            </DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-2">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <Badge className={`${VERIFICATION_COLORS[detailItem.verificationStatus || 'pending']} border capitalize`}>
                    {detailItem.verificationStatus || 'pending'}
                  </Badge>
                  {detailItem.methodology && (
                    <Badge variant="outline" className="text-xs">{detailItem.methodology}</Badge>
                  )}
                  {detailItem.eudrCompliance && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}>
                      EUDR: {detailItem.eudrCompliance.complianceId}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Core Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Tracking ID</span>
                    <p className="font-mono text-xs font-medium">{detailItem.trackingId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Batch ID</span>
                    <p className="font-mono text-xs">{detailItem.batchId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Farmer</span>
                    <p className="text-xs">{detailItem.farmer?.fullName || detailItem.farmerId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Farm Land</span>
                    <p className="text-xs">{detailItem.farmLand?.farmName || detailItem.farmLandId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Reporting Period</span>
                    <p className="text-xs">{detailItem.reportingPeriod || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Created</span>
                    <p className="text-xs">{new Date(detailItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                {/* Emissions Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Emissions Breakdown (kg CO2e)</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
                      <div className="flex items-center gap-2 mb-1">
                        <Factory className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-muted-foreground">Scope 1 (Direct)</span>
                      </div>
                      <p className="text-lg font-bold font-mono text-red-600">{fmt(detailItem.scope1Emissions)}</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-muted-foreground">Scope 2 (Energy)</span>
                      </div>
                      <p className="text-lg font-bold font-mono text-orange-600">{fmt(detailItem.scope2Emissions)}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
                      <div className="flex items-center gap-2 mb-1">
                        <Cloud className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-muted-foreground">Scope 3 (Supply)</span>
                      </div>
                      <p className="text-lg font-bold font-mono text-yellow-600">{fmt(detailItem.scope3Emissions)}</p>
                    </div>
                  </div>

                  {/* Emissions bar */}
                  {detailItem.totalEmissions != null && (
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total Emissions</span>
                        <span className="font-mono font-medium">{fmt(detailItem.totalEmissions)} kg CO2e</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full flex">
                          {detailItem.scope1Emissions != null && detailItem.totalEmissions > 0 && (
                            <div className="bg-red-500 h-full" style={{ width: `${(detailItem.scope1Emissions / detailItem.totalEmissions) * 100}%` }} />
                          )}
                          {detailItem.scope2Emissions != null && detailItem.totalEmissions > 0 && (
                            <div className="bg-orange-500 h-full" style={{ width: `${(detailItem.scope2Emissions / detailItem.totalEmissions) * 100}%` }} />
                          )}
                          {detailItem.scope3Emissions != null && detailItem.totalEmissions > 0 && (
                            <div className="bg-yellow-500 h-full" style={{ width: `${(detailItem.scope3Emissions / detailItem.totalEmissions) * 100}%` }} />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Scope 1</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Scope 2</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Scope 3</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Net Emissions Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <span className="text-xs text-muted-foreground">Total Emissions</span>
                    <p className="text-sm font-bold font-mono">{fmt(detailItem.totalEmissions)} kg</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-green-600" /> Carbon Sequestered
                    </span>
                    <p className="text-sm font-bold font-mono text-green-600">{fmt(detailItem.carbonSequestered)} kg</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${detailItem.netEmissions != null && detailItem.netEmissions < 0 ? 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900' : 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900'}`}>
                    <span className="text-xs text-muted-foreground">Net Emissions</span>
                    <p className={`text-sm font-bold font-mono ${detailItem.netEmissions != null && detailItem.netEmissions < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {fmt(detailItem.netEmissions)} kg
                      {detailItem.netEmissions != null && detailItem.netEmissions < 0 ? (
                        <ArrowDownRight className="w-3 h-3 inline ml-1 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 inline ml-1 text-orange-600" />
                      )}
                    </p>
                  </div>
                </div>

                {detailItem.emissionsPerKg != null && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <span className="text-xs text-muted-foreground">Emissions per Kg of Coffee</span>
                    <p className="text-sm font-bold font-mono">{fmt(detailItem.emissionsPerKg)} kg CO2e/kg</p>
                  </div>
                )}

                {detailItem.notes && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-xs text-muted-foreground">Notes</span>
                      <p className="text-xs mt-1 whitespace-pre-wrap">{detailItem.notes}</p>
                    </div>
                  </>
                )}

                {/* Verification Info */}
                {(detailItem.verifiedBy || detailItem.verificationDate) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {detailItem.verifiedBy && (
                        <div>
                          <span className="text-xs text-muted-foreground">Verified By</span>
                          <p className="text-xs">{detailItem.verifiedBy}</p>
                        </div>
                      )}
                      {detailItem.verificationDate && (
                        <div>
                          <span className="text-xs text-muted-foreground">Verification Date</span>
                          <p className="text-xs">{new Date(detailItem.verificationDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" /> Delete Record
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this carbon tracking record? This action cannot be undone.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="text-xs">Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="text-xs gap-1">
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

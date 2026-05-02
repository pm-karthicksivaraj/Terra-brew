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
import { BarChart3, Plus, FileDown, TrendingUp, Loader2, Trash2, Download, BarChart2, PieChart as PieChartIcon, CalendarDays } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const REPORT_TYPES = [
  { value: 'eudr_compliance', label: 'EUDR Compliance', icon: Shield, color: 'bg-emerald-100 text-emerald-800' },
  { value: 'supply_chain', label: 'Supply Chain', icon: TrendingUp, color: 'bg-blue-100 text-blue-800' },
  { value: 'financial', label: 'Financial', icon: BarChart2, color: 'bg-amber-100 text-amber-800' },
  { value: 'quality', label: 'Quality', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  { value: 'sustainability', label: 'Sustainability', icon: Leaf, color: 'bg-teal-100 text-teal-800' },
  { value: 'deforestation', label: 'Deforestation', icon: TreePine, color: 'bg-orange-100 text-orange-800' },
]

// Need to import icons used in REPORT_TYPES
import { Shield, CheckCircle2, Leaf, TreePine } from 'lucide-react'

const STATUS_BADGES: Record<string, string> = {
  ready: 'bg-green-100 text-green-800',
  generating: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800',
}

const CHART_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#9ca3af', '#3b82f6']

interface Report {
  id: string
  title?: string
  reportType: string
  status: string
  format?: string
  dateRangeStart?: string
  dateRangeEnd?: string
  lastGeneratedAt?: string
  createdAt: string
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('')
  const [form, setForm] = useState<any>({ reportType: 'eudr_compliance', format: 'json' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (reportTypeFilter && reportTypeFilter !== 'all') params.set('reportType', reportTypeFilter)
      const res = await fetch(`/api/analytics?${params}`)
      const data = await res.json()
      if (data.success) setReports(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [reportTypeFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    generating: reports.filter(r => r.status === 'generating').length,
    failed: reports.filter(r => r.status === 'failed').length,
  }

  // Mock chart data based on report types
  const complianceByRisk = [
    { name: 'Low', value: 45, fill: '#22c55e' },
    { name: 'Medium', value: 28, fill: '#eab308' },
    { name: 'High', value: 18, fill: '#f97316' },
    { name: 'Critical', value: 9, fill: '#ef4444' },
  ]

  const statusDistribution = [
    { name: 'Compliant', value: 62, fill: '#22c55e' },
    { name: 'Pending', value: 20, fill: '#eab308' },
    { name: 'In Review', value: 12, fill: '#3b82f6' },
    { name: 'Non-Compliant', value: 6, fill: '#ef4444' },
  ]

  const typeDistribution = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.reportType] = (acc[r.reportType] || 0) + 1
      return acc
    }, {})
  ).map(([type, count]) => ({ type: type.replace('_', ' '), count }))

  async function handleGenerate() {
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ reportType: 'eudr_compliance', format: 'json' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this report?')) return
    try {
      await fetch(`/api/analytics/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) { console.error(e) }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" /> Analytics & Reports
              </h1>
              <p className="text-sm text-muted-foreground">Advanced analytics dashboard and report generation</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Generate Report</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={form.reportType} onValueChange={v => setForm({ ...form, reportType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Report title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Date Range Start</label><Input type="date" value={form.dateRangeStart || ''} onChange={e => setForm({ ...form, dateRangeStart: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Date Range End</label><Input type="date" value={form.dateRangeEnd || ''} onChange={e => setForm({ ...form, dateRangeEnd: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select value={form.format} onValueChange={v => setForm({ ...form, format: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerate} className="w-full">Generate Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Report Type Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {REPORT_TYPES.map((type) => {
            const Icon = type.icon
            const count = reports.filter(r => r.reportType === type.value).length
            return (
              <StaggerItem key={type.value}>
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm cursor-pointer" onClick={() => setReportTypeFilter(type.value)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color}`}><Icon className="w-5 h-5" /></div>
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{count} reports</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </MotionCard>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <FadeIn>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Compliance by Risk Level</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={complianceByRisk}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                      {complianceByRisk.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                      {statusDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Filter & Report List */}
        <FadeIn delay={0.2}>
          <div className="flex gap-3 items-center">
            <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Report Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Report Types</SelectItem>
                {REPORT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                  ) : reports.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No reports yet. Generate your first report!</p></TableCell></TableRow>
                  ) : reports.map((report) => (
                    <TableRow key={report.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{report.title || 'Untitled Report'}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{report.reportType?.replace('_', ' ')}</Badge></TableCell>
                      <TableCell><Badge className={`${STATUS_BADGES[report.status] || 'bg-gray-100 text-gray-800'} text-xs capitalize`}>{report.status}</Badge></TableCell>
                      <TableCell className="uppercase text-xs">{report.format || 'json'}</TableCell>
                      <TableCell className="text-xs">
                        {report.dateRangeStart ? new Date(report.dateRangeStart).toLocaleDateString() : '—'} → {report.dateRangeEnd ? new Date(report.dateRangeEnd).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-xs">{report.lastGeneratedAt ? new Date(report.lastGeneratedAt).toLocaleString() : '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {report.status === 'ready' && (
                            <Button variant="ghost" size="sm" className="text-primary"><Download className="w-4 h-4" /></Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(report.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardShell>
  )
}

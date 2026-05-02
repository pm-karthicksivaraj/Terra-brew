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
import { FileText, Plus, Search, Loader2, Eye, FileCheck, Upload, Calendar } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const DOC_TYPE_LABELS: Record<string, string> = {
  eudr_dds: 'EUDR DDS',
  phytosanitary: 'Phytosanitary',
  certificate_of_origin: 'Certificate of Origin',
  commercial_invoice: 'Commercial Invoice',
  bill_of_lading: 'Bill of Lading',
  packing_list: 'Packing List',
  customs_declaration: 'Customs Declaration',
}

const DOC_TYPE_COLORS: Record<string, string> = {
  eudr_dds: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  phytosanitary: 'bg-teal-100 text-teal-800 border-teal-200',
  certificate_of_origin: 'bg-amber-100 text-amber-800 border-amber-200',
  commercial_invoice: 'bg-blue-100 text-blue-800 border-blue-200',
  bill_of_lading: 'bg-purple-100 text-purple-800 border-purple-200',
  packing_list: 'bg-orange-100 text-orange-800 border-orange-200',
  customs_declaration: 'bg-rose-100 text-rose-800 border-rose-200',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
}

const CHART_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6', '#f97316', '#f43f5e']

interface ExportDoc {
  id: string
  documentType: string
  documentNumber: string
  issuingAuthority?: string
  status: string
  issueDate?: string
  expiryDate?: string
  notes?: string
  createdAt: string
}

export default function ExportDocsPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<ExportDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<ExportDoc | null>(null)
  const [form, setForm] = useState({
    documentType: 'eudr_dds',
    documentNumber: '',
    issuingAuthority: '',
    notes: '',
    status: 'draft',
    issueDate: '',
    expiryDate: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter && typeFilter !== 'all') params.set('documentType', typeFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/export-docs?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const filteredItems = items.filter(item => {
    if (typeFilter && typeFilter !== 'all' && item.documentType !== typeFilter) return false
    if (statusFilter && statusFilter !== 'all' && item.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: items.length,
    approved: items.filter(i => i.status === 'approved').length,
    pending: items.filter(i => i.status === 'pending_approval').length,
    draft: items.filter(i => i.status === 'draft').length,
    expired: items.filter(i => i.status === 'expired').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  }

  const typeChartData = Object.keys(DOC_TYPE_LABELS).map((key, i) => ({
    name: DOC_TYPE_LABELS[key],
    value: items.filter(i => i.documentType === key).length,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })).filter(d => d.value > 0)

  async function handleCreate() {
    try {
      const res = await fetch('/api/export-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ documentType: 'eudr_dds', documentNumber: '', issuingAuthority: '', notes: '', status: 'draft', issueDate: '', expiryDate: '' })
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
                <FileCheck className="w-6 h-6 text-primary" /> Export Documentation
              </h1>
              <p className="text-sm text-muted-foreground">Manage export documents and TRACES submissions</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Document</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Export Document</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Type *</label>
                    <Select value={form.documentType} onValueChange={v => setForm({ ...form, documentType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Number *</label>
                    <Input placeholder="DOC-2024-001" value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issuing Authority</label>
                    <Input placeholder="Authority name" value={form.issuingAuthority} onChange={e => setForm({ ...form, issuingAuthority: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Issue Date</label>
                      <Input type="date" value={form.issueDate || ''} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input type="date" value={form.expiryDate || ''} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
                  </div>
                  <Button onClick={handleCreate} className="w-full">Create Document</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Approved', value: stats.approved, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, bg: 'bg-yellow-100', color: 'text-yellow-600' },
            { label: 'Draft', value: stats.draft, bg: 'bg-gray-100', color: 'text-gray-600' },
            { label: 'Expired', value: stats.expired, bg: 'bg-red-100', color: 'text-red-600' },
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
              <Input className="pl-9" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Doc Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doc Types</SelectItem>
                {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
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
                      <TableHead>Document Type</TableHead>
                      <TableHead>Document #</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">Loading...</p></TableCell></TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No documents found</p></TableCell></TableRow>
                    ) : filteredItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Badge className={`${DOC_TYPE_COLORS[item.documentType] || 'bg-gray-100 text-gray-800'} border text-xs`}>
                            {DOC_TYPE_LABELS[item.documentType] || item.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium font-mono text-xs">{item.documentNumber || '—'}</TableCell>
                        <TableCell className="text-sm">{item.issuingAuthority || '—'}</TableCell>
                        <TableCell><Badge className={`${STATUS_COLORS[item.status] || ''} border capitalize text-xs`}>{item.status?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-xs">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-xs">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</TableCell>
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
              <CardHeader><CardTitle className="text-base">Documents by Type</CardTitle></CardHeader>
              <CardContent>
                {typeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={typeChartData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                        {typeChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
            <DialogHeader><DialogTitle>Document Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Type:</span><p><Badge className={`${DOC_TYPE_COLORS[detailItem.documentType]} border`}>{DOC_TYPE_LABELS[detailItem.documentType] || detailItem.documentType}</Badge></p></div>
                  <div><span className="text-muted-foreground">Number:</span><p className="font-mono">{detailItem.documentNumber}</p></div>
                  <div><span className="text-muted-foreground">Status:</span><p><Badge className={`${STATUS_COLORS[detailItem.status]} border capitalize`}>{detailItem.status?.replace('_', ' ')}</Badge></p></div>
                  <div><span className="text-muted-foreground">Authority:</span><p>{detailItem.issuingAuthority || '—'}</p></div>
                  <div><span className="text-muted-foreground">Issue Date:</span><p>{detailItem.issueDate ? new Date(detailItem.issueDate).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">Expiry Date:</span><p>{detailItem.expiryDate ? new Date(detailItem.expiryDate).toLocaleDateString() : '—'}</p></div>
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

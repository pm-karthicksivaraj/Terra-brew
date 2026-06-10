'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserCheck, AlertTriangle, CheckCircle2, Clock, Search, Loader2, Eye,
  Shield, MapPin, FileText, XCircle, ChevronRight, Filter, X,
  Users, Ban, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { toast } from 'sonner'

// ─── Constants ───────────────────────────────────────────────────

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

// ─── Types ───────────────────────────────────────────────────────

interface EudrRecord {
  id: string; complianceId: string; batchId?: string; farmerId?: string; farmLandId?: string;
  status: string; riskLevel: string; deforestationRiskScore?: number;
  satelliteImageryRef?: string; geolocationLat?: number; geolocationLng?: number;
  landUseType?: string; landCoverChangeDate?: string;
  verificationDate?: string; verifiedBy?: string;
  dueDiligenceStatement?: string; tracesCertificateRef?: string;
  validFrom?: string; validUntil?: string;
  notes?: string; metadata?: any; createdAt: string;
  farmer?: { fullName: string; farmerCode?: string }; farmLand?: { farmName: string };
}

interface BuyerRecord {
  id: string; companyName: string; buyerCode?: string; buyerType?: string;
  country?: string; contactPerson?: string; email?: string;
}

// ─── One-Click Verification Logic ────────────────────────────────

function getMissingFields(record: EudrRecord): string[] {
  const missing: string[] = []
  if (record.geolocationLat == null && record.geolocationLng == null) missing.push('Geolocation')
  if (record.deforestationRiskScore == null) missing.push('Risk Score')
  if (!record.farmerId) missing.push('Farmer')
  if (!record.farmLandId) missing.push('Farmland')
  if (!record.verificationDate) missing.push('Verification Date')
  return missing
}

function isFullyVerified(record: EudrRecord): boolean {
  return getMissingFields(record).length === 0
}

// ─── Buyer Portal Page ──────────────────────────────────────────

export default function BuyerPortalPage() {
  const [records, setRecords] = useState<EudrRecord[]>([])
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  // DDS Workflow state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<EudrRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [complianceRes, buyersRes] = await Promise.all([
        fetch('/api/eudr-compliance?pageSize=1000'),
        fetch('/api/buyers?pageSize=1000'),
      ])
      const complianceData = await complianceRes.json()
      const buyersData = await buyersRes.json()
      setRecords(complianceData?.data?.data || complianceData?.data || [])
      setBuyers(buyersData?.data?.data || buyersData?.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // KPI calculations
  const kpis = useMemo(() => {
    const totalSuppliers = buyers.length || records.length
    const compliant = records.filter(r => r.status === 'compliant').length
    const pending = records.filter(r => r.status === 'pending' || r.status === 'in_review').length
    const nonCompliant = records.filter(r => r.status === 'non_compliant').length
    return { totalSuppliers, compliant, pending, nonCompliant }
  }, [records, buyers])

  // Filtered records for table
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (search) {
        const q = search.toLowerCase()
        const farmerName = r.farmer?.fullName || ''
        if (!r.complianceId?.toLowerCase().includes(q) && !farmerName.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (riskFilter !== 'all' && r.riskLevel !== riskFilter) return false
      return true
    })
  }, [records, search, statusFilter, riskFilter])

  // Pending DDS records
  const pendingDDS = useMemo(() => {
    return records.filter(r => r.status === 'pending' && r.dueDiligenceStatement)
  }, [records])

  // Accept DDS
  const handleAccept = async (record: EudrRecord) => {
    setActionLoading(record.id)
    try {
      const res = await fetch(`/api/eudr-compliance/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'compliant' }),
      })
      if (res.ok) {
        toast.success(`DDS for ${record.complianceId} accepted — supplier marked compliant`)
        fetchData()
      } else {
        toast.error('Failed to accept DDS')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  // Reject DDS
  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return
    setActionLoading(rejectTarget.id)
    try {
      const res = await fetch(`/api/eudr-compliance/${rejectTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'non_compliant',
          notes: `Rejected: ${rejectReason.trim()}`,
        }),
      })
      if (res.ok) {
        toast.success(`DDS for ${rejectTarget.complianceId} rejected — supplier marked non-compliant`)
        setRejectDialogOpen(false)
        setRejectTarget(null)
        setRejectReason('')
        fetchData()
      } else {
        toast.error('Failed to reject DDS')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#6D2932' }}>
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#6D2932' }}>Buyer Compliance Portal</h1>
              <p className="text-sm text-muted-foreground">EU Importer Compliance Verification — EUDR Supplier Due Diligence</p>
            </div>
          </div>
        </FadeIn>

        <Separator />

        {/* KPI Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Suppliers', value: kpis.totalSuppliers, icon: Users, bg: 'bg-[#6D2932]/10', color: 'text-[#6D2932]' },
            { label: 'Compliant', value: kpis.compliant, icon: CheckCircle2, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Pending', value: kpis.pending, icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
            { label: 'Non-Compliant', value: kpis.nonCompliant, icon: Ban, bg: 'bg-red-100', color: 'text-red-600' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-4 h-4 ${card.color}`} /></div>
                    <div>
                      <p className="text-xl font-bold font-mono">{card.value}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="overview" className="text-xs">Supplier Compliance</TabsTrigger>
            <TabsTrigger value="dds" className="text-xs">DDS Acceptance</TabsTrigger>
            <TabsTrigger value="verification" className="text-xs">One-Click Verify</TabsTrigger>
          </TabsList>

          {/* ─── Supplier Compliance Table ─────────────────────────── */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <FadeIn>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search by supplier or compliance ID..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Risk" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    {Object.keys(RISK_COLORS).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: '#6D2932' }} /> Supplier Compliance Table
                  </CardTitle>
                  <CardDescription className="text-xs">{filteredRecords.length} records matching filters</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading compliance data...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Supplier Name</TableHead>
                            <TableHead className="text-xs font-mono">Compliance ID</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Risk Level</TableHead>
                            <TableHead className="text-xs">Risk Score</TableHead>
                            <TableHead className="text-xs">Verification Date</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No compliance records found</p>
                              </TableCell>
                            </TableRow>
                          ) : filteredRecords.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="text-xs font-medium">
                                {item.farmer?.fullName || item.farmerId || '—'}
                              </TableCell>
                              <TableCell className="font-mono text-xs font-medium" style={{ color: '#6D2932' }}>
                                {item.complianceId || '—'}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${STATUS_COLORS[item.status] || ''} border capitalize text-xs`}>
                                  {item.status?.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${RISK_COLORS[item.riskLevel] || ''} border capitalize text-xs`}>
                                  {item.riskLevel || '—'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs font-mono">
                                {item.deforestationRiskScore != null ? (
                                  <span className={
                                    item.deforestationRiskScore > 70 ? 'text-red-600 font-bold' :
                                    item.deforestationRiskScore > 40 ? 'text-yellow-600 font-medium' : 'text-green-600'
                                  }>
                                    {item.deforestationRiskScore}/100
                                  </span>
                                ) : '—'}
                              </TableCell>
                              <TableCell className="text-xs font-mono">
                                {item.verificationDate ? new Date(item.verificationDate).toLocaleDateString() : '—'}
                              </TableCell>
                              <TableCell>
                                <a href={`/eudr-compliance/${item.id}`}>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
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
          </TabsContent>

          {/* ─── DDS Acceptance Workflow ──────────────────────────── */}
          <TabsContent value="dds" className="space-y-4 mt-4">
            <FadeIn>
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: '#6D2932' }} /> DDS Acceptance Workflow
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Review and accept or reject Due Diligence Statements from suppliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : pendingDDS.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No pending DDS statements to review</p>
                      <p className="text-xs mt-1">DDS documents awaiting acceptance will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {pendingDDS.map((record) => (
                        <Card key={record.id} className="rounded-lg border-l-4" style={{ borderLeftColor: '#6D2932' }}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium" style={{ color: '#6D2932' }}>
                                    {record.complianceId}
                                  </span>
                                  <Badge className={`${STATUS_COLORS[record.status]} border capitalize text-xs`}>
                                    {record.status?.replace('_', ' ')}
                                  </Badge>
                                  <Badge className={`${RISK_COLORS[record.riskLevel] || ''} border capitalize text-xs`}>
                                    {record.riskLevel || '—'} Risk
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                                  <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{record.farmer?.fullName || '—'}</span></div>
                                  <div><span className="text-muted-foreground">Farm Land:</span> <span className="font-medium">{record.farmLand?.farmName || '—'}</span></div>
                                  <div><span className="text-muted-foreground">Risk Score:</span> <span className="font-mono font-medium">{record.deforestationRiskScore ?? '—'}/100</span></div>
                                  <div><span className="text-muted-foreground">DDS Ref:</span> <span className="font-mono font-medium truncate">{record.dueDiligenceStatement || '—'}</span></div>
                                  {record.geolocationLat != null && record.geolocationLng != null && (
                                    <div className="col-span-2"><span className="text-muted-foreground">Location:</span> <span className="font-mono">{Number(record.geolocationLat).toFixed(4)}, {Number(record.geolocationLng).toFixed(4)}</span></div>
                                  )}
                                </div>
                                {record.notes && (
                                  <p className="text-xs text-muted-foreground italic mt-1">{record.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  className="text-xs gap-1"
                                  style={{ backgroundColor: '#059669', color: 'white' }}
                                  disabled={actionLoading === record.id}
                                  onClick={() => handleAccept(record)}
                                >
                                  {actionLoading === record.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  Accept
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs gap-1"
                                  disabled={actionLoading === record.id}
                                  onClick={() => { setRejectTarget(record); setRejectDialogOpen(true) }}
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* ─── One-Click Verification ──────────────────────────── */}
          <TabsContent value="verification" className="space-y-4 mt-4">
            <FadeIn>
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: '#6D2932' }} /> One-Click Verification
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Instantly verify which records have all required EUDR data fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : records.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No compliance records to verify</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {records.map((record) => {
                        const missing = getMissingFields(record)
                        const verified = missing.length === 0
                        return (
                          <div key={record.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${verified ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'}`}>
                            <div className="mt-0.5 shrink-0">
                              {verified ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-medium" style={{ color: '#6D2932' }}>{record.complianceId}</span>
                                <span className="text-xs text-muted-foreground">—</span>
                                <span className="text-xs font-medium">{record.farmer?.fullName || 'Unknown Supplier'}</span>
                                <Badge className={`${STATUS_COLORS[record.status]} border capitalize text-xs`}>
                                  {record.status?.replace('_', ' ')}
                                </Badge>
                              </div>
                              {verified ? (
                                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                  All required fields present — record is fully verifiable
                                </p>
                              ) : (
                                <div className="mt-1">
                                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">Missing required data:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {missing.map(field => (
                                      <Badge key={field} variant="outline" className="text-xs text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                                        {field}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base" style={{ color: '#6D2932' }}>
                <XCircle className="w-5 h-5 text-red-500" /> Reject DDS
              </DialogTitle>
            </DialogHeader>
            {rejectTarget && (
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-mono font-medium" style={{ color: '#6D2932' }}>{rejectTarget.complianceId}</p>
                  <p className="text-muted-foreground">Supplier: {rejectTarget.farmer?.fullName || '—'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Rejection Reason *</Label>
                  <Textarea
                    placeholder="Enter the reason for rejecting this DDS..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => { setRejectDialogOpen(false); setRejectReason('') }} className="text-xs">Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectTarget?.id}
                className="text-xs gap-1"
              >
                {actionLoading === rejectTarget?.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

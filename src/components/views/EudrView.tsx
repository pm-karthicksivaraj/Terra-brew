'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import * as api from '@/lib/spa-api'
import { AnimatedPage, FadeIn, ScaleIn, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Trash2, Loader2, ShieldAlert, TreePine, ClipboardCheck, FileText,
  Ship, Globe, AlertTriangle, CheckCircle2, Clock, XCircle, ChevronLeft,
} from 'lucide-react'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  compliant: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  non_compliant: { color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

const riskConfig: Record<string, { color: string; pct: number }> = {
  low: { color: 'text-emerald-600', pct: 25 },
  medium: { color: 'text-amber-600', pct: 50 },
  high: { color: 'text-orange-600', pct: 75 },
  critical: { color: 'text-red-600', pct: 95 },
}

// ═══════════════════════════════════════════════════════
// EUDR COMPLIANCE DASHBOARD
// ═══════════════════════════════════════════════════════

export function EudrComplianceView() {
  const { setCurrentView } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEudrCompliances().then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statusCounts = items.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  return (
    <AnimatedPage viewKey="eudr-compliance">
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn><div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-emerald-600" /> EUDR Compliance</h2>
          <p className="text-sm text-muted-foreground">EU Deforestation Regulation compliance tracking</p>
        </div></FadeIn>

        {/* Status Summary Cards */}
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Records', value: items.length, color: 'kpi-emerald' },
            { label: 'Compliant', value: statusCounts.compliant || 0, color: 'kpi-teal' },
            { label: 'Pending Review', value: (statusCounts.pending || 0) + (statusCounts.in_review || 0), color: 'kpi-amber' },
            { label: 'Non-Compliant', value: statusCounts.non_compliant || 0, color: 'kpi-rose' },
          ].map(stat => (
            <StaggerItem key={stat.label}>
              <div className={`rounded-xl p-4 ${stat.color} text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
                <p className="text-2xl font-bold relative z-10">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-white/70 relative z-10">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Quick Actions */}
        <FadeIn delay={0.2}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Deforestation Risk', desc: 'Assess deforestation risk for farmlands', icon: TreePine, view: 'eudr-deforestation' as const, color: 'border-green-200 hover:bg-green-50' },
              { label: 'Due Diligence (DDS)', desc: 'Create Due Diligence Statements', icon: ClipboardCheck, view: 'eudr-dds' as const, color: 'border-blue-200 hover:bg-blue-50' },
              { label: 'Export Documents', desc: 'Manage export documentation', icon: FileText, view: 'export-docs' as const, color: 'border-amber-200 hover:bg-amber-50' },
            ].map(action => (
              <motion.div key={action.label} whileHover={{ y: -2 }}>
                <Card className={`cursor-pointer transition-colors ${action.color}`} onClick={() => setCurrentView(action.view)}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <action.icon className="h-8 w-8 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Compliance Records */}
        <FadeIn delay={0.3}>
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Compliance Records</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map(item => {
                    const sc = statusConfig[item.status] || statusConfig.pending
                    const StatusIcon = sc.icon
                    return (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-emerald-50/30 transition-colors">
                        <StatusIcon className={`h-5 w-5 ${sc.color.split(' ')[1]}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.complianceId || `EUDR-${item.id.slice(-6)}`}</p>
                          <p className="text-xs text-muted-foreground">{item.farmer?.fullName || '—'} · {item.farmLand?.farmName || '—'}</p>
                        </div>
                        <Badge className={sc.color}>{item.status}</Badge>
                        {item.riskLevel && <Badge variant="outline" className={riskConfig[item.riskLevel]?.color}>{item.riskLevel} risk</Badge>}
                      </div>
                    )
                  })}
                  {items.length === 0 && <div className="text-center py-8 text-muted-foreground">No compliance records</div>}
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
// EUDR DEFORESTATION RISK ASSESSMENT
// ═══════════════════════════════════════════════════════

export function EudrDeforestationView() {
  const { currentUser, setCurrentView } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({
    farmLandId: '', riskLevel: 'low', deforestationRiskScore: '', notes: '',
  })
  const [farmLands, setFarmLands] = useState<any[]>([])

  useEffect(() => {
    api.getDeforestationAssessments().then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
    api.getFarmLandsList().then(setFarmLands).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createDeforestationAssessment({ ...form, tenantId: currentUser!.tenantId, assessmentDate: new Date().toISOString() })
      setShowForm(false)
      api.getDeforestationAssessments().then(data => setItems(data.items || data))
    } catch (err: any) { alert(err.message) }
  }

  return (
    <AnimatedPage viewKey="eudr-deforestation">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('eudr-compliance')}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
            <h2 className="text-2xl font-bold flex items-center gap-2"><TreePine className="h-6 w-6 text-green-600" /> Deforestation Risk Assessment</h2>
          </div>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> New Assessment</Button>
        </div></FadeIn>

        {showForm && (
          <FadeIn><Card><CardContent className="p-4">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Farm Land</Label>
                <Select value={form.farmLandId} onValueChange={v => setForm({...form, farmLandId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{farmLands.map(fl => <SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Risk Level</Label>
                <Select value={form.riskLevel} onValueChange={v => setForm({...form, riskLevel: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Risk Score (0-100)</Label><Input type="number" value={form.deforestationRiskScore} onChange={e => setForm({...form, deforestationRiskScore: e.target.value})} /></div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2"><Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">Save Assessment</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent></Card></FadeIn>
        )}

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.1}><div className="space-y-3">
            {items.map(item => {
              const rc = riskConfig[item.riskLevel] || riskConfig.low
              return (
                <Card key={item.id}><CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"><TreePine className="h-6 w-6 text-green-600" /></div>
                  <div className="flex-1">
                    <p className="font-medium">{item.farmLand?.farmName || `Land ${item.farmLandId?.slice(-6)}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={rc.color + ' bg-opacity-10'}>{item.riskLevel} risk</Badge>
                      {item.deforestationRiskScore !== null && <span className="text-xs text-muted-foreground">Score: {item.deforestationRiskScore}/100</span>}
                    </div>
                    <Progress value={item.deforestationRiskScore || rc.pct} className="h-1.5 mt-2 max-w-xs" />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(item.assessmentDate)}</span>
                </CardContent></Card>
              )
            })}
            {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No assessments yet</div>}
          </div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// EUDR DUE DILIGENCE STATEMENT
// ═══════════════════════════════════════════════════════

export function EudrDdsView() {
  const { currentUser, setCurrentView } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ farmerId: '', farmLandId: '', dueDiligenceStatement: '', notes: '' })
  const [farmers, setFarmers] = useState<any[]>([])

  useEffect(() => {
    api.getEudrCompliances().then(data => { setItems((data.items || data).filter((i: any) => i.dueDiligenceStatement)); setLoading(false) }).catch(() => setLoading(false))
    api.getFarmersList().then(setFarmers).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createEudrCompliance({ ...form, tenantId: currentUser!.tenantId, status: 'in_review', riskLevel: 'low' })
      setShowForm(false)
      api.getEudrCompliances().then(data => setItems((data.items || data).filter((i: any) => i.dueDiligenceStatement)))
    } catch (err: any) { alert(err.message) }
  }

  return (
    <AnimatedPage viewKey="eudr-dds">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('eudr-compliance')}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
            <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-blue-600" /> Due Diligence Statements</h2>
          </div>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> New DDS</Button>
        </div></FadeIn>

        {showForm && (
          <FadeIn><Card><CardContent className="p-4">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Farmer</Label>
                <Select value={form.farmerId} onValueChange={v => setForm({...form, farmerId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{farmers.map(f => <SelectItem key={f.id} value={f.id}>{f.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>DDS Document Reference</Label><Input value={form.dueDiligenceStatement} onChange={e => setForm({...form, dueDiligenceStatement: e.target.value})} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="sm:col-span-2 flex gap-2"><Button type="submit" className="bg-emerald-700">Create DDS</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent></Card></FadeIn>
        )}

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.1}><div className="space-y-3">
            {items.map(item => (
              <Card key={item.id}><CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><ClipboardCheck className="h-5 w-5 text-blue-600" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.dueDiligenceStatement || `DDS-${item.id.slice(-6)}`}</p>
                  <p className="text-xs text-muted-foreground">{item.farmer?.fullName || '—'} · {formatDate(item.verificationDate)}</p>
                </div>
                <Badge className={statusConfig[item.status]?.color || 'bg-gray-100'}>{item.status}</Badge>
              </CardContent></Card>
            ))}
            {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No DDS records</div>}
          </div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Pencil, Trash2, Eye, Loader2, Coffee, Route, Printer, CheckCircle2, Package, QrCode, Users, MapPin, Sprout, Baby, Tractor, ScanSearch, FlaskConical, Bug, Wheat, Award, ShieldCheck, Sun, Factory, Store, FileText, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import * as api from '@/lib/api'
import { AnimatedPage, FadeIn, StaggerContainer, StaggerItem, AnimatedCard, ScaleIn } from '@/components/ui/animations'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════

function CultivationSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string, cultivation: any) => void
}) {
  const { selectedModule } = useAppStore()
  const [cultivations, setCultivations] = useState<any[]>([])

  useEffect(() => {
    if (selectedModule) {
      api.getCultivations(selectedModule.id).then(setCultivations).catch(() => {})
    }
  }, [selectedModule])

  const selected = cultivations.find((c) => c.id === value)

  return (
    <FadeIn delay={0.1}>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Link to Cultivation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Select Cultivation <span className="text-red-500">*</span></Label>
          <Select value={value} onValueChange={(v) => {
            const c = cultivations.find((x) => x.id === v)
            onChange(v, c || null)
          }}>
            <SelectTrigger><SelectValue placeholder="Choose a cultivation..." /></SelectTrigger>
            <SelectContent>
              {cultivations.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.farmPlotName} — {c.cultivatedCrop || 'N/A'} ({c.farmer?.fullName || '—'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selected && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Farmer: <strong className="text-foreground">{selected.farmer?.fullName}</strong></span>
            <span>Land: <strong className="text-foreground">{selected.farmLand?.farmName}</strong></span>
          </div>
        )}
      </CardContent>
    </Card>
    </FadeIn>
  )
}

function FormActions({ loading, backView }: { loading: boolean; backView: string }) {
  const { setCurrentView, setSelectedRecord } = useAppStore()
  return (
    <FadeIn delay={0.5}>
    <div className="flex gap-3 justify-end">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="button" variant="outline" onClick={() => { setSelectedRecord(null); setCurrentView(backView as any) }}>
          Cancel
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Record
        </Button>
      </motion.div>
    </div>
    </FadeIn>
  )
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-700', Paid: 'bg-emerald-100 text-emerald-700',
    Disputed: 'bg-red-100 text-red-700', Closed: 'bg-gray-100 text-gray-700',
    Active: 'bg-emerald-100 text-emerald-700', Inactive: 'bg-gray-100 text-gray-700',
    Passed: 'bg-emerald-100 text-emerald-700', Failed: 'bg-red-100 text-red-700',
    Compliant: 'bg-emerald-100 text-emerald-700', 'Non-compliant': 'bg-red-100 text-red-700',
  }
  return <Badge className={colors[status] || 'bg-gray-100 text-gray-700'}>{status || 'N/A'}</Badge>
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ═══════════════════════════════════════════════════════
// 1. NURSERIES
// ═══════════════════════════════════════════════════════

export function NurseriesView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getNurseries(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.cultivation?.farmPlotName?.toLowerCase().includes(search.toLowerCase()) ||
    i.seedlingHealth?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this nursery record?')) return
    try { await api.deleteNursery(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="nurseries">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Nurseries ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('nursery-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Nursery
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by plot, health status..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Plot</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Capacity</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Sowing Date</th>
                  <th className="text-left p-3 font-medium">Health</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Germination</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Transplant</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.cultivation?.farmPlotName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.nurseryCapacity || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.sowingDate)}</td>
                    <td className="p-3">{statusBadge(item.seedlingHealth)}</td>
                    <td className="p-3 hidden lg:table-cell">{item.germinationRate || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{formatDate(item.transplantDate)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('nursery-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No nursery records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function NurseryFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    nurseryCapacity: '', sowingDate: '', germinationRate: '',
    seedlingHealth: '', transplantDate: '',
    wateringSchedule: '', fertilizerApp: '', pestDiseaseChecks: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '',
        farmerId: selectedRecord.farmerId || '',
        farmLandId: selectedRecord.farmLandId || '',
        nurseryCapacity: selectedRecord.nurseryCapacity || '',
        sowingDate: selectedRecord.sowingDate ? selectedRecord.sowingDate.split('T')[0] : '',
        germinationRate: selectedRecord.germinationRate || '',
        seedlingHealth: selectedRecord.seedlingHealth || '',
        transplantDate: selectedRecord.transplantDate ? selectedRecord.transplantDate.split('T')[0] : '',
        wateringSchedule: selectedRecord.wateringSchedule || '',
        fertilizerApp: selectedRecord.fertilizerApp || '',
        pestDiseaseChecks: selectedRecord.pestDiseaseChecks || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) {
        await api.updateNursery(selectedRecord.id, data)
        toast({ title: 'Nursery updated' })
      } else {
        await api.createNursery(data)
        toast({ title: 'Nursery created' })
      }
      setSelectedRecord(null)
      setCurrentView('nurseries')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="nursery-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('nurseries') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Nursery' : 'New Nursery Record'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Nursery Preparation</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Nursery Capacity (#plants)</Label><Input type="number" value={form.nurseryCapacity} onChange={(e) => setForm({ ...form, nurseryCapacity: e.target.value })} /></div>
            <div className="space-y-1"><Label>Sowing Date</Label><Input type="date" value={form.sowingDate} onChange={(e) => setForm({ ...form, sowingDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Germination Rate (%)</Label><Input value={form.germinationRate} onChange={(e) => setForm({ ...form, germinationRate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Seedling Health Status</Label>
              <Select value={form.seedlingHealth} onValueChange={(v) => setForm({ ...form, seedlingHealth: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Poor">Poor</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Transplant Date</Label><Input type="date" value={form.transplantDate} onChange={(e) => setForm({ ...form, transplantDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Nursery Operations</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-1 gap-4">
            <div className="space-y-1"><Label>Watering Schedule</Label><Textarea value={form.wateringSchedule} onChange={(e) => setForm({ ...form, wateringSchedule: e.target.value })} rows={2} /></div>
            <div className="space-y-1"><Label>Fertilizer Application</Label><Textarea value={form.fertilizerApp} onChange={(e) => setForm({ ...form, fertilizerApp: e.target.value })} rows={2} /></div>
            <div className="space-y-1"><Label>Pest/Disease Checks</Label><Textarea value={form.pestDiseaseChecks} onChange={(e) => setForm({ ...form, pestDiseaseChecks: e.target.value })} rows={2} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="nurseries" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 2. LAND PREPARATIONS
// ═══════════════════════════════════════════════════════

export function LandPreparationsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getLandPreparations(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.activity?.toLowerCase().includes(search.toLowerCase()) ||
    i.cultivation?.farmPlotName?.toLowerCase().includes(search.toLowerCase()) ||
    i.implementsUsed?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await api.deleteLandPreparation(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="land-preparations">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Land Preparations ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('land-prep-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by activity, implement..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Plot</th>
                  <th className="text-left p-3 font-medium">Activity</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Implements</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Event Date</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Planting Date</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Compost</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.cultivation?.farmPlotName || '—'}</td>
                    <td className="p-3">{item.activity || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.implementsUsed || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.eventDate)}</td>
                    <td className="p-3 hidden lg:table-cell">{formatDate(item.plantingDate)}</td>
                    <td className="p-3 hidden lg:table-cell">{item.compostApplied ? <Badge className="bg-emerald-100 text-emerald-700">Yes</Badge> : <Badge variant="secondary">No</Badge>}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('land-prep-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function LandPrepFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    eventDate: '', activity: '', implementsUsed: '', compostApplied: false, compostType: '',
    plantingDate: '', plantingMethod: '', seedlingAge: '', plantsPerHa: '', spacing: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '',
        farmerId: selectedRecord.farmerId || '',
        farmLandId: selectedRecord.farmLandId || '',
        eventDate: selectedRecord.eventDate ? selectedRecord.eventDate.split('T')[0] : '',
        activity: selectedRecord.activity || '',
        implementsUsed: selectedRecord.implementsUsed || '',
        compostApplied: selectedRecord.compostApplied || false,
        compostType: selectedRecord.compostType || '',
        plantingDate: selectedRecord.plantingDate ? selectedRecord.plantingDate.split('T')[0] : '',
        plantingMethod: selectedRecord.plantingMethod || '',
        seedlingAge: selectedRecord.seedlingAge || '',
        plantsPerHa: selectedRecord.plantsPerHa || '',
        spacing: selectedRecord.spacing || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) {
        await api.updateLandPreparation(selectedRecord.id, data)
        toast({ title: 'Record updated' })
      } else {
        await api.createLandPreparation(data)
        toast({ title: 'Record created' })
      }
      setSelectedRecord(null); setCurrentView('land-preparations')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="land-prep-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('land-preparations') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Land Preparation' : 'New Land Preparation'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Land Preparation</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Date of Event</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Activity</Label>
              <Select value={form.activity} onValueChange={(v) => setForm({ ...form, activity: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Debushing">Debushing</SelectItem><SelectItem value="Plowing">Plowing</SelectItem><SelectItem value="Leveling">Leveling</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Implements Used</Label>
              <Select value={form.implementsUsed} onValueChange={(v) => setForm({ ...form, implementsUsed: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Bullock">Bullock</SelectItem><SelectItem value="Tractor">Tractor</SelectItem><SelectItem value="Rotovator">Rotovator</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3 pb-1 col-span-full">
              <Switch checked={form.compostApplied} onCheckedChange={(v) => setForm({ ...form, compostApplied: v })} />
              <Label>Compost Applied</Label>
            </div>
            {form.compostApplied && (
              <div className="space-y-1 sm:col-span-2"><Label>Compost Type</Label><Input value={form.compostType} onChange={(e) => setForm({ ...form, compostType: e.target.value })} /></div>
            )}
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Planting</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Planting Date</Label><Input type="date" value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Planting Method</Label>
              <Select value={form.plantingMethod} onValueChange={(v) => setForm({ ...form, plantingMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Hole Planting">Hole Planting</SelectItem><SelectItem value="Transplanting">Transplanting</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Seedling Age (Days)</Label><Input type="number" value={form.seedlingAge} onChange={(e) => setForm({ ...form, seedlingAge: e.target.value })} /></div>
            <div className="space-y-1"><Label>Plants per Ha</Label><Input type="number" value={form.plantsPerHa} onChange={(e) => setForm({ ...form, plantsPerHa: e.target.value })} /></div>
            <div className="space-y-1"><Label>Spacing (cm)</Label><Input value={form.spacing} onChange={(e) => setForm({ ...form, spacing: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="land-preparations" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 3. CROP MONITORINGS
// ═══════════════════════════════════════════════════════

export function CropMonitoringsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getCropMonitorings(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.growthStage?.toLowerCase().includes(search.toLowerCase()) ||
    i.cultivation?.farmPlotName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await api.deleteCropMonitoring(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="crop-monitorings">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Crop Monitorings ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('crop-monitoring-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by growth stage, plot..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Plot</th>
                  <th className="text-left p-3 font-medium">Visit Date</th>
                  <th className="text-left p-3 font-medium">Growth Stage</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Leaf Color</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Soil Moisture</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Alert</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.cultivation?.farmPlotName || '—'}</td>
                    <td className="p-3">{formatDate(item.visitDate)}</td>
                    <td className="p-3"><Badge variant="outline">{item.growthStage || '—'}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{statusBadge(item.leafColorIndex)}</td>
                    <td className="p-3 hidden md:table-cell">{item.soilMoisture || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.alertTriggered ? <Badge className="bg-red-100 text-red-700">Alert</Badge> : '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('crop-monitoring-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function CropMonitoringFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    visitDate: '', growthStage: '', plantHeight: '', canopyCover: '',
    leafColorIndex: '', soilMoisture: '',
    pestInfestation: false, pestType: '', diseaseSymptoms: false, diseaseType: '',
    recommendation: '', alertTriggered: false,
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '', farmerId: selectedRecord.farmerId || '', farmLandId: selectedRecord.farmLandId || '',
        visitDate: selectedRecord.visitDate ? selectedRecord.visitDate.split('T')[0] : '',
        growthStage: selectedRecord.growthStage || '', plantHeight: selectedRecord.plantHeight || '',
        canopyCover: selectedRecord.canopyCover || '', leafColorIndex: selectedRecord.leafColorIndex || '',
        soilMoisture: selectedRecord.soilMoisture || '',
        pestInfestation: selectedRecord.pestInfestation || false, pestType: selectedRecord.pestType || '',
        diseaseSymptoms: selectedRecord.diseaseSymptoms || false, diseaseType: selectedRecord.diseaseType || '',
        recommendation: selectedRecord.recommendation || '', alertTriggered: selectedRecord.alertTriggered || false,
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateCropMonitoring(selectedRecord.id, data); toast({ title: 'Updated' }) }
      else { await api.createCropMonitoring(data); toast({ title: 'Created' }) }
      setSelectedRecord(null); setCurrentView('crop-monitorings')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="crop-monitoring-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('crop-monitorings') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Crop Monitoring' : 'New Crop Monitoring'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Field Visit</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Visit Date</Label><Input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Growth Stage</Label>
              <Select value={form.growthStage} onValueChange={(v) => setForm({ ...form, growthStage: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Vegetative">Vegetative</SelectItem><SelectItem value="Flowering">Flowering</SelectItem><SelectItem value="Cherry Development">Cherry Development</SelectItem><SelectItem value="Ripening">Ripening</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Plant Height (cm)</Label><Input value={form.plantHeight} onChange={(e) => setForm({ ...form, plantHeight: e.target.value })} /></div>
            <div className="space-y-1"><Label>Canopy Cover (%)</Label><Input value={form.canopyCover} onChange={(e) => setForm({ ...form, canopyCover: e.target.value })} /></div>
            <div className="space-y-1"><Label>Leaf Color Index</Label>
              <Select value={form.leafColorIndex} onValueChange={(v) => setForm({ ...form, leafColorIndex: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Green">Green</SelectItem><SelectItem value="Yellow">Yellow</SelectItem><SelectItem value="Red">Red</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Soil Moisture Status</Label>
              <Select value={form.soilMoisture} onValueChange={(v) => setForm({ ...form, soilMoisture: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Dry">Dry</SelectItem><SelectItem value="Adequate">Adequate</SelectItem><SelectItem value="Wet">Wet</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Stress & Pests</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Switch checked={form.pestInfestation} onCheckedChange={(v) => setForm({ ...form, pestInfestation: v })} /><Label>Pest Infestation</Label></div>
            {form.pestInfestation && <div className="space-y-1"><Label>Pest Type</Label><Input value={form.pestType} onChange={(e) => setForm({ ...form, pestType: e.target.value })} /></div>}
            <div className="flex items-center gap-3"><Switch checked={form.diseaseSymptoms} onCheckedChange={(v) => setForm({ ...form, diseaseSymptoms: v })} /><Label>Disease Symptoms</Label></div>
            {form.diseaseSymptoms && <div className="space-y-1"><Label>Disease Type</Label><Input value={form.diseaseType} onChange={(e) => setForm({ ...form, diseaseType: e.target.value })} /></div>}
            <div className="space-y-1"><Label>Recommendation</Label><Textarea value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.alertTriggered} onCheckedChange={(v) => setForm({ ...form, alertTriggered: v })} /><Label>Alert Triggered</Label></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="crop-monitorings" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 4. FERTILIZER APPLICATIONS
// ═══════════════════════════════════════════════════════

export function FertilizerAppsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getFertilizerApps(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.fertilizerType?.toLowerCase().includes(search.toLowerCase()) ||
    i.product?.toLowerCase().includes(search.toLowerCase()) ||
    i.cultivation?.farmPlotName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await api.deleteFertilizerApp(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="fertilizer-apps">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Fertilizer Applications ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('fertilizer-app-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by type, product..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Plot</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Product</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">App Date</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Dose</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Total Cost</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.cultivation?.farmPlotName || '—'}</td>
                    <td className="p-3"><Badge variant="outline">{item.fertilizerType || '—'}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{item.product || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.applicationDate)}</td>
                    <td className="p-3 hidden lg:table-cell">{item.dosePerHa ? `${item.dosePerHa} kg/Ha` : '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.totalCost ? `$${item.totalCost}` : '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('fertilizer-app-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function FertilizerAppFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    soilTestDate: '', ph: '', nitrogen: '', phosphorus: '', potassium: '',
    applicationDate: '', fertilizerType: '', product: '', dosePerHa: '',
    appliedQty: '', costPerUnit: '', totalCost: '', applicationMethod: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '', farmerId: selectedRecord.farmerId || '', farmLandId: selectedRecord.farmLandId || '',
        soilTestDate: selectedRecord.soilTestDate ? selectedRecord.soilTestDate.split('T')[0] : '',
        ph: selectedRecord.ph || '', nitrogen: selectedRecord.nitrogen || '', phosphorus: selectedRecord.phosphorus || '', potassium: selectedRecord.potassium || '',
        applicationDate: selectedRecord.applicationDate ? selectedRecord.applicationDate.split('T')[0] : '',
        fertilizerType: selectedRecord.fertilizerType || '', product: selectedRecord.product || '',
        dosePerHa: selectedRecord.dosePerHa || '', appliedQty: selectedRecord.appliedQty || '',
        costPerUnit: selectedRecord.costPerUnit || '', totalCost: selectedRecord.totalCost || '',
        applicationMethod: selectedRecord.applicationMethod || '',
      })
    }
  }, [selectedRecord])

  const calcTotal = () => {
    const q = parseFloat(form.appliedQty) || 0
    const c = parseFloat(form.costPerUnit) || 0
    return q * c > 0 ? (q * c).toFixed(2) : '0'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id, totalCost: calcTotal() }
      if (selectedRecord) { await api.updateFertilizerApp(selectedRecord.id, data); toast({ title: 'Updated' }) }
      else { await api.createFertilizerApp(data); toast({ title: 'Created' }) }
      setSelectedRecord(null); setCurrentView('fertilizer-apps')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="fertilizer-app-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('fertilizer-apps') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Fertilizer Application' : 'New Fertilizer Application'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Nutrient Planning</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Soil Test Date</Label><Input type="date" value={form.soilTestDate} onChange={(e) => setForm({ ...form, soilTestDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>pH</Label><Input value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} /></div>
            <div className="space-y-1"><Label>N (%)</Label><Input value={form.nitrogen} onChange={(e) => setForm({ ...form, nitrogen: e.target.value })} /></div>
            <div className="space-y-1"><Label>P (ppm)</Label><Input value={form.phosphorus} onChange={(e) => setForm({ ...form, phosphorus: e.target.value })} /></div>
            <div className="space-y-1"><Label>K (ppm)</Label><Input value={form.potassium} onChange={(e) => setForm({ ...form, potassium: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Application</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Application Date</Label><Input type="date" value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Fertilizer Type</Label>
              <Select value={form.fertilizerType} onValueChange={(v) => setForm({ ...form, fertilizerType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Chemical">Chemical</SelectItem><SelectItem value="Organic">Organic</SelectItem><SelectItem value="Green Manure">Green Manure</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Product</Label><Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /></div>
            <div className="space-y-1"><Label>Dose (kg/Ha)</Label><Input value={form.dosePerHa} onChange={(e) => setForm({ ...form, dosePerHa: e.target.value })} /></div>
            <div className="space-y-1"><Label>Applied Qty (kg)</Label><Input type="number" value={form.appliedQty} onChange={(e) => setForm({ ...form, appliedQty: e.target.value })} /></div>
            <div className="space-y-1"><Label>Cost per Unit</Label><Input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} /></div>
            <div className="space-y-1"><Label>Total Cost (auto)</Label><Input value={`$${calcTotal()}`} disabled /></div>
            <div className="space-y-1"><Label>Application Method</Label>
              <Select value={form.applicationMethod} onValueChange={(v) => setForm({ ...form, applicationMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Broadcasting">Broadcasting</SelectItem><SelectItem value="Band">Band</SelectItem><SelectItem value="Foliar">Foliar</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="fertilizer-apps" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 5. PEST & DISEASE MANAGEMENT
// ═══════════════════════════════════════════════════════

export function PestDiseaseMgmtsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getPestDiseaseMgmts(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.treatmentType?.toLowerCase().includes(search.toLowerCase()) ||
    i.cultivation?.farmPlotName?.toLowerCase().includes(search.toLowerCase()) ||
    i.pestType?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await api.deletePestDiseaseMgmt(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="pest-disease-mgmts">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Pest & Disease Mgmt ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('pest-disease-mgmt-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by treatment, pest..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Plot</th>
                  <th className="text-left p-3 font-medium">Scouting Date</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Pest</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Severity</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Treatment</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Total Cost</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.cultivation?.farmPlotName || '—'}</td>
                    <td className="p-3">{formatDate(item.scoutingDate)}</td>
                    <td className="p-3 hidden md:table-cell">{item.pestType || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{statusBadge(item.severityLevel)}</td>
                    <td className="p-3 hidden lg:table-cell">{item.treatmentType || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.totalCost ? `$${item.totalCost}` : '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('pest-disease-mgmt-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function PestDiseaseMgmtFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    scoutingDate: '', pestIdentified: false, pestType: '', pestDensity: '',
    diseaseIdentified: false, diseaseType: '', severityLevel: '',
    treatmentDate: '', treatmentType: '', product: '', dose: '',
    equipmentUsed: '', laborCost: '', totalCost: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '', farmerId: selectedRecord.farmerId || '', farmLandId: selectedRecord.farmLandId || '',
        scoutingDate: selectedRecord.scoutingDate ? selectedRecord.scoutingDate.split('T')[0] : '',
        pestIdentified: selectedRecord.pestIdentified || false, pestType: selectedRecord.pestType || '',
        pestDensity: selectedRecord.pestDensity || '', diseaseIdentified: selectedRecord.diseaseIdentified || false,
        diseaseType: selectedRecord.diseaseType || '', severityLevel: selectedRecord.severityLevel || '',
        treatmentDate: selectedRecord.treatmentDate ? selectedRecord.treatmentDate.split('T')[0] : '',
        treatmentType: selectedRecord.treatmentType || '', product: selectedRecord.product || '',
        dose: selectedRecord.dose || '', equipmentUsed: selectedRecord.equipmentUsed || '',
        laborCost: selectedRecord.laborCost || '', totalCost: selectedRecord.totalCost || '',
      })
    }
  }, [selectedRecord])

  const calcTotal = () => {
    const l = parseFloat(form.laborCost) || 0
    return l > 0 ? l.toFixed(2) : '0'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id, totalCost: calcTotal() }
      if (selectedRecord) { await api.updatePestDiseaseMgmt(selectedRecord.id, data); toast({ title: 'Updated' }) }
      else { await api.createPestDiseaseMgmt(data); toast({ title: 'Created' }) }
      setSelectedRecord(null); setCurrentView('pest-disease-mgmts')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="pest-disease-mgmt-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('pest-disease-mgmts') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Pest & Disease Mgmt' : 'New Pest & Disease Record'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Scouting</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Scouting Date</Label><Input type="date" value={form.scoutingDate} onChange={(e) => setForm({ ...form, scoutingDate: e.target.value })} /></div>
              <div className="flex items-end gap-3 pb-1"><Switch checked={form.pestIdentified} onCheckedChange={(v) => setForm({ ...form, pestIdentified: v })} /><Label>Pest Identified</Label></div>
            </div>
            {form.pestIdentified && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Pest Type</Label><Input value={form.pestType} onChange={(e) => setForm({ ...form, pestType: e.target.value })} /></div>
                <div className="space-y-1"><Label>Pest Density</Label><Input value={form.pestDensity} onChange={(e) => setForm({ ...form, pestDensity: e.target.value })} /></div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-end gap-3 pb-1"><Switch checked={form.diseaseIdentified} onCheckedChange={(v) => setForm({ ...form, diseaseIdentified: v })} /><Label>Disease Identified</Label></div>
            </div>
            {form.diseaseIdentified && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Disease Type</Label><Input value={form.diseaseType} onChange={(e) => setForm({ ...form, diseaseType: e.target.value })} /></div>
                <div className="space-y-1"><Label>Severity Level</Label>
                  <Select value={form.severityLevel} onValueChange={(v) => setForm({ ...form, severityLevel: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Treatment</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Treatment Date</Label><Input type="date" value={form.treatmentDate} onChange={(e) => setForm({ ...form, treatmentDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Treatment Type</Label>
              <Select value={form.treatmentType} onValueChange={(v) => setForm({ ...form, treatmentType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Chemical">Chemical</SelectItem><SelectItem value="Bio">Bio</SelectItem><SelectItem value="Mechanical">Mechanical</SelectItem><SelectItem value="Cultural">Cultural</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Product</Label><Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /></div>
            <div className="space-y-1"><Label>Dose</Label><Input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} /></div>
            <div className="space-y-1"><Label>Equipment Used</Label>
              <Select value={form.equipmentUsed} onValueChange={(v) => setForm({ ...form, equipmentUsed: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Knapsack">Knapsack</SelectItem><SelectItem value="Sprayer">Sprayer</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Labor Cost</Label><Input type="number" step="0.01" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })} /></div>
            <div className="space-y-1"><Label>Total Cost (auto)</Label><Input value={`$${calcTotal()}`} disabled /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="pest-disease-mgmts" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 6. HARVEST TRACEABILITIES
// ═══════════════════════════════════════════════════════

export function HarvestTraceabilitiesView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getHarvestTraceabilities(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.processingStage?.toLowerCase().includes(search.toLowerCase()) ||
    i.location?.toLowerCase().includes(search.toLowerCase()) ||
    i.cultivation?.farmPlotName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await api.deleteHarvestTraceability(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="harvest-traceabilities">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Harvest Traceabilities ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('harvest-trace-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by stage, location..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Plot</th>
                  <th className="text-left p-3 font-medium">Harvest Date</th>
                  <th className="text-left p-3 font-medium">Method</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Stage</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Actor</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.cultivation?.farmPlotName || '—'}</td>
                    <td className="p-3">{formatDate(item.actualHarvestDate)}</td>
                    <td className="p-3">{item.harvestMethod || '—'}</td>
                    <td className="p-3 hidden md:table-cell"><Badge variant="outline">{item.processingStage || '—'}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{item.location || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.actor || '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('harvest-trace-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function HarvestTraceFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    plannedHarvestDate: '', estimatedYield: '', actualHarvestDate: '',
    harvestMethod: '', harvestEquipment: '', fieldMoisture: '',
    sampleWeight: '', sampleArea: '', sampleYield: '', estimatedYieldPerHa: '',
    moistureContent: '', defectiveBeans: '', foreignMatter: '',
    processingStage: '', location: '', actor: '', notes: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '', farmerId: selectedRecord.farmerId || '', farmLandId: selectedRecord.farmLandId || '',
        plannedHarvestDate: selectedRecord.plannedHarvestDate ? selectedRecord.plannedHarvestDate.split('T')[0] : '',
        estimatedYield: selectedRecord.estimatedYield || '',
        actualHarvestDate: selectedRecord.actualHarvestDate ? selectedRecord.actualHarvestDate.split('T')[0] : '',
        harvestMethod: selectedRecord.harvestMethod || '', harvestEquipment: selectedRecord.harvestEquipment || '',
        fieldMoisture: selectedRecord.fieldMoisture || '',
        sampleWeight: selectedRecord.sampleWeight || '', sampleArea: selectedRecord.sampleArea || '',
        sampleYield: selectedRecord.sampleYield || '', estimatedYieldPerHa: selectedRecord.estimatedYieldPerHa || '',
        moistureContent: selectedRecord.moistureContent || '', defectiveBeans: selectedRecord.defectiveBeans || '',
        foreignMatter: selectedRecord.foreignMatter || '',
        processingStage: selectedRecord.processingStage || '', location: selectedRecord.location || '',
        actor: selectedRecord.actor || '', notes: selectedRecord.notes || '',
      })
    }
  }, [selectedRecord])

  const sampleYieldCalc = () => {
    const w = parseFloat(form.sampleWeight) || 0
    return w > 0 ? w.toFixed(2) : '0'
  }

  const estYieldCalc = () => {
    const w = parseFloat(form.sampleWeight) || 0
    const a = parseFloat(form.sampleArea) || 0
    if (w > 0 && a > 0) return ((w / a) * 10).toFixed(2)
    return '0'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id, sampleYield: sampleYieldCalc(), estimatedYieldPerHa: estYieldCalc() }
      if (selectedRecord) { await api.updateHarvestTraceability(selectedRecord.id, data); toast({ title: 'Updated' }) }
      else { await api.createHarvestTraceability(data); toast({ title: 'Created' }) }
      setSelectedRecord(null); setCurrentView('harvest-traceabilities')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="harvest-trace-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('harvest-traceabilities') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Harvest Trace' : 'New Harvest Traceability'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Harvest Planning</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Planned Harvest Date</Label><Input type="date" value={form.plannedHarvestDate} onChange={(e) => setForm({ ...form, plannedHarvestDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Estimated Yield (kg/Ha)</Label><Input value={form.estimatedYield} onChange={(e) => setForm({ ...form, estimatedYield: e.target.value })} /></div>
            <div className="space-y-1"><Label>Actual Harvest Date</Label><Input type="date" value={form.actualHarvestDate} onChange={(e) => setForm({ ...form, actualHarvestDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Harvest Method</Label>
              <Select value={form.harvestMethod} onValueChange={(v) => setForm({ ...form, harvestMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Manual">Manual</SelectItem><SelectItem value="Mechanical">Mechanical</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Harvest Equipment</Label><Input value={form.harvestEquipment} onChange={(e) => setForm({ ...form, harvestEquipment: e.target.value })} /></div>
            <div className="space-y-1"><Label>Field Moisture (%)</Label><Input value={form.fieldMoisture} onChange={(e) => setForm({ ...form, fieldMoisture: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Yield Recording</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Sample Weight (kg)</Label><Input type="number" step="0.01" value={form.sampleWeight} onChange={(e) => setForm({ ...form, sampleWeight: e.target.value })} /></div>
            <div className="space-y-1"><Label>Sample Area (sq m)</Label><Input type="number" step="0.01" value={form.sampleArea} onChange={(e) => setForm({ ...form, sampleArea: e.target.value })} /></div>
            <div className="space-y-1"><Label>Sample Yield (auto)</Label><Input value={`${sampleYieldCalc()} kg`} disabled /></div>
            <div className="space-y-1"><Label>Estimated Yield (t/Ha) (auto)</Label><Input value={`${estYieldCalc()} t/Ha`} disabled /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Post-Harvest QC</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Moisture Content (%)</Label><Input value={form.moistureContent} onChange={(e) => setForm({ ...form, moistureContent: e.target.value })} /></div>
            <div className="space-y-1"><Label>Defective Beans (%)</Label><Input value={form.defectiveBeans} onChange={(e) => setForm({ ...form, defectiveBeans: e.target.value })} /></div>
            <div className="space-y-1"><Label>Foreign Matter (%)</Label><Input value={form.foreignMatter} onChange={(e) => setForm({ ...form, foreignMatter: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.4}>
          <Card><CardHeader><CardTitle className="text-base">Traceability Batch</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Processing Stage</Label>
              <Select value={form.processingStage} onValueChange={(v) => setForm({ ...form, processingStage: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Harvested">Harvested</SelectItem><SelectItem value="Depulped">Depulped</SelectItem><SelectItem value="Dried">Dried</SelectItem><SelectItem value="Graded">Graded</SelectItem><SelectItem value="Packaged">Packaged</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Farm">Farm</SelectItem><SelectItem value="Processing Plant">Processing Plant</SelectItem><SelectItem value="Cold Storage">Cold Storage</SelectItem><SelectItem value="Warehouse">Warehouse</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Actor</Label>
              <Select value={form.actor} onValueChange={(v) => setForm({ ...form, actor: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Farmer">Farmer</SelectItem><SelectItem value="Processor">Processor</SelectItem><SelectItem value="Inspector">Inspector</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="harvest-traceabilities" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 7. SMART CONTRACTS
// ═══════════════════════════════════════════════════════

export function SmartContractsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getSmartContracts(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.buyer?.toLowerCase().includes(search.toLowerCase()) ||
    i.batchId?.toLowerCase().includes(search.toLowerCase()) ||
    i.status?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contract?')) return
    try { await api.deleteSmartContract(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="smart-contracts">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Smart Contracts ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('smart-contract-form') }}>
          <Plus className="h-4 w-4 mr-2" /> New Contract
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by buyer, batch ID..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Buyer</th>
                  <th className="text-left p-3 font-medium">Batch ID</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Quantity</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Price</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Total</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const total = ((item.quantity || 0) * (item.pricePerKg || 0)).toFixed(2)
                  return (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-medium">{item.buyer || '—'}</td>
                    <td className="p-3 font-mono text-xs">{item.batchId || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.quantity ? `${item.quantity} kg` : '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.pricePerKg ? `$${item.pricePerKg}/kg` : '—'}</td>
                    <td className="p-3 hidden md:table-cell">${total}</td>
                    <td className="p-3">{statusBadge(item.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('smart-contract-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No contracts found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function SmartContractFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    buyer: '', batchId: '', quantity: '', pricePerKg: '', paymentTerms: '',
    contractDate: '', status: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        buyer: selectedRecord.buyer || '', batchId: selectedRecord.batchId || '',
        quantity: selectedRecord.quantity || '', pricePerKg: selectedRecord.pricePerKg || '',
        paymentTerms: selectedRecord.paymentTerms || '',
        contractDate: selectedRecord.contractDate ? selectedRecord.contractDate.split('T')[0] : '',
        status: selectedRecord.status || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateSmartContract(selectedRecord.id, data); toast({ title: 'Updated' }) }
      else { await api.createSmartContract(data); toast({ title: 'Created' }) }
      setSelectedRecord(null); setCurrentView('smart-contracts')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="smart-contract-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('smart-contracts') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Contract' : 'New Smart Contract'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Contract Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Buyer</Label><Input value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} /></div>
            <div className="space-y-1"><Label>Batch ID</Label><Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} /></div>
            <div className="space-y-1"><Label>Quantity (kg)</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-1"><Label>Price ($/kg)</Label><Input type="number" step="0.01" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} /></div>
            <div className="space-y-1"><Label>Contract Date</Label><Input type="date" value={form.contractDate} onChange={(e) => setForm({ ...form, contractDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Disputed">Disputed</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3"><Label>Payment Terms</Label><Textarea value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} rows={2} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="smart-contracts" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 8. MARKETPLACE
// ═══════════════════════════════════════════════════════

export function MarketplaceView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getMarketplaceListings(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.batchId?.toLowerCase().includes(search.toLowerCase()) ||
    i.availableQty?.toString().includes(search)
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    try { await api.deleteMarketplaceListing(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="marketplace">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Marketplace ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('marketplace-form') }}>
          <Plus className="h-4 w-4 mr-2" /> New Listing
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by batch ID..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Batch ID</th>
                  <th className="text-left p-3 font-medium">Available Qty</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Valid Until</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.batchId || '—'}</td>
                    <td className="p-3">{item.availableQty ? `${item.availableQty} kg` : '—'}</td>
                    <td className="p-3">{item.pricePerKg ? `$${item.pricePerKg}/kg` : '—'}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.priceValidUntil)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('marketplace-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No listings found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function MarketplaceFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    batchId: '', availableQty: '', pricePerKg: '', priceValidUntil: '', buyerRequests: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        batchId: selectedRecord.batchId || '', availableQty: selectedRecord.availableQty || '',
        pricePerKg: selectedRecord.pricePerKg || '',
        priceValidUntil: selectedRecord.priceValidUntil ? selectedRecord.priceValidUntil.split('T')[0] : '',
        buyerRequests: selectedRecord.buyerRequests || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateMarketplaceListing(selectedRecord.id, data); toast({ title: 'Updated' }) }
      else { await api.createMarketplaceListing(data); toast({ title: 'Created' }) }
      setSelectedRecord(null); setCurrentView('marketplace')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="marketplace-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('marketplace') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Listing' : 'New Marketplace Listing'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Listing Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Batch ID</Label><Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} /></div>
            <div className="space-y-1"><Label>Available Quantity (kg)</Label><Input type="number" value={form.availableQty} onChange={(e) => setForm({ ...form, availableQty: e.target.value })} /></div>
            <div className="space-y-1"><Label>Price ($/kg)</Label><Input type="number" step="0.01" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} /></div>
            <div className="space-y-1"><Label>Price Valid Until</Label><Input type="date" value={form.priceValidUntil} onChange={(e) => setForm({ ...form, priceValidUntil: e.target.value })} /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Buyer Requests</Label><Textarea value={form.buyerRequests} onChange={(e) => setForm({ ...form, buyerRequests: e.target.value })} rows={3} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="marketplace" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 9. COFFEE INSPECTION & CERTIFICATION (Unified)
// ═══════════════════════════════════════════════════════

const DEFAULT_ASSESSMENT_QUESTIONS = [
  { category: "Farm Management & Documentation", question: "Farm Management Plan: Do you have a documented farm management plan?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Farm Management & Documentation", question: "Documented Activities: Are all farm activities documented?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Farm Management & Documentation", question: "Traceability System: Is there a system for traceability from farm to point of sale?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Farm Management & Documentation", question: "Worker Registration: Are all workers (including temporary and subcontracted) registered?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest"] },
  { category: "Environmental Protection", question: "Ecosystem Conservation: Is there a plan to conserve natural ecosystems?", points: 10, answer: "Compliant", applicableCerts: ["Rainforest", "USDA", "4C", "UTZ"] },
  { category: "Environmental Protection", question: "Soil Erosion Prevention: Are measures taken to prevent soil erosion?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Environmental Protection", question: "Water Conservation: Is water conservation practiced?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Environmental Protection", question: "Waste Management: Is there a waste management system in place?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Soil Management", question: "Soil Fertility Improvement: Are practices implemented to improve soil fertility?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Soil Management", question: "Soil Testing: Is soil tested regularly?", points: 5, answer: "Compliant", applicableCerts: ["USDA", "Rainforest", "4C", "UTZ", "VietGAP"] },
  { category: "Soil Management", question: "Cover Crops: Are cover crops or mulching used?", points: 5, answer: "Compliant", applicableCerts: ["USDA", "Rainforest", "4C", "UTZ", "VietGAP"] },
  { category: "Pest & Disease Management", question: "Integrated Pest Management (IPM): Is an IPM system in place?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Pest & Disease Management", question: "Approved Pesticides: Are only approved pesticides used?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Fertilizer Use", question: "Approved Fertilizers: Are only approved fertilizers used?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Fertilizer Use", question: "Composting: Is composting practiced?", points: 5, answer: "Compliant", applicableCerts: ["USDA", "Rainforest", "4C", "UTZ", "VietGAP"] },
  { category: "Harvest & Post-Harvest Handling", question: "Hygiene Practices: Are good hygiene practices followed during harvesting?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Harvest & Post-Harvest Handling", question: "Equipment Maintenance: Is equipment cleaned and maintained?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Worker Welfare & Safety", question: "Minimum Wage Compliance: Are workers paid at least minimum wage?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest"] },
  { category: "Worker Welfare & Safety", question: "Child Labor Policy: Is there a policy against child labor?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest"] },
  { category: "Community Relations", question: "Community Support Programs: Are there programs to support the local community?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest"] },
  { category: "Community Relations", question: "Indigenous Rights Policy: Is there a policy to respect indigenous rights?", points: 5, answer: "Compliant", applicableCerts: ["Rainforest"] },
  { category: "Training & Capacity Building", question: "Good Agricultural Practices Training: Are workers trained on good agricultural practices?", points: 10, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "Training & Capacity Building", question: "Certification Training: Are workers given ongoing training on certification requirements?", points: 5, answer: "Compliant", applicableCerts: ["Fair Trade", "Rainforest", "USDA", "4C", "UTZ", "VietGAP", "Halal"] },
  { category: "USDA Organic Specific", question: "Prohibited Substances: Is land free from prohibited substances for 3 years?", points: 10, answer: "Compliant", applicableCerts: ["USDA"] },
  { category: "USDA Organic Specific", question: "Buffer Zones: Are there buffer zones between organic and non-organic fields?", points: 5, answer: "Compliant", applicableCerts: ["USDA"] },
  { category: "Specific Certification Requirements", question: "4C Compliance: Are you compliant with 4C standards?", points: 10, answer: "Compliant", applicableCerts: ["4C"] },
  { category: "Specific Certification Requirements", question: "VietGAP Compliance: Are you compliant with VietGAP standards?", points: 10, answer: "Compliant", applicableCerts: ["VietGAP"] },
  { category: "Specific Certification Requirements", question: "UTZ Compliance: Are you compliant with UTZ standards?", points: 10, answer: "Compliant", applicableCerts: ["UTZ"] },
  { category: "Specific Certification Requirements", question: "Halal Compliance: Are you certified as Halal?", points: 10, answer: "Compliant", applicableCerts: ["Halal"] },
]

function inspectionStatusBadge(status: string) {
  const m: Record<string, string> = {
    Scheduled: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Closed: 'bg-gray-100 text-gray-700',
    Pending: 'bg-orange-100 text-orange-700',
    Active: 'bg-emerald-100 text-emerald-700',
    Expired: 'bg-red-100 text-red-700',
    Suspended: 'bg-red-100 text-red-700',
  }
  return <Badge className={m[status] || 'bg-gray-100 text-gray-700'}>{status || 'N/A'}</Badge>
}

function scoreColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function CoffeeInspectionsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getCoffeeInspections(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.inspectionId?.toLowerCase().includes(search.toLowerCase()) ||
    i.inspectorName?.toLowerCase().includes(search.toLowerCase()) ||
    i.certificationType?.toLowerCase().includes(search.toLowerCase()) ||
    i.inspectionStatus?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inspection?')) return
    try { await api.deleteCoffeeInspection(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="coffee-inspections">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Coffee Inspection & Certification ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('coffee-inspection-form') }}>
          <Plus className="h-4 w-4 mr-2" /> New Inspection
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID, inspector, cert type..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Inspection ID</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Cert Type</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Inspector</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Compliance</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs font-medium">{item.inspectionId}</td>
                    <td className="p-3 hidden md:table-cell"><Badge variant="outline">{item.certificationType || '—'}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{item.inspectorName || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{formatDate(item.inspectionDate)}</td>
                    <td className="p-3">{inspectionStatusBadge(item.inspectionStatus || item.certStatus)}</td>
                    <td className="p-3 hidden lg:table-cell">
                      {item.complianceStatus ? (
                        <span className={`font-semibold ${scoreColor(item.complianceStatus === 'Compliant' ? 100 : item.complianceStatus === 'Partially Compliant' ? 50 : 0)}`}>
                          {item.complianceStatus}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('coffee-inspection-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No inspections found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function CoffeeInspectionFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState<any[]>(DEFAULT_ASSESSMENT_QUESTIONS.map(q => ({ ...q })))
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '',
    certificationType: 'Fair Trade', certifyingBody: '', certificateNo: '', inspectionScope: '',
    certStatus: 'Pending', certIssueDate: '', certExpiryDate: '',
    inspectionType: 'Field', inspectorName: '', inspectionDate: new Date().toISOString().split('T')[0],
    inspectionStatus: 'Scheduled',
    observations: '', nonConformanceIdentified: false, nonConformanceDetails: '',
    correctiveActions: '', actionDueDate: '',
    followUpDate: '', followUpFindings: '', auditReport: '', complianceStatus: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      const r = selectedRecord as any
      setForm({
        cultivationId: r.cultivationId || '', farmerId: r.farmerId || '',
        certificationType: r.certificationType || 'Fair Trade', certifyingBody: r.certifyingBody || '',
        certificateNo: r.certificateNo || '', inspectionScope: r.inspectionScope || '',
        certStatus: r.certStatus || 'Pending', certIssueDate: r.certIssueDate ? r.certIssueDate.split('T')[0] : '',
        certExpiryDate: r.certExpiryDate ? r.certExpiryDate.split('T')[0] : '',
        inspectionType: r.inspectionType || 'Field', inspectorName: r.inspectorName || '',
        inspectionDate: r.inspectionDate ? r.inspectionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        inspectionStatus: r.inspectionStatus || 'Scheduled',
        observations: r.observations || '', nonConformanceIdentified: r.nonConformanceIdentified || false,
        nonConformanceDetails: r.nonConformanceDetails || '', correctiveActions: r.correctiveActions || '',
        actionDueDate: r.actionDueDate ? r.actionDueDate.split('T')[0] : '',
        followUpDate: r.followUpDate ? r.followUpDate.split('T')[0] : '',
        followUpFindings: r.followUpFindings || '', auditReport: r.auditReport || '',
        complianceStatus: r.complianceStatus || '',
      })
      if (r.assessmentChecklist) {
        try {
          const parsed = typeof r.assessmentChecklist === 'string' ? JSON.parse(r.assessmentChecklist) : r.assessmentChecklist
          if (Array.isArray(parsed)) setChecklist(parsed)
        } catch { /* keep defaults */ }
      }
    }
  }, [selectedRecord])

  const toggleAnswer = (idx: number) => {
    setChecklist(prev => prev.map((q, i) => i === idx ? { ...q, answer: q.answer === 'Compliant' ? 'Non-compliant' : 'Compliant' } : q))
  }

  const calcScores = () => {
    let score = 0
    let max = 0
    checklist.forEach(q => {
      if (q.answer === 'Compliant') score += q.points || 0
      max += q.points || 0
    })
    const pct = max > 0 ? (score / max) * 100 : 0
    return { score, max, pct }
  }

  const { score, max, pct } = calcScores()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        moduleId: selectedModule!.id,
      }
      if (selectedRecord) { await api.updateCoffeeInspection(selectedRecord.id, data); toast({ title: 'Inspection updated' }) }
      else { await api.createCoffeeInspection(data); toast({ title: 'Inspection created' }) }
      setSelectedRecord(null); setCurrentView('coffee-inspections')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  // Group checklist by category
  const grouped = checklist.reduce<Record<string, typeof checklist>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {})

  return (
    <AnimatedPage viewKey="coffee-inspection-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('coffee-inspections') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Inspection' : 'New Coffee Inspection'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '' })} />

          {/* Card 1: Certification Details */}
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Certification Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Certification Type</Label>
              <Select value={form.certificationType} onValueChange={(v) => setForm({ ...form, certificationType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fair Trade">Fair Trade</SelectItem>
                  <SelectItem value="Rainforest Alliance">Rainforest Alliance</SelectItem>
                  <SelectItem value="USDA Organic">USDA Organic</SelectItem>
                  <SelectItem value="4C">4C</SelectItem>
                  <SelectItem value="UTZ">UTZ</SelectItem>
                  <SelectItem value="VietGAP">VietGAP</SelectItem>
                  <SelectItem value="Halal">Halal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Certifying Body</Label><Input value={form.certifyingBody} onChange={(e) => setForm({ ...form, certifyingBody: e.target.value })} /></div>
            <div className="space-y-1"><Label>Certificate No</Label><Input value={form.certificateNo} onChange={(e) => setForm({ ...form, certificateNo: e.target.value })} /></div>
            <div className="space-y-1"><Label>Scope</Label><Input value={form.inspectionScope} onChange={(e) => setForm({ ...form, inspectionScope: e.target.value })} /></div>
            <div className="space-y-1"><Label>Cert Status</Label>
              <Select value={form.certStatus} onValueChange={(v) => setForm({ ...form, certStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem><SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem><SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Issue Date</Label><Input type="date" value={form.certIssueDate} onChange={(e) => setForm({ ...form, certIssueDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Expiry Date</Label><Input type="date" value={form.certExpiryDate} onChange={(e) => setForm({ ...form, certExpiryDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          {/* Card 2: Inspection Details */}
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Inspection Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Inspection Type</Label>
              <Select value={form.inspectionType} onValueChange={(v) => setForm({ ...form, inspectionType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Field">Field</SelectItem><SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="External">External</SelectItem><SelectItem value="Surveillance">Surveillance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Inspector Name</Label><Input value={form.inspectorName} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Inspection Date</Label><Input type="date" value={form.inspectionDate} onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Inspection Status</Label>
              <Select value={form.inspectionStatus} onValueChange={(v) => setForm({ ...form, inspectionStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem><SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem><SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>

          {/* Card 3: Assessment Checklist */}
          <FadeIn delay={0.3}>
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Assessment Checklist ({checklist.length} questions)</CardTitle>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>Score: </span>
              <span className={scoreColor(pct)}>{score} / {max} ({pct.toFixed(0)}%)</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
            {Object.entries(grouped).map(([category, questions]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground border-b pb-1">{category} ({questions.reduce((s, q) => s + q.points, 0)} pts)</h4>
                {questions.map((q, idx) => {
                  const globalIdx = checklist.indexOf(q)
                  const isCompliant = q.answer === 'Compliant'
                  return (
                    <div key={globalIdx} className="flex items-start justify-between gap-4 p-3 border rounded-lg hover:bg-muted/30">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{q.question}</p>
                        <div className="flex flex-wrap gap-1">
                          {q.applicableCerts.map((c: string) => (
                            <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">{c}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground w-8 text-right">{q.points}pts</span>
                        <div
                          className={`w-10 h-6 rounded-full flex items-center cursor-pointer transition-colors ${isCompliant ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'}`}
                          onClick={() => toggleAnswer(globalIdx)}
                        >
                          <div className={`w-5 h-5 rounded-full shadow-sm transition-transform ${isCompliant ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </CardContent></Card></FadeIn>

          {/* Card 4: Findings & Observations */}
          <FadeIn delay={0.4}>
          <Card><CardHeader><CardTitle className="text-base">Findings & Observations</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="space-y-1"><Label>Observations</Label><Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} rows={3} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.nonConformanceIdentified} onCheckedChange={(v) => setForm({ ...form, nonConformanceIdentified: v })} /><Label>Non-Conformance Identified</Label></div>
            {form.nonConformanceIdentified && (
              <div className="space-y-1"><Label>Non-Conformance Details</Label><Textarea value={form.nonConformanceDetails} onChange={(e) => setForm({ ...form, nonConformanceDetails: e.target.value })} rows={2} /></div>
            )}
            <div className="space-y-1"><Label>Corrective Actions</Label><Textarea value={form.correctiveActions} onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })} rows={2} /></div>
            <div className="space-y-1 sm:max-w-xs"><Label>Action Due Date</Label><Input type="date" value={form.actionDueDate} onChange={(e) => setForm({ ...form, actionDueDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          {/* Card 5: Follow-up & Audit */}
          <FadeIn delay={0.5}>
          <Card><CardHeader><CardTitle className="text-base">Follow-up & Audit</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Follow-Up Date</Label><Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Audit Report</Label><Textarea value={form.auditReport} onChange={(e) => setForm({ ...form, auditReport: e.target.value })} rows={2} /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Follow-Up Findings</Label><Textarea value={form.followUpFindings} onChange={(e) => setForm({ ...form, followUpFindings: e.target.value })} rows={2} /></div>
          </CardContent></Card></FadeIn>

          {/* Card 6: Quick Checks */}
          <FadeIn delay={0.6}>
          <Card><CardHeader><CardTitle className="text-base">Compliance Status</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Compliance Status</Label>
              <Select value={form.complianceStatus || 'Compliant'} onValueChange={(v) => setForm({ ...form, complianceStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compliant">Compliant</SelectItem><SelectItem value="Non-compliant">Non-compliant</SelectItem>
                  <SelectItem value="Partially Compliant">Partially Compliant</SelectItem><SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>

          <FormActions loading={loading} backView="coffee-inspections" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 11. QR SCAN
// ═══════════════════════════════════════════════════════

export function QRScanView() {
  const { selectedModule, setCurrentView, setSelectedBatch } = useAppStore()
  const [batchId, setBatchId] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedModule) return
    api.getHarvestTraceabilities(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [selectedModule])

  const handleLookup = () => {
    if (!batchId.trim()) return
    const found = items.find(i => i.batchId === batchId.trim())
    if (found) {
      setSelectedBatch(found)
      setCurrentView('trace-journey')
    } else {
      toast({ title: 'Batch not found', variant: 'destructive' })
    }
  }

  return (
    <AnimatedPage viewKey="qr-scan">
    <div className="p-4 md:p-6 space-y-6">
      <FadeIn><h2 className="text-2xl font-bold">QR Scanner / Batch Lookup</h2></FadeIn>
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter Batch ID (e.g. BATCH-001)..." className="pl-10" value={batchId} onChange={(e) => setBatchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLookup()} />
            </div>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={handleLookup}>Look Up</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Batches</h3>
        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {items.slice(0, 12).map(item => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedBatch(item); setCurrentView('trace-journey') }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center"><Package className="h-5 w-5 text-amber-700" /></div>
                    <Badge variant="outline">{item.processingStage || 'Harvested'}</Badge>
                  </div>
                  <p className="font-mono text-sm font-semibold">{item.batchId}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.cultivation?.farmPlotName} — {item.cultivation?.cultivatedCrop}</p>
                  <p className="text-xs text-muted-foreground">{item.farmer?.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(item.actualHarvestDate)}</p>
                </CardContent>
              </Card>
            ))}
            <ScaleIn delay={0.3}>{items.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No batches available. Create harvest records first.</p>}</ScaleIn>
          </div>
        )}
      </div>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 12. TRACE JOURNEY
// ═══════════════════════════════════════════════════════

const STAGE_COLORS: Record<string, string> = {
  'Nursery': 'border-l-emerald-500 bg-emerald-50',
  'Land Preparation': 'border-l-amber-500 bg-amber-50',
  'Crop Monitoring': 'border-l-green-500 bg-green-50',
  'Fertilizer': 'border-l-teal-500 bg-teal-50',
  'Pest & Disease': 'border-l-red-500 bg-red-50',
  'Harvested': 'border-l-orange-500 bg-orange-50',
  'Depulping': 'border-l-yellow-600 bg-yellow-50',
  'Drying': 'border-l-amber-600 bg-amber-50',
  'Milling': 'border-l-stone-500 bg-stone-50',
  'Grading': 'border-l-blue-500 bg-blue-50',
  'Packaging': 'border-l-purple-500 bg-purple-50',
  'Certification': 'border-l-cyan-500 bg-cyan-50',
}

const STAGE_ICONS: Record<string, any> = {
  'Nursery': Coffee, 'Land Preparation': Tractor, 'Crop Monitoring': Search,
  'Fertilizer': FlaskConical, 'Pest & Disease': Bug, 'Harvested': Wheat,
  'Depulping': Package, 'Drying': Sun, 'Milling': Factory,
  'Grading': Award, 'Packaging': Package, 'Certification': ShieldCheck,
}

export function TraceJourneyView() {
  const { selectedBatch, selectedModule, setCurrentView } = useAppStore()
  const [journey, setJourney] = useState<any>(null)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [desktopSelected, setDesktopSelected] = useState<string | null>(null)

  const toggleStage = (key: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  useEffect(() => {
    if (!selectedBatch || !selectedModule) return
    let cancelled = false
    const loadData = async () => {
      try {
        const r = await fetch(`/api/trace-journey?batchId=${encodeURIComponent(selectedBatch.batchId)}&moduleId=${selectedModule.id}`)
        if (cancelled) return
        if (!r.ok) {
          const e = await r.json().catch(() => ({}))
          throw new Error(e.message || 'Failed to load')
        }
        const data = await r.json()
        if (cancelled) return
        setJourney(data)
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    setLoading(true)
    setError('')
    setJourney(null)
    loadData()
    return () => { cancelled = true }
  }, [selectedBatch, selectedModule])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
  if (!selectedBatch) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => setCurrentView('qr-scan')}>← Back to Scanner</Button>
      <p className="text-muted-foreground mt-4">No batch selected. Go back and search for a batch.</p>
    </div>
  )
  if (error) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => setCurrentView('qr-scan')}>← Back</Button>
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
        </CardContent>
      </Card>
    </div>
  )

  const j = journey
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const fmtCurrency = (n: number | null) => n ? new Intl.NumberFormat('vi-VN').format(n) + ' VND' : '—'

  // Timeline stage definitions with category colors
  const stages: { key: string; label: string; icon: any; colorClass: string; bgClass: string; borderClass: string; nodeClass: string; hasData: boolean }[] = [
    { key: 'farmer', label: 'Farmer Registration', icon: Users, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50 border-emerald-200', borderClass: 'border-l-emerald-500', nodeClass: 'bg-emerald-500', hasData: !!j?.farmer },
    { key: 'farmland', label: 'Farm & Land', icon: MapPin, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50/60 border-emerald-200', borderClass: 'border-l-emerald-400', nodeClass: 'bg-emerald-400', hasData: !!j?.farmLand },
    { key: 'cultivation', label: 'Cultivation', icon: Sprout, colorClass: 'text-green-700', bgClass: 'bg-green-50 border-green-200', borderClass: 'border-l-green-500', nodeClass: 'bg-green-500', hasData: !!j?.cultivation },
    { key: 'nursery', label: 'Nursery', icon: Baby, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50/60 border-emerald-200', borderClass: 'border-l-emerald-300', nodeClass: 'bg-emerald-300', hasData: !!j?.nursery },
    { key: 'landprep', label: 'Land Preparation', icon: Tractor, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50/40 border-emerald-200', borderClass: 'border-l-emerald-200', nodeClass: 'bg-emerald-200', hasData: !!j?.landPreparation },
    { key: 'cropmonitor', label: 'Crop Monitoring', icon: ScanSearch, colorClass: 'text-lime-700', bgClass: 'bg-lime-50 border-lime-200', borderClass: 'border-l-lime-500', nodeClass: 'bg-lime-500', hasData: (j?.cropMonitorings?.length || 0) > 0 },
    { key: 'harvest', label: 'Harvest', icon: Wheat, colorClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200', borderClass: 'border-l-amber-500', nodeClass: 'bg-amber-500', hasData: !!j?.harvest },
    { key: 'processing', label: 'Processing', icon: Factory, colorClass: 'text-orange-700', bgClass: 'bg-orange-50 border-orange-200', borderClass: 'border-l-orange-500', nodeClass: 'bg-orange-500', hasData: (j?.processingStages?.length || 0) > 0 },
    { key: 'procurement', label: 'Procurement', icon: Store, colorClass: 'text-purple-700', bgClass: 'bg-purple-50 border-purple-200', borderClass: 'border-l-purple-500', nodeClass: 'bg-purple-500', hasData: !!j?.procurement },
    { key: 'transport', label: 'Transport', icon: Route, colorClass: 'text-purple-700', bgClass: 'bg-purple-50/60 border-purple-200', borderClass: 'border-l-purple-400', nodeClass: 'bg-purple-400', hasData: !!j?.transport },
    { key: 'marketplace', label: 'Marketplace', icon: Coffee, colorClass: 'text-rose-700', bgClass: 'bg-rose-50 border-rose-200', borderClass: 'border-l-rose-500', nodeClass: 'bg-rose-500', hasData: !!j?.marketplace },
    { key: 'certification', label: 'Certification', icon: ShieldCheck, colorClass: 'text-cyan-700', bgClass: 'bg-cyan-50 border-cyan-200', borderClass: 'border-l-cyan-500', nodeClass: 'bg-cyan-500', hasData: (j?.certifications?.inspections?.length || 0) > 0 || (j?.certifications?.assessments?.length || 0) > 0 },
  ]

  // Count completed stages
  const completedCount = stages.filter((s) => s.hasData).length

  // ─── Animation & layout helpers ───
  const circumference = 2 * Math.PI * 34
  const progressOffset = circumference * (1 - completedCount / stages.length)

  const copyBatchId = () => {
    if (j?.batchId) navigator.clipboard.writeText(j.batchId)
  }

  const getStagePeek = (key: string): { label: string; value: string }[] => {
    switch (key) {
      case 'farmer': return j?.farmer ? [
        { label: 'Name', value: j.farmer.fullName },
        { label: 'Code', value: j.farmer.farmerCode || '—' },
        { label: 'Location', value: [j.farmer.district, j.farmer.province].filter(Boolean).join(', ') || '—' },
      ] : []
      case 'farmland': return j?.farmLand ? [
        { label: 'Farm', value: j.farmLand.farmName },
        { label: 'Area', value: j.farmLand.totalLandHolding ? `${j.farmLand.totalLandHolding} Ha` : '—' },
        { label: 'Altitude', value: j.farmLand.altitude ? `${j.farmLand.altitude}m` : '—' },
      ] : []
      case 'cultivation': return j?.cultivation ? [
        { label: 'Crop', value: j.cultivation.cultivatedCrop },
        { label: 'Variety', value: j.cultivation.cropVariety || '—' },
        { label: 'Plot', value: j.cultivation.farmPlotName },
      ] : []
      case 'nursery': return j?.nursery ? [
        { label: 'Variety', value: j.nursery.coffeeVariety },
        { label: 'Capacity', value: j.nursery.nurseryCapacity ? `${j.nursery.nurseryCapacity} plants` : '—' },
        { label: 'Health', value: j.nursery.seedlingHealth },
      ] : []
      case 'landprep': return j?.landPreparation ? [
        { label: 'Activity', value: j.landPreparation.activity },
        { label: 'Date', value: fmtDate(j.landPreparation.eventDate) },
        { label: 'Implements', value: j.landPreparation.implementsUsed || '—' },
      ] : []
      case 'cropmonitor': return (j?.cropMonitorings?.length || 0) > 0 ? [
        { label: 'Visits', value: String(j.cropMonitorings.length) },
        { label: 'Latest Stage', value: j.cropMonitorings[j.cropMonitorings.length - 1]?.growthStage || '—' },
        { label: 'Alerts', value: String(j.cropMonitorings.filter((c: any) => c.alertTriggered).length) },
      ] : []
      case 'harvest': return j?.harvest ? [
        { label: 'Method', value: j.harvest.method },
        { label: 'Date', value: fmtDate(j.harvest.actualDate) },
        { label: 'Cup Score', value: j.harvest.cupScore ? String(j.harvest.cupScore) : '—' },
      ] : []
      case 'processing': return (j?.processingStages?.length || 0) > 0 ? [
        { label: 'Stages', value: `${j.processingStages.length} completed` },
        { label: 'Latest', value: j.processingStages[j.processingStages.length - 1]?.stageType?.replace(/_/g, ' ') || '—' },
        { label: 'Recorded', value: fmtDate(j.processingStages[j.processingStages.length - 1]?.recordedAt) },
      ] : []
      case 'procurement': return j?.procurement ? [
        { label: 'Centre', value: j.procurement.centre || '—' },
        { label: 'Weight', value: `${j.procurement.netWeight?.toLocaleString()} kg` },
        { label: 'Total', value: fmtCurrency(j.procurement.totalAmount) },
      ] : []
      case 'transport': return j?.transport ? [
        { label: 'Vehicle', value: j.transport.vehicle || '—' },
        { label: 'Route', value: j.transport.route || '—' },
        { label: 'Received', value: `${j.transport.receivedWeight?.toLocaleString()} kg` },
      ] : []
      case 'marketplace': return j?.marketplace ? [
        { label: 'Variety', value: j.marketplace.variety },
        { label: 'Available', value: `${j.marketplace.qty?.toLocaleString()} kg` },
        { label: 'Price/kg', value: `${j.marketplace.price?.toLocaleString()} VND` },
      ] : []
      case 'certification': {
        const totalCerts = (j?.certifications?.inspections?.length || 0) + (j?.certifications?.assessments?.length || 0)
        const compliant = j?.certifications?.inspections?.filter((i: any) => i.complianceStatus === 'Compliant').length || 0
        return totalCerts > 0 ? [
          { label: 'Certificates', value: `${totalCerts} total` },
          { label: 'Compliant', value: `${compliant} passed` },
          { label: 'Latest', value: j.certifications.inspections?.[0]?.certificationType || j.certifications.assessments?.[0]?.certificationStandard || '—' },
        ] : []
      }
      default: return []
    }
  }

  // Render the full stage-specific detail content (identical data rendering)
  const renderStageContent = (stageKey: string) => {
    return (
      <>
        {stageKey === 'farmer' && j?.farmer && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Name</span><p className="font-medium">{j.farmer.fullName}</p></div>
            <div><span className="text-xs text-muted-foreground">Code</span><p className="font-mono text-xs">{j.farmer.farmerCode || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Contact</span><p className="text-xs">{j.farmer.contactNumber}</p></div>
            <div><span className="text-xs text-muted-foreground">Location</span><p className="text-xs">{[j.farmer.district, j.farmer.province].filter(Boolean).join(', ')}</p></div>
            <div><span className="text-xs text-muted-foreground">Cooperative</span><p className="text-xs">{j.farmer.cooperative || '—'}</p></div>
            <div className="flex items-center gap-1">
              {j.farmer.isCertified && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Certified</Badge>}
              {j.farmer.creditScore && <Badge variant="outline" className="text-[10px]">Credit: {j.farmer.creditScore}</Badge>}
            </div>
          </div>
        )}

        {stageKey === 'farmland' && j?.farmLand && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Farm Name</span><p className="font-medium">{j.farmLand.farmName}</p></div>
            <div><span className="text-xs text-muted-foreground">Land Area</span><p className="text-xs">{j.farmLand.totalLandHolding ? `${j.farmLand.totalLandHolding} Ha` : '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Altitude</span><p className="text-xs">{j.farmLand.altitude ? `${j.farmLand.altitude}m` : '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Soil Type</span><p className="text-xs">{j.farmLand.soilType || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Irrigation</span><p className="text-xs">{j.farmLand.irrigationType || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Shade Cover</span><p className="text-xs">{j.farmLand.shadeTreeCover ? `${j.farmLand.shadeTreeCover}%` : '—'}</p></div>
          </div>
        )}

        {stageKey === 'cultivation' && j?.cultivation && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Crop</span><p className="font-medium">{j.cultivation.cultivatedCrop}</p></div>
            <div><span className="text-xs text-muted-foreground">Variety</span><p className="text-xs">{j.cultivation.cropVariety || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Species</span><p className="text-xs italic">{j.cultivation.coffeeSpecies || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Plot</span><p className="text-xs">{j.cultivation.farmPlotName}</p></div>
            <div><span className="text-xs text-muted-foreground">Area</span><p className="text-xs">{j.cultivation.cultivationArea ? `${j.cultivation.cultivationArea} Ha` : '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Sowing Date</span><p className="text-xs">{fmtDate(j.cultivation.sowingDate)}</p></div>
          </div>
        )}

        {stageKey === 'nursery' && j?.nursery && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Variety</span><p className="font-medium">{j.nursery.coffeeVariety}</p></div>
            <div><span className="text-xs text-muted-foreground">Capacity</span><p className="text-xs">{j.nursery.nurseryCapacity || '—'} plants</p></div>
            <div><span className="text-xs text-muted-foreground">Sowing</span><p className="text-xs">{fmtDate(j.nursery.sowingDate)}</p></div>
            <div><span className="text-xs text-muted-foreground">Germination</span><p className="text-xs">{j.nursery.germinationRate ? `${j.nursery.germinationRate}%` : '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Health</span><p className="text-xs">{j.nursery.seedlingHealth}</p></div>
            <div><span className="text-xs text-muted-foreground">Survival</span><p className="text-xs">{j.nursery.survivalRate ? `${j.nursery.survivalRate}%` : '—'}</p></div>
          </div>
        )}

        {stageKey === 'landprep' && j?.landPreparation && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Activity</span><p className="font-medium">{j.landPreparation.activity}</p></div>
            <div><span className="text-xs text-muted-foreground">Implements</span><p className="text-xs">{j.landPreparation.implementsUsed || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Date</span><p className="text-xs">{fmtDate(j.landPreparation.eventDate)}</p></div>
            <div><span className="text-xs text-muted-foreground">Compost</span><p className="text-xs">{j.landPreparation.compostApplied ? `${j.landPreparation.compostType || 'Yes'}` : 'No'}</p></div>
            <div><span className="text-xs text-muted-foreground">Planting</span><p className="text-xs">{fmtDate(j.landPreparation.plantingDate)}</p></div>
            <div><span className="text-xs text-muted-foreground">Spacing</span><p className="text-xs">{j.landPreparation.spacing || '—'}</p></div>
          </div>
        )}

        {stageKey === 'cropmonitor' && (j?.cropMonitorings?.length || 0) > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/60 rounded-lg p-2"><p className="text-xs text-muted-foreground">Visits</p><p className="font-bold">{j.cropMonitorings.length}</p></div>
              <div className="bg-white/60 rounded-lg p-2"><p className="text-xs text-muted-foreground">Latest Stage</p><p className="font-bold text-xs">{j.cropMonitorings[j.cropMonitorings.length - 1]?.growthStage}</p></div>
              <div className="bg-white/60 rounded-lg p-2"><p className="text-xs text-muted-foreground">Alerts</p><p className="font-bold text-xs">{j.cropMonitorings.filter((c: any) => c.alertTriggered).length}</p></div>
            </div>
            <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
              {j.cropMonitorings.map((cm: any, ci: number) => (
                <div key={ci} className="bg-white/60 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{fmtDate(cm.visitDate)}</span>
                    <Badge variant="outline" className="text-[10px]">{cm.growthStage}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                    {cm.plantHeight && <span>Height: {cm.plantHeight}m</span>}
                    {cm.canopyCover && <span>Canopy: {cm.canopyCover}%</span>}
                    {cm.ndviIndex && <span>NDVI: {cm.ndviIndex}</span>}
                    {cm.pestInfestation && <span className="text-red-600">Pest: {cm.pestType}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {stageKey === 'harvest' && j?.harvest && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Method</span><p className="font-medium">{j.harvest.method}</p></div>
            <div><span className="text-xs text-muted-foreground">Harvest Date</span><p className="text-xs">{fmtDate(j.harvest.actualDate)}</p></div>
            <div><span className="text-xs text-muted-foreground">Processing</span><p className="text-xs">{j.harvest.processingMethod}</p></div>
            <div><span className="text-xs text-muted-foreground">Cherry Ripeness</span><p className="text-xs">{j.harvest.cherryRipeness ? `${j.harvest.cherryRipeness}%` : '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Moisture</span><p className="text-xs">{j.harvest.moisture ? `${j.harvest.moisture}%` : '—'}</p></div>
            <div className="flex items-center gap-2">
              {j.harvest.cupScore && <Badge className="bg-amber-100 text-amber-700">Cup: {j.harvest.cupScore}</Badge>}
              {j.harvest.defectiveBeans && <Badge variant="outline" className="text-[10px]">Defects: {j.harvest.defectiveBeans}%</Badge>}
            </div>
            {j.harvest.notes && <p className="col-span-full text-xs text-muted-foreground italic">{j.harvest.notes}</p>}
          </div>
        )}

        {stageKey === 'processing' && (j?.processingStages?.length || 0) > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {j.processingStages.map((ps: any, pi: number) => (
                <Badge key={pi} variant="outline" className="text-xs bg-white/80 border-orange-200 text-orange-700">
                  {ps.stageType?.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
            <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
              {j.processingStages.map((ps: any, pi: number) => (
                <div key={pi} className="bg-white/70 rounded-lg p-3 border border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-xs text-orange-700">{ps.stageType?.replace(/_/g, ' ')}</h5>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(ps.recordedAt)}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
                    {ps.stageData && Object.entries(ps.stageData)
                      .filter(([, v]) => v != null && v !== '')
                      .slice(0, 6)
                      .map(([key, val]) => (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">{String(key).replace(/([A-Z])/g, ' $1')}</span>
                          <p className="font-medium truncate">{typeof val === 'number' ? val.toLocaleString() : String(val).slice(0, 30)}</p>
                        </div>
                      ))}
                  </div>
                  {ps.notes && <p className="text-[11px] text-muted-foreground italic mt-1">{ps.notes}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {stageKey === 'procurement' && j?.procurement && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Centre</span><p className="font-medium">{j.procurement.centre || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Date</span><p className="text-xs">{fmtDate(j.procurement.date)}</p></div>
            <div><span className="text-xs text-muted-foreground">Net Weight</span><p className="font-bold">{j.procurement.netWeight?.toLocaleString()} kg</p></div>
            <div><span className="text-xs text-muted-foreground">Price/kg</span><p className="text-xs">{j.procurement.pricePerKg?.toLocaleString()} VND</p></div>
            <div><span className="text-xs text-muted-foreground">Total</span><p className="font-bold text-purple-700">{fmtCurrency(j.procurement.totalAmount)}</p></div>
            <div><span className="text-xs text-muted-foreground">Payment</span><p><Badge className={j.procurement.paymentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{j.procurement.paymentStatus}</Badge></p></div>
          </div>
        )}

        {stageKey === 'transport' && j?.transport && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Vehicle</span><p className="font-mono font-medium">{j.transport.vehicle || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Driver</span><p className="text-xs">{j.transport.driver || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Route</span><p className="text-xs">{j.transport.route || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Departure</span><p className="text-xs">{fmtDate(j.transport.departure)}</p></div>
            <div><span className="text-xs text-muted-foreground">Arrival</span><p className="text-xs">{fmtDate(j.transport.arrival)}</p></div>
            <div><span className="text-xs text-muted-foreground">Received</span><p className="font-bold">{j.transport.receivedWeight?.toLocaleString()} kg</p></div>
          </div>
        )}

        {stageKey === 'marketplace' && j?.marketplace && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div><span className="text-xs text-muted-foreground">Variety</span><p className="font-medium">{j.marketplace.variety}</p></div>
            <div><span className="text-xs text-muted-foreground">Process</span><p className="text-xs">{j.marketplace.processingMethod || '—'}</p></div>
            <div><span className="text-xs text-muted-foreground">Available</span><p className="font-bold">{j.marketplace.qty?.toLocaleString()} kg</p></div>
            <div><span className="text-xs text-muted-foreground">Price/kg</span><p className="font-bold text-rose-700">{j.marketplace.price?.toLocaleString()} VND</p></div>
            <div><span className="text-xs text-muted-foreground">Listed</span><p className="text-xs">{fmtDate(j.marketplace.listingDate)}</p></div>
            <div><span className="text-xs text-muted-foreground">Valid Until</span><p className="text-xs">{fmtDate(j.marketplace.validUntil)}</p></div>
            {j.marketplace.certLabels && <div className="col-span-full"><span className="text-xs text-muted-foreground">Labels</span><div className="flex flex-wrap gap-1 mt-1">{String(j.marketplace.certLabels).split(',').map((l: string, i: number) => <Badge key={i} variant="outline" className="text-[10px] bg-white/80">{l.trim()}</Badge>)}</div></div>}
          </div>
        )}

        {stageKey === 'certification' && j?.certifications && (
          <div className="space-y-3">
            {j.certifications.inspections?.map((insp: any, i: number) => (
              <div key={i} className="bg-white/60 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{insp.certificationType}</span>
                  <Badge className={insp.complianceStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>{insp.complianceStatus}</Badge>
                </div>
                <p className="text-muted-foreground">Body: {insp.certifyingBody}</p>
                <p className="text-muted-foreground">Certificate: {insp.certificateNo}</p>
                <div className="flex gap-4 text-muted-foreground">
                  <span>Issued: {fmtDate(insp.certIssueDate)}</span>
                  <span>Expires: {fmtDate(insp.certExpiryDate)}</span>
                </div>
              </div>
            ))}
            {j.certifications.assessments?.map((ca: any, i: number) => (
              <div key={`a-${i}`} className="bg-white/60 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ca.certificationStandard}</span>
                  <Badge variant="outline">{ca.certificationOutcome}</Badge>
                </div>
                <p className="text-muted-foreground">Score: <strong>{ca.totalScorePercentage}%</strong> · Assessor: {ca.assessorName}</p>
                <p className="text-muted-foreground">Date: {fmtDate(ca.assessmentDate)}</p>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <AnimatedPage viewKey="trace-journey">
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">

      {/* ─── Back button + title ─── */}
      <FadeIn>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('qr-scan')}>← Back</Button>
        <h2 className="text-2xl font-bold">Trace Journey</h2>
      </div>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO BATCH CARD                                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FadeIn delay={0.1}>
      <motion.div
        className="relative overflow-hidden rounded-2xl shadow-xl"
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Animated particle dot grid background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
          </svg>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
              style={{ left: `${8 + i * 12}%`, top: `${15 + (i % 4) * 22}%` }}
              animate={{ y: [0, -12, 0], opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
            />
          ))}
        </div>

        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-amber-200/70 text-[10px] font-semibold uppercase tracking-[0.2em]">Batch ID</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-xl md:text-2xl font-mono font-bold tracking-tight">{j?.batchId}</p>
                  <motion.button
                    onClick={copyBatchId}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Copy batch ID"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </motion.button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-amber-100/90 text-sm">
                {j?.farmer && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {j.farmer.fullName}</span>}
                {j?.cultivation && <span className="flex items-center gap-1"><Sprout className="h-3.5 w-3.5" /> {j.cultivation.cultivatedCrop}</span>}
                {j?.harvest?.cupScore && <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Cup: {j.harvest.cupScore}</span>}
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* Animated circular progress ring */}
              <div className="relative flex items-center">
                <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                  <motion.circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: progressOffset }}
                    transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{completedCount}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-amber-200/70 text-xs font-medium">of {stages.length} stages</p>
                <p className="text-sm font-semibold">Complete</p>
                {j?.contract && (
                  <Badge className="bg-white/20 text-white border-0 text-[10px] mt-1">{j.contract.status}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="h-1.5 bg-muted/50">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / stages.length) * 100}%` }}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DESKTOP: Horizontal Scrollable Timeline                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <FadeIn delay={0.2}>
          <div className="overflow-x-auto pb-3 -mx-2 px-2">
            <div className="relative flex items-start min-w-max px-4 pt-8 pb-4">
              {/* Animated connecting line */}
              <motion.div
                className="absolute top-[26px] left-4 right-4 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 via-40% via-amber-400 via-60% via-orange-500 via-70% via-purple-500 via-85% to-cyan-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />

              {stages.map((stage, idx) => {
                const Icon = stage.icon
                const isSelected = desktopSelected === stage.key

                return (
                  <div
                    key={stage.key}
                    className="flex flex-col items-center flex-shrink-0"
                    style={{ width: 96, marginLeft: idx === 0 ? 0 : 20 }}
                  >
                    {/* Waypoint node */}
                    <motion.button
                      className="relative z-10 focus:outline-none group"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.1, type: 'spring', damping: 20, stiffness: 260 }}
                      onClick={() => setDesktopSelected(isSelected ? null : stage.key)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Pulse ring for completed stages */}
                      {stage.hasData && (
                        <motion.div
                          className={`absolute inset-[-4px] rounded-full ${stage.nodeClass} opacity-0`}
                          animate={{ scale: [1, 1.5], opacity: [0.25, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: idx * 0.2 }}
                        />
                      )}

                      <div className={`w-14 h-14 rounded-full border-[3px] shadow-lg flex items-center justify-center transition-all duration-300 ${
                        stage.hasData
                          ? `${stage.nodeClass} ${isSelected ? 'ring-4 ring-offset-2 ring-amber-300/60 shadow-xl' : 'border-white'}`
                          : 'bg-gray-100 border-gray-200'
                      }`}>
                        <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:rotate-12 ${stage.hasData ? 'text-white' : 'text-gray-400'}`} />
                      </div>

                      {/* Completed checkmark badge */}
                      {stage.hasData && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1, type: 'spring', damping: 12 }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Label */}
                    <p className={`text-[11px] font-medium mt-2.5 text-center leading-tight max-w-[88px] transition-colors duration-200 ${
                      isSelected ? stage.colorClass : stage.hasData ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {stage.label}
                    </p>

                    {/* Status indicator */}
                    <motion.div
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full transition-colors duration-200 ${isSelected ? stage.nodeClass : stage.hasData ? stage.nodeClass + '/60' : 'bg-gray-300'}`}
                      animate={stage.hasData ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.15 }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Selected stage detail card (desktop) */}
        <AnimatePresence mode="wait">
          {desktopSelected && (() => {
            const stage = stages.find(s => s.key === desktopSelected)
            if (!stage) return null
            const Icon = stage.icon
            const isExpanded = expandedStages.has(stage.key)
            const peek = getStagePeek(stage.key)

            return (
              <motion.div
                key={desktopSelected}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-4"
              >
                <motion.div
                  className={`rounded-2xl border overflow-hidden backdrop-blur-lg shadow-lg ${
                    stage.hasData
                      ? 'bg-white/90 border-white/80'
                      : 'bg-gray-50/90 border-gray-200/80'
                  }`}
                  layout
                >
                  {/* Glassmorphism card header */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${stage.hasData ? stage.nodeClass : 'bg-gray-200'}`}
                          whileHover={{ rotate: 8, scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <Icon className={`h-5 w-5 ${stage.hasData ? 'text-white' : 'text-gray-400'}`} />
                        </motion.div>
                        <div>
                          <h4 className={`font-semibold text-base ${stage.hasData ? stage.colorClass : 'text-gray-500'}`}>{stage.label}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {stage.hasData ? (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-200 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3 mr-0.5" /> Complete
                              </Badge>
                            ) : (
                              <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">No data yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setDesktopSelected(null)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    {stage.hasData && (
                      <AnimatePresence mode="wait">
                        {!isExpanded && peek.length > 0 ? (
                          <motion.div
                            key="peek"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {/* Peek metrics */}
                            <div className="flex flex-wrap gap-2.5 mb-2">
                              {peek.map((metric, i) => (
                                <motion.div
                                  key={i}
                                  className="bg-white/70 rounded-xl px-3.5 py-2.5 shadow-sm border border-gray-100/50"
                                  whileHover={{ y: -2, boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)' }}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <p className="text-[10px] text-muted-foreground font-medium">{metric.label}</p>
                                  <p className="text-sm font-bold text-gray-800">{metric.value}</p>
                                </motion.div>
                              ))}
                            </div>
                            <button
                              className="text-xs text-amber-600 hover:text-amber-700 font-semibold mt-1 flex items-center gap-1 transition-colors duration-200"
                              onClick={() => toggleStage(stage.key)}
                            >
                              View full details
                              <motion.svg
                                className="h-3.5 w-3.5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                animate={{ y: [0, 3, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="text-sm text-gray-700 space-y-2 pt-1">
                              {renderStageContent(stage.key)}
                            </div>
                            <button
                              className="text-xs text-gray-400 hover:text-gray-600 font-medium mt-3 flex items-center gap-1 transition-colors duration-200"
                              onClick={() => toggleStage(stage.key)}
                            >
                              <motion.svg
                                className="h-3.5 w-3.5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                              </motion.svg>
                              Show less
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* Hint when no stage is selected on desktop */}
        {!desktopSelected && (
          <motion.div
            className="text-center py-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p>Click on a stage above to view details</p>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE: Vertical Timeline                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <StaggerContainer>
        <div className="relative">
          {/* Animated vertical connecting line */}
          <motion.div
            className="absolute left-[23px] top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b from-emerald-400 via-lime-400 via-40% via-amber-400 via-60% via-orange-500 via-70% via-purple-500 via-85% to-cyan-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          />

          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const Icon = stage.icon
              const isExpanded = expandedStages.has(stage.key)
              const peek = getStagePeek(stage.key)

              return (
                <StaggerItem key={stage.key}>
                <div className="relative flex gap-4">

                  {/* ─── Animated node ─── */}
                  <motion.div
                    className="relative z-10 flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.06, type: 'spring', damping: 20, stiffness: 260 }}
                  >
                    {/* Pulse ring for completed stages */}
                    {stage.hasData && (
                      <motion.div
                        className={`absolute -inset-1.5 rounded-full ${stage.nodeClass} opacity-0`}
                        animate={{ scale: [1, 1.6], opacity: [0.2, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.15 }}
                      />
                    )}

                    {stage.hasData ? (
                      <div className={`w-12 h-12 rounded-full border-[3px] border-white shadow-md flex items-center justify-center transition-all duration-300 ${stage.nodeClass}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}

                    {/* Completed checkmark */}
                    {stage.hasData && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.06, type: 'spring', damping: 12, stiffness: 300 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* ─── Content card ─── */}
                  <motion.div
                    className={`flex-1 min-w-0 rounded-xl border overflow-hidden ${
                      stage.hasData
                        ? 'bg-white/80 backdrop-blur-md border-white/70 shadow-sm'
                        : 'bg-gray-50/60 border-gray-200 border-dashed opacity-50'
                    }`}
                    layout
                    onClick={() => stage.hasData && toggleStage(stage.key)}
                    whileHover={stage.hasData ? {
                      y: -2,
                      boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1)',
                      transition: { type: 'spring', stiffness: 300, damping: 25 },
                    } : {}}
                  >
                    <div className="p-3.5">
                      {/* Stage header row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${stage.hasData ? stage.colorClass : 'text-gray-400'}`} />
                          <h4 className={`text-sm font-semibold ${stage.hasData ? stage.colorClass : 'text-gray-400'}`}>
                            {stage.label}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {stage.hasData ? (
                            <Badge variant="outline" className="text-[9px] bg-emerald-50/80 border-emerald-200 text-emerald-700 px-1.5 py-0">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Done
                            </Badge>
                          ) : (
                            <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Pending</span>
                          )}
                          {stage.hasData && (
                            <motion.svg
                              className="h-3.5 w-3.5 text-gray-400 ml-1"
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </motion.svg>
                          )}
                        </div>
                      </div>

                      {/* Peek preview or expanded detail */}
                      <AnimatePresence mode="wait">
                        {!isExpanded && stage.hasData && peek.length > 0 && (
                          <motion.div
                            key={`peek-${stage.key}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-2 mt-2.5 overflow-x-auto pb-1"
                          >
                            {peek.slice(0, 3).map((metric, i) => (
                              <div key={i} className="bg-gray-50/80 rounded-lg px-2.5 py-1.5 flex-shrink-0 border border-gray-100/50">
                                <p className="text-[9px] text-muted-foreground font-medium">{metric.label}</p>
                                <p className="text-xs font-bold truncate max-w-[80px]">{metric.value}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                        {isExpanded && stage.hasData && (
                          <motion.div
                            key={`expanded-${stage.key}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="mt-3 text-sm text-gray-700 space-y-2 overflow-hidden"
                          >
                            {renderStageContent(stage.key)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                </div>
                </StaggerItem>
              )
            })}
          </div>
        </div>
        </StaggerContainer>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SMART CONTRACT                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {j?.contract && (
        <FadeIn delay={0.8}>
        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50/50 to-orange-50/30 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
        >
          {/* Blockchain chain-link pattern overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.035]" aria-hidden="true">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="chain-link-pattern" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                  <circle cx="18" cy="18" r="3" fill="currentColor" />
                  <line x1="18" y1="3" x2="18" y2="15" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="3" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="21" y1="18" x2="33" y2="18" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="18" y1="21" x2="18" y2="33" stroke="currentColor" strokeWidth="1.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#chain-link-pattern)" className="text-rose-700" />
            </svg>
          </div>

          <CardHeader className="pb-2 pt-5 relative">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shadow-sm">
                <FileText className="h-4 w-4 text-rose-600" />
              </div>
              <span className="font-semibold">Smart Contract</span>
              <div className="flex items-center gap-1.5 ml-auto text-[10px] text-rose-400 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Blockchain Verified
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pb-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-xs text-muted-foreground">Buyer</span><p className="font-medium">{j.contract.buyer}</p></div>
              <div><span className="text-xs text-muted-foreground">Quantity</span><p className="font-bold">{j.contract.quantity?.toLocaleString()} kg</p></div>
              <div><span className="text-xs text-muted-foreground">Price/kg</span><p className="font-bold text-rose-700">{j.contract.pricePerKg?.toLocaleString()} VND</p></div>
              <div><span className="text-xs text-muted-foreground">Terms</span><p className="text-xs">{j.contract.paymentTerms || '—'}</p></div>
            </div>
          </CardContent>
        </motion.div>
        </FadeIn>
      )}

    </div>

    </AnimatedPage>
  )
}


// ═══════════════════════════════════════════════════════
// 13. QR LABEL
// ═══════════════════════════════════════════════════════

export function QRLabelView() {
  const { selectedModule } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [qrMap, setQrMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedModule) return
    api.getHarvestTraceabilities(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [selectedModule])

  const generateQR = async (item: any) => {
    const qrData = JSON.stringify({ batchId: item.batchId, farmer: item.farmer?.fullName, crop: item.cultivation?.cultivatedCrop, plot: item.cultivation?.farmPlotName })
    try {
      const res = await api.getQRCode(qrData)
      setQrMap(prev => ({ ...prev, [item.id]: res.qr }))
    } catch {}
  }

  const handlePrint = (item: any, qrSrc: string) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Label - ${item.batchId}</title>
      <style>body{font-family:sans-serif;padding:20px;display:flex;gap:20px;align-items:flex-start;}
      .label{border:2px solid #333;padding:16px;max-width:400px;}
      h2{margin:0 0 8px;} p{margin:4px 0;font-size:14px;}
      img{width:120px;height:120px;}</style></head>
      <body><div class="label">
        <h2>${item.batchId}</h2>
        <p><strong>Farmer:</strong> ${item.farmer?.fullName || 'N/A'}</p>
        <p><strong>Crop:</strong> ${item.cultivation?.cultivatedCrop || 'N/A'}</p>
        <p><strong>Plot:</strong> ${item.cultivation?.farmPlotName || 'N/A'}</p>
        <p><strong>Stage:</strong> ${item.processingStage || 'N/A'}</p>
        <p><strong>Date:</strong> ${item.actualHarvestDate ? new Date(item.actualHarvestDate).toLocaleDateString() : 'N/A'}</p>
      </div>
      ${qrSrc ? `<img src="${qrSrc}" alt="QR Code" />` : ''}
      </body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <AnimatedPage viewKey="qr-label">
    <div className="p-4 md:p-6 space-y-4">
      <FadeIn><h2 className="text-2xl font-bold">Print Labels</h2></FadeIn>
      {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="font-mono font-semibold text-sm">{item.batchId}</p>
                  <p className="text-xs text-muted-foreground">{item.farmer?.fullName} — {item.cultivation?.cultivatedCrop}</p>
                </div>
                {qrMap[item.id] ? (
                  <div className="flex items-center gap-4">
                    <img src={qrMap[item.id]} alt="QR" className="w-24 h-24 rounded border" />
                    <Button variant="outline" size="sm" onClick={() => handlePrint(item, qrMap[item.id])}>
                      <Printer className="h-4 w-4 mr-1" />Print
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => generateQR(item)}>
                    <QrCode className="h-4 w-4 mr-1" />Generate QR
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          <ScaleIn delay={0.3}>{items.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No harvest records to generate labels for.</p>}</ScaleIn>
        </div>
      )}
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 14. COFFEE PROCESSING
// ═══════════════════════════════════════════════════════

export function CoffeeProcessingView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedModule) return
    api.getCoffeeProcessing(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [selectedModule])

  const stageColor = (stage: string) => {
    const m: Record<string, string> = {
      'Harvested': 'bg-orange-100 text-orange-700', 'Depulping': 'bg-yellow-100 text-yellow-700',
      'Drying': 'bg-amber-100 text-amber-700', 'Milling': 'bg-stone-100 text-stone-700',
      'Grading': 'bg-blue-100 text-blue-700', 'Packaging': 'bg-purple-100 text-purple-700',
    }
    return m[stage] || 'bg-gray-100 text-gray-700'
  }

  return (
    <AnimatedPage viewKey="coffee-processing">
    <div className="p-4 md:p-6 space-y-4">
      <FadeIn><h2 className="text-2xl font-bold">Coffee Processing ({items.length})</h2></FadeIn>
      {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Batch ID</th>
                  <th className="text-left p-3 font-medium">Farmer</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Crop</th>
                  <th className="text-left p-3 font-medium">Stage</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Harvest Date</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Moisture</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.batchId}</td>
                    <td className="p-3">{item.farmer?.fullName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.cultivation?.cultivatedCrop || '—'}</td>
                    <td className="p-3"><Badge className={stageColor(item.processingStage)}>{item.processingStage || 'Harvested'}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.actualHarvestDate)}</td>
                    <td className="p-3 hidden lg:table-cell">{item.moistureContent ? `${item.moistureContent}%` : '—'}</td>
                    <td className="p-3 text-right">
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('coffee-processing-form') }}><Pencil className="h-4 w-4" /></motion.button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No processing records</td></tr>}
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 15. COFFEE PROCESSING FORM
// ═══════════════════════════════════════════════════════

const PROCESSING_STAGES = ['Harvested', 'Depulping', 'Drying', 'Milling', 'Grading', 'Packaging']

export function CoffeeProcessingFormView() {
  const { selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    processingStage: 'Harvested',
    actualHarvestDate: '',
    harvestMethod: '',
    harvestEquipment: '',
    moistureContent: '',
    defectiveBeans: '',
    foreignMatter: '',
    batchNotes: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        processingStage: selectedRecord.processingStage || 'Harvested',
        actualHarvestDate: selectedRecord.actualHarvestDate ? selectedRecord.actualHarvestDate.split('T')[0] : '',
        harvestMethod: selectedRecord.harvestMethod || '',
        harvestEquipment: selectedRecord.harvestEquipment || '',
        moistureContent: selectedRecord.moistureContent?.toString() || '',
        defectiveBeans: selectedRecord.defectiveBeans?.toString() || '',
        foreignMatter: selectedRecord.foreignMatter?.toString() || '',
        batchNotes: selectedRecord.batchNotes || '',
      })
    }
  }, [selectedRecord])

  const currentStageIdx = PROCESSING_STAGES.indexOf(form.processingStage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return
    setLoading(true)
    try {
      await api.updateCoffeeProcessing(selectedRecord.id, form)
      toast({ title: 'Processing stage updated' })
      setSelectedRecord(null)
      setCurrentView('coffee-processing')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  const handleAdvanceStage = () => {
    if (currentStageIdx < PROCESSING_STAGES.length - 1) {
      setForm({ ...form, processingStage: PROCESSING_STAGES[currentStageIdx + 1] })
    }
  }

  return (
    <AnimatedPage viewKey="coffee-processing-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('coffee-processing') }}>← Back</Button>
        <h2 className="text-xl font-bold">Update Processing — {selectedRecord?.batchId}</h2>
      </div></FadeIn>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {PROCESSING_STAGES.map((stage, idx) => (
          <div key={stage} className="flex items-center">
            <button
              onClick={() => setForm({ ...form, processingStage: stage })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${idx === currentStageIdx ? 'bg-emerald-700 text-white' : idx < currentStageIdx ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
            >
              {idx <= currentStageIdx ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border" />}
              {stage}
            </button>
            {idx < PROCESSING_STAGES.length - 1 && <div className={`w-6 h-0.5 ${idx < currentStageIdx ? 'bg-emerald-500' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Processing Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Current Stage</Label>
              <Select value={form.processingStage} onValueChange={(v) => setForm({ ...form, processingStage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROCESSING_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Actual Harvest Date</Label><Input type="date" value={form.actualHarvestDate} onChange={(e) => setForm({ ...form, actualHarvestDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Harvest Method</Label><Input value={form.harvestMethod} onChange={(e) => setForm({ ...form, harvestMethod: e.target.value })} /></div>
            <div className="space-y-1"><Label>Equipment</Label><Input value={form.harvestEquipment} onChange={(e) => setForm({ ...form, harvestEquipment: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Quality Control</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Moisture Content (%)</Label><Input type="number" step="0.1" value={form.moistureContent} onChange={(e) => setForm({ ...form, moistureContent: e.target.value })} /></div>
            <div className="space-y-1"><Label>Defective Beans (%)</Label><Input type="number" step="0.1" value={form.defectiveBeans} onChange={(e) => setForm({ ...form, defectiveBeans: e.target.value })} /></div>
            <div className="space-y-1"><Label>Foreign Matter (%)</Label><Input type="number" step="0.1" value={form.foreignMatter} onChange={(e) => setForm({ ...form, foreignMatter: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader><CardContent>
            <Textarea value={form.batchNotes} onChange={(e) => setForm({ ...form, batchNotes: e.target.value })} rows={3} placeholder="Processing notes for this stage..." />
          </CardContent></Card></FadeIn>

          <FadeIn delay={0.5}>
          <div className="flex gap-3 justify-between">
            <Button type="button" variant="outline" onClick={handleAdvanceStage} disabled={currentStageIdx >= PROCESSING_STAGES.length - 1}>
              Advance to Next Stage →
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setSelectedRecord(null); setCurrentView('coffee-processing') }}>Cancel</Button>
              <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
              </Button>
            </div>
          </div>
          </FadeIn>
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 16. PROCUREMENT
// ═══════════════════════════════════════════════════════

export function ProcurementView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedModule) return
    api.getProcurements(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [selectedModule])

  return (
    <AnimatedPage viewKey="procurement">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <FadeIn><h2 className="text-2xl font-bold">Procurement ({items.length})</h2></FadeIn>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('procurement-form') }}>
          <Plus className="h-4 w-4 mr-2" /> New Procurement
        </Button>
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Batch ID</th>
                  <th className="text-left p-3 font-medium">Farmer</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Crop</th>
                  <th className="text-left p-3 font-medium">Stage</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Harvest Date</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Est. Yield</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.batchId}</td>
                    <td className="p-3">{item.farmer?.fullName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.cultivation?.cultivatedCrop || '—'}</td>
                    <td className="p-3"><Badge variant="outline">{item.processingStage || 'Harvested'}</Badge></td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.actualHarvestDate)}</td>
                    <td className="p-3 hidden lg:table-cell">{item.estimatedYieldPerHa || '—'}</td>
                    <td className="p-3 text-right">
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('procurement-form') }}><Pencil className="h-4 w-4" /></motion.button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No procurement records</td></tr>}
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// 17. PROCUREMENT FORM
// ═══════════════════════════════════════════════════════

export function ProcurementFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    procurementDate: '',
    procurementType: 'Farm Gate',
    cherryPrice: '',
    parchmentPrice: '',
    greenBeanPrice: '',
    quantityKg: '',
    moistureLevel: '',
    qualityGrade: 'A',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    transportCost: '',
    batchNotes: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        procurementDate: new Date().toISOString().split('T')[0],
        procurementType: 'Farm Gate',
        cherryPrice: '',
        parchmentPrice: '',
        greenBeanPrice: '',
        quantityKg: selectedRecord.estimatedYieldPerHa || '',
        moistureLevel: selectedRecord.moistureContent?.toString() || '',
        qualityGrade: 'A',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        transportCost: '',
        batchNotes: selectedRecord.batchNotes || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return
    setLoading(true)
    try {
      const notes = JSON.stringify({ procurement: form, originalNotes: selectedRecord.batchNotes })
      await api.updateHarvestTraceability(selectedRecord.id, {
        batchNotes: notes,
        processingStage: 'Harvested',
      })
      toast({ title: 'Procurement recorded' })
      setSelectedRecord(null)
      setCurrentView('procurement')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="procurement-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('procurement') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? `Procurement — ${selectedRecord.batchId}` : 'New Procurement'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          {selectedRecord && (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80"><CardContent className="p-4 flex gap-4 text-sm">
              <div><span className="text-muted-foreground">Farmer:</span> <strong>{selectedRecord.farmer?.fullName}</strong></div>
              <div><span className="text-muted-foreground">Crop:</span> <strong>{selectedRecord.cultivation?.cultivatedCrop}</strong></div>
              <div><span className="text-muted-foreground">Batch:</span> <strong className="font-mono">{selectedRecord.batchId}</strong></div>
            </CardContent></Card>
          )}

          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Procurement Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Procurement Date</Label><Input type="date" value={form.procurementDate} onChange={(e) => setForm({ ...form, procurementDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Type</Label>
              <Select value={form.procurementType} onValueChange={(v) => setForm({ ...form, procurementType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Farm Gate">Farm Gate</SelectItem><SelectItem value="Warehouse">Warehouse</SelectItem><SelectItem value="Cooperative">Cooperative</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Cherry Price (/kg)</Label><Input type="number" value={form.cherryPrice} onChange={(e) => setForm({ ...form, cherryPrice: e.target.value })} /></div>
            <div className="space-y-1"><Label>Parchment Price (/kg)</Label><Input type="number" value={form.parchmentPrice} onChange={(e) => setForm({ ...form, parchmentPrice: e.target.value })} /></div>
            <div className="space-y-1"><Label>Green Bean Price (/kg)</Label><Input type="number" value={form.greenBeanPrice} onChange={(e) => setForm({ ...form, greenBeanPrice: e.target.value })} /></div>
            <div className="space-y-1"><Label>Transport Cost</Label><Input type="number" value={form.transportCost} onChange={(e) => setForm({ ...form, transportCost: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Quality & Payment</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Quality Grade</Label>
              <Select value={form.qualityGrade} onValueChange={(v) => setForm({ ...form, qualityGrade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="A">Grade A (Premium)</SelectItem><SelectItem value="B">Grade B (Standard)</SelectItem><SelectItem value="C">Grade C (Commercial)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Moisture Level (%)</Label><Input type="number" step="0.1" value={form.moistureLevel} onChange={(e) => setForm({ ...form, moistureLevel: e.target.value })} /></div>
            <div className="space-y-1"><Label>Payment Method</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Mobile Money">Mobile Money</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Payment Status</Label>
              <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Partial">Partial</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>

          <FadeIn delay={0.4}>
          <Card><CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader><CardContent>
            <Textarea value={form.batchNotes} onChange={(e) => setForm({ ...form, batchNotes: e.target.value })} rows={3} placeholder="Additional procurement notes..." />
          </CardContent></Card></FadeIn>

          <FormActions loading={loading} backView="procurement" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// ADMIN REPORTS VIEW
// ═══════════════════════════════════════════════════════

export function AdminReportsView() {
  const { selectedModule } = useAppStore()
  const [reports, setReports] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedModule) {
      api.getAdminReports(selectedModule.id).then(setReports).finally(() => setLoading(false))
    }
  }, [selectedModule])

  if (loading || !reports) return <div className="p-6 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>

  const s = reports.summary
  const c = reports.charts

  return (
    <AnimatedPage viewKey="admin-reports">
    <div className="p-4 md:p-6 space-y-6">
      <FadeIn>
      <div>
        <h2 className="text-2xl font-bold">Admin Reports</h2>
        <p className="text-muted-foreground">{selectedModule?.name} — Comprehensive Analytics</p>
      </div>
      </FadeIn>

      <FadeIn delay={0.1}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Farmers', value: s.totalFarmers, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Certified', value: s.certifiedFarmers, color: 'bg-teal-100 text-teal-700' },
          { label: 'Farm Lands', value: s.totalFarmLands, color: 'bg-amber-100 text-amber-700' },
          { label: 'Cultivations', value: s.totalCultivations, color: 'bg-lime-100 text-lime-700' },
          { label: 'Nurseries', value: s.totalNurseries, color: 'bg-green-100 text-green-700' },
          { label: 'Harvest Batches', value: s.totalHarvestTraces, color: 'bg-rose-100 text-rose-700' },
          { label: 'Contracts', value: s.totalSmartContracts, color: 'bg-blue-100 text-blue-700' },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      </FadeIn>
      <FadeIn delay={0.2}>
      {/* Row 1: Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Processing Stage Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Processing Stages</CardTitle></CardHeader>
          <CardContent>
            {c.processingStages.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={c.processingStages} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }: any) => value > 0 ? `${name}: ${value}` : ''}>
                    {c.processingStages.map((_: any, i: number) => <Cell key={i} fill={['#059669', '#d97706', '#dc2626', '#2563eb', '#7c3aed', '#db2777'][i % 6]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Certification Outcomes */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Certification Results</CardTitle></CardHeader>
          <CardContent>
            {c.certOutcomes.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={c.certOutcomes} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }: any) => value > 0 ? `${name}: ${value}` : ''}>
                    {c.certOutcomes.map((_: any, i: number) => <Cell key={i} fill={['#059669', '#d97706', '#dc2626', '#2563eb'][i % 4]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Pest & Disease Summary */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Pest & Disease</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span>Total Scouted</span><Badge variant="outline">{c.pestDisease.totalScouted}</Badge></div>
            <div className="flex justify-between text-sm"><span>With Pest Issues</span><Badge className="bg-red-100 text-red-700 hover:bg-red-100">{c.pestDisease.withPest}</Badge></div>
            <div className="flex justify-between text-sm"><span>With Disease</span><Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{c.pestDisease.withDisease}</Badge></div>
            <div className="text-xs text-muted-foreground mt-2">
              By Severity: {Object.entries(c.pestDisease.bySeverity || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      </FadeIn>
      <FadeIn delay={0.3}>
      {/* Row 2: Bar Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Farmers by Province */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Farmers by Province</CardTitle></CardHeader>
          <CardContent>
            {c.farmersProvince.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={c.farmersProvince}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" height={60} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Yield Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Yield Distribution (kg/Ha)</CardTitle></CardHeader>
          <CardContent>
            {c.avgYield.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={c.avgYield.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batchId" fontSize={9} angle={-30} textAnchor="end" height={60} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="yield" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      </FadeIn>
      <FadeIn delay={0.4}>
      {/* Row 3: Recent Activities */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Activities</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Batch ID</th>
                    <th className="text-left p-2 font-medium">Farmer</th>
                    <th className="text-left p-2 font-medium">Plot</th>
                    <th className="text-left p-2 font-medium">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.recentActivities.map((a: any) => (
                    <tr key={a.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                      <td className="p-2 text-xs">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="p-2 font-mono text-xs">{a.batchId}</td>
                      <td className="p-2">{a.farmer?.fullName || '-'}</td>
                      <td className="p-2">{a.cultivation?.farmPlotName || '-'}</td>
                      <td className="p-2"><Badge variant="outline">{a.processingStage || 'Harvested'}</Badge></td>
                    </tr>
                  ))}
                  <ScaleIn delay={0.3}>{reports.recentActivities.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No recent activities</td></tr>
                  )}</ScaleIn>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      </FadeIn>
      <FadeIn delay={0.5}>
      {/* Module Coverage Summary */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Module Coverage</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Crop Monitoring', value: s.totalCropMonitors },
              { label: 'Fertilizer Apps', value: s.totalFertilizerApps },
              { label: 'Pest Mgmt', value: s.totalPestMgmts },
              { label: 'Inspections', value: s.totalInspections },
              { label: 'Land Preps', value: s.totalLandPreps },
              { label: 'Marketplace', value: s.totalMarketplaceListings },
            ].map(item => (
              <div key={item.label} className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </FadeIn>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// CERT ASSESSMENTS
// ═══════════════════════════════════════════════════════

export function CertAssessmentsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getCertAssessments(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.assessmentId?.toLowerCase().includes(search.toLowerCase()) ||
    i.farmer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    i.certificationStandard?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return
    try { await api.deleteCertAssessment(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="cert-assessments">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Cert Assessments ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('cert-assessment-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Assessment
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID, farmer, standard..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Assessment ID</th>
                  <th className="text-left p-3 font-medium">Farmer</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Standard</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
                  <th className="text-left p-3 font-medium">Score %</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Outcome</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.assessmentId}</td>
                    <td className="p-3 font-medium">{item.farmer?.fullName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.certificationStandard || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.assessmentDate)}</td>
                    <td className="p-3">{item.totalScorePercentage != null ? `${item.totalScorePercentage}%` : '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{statusBadge(item.certificationOutcome)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('cert-assessment-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No assessments found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function CertAssessmentFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    cultivationId: '', farmerId: '', farmLandId: '',
    certificationStandard: '', assessorName: '', assessmentDate: '',
    certificationOutcome: '', totalScorePercentage: '',
    cat1FarmManagement: '', cat2EnvironmentalProtection: '', cat3SoilManagement: '', cat4PestDisease: '',
    cat5FertilizerUse: '', cat6HarvestPostHarvest: '', cat7WorkerWelfare: '',
    cat8CommunityRelations: '', cat9Training: '', cat10UsdaOrganic: '', cat11ClimateCarbon: '',
    scoreBreakdown: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        cultivationId: selectedRecord.cultivationId || '', farmerId: selectedRecord.farmerId || '', farmLandId: selectedRecord.farmLandId || '',
        certificationStandard: selectedRecord.certificationStandard || '',
        assessorName: selectedRecord.assessorName || '',
        assessmentDate: selectedRecord.assessmentDate ? selectedRecord.assessmentDate.split('T')[0] : '',
        certificationOutcome: selectedRecord.certificationOutcome || '',
        totalScorePercentage: selectedRecord.totalScorePercentage || '',
        cat1FarmManagement: selectedRecord.cat1FarmManagement || '',
        cat2EnvironmentalProtection: selectedRecord.cat2EnvironmentalProtection || '',
        cat3SoilManagement: selectedRecord.cat3SoilManagement || '',
        cat4PestDisease: selectedRecord.cat4PestDisease || '',
        cat5FertilizerUse: selectedRecord.cat5FertilizerUse || '',
        cat6HarvestPostHarvest: selectedRecord.cat6HarvestPostHarvest || '',
        cat7WorkerWelfare: selectedRecord.cat7WorkerWelfare || '',
        cat8CommunityRelations: selectedRecord.cat8CommunityRelations || '',
        cat9Training: selectedRecord.cat9Training || '',
        cat10UsdaOrganic: selectedRecord.cat10UsdaOrganic || '',
        cat11ClimateCarbon: selectedRecord.cat11ClimateCarbon || '',
        scoreBreakdown: selectedRecord.scoreBreakdown || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateCertAssessment(selectedRecord.id, data); toast({ title: 'Assessment updated' }) }
      else { await api.createCertAssessment(data); toast({ title: 'Assessment created' }) }
      setSelectedRecord(null); setCurrentView('cert-assessments')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  const catOptions = ['Compliant', 'Partially Compliant', 'Non-compliant']

  return (
    <AnimatedPage viewKey="cert-assessment-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('cert-assessments') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Cert Assessment' : 'New Cert Assessment'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <CultivationSelector value={form.cultivationId} onChange={(id, c) => setForm({ ...form, cultivationId: id, farmerId: c?.farmerId || '', farmLandId: c?.farmLandId || '' })} />
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Assessment Header</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Certification Standard</Label>
              <Select value={form.certificationStandard} onValueChange={(v) => setForm({ ...form, certificationStandard: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Organic">Organic</SelectItem><SelectItem value="Fair Trade">Fair Trade</SelectItem><SelectItem value="GlobalGAP">GlobalGAP</SelectItem><SelectItem value="Rainforest Alliance">Rainforest Alliance</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Assessor Name</Label><Input value={form.assessorName} onChange={(e) => setForm({ ...form, assessorName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Assessment Date</Label><Input type="date" value={form.assessmentDate} onChange={(e) => setForm({ ...form, assessmentDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Overall Outcome</Label>
              <Select value={form.certificationOutcome} onValueChange={(v) => setForm({ ...form, certificationOutcome: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Compliant">Compliant</SelectItem><SelectItem value="Non-compliant">Non-compliant</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Score Percentage</Label><Input type="number" value={form.totalScorePercentage} onChange={(e) => setForm({ ...form, totalScorePercentage: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Category Scores (11 Sections)</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['cat1FarmManagement', '1. Farm Management'],
              ['cat2EnvironmentalProtection', '2. Environmental Protection'],
              ['cat3SoilManagement', '3. Soil Management'],
              ['cat4PestDisease', '4. Pest & Disease'],
              ['cat5FertilizerUse', '5. Fertilizer Use'],
              ['cat6HarvestPostHarvest', '6. Harvest & Post-Harvest'],
              ['cat7WorkerWelfare', '7. Worker Welfare'],
              ['cat8CommunityRelations', '8. Community Relations'],
              ['cat9Training', '9. Training'],
              ['cat10UsdaOrganic', '10. USDA Organic'],
              ['cat11ClimateCarbon', '11. Climate & Carbon'],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Select value={form[key] || ''} onValueChange={(v) => setForm({ ...form, [key]: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{catOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Remarks</CardTitle></CardHeader><CardContent>
            <Textarea value={form.scoreBreakdown} onChange={(e) => setForm({ ...form, scoreBreakdown: e.target.value })} rows={3} />
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="cert-assessments" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// COLLECTION CENTRES
// ═══════════════════════════════════════════════════════

export function CollectionCentresView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getCollectionCentres(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.centreId?.toLowerCase().includes(search.toLowerCase()) ||
    i.centreName?.toLowerCase().includes(search.toLowerCase()) ||
    i.managerName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection centre?')) return
    try { await api.deleteCollectionCentre(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="collection-centres">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Collection Centres ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('collection-centre-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Centre
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID, name, manager..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Centre ID</th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Manager</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Capacity</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Scale Type</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.centreId}</td>
                    <td className="p-3 font-medium">{item.centreName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.managerName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.location || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.storageCapacityKg || '—'}</td>
                    <td className="p-3 hidden lg:table-cell"><Badge variant="outline">{item.scaleType || '—'}</Badge></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('collection-centre-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No collection centres found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function CollectionCentreFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    centreName: '', centreGpsLat: '', centreGpsLng: '',
    province: '', district: '', commune: '',
    managerName: '', contactNumber: '',
    storageCapacityKg: '', scaleType: '', scaleLastCalibrationDate: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        centreName: selectedRecord.centreName || '', centreGpsLat: selectedRecord.centreGpsLat || '', centreGpsLng: selectedRecord.centreGpsLng || '',
        province: selectedRecord.province || '', district: selectedRecord.district || '', commune: selectedRecord.commune || '',
        managerName: selectedRecord.managerName || '', contactNumber: selectedRecord.contactNumber || '',
        storageCapacityKg: selectedRecord.storageCapacityKg || '', scaleType: selectedRecord.scaleType || '',
        scaleLastCalibrationDate: selectedRecord.scaleLastCalibrationDate ? selectedRecord.scaleLastCalibrationDate.split('T')[0] : '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateCollectionCentre(selectedRecord.id, data); toast({ title: 'Centre updated' }) }
      else { await api.createCollectionCentre(data); toast({ title: 'Centre created' }) }
      setSelectedRecord(null); setCurrentView('collection-centres')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="collection-centre-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('collection-centres') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Collection Centre' : 'New Collection Centre'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Centre Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2"><Label>Centre Name</Label><Input value={form.centreName} onChange={(e) => setForm({ ...form, centreName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Capacity (kg)</Label><Input type="number" value={form.storageCapacityKg} onChange={(e) => setForm({ ...form, storageCapacityKg: e.target.value })} /></div>
            <div className="space-y-1"><Label>Scale Type</Label>
              <Select value={form.scaleType} onValueChange={(v) => setForm({ ...form, scaleType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Digital">Digital</SelectItem><SelectItem value="Mechanical">Mechanical</SelectItem><SelectItem value="Manual">Manual</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Calibration Date</Label><Input type="date" value={form.scaleLastCalibrationDate} onChange={(e) => setForm({ ...form, scaleLastCalibrationDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">GPS & Location</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Latitude</Label><Input value={form.centreGpsLat} onChange={(e) => setForm({ ...form, centreGpsLat: e.target.value })} /></div>
            <div className="space-y-1"><Label>Longitude</Label><Input value={form.centreGpsLng} onChange={(e) => setForm({ ...form, centreGpsLng: e.target.value })} /></div>
            <div className="space-y-1"><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
            <div className="space-y-1"><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
            <div className="space-y-1"><Label>Commune</Label><Input value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Manager Name</Label><Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Contact Number</Label><Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="collection-centres" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// PROCUREMENT RECORDS
// ═══════════════════════════════════════════════════════

export function ProcurementRecordsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getProcurementRecords(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.procurementId?.toLowerCase().includes(search.toLowerCase()) ||
    i.farmer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    i.coffeeType?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await api.deleteProcurementRecord(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="procurement-records">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Procurement Records ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('procurement-record-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID, farmer, coffee type..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Procurement ID</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Farmer</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Coffee Type</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Net Weight</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Price</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Payment</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.procurementId}</td>
                    <td className="p-3">{formatDate(item.procurementDate)}</td>
                    <td className="p-3 font-medium">{item.farmer?.fullName || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.coffeeType || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.netWeight || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.pricePerKg ? `$${item.pricePerKg}` : '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{statusBadge(item.paymentStatus)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('procurement-record-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No procurement records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function ProcurementRecordFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [centres, setCentres] = useState<any[]>([])
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    collectionCentreId: '', farmerId: '',
    procurementDate: '', coffeeType: '', coffeeVariety: '',
    grossWeight: '', tareWeight: '', netWeight: '',
    moistureContentAtGate: '', cherryRipenessGrade: '',
    pricePerKg: '', totalPurchaseAmount: '', paymentStatus: '', paymentDate: '',
  })

  useEffect(() => {
    if (selectedModule) {
      api.getCollectionCentres(selectedModule.id).then(setCentres).catch(() => {})
      api.getFarmers(selectedModule.id).then(setFarmers).catch(() => {})
    }
  }, [selectedModule])

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        collectionCentreId: selectedRecord.collectionCentreId || '', farmerId: selectedRecord.farmerId || '',
        procurementDate: selectedRecord.procurementDate ? selectedRecord.procurementDate.split('T')[0] : '',
        coffeeType: selectedRecord.coffeeType || '', coffeeVariety: selectedRecord.coffeeVariety || '',
        grossWeight: selectedRecord.grossWeight || '', tareWeight: selectedRecord.tareWeight || '', netWeight: selectedRecord.netWeight || '',
        moistureContentAtGate: selectedRecord.moistureContentAtGate || '', cherryRipenessGrade: selectedRecord.cherryRipenessGrade || '',
        pricePerKg: selectedRecord.pricePerKg || '', totalPurchaseAmount: selectedRecord.totalPurchaseAmount || '',
        paymentStatus: selectedRecord.paymentStatus || '', paymentDate: selectedRecord.paymentDate ? selectedRecord.paymentDate.split('T')[0] : '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateProcurementRecord(selectedRecord.id, data); toast({ title: 'Record updated' }) }
      else { await api.createProcurementRecord(data); toast({ title: 'Record created' }) }
      setSelectedRecord(null); setCurrentView('procurement-records')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="procurement-record-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('procurement-records') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Procurement Record' : 'New Procurement Record'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Source & Farmer</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Collection Centre</Label>
              <Select value={form.collectionCentreId} onValueChange={(v) => setForm({ ...form, collectionCentreId: v })}>
                <SelectTrigger><SelectValue placeholder="Select centre" /></SelectTrigger>
                <SelectContent>{centres.map((c) => <SelectItem key={c.id} value={c.id}>{c.centreName || c.centreId}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Farmer</Label>
              <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select farmer" /></SelectTrigger>
                <SelectContent>{farmers.map((f) => <SelectItem key={f.id} value={f.id}>{f.fullName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Procurement Date</Label><Input type="date" value={form.procurementDate} onChange={(e) => setForm({ ...form, procurementDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Coffee Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Coffee Type</Label>
              <Select value={form.coffeeType} onValueChange={(v) => setForm({ ...form, coffeeType: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Robusta">Robusta</SelectItem><SelectItem value="Arabica">Arabica</SelectItem><SelectItem value="Liberica">Liberica</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Variety</Label><Input value={form.coffeeVariety} onChange={(e) => setForm({ ...form, coffeeVariety: e.target.value })} /></div>
            <div className="space-y-1"><Label>Grade</Label>
              <Select value={form.cherryRipenessGrade} onValueChange={(v) => setForm({ ...form, cherryRipenessGrade: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Weights & Quality</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Gross Weight (kg)</Label><Input type="number" value={form.grossWeight} onChange={(e) => setForm({ ...form, grossWeight: e.target.value })} /></div>
            <div className="space-y-1"><Label>Tare Weight (kg)</Label><Input type="number" value={form.tareWeight} onChange={(e) => setForm({ ...form, tareWeight: e.target.value })} /></div>
            <div className="space-y-1"><Label>Net Weight (kg)</Label><Input type="number" value={form.netWeight} onChange={(e) => setForm({ ...form, netWeight: e.target.value })} /></div>
            <div className="space-y-1"><Label>Moisture Content (%)</Label><Input type="number" value={form.moistureContentAtGate} onChange={(e) => setForm({ ...form, moistureContentAtGate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.4}>
          <Card><CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Price per Kg ($)</Label><Input type="number" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} /></div>
            <div className="space-y-1"><Label>Total Amount ($)</Label><Input type="number" value={form.totalPurchaseAmount} onChange={(e) => setForm({ ...form, totalPurchaseAmount: e.target.value })} /></div>
            <div className="space-y-1"><Label>Payment Status</Label>
              <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Partial">Partial</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="procurement-records" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// PROCUREMENT TRANSPORTS
// ═══════════════════════════════════════════════════════

export function ProcurementTransportsView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getProcurementTransports(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.transportId?.toLowerCase().includes(search.toLowerCase()) ||
    i.vehiclePlateNo?.toLowerCase().includes(search.toLowerCase()) ||
    i.driverName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transport record?')) return
    try { await api.deleteProcurementTransport(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="procurement-transports">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Procurement Transports ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('procurement-transport-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Transport
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID, vehicle, driver..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Transport ID</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Departure</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Arrival</th>
                  <th className="text-left p-3 font-medium">Vehicle</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Driver</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Weight Variance</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.transportId}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.departureDateTime)}</td>
                    <td className="p-3 hidden md:table-cell">{formatDate(item.arrivalDateTime)}</td>
                    <td className="p-3 font-medium">{item.vehiclePlateNo || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.driverName || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.weightVariance ? `${item.weightVariance} kg` : '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('procurement-transport-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No transport records found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function ProcurementTransportFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    procurementRecordId: '', departureDate: '', departureTime: '',
    arrivalDate: '', arrivalTime: '',
    vehiclePlateNo: '', driverName: '', transportRoute: '', transportCost: '',
    weightVariance: '',
  })

  useEffect(() => {
    if (selectedModule) {
      api.getProcurementRecords(selectedModule.id).then(setRecords).catch(() => {})
    }
  }, [selectedModule])

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        procurementRecordId: selectedRecord.procurementRecordId || '',
        departureDate: selectedRecord.departureDateTime ? selectedRecord.departureDateTime.split('T')[0] : '',
        departureTime: selectedRecord.departureDateTime ? selectedRecord.departureDateTime.split('T')[1]?.slice(0,5) || '' : '',
        arrivalDate: selectedRecord.arrivalDateTime ? selectedRecord.arrivalDateTime.split('T')[0] : '',
        arrivalTime: selectedRecord.arrivalDateTime ? selectedRecord.arrivalDateTime.split('T')[1]?.slice(0,5) || '' : '',
        vehiclePlateNo: selectedRecord.vehiclePlateNo || '', driverName: selectedRecord.driverName || '',
        transportRoute: selectedRecord.transportRoute || '', transportCost: selectedRecord.transportCost || '',
        weightVariance: selectedRecord.weightVariance || '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const departureDateTime = form.departureDate && form.departureTime ? `${form.departureDate}T${form.departureTime}:00` : ''
      const arrivalDateTime = form.arrivalDate && form.arrivalTime ? `${form.arrivalDate}T${form.arrivalTime}:00` : ''
      const { departureDate, departureTime, arrivalDate, arrivalTime, ...rest } = form
      const data = { ...rest, departureDateTime, arrivalDateTime, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateProcurementTransport(selectedRecord.id, data); toast({ title: 'Transport updated' }) }
      else { await api.createProcurementTransport(data); toast({ title: 'Transport created' }) }
      setSelectedRecord(null); setCurrentView('procurement-transports')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="procurement-transport-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('procurement-transports') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Transport' : 'New Transport'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Procurement Record</CardTitle></CardHeader><CardContent>
            <div className="space-y-1"><Label>Procurement Record</Label>
              <Select value={form.procurementRecordId} onValueChange={(v) => setForm({ ...form, procurementRecordId: v })}>
                <SelectTrigger><SelectValue placeholder="Select record" /></SelectTrigger>
                <SelectContent>{records.map((r) => <SelectItem key={r.id} value={r.id}>{r.procurementId || r.id}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Departure Date</Label><Input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Departure Time</Label><Input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} /></div>
            <div className="space-y-1"><Label>Arrival Date</Label><Input type="date" value={form.arrivalDate} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Arrival Time</Label><Input type="time" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.3}>
          <Card><CardHeader><CardTitle className="text-base">Vehicle Info</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Vehicle Plate No</Label><Input value={form.vehiclePlateNo} onChange={(e) => setForm({ ...form, vehiclePlateNo: e.target.value })} /></div>
            <div className="space-y-1"><Label>Driver Name</Label><Input value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Transport Route</Label><Input value={form.transportRoute} onChange={(e) => setForm({ ...form, transportRoute: e.target.value })} /></div>
            <div className="space-y-1"><Label>Transport Cost ($)</Label><Input type="number" value={form.transportCost} onChange={(e) => setForm({ ...form, transportCost: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FadeIn delay={0.4}>
          <Card><CardHeader><CardTitle className="text-base">Weight</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Weight Variance (kg)</Label><Input type="number" value={form.weightVariance} onChange={(e) => setForm({ ...form, weightVariance: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="procurement-transports" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}

// ═══════════════════════════════════════════════════════
// PROCESSING JOB ORDERS (11-Stage Pipeline)
// ═══════════════════════════════════════════════════════

const PROCESSING_PIPELINE_STAGES = [
  { key: 'stage1Cleaning', label: '1. Cleaning', fields: 'cleaningDate, equipment, contaminants, floatTest, weightAfter' },
  { key: 'stage2Depulping', label: '2. Depulping', fields: 'depulpingDate, machineId, pulpDischarge, mucilageRetention, weightAfter' },
  { key: 'stage3Fermentation', label: '3. Fermentation', fields: 'startTime, endTime, duration, type, tankId, waterVolume, mucilageRemoval' },
  { key: 'stage4Washing', label: '4. Washing', fields: 'date, passes, water, channelLength, pH, effluentDisposal' },
  { key: 'stage5Drying', label: '5. Drying', fields: 'startDate, method, temperature, frequency, duration, targetMoisture, endDate, finalMoisture' },
  { key: 'stage6Hulling', label: '6. Hulling', fields: 'date, machineId, speed, weightAfter, loss, lossPercent' },
  { key: 'stage7Grading', label: '7. Grading', fields: 'date, screenSize, grade, defectCount, colorSort, densitySort, weightAfter, rejects, outturn' },
  { key: 'stage8Blending', label: '8. Blending', fields: 'date, recipeId, componentBatches, ratios, outputWeight, blendBatchId' },
  { key: 'stage9Roasting', label: '9. Roasting', fields: 'dateTime, machineId, type, batchSize, profile, level, temps, times, cooling, output' },
  { key: 'stage10Grinding', label: '10. Grinding', fields: 'date, machineId, grindSize, particleSize, heat, degassing, output' },
  { key: 'stage11Packaging', label: '11. Packaging', fields: 'date, productType, material, packSize, units, totalWeight, valve, nitrogen, label, bestBefore, storage, finalBatchId, qcSample' },
]

export function ProcessingJobOrdersView() {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!selectedModule) return
    api.getProcessingJobOrders(selectedModule.id).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = items.filter((i) =>
    i.jobOrderId?.toLowerCase().includes(search.toLowerCase()) ||
    i.batchId?.toLowerCase().includes(search.toLowerCase()) ||
    i.processingMethod?.toLowerCase().includes(search.toLowerCase()) ||
    i.operatorName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job order?')) return
    try { await api.deleteProcessingJobOrder(id); toast({ title: 'Deleted' }); setLoading(true); load() } catch (e: any) { toast({ title: e.message, variant: 'destructive' }) }
  }

  return (
    <AnimatedPage viewKey="processing-job-orders">
    <div className="p-4 md:p-6 space-y-4">
<FadeIn>      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Processing Job Orders ({items.length})</h2>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('processing-job-order-form') }}>
          <Plus className="h-4 w-4 mr-2" /> Add Job Order
        </Button>
      </div></FadeIn>
<FadeIn delay={0.1}>      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID, batch, method..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div></FadeIn>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
<FadeIn delay={0.2}>        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80">
                <tr>
                  <th className="text-left p-3 font-medium">Job Order ID</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Batch</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Method</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Operator</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Output Product</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <td className="p-3 font-mono text-xs">{item.jobOrderId}</td>
                    <td className="p-3">{formatDate(item.processingDate)}</td>
                    <td className="p-3 hidden md:table-cell">{item.batchIdInput || '—'}</td>
                    <td className="p-3 hidden md:table-cell">{item.processingMethod || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.operatorName || '—'}</td>
                    <td className="p-3 hidden lg:table-cell">{item.targetOutputProduct || '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('processing-job-order-form') }}><Pencil className="h-4 w-4" /></motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                <ScaleIn delay={0.3}>{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No job orders found</td></tr>}</ScaleIn>
              </tbody>
            </table>
          </div>
        </div></FadeIn>
      )}
    </div>

    </AnimatedPage>  )
}

export function ProcessingJobOrderFormView() {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    processingDate: '', batchIdInput: '', processingMethod: '', operatorName: '',
    plantFacilityName: '', targetOutputProduct: '',
    stage1Cleaning: '', stage2Depulping: '', stage3Fermentation: '',
    stage4Washing: '', stage5Drying: '', stage6Hulling: '',
    stage7Grading: '', stage8Blending: '', stage9Roasting: '',
    stage10Grinding: '', stage11Packaging: '',
    finalOutputWeightKg: '', overallOutturn: '', totalProcessingCost: '', costPerKg: '',
    finalMoistureContent: '', cupScore: '', cuppingNotes: '', qcApprovedBy: '', qcApprovalDate: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        processingDate: selectedRecord.processingDate ? selectedRecord.processingDate.split('T')[0] : '',
        batchIdInput: selectedRecord.batchIdInput || '', processingMethod: selectedRecord.processingMethod || '',
        operatorName: selectedRecord.operatorName || '', plantFacilityName: selectedRecord.plantFacilityName || '',
        targetOutputProduct: selectedRecord.targetOutputProduct || '',
        stage1Cleaning: selectedRecord.stage1Cleaning || '', stage2Depulping: selectedRecord.stage2Depulping || '',
        stage3Fermentation: selectedRecord.stage3Fermentation || '', stage4Washing: selectedRecord.stage4Washing || '',
        stage5Drying: selectedRecord.stage5Drying || '', stage6Hulling: selectedRecord.stage6Hulling || '',
        stage7Grading: selectedRecord.stage7Grading || '', stage8Blending: selectedRecord.stage8Blending || '',
        stage9Roasting: selectedRecord.stage9Roasting || '', stage10Grinding: selectedRecord.stage10Grinding || '',
        stage11Packaging: selectedRecord.stage11Packaging || '',
        finalOutputWeightKg: selectedRecord.finalOutputWeightKg || '', overallOutturn: selectedRecord.overallOutturn || '',
        totalProcessingCost: selectedRecord.totalProcessingCost || '', costPerKg: selectedRecord.costPerKg || '',
        finalMoistureContent: selectedRecord.finalMoistureContent || '', cupScore: selectedRecord.cupScore || '',
        cuppingNotes: selectedRecord.cuppingNotes || '', qcApprovedBy: selectedRecord.qcApprovedBy || '',
        qcApprovalDate: selectedRecord.qcApprovalDate ? selectedRecord.qcApprovalDate.split('T')[0] : '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, moduleId: selectedModule!.id }
      if (selectedRecord) { await api.updateProcessingJobOrder(selectedRecord.id, data); toast({ title: 'Job order updated' }) }
      else { await api.createProcessingJobOrder(data); toast({ title: 'Job order created' }) }
      setSelectedRecord(null); setCurrentView('processing-job-orders')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  return (
    <AnimatedPage viewKey="processing-job-order-form">
    <div className="p-4 md:p-6">
<FadeIn>      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('processing-job-orders') }}>← Back</Button>
        <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Job Order' : 'New Processing Job Order'}</h2>
      </div></FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 max-w-4xl">
          <FadeIn delay={0.1}>
          <Card><CardHeader><CardTitle className="text-base">Job Order Header</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Job Order Date</Label><Input type="date" value={form.processingDate} onChange={(e) => setForm({ ...form, processingDate: e.target.value })} /></div>
            <div className="space-y-1"><Label>Batch ID</Label><Input value={form.batchIdInput} onChange={(e) => setForm({ ...form, batchIdInput: e.target.value })} /></div>
            <div className="space-y-1"><Label>Processing Method</Label>
              <Select value={form.processingMethod} onValueChange={(v) => setForm({ ...form, processingMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="Washed">Washed</SelectItem><SelectItem value="Natural">Natural</SelectItem><SelectItem value="Honey">Honey</SelectItem><SelectItem value="Wet Hulled">Wet Hulled</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Operator Name</Label><Input value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Facility Name</Label><Input value={form.plantFacilityName} onChange={(e) => setForm({ ...form, plantFacilityName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Target Output Product</Label><Input value={form.targetOutputProduct} onChange={(e) => setForm({ ...form, targetOutputProduct: e.target.value })} /></div>
          </CardContent></Card></FadeIn>

          {PROCESSING_PIPELINE_STAGES.map((stage) => (
            <Card key={stage.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{stage.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Stage data (JSON or key=value pairs)</Label>
                  <Textarea
                    value={form[stage.key] || ''}
                    onChange={(e) => setForm({ ...form, [stage.key]: e.target.value })}
                    rows={3}
                    placeholder={`e.g. {"date": "2024-11-01", "equipment": "Sieve", ...}`}
                  />
                  <p className="text-xs text-muted-foreground">Fields: {stage.fields}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <FadeIn delay={0.2}>
          <Card><CardHeader><CardTitle className="text-base">QC Summary</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Final Output (kg)</Label><Input type="number" value={form.finalOutputWeightKg} onChange={(e) => setForm({ ...form, finalOutputWeightKg: e.target.value })} /></div>
            <div className="space-y-1"><Label>Outturn (%)</Label><Input type="number" value={form.overallOutturn} onChange={(e) => setForm({ ...form, overallOutturn: e.target.value })} /></div>
            <div className="space-y-1"><Label>Total Cost ($)</Label><Input type="number" value={form.totalProcessingCost} onChange={(e) => setForm({ ...form, totalProcessingCost: e.target.value })} /></div>
            <div className="space-y-1"><Label>Cost per Kg ($)</Label><Input type="number" value={form.costPerKg} onChange={(e) => setForm({ ...form, costPerKg: e.target.value })} /></div>
            <div className="space-y-1"><Label>Moisture (%)</Label><Input type="number" value={form.finalMoistureContent} onChange={(e) => setForm({ ...form, finalMoistureContent: e.target.value })} /></div>
            <div className="space-y-1"><Label>Cup Score</Label><Input type="number" value={form.cupScore} onChange={(e) => setForm({ ...form, cupScore: e.target.value })} /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Cupping Notes</Label><Textarea value={form.cuppingNotes} onChange={(e) => setForm({ ...form, cuppingNotes: e.target.value })} rows={2} /></div>
            <div className="space-y-1"><Label>Approved By</Label><Input value={form.qcApprovedBy} onChange={(e) => setForm({ ...form, qcApprovedBy: e.target.value })} /></div>
            <div className="space-y-1"><Label>Approval Date</Label><Input type="date" value={form.qcApprovalDate} onChange={(e) => setForm({ ...form, qcApprovalDate: e.target.value })} /></div>
          </CardContent></Card></FadeIn>
          <FormActions loading={loading} backView="processing-job-orders" />
        </div>
      </form>
    </div>

    </AnimatedPage>  )
}
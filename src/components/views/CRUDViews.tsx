'use client'

import { useEffect, useState } from 'react'
import { useAppStore, type ViewName } from '@/lib/store'
import * as api from '@/lib/spa-api'
import { AnimatedPage, FadeIn } from '@/components/ui/animations'
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
import {
  Plus, Search, Pencil, Trash2, Loader2, ChevronLeft,
} from 'lucide-react'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-700', Paid: 'bg-emerald-100 text-emerald-700',
    Disputed: 'bg-red-100 text-red-700', Closed: 'bg-gray-100 text-gray-700',
    Active: 'bg-emerald-100 text-emerald-700', Inactive: 'bg-gray-100 text-gray-700',
    Passed: 'bg-emerald-100 text-emerald-700', Failed: 'bg-red-100 text-red-700',
    Compliant: 'bg-emerald-100 text-emerald-700', 'Non-compliant': 'bg-red-100 text-red-700',
    Pending: 'bg-amber-100 text-amber-700',
  }
  return <Badge className={colors[status] || 'bg-gray-100 text-gray-700'}>{status || 'N/A'}</Badge>
}

// ═══════════════════════════════════════════════════════
// GENERIC LIST VIEW
// ═══════════════════════════════════════════════════════

interface ListConfig {
  title: string
  viewKey: string
  formView: ViewName
  apiList: (search: string) => Promise<any>
  apiDelete: (id: string) => Promise<any>
  columns: { key: string; label: string; hidden?: string; render?: (v: any, item: any) => React.ReactNode }[]
  searchPlaceholder: string
}

export function GenericListView({ config }: { config: ListConfig }) {
  const { setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    config.apiList(search).then(data => {
      setItems(data.items || data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await config.apiDelete(id); setItems(items.filter(i => i.id !== id)) } catch (e: any) { alert(e.message) }
  }

  return (
    <AnimatedPage viewKey={config.viewKey}>
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold">{config.title} ({items.length})</h2>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView(config.formView) }}>
              <Plus className="h-4 w-4 mr-2" /> Add Record
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={config.searchPlaceholder} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </FadeIn>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <FadeIn delay={0.2}>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80">
                    <tr>
                      {config.columns.filter(c => !c.hidden?.includes('list')).map(col => (
                        <th key={col.key} className="text-left p-3 font-medium">{col.label}</th>
                      ))}
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t transition-colors hover:bg-emerald-50/50">
                        {config.columns.filter(c => !c.hidden?.includes('list')).map(col => (
                          <td key={col.key} className="p-3">
                            {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                          </td>
                        ))}
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView(config.formView) }}>
                              <Pencil className="h-4 w-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr><td colSpan={config.columns.length + 1} className="p-8 text-center text-muted-foreground">No records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// FARM LANDS LIST VIEW
// ═══════════════════════════════════════════════════════

export function FarmLandsView() {
  const { setCurrentView, setSelectedRecord, currentUser } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFarmLands(search).then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [search])

  const canCreate = currentUser?.role === 'tenant_admin'

  return (
    <AnimatedPage viewKey="farmlands">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Farm Lands ({items.length})</h2>
            {canCreate && (
              <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('farmland-form') }}>
                <Plus className="h-4 w-4 mr-2" /> Add Farm Land
              </Button>
            )}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by farm name, farmer..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </FadeIn>
        {loading ? <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.2}>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80">
                    <tr>
                      <th className="text-left p-3 font-medium">Farm Name</th>
                      <th className="text-left p-3 font-medium">Farmer</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Area (Ha)</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Altitude</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Soil Type</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Ownership</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-t hover:bg-emerald-50/50 cursor-pointer" onClick={() => { setSelectedRecord(item); setCurrentView('farmland-detail') }}>
                        <td className="p-3 font-medium">{item.farmName}</td>
                        <td className="p-3">{item.farmer?.fullName || '—'}</td>
                        <td className="p-3 hidden md:table-cell">{item.totalLandHolding || '—'}</td>
                        <td className="p-3 hidden md:table-cell">{item.altitude ? `${item.altitude}m` : '—'}</td>
                        <td className="p-3 hidden lg:table-cell">{item.soilType || '—'}</td>
                        <td className="p-3 hidden lg:table-cell">{item.landOwnership || '—'}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            {canCreate && <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="h-8 w-8 rounded-md hover:bg-muted" onClick={e => { e.stopPropagation(); setSelectedRecord(item); setCurrentView('farmland-form') }}><Pencil className="h-4 w-4" /></motion.button>}
                            {canCreate && <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={e => { e.stopPropagation(); api.deleteFarmLand(item.id).then(() => setItems(items.filter(i => i.id !== item.id))) }}><Trash2 className="h-4 w-4" /></motion.button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// CULTIVATIONS VIEW
// ═══════════════════════════════════════════════════════

export function CultivationsView() {
  const { setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCultivations(search).then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await api.deleteCultivation(id); setItems(items.filter(i => i.id !== id)) } catch (e: any) { alert(e.message) }
  }

  return (
    <AnimatedPage viewKey="cultivations">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Cultivations ({items.length})</h2>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('cultivation-form') }}><Plus className="h-4 w-4 mr-2" /> Add</Button>
        </div></FadeIn>
        <FadeIn delay={0.1}><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div></FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.2}><div className="border rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gradient-to-r from-slate-50 to-slate-100/80"><tr>
            <th className="text-left p-3 font-medium">Plot</th><th className="text-left p-3 font-medium">Crop</th><th className="text-left p-3 font-medium hidden md:table-cell">Variety</th><th className="text-left p-3 font-medium hidden md:table-cell">Farmer</th><th className="text-left p-3 font-medium hidden lg:table-cell">Area</th><th className="text-left p-3 font-medium hidden lg:table-cell">Sowing</th><th className="text-right p-3 font-medium">Actions</th>
          </tr></thead><tbody>
            {items.map(item => (
              <tr key={item.id} className="border-t hover:bg-emerald-50/50">
                <td className="p-3 font-medium">{item.farmPlotName}</td>
                <td className="p-3">{item.cultivatedCrop || '—'}</td>
                <td className="p-3 hidden md:table-cell">{item.cropVariety || '—'}</td>
                <td className="p-3 hidden md:table-cell">{item.farmer?.fullName || '—'}</td>
                <td className="p-3 hidden lg:table-cell">{item.cultivationArea ? `${item.cultivationArea} Ha` : '—'}</td>
                <td className="p-3 hidden lg:table-cell">{formatDate(item.sowingDate)}</td>
                <td className="p-3 text-right"><div className="flex justify-end gap-1">
                  <motion.button whileHover={{scale:1.15}} whileTap={{scale:0.9}} className="h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView('cultivation-form') }}><Pencil className="h-4 w-4" /></motion.button>
                  <motion.button whileHover={{scale:1.15}} whileTap={{scale:0.9}} className="h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                </div></td>
              </tr>
            ))}
          </tbody></table></div></div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// SIMPLE GENERIC LIST (for other modules)
// ═══════════════════════════════════════════════════════

export function SimpleListView({ title, viewKey, formView, fetchFn, deleteFn, columns }: {
  title: string
  viewKey: string
  formView: ViewName
  fetchFn: (search: string) => Promise<any>
  deleteFn: (id: string) => Promise<any>
  columns: { key: string; label: string; hidden?: boolean; render?: (v: any, item: any) => React.ReactNode }[]
}) {
  const { setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFn(search).then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try { await deleteFn(id); setItems(items.filter(i => i.id !== id)) } catch (e: any) { alert(e.message) }
  }

  return (
    <AnimatedPage viewKey={viewKey}>
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">{title} ({items.length})</h2>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView(formView) }}><Plus className="h-4 w-4 mr-2" /> Add</Button>
        </div></FadeIn>
        <FadeIn delay={0.1}><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div></FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.2}><div className="border rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gradient-to-r from-slate-50 to-slate-100/80"><tr>
            {columns.filter(c => !c.hidden).map(col => <th key={col.key} className="text-left p-3 font-medium">{col.label}</th>)}
            <th className="text-right p-3 font-medium">Actions</th>
          </tr></thead><tbody>
            {items.map(item => (
              <tr key={item.id} className="border-t hover:bg-emerald-50/50">
                {columns.filter(c => !c.hidden).map(col => (
                  <td key={col.key} className="p-3">{col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}</td>
                ))}
                <td className="p-3 text-right"><div className="flex justify-end gap-1">
                  <motion.button whileHover={{scale:1.15}} whileTap={{scale:0.9}} className="h-8 w-8 rounded-md hover:bg-muted" onClick={() => { setSelectedRecord(item); setCurrentView(formView) }}><Pencil className="h-4 w-4" /></motion.button>
                  <motion.button whileHover={{scale:1.15}} whileTap={{scale:0.9}} className="h-8 w-8 rounded-md text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></motion.button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={columns.filter(c=>!c.hidden).length+1} className="p-8 text-center text-muted-foreground">No records found</td></tr>}
          </tbody></table></div></div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// GENERIC FORM VIEW
// ═══════════════════════════════════════════════════════

export function GenericFormView({ title, backView, formView, fields, apiCreate, apiUpdate, initData }: {
  title: string
  backView: ViewName
  formView: string
  fields: { key: string; label: string; type?: string; options?: { value: string; label: string }[]; section?: string; required?: boolean }[]
  apiCreate: (data: any) => Promise<any>
  apiUpdate: (id: string, data: any) => Promise<any>
  initData?: any
}) {
  const { currentUser, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>(initData || {})

  useEffect(() => {
    if (selectedRecord) {
      const initial: any = {}
      fields.forEach(f => {
        let val = selectedRecord[f.key]
        if (val && f.type === 'date') val = val.split('T')[0]
        initial[f.key] = val ?? (f.type === 'switch' ? false : '')
      })
      setForm(initial)
    } else {
      const initial: any = {}
      fields.forEach(f => { initial[f.key] = f.type === 'switch' ? false : '' })
      setForm(initial)
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedRecord) {
        await apiUpdate(selectedRecord.id, form)
      } else {
        await apiCreate(form)
      }
      setSelectedRecord(null)
      setCurrentView(backView)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Group fields by section
  const sections: Record<string, typeof fields> = {}
  fields.forEach(f => {
    const sec = f.section || 'Details'
    if (!sections[sec]) sections[sec] = []
    sections[sec].push(f)
  })

  return (
    <AnimatedPage viewKey={formView}>
      <div className="p-4 md:p-6">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView(backView) }}>← Back</Button>
            <h2 className="text-xl font-bold">{selectedRecord ? `Edit ${title}` : `New ${title}`}</h2>
          </div>
        </FadeIn>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-w-4xl">
            {Object.entries(sections).map(([sectionName, sectionFields], si) => (
              <FadeIn key={sectionName} delay={0.1 * (si + 1)}>
                <Card><CardHeader><CardTitle className="text-base">{sectionName}</CardTitle></CardHeader>
                  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionFields.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        {field.type === 'select' && field.options ? (
                          <Select value={form[field.key] || ''} onValueChange={v => setForm({ ...form, [field.key]: v })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{field.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : field.type === 'textarea' ? (
                          <Textarea value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} rows={2} />
                        ) : field.type === 'switch' ? (
                          <div className="flex items-center gap-3 pt-1"><Switch checked={form[field.key] || false} onCheckedChange={v => setForm({ ...form, [field.key]: v })} /></div>
                        ) : (
                          <Input type={field.type || 'text'} value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value })} required={field.required} />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
            <FadeIn delay={0.5}>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => { setSelectedRecord(null); setCurrentView(backView) }}>Cancel</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Record
                </Button>
              </div>
            </FadeIn>
          </div>
        </form>
      </div>
    </AnimatedPage>
  )
}

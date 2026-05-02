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
import { Users, Plus, Search, Building2, Globe, Mail, Phone, Loader2, Eye, CheckCircle2 } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const BUYER_TYPE_LABELS: Record<string, string> = {
  roaster: 'Roaster',
  importer: 'Importer',
  trader: 'Trader',
  distributor: 'Distributor',
}

const BUYER_TYPE_COLORS: Record<string, string> = {
  roaster: 'bg-amber-100 text-amber-800 border-amber-200',
  importer: 'bg-blue-100 text-blue-800 border-blue-200',
  trader: 'bg-teal-100 text-teal-800 border-teal-200',
  distributor: 'bg-purple-100 text-purple-800 border-purple-200',
}

const EU_COUNTRIES = ['DE', 'FR', 'NL', 'IT', 'ES', 'BE', 'AT', 'SE', 'DK', 'PL', 'IE', 'PT', 'FI', 'CZ', 'GR', 'HU', 'RO', 'BG', 'HR', 'SK']

interface Buyer {
  id: string
  companyName: string
  contactPerson?: string
  email?: string
  phone?: string
  country?: string
  buyerType: string
  euRegistration?: boolean
  eoriNumber?: string
  tracesRegistration?: string
  preferredCurrency?: string
  createdAt: string
}

export default function BuyersPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Buyer | null>(null)
  const [form, setForm] = useState<any>({ buyerType: 'roaster', preferredCurrency: 'EUR', euRegistration: false })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (countryFilter && countryFilter !== 'all') params.set('country', countryFilter)
      if (typeFilter && typeFilter !== 'all') params.set('buyerType', typeFilter)
      const res = await fetch(`/api/buyers?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, countryFilter, typeFilter])

  useEffect(() => { loadData() }, [loadData])

  const filteredItems = items.filter(item => {
    if (countryFilter && countryFilter !== 'all' && item.country !== countryFilter) return false
    if (typeFilter && typeFilter !== 'all' && item.buyerType !== typeFilter) return false
    return true
  })

  const stats = {
    total: items.length,
    euRegistered: items.filter(b => b.euRegistration).length,
    roasters: items.filter(b => b.buyerType === 'roaster').length,
    countries: [...new Set(items.map(b => b.country).filter(Boolean))].length,
  }

  const countryChartData = Object.entries(
    items.reduce<Record<string, number>>((acc, b) => {
      if (b.country) acc[b.country] = (acc[b.country] || 0) + 1
      return acc
    }, {})
  ).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 8)

  const CHART_COLORS = ['#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516', '#a06b2d', '#2e7d32', '#5d4037']

  async function handleCreate() {
    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ buyerType: 'roaster', preferredCurrency: 'EUR', euRegistration: false })
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
                <Users className="w-6 h-6 text-primary" /> Buyer Management
              </h1>
              <p className="text-sm text-muted-foreground">Manage EU buyers, importers, and trading partners</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Add Buyer</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Add New Buyer</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name *</label>
                    <Input placeholder="EU Coffee Roasters GmbH" value={form.companyName || ''} onChange={e => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Person</label>
                      <Input placeholder="Hans Mueller" value={form.contactPerson || ''} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input placeholder="hans@eu-coffee.de" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buyer Type</label>
                      <Select value={form.buyerType} onValueChange={v => setForm({ ...form, buyerType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(BUYER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Country</label>
                      <Select value={form.country || ''} onValueChange={v => setForm({ ...form, country: v })}>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          {EU_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">EORI Number</label>
                      <Input placeholder="DE123456789012345" value={form.eoriNumber || ''} onChange={e => setForm({ ...form, eoriNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">TRACES Registration</label>
                      <Input placeholder="TRACES-REG-001" value={form.tracesRegistration || ''} onChange={e => setForm({ ...form, tracesRegistration: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="euReg" checked={form.euRegistration || false} onChange={e => setForm({ ...form, euRegistration: e.target.checked })} className="rounded" />
                    <label htmlFor="euReg" className="text-sm font-medium">EU Registered</label>
                  </div>
                  <Button onClick={handleCreate} className="w-full">Add Buyer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Buyers', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'EU Registered', value: stats.euRegistered, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Roasters', value: stats.roasters, bg: 'bg-amber-100', color: 'text-amber-600' },
            { label: 'Countries', value: stats.countries, bg: 'bg-blue-100', color: 'text-blue-600' },
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
              <Input className="pl-9" placeholder="Search buyers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Countries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {EU_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(BUYER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>EU Reg</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No buyers found</p></TableCell></TableRow>
                    ) : filteredItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.companyName}</p>
                              {item.email && <p className="text-xs text-muted-foreground">{item.email}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge className={`${BUYER_TYPE_COLORS[item.buyerType] || 'bg-gray-100 text-gray-800'} border text-xs`}>{BUYER_TYPE_LABELS[item.buyerType] || item.buyerType}</Badge></TableCell>
                        <TableCell className="text-sm">{item.contactPerson || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1"><Globe className="w-3 h-3 text-muted-foreground" />{item.country || '—'}</div>
                        </TableCell>
                        <TableCell>
                          {item.euRegistration ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 border"><CheckCircle2 className="w-3 h-3 mr-1" />Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
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
              <CardHeader><CardTitle className="text-base">Buyers by Country</CardTitle></CardHeader>
              <CardContent>
                {countryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={countryChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="country" type="category" width={30} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {countryChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data</p>}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Buyer Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">{detailItem.companyName}</h3>
                    <Badge className={`${BUYER_TYPE_COLORS[detailItem.buyerType]} border text-xs`}>{BUYER_TYPE_LABELS[detailItem.buyerType] || detailItem.buyerType}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Contact:</span><p>{detailItem.contactPerson || '—'}</p></div>
                  <div><span className="text-muted-foreground">Country:</span><p>{detailItem.country || '—'}</p></div>
                  <div><span className="text-muted-foreground">Email:</span><p>{detailItem.email || '—'}</p></div>
                  <div><span className="text-muted-foreground">Phone:</span><p>{detailItem.phone || '—'}</p></div>
                  <div><span className="text-muted-foreground">EORI:</span><p className="font-mono text-xs">{detailItem.eoriNumber || '—'}</p></div>
                  <div><span className="text-muted-foreground">TRACES:</span><p className="font-mono text-xs">{detailItem.tracesRegistration || '—'}</p></div>
                  <div><span className="text-muted-foreground">Currency:</span><p>{detailItem.preferredCurrency || '—'}</p></div>
                  <div><span className="text-muted-foreground">EU Reg:</span><p>{detailItem.euRegistration ? '✅ Yes' : '❌ No'}</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

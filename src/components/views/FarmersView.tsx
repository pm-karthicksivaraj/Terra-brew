'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import * as api from '@/lib/spa-api'
import { AnimatedPage, FadeIn, ScaleIn } from '@/components/ui/animations'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus, Search, Pencil, Trash2, Eye, Loader2, Users, MapPin, Sprout,
  Phone, Mail, MapPinned, Calendar, Shield, CreditCard, ChevronLeft, Award,
} from 'lucide-react'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ═══════════════════════════════════════════════════════
// FARMERS LIST VIEW
// ═══════════════════════════════════════════════════════

export function FarmersView() {
  const { setCurrentView, setSelectedRecord, currentUser } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFarmers(search).then(data => {
      setItems(data.items || data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this farmer?')) return
    try { await api.deleteFarmer(id); setItems(items.filter(i => i.id !== id)) } catch (e: any) { alert(e.message) }
  }

  const canCreate = currentUser?.role === 'tenant_admin'

  return (
    <AnimatedPage viewKey="farmers">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Farmers ({items.length})</h2>
            {canCreate && (
              <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('farmer-form') }}>
                <Plus className="h-4 w-4 mr-2" /> Add Farmer
              </Button>
            )}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, code, province..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </FadeIn>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <FadeIn delay={0.2}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }}
                  className="border rounded-xl p-4 cursor-pointer transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
                  onClick={() => { setSelectedRecord(item); setCurrentView('farmer-detail') }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                      {item.fullName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.fullName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.farmerCode || '—'}</p>
                    </div>
                    {item.isCertified && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">
                        <Award className="h-3 w-3 mr-0.5" /> Cert
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {item.province && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.province}</span>}
                    {item._count?.farmLands !== undefined && <span className="flex items-center gap-1"><MapPinned className="h-3 w-3" />{item._count.farmLands} lands</span>}
                  </div>
                  <div className="mt-2 flex gap-1">
                    {canCreate && (
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted" onClick={(e) => { e.stopPropagation(); setSelectedRecord(item); setCurrentView('farmer-form') }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                    {canCreate && (
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="inline-flex items-center justify-center h-7 w-7 rounded-md text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No farmers found</div>}
          </FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// FARMER DETAIL VIEW — hero header, tabs, QR
// ═══════════════════════════════════════════════════════

export function FarmerDetailView() {
  const { selectedRecord, setCurrentView, setSelectedRecord, currentUser } = useAppStore()
  const [farmer, setFarmer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedRecord?.id) {
      api.getFarmer(selectedRecord.id).then(data => {
        setFarmer(data)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [selectedRecord])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!farmer) return <div className="p-6 text-muted-foreground">Farmer not found</div>

  const role = currentUser?.role || 'farmer'
  const isAdmin = role === 'tenant_admin'

  return (
    <AnimatedPage viewKey="farmer-detail">
      <div className="space-y-0">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 text-white px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 mb-4" onClick={() => { setSelectedRecord(null); setCurrentView('farmers') }}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Farmers
            </Button>
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl font-bold border border-white/20">
                {farmer.fullName?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{farmer.fullName}</h1>
                <p className="text-emerald-200 font-mono text-sm">{farmer.farmerCode || 'No code assigned'}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {farmer.isCertified && (
                    <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-400/30">
                      <Award className="h-3 w-3 mr-1" /> {farmer.certificationType || 'Certified'}
                    </Badge>
                  )}
                  {farmer.creditScore && (
                    <Badge className="bg-white/10 text-white border-white/20">
                      <CreditCard className="h-3 w-3 mr-1" /> Credit: {farmer.creditScore}
                    </Badge>
                  )}
                  {farmer.province && (
                    <Badge className="bg-white/10 text-white border-white/20">
                      <MapPin className="h-3 w-3 mr-1" /> {farmer.province}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end gap-2">
                <div className="text-xs text-emerald-200">Enrolled</div>
                <div className="text-sm font-medium">{formatDate(farmer.enrollmentDate)}</div>
                {farmer._count && (
                  <div className="flex gap-3 mt-2 text-xs text-emerald-200">
                    <span>{farmer._count.farmLands} lands</span>
                    <span>{farmer._count.cultivations} crops</span>
                    <span>{farmer._count.harvestTraceabilities} harvests</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 max-w-6xl mx-auto">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="farm">Farm Data</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="certification">Certification</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {[
                  { label: 'Full Name', value: farmer.fullName, sensitive: false },
                  { label: 'Gender', value: farmer.gender, sensitive: false },
                  { label: 'Date of Birth', value: formatDate(farmer.dob), sensitive: false },
                  { label: 'Contact', value: farmer.contactNumber, sensitive: !isAdmin },
                  { label: 'Email', value: farmer.email, sensitive: !isAdmin },
                  { label: 'Education', value: farmer.education, sensitive: false },
                  { label: 'Marital Status', value: farmer.maritalStatus, sensitive: false },
                  { label: 'National ID', value: farmer.nationalIdNo, sensitive: !isAdmin },
                  { label: 'Spouse Name', value: farmer.spouseName, sensitive: !isAdmin },
                ].map((field) => (
                  <div key={field.label}>
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    {field.sensitive && !isAdmin ? (
                      <p className="text-sm font-mono bg-gray-100 text-gray-400 px-2 py-1 rounded mt-0.5">******</p>
                    ) : (
                      <p className="text-sm font-medium mt-0.5">{field.value || '—'}</p>
                    )}
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="location" className="mt-4">
              <Card><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {[
                  { label: 'Country', value: farmer.country },
                  { label: 'Province', value: farmer.province },
                  { label: 'District', value: farmer.district },
                  { label: 'Commune', value: farmer.commune },
                  { label: 'Village', value: farmer.village },
                  { label: 'Zip Code', value: farmer.zipCode },
                  { label: 'Latitude', value: farmer.latitude },
                  { label: 'Longitude', value: farmer.longitude },
                ].map((field) => (
                  <div key={field.label}>
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <p className="text-sm font-medium mt-0.5">{field.value || '—'}</p>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="farm" className="mt-4">
              <Card><CardHeader><CardTitle className="text-base">Farm Lands ({farmer.farmLands?.length || farmer._count?.farmLands || 0})</CardTitle></CardHeader>
                <CardContent>
                  {farmer.farmLands?.length ? (
                    <div className="space-y-2">
                      {farmer.farmLands.map((fl: any) => (
                        <div key={fl.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-emerald-50/30 cursor-pointer"
                          onClick={() => { setSelectedRecord(fl); setCurrentView('farmland-detail') }}>
                          <div>
                            <p className="font-medium text-sm">{fl.farmName}</p>
                            <p className="text-xs text-muted-foreground">{fl.totalLandHolding ? `${fl.totalLandHolding} Ha` : '—'} · {fl._count?.cultivations || 0} cultivations</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{fl.landOwnership || '—'}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No farm lands registered</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="mt-4">
              <Card><CardContent className="grid sm:grid-cols-2 gap-4 p-6">
                {[
                  { label: 'Loan Taken', value: farmer.loanTaken ? 'Yes' : 'No' },
                  { label: 'Loan Amount', value: farmer.loanAmount, sensitive: !isAdmin },
                  { label: 'Loan Source', value: farmer.loanTakenFrom, sensitive: !isAdmin },
                  { label: 'Loan Interest', value: farmer.loanInterest, sensitive: !isAdmin },
                  { label: 'Loan Security', value: farmer.loanSecurity ? 'Yes' : 'No' },
                  { label: 'Credit Score', value: farmer.creditScore },
                  { label: 'Crop Insurance', value: farmer.cropInsurance ? 'Yes' : 'No' },
                  { label: 'Health Insurance', value: farmer.healthInsurance ? 'Yes' : 'No' },
                ].map((field) => (
                  <div key={field.label}>
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    {field.sensitive && !isAdmin ? (
                      <p className="text-sm font-mono bg-gray-100 text-gray-400 px-2 py-1 rounded mt-0.5">******</p>
                    ) : (
                      <p className="text-sm font-medium mt-0.5">{field.value || '—'}</p>
                    )}
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="certification" className="mt-4">
              <Card><CardContent className="grid sm:grid-cols-2 gap-4 p-6">
                {[
                  { label: 'Is Certified', value: farmer.isCertified ? 'Yes' : 'No' },
                  { label: 'Certification Type', value: farmer.certificationType },
                  { label: 'Year of ICS', value: farmer.yearOfICS },
                  { label: 'Cooperative', value: farmer.cooperative },
                  { label: 'GAP Training', value: farmer.gapTrainingAttended ? 'Attended' : 'Not attended' },
                  { label: 'Smartphone', value: farmer.smartphoneOwnership ? 'Yes' : 'No' },
                ].map((field) => (
                  <div key={field.label}>
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <p className="text-sm font-medium mt-0.5">{field.value || '—'}</p>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// FARMER FORM VIEW
// ═══════════════════════════════════════════════════════

export function FarmerFormView() {
  const { currentUser, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    fullName: '', firstName: '', lastName: '', contactNumber: '', email: '',
    gender: '', dob: '', education: '', maritalStatus: '',
    province: '', district: '', commune: '', village: '', country: currentUser?.tenantCountry || 'VN',
    nationalIdType: '', nationalIdNo: '',
    isCertified: false, certificationType: '', cooperative: '',
  })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        ...selectedRecord,
        dob: selectedRecord.dob ? selectedRecord.dob.split('T')[0] : '',
      })
    }
  }, [selectedRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedRecord) {
        await api.updateFarmer(selectedRecord.id, form)
      } else {
        await api.createFarmer(form)
      }
      setSelectedRecord(null)
      setCurrentView('farmers')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage viewKey="farmer-form">
      <div className="p-4 md:p-6">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('farmers') }}>← Back</Button>
            <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Farmer' : 'New Farmer'}</h2>
          </div>
        </FadeIn>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-w-4xl">
            <FadeIn delay={0.1}>
              <Card><CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1"><Label>Full Name <span className="text-red-500">*</span></Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                  <div className="space-y-1"><Label>Contact Number <span className="text-red-500">*</span></Label><Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required /></div>
                  <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Gender</Label>
                    <Select value={form.gender || ''} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={form.dob || ''} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Education</Label>
                    <Select value={form.education || ''} onValueChange={(v) => setForm({ ...form, education: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Primary">Primary</SelectItem><SelectItem value="Secondary">Secondary</SelectItem><SelectItem value="High School">High School</SelectItem><SelectItem value="University">University</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>National ID Type</Label>
                    <Select value={form.nationalIdType || ''} onValueChange={(v) => setForm({ ...form, nationalIdType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="CCCD">CCCD</SelectItem><SelectItem value="Passport">Passport</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>National ID Number</Label><Input value={form.nationalIdNo || ''} onChange={(e) => setForm({ ...form, nationalIdNo: e.target.value })} /></div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Card><CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1"><Label>Province</Label><Input value={form.province || ''} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
                  <div className="space-y-1"><Label>District</Label><Input value={form.district || ''} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Commune</Label><Input value={form.commune || ''} onChange={(e) => setForm({ ...form, commune: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Village</Label><Input value={form.village || ''} onChange={(e) => setForm({ ...form, village: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Country</Label><Input value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.3}>
              <Card><CardHeader><CardTitle className="text-base">Certification</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3"><Switch checked={form.isCertified} onCheckedChange={(v) => setForm({ ...form, isCertified: v })} /><Label>Certified Farmer</Label></div>
                  {form.isCertified && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label>Certification Type</Label><Input value={form.certificationType || ''} onChange={(e) => setForm({ ...form, certificationType: e.target.value })} /></div>
                      <div className="space-y-1"><Label>Cooperative</Label><Input value={form.cooperative || ''} onChange={(e) => setForm({ ...form, cooperative: e.target.value })} /></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => { setSelectedRecord(null); setCurrentView('farmers') }}>Cancel</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Farmer
                </Button>
              </div>
            </FadeIn>
          </div>
        </form>
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// FARM LAND DETAIL VIEW
// ═══════════════════════════════════════════════════════

export function FarmLandDetailView() {
  const { selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedRecord?.id) {
      api.getFarmLand(selectedRecord.id).then(data => {
        setLand(data)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [selectedRecord])

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>
  if (!land) return <div className="p-6 text-muted-foreground">Farm land not found</div>

  return (
    <AnimatedPage viewKey="farmland-detail">
      <div className="space-y-0">
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 mb-4" onClick={() => { setSelectedRecord(null); setCurrentView('farmlands') }}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold">{land.farmName}</h1>
            <p className="text-amber-200 text-sm">Farmer: {land.farmer?.fullName || '—'}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {land.totalLandHolding && <Badge className="bg-white/10 text-white border-white/20">{land.totalLandHolding} Ha</Badge>}
              {land.altitude && <Badge className="bg-white/10 text-white border-white/20">{land.altitude}m altitude</Badge>}
              {land.soilType && <Badge className="bg-white/10 text-white border-white/20">{land.soilType}</Badge>}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 max-w-6xl mx-auto">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="cultivations">Cultivations ({land.cultivations?.length || land._count?.cultivations || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <Card><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {[
                  { label: 'Farm Name', value: land.farmName },
                  { label: 'Land Ownership', value: land.landOwnership },
                  { label: 'Total Area (Ha)', value: land.totalLandHolding },
                  { label: 'Altitude (m)', value: land.altitude },
                  { label: 'Soil Type', value: land.soilType },
                  { label: 'Irrigation Source', value: land.irrigationSource },
                  { label: 'Irrigation Type', value: land.irrigationType },
                  { label: 'Water Source', value: land.waterSource },
                  { label: 'Full-time Workers', value: land.fullTimeWorkers },
                  { label: 'Part-time Workers', value: land.partTimeWorkers },
                  { label: 'Fertility Status', value: land.fertilityStatus },
                  { label: 'Latitude', value: land.latitude },
                  { label: 'Longitude', value: land.longitude },
                ].map((field) => (
                  <div key={field.label}>
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <p className="text-sm font-medium mt-0.5">{field.value || '—'}</p>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="cultivations" className="mt-4">
              {land.cultivations?.length ? (
                <div className="space-y-2">
                  {land.cultivations.map((c: any) => (
                    <Card key={c.id}><CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.farmPlotName}</p>
                        <p className="text-xs text-muted-foreground">{c.cultivatedCrop || '—'} · {c.cultivationArea ? `${c.cultivationArea} Ha` : '—'}</p>
                      </div>
                      <Badge variant="outline">{c.cropVariety || '—'}</Badge>
                    </CardContent></Card>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No cultivations</p>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AnimatedPage>
  )
}

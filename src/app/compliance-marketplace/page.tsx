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
import { Store, Star, Calendar, Euro, ShoppingBag, Loader2, CheckCircle2, MapPin, Clock } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SERVICE_TYPE_LABELS: Record<string, string> = {
  certification: 'Certification',
  audit: 'Audit',
  lab_testing: 'Lab Testing',
  legal: 'Legal',
  consulting: 'Consulting',
  training: 'Training',
}

const SERVICE_TYPE_COLORS: Record<string, string> = {
  certification: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  audit: 'bg-blue-100 text-blue-800 border-blue-200',
  lab_testing: 'bg-teal-100 text-teal-800 border-teal-200',
  legal: 'bg-purple-100 text-purple-800 border-purple-200',
  consulting: 'bg-amber-100 text-amber-800 border-amber-200',
  training: 'bg-rose-100 text-rose-800 border-rose-200',
}

interface ComplianceService {
  id: string
  providerName: string
  serviceType: string
  description?: string
  priceFrom?: number
  currency?: string
  rating?: number
  isVerified?: boolean
  coverage?: string
  website?: string
}

interface Booking {
  id: string
  status: string
  scheduledDate?: string
  notes?: string
  service?: ComplianceService
  createdAt: string
}

export default function ComplianceMarketplacePage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<ComplianceService[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ComplianceService | null>(null)
  const [bookingForm, setBookingForm] = useState<any>({})
  const [tab, setTab] = useState<string>('services')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter && typeFilter !== 'all') params.set('serviceType', typeFilter)
      const [servicesRes, bookingsRes] = await Promise.all([
        fetch(`/api/compliance-services?${params}`),
        fetch('/api/compliance-bookings'),
      ])
      const servicesData = await servicesRes.json()
      const bookingsData = await bookingsRes.json()
      if (servicesData.success) setServices(servicesData.data?.data || [])
      if (bookingsData.success) setBookings(bookingsData.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    totalServices: services.length,
    verifiedProviders: services.filter(s => s.isVerified).length,
    avgRating: services.length > 0 ? (services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length).toFixed(1) : '0',
    myBookings: bookings.length,
  }

  const typeChartData = Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
    name: label,
    count: services.filter(s => s.serviceType === key).length,
  })).filter(d => d.count > 0)

  async function handleBook() {
    if (!selectedService) return
    try {
      const res = await fetch('/api/compliance-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService.id, ...bookingForm }),
      })
      if (res.ok) {
        setBookingDialogOpen(false)
        setBookingForm({})
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
                <ShoppingBag className="w-6 h-6 text-primary" /> Compliance Marketplace
              </h1>
              <p className="text-sm text-muted-foreground">Find and book compliance services from verified providers</p>
            </div>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Services', value: stats.totalServices, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Verified', value: stats.verifiedProviders, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Avg Rating', value: stats.avgRating, bg: 'bg-amber-100', color: 'text-amber-600' },
            { label: 'My Bookings', value: stats.myBookings, bg: 'bg-blue-100', color: 'text-blue-600' },
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

        {/* Filter */}
        <FadeIn delay={0.1}>
          <div className="flex gap-3 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Service Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-1 bg-muted rounded-lg p-1 ml-auto">
              <Button variant={tab === 'services' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('services')} className="text-xs">Services</Button>
              <Button variant={tab === 'bookings' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('bookings')} className="text-xs">My Bookings</Button>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : tab === 'services' ? (
          <>
            {/* Services Grid */}
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.length === 0 ? (
                <Card className="md:col-span-3"><CardContent className="p-8 text-center text-muted-foreground"><Store className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No services available</p></CardContent></Card>
              ) : services.map((service) => (
                <StaggerItem key={service.id}>
                  <MotionCard {...hoverScale} className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{service.providerName}</CardTitle>
                          <Badge className={`${SERVICE_TYPE_COLORS[service.serviceType] || 'bg-gray-100'} border mt-1 text-xs`}>
                            {SERVICE_TYPE_LABELS[service.serviceType] || service.serviceType}
                          </Badge>
                        </div>
                        {service.isVerified && <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description || 'No description available'}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {service.priceFrom && <div className="flex items-center gap-1 text-sm font-medium"><Euro className="w-3 h-3" />{service.priceFrom} {service.currency || 'EUR'}</div>}
                          {!service.priceFrom && <span className="text-xs text-muted-foreground">Contact for pricing</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{service.rating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>
                      {service.coverage && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3" />{service.coverage}
                        </div>
                      )}
                      <Button size="sm" className="w-full" onClick={() => { setSelectedService(service); setBookingDialogOpen(true) }}>Book Service</Button>
                    </CardContent>
                  </MotionCard>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Service Type Distribution */}
            {typeChartData.length > 0 && (
              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader><CardTitle className="text-base">Services by Type</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={typeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5a1e" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </>
        ) : (
          /* My Bookings Tab */
          <FadeIn>
            <Card>
              <CardHeader><CardTitle className="text-base">My Bookings</CardTitle></CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No bookings yet</p>
                    <p className="text-xs mt-1">Book a compliance service to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Store className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{booking.service?.providerName || 'Service'}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Date TBD'}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${booking.status === 'completed' ? 'bg-green-100 text-green-800' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} capitalize`}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Book Service Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Book: {selectedService?.providerName}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {selectedService && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">{selectedService.providerName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedService.description}</p>
                  {selectedService.priceFrom && (
                    <p className="text-xs mt-1">From {selectedService.priceFrom} {selectedService.currency || 'EUR'}</p>
                  )}
                </div>
              )}
              <div className="space-y-2"><label className="text-sm font-medium">Scheduled Date</label><Input type="date" value={bookingForm.scheduledDate || ''} onChange={e => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Notes</label><Textarea placeholder="Any specific requirements..." value={bookingForm.notes || ''} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={3} /></div>
              <Button onClick={handleBook} className="w-full">Confirm Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

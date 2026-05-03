'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Container, Plus, ArrowRight, Ship, MapPin, Package, CheckCircle2, Loader2 } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { useI18n } from '@/i18n'

// ─── Status colors ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_transit: 'bg-amber-100 text-amber-800 border-amber-200',
  arrived: 'bg-teal-100 text-teal-800 border-teal-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_FLOW = ['draft', 'confirmed', 'in_transit', 'arrived', 'delivered']

// ─── Port data ──────────────────────────────────────────────────
const PORTS_BY_COUNTRY: Record<string, { code: string; name: string }[]> = {
  Vietnam: [
    { code: 'VNSGN', name: 'Cat Lai, Ho Chi Minh City' },
    { code: 'VNHPH', name: 'Hai Phong' },
    { code: 'VNDAD', name: 'Tien Sa, Da Nang' },
    { code: 'VNNTR', name: 'Nha Trang' },
    { code: 'VNCLI', name: 'Cai Lan' },
  ],
  Indonesia: [
    { code: 'IDJKT', name: 'Tanjung Priok, Jakarta' },
    { code: 'IDSUB', name: 'Tanjung Perak, Surabaya' },
    { code: 'IDBLW', name: 'Belawan, Medan' },
    { code: 'IDMKS', name: 'Makassar' },
  ],
  Ethiopia: [
    { code: 'ETADD', name: 'Modjo, Addis Ababa (dry)' },
    { code: 'ETDJB', name: 'Djibouti Port (transit)' },
  ],
  Germany: [
    { code: 'DEHAM', name: 'Hamburg' },
    { code: 'DEBRV', name: 'Bremerhaven' },
    { code: 'DEWVN', name: 'Wilhelmshaven' },
  ],
  USA: [
    { code: 'USLAX', name: 'Los Angeles' },
    { code: 'USNYC', name: 'New York / New Jersey' },
    { code: 'USSAV', name: 'Savannah' },
    { code: 'USOAK', name: 'Oakland' },
    { code: 'USHOU', name: 'Houston' },
  ],
  Italy: [
    { code: 'ITGOA', name: 'Genoa' },
    { code: 'ITNAP', name: 'Naples' },
    { code: 'ITTRS', name: 'Trieste' },
  ],
  Japan: [
    { code: 'JPYOK', name: 'Yokohama' },
    { code: 'JPTYO', name: 'Tokyo' },
    { code: 'JPKOB', name: 'Kobe' },
  ],
  Netherlands: [
    { code: 'NLRTM', name: 'Rotterdam' },
    { code: 'NLAMS', name: 'Amsterdam' },
  ],
  'South Korea': [
    { code: 'KRPUS', name: 'Busan' },
    { code: 'KRINC', name: 'Incheon' },
  ],
}

// ─── Mock bookings ──────────────────────────────────────────────
const MOCK_BOOKINGS = [
  {
    id: 'BK-2024-001',
    type: 'FCL',
    origin: 'Cat Lai, HCMC',
    originCode: 'VNSGN',
    destination: 'Hamburg',
    destinationCode: 'DEHAM',
    etd: '2024-12-05',
    eta: '2025-01-18',
    status: 'in_transit',
    rate: 2850,
    currency: 'USD',
    commodity: 'Robusta Green Beans',
    containerType: "20'GP",
    containerCount: 3,
    weight: 54000,
  },
  {
    id: 'BK-2024-002',
    type: 'FCL',
    origin: 'Cat Lai, HCMC',
    originCode: 'VNSGN',
    destination: 'Genoa',
    destinationCode: 'ITGOA',
    etd: '2024-12-12',
    eta: '2025-01-25',
    status: 'confirmed',
    rate: 3120,
    currency: 'USD',
    commodity: 'Arabica Specialty SHB',
    containerType: "20'GP",
    containerCount: 1,
    weight: 18000,
  },
  {
    id: 'BK-2024-003',
    type: 'LCL',
    origin: 'Hai Phong',
    originCode: 'VNHPH',
    destination: 'Los Angeles',
    destinationCode: 'USLAX',
    etd: '2024-12-20',
    eta: '2025-02-05',
    status: 'draft',
    rate: 1680,
    currency: 'USD',
    commodity: 'Arabica Excelsa Blend',
    containerType: 'LCL',
    containerCount: 0,
    weight: 8000,
  },
  {
    id: 'BK-2024-004',
    type: 'FCL',
    origin: 'Tanjung Priok, Jakarta',
    originCode: 'IDJKT',
    destination: 'Yokohama',
    destinationCode: 'JPYOK',
    etd: '2024-11-28',
    eta: '2024-12-18',
    status: 'arrived',
    rate: 2200,
    currency: 'USD',
    commodity: 'Arabica Wet-Hulled',
    containerType: "20'GP",
    containerCount: 1,
    weight: 12000,
  },
  {
    id: 'BK-2024-005',
    type: 'FCL',
    origin: 'Cat Lai, HCMC',
    originCode: 'VNSGN',
    destination: 'Rotterdam',
    destinationCode: 'NLRTM',
    etd: '2024-10-15',
    eta: '2024-11-28',
    status: 'delivered',
    rate: 2780,
    currency: 'USD',
    commodity: 'Robusta Screen 16+',
    containerType: "40'HC",
    containerCount: 2,
    weight: 48000,
  },
  {
    id: 'BK-2024-006',
    type: 'FCL',
    origin: 'Cat Lai, HCMC',
    originCode: 'VNSGN',
    destination: 'Savannah',
    destinationCode: 'USSAV',
    etd: '2024-11-10',
    eta: '2024-12-25',
    status: 'cancelled',
    rate: 3650,
    currency: 'USD',
    commodity: 'Robusta Grade 2',
    containerType: "20'GP",
    containerCount: 2,
    weight: 36000,
  },
]

// ─── Form state ─────────────────────────────────────────────────
interface BookingForm {
  originCountry: string
  originPort: string
  destinationCountry: string
  destinationPort: string
  commodity: string
  weight: string
  volume: string
  containerType: string
  containerCount: string
  hsCategory: string
  incoterms: string
  specialRequirements: string
}

const INITIAL_FORM: BookingForm = {
  originCountry: 'Vietnam',
  originPort: '',
  destinationCountry: 'Germany',
  destinationPort: '',
  commodity: 'Coffee (Green Beans)',
  weight: '',
  volume: '',
  containerType: "20'GP",
  containerCount: '1',
  hsCategory: '0901',
  incoterms: 'FOB',
  specialRequirements: '',
}

export default function LogisticsBookingPage() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const [bookings] = useState(MOCK_BOOKINGS)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<BookingForm>({ ...INITIAL_FORM })
  const [wizardStep, setWizardStep] = useState(0)

  const stats = useMemo(() => ({
    total: bookings.length,
    inTransit: bookings.filter(b => b.status === 'in_transit').length,
    delivered: bookings.filter(b => b.status === 'delivered').length,
    totalSpend: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.rate, 0),
  }), [bookings])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookings
    return bookings.filter(b => b.status === statusFilter)
  }, [bookings, statusFilter])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
  }

  const WIZARD_STEPS = [
    { label: t2('Xuất phát', 'Origin'), icon: MapPin },
    { label: t2('Đích', 'Destination'), icon: ArrowRight },
    { label: t2('Hàng hóa', 'Load Details'), icon: Package },
    { label: t2('Phân loại', 'Classification'), icon: CheckCircle2 },
  ]

  const originPorts = PORTS_BY_COUNTRY[form.originCountry] || []
  const destPorts = PORTS_BY_COUNTRY[form.destinationCountry] || []

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
                <Container className="w-6 h-6 text-primary" />
                {t2('Đặt Logistics', 'Logistics Booking')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t2('Đặt vận chuyển container và tìm giá cước tốt nhất', 'Book container shipments and find the best freight rates')}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setWizardStep(0); setForm({ ...INITIAL_FORM }) } }}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  {t2('Đặt mới', 'New Booking')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="font-mono">{t2('Đặt Logistics Mới', 'New Logistics Booking')}</DialogTitle>
                </DialogHeader>

                {/* Wizard steps */}
                <div className="flex items-center gap-2 py-2">
                  {WIZARD_STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${wizardStep === idx ? 'bg-primary text-primary-foreground' : wizardStep > idx ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted text-muted-foreground'}`}>
                        <step.icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden">{idx + 1}</span>
                      </div>
                      {idx < WIZARD_STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
                    </div>
                  ))}
                </div>

                {/* Tab 1: Origin */}
                {wizardStep === 0 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Quốc gia xuất phát', 'Origin Country')}</Label>
                      <Select value={form.originCountry} onValueChange={v => setForm({ ...form, originCountry: v, originPort: '' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(PORTS_BY_COUNTRY).map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Cảng xuất phát', 'Origin Port')}</Label>
                      <Select value={form.originPort} onValueChange={v => setForm({ ...form, originPort: v })}>
                        <SelectTrigger><SelectValue placeholder={t2('Chọn cảng...', 'Select port...')} /></SelectTrigger>
                        <SelectContent>
                          {originPorts.map(port => (
                            <SelectItem key={port.code} value={port.code}>
                              <span className="font-mono text-xs mr-2">{port.code}</span> {port.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Tab 2: Destination */}
                {wizardStep === 1 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Quốc gia đích', 'Destination Country')}</Label>
                      <Select value={form.destinationCountry} onValueChange={v => setForm({ ...form, destinationCountry: v, destinationPort: '' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(PORTS_BY_COUNTRY).map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Cảng đích', 'Destination Port')}</Label>
                      <Select value={form.destinationPort} onValueChange={v => setForm({ ...form, destinationPort: v })}>
                        <SelectTrigger><SelectValue placeholder={t2('Chọn cảng...', 'Select port...')} /></SelectTrigger>
                        <SelectContent>
                          {destPorts.map(port => (
                            <SelectItem key={port.code} value={port.code}>
                              <span className="font-mono text-xs mr-2">{port.code}</span> {port.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Tab 3: Load Details */}
                {wizardStep === 2 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Hàng hóa', 'Commodity')}</Label>
                      <Select value={form.commodity} onValueChange={v => setForm({ ...form, commodity: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Coffee (Green Beans)">Coffee (Green Beans)</SelectItem>
                          <SelectItem value="Coffee (Roasted)">Coffee (Roasted)</SelectItem>
                          <SelectItem value="Coffee (Ground)">Coffee (Ground)</SelectItem>
                          <SelectItem value="Cocoa Beans">Cocoa Beans</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Trọng lượng (kg)', 'Weight (kg)')}</Label>
                        <Input type="number" placeholder="18000" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Thể tích (m³)', 'Volume (m³)')}</Label>
                        <Input type="number" placeholder="28" value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Loại container', 'Container Type')}</Label>
                        <Select value={form.containerType} onValueChange={v => setForm({ ...form, containerType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20'GP">20&apos;GP (Standard)</SelectItem>
                            <SelectItem value="40'GP">40&apos;GP (Standard)</SelectItem>
                            <SelectItem value="40'HC">40&apos;HC (High Cube)</SelectItem>
                            <SelectItem value="LCL">LCL (Less than Container)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Số lượng container', 'Container Count')}</Label>
                        <Input type="number" placeholder="1" value={form.containerCount} onChange={e => setForm({ ...form, containerCount: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Goods Classification */}
                {wizardStep === 3 && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Danh mục HS Code', 'HS Code Category')}</Label>
                        <Select value={form.hsCategory} onValueChange={v => setForm({ ...form, hsCategory: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0901">0901 — Coffee</SelectItem>
                            <SelectItem value="0902">0902 — Tea</SelectItem>
                            <SelectItem value="1801">1801 — Cocoa beans</SelectItem>
                            <SelectItem value="1802">1802 — Cocoa shells</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Incoterms', 'Incoterms')}</Label>
                        <Select value={form.incoterms} onValueChange={v => setForm({ ...form, incoterms: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FOB">FOB</SelectItem>
                            <SelectItem value="CIF">CIF</SelectItem>
                            <SelectItem value="CFR">CFR</SelectItem>
                            <SelectItem value="EXW">EXW</SelectItem>
                            <SelectItem value="FCA">FCA</SelectItem>
                            <SelectItem value="DDP">DDP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Yêu cầu đặc biệt', 'Special Requirements')}</Label>
                      <Input placeholder="Ventilation required, food-grade only, etc." value={form.specialRequirements} onChange={e => setForm({ ...form, specialRequirements: e.target.value })} />
                    </div>
                  </div>
                )}

                <DialogFooter className="flex-row gap-2">
                  {wizardStep > 0 && (
                    <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)} className="font-mono">
                      {t2('Quay lại', 'Back')}
                    </Button>
                  )}
                  {wizardStep < 3 ? (
                    <Button onClick={() => setWizardStep(wizardStep + 1)} className="font-mono">
                      {t2('Tiếp theo', 'Next')}
                    </Button>
                  ) : (
                    <Button onClick={() => { setDialogOpen(false); setWizardStep(0); setForm({ ...INITIAL_FORM }) }} className="font-mono">
                      {t2('Xác nhận Đặt chỗ', 'Confirm Booking')}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Stats Row */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t2('Tổng đặt chỗ', 'Total Bookings'), value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: t2('Đang vận chuyển', 'In Transit'), value: stats.inTransit, bg: 'bg-amber-100 dark:bg-amber-900', color: 'text-amber-600 dark:text-amber-300' },
            { label: t2('Đã giao', 'Delivered'), value: stats.delivered, bg: 'bg-green-100 dark:bg-green-900', color: 'text-green-600 dark:text-green-300' },
            { label: t2('Tổng chi phí', 'Total Spend'), value: formatCurrency(stats.totalSpend, 'USD'), bg: 'bg-teal-100 dark:bg-teal-900', color: 'text-teal-600 dark:text-teal-300' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold font-mono">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Filter */}
        <FadeIn delay={0.1}>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t2('Tất cả trạng thái', 'All Statuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t2('Tất cả', 'All')}</SelectItem>
                {Object.keys(STATUS_COLORS).map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {/* Booking Results Table */}
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">{t2('Mã đặt chỗ', 'Booking ID')}</TableHead>
                      <TableHead className="font-mono">{t2('Loại', 'Type')}</TableHead>
                      <TableHead className="font-mono">{t2('Tuyến đường', 'Route')}</TableHead>
                      <TableHead className="font-mono">ETD</TableHead>
                      <TableHead className="font-mono">ETA</TableHead>
                      <TableHead className="font-mono">{t2('Trạng thái', 'Status')}</TableHead>
                      <TableHead className="font-mono">{t2('Cước', 'Rate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <Ship className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p>{t2('Không tìm thấy đặt chỗ', 'No bookings found')}</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((bk) => {
                      const progress = STATUS_FLOW.indexOf(bk.status) + 1
                      return (
                        <TableRow key={bk.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium font-mono text-xs">{bk.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-mono">{bk.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-mono text-muted-foreground">{bk.originCode}</span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="font-mono text-muted-foreground">{bk.destinationCode}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                              <span>{bk.origin}</span>
                              <ArrowRight className="w-2 h-2" />
                              <span>{bk.destination}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="flex items-center gap-0.5 mt-1.5">
                              {STATUS_FLOW.map((step, idx) => (
                                <div
                                  key={step}
                                  className={`h-1 flex-1 rounded-full ${idx < progress ? 'bg-green-500' : 'bg-muted'}`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{bk.etd}</TableCell>
                          <TableCell className="text-xs font-mono">{bk.eta}</TableCell>
                          <TableCell>
                            <Badge className={`${STATUS_COLORS[bk.status]} border text-xs capitalize`}>{bk.status.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">{formatCurrency(bk.rate, bk.currency)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardShell>
  )
}

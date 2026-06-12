'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileQuestion, Plus, ArrowRight, CheckCircle2, Eye } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { useI18n } from '@/i18n'

// ─── Status colors ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  published: 'bg-blue-100 text-blue-800 border-blue-200',
  responded: 'bg-amber-100 text-amber-800 border-amber-200',
  awarded: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
}

// ─── Mock data ──────────────────────────────────────────────────
const MOCK_RFQS = [
  {
    id: 'RFQ-2024-001',
    title: 'Robusta Green Beans G2',
    commodity: 'Robusta',
    variety: 'Green Beans',
    grade: 'Grade 2',
    quantity: 18000,
    targetPrice: 4.25,
    currency: 'EUR',
    status: 'published',
    publishedDate: '2024-11-15',
    responsesCount: 5,
    deliveryLocation: 'Ho Chi Minh City',
    deliveryDateRange: '2025-01-15 ~ 2025-02-28',
    incoterms: 'FOB',
    originCountry: 'Vietnam',
    destinationCountry: 'Germany',
    certifications: ['UTZ', 'Rainforest Alliance'],
    processingMethod: 'Wet Processed',
    minCupScore: 78,
    notes: 'Priority shipment for Q1 roasting schedule',
  },
  {
    id: 'RFQ-2024-002',
    title: 'Arabica Specialty SHB',
    commodity: 'Arabica',
    variety: 'SHB',
    grade: 'Specialty',
    quantity: 5000,
    targetPrice: 8.75,
    currency: 'USD',
    status: 'responded',
    publishedDate: '2024-11-10',
    responsesCount: 3,
    deliveryLocation: 'Da Nang Port',
    deliveryDateRange: '2025-02-01 ~ 2025-03-15',
    incoterms: 'CIF',
    originCountry: 'Vietnam',
    destinationCountry: 'USA',
    certifications: ['Organic', 'Fairtrade'],
    processingMethod: 'Natural/Dry Processed',
    minCupScore: 84,
    notes: 'Micro-lot, single origin requirement',
  },
  {
    id: 'RFQ-2024-003',
    title: 'Robusta Screen 16+',
    commodity: 'Robusta',
    variety: 'Screen 16+',
    grade: 'Grade 1',
    quantity: 24000,
    targetPrice: 3.95,
    currency: 'EUR',
    status: 'awarded',
    publishedDate: '2024-10-20',
    responsesCount: 7,
    deliveryLocation: 'Cat Lai Port, HCMC',
    deliveryDateRange: '2024-12-01 ~ 2025-01-31',
    incoterms: 'FOB',
    originCountry: 'Vietnam',
    destinationCountry: 'Italy',
    certifications: ['4C', 'UTZ'],
    processingMethod: 'Wet Processed',
    minCupScore: 75,
    notes: 'Annual contract for espresso blend supply',
  },
  {
    id: 'RFQ-2024-004',
    title: 'Arabica Excelsa Blend',
    commodity: 'Arabica',
    variety: 'Excelsa',
    grade: 'Grade 3',
    quantity: 8000,
    targetPrice: 5.50,
    currency: 'USD',
    status: 'draft',
    publishedDate: '',
    responsesCount: 0,
    deliveryLocation: 'Hai Phong Port',
    deliveryDateRange: '2025-03-01 ~ 2025-04-30',
    incoterms: 'CIF',
    originCountry: 'Vietnam',
    destinationCountry: 'Japan',
    certifications: ['JAS Organic'],
    processingMethod: 'Honey Processed',
    minCupScore: 80,
    notes: 'Trial blend for Japanese market entry',
  },
  {
    id: 'RFQ-2024-005',
    title: 'Green Robusta Bulk',
    commodity: 'Robusta',
    variety: 'Green Beans',
    grade: 'Grade 2',
    quantity: 40000,
    targetPrice: 3.60,
    currency: 'EUR',
    status: 'expired',
    publishedDate: '2024-08-01',
    responsesCount: 2,
    deliveryLocation: 'Cat Lai Port, HCMC',
    deliveryDateRange: '2024-10-01 ~ 2024-11-30',
    incoterms: 'FOB',
    originCountry: 'Vietnam',
    destinationCountry: 'Netherlands',
    certifications: ['4C'],
    processingMethod: 'Dry Processed',
    minCupScore: 70,
    notes: 'Bulk instant coffee production grade',
  },
  {
    id: 'RFQ-2024-006',
    title: 'Arabica Wet-Hulled Sumatra',
    commodity: 'Arabica',
    variety: 'Sumatra',
    grade: 'Grade 1',
    quantity: 3200,
    targetPrice: 9.20,
    currency: 'USD',
    status: 'cancelled',
    publishedDate: '2024-10-05',
    responsesCount: 1,
    deliveryLocation: 'Belawan Port',
    deliveryDateRange: '2024-12-01 ~ 2025-01-15',
    incoterms: 'FOB',
    originCountry: 'Indonesia',
    destinationCountry: 'USA',
    certifications: ['Organic'],
    processingMethod: 'Wet-Hulled (Giling Basah)',
    minCupScore: 82,
    notes: 'Cancelled due to supply chain disruption',
  },
]

// ─── Step form state type ───────────────────────────────────────
interface RFQForm {
  title: string
  commodity: string
  variety: string
  grade: string
  quantity: string
  targetPrice: string
  currency: string
  deliveryLocation: string
  deliveryDateStart: string
  deliveryDateEnd: string
  incoterms: string
  originCountry: string
  destinationCountry: string
  certifications: string[]
  processingMethod: string
  minCupScore: string
  notes: string
}

const INITIAL_FORM: RFQForm = {
  title: '',
  commodity: 'Robusta',
  variety: '',
  grade: 'Grade 2',
  quantity: '',
  targetPrice: '',
  currency: 'EUR',
  deliveryLocation: '',
  deliveryDateStart: '',
  deliveryDateEnd: '',
  incoterms: 'FOB',
  originCountry: 'Vietnam',
  destinationCountry: 'Germany',
  certifications: [],
  processingMethod: 'Wet Processed',
  minCupScore: '',
  notes: '',
}

export default function RFQPage() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const [rfqs] = useState(MOCK_RFQS)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<typeof MOCK_RFQS[0] | null>(null)
  const [createStep, setCreateStep] = useState(0)
  const [form, setForm] = useState<RFQForm>({ ...INITIAL_FORM })

  // Stats
  const stats = useMemo(() => ({
    total: rfqs.length,
    published: rfqs.filter(r => r.status === 'published').length,
    responded: rfqs.filter(r => r.status === 'responded').length,
    awarded: rfqs.filter(r => r.status === 'awarded').length,
  }), [rfqs])

  // Filter
  const filtered = useMemo(() => {
    return rfqs.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [rfqs, statusFilter, search])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
  }

  const STEPS = [
    { label: t2('Thông tin cơ bản', 'Basic Info'), icon: FileQuestion },
    { label: t2('Giao hàng', 'Delivery'), icon: ArrowRight },
    { label: t2('Yêu cầu', 'Requirements'), icon: CheckCircle2 },
  ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
                <FileQuestion className="w-6 h-6 text-primary" />
                {t2('Quản lý RFQ', 'RFQ Management')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t2('Tạo và quản lý Yêu cầu Báo giá cho hợp đồng cà phê', 'Create and manage Request For Quotations for coffee contracts')}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setCreateStep(0); setForm({ ...INITIAL_FORM }) } }}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  {t2('Tạo RFQ', 'Create RFQ')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="font-mono">{t2('Tạo RFQ Mới', 'Create New RFQ')}</DialogTitle>
                </DialogHeader>
                {/* Step indicator */}
                <div className="flex items-center gap-2 py-2">
                  {STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${createStep === idx ? 'bg-primary text-primary-foreground' : createStep > idx ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted text-muted-foreground'}`}>
                        <step.icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden">{idx + 1}</span>
                      </div>
                      {idx < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
                    </div>
                  ))}
                </div>

                {/* Step 1: Basic Info */}
                {createStep === 0 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Tiêu đề', 'Title')}</Label>
                      <Input placeholder="e.g. Robusta Green Beans G2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Hàng hóa', 'Commodity')}</Label>
                        <Select value={form.commodity} onValueChange={v => setForm({ ...form, commodity: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Robusta">Robusta</SelectItem>
                            <SelectItem value="Arabica">Arabica</SelectItem>
                            <SelectItem value="Liberica">Liberica</SelectItem>
                            <SelectItem value="Excelsa">Excelsa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Giống', 'Variety')}</Label>
                        <Input placeholder="e.g. SHB, Screen 16+" value={form.variety} onChange={e => setForm({ ...form, variety: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Hạng', 'Grade')}</Label>
                        <Select value={form.grade} onValueChange={v => setForm({ ...form, grade: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Grade 1">Grade 1</SelectItem>
                            <SelectItem value="Grade 2">Grade 2</SelectItem>
                            <SelectItem value="Grade 3">Grade 3</SelectItem>
                            <SelectItem value="Specialty">Specialty</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Số lượng (kg)', 'Quantity (kg)')}</Label>
                        <Input type="number" placeholder="18000" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Giá mục tiêu/kg', 'Target Price/kg')}</Label>
                        <Input type="number" step="0.01" placeholder="4.25" value={form.targetPrice} onChange={e => setForm({ ...form, targetPrice: e.target.value })} />
                      </div>
                    </div>
                    <div className="w-1/3">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Tiền tệ', 'Currency')}</Label>
                        <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="VND">VND</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Delivery */}
                {createStep === 1 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Địa điểm giao hàng', 'Delivery Location')}</Label>
                      <Input placeholder="e.g. Cat Lai Port, HCMC" value={form.deliveryLocation} onChange={e => setForm({ ...form, deliveryLocation: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Ngày giao từ', 'Delivery From')}</Label>
                        <Input type="date" value={form.deliveryDateStart} onChange={e => setForm({ ...form, deliveryDateStart: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Ngày giao đến', 'Delivery To')}</Label>
                        <Input type="date" value={form.deliveryDateEnd} onChange={e => setForm({ ...form, deliveryDateEnd: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Quốc gia xuất phát', 'Origin Country')}</Label>
                        <Select value={form.originCountry} onValueChange={v => setForm({ ...form, originCountry: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                            <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                            <SelectItem value="Colombia">Colombia</SelectItem>
                            <SelectItem value="Brazil">Brazil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Quốc gia đích', 'Destination Country')}</Label>
                      <Select value={form.destinationCountry} onValueChange={v => setForm({ ...form, destinationCountry: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="South Korea">South Korea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Requirements */}
                {createStep === 2 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Chứng nhận yêu cầu', 'Required Certifications')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {['UTZ', 'Rainforest Alliance', 'Organic', 'Fairtrade', '4C', 'JAS Organic'].map((cert) => (
                          <Badge
                            key={cert}
                            variant={form.certifications.includes(cert) ? 'default' : 'outline'}
                            className="cursor-pointer font-mono text-xs"
                            onClick={() => {
                              const certs = form.certifications.includes(cert)
                                ? form.certifications.filter(c => c !== cert)
                                : [...form.certifications, cert]
                              setForm({ ...form, certifications: certs })
                            }}
                          >
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Phương pháp chế biến', 'Processing Method')}</Label>
                        <Select value={form.processingMethod} onValueChange={v => setForm({ ...form, processingMethod: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Wet Processed">Wet Processed</SelectItem>
                            <SelectItem value="Dry Processed">Dry Processed</SelectItem>
                            <SelectItem value="Honey Processed">Honey Processed</SelectItem>
                            <SelectItem value="Wet-Hulled (Giling Basah)">Wet-Hulled</SelectItem>
                            <SelectItem value="Natural/Dry Processed">Natural/Dry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-xs">{t2('Điểm cupping tối thiểu', 'Min Cup Score')}</Label>
                        <Input type="number" placeholder="80" value={form.minCupScore} onChange={e => setForm({ ...form, minCupScore: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Ghi chú', 'Notes')}</Label>
                      <Textarea placeholder="Additional requirements or notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                  </div>
                )}

                <DialogFooter className="flex-row gap-2">
                  {createStep > 0 && (
                    <Button variant="outline" onClick={() => setCreateStep(createStep - 1)} className="font-mono">
                      {t2('Quay lại', 'Back')}
                    </Button>
                  )}
                  {createStep < 2 ? (
                    <Button onClick={() => setCreateStep(createStep + 1)} className="font-mono">
                      {t2('Tiếp theo', 'Next')}
                    </Button>
                  ) : (
                    <Button onClick={() => { setDialogOpen(false); setCreateStep(0); setForm({ ...INITIAL_FORM }) }} className="font-mono">
                      {t2('Tạo RFQ', 'Create RFQ')}
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
            { label: t2('Tổng RFQ', 'Total RFQs'), value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: t2('Đã xuất bản', 'Published'), value: stats.published, bg: 'bg-blue-100 dark:bg-blue-900', color: 'text-blue-600 dark:text-blue-300' },
            { label: t2('Đã phản hồi', 'Responded'), value: stats.responded, bg: 'bg-amber-100 dark:bg-amber-900', color: 'text-amber-600 dark:text-amber-300' },
            { label: t2('Đã trao quyền', 'Awarded'), value: stats.awarded, bg: 'bg-green-100 dark:bg-green-900', color: 'text-green-600 dark:text-green-300' },
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

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              className="flex-1"
              placeholder={t2('Tìm kiếm RFQ...', 'Search RFQs...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t2('Tất cả trạng thái', 'All Statuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t2('Tất cả', 'All')}</SelectItem>
                {Object.keys(STATUS_COLORS).map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">RFQ ID</TableHead>
                      <TableHead className="font-mono">{t2('Tiêu đề', 'Title')}</TableHead>
                      <TableHead className="font-mono">{t2('Hàng hóa', 'Commodity')}</TableHead>
                      <TableHead className="font-mono">{t2('Số lượng', 'Quantity')}</TableHead>
                      <TableHead className="font-mono">{t2('Trạng thái', 'Status')}</TableHead>
                      <TableHead className="font-mono">{t2('Ngày xuất bản', 'Published Date')}</TableHead>
                      <TableHead className="font-mono">{t2('Phản hồi', 'Responses')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <FileQuestion className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p>{t2('Không tìm thấy RFQ', 'No RFQs found')}</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((rfq) => (
                      <TableRow
                        key={rfq.id}
                        className="group hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setDetailItem(rfq)}
                      >
                        <TableCell className="font-medium font-mono text-xs">{rfq.id}</TableCell>
                        <TableCell className="text-sm font-medium">{rfq.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">{rfq.commodity} · {rfq.grade}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{rfq.quantity.toLocaleString()} kg</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[rfq.status]} border text-xs capitalize`}>{rfq.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{rfq.publishedDate || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {rfq.responsesCount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono">{t2('Chi tiết RFQ', 'RFQ Details')}</DialogTitle>
            </DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm">{detailItem.id}</span>
                  <Badge className={`${STATUS_COLORS[detailItem.status]} border capitalize text-xs`}>{detailItem.status}</Badge>
                </div>
                <h3 className="text-lg font-semibold">{detailItem.title}</h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Hàng hóa', 'Commodity')}</span>
                    <p className="font-medium">{detailItem.commodity} · {detailItem.variety}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Hạng', 'Grade')}</span>
                    <p className="font-medium">{detailItem.grade}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Số lượng', 'Quantity')}</span>
                    <p className="font-medium">{detailItem.quantity.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Giá mục tiêu', 'Target Price')}</span>
                    <p className="font-medium font-mono">{formatCurrency(detailItem.targetPrice, detailItem.currency)}/kg</p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">{t2('Giao hàng', 'Delivery')}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">{t2('Địa điểm', 'Location')}</span>
                      <p className="font-medium">{detailItem.deliveryLocation}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">{t2('Ngày', 'Date Range')}</span>
                      <p className="font-medium text-xs">{detailItem.deliveryDateRange}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Incoterms</span>
                      <p className="font-medium font-mono">{detailItem.incoterms}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">{t2('Tuyến đường', 'Route')}</span>
                      <p className="font-medium">{detailItem.originCountry} → {detailItem.destinationCountry}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">{t2('Yêu cầu', 'Requirements')}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">{t2('Chứng nhận', 'Certifications')}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {detailItem.certifications.map(c => (
                          <Badge key={c} variant="outline" className="text-xs font-mono">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">{t2('Chế biến', 'Processing')}</span>
                      <p className="font-medium">{detailItem.processingMethod}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">{t2('Điểm cupping tối thiểu', 'Min Cup Score')}</span>
                      <p className="font-medium font-mono">{detailItem.minCupScore}+</p>
                    </div>
                    {detailItem.notes && (
                      <div>
                        <span className="text-muted-foreground text-xs">{t2('Ghi chú', 'Notes')}</span>
                        <p className="font-medium text-xs">{detailItem.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t2('Số phản hồi', 'Responses Count')}</span>
                    <span className="font-bold font-mono">{detailItem.responsesCount}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}

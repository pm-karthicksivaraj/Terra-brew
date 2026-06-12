'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ClipboardCheck, Plus, CheckCircle2, XCircle, Clock, Shield, Star, Zap } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { useI18n } from '@/i18n'

// ─── Status colors ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-blue-100 text-blue-800 border-blue-200',
  scheduled: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

// ─── Pricing tiers ──────────────────────────────────────────────
const PRICING_TIERS = [
  {
    id: 'S-3',
    name: 'S-3',
    price: 118,
    currency: 'USD',
    description: 'Standard Sampling',
    color: 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/30',
    icon: Shield,
    features: [
      'Visual inspection & grading',
      'Moisture content measurement',
      'Defect count & classification',
      'Sample retention (500g)',
      'Digital photo documentation',
      'Standard report (PDF)',
    ],
  },
  {
    id: 'G-I',
    name: 'G-I',
    price: 188,
    currency: 'USD',
    description: 'General Inspection Level I',
    color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/30',
    popular: true,
    icon: Star,
    features: [
      'All S-3 features',
      'Cupping evaluation (3 roasts)',
      'Screen size analysis',
      'Density measurement',
      'Water activity testing',
      'Aflatoxin rapid test',
      'Detailed report + photos + cupping notes',
      'Certificate of inspection',
    ],
  },
  {
    id: 'G-II',
    name: 'G-II',
    price: 268,
    currency: 'USD',
    description: 'General Inspection Level II',
    color: 'border-green-300 bg-green-50/50 dark:bg-green-950/30',
    icon: Zap,
    features: [
      'All G-I features',
      'Full laboratory analysis',
      'Pesticide residue screening',
      'Ochratoxin A test',
      'Heavy metals analysis',
      'Microbial testing (E.coli, Salmonella)',
      'Comprehensive report + lab certificates',
      'Blockchain-anchored results',
      'Priority scheduling (48h turnaround)',
    ],
  },
]

// ─── Mock data ──────────────────────────────────────────────────
const MOCK_INSPECTIONS = [
  {
    id: 'INS-2024-001',
    type: 'pre_shipment',
    inspectionLevel: 'G-I',
    commodity: 'Robusta Green Beans',
    quantity: 18000,
    supplier: 'Dak Lak Province Co-op',
    inspector: 'Nguyen Van Minh',
    date: '2024-11-20',
    status: 'completed',
    passFail: 'pass',
    country: 'Vietnam',
    location: 'Cat Lai Port, HCMC',
  },
  {
    id: 'INS-2024-002',
    type: 'during_production',
    inspectionLevel: 'G-II',
    commodity: 'Arabica Specialty SHB',
    quantity: 5000,
    supplier: 'Lam Dong Highland Farm',
    inspector: 'Tran Thi Lan',
    date: '2024-11-22',
    status: 'in_progress',
    passFail: null,
    country: 'Vietnam',
    location: 'Bao Loc Processing Plant',
  },
  {
    id: 'INS-2024-003',
    type: 'final',
    inspectionLevel: 'S-3',
    commodity: 'Robusta Screen 16+',
    quantity: 24000,
    supplier: 'Gia Lai Coffee Export',
    inspector: 'Le Hoang Anh',
    date: '2024-11-25',
    status: 'scheduled',
    passFail: null,
    country: 'Vietnam',
    location: 'Pleiku Warehouse',
  },
  {
    id: 'INS-2024-004',
    type: 'container_loading',
    inspectionLevel: 'G-I',
    commodity: 'Arabica Excelsa Blend',
    quantity: 8000,
    supplier: 'Son La Organic Farm',
    inspector: 'Pham Duc Thanh',
    date: '2024-11-28',
    status: 'requested',
    passFail: null,
    country: 'Vietnam',
    location: 'Hai Phong Port',
  },
  {
    id: 'INS-2024-005',
    type: 'pre_shipment',
    inspectionLevel: 'G-II',
    commodity: 'Robusta Grade 2',
    quantity: 12000,
    supplier: 'Kon Tum Agri Ltd',
    inspector: 'Vo Minh Tuan',
    date: '2024-11-18',
    status: 'completed',
    passFail: 'fail',
    country: 'Vietnam',
    location: 'Kon Tum Processing Facility',
  },
  {
    id: 'INS-2024-006',
    type: 'final',
    inspectionLevel: 'S-3',
    commodity: 'Arabica Wet-Hulled',
    quantity: 3200,
    supplier: 'Sumatra Gayo Co-op',
    inspector: 'Budi Santoso',
    date: '2024-11-30',
    status: 'cancelled',
    passFail: null,
    country: 'Indonesia',
    location: 'Belawan Port, Medan',
  },
]

// ─── Form state ─────────────────────────────────────────────────
interface InspectionForm {
  type: string
  inspectionLevel: string
  commodity: string
  quantity: string
  supplierName: string
  location: string
  country: string
  requestedDate1: string
  requestedDate2: string
  notes: string
}

const INITIAL_FORM: InspectionForm = {
  type: 'pre_shipment',
  inspectionLevel: 'G-I',
  commodity: '',
  quantity: '',
  supplierName: '',
  location: '',
  country: 'Vietnam',
  requestedDate1: '',
  requestedDate2: '',
  notes: '',
}

export default function InspectionsPage() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const [inspections] = useState(MOCK_INSPECTIONS)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<InspectionForm>({ ...INITIAL_FORM })

  const stats = useMemo(() => ({
    total: inspections.length,
    inProgress: inspections.filter(i => i.status === 'in_progress').length,
    completed: inspections.filter(i => i.status === 'completed').length,
    passRate: inspections.filter(i => i.passFail === 'pass').length /
      Math.max(inspections.filter(i => i.passFail).length, 1) * 100,
  }), [inspections])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return inspections
    return inspections.filter(i => i.status === statusFilter)
  }, [inspections, statusFilter])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
  }

  const TYPE_LABELS: Record<string, string> = {
    pre_shipment: t2('Trước khi gửi', 'Pre-Shipment'),
    during_production: t2('Trong sản xuất', 'During Production'),
    final: t2('Kiểm tra cuối', 'Final Inspection'),
    container_loading: t2('Đóng container', 'Container Loading'),
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-primary" />
                {t2('Dịch vụ Kiểm tra', 'Inspection Service')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t2('Đặt kiểm tra chuyên nghiệp cho lô hàng cà phê của bạn', 'Book professional inspections for your coffee shipments')}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm({ ...INITIAL_FORM }) }}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  {t2('Yêu cầu Kiểm tra', 'Request Inspection')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-mono">{t2('Yêu cầu Kiểm tra Mới', 'Request New Inspection')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Loại kiểm tra', 'Inspection Type')}</Label>
                      <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre_shipment">Pre-Shipment</SelectItem>
                          <SelectItem value="during_production">During Production</SelectItem>
                          <SelectItem value="final">Final Inspection</SelectItem>
                          <SelectItem value="container_loading">Container Loading</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Cấp kiểm tra', 'Inspection Level')}</Label>
                      <Select value={form.inspectionLevel} onValueChange={v => setForm({ ...form, inspectionLevel: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S-3">S-3 — {formatCurrency(118, 'USD')}</SelectItem>
                          <SelectItem value="G-I">G-I — {formatCurrency(188, 'USD')}</SelectItem>
                          <SelectItem value="G-II">G-II — {formatCurrency(268, 'USD')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Hàng hóa', 'Commodity')}</Label>
                      <Input placeholder="Robusta Green Beans" value={form.commodity} onChange={e => setForm({ ...form, commodity: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Số lượng (kg)', 'Quantity (kg)')}</Label>
                      <Input type="number" placeholder="18000" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Nhà cung cấp', 'Supplier Info')}</Label>
                    <Input placeholder="Supplier / producer name" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Địa điểm', 'Location')}</Label>
                      <Input placeholder="Warehouse / Port" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Quốc gia', 'Country')}</Label>
                      <Select value={form.country} onValueChange={v => setForm({ ...form, country: v })}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Ngày yêu cầu 1', 'Requested Date 1')}</Label>
                      <Input type="date" value={form.requestedDate1} onChange={e => setForm({ ...form, requestedDate1: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Ngày yêu cầu 2', 'Requested Date 2')}</Label>
                      <Input type="date" value={form.requestedDate2} onChange={e => setForm({ ...form, requestedDate2: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Ghi chú', 'Notes')}</Label>
                    <Textarea placeholder="Special requirements or notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setDialogOpen(false); setForm({ ...INITIAL_FORM }) }} className="font-mono">
                    {t2('Gửi yêu cầu', 'Submit Request')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Pricing Cards */}
        <StaggerContainer className="grid md:grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier) => (
            <StaggerItem key={tier.id}>
              <MotionCard {...hoverScale} className={`rounded-xl border-2 ${tier.color} relative`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-mono px-3">
                      {t2('Phổ biến nhất', 'Most Popular')}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center gap-2">
                    <tier.icon className="w-5 h-5 text-primary" />
                    <CardTitle className="font-mono text-lg">{tier.name}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <div>
                    <span className="text-3xl font-bold font-mono">{formatCurrency(tier.price, tier.currency)}</span>
                    <span className="text-sm text-muted-foreground"> / {t2('lần', 'inspection')}</span>
                  </div>
                  <Separator />
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Stats Row */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t2('Tổng kiểm tra', 'Total Inspections'), value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: t2('Đang thực hiện', 'In Progress'), value: stats.inProgress, bg: 'bg-purple-100 dark:bg-purple-900', color: 'text-purple-600 dark:text-purple-300' },
            { label: t2('Hoàn thành', 'Completed'), value: stats.completed, bg: 'bg-green-100 dark:bg-green-900', color: 'text-green-600 dark:text-green-300' },
            { label: t2('Tỷ lệ đạt', 'Pass Rate'), value: `${stats.passRate.toFixed(0)}%`, bg: 'bg-amber-100 dark:bg-amber-900', color: 'text-amber-600 dark:text-amber-300' },
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

        {/* Active Inspections Table */}
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">Request ID</TableHead>
                      <TableHead className="font-mono">{t2('Loại', 'Type')}</TableHead>
                      <TableHead className="font-mono">{t2('Hàng hóa', 'Commodity')}</TableHead>
                      <TableHead className="font-mono">{t2('Kiểm tra viên', 'Inspector')}</TableHead>
                      <TableHead className="font-mono">{t2('Ngày', 'Date')}</TableHead>
                      <TableHead className="font-mono">{t2('Trạng thái', 'Status')}</TableHead>
                      <TableHead className="font-mono">{t2('Đạt/Lỗi', 'Pass/Fail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p>{t2('Không tìm thấy kiểm tra', 'No inspections found')}</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((insp) => (
                      <TableRow key={insp.id} className="group hover:bg-muted/50 cursor-pointer transition-colors">
                        <TableCell className="font-medium font-mono text-xs">{insp.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">{TYPE_LABELS[insp.type] || insp.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{insp.commodity}</TableCell>
                        <TableCell className="text-sm">{insp.inspector}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{insp.date}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[insp.status]} border text-xs capitalize`}>{insp.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          {insp.passFail === 'pass' ? (
                            <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs font-mono">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> PASS
                            </Badge>
                          ) : insp.passFail === 'fail' ? (
                            <Badge className="bg-red-100 text-red-800 border border-red-200 text-xs font-mono">
                              <XCircle className="w-3 h-3 mr-1" /> FAIL
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t2('Chờ', 'Pending')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
  )
}

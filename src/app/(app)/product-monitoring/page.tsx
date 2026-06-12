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
import { Activity, Plus, CheckCircle2, XCircle, Clock, Eye, Factory, Package, FileText } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { useI18n } from '@/i18n'

// ─── Status colors ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
}

// ─── Mock data ──────────────────────────────────────────────────
const MOCK_MONITORING = [
  {
    id: 'MON-2024-001',
    type: 'production_progress',
    product: 'Robusta Green Beans G2',
    batchId: 'BATCH-DL-2024-089',
    orderRef: 'PO-2024-0456',
    factory: 'Dak Lak Processing Co.',
    factoryAddress: '123 Nguyen Tat Thanh, Buon Ma Thuot',
    country: 'Vietnam',
    date: '2024-11-20',
    status: 'completed',
    report: {
      qtyOrdered: 18000,
      qtyProduced: 18200,
      qtyPassed: 17850,
      qtyFailed: 350,
      packingStatus: 'conform' as const,
      shippingMarkStatus: 'conform' as const,
      labellingStatus: 'conform' as const,
      findings: 'Production completed ahead of schedule. 2% overproduction noted. Quality within specifications. Minor label alignment issue on 2% of bags — corrected on-site. Overall excellent compliance.',
    },
  },
  {
    id: 'MON-2024-002',
    type: 'on_site_verification',
    product: 'Arabica Specialty SHB',
    batchId: 'BATCH-LD-2024-034',
    orderRef: 'PO-2024-0478',
    factory: 'Lam Dong Highland Mill',
    factoryAddress: '456 Tran Hung Dao, Bao Loc',
    country: 'Vietnam',
    date: '2024-11-22',
    status: 'in_progress',
    report: null,
  },
  {
    id: 'MON-2024-003',
    type: 'quality_check',
    product: 'Robusta Screen 16+',
    batchId: 'BATCH-GL-2024-112',
    orderRef: 'PO-2024-0501',
    factory: 'Gia Lai Coffee Export',
    factoryAddress: '789 Le Loi, Pleiku',
    country: 'Vietnam',
    date: '2024-11-25',
    status: 'scheduled',
    report: null,
  },
  {
    id: 'MON-2024-004',
    type: 'shipment_monitoring',
    product: 'Arabica Excelsa Blend',
    batchId: 'BATCH-SL-2024-056',
    orderRef: 'PO-2024-0512',
    factory: 'Son La Organic Processing',
    factoryAddress: '321 Quang Trung, Son La City',
    country: 'Vietnam',
    date: '2024-11-28',
    status: 'scheduled',
    report: null,
  },
  {
    id: 'MON-2024-005',
    type: 'production_progress',
    product: 'Robusta Grade 2',
    batchId: 'BATCH-KT-2024-078',
    orderRef: 'PO-2024-0489',
    factory: 'Kon Tum Agri Processing',
    factoryAddress: '654 Phan Dinh Phung, Kon Tum',
    country: 'Vietnam',
    date: '2024-11-18',
    status: 'completed',
    report: {
      qtyOrdered: 12000,
      qtyProduced: 11800,
      qtyPassed: 11200,
      qtyFailed: 600,
      packingStatus: 'non_conform' as const,
      shippingMarkStatus: 'conform' as const,
      labellingStatus: 'non_conform' as const,
      findings: 'Production shortfall of 200kg (1.7%). 5% failure rate due to excessive moisture in batch KT-078B. Packing non-conformity: inner liner seal integrity failed on 15% of jumbo bags. Labelling non-conformity: lot codes illegible on 8% of packages. Corrective actions requested from supplier.',
    },
  },
]

// ─── Form state ─────────────────────────────────────────────────
interface MonitoringForm {
  type: string
  productName: string
  batchId: string
  orderRef: string
  factoryName: string
  factoryAddress: string
  country: string
  scheduledDate: string
  notes: string
}

const INITIAL_FORM: MonitoringForm = {
  type: 'production_progress',
  productName: '',
  batchId: '',
  orderRef: '',
  factoryName: '',
  factoryAddress: '',
  country: 'Vietnam',
  scheduledDate: '',
  notes: '',
}

export default function ProductMonitoringPage() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const [monitorings] = useState(MOCK_MONITORING)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<MonitoringForm>({ ...INITIAL_FORM })
  const [viewReport, setViewReport] = useState<typeof MOCK_MONITORING[0] | null>(null)

  const stats = useMemo(() => ({
    total: monitorings.length,
    inProgress: monitorings.filter(m => m.status === 'in_progress').length,
    completed: monitorings.filter(m => m.status === 'completed').length,
    conformRate: monitorings.filter(m => m.report?.packingStatus === 'conform' && m.report?.labellingStatus === 'conform').length /
      Math.max(monitorings.filter(m => m.report).length, 1) * 100,
  }), [monitorings])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return monitorings
    return monitorings.filter(m => m.status === statusFilter)
  }, [monitorings, statusFilter])

  const TYPE_LABELS: Record<string, string> = {
    production_progress: t2('Tiến độ sản xuất', 'Production Progress'),
    on_site_verification: t2('Xác minh tại chỗ', 'On-Site Verification'),
    quality_check: t2('Kiểm tra chất lượng', 'Quality Check'),
    shipment_monitoring: t2('Giám sát vận chuyển', 'Shipment Monitoring'),
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                {t2('Giám sát Sản phẩm', 'Product Monitoring')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t2('Lên lịch giám sát sản xuất và kiểm tra tại nhà máy', 'Schedule production monitoring and on-site factory inspections')}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm({ ...INITIAL_FORM }) }}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-mono">
                  <Plus className="w-4 h-4" />
                  {t2('Lên lịch Giám sát', 'Schedule Monitoring')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-mono">{t2('Lên lịch Giám sát Mới', 'Schedule New Monitoring')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Loại giám sát', 'Monitoring Type')}</Label>
                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production_progress">Production Progress</SelectItem>
                        <SelectItem value="on_site_verification">On-Site Verification</SelectItem>
                        <SelectItem value="quality_check">Quality Check</SelectItem>
                        <SelectItem value="shipment_monitoring">Shipment Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Tên sản phẩm', 'Product Name')}</Label>
                      <Input placeholder="Robusta Green Beans G2" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Mã lô', 'Batch ID')}</Label>
                      <Input placeholder="BATCH-DL-2024-089" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Tham chiếu đơn hàng', 'Order Reference')}</Label>
                    <Input placeholder="PO-2024-0456" value={form.orderRef} onChange={e => setForm({ ...form, orderRef: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs">{t2('Tên nhà máy', 'Factory Name')}</Label>
                      <Input placeholder="Dak Lak Processing Co." value={form.factoryName} onChange={e => setForm({ ...form, factoryName: e.target.value })} />
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
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Địa chỉ nhà máy', 'Factory Address')}</Label>
                    <Input placeholder="123 Nguyen Tat Thanh, Buon Ma Thuot" value={form.factoryAddress} onChange={e => setForm({ ...form, factoryAddress: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Ngày lên lịch', 'Scheduled Date')}</Label>
                    <Input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">{t2('Ghi chú', 'Notes')}</Label>
                    <Textarea placeholder="Special requirements or notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setDialogOpen(false); setForm({ ...INITIAL_FORM }) }} className="font-mono">
                    {t2('Lên lịch', 'Schedule')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Stats Row */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t2('Tổng giám sát', 'Total Monitorings'), value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: t2('Đang thực hiện', 'In Progress'), value: stats.inProgress, bg: 'bg-purple-100 dark:bg-purple-900', color: 'text-purple-600 dark:text-purple-300' },
            { label: t2('Hoàn thành', 'Completed'), value: stats.completed, bg: 'bg-green-100 dark:bg-green-900', color: 'text-green-600 dark:text-green-300' },
            { label: t2('Tỷ lệ phù hợp', 'Conform Rate'), value: `${stats.conformRate.toFixed(0)}%`, bg: 'bg-amber-100 dark:bg-amber-900', color: 'text-amber-600 dark:text-amber-300' },
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

        {/* Active Monitoring Table */}
        <FadeIn delay={0.2}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">ID</TableHead>
                      <TableHead className="font-mono">{t2('Loại', 'Type')}</TableHead>
                      <TableHead className="font-mono">{t2('Sản phẩm', 'Product')}</TableHead>
                      <TableHead className="font-mono">{t2('Nhà máy', 'Factory')}</TableHead>
                      <TableHead className="font-mono">{t2('Ngày', 'Date')}</TableHead>
                      <TableHead className="font-mono">{t2('Trạng thái', 'Status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p>{t2('Không tìm thấy giám sát', 'No monitorings found')}</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((mon) => (
                      <TableRow
                        key={mon.id}
                        className="group hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => mon.report ? setViewReport(mon) : undefined}
                      >
                        <TableCell className="font-medium font-mono text-xs">{mon.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">{TYPE_LABELS[mon.type] || mon.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{mon.product}</TableCell>
                        <TableCell className="text-sm">{mon.factory}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mon.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={`${STATUS_COLORS[mon.status]} border text-xs capitalize`}>{mon.status.replace('_', ' ')}</Badge>
                            {mon.report && (
                              <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Monitoring Report Dialog */}
        <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono">{t2('Báo cáo Giám sát', 'Monitoring Report')}</DialogTitle>
            </DialogHeader>
            {viewReport && viewReport.report && (
              <div className="space-y-5 py-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm">{viewReport.id}</span>
                  <Badge className={`${STATUS_COLORS[viewReport.status]} border capitalize text-xs`}>{viewReport.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Sản phẩm', 'Product')}</span>
                    <p className="font-medium">{viewReport.product}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Mã lô', 'Batch ID')}</span>
                    <p className="font-medium font-mono">{viewReport.batchId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Nhà máy', 'Factory')}</span>
                    <p className="font-medium">{viewReport.factory}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">{t2('Quốc gia', 'Country')}</span>
                    <p className="font-medium">{viewReport.country}</p>
                  </div>
                </div>

                <Separator />

                {/* Quantity summary */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono mb-3 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" /> {t2('Tóm tắt Số lượng', 'Quantity Summary')}
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: t2('Đặt hàng', 'Ordered'), value: viewReport.report.qtyOrdered, color: 'text-blue-600' },
                      { label: t2('Đã sản xuất', 'Produced'), value: viewReport.report.qtyProduced, color: 'text-primary' },
                      { label: t2('Đạt', 'Passed'), value: viewReport.report.qtyPassed, color: 'text-green-600' },
                      { label: t2('Lỗi', 'Failed'), value: viewReport.report.qtyFailed, color: 'text-red-600' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className={`text-lg font-bold font-mono ${item.color}`}>{item.value.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance status */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono mb-3 flex items-center gap-1">
                    <Factory className="w-3.5 h-3.5" /> {t2('Trạng thái Tuân thủ', 'Compliance Status')}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: t2('Đóng gói', 'Packing'), status: viewReport.report.packingStatus },
                      { label: t2('Shipping Mark', 'Shipping Mark'), status: viewReport.report.shippingMarkStatus },
                      { label: t2('Nhãn mác', 'Labelling'), status: viewReport.report.labellingStatus },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 bg-muted/50 rounded-lg">
                        {item.status === 'conform' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                        )}
                        <p className="text-xs font-medium">{item.label}</p>
                        <Badge className={`text-[10px] font-mono mt-1 ${item.status === 'conform' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border`}>
                          {item.status === 'conform' ? t2('Phù hợp', 'CONFORM') : t2('Không phù hợp', 'NON-CONFORM')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspector findings */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono mb-2 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {t2('Kết quả Kiểm tra', 'Inspector Findings')}
                  </h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">{viewReport.report.findings}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}

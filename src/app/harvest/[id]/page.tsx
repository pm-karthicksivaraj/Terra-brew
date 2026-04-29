'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Wheat, Loader2, Pencil, ThermometerSun, Droplets,
  Hash, Scale, Coffee, Calendar, CheckCircle, XCircle,
  Sun, Timer, Beaker, AlertTriangle, BadgeCheck, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface FarmerSummary {
  id: string
  fullName: string
  farmerCode: string | null
  province: string | null
  contactNumber: string | null
}

interface FarmLandSummary {
  id: string
  farmName: string
  plotBlockId: string | null
  totalLandHolding: number | null
  altitude: number | null
}

interface HarvestDetail {
  id: string
  farmerId: string
  farmLandId: string
  cultivationId: string | null
  plannedHarvestDate: string | null
  plotBlockId: string | null
  coffeeVariety: string | null
  estimatedYield: string | null
  actualHarvestDate: string | null
  harvestMethod: string | null
  cherryRipeness: number | null
  harvestLabourCost: number | null
  sampleWeight: number | null
  sampleArea: number | null
  sampleYield: number | null
  estimatedYieldPerHa: number | null
  processingMethod: string | null
  dryingMethod: string | null
  dryingDurationDays: number | null
  targetMoisture: number | null
  moistureContent: number | null
  defectiveBeans: number | null
  foreignMatter: number | null
  cupScore: number | null
  batchId: string | null
  coffeeVarietyAtBatch: string | null
  processingStage: string | null
  batchTimestamp: string | null
  location: string | null
  actor: string | null
  batchNotes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: FarmerSummary
  farmLand: FarmLandSummary
}

export default function HarvestDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [harvest, setHarvest] = useState<HarvestDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const fetchHarvest = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/harvest-traceabilities?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setHarvest(data.data?.data ?? null)
      } else {
        toast.error(data.error || t('Không tìm thấy bản ghi', 'Record not found'))
        router.push('/harvest')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router, t])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchHarvest()
    }
  }, [status, router, fetchHarvest])

  const cupScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return 'bg-muted text-muted-foreground'
    if (score >= 85) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  const stageColor = (stage: string | null) => {
    switch (stage?.toLowerCase()) {
      case 'harvested': return 'bg-emerald-100 text-emerald-700'
      case 'processed': return 'bg-blue-100 text-blue-700'
      case 'drying': return 'bg-amber-100 text-amber-700'
      case 'hulled': return 'bg-purple-100 text-purple-700'
      case 'sorted': return 'bg-cyan-100 text-cyan-700'
      case 'stored': return 'bg-muted text-foreground'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Wheat className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!harvest) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t('Không tìm thấy dữ liệu', 'Data not found')}</p>
        </div>
      </DashboardShell>
    )
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string | number | null | undefined; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-2">
      {icon && <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value ?? '-'}</p>
      </div>
    </div>
  )

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/harvest')}
              className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                {harvest.batchId || t('Bản ghi thu hoạch', 'Harvest Record')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {harvest.farmer.fullName} · {harvest.farmLand.farmName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {harvest.processingStage && (
              <Badge className={`${stageColor(harvest.processingStage)} text-[10px] border-0`}>
                {harvest.processingStage}
              </Badge>
            )}
            {harvest.cupScore !== null && harvest.cupScore !== undefined && (
              <Badge className={`${cupScoreColor(harvest.cupScore)} text-[10px] border-0 font-bold`}>
                {t('Cup', 'Cup')} {harvest.cupScore}
              </Badge>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs"
              onClick={() => router.push('/harvest')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('Giống CP', 'Variety'), value: harvest.coffeeVariety || '-', icon: Coffee, color: 'from-amber-500 to-amber-700' },
            { label: t('Độ chín', 'Ripeness'), value: harvest.cherryRipeness !== null ? `${harvest.cherryRipeness}%` : '-', icon: Scale, color: 'from-green-500 to-green-700' },
            { label: t('Độ ẩm', 'Moisture'), value: harvest.moistureContent !== null ? `${harvest.moistureContent}%` : '-', icon: Droplets, color: 'from-blue-500 to-blue-700' },
            { label: t('Cup Score', 'Cup Score'), value: harvest.cupScore ?? '-', icon: BarChart3, color: ' ' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Harvest Info */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Wheat className="w-4 h-4 text-muted-foreground" />
                {t('Thông tin thu hoạch', 'Harvest Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Mã lô (Batch ID)', 'Batch ID')} value={harvest.batchId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Giống cà phê', 'Coffee Variety')} value={harvest.coffeeVariety} icon={<Coffee className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Mã lô đất', 'Plot Block ID')} value={harvest.plotBlockId} />
              <InfoRow label={t('Ngày thu hoạch dự kiến', 'Planned Harvest Date')} value={harvest.plannedHarvestDate ? new Date(harvest.plannedHarvestDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Ngày thu hoạch thực tế', 'Actual Harvest Date')} value={harvest.actualHarvestDate ? new Date(harvest.actualHarvestDate).toLocaleDateString() : null} />
              <InfoRow label={t('Phương pháp thu hoạch', 'Harvest Method')} value={harvest.harvestMethod} />
              <InfoRow label={t('Sản lượng dự kiến', 'Estimated Yield')} value={harvest.estimatedYield} />
              <InfoRow label={t('Chi phí nhân công (VND)', 'Harvest Labour Cost (VND)')} value={harvest.harvestLabourCost?.toLocaleString()} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Nông dân', 'Farmer')} value={harvest.farmer.fullName} />
              <InfoRow label={t('Đất nông trại', 'Farm Land')} value={harvest.farmLand.farmName} />
              {harvest.farmLand.altitude && (
                <InfoRow label={t('Độ cao', 'Altitude')} value={`${harvest.farmLand.altitude}m`} />
              )}
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Beaker className="w-4 h-4 text-muted-foreground" />
                {t('Chỉ số chất lượng', 'Quality Metrics')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Cherry Ripeness */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground uppercase">{t('Độ chín (%)', 'Cherry Ripeness (%)')}</p>
                  <span className="text-sm font-bold text-foreground">{harvest.cherryRipeness !== null ? `${harvest.cherryRipeness}%` : '-'}</span>
                </div>
                {harvest.cherryRipeness !== null && (
                  <Progress value={harvest.cherryRipeness} className="h-2 bg-muted" />
                )}
              </div>

              {/* Cup Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground uppercase">{t('Điểm cupping', 'Cup Score')}</p>
                  <Badge className={`${cupScoreColor(harvest.cupScore)} text-[10px] border-0 font-bold`}>
                    {harvest.cupScore ?? '-'}
                  </Badge>
                </div>
                {harvest.cupScore !== null && (
                  <Progress value={harvest.cupScore} className="h-2 bg-muted" />
                )}
              </div>

              {/* Moisture Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground uppercase">{t('Độ ẩm (%)', 'Moisture Content (%)')}</p>
                  <span className="text-sm font-bold text-foreground">{harvest.moistureContent !== null ? `${harvest.moistureContent}%` : '-'}</span>
                </div>
                {harvest.moistureContent !== null && (
                  <div className="flex items-center gap-2">
                    <Progress value={harvest.moistureContent} className="h-2 bg-muted" />
                    {harvest.targetMoisture && (
                      <span className="text-[10px] text-muted-foreground">{t('Mục tiêu', 'Target')}: {harvest.targetMoisture}%</span>
                    )}
                  </div>
                )}
              </div>

              <Separator className="my-2 bg-muted" />

              {/* Defective & Foreign */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-[9px] text-muted-foreground uppercase">{t('Hạt lỗi (%)', 'Defective Beans (%)')}</p>
                  <p className="text-lg font-bold text-foreground">{harvest.defectiveBeans !== null ? `${harvest.defectiveBeans}%` : '-'}</p>
                  {harvest.defectiveBeans !== null && harvest.defectiveBeans > 5 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[9px]">{t('Cao', 'High')}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-[9px] text-muted-foreground uppercase">{t('Tạp chất (%)', 'Foreign Matter (%)')}</p>
                  <p className="text-lg font-bold text-foreground">{harvest.foreignMatter !== null ? `${harvest.foreignMatter}%` : '-'}</p>
                </div>
              </div>

              <Separator className="my-2 bg-muted" />

              {/* Sample Data */}
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('Dữ liệu mẫu', 'Sample Data')}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-muted text-center">
                  <p className="text-[9px] text-muted-foreground">{t('TL mẫu (kg)', 'Sample Wt')}</p>
                  <p className="text-sm font-bold text-foreground">{harvest.sampleWeight ?? '-'}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted text-center">
                  <p className="text-[9px] text-muted-foreground">{t('DT mẫu (m²)', 'Sample Area')}</p>
                  <p className="text-sm font-bold text-foreground">{harvest.sampleArea ?? '-'}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted text-center">
                  <p className="text-[9px] text-muted-foreground">{t('SL mẫu', 'Sample Yield')}</p>
                  <p className="text-sm font-bold text-foreground">{harvest.sampleYield ?? '-'}</p>
                </div>
              </div>
              <InfoRow label={t('SL ước/ha', 'Est. Yield/Ha')} value={harvest.estimatedYieldPerHa} />
            </CardContent>
          </Card>

          {/* Processing & Drying */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <ThermometerSun className="w-4 h-4 text-muted-foreground" />
                {t('Chế biến & Sấy', 'Processing & Drying')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Phương pháp chế biến', 'Processing Method')} value={harvest.processingMethod} icon={<ThermometerSun className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Phương pháp sấy', 'Drying Method')} value={harvest.dryingMethod} icon={<Sun className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Thời gian sấy (ngày)', 'Drying Duration (days)')} value={harvest.dryingDurationDays} icon={<Timer className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Độ ẩm mục tiêu (%)', 'Target Moisture (%)')} value={harvest.targetMoisture} />
              <InfoRow label={t('Độ ẩm thực tế (%)', 'Moisture Content (%)')} value={harvest.moistureContent} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Giai đoạn chế biến', 'Processing Stage')} value={harvest.processingStage} />
            </CardContent>
          </Card>

          {/* Batch Details */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                {t('Chi tiết lô', 'Batch Details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Mã lô (Batch ID)', 'Batch ID')} value={harvest.batchId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Giống CP tại lô', 'Variety at Batch')} value={harvest.coffeeVarietyAtBatch} icon={<Coffee className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Thời gian lô', 'Batch Timestamp')} value={harvest.batchTimestamp ? new Date(harvest.batchTimestamp).toLocaleString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Vị trí', 'Location')} value={harvest.location} />
              <InfoRow label={t('Người thực hiện', 'Actor')} value={harvest.actor} />
              {harvest.batchNotes && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('Ghi chú lô', 'Batch Notes')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1">
                    <p className="text-sm text-foreground">{harvest.batchNotes}</p>
                  </div>
                </>
              )}
              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="uppercase">{t('Ngày tạo', 'Created')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(harvest.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="uppercase">{t('Cập nhật', 'Updated')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(harvest.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

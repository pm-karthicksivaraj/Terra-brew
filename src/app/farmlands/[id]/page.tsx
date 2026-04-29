'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, MapPin, Loader2, Pencil, Mountain, Droplets,
  TreePine, Users, Wheat, ShieldCheck, ThermometerSun,
  Calendar, Ruler, Compass, CheckCircle, XCircle,
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

interface FarmLandDetail {
  id: string
  farmName: string
  plotBlockId: string | null
  totalLandHolding: number | null
  altitude: number | null
  agroEcologicalZone: string | null
  latitude: number | null
  longitude: number | null
  landOwnership: string | null
  soilType: string | null
  irrigationSource: string | null
  irrigationType: string | null
  waterSource: string | null
  powerSource: string | null
  noOfTrees: number | null
  shadeTreeSpecies: string | null
  shadeTreeDensity: number | null
  fullTimeWorkers: number | null
  partTimeWorkers: number | null
  seasonalWorkers: number | null
  familyWorkers: number | null
  estYield: number | null
  conversionCertType: string | null
  currentConversionStatus: string | null
  fertilityStatus: string | null
  childLabourPolicy: boolean
  minimumWageCompliance: boolean
  ppeAvailable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmerId: string
  farmer: FarmerSummary
  _count?: {
    cultivations: number
    harvestTraceabilities: number
    cropMonitorings: number
  }
}

export default function FarmLandDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [farmLand, setFarmLand] = useState<FarmLandDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const fetchFarmLand = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/farmlands?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setFarmLand(data.data?.data ?? null)
      } else {
        toast.error(data.error || t('Không tìm thấy đất nông trại', 'Farm land not found'))
        router.push('/farmlands')
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
      fetchFarmLand()
    }
  }, [status, router, fetchFarmLand])

  if (status === 'loading' || loading) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <MapPin className="w-9 h-9 text-primary-foreground animate-pulse" />
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

  if (!farmLand) {
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

  const BoolBadge = ({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) => (
    <Badge className={`${value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'} text-[10px] border-0 gap-1`}>
      {value ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </Badge>
  )

  const totalWorkers = (farmLand.fullTimeWorkers ?? 0) + (farmLand.partTimeWorkers ?? 0) + (farmLand.seasonalWorkers ?? 0) + (farmLand.familyWorkers ?? 0)

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/farmlands')}
              className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{farmLand.farmName}</h1>
              <p className="text-xs text-muted-foreground">{t('Nông dân', 'Farmer')}: {farmLand.farmer.fullName} {farmLand.farmer.farmerCode ? `(${farmLand.farmer.farmerCode})` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${farmLand.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
              {farmLand.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
            </Badge>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs"
              onClick={() => router.push('/farmlands')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('Diện tích', 'Area'), value: farmLand.totalLandHolding ? `${farmLand.totalLandHolding} ha` : '-', icon: Ruler, color: 'from-emerald-500 to-emerald-700' },
            { label: t('Độ cao', 'Altitude'), value: farmLand.altitude ? `${farmLand.altitude}m` : '-', icon: Mountain, color: 'from-teal-500 to-teal-700' },
            { label: t('Số cây', 'Trees'), value: farmLand.noOfTrees?.toLocaleString() ?? '-', icon: TreePine, color: 'from-amber-500 to-amber-700' },
            { label: t('SL ước', 'Est. Yield'), value: farmLand.estYield ? `${farmLand.estYield.toLocaleString()} kg` : '-', icon: Wheat, color: ' ' },
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
          {/* Basic Info */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {t('Thông tin cơ bản', 'Basic Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Tên nông trại', 'Farm Name')} value={farmLand.farmName} icon={<MapPin className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Mã lô đất', 'Plot Block ID')} value={farmLand.plotBlockId} icon={<Ruler className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Diện tích (ha)', 'Area (ha)')} value={farmLand.totalLandHolding} />
              <InfoRow label={t('Quyền sở hữu', 'Land Ownership')} value={farmLand.landOwnership} />
              <InfoRow label={t('Vùng sinh thái', 'Agro-Ecological Zone')} value={farmLand.agroEcologicalZone} />
              <InfoRow label={t('Loại chuyển đổi', 'Conversion Cert Type')} value={farmLand.conversionCertType} />
              <InfoRow label={t('Trạng thái chuyển đổi', 'Conversion Status')} value={farmLand.currentConversionStatus} />
              <InfoRow label={t('Tình trạng độ phì', 'Fertility Status')} value={farmLand.fertilityStatus} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Nông dân', 'Farmer')} value={farmLand.farmer.fullName} />
              <InfoRow label={t('Mã nông dân', 'Farmer Code')} value={farmLand.farmer.farmerCode} />
              <InfoRow label={t('Tỉnh', 'Province')} value={farmLand.farmer.province} />
            </CardContent>
          </Card>

          {/* Location & Terrain */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Mountain className="w-4 h-4 text-muted-foreground" />
                {t('Vị trí & Địa hình', 'Location & Terrain')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Độ cao (m)', 'Altitude (m)')} value={farmLand.altitude} icon={<Mountain className="w-3.5 h-3.5" />} />
              {farmLand.altitude && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700"
                      style={{ width: `${Math.min(100, (farmLand.altitude / 2000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{farmLand.altitude}m</span>
                </div>
              )}
              <InfoRow label={t('Vĩ độ', 'Latitude')} value={farmLand.latitude} icon={<Compass className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Kinh độ', 'Longitude')} value={farmLand.longitude} />
              <Separator className="my-2 bg-muted" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t('Thống kê', 'Statistics')}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-muted text-center">
                  <p className="text-[9px] text-muted-foreground">{t('Canh tác', 'Cult.')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand._count?.cultivations ?? 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted text-center">
                  <p className="text-[9px] text-muted-foreground">{t('Thu hoạch', 'Harvest')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand._count?.harvestTraceabilities ?? 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted text-center">
                  <p className="text-[9px] text-muted-foreground">{t('Giám sát', 'Monitor')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand._count?.cropMonitorings ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Soil & Irrigation */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Droplets className="w-4 h-4 text-muted-foreground" />
                {t('Đất & Tưới tiêu', 'Soil & Irrigation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Loại đất', 'Soil Type')} value={farmLand.soilType} icon={<ThermometerSun className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Nguồn tưới', 'Irrigation Source')} value={farmLand.irrigationSource} icon={<Droplets className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Loại tưới', 'Irrigation Type')} value={farmLand.irrigationType} />
              <InfoRow label={t('Nguồn nước', 'Water Source')} value={farmLand.waterSource} />
              <InfoRow label={t('Nguồn điện', 'Power Source')} value={farmLand.powerSource} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Loại cây che bóng', 'Shade Tree Species')} value={farmLand.shadeTreeSpecies} icon={<TreePine className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Mật độ cây che bóng', 'Shade Tree Density')} value={farmLand.shadeTreeDensity} />
            </CardContent>
          </Card>

          {/* Workers & Yield */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                {t('Nhân công & Sản lượng', 'Workers & Yield')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase">{t('Tổng nhân công', 'Total Workers')}</p>
                <p className="text-lg font-bold text-foreground">{totalWorkers}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-muted">
                  <p className="text-[9px] text-muted-foreground">{t('Toàn thời gian', 'Full-time')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand.fullTimeWorkers ?? 0}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted">
                  <p className="text-[9px] text-muted-foreground">{t('Bán thời gian', 'Part-time')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand.partTimeWorkers ?? 0}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted">
                  <p className="text-[9px] text-muted-foreground">{t('Thời vụ', 'Seasonal')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand.seasonalWorkers ?? 0}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted">
                  <p className="text-[9px] text-muted-foreground">{t('Gia đình', 'Family')}</p>
                  <p className="text-sm font-bold text-foreground">{farmLand.familyWorkers ?? 0}</p>
                </div>
              </div>
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Số cây', 'Number of Trees')} value={farmLand.noOfTrees?.toLocaleString()} icon={<TreePine className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Sản lượng ước (kg)', 'Est. Yield (kg)')} value={farmLand.estYield?.toLocaleString()} icon={<Wheat className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t('Tuân thủ', 'Compliance')}</p>
              <div className="flex flex-wrap gap-2">
                <BoolBadge value={farmLand.childLabourPolicy} trueLabel={t('Không LĐTE', 'No Child Labour')} falseLabel={t('Có LĐTE', 'Child Labour')} />
                <BoolBadge value={farmLand.minimumWageCompliance} trueLabel={t('Lương tối thiểu', 'Min Wage')} falseLabel={t('Chưa tuân thủ', 'Non-compliant')} />
                <BoolBadge value={farmLand.ppeAvailable} trueLabel={t('Có ĐBH', 'PPE')} falseLabel={t('Không ĐBH', 'No PPE')} />
              </div>
              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="uppercase">{t('Ngày tạo', 'Created')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(farmLand.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="uppercase">{t('Cập nhật', 'Updated')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(farmLand.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

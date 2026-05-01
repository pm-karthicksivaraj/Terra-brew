'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Sprout, Loader2, Pencil, Calendar, Ruler,
  TreePine, Droplets, Hash, CheckCircle, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface CultivationDetail {
  id: string
  farmPlotName: string
  plotBlockId: string | null
  cropCategory: string | null
  intercroppingSpecies: string | null
  harvestSeason: string | null
  cultivatedCrop: string | null
  cropVariety: string | null
  coffeeSpecies: string | null
  cultivationArea: number | null
  plantingSpacing: number | null
  treeDensity: number | null
  sowingDate: string | null
  estYield: string | null
  intendedProcessingMethod: string | null
  irrigationMethod: string | null
  shadeCover: number | null
  latitude: number | null
  longitude: number | null
  seedSource: string | null
  isSeedTreated: boolean
  treatmentDetails: string | null
  seedType: string | null
  seedQuantity: number | null
  seedPrice: number | null
  seedCost: number | null
  intercroppingEnabled: boolean
  intercroppingPartner: string | null
  intercroppingRatio: string | null
  intercroppingScheme: string | null
  isPrimaryCrop: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null; province: string | null; contactNumber: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null; altitude: number | null }
}

export default function CultivationDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<CultivationDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/cultivations?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay canh tac', 'Cultivation not found'))
        router.push('/cultivations')
      }
    } catch {
      toast.error(t2('Loi ket noi', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router, t])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated') fetchItem()
  }, [status, router, fetchItem])

  if (status === 'loading' || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Sprout className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Dang tai...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!item) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Khong tim thay du lieu', 'Data not found')}</p>
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

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/cultivations')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.farmPlotName}</h1>
              <p className="text-xs text-muted-foreground">{item.farmer.fullName} - {item.farmLand.farmName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
              {item.isActive ? t2('Hoat dong', 'Active') : t2('Khong HD', 'Inactive')}
            </Badge>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/cultivations')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Dien tich', 'Area'), value: item.cultivationArea ? `${item.cultivationArea} ha` : '-', icon: Ruler, color: 'from-teal-500 to-teal-700' },
            { label: t2('Mat do', 'Density'), value: item.treeDensity ? `${item.treeDensity}/ha` : '-', icon: TreePine, color: 'from-emerald-500 to-emerald-700' },
            { label: t2('Che phong', 'Shade'), value: item.shadeCover !== null ? `${item.shadeCover}%` : '-', icon: TreePine, color: 'from-green-500 to-green-700' },
            { label: t2('SL uoc', 'Est. Yield'), value: item.estYield || '-', icon: Hash, color: 'from-amber-500 to-amber-700' },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Sprout className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin canh tac', 'Cultivation Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ten lo', 'Plot Name')} value={item.farmPlotName} icon={<Sprout className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Ma lo', 'Plot Block ID')} value={item.plotBlockId} />
              <InfoRow label={t2('Cay trong', 'Crop')} value={item.cultivatedCrop} />
              <InfoRow label={t2('Giong', 'Variety')} value={item.cropVariety} />
              <InfoRow label={t2('Loai CP', 'Coffee Species')} value={item.coffeeSpecies} />
              <InfoRow label={t2('Loai cay trong', 'Crop Category')} value={item.cropCategory} />
              <InfoRow label={t2('Mua thu hoach', 'Harvest Season')} value={item.harvestSeason} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer.fullName} />
              <InfoRow label={t2('Dat nong trai', 'Farm Land')} value={item.farmLand.farmName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {t2('Trong tro & Giong', 'Planting & Seed')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ngay gieo trong', 'Sowing Date')} value={item.sowingDate ? new Date(item.sowingDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('PP che bien du kien', 'Intended Processing')} value={item.intendedProcessingMethod} />
              <InfoRow label={t2('PP tuoi tieu', 'Irrigation Method')} value={item.irrigationMethod} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nguon giong', 'Seed Source')} value={item.seedSource} />
              <InfoRow label={t2('Loai hat giong', 'Seed Type')} value={item.seedType} />
              <InfoRow label={t2('SL hat (kg)', 'Seed Qty (kg)')} value={item.seedQuantity} />
              <InfoRow label={t2('Gia hat', 'Seed Price')} value={item.seedPrice} />
              <InfoRow label={t2('Chi phi hat', 'Seed Cost')} value={item.seedCost} />
              <div className="flex flex-wrap gap-2 mt-2">
                <BoolBadge value={item.isSeedTreated} trueLabel={t2('Da xu ly', 'Treated')} falseLabel={t2('Chua XL', 'Untreated')} />
                <BoolBadge value={item.isPrimaryCrop} trueLabel={t2('Chinh', 'Primary')} falseLabel={t2('Phu', 'Secondary')} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                {t2('Kich thuoc & Vi tri', 'Dimensions & Location')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Dien tich (ha)', 'Area (ha)')} value={item.cultivationArea} icon={<Ruler className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Khoang cach (m)', 'Spacing (m)')} value={item.plantingSpacing} />
              <InfoRow label={t2('Mat do (cay/ha)', 'Density (trees/ha)')} value={item.treeDensity} />
              <InfoRow label={t2('Phu phong (%)', 'Shade Cover (%)')} value={item.shadeCover} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Vi do', 'Latitude')} value={item.latitude} />
              <InfoRow label={t2('Kinh do', 'Longitude')} value={item.longitude} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <TreePine className="w-4 h-4 text-muted-foreground" />
                {t2('Xen canh', 'Intercropping')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <BoolBadge value={item.intercroppingEnabled} trueLabel={t2('Co xen canh', 'Intercropped')} falseLabel={t2('Khong xen canh', 'No Intercrop')} />
              {item.intercroppingEnabled && (
                <>
                  <InfoRow label={t2('Loai xen canh', 'Partner')} value={item.intercroppingPartner} />
                  <InfoRow label={t2('Ty le', 'Ratio')} value={item.intercroppingRatio} />
                  <InfoRow label={t2('Phuong an', 'Scheme')} value={item.intercroppingScheme} />
                  <InfoRow label={t2('Loai xen', 'Species')} value={item.intercroppingSpecies} />
                </>
              )}
              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="uppercase">{t2('Ngay tao', 'Created')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="uppercase">{t2('Cap nhat', 'Updated')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(item.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

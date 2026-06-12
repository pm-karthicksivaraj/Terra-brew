'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, TreePine, Loader2, Pencil, Calendar, MapPin,
  CheckCircle, XCircle, Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface NurseryDetail {
  id: string
  nurseryName: string
  nurseryCode: string | null
  location: string | null
  province: string | null
  district: string | null
  commune: string | null
  latitude: number | null
  longitude: number | null
  nurseryType: string | null
  capacity: number | null
  currentStock: number | null
  species: string | null
  variety: string | null
  seedSource: string | null
  plantingDate: string | null
  expectedReadyDate: string | null
  germinationRate: number | null
  survivalRate: number | null
  healthStatus: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null } | null
}

export default function NurseryDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<NurseryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/nurseries?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay vuon uom', 'Nursery not found'))
        router.push('/nurseries')
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
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <TreePine className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Dang tai...', 'Loading...')}</span>
            </div>
          </div>
        </div>
    )
  }

  if (!item) {
    return (
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Khong tim thay du lieu', 'Data not found')}</p>
        </div>
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

  const stockPct = item.capacity && item.currentStock ? Math.min(100, (item.currentStock / item.capacity) * 100) : null

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/nurseries')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.nurseryName}</h1>
              <p className="text-xs text-muted-foreground">{item.nurseryCode || item.province || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
              {item.isActive ? t2('Hoat dong', 'Active') : t2('Khong HD', 'Inactive')}
            </Badge>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/nurseries')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Suc chua', 'Capacity'), value: item.capacity?.toLocaleString() ?? '-', color: 'from-emerald-500 to-emerald-700' },
            { label: t2('Ton kho', 'Stock'), value: item.currentStock?.toLocaleString() ?? '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Ty le nẩy mam', 'Germination'), value: item.germinationRate !== null ? `${item.germinationRate}%` : '-', color: 'from-green-500 to-green-700' },
            { label: t2('Ty le song', 'Survival'), value: item.survivalRate !== null ? `${item.survivalRate}%` : '-', color: 'from-amber-500 to-amber-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <TreePine className="w-4 h-4 text-white" />
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
                <TreePine className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin vuon uom', 'Nursery Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ten vuon', 'Nursery Name')} value={item.nurseryName} icon={<TreePine className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Ma vuon', 'Nursery Code')} value={item.nurseryCode} />
              <InfoRow label={t2('Loai vuon', 'Nursery Type')} value={item.nurseryType} />
              <InfoRow label={t2('Loai', 'Species')} value={item.species} />
              <InfoRow label={t2('Giong', 'Variety')} value={item.variety} />
              <InfoRow label={t2('Nguon giong', 'Seed Source')} value={item.seedSource} />
              <InfoRow label={t2('Suc khoe', 'Health Status')} value={item.healthStatus} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer?.fullName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {t2('Vi tri & Kho', 'Location & Stock')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Vi tri', 'Location')} value={item.location} icon={<MapPin className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Tinh', 'Province')} value={item.province} />
              <InfoRow label={t2('Huyen', 'District')} value={item.district} />
              <InfoRow label={t2('Xa', 'Commune')} value={item.commune} />
              {(item.latitude || item.longitude) && (
                <InfoRow label={t2('Toa do', 'Coordinates')} value={`${item.latitude ?? '-'}, ${item.longitude ?? '-'}`} icon={<Compass className="w-3.5 h-3.5" />} />
              )}
              <Separator className="my-2 bg-muted" />
              {stockPct !== null && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase">{t2('Ty le ton kho', 'Stock Level')}</p>
                    <span className="text-sm font-bold text-foreground">{stockPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${stockPct}%` }} />
                  </div>
                </div>
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Ngay gieo', 'Planting Date')} value={item.plantingDate ? new Date(item.plantingDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Ngay du kien', 'Expected Ready')} value={item.expectedReadyDate ? new Date(item.expectedReadyDate).toLocaleDateString() : null} />
              {item.notes && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Ghi chu', 'Notes')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1">
                    <p className="text-sm text-foreground">{item.notes}</p>
                  </div>
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
  )
}

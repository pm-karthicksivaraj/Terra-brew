'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Activity, Loader2, Pencil, Calendar, ThermometerSun,
  CheckCircle, XCircle, Droplets, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface CropMonitoringDetail {
  id: string
  monitoringDate: string | null
  monitoringType: string | null
  growthStage: string | null
  plantHeight: number | null
  canopyDiameter: number | null
  leafColor: string | null
  healthScore: number | null
  pestPressure: string | null
  diseaseSymptoms: string | null
  weatherCondition: string | null
  temperature: number | null
  rainfall: number | null
  humidity: number | null
  soilMoisture: number | null
  alertTriggered: boolean
  alertType: string | null
  alertSeverity: string | null
  remedialAction: string | null
  photoUrl: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function CropMonitoringDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<CropMonitoringDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/crop-monitorings?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/crop-monitorings')
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
              <Activity className="w-9 h-9 text-primary-foreground animate-pulse" />
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

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/crop-monitorings')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.monitoringType || t2('Giam sat', 'Monitoring')}</h1>
              <p className="text-xs text-muted-foreground">{item.farmer.fullName} - {item.farmLand.farmName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.alertTriggered && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] border-0 gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t2('Canh bao', 'Alert')}
              </Badge>
            )}
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/crop-monitorings')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Diem SK', 'Health'), value: item.healthScore ?? '-', color: 'from-green-500 to-green-700' },
            { label: t2('Chieu cao', 'Height'), value: item.plantHeight ? `${item.plantHeight} cm` : '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Nhiet do', 'Temp'), value: item.temperature ? `${item.temperature}C` : '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Do am', 'Humidity'), value: item.humidity !== null ? `${item.humidity}%` : '-', color: 'from-blue-500 to-blue-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <Activity className="w-4 h-4 text-white" />
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
                <Activity className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin giam sat', 'Monitoring Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Loai', 'Type')} value={item.monitoringType} icon={<Activity className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Giai doan', 'Growth Stage')} value={item.growthStage} />
              <InfoRow label={t2('Ngay', 'Date')} value={item.monitoringDate ? new Date(item.monitoringDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Chieu cao (cm)', 'Height (cm)')} value={item.plantHeight} />
              <InfoRow label={t2('Duong tan (cm)', 'Canopy (cm)')} value={item.canopyDiameter} />
              <InfoRow label={t2('Mau la', 'Leaf Color')} value={item.leafColor} />
              {item.healthScore !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase">{t2('Diem suc khoe', 'Health Score')}</p>
                    <span className="text-sm font-bold text-foreground">{item.healthScore}/100</span>
                  </div>
                  <Progress value={item.healthScore} className="h-2 bg-muted" />
                </div>
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer.fullName} />
              <InfoRow label={t2('Dat', 'Farm Land')} value={item.farmLand.farmName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <ThermometerSun className="w-4 h-4 text-muted-foreground" />
                {t2('Thoi tiet & Canh bao', 'Weather & Alerts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Thoi tiet', 'Weather')} value={item.weatherCondition} icon={<ThermometerSun className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Nhiet do', 'Temperature')} value={item.temperature} />
              <InfoRow label={t2('Luong mua', 'Rainfall')} value={item.rainfall} />
              <InfoRow label={t2('Do am KK', 'Humidity')} value={item.humidity} />
              <InfoRow label={t2('Do am dat', 'Soil Moisture')} value={item.soilMoisture} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Ap luc sau', 'Pest Pressure')} value={item.pestPressure} />
              <InfoRow label={t2('Trieu chung', 'Symptoms')} value={item.diseaseSymptoms} />
              {item.alertTriggered && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-red-700 dark:text-red-400">{t2('CANH BAO', 'ALERT')}</span>
                    </div>
                    <InfoRow label={t2('Loai', 'Type')} value={item.alertType} />
                    <InfoRow label={t2('Muc do', 'Severity')} value={item.alertSeverity} />
                    <InfoRow label={t2('Hanh dong', 'Remedial Action')} value={item.remedialAction} />
                  </div>
                </>
              )}
              {item.notes && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Ghi chu', 'Notes')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.notes}</p></div>
                </>
              )}
              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div><span className="uppercase">{t2('Ngay tao', 'Created')}</span><p className="font-medium text-xs">{new Date(item.createdAt).toLocaleDateString()}</p></div>
                <div><span className="uppercase">{t2('Cap nhat', 'Updated')}</span><p className="font-medium text-xs">{new Date(item.updatedAt).toLocaleDateString()}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

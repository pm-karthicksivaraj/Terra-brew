'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, FlaskConical, Loader2, Pencil, Calendar, CheckCircle, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface FertilizerDetail {
  id: string
  applicationDate: string | null
  fertilizerType: string | null
  fertilizerName: string | null
  nutrientContent: string | null
  applicationRate: number | null
  unit: string | null
  totalQuantity: number | null
  applicationMethod: string | null
  costPerUnit: number | null
  totalCost: number | null
  weatherAtApplication: string | null
  appliedBy: string | null
  isOrganic: boolean
  certificationNumber: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function FertilizerDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<FertilizerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/fertilizer-apps?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/fertilizer-apps')
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
              <FlaskConical className="w-9 h-9 text-primary-foreground animate-pulse" />
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/fertilizer-apps')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.fertilizerName || t2('Phan bon', 'Fertilizer')}</h1>
              <p className="text-xs text-muted-foreground">{item.farmer.fullName} - {item.farmLand.farmName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BoolBadge value={item.isOrganic} trueLabel={t2('Huu co', 'Organic')} falseLabel={t2('Hoa hoc', 'Chemical')} />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/fertilizer-apps')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('SL tong', 'Total Qty'), value: item.totalQuantity ? `${item.totalQuantity} ${item.unit || ''}` : '-', color: 'from-purple-500 to-purple-700' },
            { label: t2('Chi phi', 'Total Cost'), value: item.totalCost ? `${item.totalCost.toLocaleString()} VND` : '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Gia/dvi', 'Cost/Unit'), value: item.costPerUnit ? `${item.costPerUnit.toLocaleString()}` : '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Luong', 'Rate'), value: item.applicationRate ? `${item.applicationRate} ${item.unit || ''}` : '-', color: 'from-green-500 to-green-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <FlaskConical className="w-4 h-4 text-white" />
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
                <FlaskConical className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin phan bon', 'Fertilizer Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ten', 'Name')} value={item.fertilizerName} icon={<FlaskConical className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Loai', 'Type')} value={item.fertilizerType} />
              <InfoRow label={t2('Thanh phan', 'Nutrients')} value={item.nutrientContent} />
              <InfoRow label={t2('PP ap dung', 'Method')} value={item.applicationMethod} />
              <InfoRow label={t2('Nguoi ap dung', 'Applied By')} value={item.appliedBy} />
              <InfoRow label={t2('Ngay', 'Date')} value={item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer.fullName} />
              <InfoRow label={t2('Dat', 'Farm Land')} value={item.farmLand.farmName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {t2('Chi phi & Chung nhan', 'Cost & Certification')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Chi phi/dvi', 'Cost/Unit')}</p>
                  <SensitiveField value={item.costPerUnit} />
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Tong chi phi', 'Total Cost')}</p>
                  <SensitiveField value={item.totalCost} />
                </div>
              </div>
              <InfoRow label={t2('Thoi tiet', 'Weather')} value={item.weatherAtApplication} />
              <Separator className="my-2 bg-muted" />
              <BoolBadge value={item.isOrganic} trueLabel={t2('Huu co', 'Organic')} falseLabel={t2('Hoa hoc', 'Chemical')} />
              <InfoRow label={t2('So chung nhan', 'Cert. Number')} value={item.certificationNumber} />
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

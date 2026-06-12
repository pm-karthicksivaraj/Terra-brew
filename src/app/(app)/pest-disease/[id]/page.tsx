'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Shield, Loader2, Pencil, Calendar, AlertTriangle,
  CheckCircle, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface PestDiseaseDetail {
  id: string
  detectionDate: string | null
  pestOrDisease: string | null
  type: string | null
  severity: string | null
  affectedArea: number | null
  affectedTrees: number | null
  symptoms: string | null
  treatmentMethod: string | null
  treatmentProduct: string | null
  dosage: string | null
  applicationDate: string | null
  followUpDate: string | null
  outcome: string | null
  cost: number | null
  preventionMeasures: string | null
  photoUrl: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function PestDiseaseDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<PestDiseaseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/pest-disease-mgmts?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/pest-disease')
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
              <Shield className="w-9 h-9 text-primary-foreground animate-pulse" />
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

  const severityColor = (sev: string | null) => {
    switch (sev?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-muted text-foreground'
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/pest-disease')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.pestOrDisease || t2('Sau benh', 'Pest/Disease')}</h1>
              <p className="text-xs text-muted-foreground">{item.farmer.fullName} - {item.farmLand.farmName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${severityColor(item.severity)} text-[10px] border-0`}>
              {item.severity || '-'}
            </Badge>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/pest-disease')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Muc do', 'Severity'), value: item.severity || '-', color: 'from-red-500 to-red-700' },
            { label: t2('DT anh huong', 'Affected Area'), value: item.affectedArea ? `${item.affectedArea} ha` : '-', color: 'from-orange-500 to-orange-700' },
            { label: t2('Cay AH', 'Trees'), value: item.affectedTrees ?? '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Chi phi', 'Cost'), value: item.cost ? `${item.cost.toLocaleString()} VND` : '-', color: 'from-teal-500 to-teal-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <Shield className="w-4 h-4 text-white" />
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
                <Shield className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin sau benh', 'Pest/Disease Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ten', 'Name')} value={item.pestOrDisease} icon={<Shield className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Loai', 'Type')} value={item.type === 'disease' ? t2('Benh', 'Disease') : t2('Sau', 'Pest')} />
              <InfoRow label={t2('Ngay phat hien', 'Detection Date')} value={item.detectionDate ? new Date(item.detectionDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('DT anh huong (ha)', 'Affected Area')} value={item.affectedArea} />
              <InfoRow label={t2('Cay anh huong', 'Affected Trees')} value={item.affectedTrees} />
              {item.symptoms && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Trieu chung', 'Symptoms')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.symptoms}</p></div>
                </>
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer.fullName} />
              <InfoRow label={t2('Dat', 'Farm Land')} value={item.farmLand.farmName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                {t2('Xu ly & Phong ngua', 'Treatment & Prevention')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('PP xu ly', 'Treatment Method')} value={item.treatmentMethod} />
              <InfoRow label={t2('San pham', 'Product')} value={item.treatmentProduct} />
              <InfoRow label={t2('Lieu luong', 'Dosage')} value={item.dosage} />
              <InfoRow label={t2('Ngay xu ly', 'Application Date')} value={item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : null} />
              <InfoRow label={t2('Ngay theo doi', 'Follow-up Date')} value={item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : null} />
              <InfoRow label={t2('Ket qua', 'Outcome')} value={item.outcome} />
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Chi phi', 'Cost')}</p>
                  <SensitiveField value={item.cost} />
                </div>
              </div>
              {item.preventionMeasures && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Bien phong ngua', 'Prevention')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.preventionMeasures}</p></div>
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
  )
}

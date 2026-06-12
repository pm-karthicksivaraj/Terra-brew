'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, ClipboardCheck, Loader2, Pencil, Calendar, Hash, Beaker, Coffee,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface CoffeeInspectionDetail {
  id: string
  inspectionId: string | null
  inspectionDate: string | null
  inspectorName: string | null
  inspectorCertNo: string | null
  inspectionType: string | null
  inspectionStandard: string | null
  sampleSize: number | null
  moistureContent: number | null
  defectCount: number | null
  foreignMatter: number | null
  screenSize: string | null
  color: string | null
  aroma: string | null
  taste: string | null
  body: string | null
  acidity: string | null
  aftertaste: string | null
  cupScore: number | null
  overallGrade: string | null
  passFail: string | null
  remarks: string | null
  photoUrl: string | null
  batchId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null } | null
  farmLand: { id: string; farmName: string; plotBlockId: string | null } | null
}

export default function CoffeeInspectionDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<CoffeeInspectionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/coffee-inspections?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/coffee-inspections')
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
              <ClipboardCheck className="w-9 h-9 text-primary-foreground animate-pulse" />
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

  const cupScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted text-muted-foreground'
    if (score >= 85) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/coffee-inspections')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.inspectionId || t2('Kiem tra', 'Inspection')}</h1>
              <p className="text-xs text-muted-foreground">{item.inspectorName || '-'} - {item.batchId || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.cupScore !== null && (
              <Badge className={`${cupScoreColor(item.cupScore)} text-[10px] border-0 font-bold`}>
                Cup {item.cupScore}
              </Badge>
            )}
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/coffee-inspections')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Cup Score', 'Cup Score'), value: item.cupScore ?? '-', color: 'from-cyan-500 to-cyan-700' },
            { label: t2('Do am', 'Moisture'), value: item.moistureContent !== null ? `${item.moistureContent}%` : '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Loi', 'Defects'), value: item.defectCount !== null ? `${item.defectCount}%` : '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Hang', 'Grade'), value: item.overallGrade || '-', color: 'from-green-500 to-green-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <ClipboardCheck className="w-4 h-4 text-white" />
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
                <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin kiem tra', 'Inspection Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ma KT', 'Inspection ID')} value={item.inspectionId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Ma lo', 'Batch ID')} value={item.batchId} />
              <InfoRow label={t2('Nguoi KT', 'Inspector')} value={item.inspectorName} />
              <InfoRow label={t2('So CC', 'Cert No.')} value={item.inspectorCertNo} />
              <InfoRow label={t2('Loai KT', 'Type')} value={item.inspectionType} />
              <InfoRow label={t2('Tieu chuan', 'Standard')} value={item.inspectionStandard} />
              <InfoRow label={t2('Ngay', 'Date')} value={item.inspectionDate ? new Date(item.inspectionDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('KL mau (g)', 'Sample Size')} value={item.sampleSize} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer?.fullName} />
              <InfoRow label={t2('Dat', 'Farm Land')} value={item.farmLand?.farmName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Coffee className="w-4 h-4 text-muted-foreground" />
                {t2('Chat luong & Cupping', 'Quality & Cupping')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Do am (%)', 'Moisture (%)')} value={item.moistureContent} icon={<Beaker className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Loi (%)', 'Defects (%)')} value={item.defectCount} />
              <InfoRow label={t2('Tap chat (%)', 'Foreign Matter (%)')} value={item.foreignMatter} />
              <InfoRow label={t2('Kich co', 'Screen Size')} value={item.screenSize} />
              <InfoRow label={t2('Mau', 'Color')} value={item.color} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Huong', 'Aroma')} value={item.aroma} />
              <InfoRow label={t2('Vi', 'Taste')} value={item.taste} />
              <InfoRow label={t2('Body', 'Body')} value={item.body} />
              <InfoRow label={t2('Do chua', 'Acidity')} value={item.acidity} />
              <InfoRow label={t2('Hu vi', 'Aftertaste')} value={item.aftertaste} />
              {item.cupScore !== null && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase">{t2('Cup Score', 'Cup Score')}</p>
                    <Badge className={`${cupScoreColor(item.cupScore)} text-[10px] border-0 font-bold`}>{item.cupScore}/100</Badge>
                  </div>
                  <Progress value={item.cupScore} className="h-2 bg-muted" />
                </div>
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Hang', 'Grade')} value={item.overallGrade} />
              <InfoRow label={t2('Dat/Khong', 'Pass/Fail')} value={item.passFail} />
              {item.remarks && (
                <><Separator className="my-2 bg-muted" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Nhan xet', 'Remarks')}</p>
                <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.remarks}</p></div></>
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

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Loader2, Pencil, CheckCircle, XCircle,
  Ship,
  Calendar, Hash, Thermometer, Droplets, Clock, Cog, User, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { SensitiveField } from '@/components/ui/sensitive-field'

const STAGE_CONFIG = {
  stageType: 'export',
  labelVi: 'Quá trình Xuất khẩu',
  labelEn: 'Export Stage',
  color: 'from-sky-500 to-sky-700',
}

interface ProcessingStageDetail {
  id: string
  stageType: string | null
  stageDate: string | null
  inputWeight: number | null
  outputWeight: number | null
  durationMinutes: number | null
  temperature: number | null
  humidity: number | null
  machineUsed: string | null
  operatorName: string | null
  qualityCheckPassed: boolean
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  jobOrder: {
    id: string
    jobOrderId: string | null
    batchIdInput: string | null
    processingMethod: string | null
  }
}

export default function ExportDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [record, setRecord] = useState<ProcessingStageDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const Icon = Ship

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/processing?pageSize=500')
      const data = await res.json()
      if (data.success) {
        const rawItems = data.data?.data ?? data.data?.items ?? []
        let found: ProcessingStageDetail | null = null
        for (const jo of Array.isArray(rawItems) ? rawItems : []) {
          for (const stage of jo.processingStages || []) {
            if (stage.id === id) {
              found = {
                ...stage,
                jobOrder: {
                  id: jo.id,
                  jobOrderId: jo.jobOrderId,
                  batchIdInput: jo.batchIdInput,
                  processingMethod: jo.processingMethod,
                },
              }
              break
            }
          }
          if (found) break
        }
        if (found) {
          setRecord(found)
        } else {
          toast.error(t2('Không tìm thấy bản ghi', 'Record not found'))
          router.push('/processing/stages/export')
        }
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRecord()
    }
  }, [status, router, fetchRecord])

  if (status === 'loading' || loading) {
    return (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Icon className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
    )
  }

  if (!record) {
    return (
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Không tìm thấy dữ liệu', 'Data not found')}</p>
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

  const BoolBadge = ({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) => (
    <Badge className={`${value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'} text-[10px] border-0 gap-1`}>
      {value ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </Badge>
  )

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/processing/stages/export')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${STAGE_CONFIG.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{t2(STAGE_CONFIG.labelVi, STAGE_CONFIG.labelEn)}</h1>
              <p className="text-xs text-muted-foreground font-mono">{record.jobOrder.jobOrderId || record.id.substring(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BoolBadge value={record.qualityCheckPassed} trueLabel={t2('Đạt QC', 'QC Passed')} falseLabel={t2('Không đạt', 'QC Failed')} />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/processing/stages/export')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('TL đầu vào', 'Input Weight'), value: record.inputWeight ? `${record.inputWeight} kg` : '-', icon: Hash, color: STAGE_CONFIG.color },
            { label: t2('TL đầu ra', 'Output Weight'), value: record.outputWeight ? `${record.outputWeight} kg` : '-', icon: Hash, color: STAGE_CONFIG.color },
            { label: t2('Thời gian', 'Duration'), value: record.durationMinutes ? `${record.durationMinutes} min` : '-', icon: Clock, color: STAGE_CONFIG.color },
            { label: t2('Nhiệt độ', 'Temperature'), value: record.temperature ? `${record.temperature}°C` : '-', icon: Thermometer, color: STAGE_CONFIG.color },
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
          {/* Stage Information */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                {t2('Thông tin giai đoạn', 'Stage Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Lệnh chế biến', 'Job Order')} value={record.jobOrder.jobOrderId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Mã lô', 'Batch Input')} value={record.jobOrder.batchIdInput} />
              <InfoRow label={t2('Ngày', 'Stage Date')} value={record.stageDate ? new Date(record.stageDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Loại giai đoạn', 'Stage Type')} value={record.stageType} />
              <InfoRow label={t2('Máy sử dụng', 'Machine Used')} value={record.machineUsed} icon={<Cog className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Người vận hành', 'Operator')} value={record.operatorName} icon={<User className="w-3.5 h-3.5" />} />
            </CardContent>
          </Card>

          {/* Quality & Environment */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                {t2('Chất lượng & Môi trường', 'Quality & Environment')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                <BoolBadge value={record.qualityCheckPassed} trueLabel={t2('Đạt QC', 'QC Passed')} falseLabel={t2('Không đạt', 'QC Failed')} />
              </div>
              <InfoRow label={t2('Nhiệt độ', 'Temperature')} value={record.temperature ? `${record.temperature}°C` : null} icon={<Thermometer className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Độ ẩm', 'Humidity')} value={record.humidity ? `${record.humidity}%` : null} icon={<Droplets className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('TL đầu vào (kg)', 'Input Weight (kg)')} value={record.inputWeight} />
              <InfoRow label={t2('TL đầu ra (kg)', 'Output Weight (kg)')} value={record.outputWeight} />
              <InfoRow label={t2('Thời gian (phút)', 'Duration (min)')} value={record.durationMinutes} icon={<Clock className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="uppercase">{t2('Ngày tạo', 'Created')}</span>
                  <p className="font-medium text-xs">{new Date(record.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="uppercase">{t2('Cập nhật', 'Updated')}</span>
                  <p className="font-medium text-xs">{new Date(record.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {record.notes && (
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                {t2('Ghi chú', 'Notes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{record.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
  )
}

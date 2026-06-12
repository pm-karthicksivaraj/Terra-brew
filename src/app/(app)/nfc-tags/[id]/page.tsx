'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Nfc, Loader2, Pencil, CheckCircle,
  XCircle, Shield, Calendar, QrCode, Hash, Activity,
  ScanLine, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface NFCRecord {
  id: string
  qrCode: string
  entityType: string
  entityId: string
  hmacSignature: string
  scanCount: number
  lastScannedAt: string | null
  createdAt: string
  isActive: boolean
}

const ENTITY_TYPES = [
  { value: 'Farmer', labelVi: 'Nông dân', labelEn: 'Farmer' },
  { value: 'FarmLand', labelVi: 'Đất nông trại', labelEn: 'Farm Land' },
  { value: 'Cultivation', labelVi: 'Canh tác', labelEn: 'Cultivation' },
  { value: 'HarvestTraceability', labelVi: 'Thu hoạch', labelEn: 'Harvest Batch' },
  { value: 'ProcurementRecord', labelVi: 'Thu mua', labelEn: 'Procurement' },
  { value: 'ProcessingJobOrder', labelVi: 'Chế biến', labelEn: 'Processing' },
]

function stripNFCPrefix(entityType: string): string {
  return entityType.startsWith('NFC_') ? entityType.substring(4) : entityType
}

function extractNfcTagId(qrCode: string): string {
  return qrCode.startsWith('NFC-') ? qrCode.substring(4) : qrCode
}

export default function NFCTagDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [record, setRecord] = useState<NFCRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/nfc?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setRecord(data.data.data ?? null)
      } else {
        toast.error(data.error || t2('Không tìm thấy NFC Tag', 'NFC Tag not found'))
        router.push('/nfc-tags')
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router, t])

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
              <Nfc className="w-9 h-9 text-primary-foreground animate-pulse" />
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

  const tagId = extractNfcTagId(record.qrCode)
  const rawEntityType = stripNFCPrefix(record.entityType)
  const entityTypeLabel = ENTITY_TYPES.find(et => et.value === rawEntityType)
  const displayType = entityTypeLabel
    ? t(entityTypeLabel.labelVi, entityTypeLabel.labelEn)
    : rawEntityType

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/nfc-tags')}
              className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Nfc className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground font-mono">{tagId}</h1>
              <p className="text-xs text-muted-foreground">{displayType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${record.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
              {record.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
            </Badge>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs"
              onClick={() => router.push('/nfc-tags')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Lượt quét', 'Scan Count'), value: record.scanCount, icon: ScanLine, color: 'from-emerald-500 to-emerald-700' },
            { label: t2('Loại thực thể', 'Entity Type'), value: displayType, icon: Nfc, color: 'from-amber-500 to-amber-700' },
            { label: t2('Mã QR', 'QR Code'), value: record.qrCode ? t2('Có', 'Yes') : t2('Không', 'No'), icon: QrCode, color: 'from-teal-500 to-teal-700' },
            { label: t2('Quét lần cuối', 'Last Scanned'), value: record.lastScannedAt ? new Date(record.lastScannedAt).toLocaleDateString() : '-', icon: Clock, color: 'from-rose-500 to-rose-700' },
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
          {/* NFC Information */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Nfc className="w-4 h-4 text-muted-foreground" />
                {t2('Thông tin NFC', 'NFC Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('NFC Tag ID', 'NFC Tag ID')} value={tagId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('QR Code', 'QR Code')} value={record.qrCode} icon={<QrCode className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Loại thực thể', 'Entity Type')} value={displayType} icon={<Nfc className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Mã thực thể', 'Entity ID')} value={record.entityId} icon={<Hash className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <div className="flex items-start gap-2 py-2">
                <span className="text-muted-foreground mt-0.5 shrink-0"><Shield className="w-3.5 h-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">HMAC Signature</p>
                  <SensitiveField value={record.hmacSignature} />
                </div>
              </div>
              <Separator className="my-2 bg-muted" />
              <div className="flex items-start gap-2 py-2">
                <span className="text-muted-foreground mt-0.5 shrink-0"><CheckCircle className="w-3.5 h-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</p>
                  <BoolBadge value={record.isActive} trueLabel={t2('Hoạt động', 'Active')} falseLabel={t2('Không HĐ', 'Inactive')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                {t2('Hoạt động', 'Activity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Số lượt quét', 'Scan Count')} value={record.scanCount} icon={<ScanLine className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Quét lần cuối', 'Last Scanned At')} value={record.lastScannedAt ? new Date(record.lastScannedAt).toLocaleString() : null} icon={<Clock className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Ngày tạo', 'Created At')} value={new Date(record.createdAt).toLocaleString()} icon={<Calendar className="w-3.5 h-3.5" />} />
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

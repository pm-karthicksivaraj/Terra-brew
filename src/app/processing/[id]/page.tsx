'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Cog, Loader2, Pencil, Scale, ThermometerSun,
  Hash, Coffee, Calendar, CheckCircle, XCircle,
  Beaker, BarChart3, ChevronDown, ChevronUp, Timer,
  Factory, User, BadgeCheck, Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { formatCurrency } from '@/types'

interface ProcessingStage {
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
}

interface ProcessingDetail {
  id: string
  jobOrderId: string | null
  processingDate: string | null
  batchIdInput: string | null
  coffeeTypeInput: string | null
  coffeeVarietyInput: string | null
  inputQuantityKg: number | null
  processingMethod: string | null
  targetOutputProduct: string | null
  operatorName: string | null
  plantFacilityName: string | null
  inputWeightKg: number | null
  finalOutputWeightKg: number | null
  overallOutturn: number | null
  totalProcessingCost: number | null
  costPerKg: number | null
  finalMoistureContent: number | null
  cupScore: number | null
  cuppingNotes: string | null
  qcApprovedBy: string | null
  qcApprovalDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  processingStages: ProcessingStage[]
}

export default function ProcessingDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [record, setRecord] = useState<ProcessingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/processing?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setRecord(data.data?.data ?? null)
      } else {
        toast.error(data.error || t('Không tìm thấy bản ghi', 'Record not found'))
        router.push('/processing')
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
      fetchRecord()
    }
  }, [status, router, fetchRecord])

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stageId)) next.delete(stageId)
      else next.add(stageId)
      return next
    })
  }

  const methodColor = (method: string | null) => {
    switch (method?.toLowerCase()) {
      case 'wet': return 'bg-blue-100 text-blue-700'
      case 'dry': return 'bg-amber-100 text-amber-700'
      case 'honey': return 'bg-yellow-100 text-yellow-700'
      case 'natural': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'semi-washed': return 'bg-purple-100 text-purple-700'
      default: return 'bg-muted text-foreground'
    }
  }

  const stageTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'sorting': return 'bg-cyan-100 text-cyan-700'
      case 'pulping': return 'bg-blue-100 text-blue-700'
      case 'fermentation': return 'bg-purple-100 text-purple-700'
      case 'washing': return 'bg-sky-100 text-sky-700'
      case 'drying': return 'bg-amber-100 text-amber-700'
      case 'hulling': return 'bg-orange-100 text-orange-700'
      case 'grading': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'packaging': return 'bg-muted text-foreground'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const cupScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return 'bg-muted text-muted-foreground'
    if (score >= 85) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Cog className="w-9 h-9 text-primary-foreground animate-pulse" />
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

  if (!record) {
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

  const yieldLoss = record.inputWeightKg && record.finalOutputWeightKg
    ? ((1 - record.finalOutputWeightKg / record.inputWeightKg) * 100).toFixed(1)
    : null

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/processing')}
              className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Cog className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                {record.jobOrderId || t('Lệnh chế biến', 'Job Order')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {record.batchIdInput ? `${t('Lô', 'Batch')}: ${record.batchIdInput}` : ''} {record.plantFacilityName ? `· ${record.plantFacilityName}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${methodColor(record.processingMethod)} text-[10px] border-0`}>
              {record.processingMethod || '-'}
            </Badge>
            {record.cupScore !== null && record.cupScore !== undefined && (
              <Badge className={`${cupScoreColor(record.cupScore)} text-[10px] border-0 font-bold`}>
                Cup {record.cupScore}
              </Badge>
            )}
            {record.qcApprovedBy ? (
              <Badge className="bg-green-100 text-green-700 text-[10px] border-0 gap-1">
                <CheckCircle className="w-3 h-3" />
                QC
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground text-[10px] border-0 gap-1">
                <XCircle className="w-3 h-3" />
                QC
              </Badge>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs"
              onClick={() => router.push('/processing')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('SL đầu vào', 'Input Qty'), value: record.inputQuantityKg ? `${record.inputQuantityKg.toLocaleString()} kg` : '-', icon: Scale, color: 'from-blue-500 to-blue-700' },
            { label: t('TL đầu ra', 'Output'), value: record.finalOutputWeightKg ? `${record.finalOutputWeightKg.toLocaleString()} kg` : '-', icon: Scale, color: 'from-green-500 to-green-700' },
            { label: t('Xuất (%)', 'Outturn'), value: record.overallOutturn ? `${record.overallOutturn}%` : '-', icon: BarChart3, color: 'from-amber-500 to-amber-700' },
            { label: t('Chi phí/kg', 'Cost/kg'), value: record.costPerKg ? formatCurrency(record.costPerKg, 'VND') : '-', icon: Coffee, color: ' ' },
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
          {/* Job Order Info */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                {t('Thông tin lệnh chế biến', 'Job Order Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Mã lệnh (Job Order ID)', 'Job Order ID')} value={record.jobOrderId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Ngày chế biến', 'Processing Date')} value={record.processingDate ? new Date(record.processingDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Mã lô đầu vào', 'Batch ID Input')} value={record.batchIdInput} />
              <InfoRow label={t('Loại CP đầu vào', 'Coffee Type Input')} value={record.coffeeTypeInput} icon={<Coffee className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Giống CP đầu vào', 'Coffee Variety Input')} value={record.coffeeVarietyInput} />
              <InfoRow label={t('Số lượng đầu vào (kg)', 'Input Quantity (kg)')} value={record.inputQuantityKg?.toLocaleString()} />
              <InfoRow label={t('Phương pháp chế biến', 'Processing Method')} value={record.processingMethod} />
              <InfoRow label={t('SP đầu ra mục tiêu', 'Target Output Product')} value={record.targetOutputProduct} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Người vận hành', 'Operator Name')} value={record.operatorName} icon={<User className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Nhà máy', 'Plant Facility')} value={record.plantFacilityName} icon={<Factory className="w-3.5 h-3.5" />} />
            </CardContent>
          </Card>

          {/* Input/Output Summary */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                {t('Tóm tắt Đầu vào/Ra', 'Input/Output Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-[9px] text-blue-400 uppercase">{t('TL đầu vào (kg)', 'Input Weight (kg)')}</p>
                  <p className="text-lg font-bold text-blue-800">{record.inputWeightKg?.toLocaleString() ?? '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-[9px] text-green-400 uppercase">{t('TL đầu ra (kg)', 'Output Weight (kg)')}</p>
                  <p className="text-lg font-bold text-green-800">{record.finalOutputWeightKg?.toLocaleString() ?? '-'}</p>
                </div>
              </div>

              {/* Outturn Progress */}
              {record.overallOutturn && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase">{t('Tỷ lệ xuất (%)', 'Outturn (%)')}</p>
                    <span className="text-sm font-bold text-foreground">{record.overallOutturn}%</span>
                  </div>
                  <Progress value={Math.min(record.overallOutturn, 100)} className="h-2 bg-muted" />
                </div>
              )}

              {/* Yield Loss */}
              {yieldLoss && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted">
                  <p className="text-[10px] text-muted-foreground uppercase">{t('Hao hụt (%)', 'Yield Loss (%)')}</p>
                  <Badge className={`${parseFloat(yieldLoss) > 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700'} text-[10px] border-0`}>
                    {yieldLoss}%
                  </Badge>
                </div>
              )}

              <Separator className="my-2 bg-muted" />

              {/* Cost Breakdown */}
              <InfoRow label={t('Tổng chi phí (VND)', 'Total Cost (VND)')} value={record.totalProcessingCost ? formatCurrency(record.totalProcessingCost, 'VND') : null} icon={<Coffee className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Chi phí/kg (VND)', 'Cost/kg (VND)')} value={record.costPerKg ? formatCurrency(record.costPerKg, 'VND') : null} />
            </CardContent>
          </Card>

          {/* Quality Results */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Beaker className="w-4 h-4 text-muted-foreground" />
                {t('Kết quả chất lượng', 'Quality Results')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Moisture */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground uppercase">{t('Độ ẩm cuối (%)', 'Final Moisture (%)')}</p>
                  <span className="text-sm font-bold text-foreground">{record.finalMoistureContent !== null ? `${record.finalMoistureContent}%` : '-'}</span>
                </div>
                {record.finalMoistureContent !== null && (
                  <Progress value={record.finalMoistureContent} className="h-2 bg-muted" />
                )}
              </div>

              {/* Cup Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground uppercase">{t('Điểm cupping', 'Cup Score')}</p>
                  <Badge className={`${cupScoreColor(record.cupScore)} text-[10px] border-0 font-bold`}>
                    {record.cupScore ?? '-'}
                  </Badge>
                </div>
                {record.cupScore !== null && (
                  <Progress value={record.cupScore} className="h-2 bg-muted" />
                )}
              </div>

              {/* Cupping Notes */}
              {record.cuppingNotes && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('Ghi chú cupping', 'Cupping Notes')}</p>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-foreground">{record.cuppingNotes}</p>
                  </div>
                </>
              )}

              <Separator className="my-2 bg-muted" />

              {/* QC Approval */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                {record.qcApprovedBy ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('QC duyệt', 'QC Approval')}</p>
                  <p className="text-sm font-medium text-foreground">
                    {record.qcApprovedBy || t('Chưa duyệt', 'Not approved')}
                  </p>
                  {record.qcApprovalDate && (
                    <p className="text-[10px] text-muted-foreground">{new Date(record.qcApprovalDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Stages (Expandable) */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Cog className="w-4 h-4 text-muted-foreground" />
                {t('Giai đoạn chế biến', 'Processing Stages')} ({record.processingStages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.processingStages.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm italic">
                  {t('Chưa có giai đoạn chế biến nào', 'No processing stages recorded')}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {record.processingStages.map((stage) => {
                    const isExpanded = expandedStages.has(stage.id)
                    return (
                      <div key={stage.id} className="rounded-xl border border-border overflow-hidden">
                        <button
                          onClick={() => toggleStage(stage.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Badge className={`${stageTypeColor(stage.stageType)} text-[10px] border-0`}>
                              {stage.stageType || '-'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {stage.stageDate ? new Date(stage.stageDate).toLocaleDateString() : '-'}
                            </span>
                            {stage.qualityCheckPassed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-border">
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('TL vào (kg)', 'Input (kg)')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.inputWeight ?? '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('TL ra (kg)', 'Output (kg)')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.outputWeight ?? '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Thời gian (phút)', 'Duration (min)')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.durationMinutes ?? '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Nhiệt độ', 'Temperature')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.temperature !== null ? `${stage.temperature}°C` : '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Độ ẩm', 'Humidity')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.humidity !== null ? `${stage.humidity}%` : '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Máy', 'Machine')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.machineUsed || '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Người vận hành', 'Operator')}</p>
                                <p className="text-xs font-medium text-foreground">{stage.operatorName || '-'}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Kiểm tra chất lượng', 'QC Check')}</p>
                                <p className="text-xs font-medium">
                                  {stage.qualityCheckPassed ? (
                                    <Badge className="bg-green-100 text-green-700 text-[9px] border-0 gap-1">
                                      <CheckCircle className="w-2.5 h-2.5" />
                                      {t('Đạt', 'Pass')}
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-600 text-[9px] border-0 gap-1">
                                      <XCircle className="w-2.5 h-2.5" />
                                      {t('Không đạt', 'Fail')}
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            {stage.notes && (
                              <div className="mt-2 p-2 rounded-lg bg-muted">
                                <p className="text-[9px] text-muted-foreground">{t('Ghi chú', 'Notes')}</p>
                                <p className="text-xs text-foreground">{stage.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <Separator className="my-3 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="uppercase">{t('Ngày tạo', 'Created')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(record.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="uppercase">{t('Cập nhật', 'Updated')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(record.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

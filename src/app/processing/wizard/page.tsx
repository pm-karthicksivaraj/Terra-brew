'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Cog, Loader2, Check, ChevronLeft, ChevronRight,
  ArrowLeft, ClipboardCheck, Beaker, Droplets, Sun,
  Gem, BarChart3, Package, Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

// ─── Types ────────────────────────────────────────────────────────

interface StepData {
  // Step 1: Reception & Sorting
  batchId: string
  inputWeight: string
  cherryRipenessGrade: string
  defects: string
  sortingMethod: string
  operatorName: string
  // Step 2: Pulping & Fermentation
  pulpingMethod: string
  fermentationType: string
  fermentationDurationHrs: string
  waterUsage: string
  phLevel: string
  temperature2: string
  // Step 3: Washing
  washingMethod: string
  waterSource: string
  washCycles: string
  cleanWaterUsed: string
  // Step 4: Drying
  dryingMethod: string
  dryingDurationDays: string
  targetMoisture: string
  actualMoisture: string
  temperature4: string
  humidity: string
  machineUsed: string
  // Step 5: Hulling & Polishing
  hullingMethod: string
  outputWeight: string
  screenSize5: string
  polishingDone: boolean
  // Step 6: Grading & Sorting
  grade: string
  screenSize6: string
  defectCount: string
  foreignMatter: string
  cupScore: string
  overallGrade: string
  // Step 7: QC & Packaging
  qcApprovedBy: string
  qcApprovalDate: string
  packagingType: string
  packageWeight: string
  lotNumber: string
  notes: string
  // Job-level fields (collected on step 1)
  jobOrderId: string
  processingDate: string
  processingMethod: string
  plantFacilityName: string
}

const initialFormData: StepData = {
  batchId: '',
  inputWeight: '',
  cherryRipenessGrade: '',
  defects: '',
  sortingMethod: '',
  operatorName: '',
  pulpingMethod: '',
  fermentationType: '',
  fermentationDurationHrs: '',
  waterUsage: '',
  phLevel: '',
  temperature2: '',
  washingMethod: '',
  waterSource: '',
  washCycles: '',
  cleanWaterUsed: '',
  dryingMethod: '',
  dryingDurationDays: '',
  targetMoisture: '',
  actualMoisture: '',
  temperature4: '',
  humidity: '',
  machineUsed: '',
  hullingMethod: '',
  outputWeight: '',
  screenSize5: '',
  polishingDone: false,
  grade: '',
  screenSize6: '',
  defectCount: '',
  foreignMatter: '',
  cupScore: '',
  overallGrade: '',
  qcApprovedBy: '',
  qcApprovalDate: '',
  packagingType: '',
  packageWeight: '',
  lotNumber: '',
  notes: '',
  jobOrderId: '',
  processingDate: '',
  processingMethod: '',
  plantFacilityName: '',
}

const STEPS = [
  { num: 1, vi: 'Phân loại & Làm sạch', en: 'Reception & Sorting', icon: ClipboardCheck },
  { num: 2, vi: 'Bóc vỏ & Lên men', en: 'Pulping & Fermentation', icon: Beaker },
  { num: 3, vi: 'Rửa', en: 'Washing', icon: Droplets },
  { num: 4, vi: 'Sấy', en: 'Drying', icon: Sun },
  { num: 5, vi: 'Bóc lụa & Đánh bóng', en: 'Hulling & Polishing', icon: Gem },
  { num: 6, vi: 'Phân loại & Xếp hạng', en: 'Grading & Sorting', icon: BarChart3 },
  { num: 7, vi: 'QC & Đóng gói', en: 'QC & Packaging', icon: Package },
]

// ─── Component ────────────────────────────────────────────────────

export default function ProcessingWizardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [currentStep, setCurrentStep] = useState(0) // 0-indexed
  const [formData, setFormData] = useState<StepData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const updateField = <K extends keyof StepData>(key: K, value: StepData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection('forward')
      setCurrentStep(prev => prev + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setDirection('backward')
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setDirection('backward')
      setCurrentStep(step)
    } else if (step > currentStep && step <= currentStep) {
      // Can only go to already visited steps
    }
  }

  // ─── Build POST payload ──────────────────────────────────────

  const buildPayload = () => {
    const stages = [
      {
        stageType: 'Phân loại & Làm sạch',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) : undefined,
        outputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.99 : undefined,
        operatorName: formData.operatorName || undefined,
        notes: [
          formData.cherryRipenessGrade ? `Ripeness: ${formData.cherryRipenessGrade}` : '',
          formData.defects ? `Defects: ${formData.defects}` : '',
          formData.sortingMethod ? `Method: ${formData.sortingMethod}` : '',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: true,
      },
      {
        stageType: 'Bóc vỏ & Lên men',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.99 : undefined,
        outputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.27 : undefined,
        durationMinutes: formData.fermentationDurationHrs ? Math.round(parseFloat(formData.fermentationDurationHrs) * 60) : undefined,
        temperature: formData.temperature2 ? parseFloat(formData.temperature2) : undefined,
        machineUsed: formData.pulpingMethod || undefined,
        notes: [
          formData.fermentationType ? `Fermentation: ${formData.fermentationType}` : '',
          formData.waterUsage ? `Water: ${formData.waterUsage}L` : '',
          formData.phLevel ? `pH: ${formData.phLevel}` : '',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: true,
      },
      {
        stageType: 'Rửa',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.27 : undefined,
        outputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.26 : undefined,
        machineUsed: formData.washingMethod || undefined,
        notes: [
          formData.waterSource ? `Source: ${formData.waterSource}` : '',
          formData.washCycles ? `Cycles: ${formData.washCycles}` : '',
          formData.cleanWaterUsed ? `Clean water: ${formData.cleanWaterUsed}L` : '',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: true,
      },
      {
        stageType: 'Sấy',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.26 : undefined,
        outputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.22 : undefined,
        durationMinutes: formData.dryingDurationDays ? Math.round(parseFloat(formData.dryingDurationDays) * 1440) : undefined,
        temperature: formData.temperature4 ? parseFloat(formData.temperature4) : undefined,
        humidity: formData.humidity ? parseFloat(formData.humidity) : undefined,
        machineUsed: formData.machineUsed || formData.dryingMethod || undefined,
        notes: [
          formData.targetMoisture ? `Target moisture: ${formData.targetMoisture}%` : '',
          formData.actualMoisture ? `Actual moisture: ${formData.actualMoisture}%` : '',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: true,
      },
      {
        stageType: 'Bóc lụa & Đánh bóng',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.inputWeight ? parseFloat(formData.inputWeight) * 0.22 : undefined,
        outputWeight: formData.outputWeight ? parseFloat(formData.outputWeight) : undefined,
        machineUsed: formData.hullingMethod || undefined,
        notes: [
          formData.screenSize5 ? `Screen: ${formData.screenSize5}` : '',
          formData.polishingDone ? 'Polished: Yes' : 'Polished: No',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: true,
      },
      {
        stageType: 'Phân loại & Xếp hạng',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.outputWeight ? parseFloat(formData.outputWeight) : undefined,
        outputWeight: formData.outputWeight ? parseFloat(formData.outputWeight) * 0.95 : undefined,
        notes: [
          formData.grade ? `Grade: ${formData.grade}` : '',
          formData.screenSize6 ? `Screen: ${formData.screenSize6}` : '',
          formData.defectCount ? `Defects: ${formData.defectCount}` : '',
          formData.foreignMatter ? `Foreign matter: ${formData.foreignMatter}` : '',
          formData.cupScore ? `Cup score: ${formData.cupScore}` : '',
          formData.overallGrade ? `Overall: ${formData.overallGrade}` : '',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: true,
      },
      {
        stageType: 'QC & Đóng gói',
        stageDate: formData.processingDate || undefined,
        inputWeight: formData.outputWeight ? parseFloat(formData.outputWeight) * 0.95 : undefined,
        outputWeight: formData.packageWeight ? parseFloat(formData.packageWeight) : undefined,
        operatorName: formData.qcApprovedBy || undefined,
        notes: [
          formData.packagingType ? `Packaging: ${formData.packagingType}` : '',
          formData.packageWeight ? `Weight: ${formData.packageWeight}kg` : '',
          formData.lotNumber ? `Lot: ${formData.lotNumber}` : '',
          formData.notes || '',
        ].filter(Boolean).join('; ') || undefined,
        qualityCheckPassed: !!formData.qcApprovedBy,
      },
    ]

    return {
      jobOrderId: formData.jobOrderId || undefined,
      processingDate: formData.processingDate || undefined,
      batchIdInput: formData.batchId || undefined,
      processingMethod: formData.processingMethod || undefined,
      operatorName: formData.operatorName || undefined,
      plantFacilityName: formData.plantFacilityName || undefined,
      inputWeightKg: formData.inputWeight ? parseFloat(formData.inputWeight) : undefined,
      finalOutputWeightKg: formData.outputWeight ? parseFloat(formData.outputWeight) : undefined,
      cupScore: formData.cupScore ? parseFloat(formData.cupScore) : undefined,
      qcApprovedBy: formData.qcApprovedBy || undefined,
      qcApprovalDate: formData.qcApprovalDate || undefined,
      cuppingNotes: formData.notes || undefined,
      finalMoistureContent: formData.actualMoisture ? parseFloat(formData.actualMoisture) : undefined,
      processingStages: {
        create: stages,
      },
    }
  }

  // ─── Submit handler ──────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = buildPayload()
      const res = await fetch('/api/processing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Tạo lệnh chế biến thành công!', 'Processing job order created successfully!'))
        router.push('/processing')
      } else {
        toast.error(data.error || t('Lỗi khi tạo', 'Error creating'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Loading guard ───────────────────────────────────────────

  if (status === 'loading') {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Cog className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-coffee-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  // ─── Step renderers ──────────────────────────────────────────

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Job-level fields */}
      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          {t('Thông tin lệnh chế biến', 'Job Order Information')}
        </Label>
        <div className="h-px bg-coffee-200" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Mã lệnh (Job Order ID)', 'Job Order ID')} *</Label>
        <Input
          value={formData.jobOrderId}
          onChange={e => updateField('jobOrderId', e.target.value)}
          placeholder="JOB-TB-001"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Ngày chế biến', 'Processing Date')} *</Label>
        <Input
          type="date"
          value={formData.processingDate}
          onChange={e => updateField('processingDate', e.target.value)}
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Phương pháp chế biến', 'Processing Method')} *</Label>
        <Select value={formData.processingMethod} onValueChange={v => updateField('processingMethod', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn PP', 'Select method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wet">{t('Ướt (Wet)', 'Wet')}</SelectItem>
            <SelectItem value="dry">{t('Khô (Dry)', 'Dry')}</SelectItem>
            <SelectItem value="honey">{t('Mật ong (Honey)', 'Honey')}</SelectItem>
            <SelectItem value="natural">{t('Tự nhiên (Natural)', 'Natural')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Nhà máy', 'Plant Facility')}</Label>
        <Input
          value={formData.plantFacilityName}
          onChange={e => updateField('plantFacilityName', e.target.value)}
          placeholder={t('Nhà máy ABC', 'Factory ABC')}
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>

      {/* Step 1 fields */}
      <div className="space-y-1.5 md:col-span-2 mt-3">
        <Label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          {t('Phân loại & Làm sạch', 'Reception & Sorting')}
        </Label>
        <div className="h-px bg-coffee-200" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Mã lô (Batch ID)', 'Batch ID')} *</Label>
        <Input
          value={formData.batchId}
          onChange={e => updateField('batchId', e.target.value)}
          placeholder="BATCH-2024-001"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Trọng lượng đầu vào (kg)', 'Input Weight (kg)')} *</Label>
        <Input
          type="number" step="0.1"
          value={formData.inputWeight}
          onChange={e => updateField('inputWeight', e.target.value)}
          placeholder="3200"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Cấp độ chín', 'Cherry Ripeness Grade')}</Label>
        <Select value={formData.cherryRipenessGrade} onValueChange={v => updateField('cherryRipenessGrade', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn cấp độ', 'Select grade')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">{t('A - Chín hoàn toàn', 'A - Fully ripe')}</SelectItem>
            <SelectItem value="B">{t('B - Chín vừa', 'B - Semi-ripe')}</SelectItem>
            <SelectItem value="C">{t('C - Chưa chín', 'C - Unripe')}</SelectItem>
            <SelectItem value="Mixed">{t('Hỗn hợp', 'Mixed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Tỷ lệ lỗi (%)', 'Defects (%)')}</Label>
        <Input
          type="number" step="0.1"
          value={formData.defects}
          onChange={e => updateField('defects', e.target.value)}
          placeholder="2.5"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Phương pháp phân loại', 'Sorting Method')}</Label>
        <Select value={formData.sortingMethod} onValueChange={v => updateField('sortingMethod', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn PP', 'Select method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">{t('Thủ công', 'Manual')}</SelectItem>
            <SelectItem value="mechanical">{t('Cơ khí', 'Mechanical')}</SelectItem>
            <SelectItem value="optical">{t('Quang học', 'Optical')}</SelectItem>
            <SelectItem value="density">{t('Mật độ', 'Density')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Người vận hành', 'Operator Name')}</Label>
        <Input
          value={formData.operatorName}
          onChange={e => updateField('operatorName', e.target.value)}
          placeholder={t('Nguyễn Văn A', 'Nguyen Van A')}
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Phương pháp bóc vỏ', 'Pulping Method')}</Label>
        <Select value={formData.pulpingMethod} onValueChange={v => updateField('pulpingMethod', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn PP', 'Select method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disc-pulper">{t('Máy đĩa', 'Disc Pulper')}</SelectItem>
            <SelectItem value="drum-pulper">{t('Máy trống', 'Drum Pulper')}</SelectItem>
            <SelectItem value="eco-pulper">{t('Máy sinh thái', 'Eco Pulper')}</SelectItem>
            <SelectItem value="manual">{t('Thủ công', 'Manual')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Loại lên men', 'Fermentation Type')}</Label>
        <Select value={formData.fermentationType} onValueChange={v => updateField('fermentationType', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn loại', 'Select type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dry">{t('Khô (Dry)', 'Dry Fermentation')}</SelectItem>
            <SelectItem value="wet">{t('Ướt (Wet)', 'Wet Fermentation')}</SelectItem>
            <SelectItem value="anaerobic">{t('Kỵ khí', 'Anaerobic')}</SelectItem>
            <SelectItem value="carbonic-maceration">{t('Ngâm CO2', 'Carbonic Maceration')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Thời gian lên men (giờ)', 'Fermentation Duration (hrs)')}</Label>
        <Input
          type="number" step="0.5"
          value={formData.fermentationDurationHrs}
          onChange={e => updateField('fermentationDurationHrs', e.target.value)}
          placeholder="24"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Lượng nước sử dụng (L)', 'Water Usage (L)')}</Label>
        <Input
          type="number" step="1"
          value={formData.waterUsage}
          onChange={e => updateField('waterUsage', e.target.value)}
          placeholder="500"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Mức pH', 'pH Level')}</Label>
        <Input
          type="number" step="0.1"
          value={formData.phLevel}
          onChange={e => updateField('phLevel', e.target.value)}
          placeholder="4.5"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Nhiệt độ (°C)', 'Temperature (°C)')}</Label>
        <Input
          type="number" step="0.5"
          value={formData.temperature2}
          onChange={e => updateField('temperature2', e.target.value)}
          placeholder="25"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Phương pháp rửa', 'Washing Method')}</Label>
        <Select value={formData.washingMethod} onValueChange={v => updateField('washingMethod', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn PP', 'Select method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="channel-wash">{t('Rửa kênh', 'Channel Wash')}</SelectItem>
            <SelectItem value="tank-wash">{t('Rửa bể', 'Tank Wash')}</SelectItem>
            <SelectItem value="pressure-wash">{t('Rửa áp lực', 'Pressure Wash')}</SelectItem>
            <SelectItem value="multiple">{t('Nhiều lần', 'Multiple')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Nguồn nước', 'Water Source')}</Label>
        <Select value={formData.waterSource} onValueChange={v => updateField('waterSource', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn nguồn', 'Select source')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spring">{t('Nước suối', 'Spring Water')}</SelectItem>
            <SelectItem value="well">{t('Giếng khoan', 'Well Water')}</SelectItem>
            <SelectItem value="rain">{t('Nước mưa', 'Rainwater')}</SelectItem>
            <SelectItem value="municipal">{t('Nước máy', 'Municipal')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Số lần rửa', 'Wash Cycles')}</Label>
        <Input
          type="number" step="1"
          value={formData.washCycles}
          onChange={e => updateField('washCycles', e.target.value)}
          placeholder="3"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Nước sạch sử dụng (L)', 'Clean Water Used (L)')}</Label>
        <Input
          type="number" step="1"
          value={formData.cleanWaterUsed}
          onChange={e => updateField('cleanWaterUsed', e.target.value)}
          placeholder="800"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Phương pháp sấy', 'Drying Method')}</Label>
        <Select value={formData.dryingMethod} onValueChange={v => updateField('dryingMethod', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn PP', 'Select method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sun-dry">{t('Phơi nắng', 'Sun Drying')}</SelectItem>
            <SelectItem value="mechanical">{t('Sấy cơ khí', 'Mechanical Dryer')}</SelectItem>
            <SelectItem value="greenhouse">{t('Nhà kính', 'Greenhouse')}</SelectItem>
            <SelectItem value="hybrid">{t('Kết hợp', 'Hybrid')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Thời gian sấy (ngày)', 'Drying Duration (days)')}</Label>
        <Input
          type="number" step="0.5"
          value={formData.dryingDurationDays}
          onChange={e => updateField('dryingDurationDays', e.target.value)}
          placeholder="7"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Độ ẩm mục tiêu (%)', 'Target Moisture (%)')}</Label>
        <Input
          type="number" step="0.1"
          value={formData.targetMoisture}
          onChange={e => updateField('targetMoisture', e.target.value)}
          placeholder="12.0"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Độ ẩm thực tế (%)', 'Actual Moisture (%)')}</Label>
        <Input
          type="number" step="0.1"
          value={formData.actualMoisture}
          onChange={e => updateField('actualMoisture', e.target.value)}
          placeholder="11.5"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Nhiệt độ (°C)', 'Temperature (°C)')}</Label>
        <Input
          type="number" step="0.5"
          value={formData.temperature4}
          onChange={e => updateField('temperature4', e.target.value)}
          placeholder="35"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Độ ẩm không khí (%)', 'Humidity (%)')}</Label>
        <Input
          type="number" step="0.5"
          value={formData.humidity}
          onChange={e => updateField('humidity', e.target.value)}
          placeholder="65"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-xs text-coffee-700">{t('Máy sấy sử dụng', 'Machine Used')}</Label>
        <Input
          value={formData.machineUsed}
          onChange={e => updateField('machineUsed', e.target.value)}
          placeholder={t('Máy sấy ABC-2000', 'Dryer ABC-2000')}
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Phương pháp bóc lụa', 'Hulling Method')}</Label>
        <Select value={formData.hullingMethod} onValueChange={v => updateField('hullingMethod', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn PP', 'Select method')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="roller">{t('Máy lô', 'Roller Huller')}</SelectItem>
            <SelectItem value="abrasive">{t('Máy mài', 'Abrasive Huller')}</SelectItem>
            <SelectItem value="centrifugal">{t('Ly tâm', 'Centrifugal')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Trọng lượng đầu ra (kg)', 'Output Weight (kg)')}</Label>
        <Input
          type="number" step="0.1"
          value={formData.outputWeight}
          onChange={e => updateField('outputWeight', e.target.value)}
          placeholder="580"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Kích thước rây (screen)', 'Screen Size')}</Label>
        <Select value={formData.screenSize5} onValueChange={v => updateField('screenSize5', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn size', 'Select size')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="13">13</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="17">17</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="19">19</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 flex items-center gap-3 pt-5">
        <Checkbox
          id="polishingDone"
          checked={formData.polishingDone}
          onCheckedChange={checked => updateField('polishingDone', checked as boolean)}
          className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
        />
        <Label htmlFor="polishingDone" className="text-xs text-coffee-700 cursor-pointer">
          {t('Đã đánh bóng', 'Polishing Done')}
        </Label>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Hạng (Grade)', 'Grade')}</Label>
        <Select value={formData.grade} onValueChange={v => updateField('grade', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn hạng', 'Select grade')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="G1">{t('G1 - Đặc biệt', 'G1 - Speciality')}</SelectItem>
            <SelectItem value="G2">{t('G2 - Xuất khẩu', 'G2 - Export')}</SelectItem>
            <SelectItem value="G3">{t('G3 - Nội địa', 'G3 - Domestic')}</SelectItem>
            <SelectItem value="G4">{t('G4 - Công nghiệp', 'G4 - Industrial')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Kích thước rây (screen)', 'Screen Size')}</Label>
        <Select value={formData.screenSize6} onValueChange={v => updateField('screenSize6', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn size', 'Select size')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="13">13</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="17">17</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="19">19</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Số lỗi', 'Defect Count')}</Label>
        <Input
          type="number" step="1"
          value={formData.defectCount}
          onChange={e => updateField('defectCount', e.target.value)}
          placeholder="5"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Tạp chất (%)', 'Foreign Matter (%)')}</Label>
        <Input
          type="number" step="0.01"
          value={formData.foreignMatter}
          onChange={e => updateField('foreignMatter', e.target.value)}
          placeholder="0.5"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Điểm cupping', 'Cup Score')}</Label>
        <Input
          type="number" step="0.5"
          value={formData.cupScore}
          onChange={e => updateField('cupScore', e.target.value)}
          placeholder="82"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Hạng tổng thể', 'Overall Grade')}</Label>
        <Select value={formData.overallGrade} onValueChange={v => updateField('overallGrade', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn hạng', 'Select grade')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Premium">{t('Cao cấp', 'Premium')}</SelectItem>
            <SelectItem value="Standard">{t('Tiêu chuẩn', 'Standard')}</SelectItem>
            <SelectItem value="Below-Standard">{t('Dưới tiêu chuẩn', 'Below Standard')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderStep7 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('QC duyệt bởi', 'QC Approved By')} *</Label>
        <Input
          value={formData.qcApprovedBy}
          onChange={e => updateField('qcApprovedBy', e.target.value)}
          placeholder={t('Trần Văn B', 'Tran Van B')}
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Ngày QC duyệt', 'QC Approval Date')}</Label>
        <Input
          type="date"
          value={formData.qcApprovalDate}
          onChange={e => updateField('qcApprovalDate', e.target.value)}
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Loại đóng gói', 'Packaging Type')}</Label>
        <Select value={formData.packagingType} onValueChange={v => updateField('packagingType', v)}>
          <SelectTrigger className="rounded-xl border-coffee-200 w-full">
            <SelectValue placeholder={t('Chọn loại', 'Select type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jute-bag">{t('Túi đay 60kg', 'Jute Bag 60kg')}</SelectItem>
            <SelectItem value="grainpro">{t('Túi GrainPro', 'GrainPro Bag')}</SelectItem>
            <SelectItem value="vacuum">{t('Túi chân không', 'Vacuum Pack')}</SelectItem>
            <SelectItem value="custom">{t('Tùy chỉnh', 'Custom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Trọng lượng đóng gói (kg)', 'Package Weight (kg)')}</Label>
        <Input
          type="number" step="0.1"
          value={formData.packageWeight}
          onChange={e => updateField('packageWeight', e.target.value)}
          placeholder="60"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Số lô', 'Lot Number')}</Label>
        <Input
          value={formData.lotNumber}
          onChange={e => updateField('lotNumber', e.target.value)}
          placeholder="LOT-2024-001"
          className="rounded-xl border-coffee-200 focus:border-coffee-500"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-coffee-700">{t('Ghi chú', 'Notes')}</Label>
        <Textarea
          value={formData.notes}
          onChange={e => updateField('notes', e.target.value)}
          placeholder={t('Ghi chú thêm...', 'Additional notes...')}
          className="rounded-xl border-coffee-200 focus:border-coffee-500 min-h-[80px]"
          rows={3}
        />
      </div>
    </div>
  )

  // ─── Summary step ────────────────────────────────────────────

  const renderSummary = () => {
    const summarySections = [
      {
        title: STEPS[0],
        items: [
          { label: t('Mã lệnh', 'Job Order ID'), value: formData.jobOrderId },
          { label: t('Ngày chế biến', 'Processing Date'), value: formData.processingDate },
          { label: t('PP chế biến', 'Method'), value: formData.processingMethod },
          { label: t('Nhà máy', 'Facility'), value: formData.plantFacilityName },
          { label: t('Mã lô', 'Batch ID'), value: formData.batchId },
          { label: t('TL đầu vào', 'Input Weight'), value: formData.inputWeight ? `${formData.inputWeight} kg` : '' },
          { label: t('Cấp độ chín', 'Ripeness'), value: formData.cherryRipenessGrade },
          { label: t('Lỗi', 'Defects'), value: formData.defects ? `${formData.defects}%` : '' },
          { label: t('PP phân loại', 'Sorting'), value: formData.sortingMethod },
          { label: t('Người VH', 'Operator'), value: formData.operatorName },
        ],
      },
      {
        title: STEPS[1],
        items: [
          { label: t('PP bóc vỏ', 'Pulping'), value: formData.pulpingMethod },
          { label: t('Loại lên men', 'Fermentation'), value: formData.fermentationType },
          { label: t('Thời gian LM', 'Duration'), value: formData.fermentationDurationHrs ? `${formData.fermentationDurationHrs} hrs` : '' },
          { label: t('Nước', 'Water'), value: formData.waterUsage ? `${formData.waterUsage} L` : '' },
          { label: t('pH', 'pH'), value: formData.phLevel },
          { label: t('Nhiệt độ', 'Temp'), value: formData.temperature2 ? `${formData.temperature2}°C` : '' },
        ],
      },
      {
        title: STEPS[2],
        items: [
          { label: t('PP rửa', 'Washing'), value: formData.washingMethod },
          { label: t('Nguồn nước', 'Source'), value: formData.waterSource },
          { label: t('Số lần rửa', 'Cycles'), value: formData.washCycles },
          { label: t('Nước sạch', 'Clean Water'), value: formData.cleanWaterUsed ? `${formData.cleanWaterUsed} L` : '' },
        ],
      },
      {
        title: STEPS[3],
        items: [
          { label: t('PP sấy', 'Drying'), value: formData.dryingMethod },
          { label: t('Thời gian sấy', 'Duration'), value: formData.dryingDurationDays ? `${formData.dryingDurationDays} days` : '' },
          { label: t('Độ ẩm mục tiêu', 'Target Moisture'), value: formData.targetMoisture ? `${formData.targetMoisture}%` : '' },
          { label: t('Độ ẩm thực tế', 'Actual Moisture'), value: formData.actualMoisture ? `${formData.actualMoisture}%` : '' },
          { label: t('Nhiệt độ', 'Temp'), value: formData.temperature4 ? `${formData.temperature4}°C` : '' },
          { label: t('Độ ẩm KK', 'Humidity'), value: formData.humidity ? `${formData.humidity}%` : '' },
          { label: t('Máy', 'Machine'), value: formData.machineUsed },
        ],
      },
      {
        title: STEPS[4],
        items: [
          { label: t('PP bóc lụa', 'Hulling'), value: formData.hullingMethod },
          { label: t('TL đầu ra', 'Output Weight'), value: formData.outputWeight ? `${formData.outputWeight} kg` : '' },
          { label: t('Rây (screen)', 'Screen'), value: formData.screenSize5 },
          { label: t('Đánh bóng', 'Polished'), value: formData.polishingDone ? t('Có', 'Yes') : t('Không', 'No') },
        ],
      },
      {
        title: STEPS[5],
        items: [
          { label: t('Hạng', 'Grade'), value: formData.grade },
          { label: t('Rây (screen)', 'Screen'), value: formData.screenSize6 },
          { label: t('Số lỗi', 'Defects'), value: formData.defectCount },
          { label: t('Tạp chất', 'Foreign Matter'), value: formData.foreignMatter ? `${formData.foreignMatter}%` : '' },
          { label: t('Điểm cupping', 'Cup Score'), value: formData.cupScore },
          { label: t('Hạng tổng', 'Overall'), value: formData.overallGrade },
        ],
      },
      {
        title: STEPS[6],
        items: [
          { label: t('QC duyệt', 'QC By'), value: formData.qcApprovedBy },
          { label: t('Ngày QC', 'QC Date'), value: formData.qcApprovalDate },
          { label: t('Loại đóng gói', 'Packaging'), value: formData.packagingType },
          { label: t('TL đóng gói', 'Pkg Weight'), value: formData.packageWeight ? `${formData.packageWeight} kg` : '' },
          { label: t('Số lô', 'Lot No'), value: formData.lotNumber },
          { label: t('Ghi chú', 'Notes'), value: formData.notes },
        ],
      },
    ]

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        {summarySections.map((section, idx) => (
          <Card key={idx} className="rounded-xl border border-coffee-200 overflow-hidden">
            <div className="bg-gradient-to-r from-coffee-50 to-coffee-100/50 px-4 py-2.5 flex items-center gap-2 border-b border-coffee-200">
              <section.title.icon className="w-4 h-4 text-coffee-600" />
              <span className="text-xs font-bold text-coffee-800">
                {idx + 1}. {lang === 'vi' ? section.title.vi : section.title.en}
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex flex-col">
                    <span className="text-[10px] text-coffee-400 uppercase tracking-wide">{item.label}</span>
                    <span className="text-xs text-coffee-800 font-medium truncate">
                      {item.value || <span className="text-coffee-300 italic">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7]

  // ─── Main render ─────────────────────────────────────────────

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/processing')}
              className="text-coffee-500 hover:text-coffee-800 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-coffee-900 flex items-center gap-2">
                <Cog className="w-5 h-5 text-coffee-600" />
                {t('Tạo lệnh chế biến', 'Processing Wizard')}
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                {t('Điền thông tin từng bước trong quy trình chế biến', 'Fill in each step of the processing pipeline')}
              </p>
            </div>
          </div>
          <Badge className="bg-coffee-100 text-coffee-700 border border-coffee-200 text-[10px]">
            {t(`Bước ${currentStep + 1}/7`, `Step ${currentStep + 1}/7`)}
          </Badge>
        </div>

        {/* Stepper */}
        <Card className="rounded-2xl border-0 shadow-sm mb-6 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            {/* Desktop stepper */}
            <div className="hidden md:flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStep
                const isCompleted = idx < currentStep
                const StepIcon = step.icon
                return (
                  <div key={step.num} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => goToStep(idx)}
                      className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                        isCompleted ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-default'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          isCompleted
                            ? 'bg-green-500 text-white shadow-md shadow-green-200'
                            : isActive
                            ? 'bg-gradient-to-br from-coffee-500 to-coffee-800 text-white shadow-lg shadow-coffee-300/50 ring-4 ring-coffee-100'
                            : 'bg-coffee-100 text-coffee-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : isActive ? (
                          <StepIcon className="w-4.5 h-4.5" />
                        ) : (
                          step.num
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-medium text-center max-w-[80px] leading-tight transition-colors ${
                          isActive ? 'text-coffee-800' : isCompleted ? 'text-green-700' : 'text-coffee-400'
                        }`}
                      >
                        {lang === 'vi' ? step.vi : step.en}
                      </span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 mt-[-20px]">
                        <div
                          className={`h-0.5 rounded-full transition-all duration-500 ${
                            idx < currentStep ? 'bg-green-400' : 'bg-coffee-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile stepper - compact */}
            <div className="md:hidden">
              <div className="flex items-center gap-1 mb-3">
                {STEPS.map((step, idx) => {
                  const isActive = idx === currentStep
                  const isCompleted = idx < currentStep
                  return (
                    <div key={step.num} className="flex-1 flex items-center">
                      <button
                        onClick={() => goToStep(idx)}
                        className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500'
                            : isActive
                            ? 'bg-gradient-to-r from-coffee-500 to-coffee-800'
                            : 'bg-coffee-200'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep < currentStep + 1
                    ? 'bg-gradient-to-br from-coffee-500 to-coffee-800 text-white'
                    : 'bg-coffee-100 text-coffee-400'
                }`}>
                  {currentStep + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-coffee-800">
                    {lang === 'vi' ? STEPS[currentStep].vi : STEPS[currentStep].en}
                  </p>
                  <p className="text-[10px] text-coffee-500">
                    {t(`Bước ${currentStep + 1} của 7`, `Step ${currentStep + 1} of 7`)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1.5 bg-coffee-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-coffee-500 to-coffee-800 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content card */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-coffee-50 to-coffee-100/50 border-b border-coffee-200 pb-4">
            <CardTitle className="text-coffee-800 flex items-center gap-2 text-base">
              {(() => {
                const StepIcon = STEPS[currentStep].icon
                return <StepIcon className="w-5 h-5 text-coffee-600" />
              })()}
              {currentStep + 1}. {lang === 'vi' ? STEPS[currentStep].vi : STEPS[currentStep].en}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <div
              className="transition-all duration-300"
              style={{
                opacity: 1,
                transform: direction === 'forward' ? 'translateX(0)' : 'translateX(0)',
              }}
            >
              {currentStep < 7 ? stepRenderers[currentStep]() : renderSummary()}
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className="rounded-xl border-coffee-200 text-coffee-600 hover:bg-coffee-50 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('Quay lại', 'Back')}
          </Button>

          <div className="flex items-center gap-2">
            {/* Step dots for mobile */}
            <div className="flex md:hidden items-center gap-1">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep ? 'bg-coffee-600 w-4' : idx < currentStep ? 'bg-green-400' : 'bg-coffee-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {currentStep < 6 ? (
            <Button
              onClick={goNext}
              className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
            >
              {t('Tiếp theo', 'Next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : currentStep === 6 ? (
            <Button
              onClick={() => {
                setDirection('forward')
                setCurrentStep(7) // Go to summary
              }}
              className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
            >
              {t('Xem lại', 'Review')}
              <ClipboardCheck className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2 rounded-xl shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('Đang gửi...', 'Submitting...')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('Gửi lệnh chế biến', 'Submit Job Order')}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Summary step navigation */}
        {currentStep === 7 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setDirection('backward')
                setCurrentStep(6)
              }}
              className="text-coffee-500 hover:text-coffee-800 text-xs gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              {t('Quay lại chỉnh sửa', 'Go back to edit')}
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

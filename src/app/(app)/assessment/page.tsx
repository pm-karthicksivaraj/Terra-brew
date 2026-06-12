'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Globe, ChevronRight, ChevronLeft, Shield, MapPin,
  TreePine, FileCheck, Award, Truck, BarChart3, FileText,
  Printer, RotateCcw, ArrowRight, Building2, CheckCircle2,
  Loader2, Satellite, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import AssessmentReport from '@/components/assessment/assessment-report'
import type { AssessmentResult } from '@/components/assessment/assessment-report'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface FormData {
  entityType: string
  countryCode: string
  exportsToEU: string
  annualVolumeTons: string
  hasGPSCoordinates: string
  hasDeforestationAssessment: string
  hasTraceabilityRecords: string
  hasCertifications: string
  hasDueDiligenceProcess: string
  supplierCount: string
}

const INITIAL_FORM: FormData = {
  entityType: '',
  countryCode: '',
  exportsToEU: '',
  annualVolumeTons: '',
  hasGPSCoordinates: '',
  hasDeforestationAssessment: '',
  hasTraceabilityRecords: '',
  hasCertifications: '',
  hasDueDiligenceProcess: '',
  supplierCount: '',
}

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════

const ENTITY_TYPES = [
  { value: 'producer', label: 'Coffee Producer', labelVi: 'Nhà sản xuất Cà phê', icon: '🏭', desc: 'Farm-level coffee production' },
  { value: 'aggregator', label: 'Aggregator / Cooperative', labelVi: 'Hợp tác xã / Tập hợp', icon: '📦', desc: 'Multi-farmer aggregation' },
  { value: 'exporter', label: 'Coffee Exporter', labelVi: 'Nhà xuất khẩu Cà phê', icon: '🚢', desc: 'Cross-border coffee trade' },
  { value: 'importer', label: 'Coffee Importer', labelVi: 'Nhà nhập khẩu Cà phê', icon: '🏛️', desc: 'EU market import operations' },
]

const COUNTRIES = [
  { value: 'VN', label: 'Vietnam' },
  { value: 'BR', label: 'Brazil' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'KE', label: 'Kenya' },
  { value: 'CO', label: 'Colombia' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'HN', label: 'Honduras' },
  { value: 'PE', label: 'Peru' },
  { value: 'UG', label: 'Uganda' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IN', label: 'India' },
  { value: 'MX', label: 'Mexico' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'BE', label: 'Belgium' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'JP', label: 'Japan' },
  { value: 'OTHER', label: 'Other' },
]

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'EUDR Requirements', icon: Shield },
  { id: 3, label: 'Compliance Status', icon: FileCheck },
  { id: 4, label: 'Results', icon: BarChart3 },
]

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export default function AssessmentPage() {
  const router = useRouter()
  const { lang, setLang } = useI18n()
  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const [currentStep, setCurrentStep] = useState(0) // 0 = hero, 1-3 = form steps, 4 = results
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepProgress = useMemo(() => {
    if (currentStep === 0) return 0
    if (currentStep === 4) return 100
    return Math.round((currentStep / 4) * 100)
  }, [currentStep])

  // ─── Form Helpers ───

  function updateForm(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  function validateStep(step: number): boolean {
    switch (step) {
      case 1:
        if (!formData.entityType) { setError('Please select your entity type'); return false }
        if (!formData.countryCode) { setError('Please select your country of operation'); return false }
        if (!formData.exportsToEU) { setError('Please indicate if you export to the EU'); return false }
        if (!formData.annualVolumeTons || Number(formData.annualVolumeTons) < 0) { setError('Please enter your annual export volume'); return false }
        return true
      case 2:
        if (!formData.hasGPSCoordinates) { setError('Please indicate if you have GPS coordinates'); return false }
        if (!formData.hasDeforestationAssessment) { setError('Please indicate if you have deforestation risk assessments'); return false }
        if (!formData.hasTraceabilityRecords) { setError('Please indicate if you have traceability records'); return false }
        return true
      case 3:
        if (!formData.hasCertifications) { setError('Please indicate if you have certifications'); return false }
        if (!formData.hasDueDiligenceProcess) { setError('Please indicate if you have a due diligence process'); return false }
        if (!formData.supplierCount || Number(formData.supplierCount) < 0) { setError('Please enter the number of suppliers'); return false }
        return true
      default:
        return true
    }
  }

  function handleNext() {
    if (currentStep >= 1 && currentStep <= 3 && !validateStep(currentStep)) return

    if (currentStep === 3) {
      // Submit calculation
      calculateScore()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  function handleBack() {
    setError(null)
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  async function calculateScore() {
    setIsCalculating(true)
    setError(null)

    try {
      const payload = {
        entityType: formData.entityType,
        countryCode: formData.countryCode,
        exportsToEU: formData.exportsToEU === 'yes',
        annualVolumeTons: Number(formData.annualVolumeTons),
        hasGPSCoordinates: formData.hasGPSCoordinates === 'yes',
        hasDeforestationAssessment: formData.hasDeforestationAssessment === 'yes',
        hasTraceabilityRecords: formData.hasTraceabilityRecords === 'yes',
        hasCertifications: formData.hasCertifications === 'yes',
        hasDueDiligenceProcess: formData.hasDueDiligenceProcess === 'yes',
        supplierCount: Number(formData.supplierCount),
      }

      const response = await fetch('/api/assessment/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Calculation failed')
      }

      const data = await response.json() as AssessmentResult
      setResult(data)
      setCurrentStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate assessment')
    } finally {
      setIsCalculating(false)
    }
  }

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

  function handlePrint() {
    window.print()
  }

  async function handleDownloadPDF() {
    if (!result) return
    setIsDownloadingPDF(true)
    try {
      const response = await fetch('/api/assessment/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `EUDR-Readiness-Assessment-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      // Fallback to browser print
      window.print()
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  function handleReset() {
    setFormData(INITIAL_FORM)
    setResult(null)
    setCurrentStep(0)
    setError(null)
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#E8D8C4]/20 via-background to-background print:from-white print:to-white">
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#C7B7A3]/20 bg-white/80 backdrop-blur-sm print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-9 h-9 rounded-lg bg-[#6D2932] flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5 text-[#E8D8C4]" />
          </div>
          <span className="text-lg font-bold text-[#561C24] tracking-tight">Terra Brew</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-[#E8D8C4]/30">
            <Globe className="w-3.5 h-3.5" />
            {lang === 'vi' ? 'EN' : 'VI'}
          </Button>
          {currentStep > 0 && currentStep < 4 && (
            <Button variant="outline" size="sm" className="border-[#C7B7A3] text-[#561C24] text-xs" onClick={() => router.push('/')}>
              {t('Về trang chủ', 'Back to Home')}
            </Button>
          )}
        </div>
      </header>

      {/* ─── Step Progress Bar (form steps only) ─── */}
      {currentStep >= 1 && currentStep <= 4 && (
        <div className="px-4 md:px-8 py-3 bg-white/60 backdrop-blur-sm border-b border-[#C7B7A3]/10 print:hidden">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep) {
                      setCurrentStep(step.id)
                      setError(null)
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    step.id === currentStep
                      ? 'text-[#6D2932]'
                      : step.id < currentStep
                        ? 'text-emerald-600 cursor-pointer hover:text-emerald-700'
                        : 'text-muted-foreground'
                  }`}
                >
                  <step.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{step.label}</span>
                  {step.id < currentStep && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
            </div>
            <Progress value={stepProgress} className="h-1.5 [&>div]:bg-[#6D2932]" />
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-6 print:py-0 print:px-0">
        <div className="w-full max-w-2xl">

          {/* ═══ STEP 0: Hero / Start ═══ */}
          {currentStep === 0 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-[#6D2932]/10 text-[#6D2932] px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-[#6D2932]/20">
                <Satellite className="w-3.5 h-3.5" />
                {t('Đánh giá Miễn phí', 'Free Assessment')}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-[#561C24] mb-4 leading-tight">
                {t(
                  'Đánh giá Sẵn sàng Tuân thủ EUDR',
                  'EUDR Readiness Assessment'
                )}
              </h1>

              <p className="text-base md:text-lg text-[#6D2932]/70 mb-4 max-w-xl mx-auto leading-relaxed">
                {t(
                  'Khám phá mức độ sẵn sàng của tổ chức bạn cho Quy định Phá rừng của EU (EUDR). Nhận điểm số chi tiết và các khuyến nghị cụ thể — hoàn toàn miễn phí.',
                  'Discover how prepared your organization is for the EU Deforestation Regulation (EUDR). Get a detailed score and actionable recommendations — completely free.'
                )}
              </p>

              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                {t(
                  'Mất khoảng 3 phút. Không cần đăng nhập. Dữ liệu của bạn không được lưu trữ.',
                  'Takes about 3 minutes. No login required. Your data is not stored.'
                )}
              </p>

              {/* Key areas assessed */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
                {[
                  { icon: Shield, label: t('Tuân thủ EUDR', 'EUDR Compliance') },
                  { icon: MapPin, label: t('Tọa độ GPS', 'GPS Coordinates') },
                  { icon: TreePine, label: t('Rủi ro Phá rừng', 'Deforestation Risk') },
                  { icon: Award, label: t('Chứng nhận', 'Certifications') },
                  { icon: Truck, label: t('Truy xuất', 'Traceability') },
                  { icon: FileText, label: t('Hợp pháp Kỹ thuật', 'Due Diligence') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/80 rounded-lg p-2.5 border border-[#C7B7A3]/20">
                    <item.icon className="w-4 h-4 text-[#6D2932] shrink-0" />
                    <span className="text-xs font-medium text-[#561C24]">{item.label}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-[#6D2932] hover:bg-[#561C24] text-[#E8D8C4] px-10 py-6 text-base rounded-xl shadow-lg shadow-[#6D2932]/20 transition-all duration-300 hover:shadow-xl"
                onClick={() => setCurrentStep(1)}
              >
                {t('Bắt đầu Đánh giá Miễn phí', 'Start Free Assessment')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          )}

          {/* ═══ STEP 1: Business Information ═══ */}
          {currentStep === 1 && (
            <Card className="border-[#C7B7A3]/30 shadow-lg print:shadow-none print:border-0">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#6D2932] flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[#E8D8C4]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#561C24]">
                      {t('Thông tin Doanh nghiệp', 'Business Information')}
                    </CardTitle>
                    <CardDescription>
                      {t('Cho chúng tôi biết về hoạt động cà phê của bạn', 'Tell us about your coffee business')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entity Type */}
                <div className="space-y-3">
                  <Label className="text-[#561C24] font-bold text-sm">
                    {t('1. Loại thực thể của bạn?', '1. What is your entity type?')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ENTITY_TYPES.map((entity) => (
                      <button
                        key={entity.value}
                        onClick={() => updateForm('entityType', entity.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          formData.entityType === entity.value
                            ? 'border-[#6D2932] bg-[#6D2932]/5 shadow-sm'
                            : 'border-[#C7B7A3]/30 hover:border-[#C7B7A3] hover:bg-[#E8D8C4]/20'
                        }`}
                      >
                        <span className="text-2xl">{entity.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-[#561C24]">{t(entity.labelVi, entity.label)}</p>
                          <p className="text-[10px] text-muted-foreground">{entity.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label className="text-[#561C24] font-bold text-sm">
                    {t('2. Quốc gia hoạt động', '2. Country of operation')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.countryCode} onValueChange={(v) => updateForm('countryCode', v)}>
                    <SelectTrigger className="w-full border-[#C7B7A3]/50">
                      <SelectValue placeholder={t('Chọn quốc gia...', 'Select country...')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Export to EU */}
                <div className="space-y-2">
                  <Label className="text-[#561C24] font-bold text-sm">
                    {t('3. Bạn có xuất khẩu sang EU không?', '3. Do you export to the EU?')} <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup value={formData.exportsToEU} onValueChange={(v) => updateForm('exportsToEU', v)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="eu-yes" />
                        <Label htmlFor="eu-yes" className="text-sm text-[#561C24] font-normal cursor-pointer">
                          {t('Có', 'Yes')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="eu-no" />
                        <Label htmlFor="eu-no" className="text-sm text-[#561C24] font-normal cursor-pointer">
                          {t('Không', 'No')}
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Annual Volume */}
                <div className="space-y-2">
                  <Label className="text-[#561C24] font-bold text-sm">
                    {t('4. Sản lượng xuất khẩu hàng năm (tấn)', '4. Annual export volume (tons)')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={t('Ví dụ: 500', 'e.g., 500')}
                    value={formData.annualVolumeTons}
                    onChange={(e) => updateForm('annualVolumeTons', e.target.value)}
                    className="border-[#C7B7A3]/50"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 2: EUDR Requirements ═══ */}
          {currentStep === 2 && (
            <Card className="border-[#C7B7A3]/30 shadow-lg print:shadow-none print:border-0">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#6D2932] flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#E8D8C4]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#561C24]">
                      {t('Yêu cầu EUDR', 'EUDR Requirements')}
                    </CardTitle>
                    <CardDescription>
                      {t('Các yếu tố then chốt cho tuân thủ EUDR', 'Key elements for EUDR compliance')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* GPS Coordinates */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#6D2932] mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-[#561C24] font-bold text-sm">
                        {t('5. Bạn có tọa độ GPS cho các nông trại không?', '5. Do you have GPS coordinates for your farms?')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('Bắt buộc cho EUDR — tất cả các mảnh đất sản xuất phải có tọa độ GPS', 'Required by EUDR — all production plots must have GPS coordinates')}
                      </p>
                    </div>
                  </div>
                  <RadioGroup value={formData.hasGPSCoordinates} onValueChange={(v) => updateForm('hasGPSCoordinates', v)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="gps-yes" />
                        <Label htmlFor="gps-yes" className="text-sm cursor-pointer">{t('Có', 'Yes')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="gps-no" />
                        <Label htmlFor="gps-no" className="text-sm cursor-pointer">{t('Không', 'No')}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Deforestation Assessment */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <TreePine className="w-4 h-4 text-[#6D2932] mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-[#561C24] font-bold text-sm">
                        {t('6. Bạn có đánh giá rủi ro phá rừng không?', '6. Do you have deforestation risk assessments?')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('Bắt buộc cho EUDR — xác minh không phá rừng kể từ tháng 12/2020', 'Required by EUDR — verify no deforestation since December 2020')}
                      </p>
                    </div>
                  </div>
                  <RadioGroup value={formData.hasDeforestationAssessment} onValueChange={(v) => updateForm('hasDeforestationAssessment', v)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="deforest-yes" />
                        <Label htmlFor="deforest-yes" className="text-sm cursor-pointer">{t('Có', 'Yes')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="deforest-no" />
                        <Label htmlFor="deforest-no" className="text-sm cursor-pointer">{t('Không', 'No')}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Traceability Records */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-[#6D2932] mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-[#561C24] font-bold text-sm">
                        {t('7. Bạn có hồ sơ truy xuất chuỗi cung ứng không?', '7. Do you have traceability records for your supply chain?')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('Bắt buộc cho EUDR — truy xuất từ nông trại đến xuất khẩu', 'Required by EUDR — trace from farm to export')}
                      </p>
                    </div>
                  </div>
                  <RadioGroup value={formData.hasTraceabilityRecords} onValueChange={(v) => updateForm('hasTraceabilityRecords', v)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="trace-yes" />
                        <Label htmlFor="trace-yes" className="text-sm cursor-pointer">{t('Có', 'Yes')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="trace-no" />
                        <Label htmlFor="trace-no" className="text-sm cursor-pointer">{t('Không', 'No')}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 3: Current Compliance Status ═══ */}
          {currentStep === 3 && (
            <Card className="border-[#C7B7A3]/30 shadow-lg print:shadow-none print:border-0">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#6D2932] flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-[#E8D8C4]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#561C24]">
                      {t('Trạng thái Tuân thủ Hiện tại', 'Current Compliance Status')}
                    </CardTitle>
                    <CardDescription>
                      {t('Tình trạng tuân thủ và hoạt động hiện tại của bạn', 'Your current compliance posture and operations')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Certifications */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-[#6D2932] mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-[#561C24] font-bold text-sm">
                        {t('8. Bạn có chứng nhận không (hữu cơ, thương mại công bằng, UTZ, v.v.)?', '8. Do you have certifications (organic, fairtrade, UTZ, etc.)?')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('Tăng cường vị trí tuân thủ EUDR và niềm tin của người mua', 'Strengthens EUDR compliance position and buyer trust')}
                      </p>
                    </div>
                  </div>
                  <RadioGroup value={formData.hasCertifications} onValueChange={(v) => updateForm('hasCertifications', v)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="cert-yes" />
                        <Label htmlFor="cert-yes" className="text-sm cursor-pointer">{t('Có', 'Yes')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="cert-no" />
                        <Label htmlFor="cert-no" className="text-sm cursor-pointer">{t('Không', 'No')}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Due Diligence Process */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-[#6D2932] mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-[#561C24] font-bold text-sm">
                        {t('9. Bạn có quy trình khai báo hợp pháp kỹ thuật không?', '9. Do you have a due diligence statement process?')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('Bắt buộc cho EUDR — khai báo hợp pháp kỹ thuật cho mỗi lô hàng nhập khẩu vào EU', 'Required by EUDR — due diligence statement for each shipment imported into the EU')}
                      </p>
                    </div>
                  </div>
                  <RadioGroup value={formData.hasDueDiligenceProcess} onValueChange={(v) => updateForm('hasDueDiligenceProcess', v)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="dds-yes" />
                        <Label htmlFor="dds-yes" className="text-sm cursor-pointer">{t('Có', 'Yes')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="dds-no" />
                        <Label htmlFor="dds-no" className="text-sm cursor-pointer">{t('Không', 'No')}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Supplier Count */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-[#6D2932] mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-[#561C24] font-bold text-sm">
                        {t('10. Bạn làm việc với bao nhiêu nông dân/nhà cung cấp?', '10. How many farmers/suppliers do you work with?')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('Nhiều nhà cung cấp hơn = phức tạp tuân thủ cao hơn', 'More suppliers = higher compliance complexity')}
                      </p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={t('Ví dụ: 50', 'e.g., 50')}
                    value={formData.supplierCount}
                    onChange={(e) => updateForm('supplierCount', e.target.value)}
                    className="border-[#C7B7A3]/50"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 4: Results ═══ */}
          {currentStep === 4 && result && (
            <div>
              {/* Report Component */}
              <AssessmentReport
                result={result}
                formData={{
                  entityType: formData.entityType,
                  countryCode: formData.countryCode,
                  exportsToEU: formData.exportsToEU === 'yes',
                  annualVolumeTons: Number(formData.annualVolumeTons),
                  hasGPSCoordinates: formData.hasGPSCoordinates === 'yes',
                  hasDeforestationAssessment: formData.hasDeforestationAssessment === 'yes',
                  hasTraceabilityRecords: formData.hasTraceabilityRecords === 'yes',
                  hasCertifications: formData.hasCertifications === 'yes',
                  hasDueDiligenceProcess: formData.hasDueDiligenceProcess === 'yes',
                  supplierCount: Number(formData.supplierCount),
                }}
              />

              {/* Action Buttons (hidden in print) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 print:hidden">
                <Button
                  size="lg"
                  className="bg-[#6D2932] hover:bg-[#561C24] text-[#E8D8C4] px-6 rounded-xl shadow-md gap-2"
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                >
                  {isDownloadingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {isDownloadingPDF
                    ? t('Đang tạo PDF...', 'Generating PDF...')
                    : t('Tải xuống PDF', 'Download PDF')
                  }
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#C7B7A3] text-[#561C24] px-6 rounded-xl gap-2"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4" />
                  {t('In báo cáo', 'Print Report')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#C7B7A3] text-[#561C24] px-6 rounded-xl gap-2"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('Đánh giá lại', 'Retake Assessment')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#6D2932] text-[#6D2932] px-6 rounded-xl gap-2 hover:bg-[#6D2932]/5"
                  onClick={() => router.push('/login')}
                >
                  {t('Đăng ký Terra Brew', 'Sign Up for Terra Brew')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── Loading State ─── */}
          {isCalculating && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[#6D2932] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Loader2 className="w-8 h-8 text-[#E8D8C4] animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-[#561C24] mb-2">
                {t('Đang tính toán Điểm sẵn sàng...', 'Calculating Readiness Score...')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('Phân tích câu trả lời của bạn so với yêu cầu EUDR', 'Analyzing your responses against EUDR requirements')}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Error Message ─── */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 print:hidden">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* ─── Navigation Buttons ─── */}
      {currentStep >= 1 && currentStep <= 3 && !isCalculating && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#C7B7A3]/20 px-4 md:px-8 py-3 print:hidden">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-[#C7B7A3] text-[#561C24] gap-1 rounded-xl"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              {t('Quay lại', 'Back')}
            </Button>

            <div className="text-xs text-muted-foreground">
              {t(`Bước ${currentStep}/3`, `Step ${currentStep} of 3`)}
            </div>

            <Button
              onClick={handleNext}
              className="bg-[#6D2932] hover:bg-[#561C24] text-[#E8D8C4] gap-1 rounded-xl shadow-sm"
            >
              {currentStep === 3
                ? t('Xem Kết quả', 'See Results')
                : t('Tiếp tục', 'Continue')
              }
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      {currentStep === 0 && (
        <footer className="px-4 md:px-8 py-6 border-t border-[#C7B7A3]/20 print:hidden">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6D2932] flex items-center justify-center">
                <Coffee className="w-3.5 h-3.5 text-[#E8D8C4]" />
              </div>
              <span className="font-bold text-[#561C24] text-sm">Terra Brew</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              © {new Date().getFullYear()} Terra Brew — {t('Phần mềm Truy xuất Cà phê & Tuân thủ EUDR', 'Coffee Traceability & EUDR Compliance Software')}
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

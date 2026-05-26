'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Coffee, Globe, Upload, Database, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, FileWarning, MapPin, Shield,
  Sparkles, ChevronRight, X, FileText, TreePine, Link2,
  Satellite, Loader2,
} from 'lucide-react'
import { useI18n } from '@/i18n'
import { EudrComplianceScore, type ComplianceBreakdownItem } from './eudr-compliance-score'

// ─── Types ─────────────────────────────────────────────────────

export interface StartHereFlowProps {
  /** Called when onboarding is complete */
  onComplete?: () => void
  /** Called when user skips onboarding */
  onSkip?: () => void
  /** Whether to show as full-page or embedded */
  fullPage?: boolean
}

// ─── Step Indicator ────────────────────────────────────────────

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-1 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 shrink-0 ${
                i < current
                  ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                  : i === current
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] hidden sm:inline truncate transition-colors ${
                i === current ? 'font-bold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-green-500' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: EU Export Question ────────────────────────────────

function StepExportQuestion({
  onAnswer,
  t2,
}: {
  onAnswer: (exports: boolean) => void
  t2: (vi: string, en: string) => string
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-8">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-coffee-700 flex items-center justify-center shadow-xl shadow-primary/30">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg">
          <Coffee className="w-4 h-4 text-coffee-800" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t2('Bạn có xuất khẩu cà phê sang EU không?', 'Do you export coffee to the EU?')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t2(
            'Quy định EUDR yêu cầu tuân thủ đối với tất cả cà phê nhập khẩu vào thị trường EU.',
            'EUDR regulation requires compliance for all coffee imported into the EU market.'
          )}
        </p>
      </div>

      {/* Answer Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary hover:border-primary p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <CheckCircle2 className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-bold text-foreground group-hover:text-primary-foreground transition-colors">
                {t2('Có, chúng tôi xuất khẩu sang EU', 'Yes, we export to EU')}
              </p>
              <p className="text-[10px] text-muted-foreground group-hover:text-primary-foreground/70 mt-1 transition-colors">
                {t2('Bắt đầu đánh giá tuân thủ', 'Start compliance assessment')}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onAnswer(false)}
          className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-border bg-card hover:bg-accent/50 p-6 transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center transition-colors">
              <ClockIcon className="w-7 h-7 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <p className="font-bold text-foreground transition-colors">
                {t2('Chưa, nhưng dự định', 'Not yet')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t2('Chuẩn bị sẵn sàng cho EUDR', 'Prepare for EUDR compliance')}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ─── Step 2: Upload / Sample ───────────────────────────────────

function StepUpload({
  onUpload,
  onUseSample,
  isDragging,
  setIsDragging,
  t2,
}: {
  onUpload: (files: FileList) => void
  onUseSample: () => void
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  t2: (vi: string, en: string) => string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploaded, setUploaded] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        setUploaded(true)
        onUpload(e.dataTransfer.files)
      }
    },
    [onUpload, setIsDragging]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    },
    [setIsDragging]
  )

  const handleDragLeave = useCallback(() => setIsDragging(false), [setIsDragging])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploaded(true)
      onUpload(e.target.files)
    }
  }

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-6">
      {/* Title */}
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {t2('Tải lên dữ liệu hoặc dùng mẫu', 'Upload your data or use sample')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t2(
            'Tải tệp dữ liệu lô hàng, hoặc dùng dữ liệu mẫu để trải nghiệm ngay.',
            'Upload shipment data, or try with demo data to get started instantly.'
          )}
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-lg rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : uploaded
            ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
            : 'border-border hover:border-primary/40 hover:bg-accent/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4">
          {uploaded ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-bold text-green-700 dark:text-green-400">
                  {t2('Tệp đã được tải lên!', 'File uploaded!')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t2('Nhấn tiếp tục để xem kết quả', 'Click continue to see results')}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {t2('Kéo thả tệp hoặc nhấn để chọn', 'Drag & drop or click to select')}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  CSV, XLSX, JSON — {t2('tối đa 10MB', 'max 10MB')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-lg">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {t2('hoặc', 'or')}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Sample Data Button */}
      <Button
        variant="outline"
        size="lg"
        className="rounded-2xl gap-2.5 text-sm font-medium border-dashed h-12 px-8"
        onClick={onUseSample}
      >
        <Database className="w-4.5 h-4.5" />
        {t2('Dùng dữ liệu mẫu', 'Use sample data')}
        <Sparkles className="w-4 h-4 text-amber-500" />
      </Button>

      <p className="text-[10px] text-muted-foreground max-w-xs">
        {t2(
          'Dữ liệu mẫu từ 20 nông trại cà phê Việt Nam — không ảnh hưởng đến dữ liệu thật.',
          'Sample data from 20 Vietnamese coffee farms — does not affect real data.'
        )}
      </p>
    </div>
  )
}

// ─── Step 3: Results Snapshot ──────────────────────────────────

function StepResults({
  onGenerateDDS,
  onGoToDashboard,
  t2,
}: {
  onGenerateDDS: () => void
  onGoToDashboard: () => void
  t2: (vi: string, en: string) => string
}) {
  const mockBreakdown: ComplianceBreakdownItem[] = [
    { key: 'gps', labelVi: 'Độ phủ GPS', labelEn: 'GPS Plot Coverage', current: 12, total: 15, icon: MapPin },
    { key: 'farm', labelVi: 'Xác minh nông trại', labelEn: 'Farm Verification', current: 13, total: 20, icon: CheckCircle2 },
    { key: 'dds', labelVi: 'Hoàn thành DDS', labelEn: 'DDS Completion', current: 9, total: 20, icon: FileText },
    { key: 'deforest', labelVi: 'Kiểm tra phá rừng', labelEn: 'Deforestation Check', current: 18, total: 20, icon: TreePine },
    { key: 'trace', labelVi: 'Chuỗi truy xuất', labelEn: 'Traceability Chain', current: 11, total: 20, icon: Link2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {t2('Ảnh chụp Tuân thủ EUDR', 'Your EUDR Compliance Snapshot')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t2('Dựa trên dữ liệu của bạn, đây là tình trạng tuân thủ hiện tại.', 'Based on your data, here is your current compliance status.')}
        </p>
      </div>

      {/* Score Component */}
      <EudrComplianceScore
        score={62}
        breakdown={mockBreakdown}
        shipmentsAtRisk={8}
        penaltyPct="4%"
        onGenerateDDS={onGenerateDDS}
        onFixGPS={() => {}}
        onViewRisk={() => {}}
      />

      {/* Missing Data Checklist */}
      <Card className="rounded-2xl border border-border/50">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t2('Hành động cần làm', 'Action Items')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-2">
          {[
            { vi: 'Tạo 11 DDS còn thiếu', en: 'Generate 11 missing DDS', icon: FileWarning, urgent: true },
            { vi: 'Sửa 3 khoảng trống GPS', en: 'Fix 3 GPS gaps', icon: Satellite, urgent: true },
            { vi: 'Xác minh 7 nông trại còn lại', en: 'Verify 7 remaining farms', icon: CheckCircle2, urgent: false },
            { vi: 'Hoàn thiện 9 chuỗi truy xuất', en: 'Complete 9 traceability chains', icon: Link2, urgent: false },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  item.urgent
                    ? 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30'
                    : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.urgent ? 'text-red-500' : 'text-amber-500'}`} />
                <span className="text-xs font-medium text-foreground flex-1">
                  {t2(item.vi, item.en)}
                </span>
                {item.urgent && (
                  <Badge variant="destructive" className="text-[9px] h-5">
                    {t2('Khẩn cấp', 'Urgent')}
                  </Badge>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="destructive"
          size="lg"
          className="flex-1 rounded-2xl gap-2 text-sm font-bold h-12"
          onClick={onGenerateDDS}
        >
          <FileText className="w-5 h-5" />
          {t2('Tạo DDS Ngay', 'Generate DDS Now')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-2xl gap-2 text-sm h-12"
          onClick={onGoToDashboard}
        >
          {t2('Đi đến Bảng điều khiển', 'Go to Dashboard')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Main Flow Component ───────────────────────────────────────

export function StartHereFlow({ onComplete, onSkip, fullPage = false }: StartHereFlowProps) {
  const { t2 } = useI18n()
  const [step, setStep] = useState(0) // 0: export question, 1: upload, 2: results
  const [isDragging, setIsDragging] = useState(false)
  const [exportsToEU, setExportsToEU] = useState<boolean | null>(null)

  const stepLabels = [
    t2('Xuất khẩu EU', 'EU Export'),
    t2('Tải dữ liệu', 'Upload Data'),
    t2('Kết quả', 'Results'),
  ]

  const handleExportAnswer = useCallback((answer: boolean) => {
    setExportsToEU(answer)
    if (answer) {
      setStep(1)
    }
    // If "Not yet", still proceed - they need compliance prep
  }, [])

  const handleNotYetContinue = useCallback(() => {
    setStep(1)
  }, [])

  const handleUpload = useCallback((files: FileList) => {
    // In production, this would process the files
    // For now, just allow continuing
  }, [])

  const handleUseSample = useCallback(() => {
    setStep(2)
  }, [])

  const handleContinueWithUpload = useCallback(() => {
    setStep(2)
  }, [])

  const handleGenerateDDS = useCallback(() => {
    // Would navigate to DDS generation
    onComplete?.()
  }, [onComplete])

  const handleGoToDashboard = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  const wrapperClass = fullPage
    ? 'min-h-screen flex flex-col bg-background'
    : ''

  return (
    <div className={wrapperClass}>
      <div className={`flex-1 ${fullPage ? 'max-w-2xl mx-auto w-full px-4 py-8' : ''}`}>
        {/* Skip button */}
        {onSkip && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onSkip}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t2('Bỏ qua', 'Skip')}
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator current={step} total={3} labels={stepLabels} />
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {step === 0 && (
            <div>
              {exportsToEU === false ? (
                // Show "Not yet" message with continue
                <div className="flex flex-col items-center text-center space-y-6 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {t2('Chuẩn bị cho EUDR ngay', 'Prepare for EUDR now')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t2(
                        'Tuân thủ EUDR sẽ bắt buộc để tiếp cận thị trường EU. Chúng tôi có thể giúp bạn chuẩn bị ngay hôm nay.',
                        'EUDR compliance will be required for EU market access. We can prepare you now.'
                      )}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setExportsToEU(null)} className="rounded-xl gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {t2('Quay lại', 'Back')}
                    </Button>
                    <Button onClick={handleNotYetContinue} className="rounded-xl gap-2">
                      {t2('Tiếp tục', 'Continue')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <StepExportQuestion onAnswer={handleExportAnswer} t2={t2} />
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <StepUpload
                onUpload={handleUpload}
                onUseSample={handleUseSample}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                t2={t2}
              />
              {/* Continue button (visible after upload) */}
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t2('Quay lại', 'Back')}
                </Button>
                <Button onClick={handleContinueWithUpload} className="rounded-xl gap-2">
                  {t2('Tiếp tục với dữ liệu mẫu', 'Continue with Sample Data')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <StepResults
              onGenerateDDS={handleGenerateDDS}
              onGoToDashboard={handleGoToDashboard}
              t2={t2}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default StartHereFlow

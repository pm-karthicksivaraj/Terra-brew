'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Link2, Upload, Satellite, FileText, CheckCircle2,
  ArrowRight, ArrowLeft, Sparkles, Globe, Database, Shield,
  Loader2, MapPin, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { WizardStepIndicator } from './wizard-step-indicator'
import EudrComplianceScore from '@/components/compliance/eudr-compliance-score'

export interface ExporterWizardProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function ExporterWizard({ onComplete, onSkip }: ExporterWizardProps) {
  const { t2 } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)

  const stepLabels = [
    t2('Liên kết NCC', 'Link Supplier'),
    t2('Nhập GPS', 'Import GPS'),
    t2('Kiểm tra phá rừng', 'Deforestation Check'),
    t2('Tạo DDS', 'Generate DDS'),
  ]

  const handleStartScan = useCallback(() => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanComplete(true)
    }, 3000)
  }, [])

  const handleComplete = useCallback(() => {
    try { localStorage.setItem('terra-brew-onboarding-exporter', 'complete') } catch {}
    onComplete?.()
    router.push('/dashboard')
  }, [onComplete, router])

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8">
      {/* Skip button */}
      {onSkip && (
        <div className="flex justify-end mb-4">
          <button onClick={onSkip} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {t2('Bỏ qua', 'Skip')} →
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <WizardStepIndicator current={step} total={4} labels={stepLabels} />
      </div>

      <div className="animate-fade-in">
        {/* Step 1: Link Supplier */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-coffee-700 flex items-center justify-center mx-auto shadow-xl">
                <Link2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t2('Liên kết nhà cung cấp đầu tiên', 'Link Your First Supplier')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t2('Thêm nhà cung cấp cà phê để bắt đầu quy trình tuân thủ EUDR', 'Add a coffee supplier to start the EUDR compliance process')}
              </p>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Tên nhà cung cấp', 'Supplier Name')}</label>
                  <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" placeholder={t2('VD: Metrang Coffee', 'e.g. Metrang Coffee')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Quốc gia', 'Country')}</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option>Vietnam</option>
                    <option>Brazil</option>
                    <option>Ethiopia</option>
                    <option>Kenya</option>
                    <option>Colombia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Loại quan hệ', 'Relationship Type')}</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option>{t2('Nhà sản xuất', 'Producer')}</option>
                    <option>{t2('Tập hợp', 'Aggregator')}</option>
                    <option>{t2('Xuất khẩu', 'Exporter')}</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setStep(1)} className="rounded-xl gap-2">
                {t2('Tiếp tục', 'Continue')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Import GPS */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto shadow-xl">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t2('Nhập dữ liệu GPS', 'Import GPS Data')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t2('Tải lên đa giác GPS cho các mảnh đất cà phê của nhà cung cấp', 'Upload GPS polygons for supplier coffee plots')}
              </p>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-5">
                <div className="w-full rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">{t2('Kéo thả hoặc nhấn để chọn', 'Drag & drop or click to select')}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">GeoJSON, KML, CSV — {t2('tối đa 50MB', 'max 50MB')}</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground">{t2('hoặc', 'or')}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button variant="outline" className="w-full mt-3 rounded-xl gap-2" onClick={() => setStep(2)}>
                  <Database className="w-4 h-4" />
                  {t2('Dùng dữ liệu mẫu', 'Use sample data')}
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t2('Quay lại', 'Back')}
              </Button>
              <Button onClick={() => setStep(2)} className="rounded-xl gap-2">
                {t2('Tiếp tục', 'Continue')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Deforestation Check */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto shadow-xl">
                <Satellite className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t2('Kiểm tra phá rừng', 'Deforestation Check')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t2('Quét vệ tinh tự động cho các đa giác GPS đã nhập', 'Automated satellite scan for imported GPS polygons')}
              </p>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                {!scanComplete && !scanning && (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t2('Nhấn để bắt đầu kiểm tra vệ tinh bằng Global Forest Watch', 'Click to start satellite check using Global Forest Watch')}
                    </p>
                    <Button size="lg" className="rounded-xl gap-2" onClick={handleStartScan}>
                      <Satellite className="w-5 h-5" />
                      {t2('Bắt đầu quét', 'Start Scan')}
                    </Button>
                  </div>
                )}

                {scanning && (
                  <div className="text-center py-6 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-foreground">{t2('Đang quét vệ tinh...', 'Scanning satellite imagery...')}</p>
                      <Progress value={66} className="h-2" />
                      <p className="text-[10px] text-muted-foreground">{t2('Kiểm tra dữ liệu Global Forest Watch', 'Checking Global Forest Watch data')}</p>
                    </div>
                  </div>
                )}

                {scanComplete && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">{t2('Không phát hiện phá rừng!', 'No deforestation detected!')}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t2('Tất cả 15 mảnh đất đã vượt qua kiểm tra vệ tinh — Độ tin cậy: 94%', 'All 15 plots passed satellite check — Confidence: 94%')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground">{t2('Mảnh đất đã kiểm tra', 'Plots Scanned')}</p>
                        <p className="text-lg font-bold text-foreground">15/15</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground">{t2('Mức độ rủi ro', 'Risk Level')}</p>
                        <p className="text-lg font-bold text-green-600">{t2('Thấp', 'LOW')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t2('Quay lại', 'Back')}
              </Button>
              {scanComplete && (
                <Button onClick={() => setStep(3)} className="rounded-xl gap-2">
                  {t2('Tiếp tục', 'Continue')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Generate DDS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto shadow-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t2('Tạo DDS đầu tiên', 'Generate Your First DDS')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t2('DDS của bạn đã sẵn sàng — Xem trước và tạo với một cú nhấp', 'Your DDS is ready — Preview and generate with one click')}
              </p>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                {/* DDS Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{t2('Xem trước DDS', 'DDS Preview')}</span>
                    <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-0 text-[9px]">
                      {t2('SẴN SÀNG', 'READY')}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">{t2('Nhà cung cấp', 'Supplier')}</span>
                      <span className="font-medium text-foreground">Metrang Coffee</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">{t2('Quốc gia xuất xứ', 'Country of Origin')}</span>
                      <span className="font-medium text-foreground">Vietnam</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">{t2('Mảnh đất đã xác minh', 'Plots Verified')}</span>
                      <span className="font-medium text-green-600">15/15 ✓</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">{t2('Kiểm tra phá rừng', 'Deforestation Check')}</span>
                      <span className="font-medium text-green-600">{t2('Đạt — Rủi ro thấp', 'PASS — Low Risk')}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">{t2('Chuỗi truy xuất', 'Traceability Chain')}</span>
                      <span className="font-medium text-green-600">{t2('Hoàn chỉnh', 'Complete')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t2('Quay lại', 'Back')}
              </Button>
              <Button variant="destructive" onClick={handleComplete} className="rounded-xl gap-2 font-bold">
                <FileText className="w-4 h-4" />
                {t2('Tạo DDS Ngay', 'Generate DDS Now')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExporterWizard

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, MapPin, Factory, Shield, CheckCircle2,
  ArrowRight, ArrowLeft, Plus, Database, Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import { WizardStepIndicator } from './wizard-step-indicator'
import EudrComplianceScore from '@/components/compliance/eudr-compliance-score'

export interface AggregatorWizardProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function AggregatorWizard({ onComplete, onSkip }: AggregatorWizardProps) {
  const { t2 } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState(0)

  const stepLabels = [
    t2('Đăng ký nông dân', 'Enroll Farmer'),
    t2('Lập bản đồ mảnh đất', 'Map Plot'),
    t2('Tạo lô chế biến', 'Create Batch'),
    t2('Tuân thủ', 'Compliance'),
  ]

  const handleComplete = useCallback(() => {
    try { localStorage.setItem('terra-brew-onboarding-aggregator', 'complete') } catch {}
    onComplete?.()
    router.push('/dashboard')
  }, [onComplete, router])

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8">
      {onSkip && (
        <div className="flex justify-end mb-4">
          <button onClick={onSkip} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {t2('Bỏ qua', 'Skip')} →
          </button>
        </div>
      )}

      <div className="mb-8">
        <WizardStepIndicator current={step} total={4} labels={stepLabels} />
      </div>

      <div className="animate-fade-in">
        {/* Step 1: Enroll Farmer */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Đăng ký nông dân đầu tiên', 'Enroll Your First Farmer')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Thêm thông tin nông dân để bắt đầu chuỗi truy xuất', 'Add farmer details to start the traceability chain')}</p>
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Họ và tên', 'Full Name')}</label>
                  <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" placeholder={t2('VD: Nguyễn Văn Minh', 'e.g. Nguyễn Văn Minh')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Số điện thoại', 'Phone')}</label>
                  <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" placeholder="+84..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Tỉnh', 'Province')}</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option>Dak Lak</option><option>Lam Dong</option><option>Gia Lai</option><option>Dak Nong</option><option>Kon Tum</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} className="rounded-xl gap-2">{t2('Tiếp tục', 'Continue')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 2: Map Plot */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto shadow-xl">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Lập bản đồ mảnh đất', 'Map First Plot')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Nhập tọa độ GPS cho mảnh đất của nông dân', 'Enter GPS coordinates for the farmer plot')}</p>
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="w-full h-48 rounded-xl bg-muted/30 border border-dashed border-border flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{t2('Bản đồ GPS sẽ hiển thị tại đây', 'GPS map will appear here')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">{t2('Vĩ độ', 'Latitude')}</label>
                    <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono" placeholder="12.6543" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">{t2('Kinh độ', 'Longitude')}</label>
                    <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono" placeholder="108.0412" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Diện tích (ha)', 'Area (ha)')}</label>
                  <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" placeholder="2.5" />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl gap-2"><ArrowLeft className="w-4 h-4" />{t2('Quay lại', 'Back')}</Button>
              <Button onClick={() => setStep(2)} className="rounded-xl gap-2">{t2('Tiếp tục', 'Continue')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Create Batch */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-xl">
                <Factory className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Tạo lô chế biến đầu tiên', 'Create First Processing Batch')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Thiết lập lô chế biến cà phê đầu tiên', 'Set up your first coffee processing batch')}</p>
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Loại chế biến', 'Processing Type')}</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option>{t2('Rửa (Washed)', 'Washed')}</option>
                    <option>{t2('Tự nhiên (Natural)', 'Natural')}</option>
                    <option>{t2('Mật ong (Honey)', 'Honey')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Giống cà phê', 'Coffee Variety')}</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option>Robusta</option><option>Arabica</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Trọng lượng (kg)', 'Weight (kg)')}</label>
                  <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" placeholder="2400" />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl gap-2"><ArrowLeft className="w-4 h-4" />{t2('Quay lại', 'Back')}</Button>
              <Button onClick={() => setStep(3)} className="rounded-xl gap-2">{t2('Tiếp tục', 'Continue')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Compliance Status */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-coffee-700 flex items-center justify-center mx-auto shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Trạng thái tuân thủ', 'Your Compliance Status')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Xem tình trạng tuân thủ EUDR hiện tại', 'See your current EUDR compliance standing')}</p>
            </div>
            <EudrComplianceScore
              score={72}
              shipmentsAtRisk={3}
              penaltyPct="4%"
              onGenerateDDS={handleComplete}
              onFixGPS={handleComplete}
              onViewRisk={handleComplete}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl gap-2"><ArrowLeft className="w-4 h-4" />{t2('Quay lại', 'Back')}</Button>
              <Button onClick={handleComplete} className="rounded-xl gap-2">{t2('Đi đến Bảng điều khiển', 'Go to Dashboard')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AggregatorWizard

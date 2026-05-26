'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Link2, ShieldCheck, Download, CheckCircle2, XCircle, Clock,
  ArrowRight, ArrowLeft, Plus, Building2, Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { WizardStepIndicator } from './wizard-step-indicator'

export interface BuyerWizardProps {
  onComplete?: () => void
  onSkip?: () => void
}

const MOCK_SUPPLIERS = [
  { id: '1', name: 'Metrang Coffee', country: 'Vietnam', ddsStatus: 'compliant', score: 89 },
  { id: '2', name: 'Cooxupé Cooperative', country: 'Brazil', ddsStatus: 'compliant', score: 92 },
  { id: '3', name: 'Yirgacheffe Union', country: 'Ethiopia', ddsStatus: 'pending', score: 67 },
]

export function BuyerWizard({ onComplete, onSkip }: BuyerWizardProps) {
  const { t2 } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState(0)

  const stepLabels = [
    t2('Liên kết NCC', 'Link Suppliers'),
    t2('Tuân thủ NCC', 'Supplier Compliance'),
    t2('Tải DDS', 'Download DDS'),
  ]

  const handleComplete = useCallback(() => {
    try { localStorage.setItem('terra-brew-onboarding-buyer', 'complete') } catch {}
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
        <WizardStepIndicator current={step} total={3} labels={stepLabels} />
      </div>

      <div className="animate-fade-in">
        {/* Step 1: Link Suppliers */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-coffee-700 flex items-center justify-center mx-auto shadow-xl">
                <Link2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Liên kết nhà cung cấp', 'Link Your Suppliers')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Thêm các nhà xuất khẩu cà phê mà bạn mua hàng', 'Add the coffee exporters you purchase from')}</p>
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Tên công ty xuất khẩu', 'Exporter Company Name')}</label>
                  <input className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm" placeholder={t2('VD: Metrang Coffee', 'e.g. Metrang Coffee')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">{t2('Quốc gia', 'Country')}</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <option>Vietnam</option><option>Brazil</option><option>Ethiopia</option><option>Kenya</option><option>Colombia</option>
                  </select>
                </div>
                <Button variant="outline" className="w-full rounded-xl gap-2">
                  <Plus className="w-4 h-4" />
                  {t2('Thêm nhà cung cấp khác', 'Add Another Supplier')}
                </Button>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} className="rounded-xl gap-2">{t2('Tiếp tục', 'Continue')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 2: Supplier Compliance Grid */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto shadow-xl">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Tuân thủ nhà cung cấp', 'Supplier Compliance Status')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Tình trạng tuân thủ EUDR của các nhà cung cấp đã liên kết', 'EUDR compliance status of your linked suppliers')}</p>
            </div>
            <div className="space-y-3">
              {MOCK_SUPPLIERS.map((supplier) => (
                <div key={supplier.id} className={`p-4 rounded-xl border ${
                  supplier.ddsStatus === 'compliant' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30' :
                  'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-foreground" />
                      <span className="text-sm font-bold text-foreground">{supplier.name}</span>
                      <span className="text-[10px] text-muted-foreground">{supplier.country}</span>
                    </div>
                    <Badge className={`text-[8px] font-bold tracking-wider border-0 ${
                      supplier.ddsStatus === 'compliant' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                      'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                    }`}>
                      {supplier.ddsStatus === 'compliant' ? t2('ĐẠT', 'PASS') : t2('CHỜ', 'PENDING')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${supplier.score >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${supplier.score}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${supplier.score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>{supplier.score}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl gap-2"><ArrowLeft className="w-4 h-4" />{t2('Quay lại', 'Back')}</Button>
              <Button onClick={() => setStep(2)} className="rounded-xl gap-2">{t2('Tiếp tục', 'Continue')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Download Compliance Package */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto shadow-xl">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t2('Tải gói tuân thủ', 'Download Compliance Package')}</h2>
              <p className="text-sm text-muted-foreground">{t2('Tải xuống DDS và tài liệu tuân thủ cho các lô hàng', 'Download DDS and compliance documents for shipments')}</p>
            </div>
            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-sm font-bold text-foreground">{t2('Gói tuân thủ sẵn sàng!', 'Compliance package ready!')}</p>
                  <p className="text-xs text-muted-foreground">{t2('2 trong 3 nhà cung cấp có DDS hoàn chỉnh', '2 of 3 suppliers have complete DDS')}</p>
                </div>
                <Button className="w-full rounded-xl gap-2" onClick={handleComplete}>
                  <Download className="w-4 h-4" />
                  {t2('Tải xuống gói tuân thủ', 'Download Compliance Pack')}
                </Button>
                <div className="text-[10px] text-muted-foreground space-y-1 px-2">
                  <p className="font-medium">{t2('Bao gồm:', 'Includes:')}</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>DDS cho Metrang Coffee</li>
                    <li>DDS cho Cooxupé Cooperative</li>
                    <li>Certificate of Origin</li>
                    <li>Phytosanitary Certificates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl gap-2"><ArrowLeft className="w-4 h-4" />{t2('Quay lại', 'Back')}</Button>
              <Button onClick={handleComplete} className="rounded-xl gap-2">{t2('Đi đến Bảng điều khiển', 'Go to Dashboard')}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyerWizard

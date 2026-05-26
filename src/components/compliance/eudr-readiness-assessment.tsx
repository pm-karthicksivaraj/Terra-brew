'use client'

import { useState, useCallback } from 'react'
import {
  Shield, AlertTriangle, FileWarning, CheckCircle2,
  ArrowRight, ArrowLeft, Globe, Coffee, Download,
  Sparkles, ChevronRight, MapPin, TreePine, FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'

// 10 questions for the EUDR Readiness Assessment
const QUESTIONS = [
  {
    id: 'eu_shipments',
    questionVi: 'Bạn xuất khẩu bao nhiêu lô cà phê sang EU mỗi năm?',
    questionEn: 'How many coffee shipments do you export to the EU per year?',
    options: [
      { value: '0', labelVi: 'Chưa xuất khẩu', labelEn: 'None yet', risk: 0 },
      { value: '1-10', labelVi: '1–10 lô', labelEn: '1–10 shipments', risk: 1 },
      { value: '11-50', labelVi: '11–50 lô', labelEn: '11–50 shipments', risk: 2 },
      { value: '50+', labelVi: 'Trên 50 lô', labelEn: '50+ shipments', risk: 3 },
    ],
  },
  {
    id: 'supplying_farms',
    questionVi: 'Bạn có bao nhiêu nông trại cung cấp cà phê?',
    questionEn: 'How many supplying farms do you have?',
    options: [
      { value: '1-10', labelVi: '1–10 nông trại', labelEn: '1–10 farms', risk: 1 },
      { value: '11-100', labelVi: '11–100 nông trại', labelEn: '11–100 farms', risk: 2 },
      { value: '100+', labelVi: 'Trên 100 nông trại', labelEn: '100+ farms', risk: 3 },
    ],
  },
  {
    id: 'gps_polygons',
    questionVi: 'Bạn có đa giác GPS cho các mảnh đất cà phê không?',
    questionEn: 'Do you have GPS polygons for coffee farm plots?',
    options: [
      { value: 'all', labelVi: 'Tất cả (100%)', labelEn: 'All (100%)', risk: 0 },
      { value: 'most', labelVi: 'Hầu hết (>70%)', labelEn: 'Most (>70%)', risk: 1 },
      { value: 'some', labelVi: 'Một số (30-70%)', labelEn: 'Some (30-70%)', risk: 2 },
      { value: 'none', labelVi: 'Không có', labelEn: 'None', risk: 3 },
    ],
  },
  {
    id: 'deforestation_check',
    questionVi: 'Bạn đã chạy kiểm tra phá rừng cho các mảnh đất chưa?',
    questionEn: 'Have you run deforestation checks for your plots?',
    options: [
      { value: 'all', labelVi: 'Đã kiểm tra tất cả', labelEn: 'Checked all', risk: 0 },
      { value: 'partial', labelVi: 'Đã kiểm tra một phần', labelEn: 'Checked some', risk: 2 },
      { value: 'none', labelVi: 'Chưa kiểm tra', labelEn: 'Not checked', risk: 3 },
    ],
  },
  {
    id: 'dds_status',
    questionVi: 'Bạn đã tạo Báo cáo Hợp pháp Kỹ thuật (DDS) chưa?',
    questionEn: 'Have you generated Due Diligence Statements (DDS)?',
    options: [
      { value: 'all', labelVi: 'Đã tạo cho tất cả lô', labelEn: 'For all shipments', risk: 0 },
      { value: 'some', labelVi: 'Chỉ một số lô', labelEn: 'Only some', risk: 2 },
      { value: 'none', labelVi: 'Chưa tạo DDS nào', labelEn: 'None yet', risk: 3 },
    ],
  },
  {
    id: 'documentation',
    questionVi: 'Bạn hiện sử dụng hệ thống tài liệu nào?',
    questionEn: 'What documentation system do you currently use?',
    options: [
      { value: 'digital', labelVi: 'Hệ thống số hóa', labelEn: 'Digital system', risk: 0 },
      { value: 'spreadsheet', labelVi: 'Bảng tính (Excel/Sheets)', labelEn: 'Spreadsheets', risk: 1 },
      { value: 'paper', labelVi: 'Giấy tờ vật lý', labelEn: 'Paper records', risk: 3 },
      { value: 'none', labelVi: 'Không có hệ thống', labelEn: 'No system', risk: 3 },
    ],
  },
  {
    id: 'traceability',
    questionVi: 'Bạn có thể truy xuất từ nông trại đến lô xuất khẩu không?',
    questionEn: 'Can you trace from farm to export shipment?',
    options: [
      { value: 'full', labelVi: 'Truy xuất đầy đủ', labelEn: 'Full traceability', risk: 0 },
      { value: 'partial', labelVi: 'Truy xuất một phần', labelEn: 'Partial traceability', risk: 2 },
      { value: 'none', labelVi: 'Không thể truy xuất', labelEn: 'No traceability', risk: 3 },
    ],
  },
  {
    id: 'certifications',
    questionVi: 'Nông trại của bạn có chứng nhận không?',
    questionEn: 'Do your farms have certifications?',
    options: [
      { value: 'multiple', labelVi: 'Nhiều chứng nhận (UTZ, Fairtrade, Organic)', labelEn: 'Multiple (UTZ, Fairtrade, Organic)', risk: 0 },
      { value: 'one', labelVi: 'Một chứng nhận', labelEn: 'One certification', risk: 1 },
      { value: 'none', labelVi: 'Không có chứng nhận', labelEn: 'None', risk: 2 },
    ],
  },
  {
    id: 'traces_nt',
    questionVi: 'Bạn đã đăng ký hệ thống TRACES-NT của EU chưa?',
    questionEn: 'Have you registered with the EU TRACES-NT system?',
    options: [
      { value: 'yes', labelVi: 'Đã đăng ký', labelEn: 'Yes, registered', risk: 0 },
      { value: 'no', labelVi: 'Chưa đăng ký', labelEn: 'No, not yet', risk: 3 },
    ],
  },
  {
    id: 'eu_revenue',
    questionVi: 'Doanh thu EU hàng năm của bạn là bao nhiêu?',
    questionEn: 'What is your annual EU coffee revenue?',
    options: [
      { value: 'under_1m', labelVi: 'Dưới €1 triệu', labelEn: 'Under €1M', risk: 1 },
      { value: '1m-10m', labelVi: '€1M – €10M', labelEn: '€1M – €10M', risk: 2 },
      { value: '10m-50m', labelVi: '€10M – €50M', labelEn: '€10M – €50M', risk: 3 },
      { value: '50m+', labelVi: 'Trên €50M', labelEn: '€50M+', risk: 3 },
    ],
  },
]

function calculateRisk(answers: Record<string, string>): { score: number; level: string; penaltyEstimate: string; missingItems: string[] } {
  let totalRisk = 0
  const maxRisk = 30
  const missingItems: string[] = []

  Object.entries(answers).forEach(([qId, value]) => {
    const question = QUESTIONS.find(q => q.id === qId)
    if (question) {
      const option = question.options.find(o => o.value === value)
      if (option) {
        totalRisk += option.risk
        if (option.risk >= 2) {
          missingItems.push(question.questionEn)
        }
      }
    }
  })

  const pct = Math.round((totalRisk / maxRisk) * 100)
  const level = pct <= 30 ? 'LOW' : pct <= 60 ? 'MEDIUM' : 'HIGH'

  // Estimate penalty based on revenue
  let penaltyEstimate = '€0'
  const revenue = answers['eu_revenue']
  if (revenue === 'under_1m') penaltyEstimate = '€40,000'
  else if (revenue === '1m-10m') penaltyEstimate = '€400,000'
  else if (revenue === '10m-50m') penaltyEstimate = '€2,000,000'
  else if (revenue === '50m+') penaltyEstimate = '€2,000,000+'

  return { score: pct, level, penaltyEstimate, missingItems }
}

export function EudrReadinessAssessment() {
  const { t2 } = useI18n()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }, [currentQuestion])

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }, [currentQuestion])

  const risk = calculateRisk(answers)

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Risk Score */}
        <Card className={`rounded-2xl border-2 ${
          risk.level === 'HIGH' ? 'border-red-300 bg-red-50 dark:bg-red-950/30' :
          risk.level === 'MEDIUM' ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/30' :
          'border-green-300 bg-green-50 dark:bg-green-950/30'
        }`}>
          <CardContent className="p-8 text-center space-y-4">
            <Badge className={`text-xs font-bold tracking-wider border-0 ${
              risk.level === 'HIGH' ? 'bg-red-100 text-red-800' :
              risk.level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
              'bg-green-100 text-green-800'
            }`}>
              {t2('ĐIỂM RỦI RO EUDR', 'EUDR EXPOSURE SCORE')}
            </Badge>
            <div>
              <span className={`text-6xl font-bold ${
                risk.level === 'HIGH' ? 'text-red-600' :
                risk.level === 'MEDIUM' ? 'text-amber-600' :
                'text-green-600'
              }`}>{risk.score}%</span>
              <p className="text-lg font-bold text-foreground mt-2">
                {risk.level === 'HIGH' ? t2('RỦI RO CAO', 'HIGH RISK') :
                 risk.level === 'MEDIUM' ? t2('RỦI RO TRUNG BÌNH', 'MEDIUM RISK') :
                 t2('RỦI RO THẤP', 'LOW RISK')}
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-sm text-foreground">
                {t2(
                  `Tiền phạt EUDR tối đa ước tính: ${risk.penaltyEstimate} (4% doanh thu EU)`,
                  `Your maximum EUDR fine: ${risk.penaltyEstimate} (4% of EU revenue)`
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Missing Items */}
        {risk.missingItems.length > 0 && (
          <Card className="rounded-2xl border border-border/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t2('Những điều còn thiếu', 'What You Are Missing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {risk.missingItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <FileWarning className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="rounded-2xl border border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-foreground">
              {t2('Khắc phục ngay với TerraBrew', 'Fix This with TerraBrew')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t2(
                'TerraBrew tự động hóa toàn bộ quy trình tuân thủ EUDR — từ đa giác GPS đến tạo DDS.',
                'TerraBrew automates the entire EUDR compliance process — from GPS polygons to DDS generation.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="rounded-xl gap-2 font-bold">
                {t2('Đặt lịch Demo', 'Book a Demo')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl gap-2">
                {t2('Bắt đầu dùng thử miễn phí', 'Start Free Trial')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restart */}
        <div className="text-center">
          <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => {
            setAnswers({})
            setCurrentQuestion(0)
            setShowResults(false)
          }}>
            {t2('Làm lại đánh giá', 'Retake Assessment')}
          </Button>
        </div>
      </div>
    )
  }

  const question = QUESTIONS[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t2(`Câu hỏi ${currentQuestion + 1} / ${QUESTIONS.length}`, `Question ${currentQuestion + 1} / ${QUESTIONS.length}`)}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="rounded-2xl border border-border/50">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-foreground">
            {t2(question.questionVi, question.questionEn)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.id, option.value)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                answers[question.id] === option.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/50 hover:border-primary/30 hover:bg-accent/30'
              }`}
            >
              <span className="text-sm font-medium text-foreground">
                {t2(option.labelVi, option.labelEn)}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentQuestion === 0} className="rounded-xl gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t2('Quay lại', 'Back')}
        </Button>
        <span className="text-xs text-muted-foreground self-center">
          {Object.keys(answers).length} / {QUESTIONS.length} {t2('đã trả lời', 'answered')}
        </span>
      </div>
    </div>
  )
}

export default EudrReadinessAssessment

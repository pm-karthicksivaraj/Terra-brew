'use client'

import { Coffee, Shield, MapPin, Award, Truck, BarChart3, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface CategoryScore {
  category: string
  label: string
  score: number
  maxScore: number
  status: 'excellent' | 'good' | 'moderate' | 'low' | 'critical'
  recommendation: string
}

export interface AssessmentResult {
  totalScore: number
  maxScore: number
  readinessLevel: 'ready' | 'mostly_ready' | 'partially_ready' | 'needs_work' | 'not_ready'
  categories: CategoryScore[]
  overallRecommendation: string
  eudrImpactNote: string
  assessedAt: string
}

export interface AssessmentFormData {
  entityType: string
  countryCode: string
  exportsToEU: boolean
  annualVolumeTons: number
  hasGPSCoordinates: boolean
  hasDeforestationAssessment: boolean
  hasTraceabilityRecords: boolean
  hasCertifications: boolean
  hasDueDiligenceProcess: boolean
  supplierCount: number
}

interface AssessmentReportProps {
  result: AssessmentResult
  formData: AssessmentFormData
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  excellent: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  good: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: 'bg-green-500' },
  moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
  low: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' },
}

const READINESS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
  mostly_ready: { label: 'Mostly Ready', color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
  partially_ready: { label: 'Partially Ready', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-300' },
  needs_work: { label: 'Needs Work', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300' },
  not_ready: { label: 'Not Ready', color: 'text-red-700', bg: 'bg-red-100 border-red-300' },
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  eudr_readiness: Shield,
  geospatial_traceability: MapPin,
  certifications: Award,
  supply_chain_complexity: Truck,
  operational_scale: BarChart3,
  data_readiness: FileText,
}

const ENTITY_LABELS: Record<string, string> = {
  producer: 'Coffee Producer',
  aggregator: 'Aggregator / Cooperative',
  exporter: 'Coffee Exporter',
  importer: 'Coffee Importer',
}

const COUNTRY_NAMES: Record<string, string> = {
  VN: 'Vietnam', BR: 'Brazil', ET: 'Ethiopia', KE: 'Kenya', CO: 'Colombia',
  GT: 'Guatemala', HN: 'Honduras', PE: 'Peru', UG: 'Uganda', TZ: 'Tanzania',
  ID: 'Indonesia', IN: 'India', MX: 'Mexico', NI: 'Nicaragua', CR: 'Costa Rica',
  DE: 'Germany', FR: 'France', NL: 'Netherlands', IT: 'Italy', ES: 'Spain',
  BE: 'Belgium', GB: 'United Kingdom', US: 'United States', JP: 'Japan',
  AT: 'Austria', PT: 'Portugal', SE: 'Sweden', DK: 'Denmark', FI: 'Finland',
  IE: 'Ireland', CZ: 'Czech Republic', RO: 'Romania', HU: 'Hungary', GR: 'Greece',
  PL: 'Poland', CH: 'Switzerland', NO: 'Norway', CA: 'Canada', AU: 'Australia',
}

function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No'
}

function formatScore(score: number, max: number): string {
  return `${score}/${max}`
}

// ════════════════════════════════════════════════════════════════
// SCORE GAUGE COMPONENT
// ════════════════════════════════════════════════════════════════

function ScoreGauge({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = Math.round((score / maxScore) * 100)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  let strokeColor = '#ef4444' // red
  if (percentage >= 80) strokeColor = '#10b981' // emerald
  else if (percentage >= 65) strokeColor = '#22c55e' // green
  else if (percentage >= 45) strokeColor = '#f59e0b' // amber
  else if (percentage >= 25) strokeColor = '#f97316' // orange

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
        <circle
          cx="90" cy="90" r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth="12"
        />
        <circle
          cx="90" cy="90" r={radius}
          fill="none" stroke={strokeColor} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: strokeColor }}>{percentage}%</span>
        <span className="text-xs text-muted-foreground mt-1">Readiness Score</span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// MAIN REPORT COMPONENT
// ════════════════════════════════════════════════════════════════

export default function AssessmentReport({ result, formData }: AssessmentReportProps) {
  const readinessInfo = READINESS_LABELS[result.readinessLevel]
  const percentage = Math.round((result.totalScore / result.maxScore) * 100)

  return (
    <div id="assessment-report" className="assessment-report">
      {/* ═══ Report Header ═══ */}
      <div className="border-b border-[#C7B7A3] pb-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6D2932] flex items-center justify-center shadow-md">
              <Coffee className="w-7 h-7 text-[#E8D8C4]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#561C24]">EUDR Readiness Assessment Report</h1>
              <p className="text-xs text-muted-foreground">EU Deforestation Regulation Compliance Evaluation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Assessment Date</p>
            <p className="text-sm font-medium text-[#561C24]">
              {new Date(result.assessedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Entity Overview ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#E8D8C4]/30 rounded-lg p-3 border border-[#C7B7A3]/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Entity Type</p>
          <p className="text-sm font-bold text-[#561C24]">{ENTITY_LABELS[formData.entityType] || formData.entityType}</p>
        </div>
        <div className="bg-[#E8D8C4]/30 rounded-lg p-3 border border-[#C7B7A3]/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Country</p>
          <p className="text-sm font-bold text-[#561C24]">{COUNTRY_NAMES[formData.countryCode] || formData.countryCode}</p>
        </div>
        <div className="bg-[#E8D8C4]/30 rounded-lg p-3 border border-[#C7B7A3]/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Exports to EU</p>
          <p className={`text-sm font-bold ${formData.exportsToEU ? 'text-emerald-700' : 'text-[#561C24]'}`}>
            {formatBoolean(formData.exportsToEU)}
          </p>
        </div>
        <div className="bg-[#E8D8C4]/30 rounded-lg p-3 border border-[#C7B7A3]/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Annual Volume</p>
          <p className="text-sm font-bold text-[#561C24]">{formData.annualVolumeTons} tons</p>
        </div>
      </div>

      {/* ═══ Score Gauge + Readiness Level ═══ */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-white rounded-xl border border-[#C7B7A3]/30">
        <ScoreGauge score={result.totalScore} maxScore={result.maxScore} />
        <div className="flex-1 text-center md:text-left">
          <div className="mb-3">
            <Badge className={`text-sm px-4 py-1 border ${readinessInfo.bg} ${readinessInfo.color} font-bold`}>
              {readinessInfo.label}
            </Badge>
          </div>
          <p className="text-lg font-bold text-[#561C24] mb-2">
            Score: {formatScore(result.totalScore, result.maxScore)} ({percentage}%)
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.overallRecommendation}
          </p>
        </div>
      </div>

      {/* ═══ EUDR Impact Note ═══ */}
      <div className={`mb-8 p-4 rounded-lg border ${formData.exportsToEU ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${formData.exportsToEU ? 'text-amber-600' : 'text-blue-600'}`} />
          <div>
            <p className={`text-sm font-bold ${formData.exportsToEU ? 'text-amber-800' : 'text-blue-800'}`}>
              {formData.exportsToEU ? 'EUDR Compliance is Mandatory' : 'Future-Proofing Recommendation'}
            </p>
            <p className={`text-xs mt-1 ${formData.exportsToEU ? 'text-amber-700' : 'text-blue-700'}`}>
              {result.eudrImpactNote}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Category Breakdown ═══ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#561C24] mb-4">Score Breakdown by Category</h2>
        <div className="space-y-4">
          {result.categories.map((cat) => {
            const colors = STATUS_COLORS[cat.status]
            const Icon = CATEGORY_ICONS[cat.category] || FileText
            const catPercentage = Math.round((cat.score / cat.maxScore) * 100)

            return (
              <div key={cat.category} className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                    <span className={`font-bold text-sm ${colors.text}`}>{cat.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {formatScore(cat.score, cat.maxScore)}
                  </span>
                </div>
                <Progress value={catPercentage} className="h-2 mb-3 [&>div]:bg-emerald-500" />
                <p className="text-xs text-[#561C24]/70 leading-relaxed">{cat.recommendation}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ Detailed Answers ═══ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#561C24] mb-4">Your Assessment Responses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'GPS Coordinates for Farms', value: formatBoolean(formData.hasGPSCoordinates) },
            { label: 'Deforestation Risk Assessments', value: formatBoolean(formData.hasDeforestationAssessment) },
            { label: 'Supply Chain Traceability Records', value: formatBoolean(formData.hasTraceabilityRecords) },
            { label: 'Certifications (Organic, Fairtrade, UTZ, etc.)', value: formatBoolean(formData.hasCertifications) },
            { label: 'Due Diligence Statement Process', value: formatBoolean(formData.hasDueDiligenceProcess) },
            { label: 'Number of Farmers/Suppliers', value: String(formData.supplierCount) },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-[#E8D8C4]/20 rounded-lg p-3 border border-[#C7B7A3]/20">
              <span className="text-xs text-[#561C24]/70 font-medium">{item.label}</span>
              <div className="flex items-center gap-1.5">
                {(item.value === 'Yes') && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span className={`text-xs font-bold ${(item.value === 'Yes') ? 'text-emerald-700' : (item.value === 'No') ? 'text-red-600' : 'text-[#561C24]'}`}>
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <div className="border-t border-[#C7B7A3] pt-4 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6D2932] flex items-center justify-center">
              <Coffee className="w-4 h-4 text-[#E8D8C4]" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#561C24]">Powered by Terra Brew</span>
              <p className="text-[10px] text-muted-foreground">Coffee Traceability & EUDR Compliance Platform</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] text-muted-foreground">
              This assessment is based on self-reported data and provides an indicative readiness score.
            </p>
            <p className="text-[10px] text-muted-foreground">
              For a comprehensive compliance evaluation, sign up for Terra Brew&apos;s full platform.
            </p>
          </div>
        </div>
      </div>

      {/* Print-optimized styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything outside the report */
          body * {
            visibility: hidden;
          }

          #assessment-report,
          #assessment-report * {
            visibility: visible;
          }

          #assessment-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          /* Ensure backgrounds print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Remove shadows and animations for print */
          .shadow-md, .shadow-lg, .shadow-xl, .shadow-sm {
            box-shadow: none !important;
          }

          /* Page break control */
          .assessment-report {
            page-break-inside: avoid;
          }

          /* Ensure proper margins */
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  )
}

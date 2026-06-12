'use client'

import { useState, useCallback } from 'react'
import { Coffee, Shield, ChevronRight, ChevronLeft, Download, Phone, TreePine, MapPin, FileCheck, Award, Loader2, Leaf, Globe2, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ReadinessScoreGauge } from '@/components/eudr-readiness/readiness-score-gauge'

// ─── Types ───────────────────────────────────────────────────────

interface FormAnswers {
  companyName: string
  role: string
  email: string
  country: string
  isEuImporter: boolean
  sourcesFromDeforestationRisk: 'yes' | 'no' | 'unsure' | ''
  supplierCount: '1-10' | '11-50' | '50+' | ''
  hasGpsCoordinates: 'yes' | 'no' | 'partial' | ''
  hasDueDiligenceProcess: 'yes' | 'no' | ''
  hasTracesNtRegistration: 'yes' | 'no' | ''
  hasSatelliteMonitoring: 'yes' | 'no' | ''
  farmLevelTraceability: 'yes' | 'no' | 'partial' | ''
  certifications: string[]
}

interface CalculationResult {
  score: number
  breakdown: {
    traceability: number
    deforestation: number
    documentation: number
    certifications: number
  }
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

const STEPS = ['Company Info', 'Supply Chain', 'Compliance', 'Results']

const COUNTRIES = [
  'Brazil', 'Colombia', 'Vietnam', 'Ethiopia', 'Indonesia', 'Honduras', 'India',
  'Uganda', 'Peru', 'Mexico', 'Guatemala', 'Nicaragua', 'Costa Rica', 'Tanzania',
  'Kenya', 'Papua New Guinea', 'Cameroon', 'Ecuador', 'El Salvador', 'Rwanda',
  'Germany', 'France', 'Italy', 'Netherlands', 'Belgium', 'Spain', 'Portugal',
  'United States', 'United Kingdom', 'Japan', 'South Korea', 'Australia',
  'Other',
]

const INITIAL_FORM: FormAnswers = {
  companyName: '',
  role: '',
  email: '',
  country: '',
  isEuImporter: false,
  sourcesFromDeforestationRisk: '',
  supplierCount: '',
  hasGpsCoordinates: '',
  hasDueDiligenceProcess: '',
  hasTracesNtRegistration: '',
  hasSatelliteMonitoring: '',
  farmLevelTraceability: '',
  certifications: [],
}

// ─── Helper ──────────────────────────────────────────────────────

function getBreakdownIcon(name: string) {
  switch (name) {
    case 'traceability': return MapPin
    case 'deforestation': return TreePine
    case 'documentation': return FileCheck
    case 'certifications': return Award
    default: return Shield
  }
}

function getBreakdownColor(name: string): string {
  switch (name) {
    case 'traceability': return '#6D2932'
    case 'deforestation': return '#0d9488'
    case 'documentation': return '#d97706'
    case 'certifications': return '#16a34a'
    default: return '#6D2932'
  }
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200'
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getRiskLabel(level: string): string {
  switch (level) {
    case 'low': return 'Low Risk'
    case 'medium': return 'Medium Risk'
    case 'high': return 'High Risk'
    case 'critical': return 'Critical Risk'
    default: return 'Unknown'
  }
}

// ─── Toggle Button Group ─────────────────────────────────────────

function ToggleOption({ label, value, selected, onClick }: {
  label: string; value: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border
        ${selected
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-background text-foreground border-border hover:bg-muted/50'
        }`}
    >
      {label}
    </button>
  )
}

// ─── Step 1: Company Info ────────────────────────────────────────

function StepCompanyInfo({ form, setForm }: { form: FormAnswers; setForm: (f: FormAnswers) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Company Information</h3>
        <p className="text-sm text-muted-foreground">Tell us about your organization to personalize the assessment.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="e.g., TerraBrew Coffee Roasters"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">Your Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
              <SelectItem value="Supply Chain Manager">Supply Chain Manager</SelectItem>
              <SelectItem value="Export Manager">Export Manager</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
          <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
          <div>
            <Label className="text-sm font-medium">Are you an EU importer?</Label>
            <p className="text-xs text-muted-foreground mt-0.5">This affects your compliance obligations under EUDR.</p>
          </div>
          <Switch
            checked={form.isEuImporter}
            onCheckedChange={(v) => setForm({ ...form, isEuImporter: v })}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Supply Chain ────────────────────────────────────────

function StepSupplyChain({ form, setForm }: { form: FormAnswers; setForm: (f: FormAnswers) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Supply Chain Assessment</h3>
        <p className="text-sm text-muted-foreground">Help us understand your sourcing and traceability capabilities.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Do you source coffee from countries with deforestation risk?
          </Label>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="Yes" value="yes" selected={form.sourcesFromDeforestationRisk === 'yes'} onClick={() => setForm({ ...form, sourcesFromDeforestationRisk: 'yes' })} />
            <ToggleOption label="No" value="no" selected={form.sourcesFromDeforestationRisk === 'no'} onClick={() => setForm({ ...form, sourcesFromDeforestationRisk: 'no' })} />
            <ToggleOption label="Not Sure" value="unsure" selected={form.sourcesFromDeforestationRisk === 'unsure'} onClick={() => setForm({ ...form, sourcesFromDeforestationRisk: 'unsure' })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">How many suppliers do you have?</Label>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="1–10" value="1-10" selected={form.supplierCount === '1-10'} onClick={() => setForm({ ...form, supplierCount: '1-10' })} />
            <ToggleOption label="11–50" value="11-50" selected={form.supplierCount === '11-50'} onClick={() => setForm({ ...form, supplierCount: '11-50' })} />
            <ToggleOption label="50+" value="50+" selected={form.supplierCount === '50+'} onClick={() => setForm({ ...form, supplierCount: '50+' })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Do you have GPS coordinates for your suppliers&apos; farms?
          </Label>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="Yes" value="yes" selected={form.hasGpsCoordinates === 'yes'} onClick={() => setForm({ ...form, hasGpsCoordinates: 'yes' })} />
            <ToggleOption label="Partial" value="partial" selected={form.hasGpsCoordinates === 'partial'} onClick={() => setForm({ ...form, hasGpsCoordinates: 'partial' })} />
            <ToggleOption label="No" value="no" selected={form.hasGpsCoordinates === 'no'} onClick={() => setForm({ ...form, hasGpsCoordinates: 'no' })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Do you currently have a due diligence process?
          </Label>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="Yes" value="yes" selected={form.hasDueDiligenceProcess === 'yes'} onClick={() => setForm({ ...form, hasDueDiligenceProcess: 'yes' })} />
            <ToggleOption label="No" value="no" selected={form.hasDueDiligenceProcess === 'no'} onClick={() => setForm({ ...form, hasDueDiligenceProcess: 'no' })} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Current Compliance ──────────────────────────────────

function StepCompliance({ form, setForm }: { form: FormAnswers; setForm: (f: FormAnswers) => void }) {
  const toggleCert = (cert: string) => {
    const certs = form.certifications.includes(cert)
      ? form.certifications.filter((c) => c !== cert)
      : [...form.certifications, cert]
    setForm({ ...form, certifications: certs })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Current Compliance Status</h3>
        <p className="text-sm text-muted-foreground">Evaluate your existing compliance infrastructure.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Do you have a TRACES-NT registration?</Label>
          <p className="text-xs text-muted-foreground -mt-1">TRACES-NT is the EU&apos;s Trade Control and Expert System for due diligence submissions.</p>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="Yes" value="yes" selected={form.hasTracesNtRegistration === 'yes'} onClick={() => setForm({ ...form, hasTracesNtRegistration: 'yes' })} />
            <ToggleOption label="No" value="no" selected={form.hasTracesNtRegistration === 'no'} onClick={() => setForm({ ...form, hasTracesNtRegistration: 'no' })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Do you conduct satellite deforestation monitoring?</Label>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="Yes" value="yes" selected={form.hasSatelliteMonitoring === 'yes'} onClick={() => setForm({ ...form, hasSatelliteMonitoring: 'yes' })} />
            <ToggleOption label="No" value="no" selected={form.hasSatelliteMonitoring === 'no'} onClick={() => setForm({ ...form, hasSatelliteMonitoring: 'no' })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Do you have traceability to farm/plot level?</Label>
          <div className="flex flex-wrap gap-2">
            <ToggleOption label="Yes" value="yes" selected={form.farmLevelTraceability === 'yes'} onClick={() => setForm({ ...form, farmLevelTraceability: 'yes' })} />
            <ToggleOption label="Partial" value="partial" selected={form.farmLevelTraceability === 'partial'} onClick={() => setForm({ ...form, farmLevelTraceability: 'partial' })} />
            <ToggleOption label="No" value="no" selected={form.farmLevelTraceability === 'no'} onClick={() => setForm({ ...form, farmLevelTraceability: 'no' })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">What certifications do your suppliers hold?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'utz_rainforest', label: 'UTZ / Rainforest Alliance', desc: 'Sustainable farming certification' },
              { id: 'organic', label: 'Organic', desc: 'Organic production certification' },
              { id: 'fair_trade', label: 'Fair Trade', desc: 'Fair trade certified' },
              { id: 'none', label: 'None', desc: 'No certifications held' },
            ].map((cert) => (
              <label
                key={cert.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${form.certifications.includes(cert.id)
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-background hover:bg-muted/30'
                  }`}
              >
                <Checkbox
                  checked={form.certifications.includes(cert.id)}
                  onCheckedChange={() => toggleCert(cert.id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">{cert.label}</p>
                  <p className="text-xs text-muted-foreground">{cert.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Results ─────────────────────────────────────────────

function StepResults({ form, result, onDownloadReport }: {
  form: FormAnswers
  result: CalculationResult
  onDownloadReport: () => void
}) {
  const breakdownEntries = [
    { key: 'traceability' as const, name: 'Traceability', max: 25 },
    { key: 'deforestation' as const, name: 'Deforestation Monitoring', max: 25 },
    { key: 'documentation' as const, name: 'Documentation', max: 25 },
    { key: 'certifications' as const, name: 'Certifications', max: 25 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Your EUDR Readiness Results</h3>
        <p className="text-sm text-muted-foreground">Here&apos;s how your supply chain measures up against EUDR requirements.</p>
      </div>

      {/* Gauge */}
      <ReadinessScoreGauge score={result.score} />

      {/* Risk Badge */}
      <div className="flex justify-center">
        <Badge className={`text-sm px-4 py-1.5 border ${getRiskColor(result.riskLevel)}`}>
          {result.riskLevel === 'critical' || result.riskLevel === 'high' ? (
            <AlertTriangle className="w-4 h-4 mr-1.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
          )}
          {getRiskLabel(result.riskLevel)}
        </Badge>
      </div>

      {/* Breakdown */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Score Breakdown</CardTitle>
          <CardDescription>Performance across four EUDR compliance dimensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakdownEntries.map((item) => {
            const Icon = getBreakdownIcon(item.key)
            const color = getBreakdownColor(item.key)
            const pct = (result.breakdown[item.key] / item.max) * 100
            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}15` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold font-mono" style={{ color }}>
                    {result.breakdown[item.key]}/{item.max}
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recommendations</CardTitle>
            <CardDescription>Actionable steps to improve your compliance posture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 bg-muted/40 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={onDownloadReport}
          className="flex-1 h-12 text-sm font-semibold gap-2"
          variant="outline"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </Button>
        <Button
          asChild
          className="flex-1 h-12 text-sm font-semibold gap-2"
        >
          <a href="/login">
            <Phone className="w-4 h-4" />
            Talk to a Compliance Expert
          </a>
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────

export default function EudrReadinessPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormAnswers>(INITIAL_FORM)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const canAdvance = useCallback(() => {
    switch (step) {
      case 0:
        return form.companyName.trim() !== '' && form.email.trim() !== ''
      case 1:
        return (
          form.sourcesFromDeforestationRisk !== '' &&
          form.supplierCount !== '' &&
          form.hasGpsCoordinates !== '' &&
          form.hasDueDiligenceProcess !== ''
        )
      case 2:
        return (
          form.hasTracesNtRegistration !== '' &&
          form.hasSatelliteMonitoring !== '' &&
          form.farmLevelTraceability !== ''
        )
      default:
        return true
    }
  }, [step, form])

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const res = await fetch('/api/eudr-readiness/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setStep(3)
      }
    } catch {
      // Silently handle
    } finally {
      setIsCalculating(false)
    }
  }

  const handleNext = () => {
    if (step === 2) {
      handleCalculate()
    } else {
      setStep(step + 1)
    }
  }

  const handleDownloadReport = async () => {
    if (!result) return
    setIsDownloading(true)
    try {
      const res = await fetch('/api/eudr-readiness/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...result }),
      })
      const data = await res.json()
      if (res.ok && data.html) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(data.html)
          printWindow.document.close()
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }
    } catch {
      // Silently handle
    } finally {
      setIsDownloading(false)
    }
  }

  const progressPct = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-coffee-50 to-stone-100 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">TerraBrew</span>
          </a>
          <a
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="pt-12 pb-8 md:pt-16 md:pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5" />
            Free Compliance Tool
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Free EUDR Readiness<br className="hidden sm:block" /> Assessment
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Check if your coffee supply chain is ready for EU Deforestation Regulation compliance in 5 minutes
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-green-600" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-primary" />
              <span>Based on EU Regulation 2023/1115</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Personalized recommendations</span>
            </div>
          </div>
        </section>

        {/* Form Card */}
        <section className="pb-16">
          <Card className="rounded-2xl shadow-lg border bg-card">
            {/* Step indicator */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-1 mb-3">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center gap-1 flex-1">
                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                          ${i === step
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : i < step
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span
                        className={`text-xs hidden sm:inline transition-colors
                          ${i === step ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-px transition-colors mx-1
                          ${i < step ? 'bg-green-500' : 'bg-border'}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>

            <Separator />

            {/* Step content */}
            <div className="p-6">
              {step === 0 && <StepCompanyInfo form={form} setForm={setForm} />}
              {step === 1 && <StepSupplyChain form={form} setForm={setForm} />}
              {step === 2 && <StepCompliance form={form} setForm={setForm} />}
              {step === 3 && result && (
                <StepResults form={form} result={result} onDownloadReport={handleDownloadReport} />
              )}
            </div>

            {/* Navigation */}
            {step < 3 && (
              <>
                <Separator />
                <div className="px-6 py-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="gap-1 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canAdvance() || isCalculating}
                    className="gap-1.5 text-sm font-semibold min-w-[120px]"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating...
                      </>
                    ) : step === 2 ? (
                      <>
                        Get Results <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Continue <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Download loading overlay */}
            {isDownloading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-lg border">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Generating report...</span>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Bottom CTA */}
        {step === 3 && result && result.score < 80 && (
          <section className="pb-16">
            <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-coffee-100/50 dark:from-primary/5 dark:to-primary/5">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Need Help Achieving Compliance?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Our compliance experts can help you build a roadmap to full EUDR readiness, from GPS collection to TRACES-NT submission.
                </p>
                <Button asChild size="lg" className="text-sm font-semibold gap-2">
                  <a href="/login">
                    Talk to a Compliance Expert <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">TerraBrew</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            This assessment is for informational purposes only. It does not constitute legal advice. &copy; {new Date().getFullYear()} TerraBrew
          </p>
        </div>
      </footer>
    </div>
  )
}

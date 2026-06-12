'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3, FileText, Download, Loader2, Globe2, TreePine, Droplets,
  Users, Shield, TrendingUp, AlertTriangle, Leaf, Factory, Scale,
  CheckCircle2, ArrowRight, Activity, Zap
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────

interface EudrRecord {
  id: string; complianceId: string; batchId?: string; farmerId?: string; farmLandId?: string;
  status: string; riskLevel: string; deforestationRiskScore?: number;
  satelliteImageryRef?: string; geolocationLat?: number; geolocationLng?: number;
  landUseType?: string; landCoverChangeDate?: string;
  verificationDate?: string; verifiedBy?: string;
  dueDiligenceStatement?: string; tracesCertificateRef?: string;
  validFrom?: string; validUntil?: string;
  notes?: string; metadata?: any; createdAt: string;
  farmer?: { fullName: string; farmerCode?: string }; farmLand?: { farmName: string; area?: number };
}

// ─── Framework Definitions ───────────────────────────────────────

const FRAMEWORKS = [
  {
    id: 'csrd',
    name: 'CSRD',
    fullName: 'Corporate Sustainability Reporting Directive',
    description: 'EU mandatory sustainability reporting standard covering environmental, social, and governance topics using ESRS (European Sustainability Reporting Standards).',
    icon: Scale,
    color: '#6D2932',
    bgColor: 'bg-[#6D2932]/10',
  },
  {
    id: 'ghg',
    name: 'GHG Protocol',
    fullName: 'GHG Protocol (Scope 1/2/3)',
    description: 'Global standardized framework to measure and manage greenhouse gas emissions from private and public sector operations and value chains.',
    icon: Factory,
    color: '#059669',
    bgColor: 'bg-green-100',
  },
  {
    id: 'issb',
    name: 'ISSB/IFRS S1 & S2',
    fullName: 'International Sustainability Standards Board',
    description: 'IFRS S1 (General Sustainability Disclosures) and S2 (Climate-related Disclosures) for investor-grade sustainability reporting.',
    icon: Globe2,
    color: '#2563eb',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'tcfd',
    name: 'TCFD',
    fullName: 'Task Force on Climate-related Financial Disclosures',
    description: 'Framework for climate-related financial risk disclosure covering governance, strategy, risk management, and metrics/targets.',
    icon: TrendingUp,
    color: '#d97706',
    bgColor: 'bg-amber-100',
  },
  {
    id: 'tnfd',
    name: 'TNFD',
    fullName: 'Taskforce on Nature-related Financial Disclosures',
    description: 'Framework for organizations to report on evolving nature-related dependencies, impacts, risks, and opportunities.',
    icon: TreePine,
    color: '#059669',
    bgColor: 'bg-emerald-100',
  },
]

// ─── Materiality Definitions ─────────────────────────────────────

const IMPACT_FACTORS = [
  { id: 'deforestation', label: 'Deforestation', icon: TreePine, description: 'Risk of contributing to deforestation in coffee supply chain' },
  { id: 'water', label: 'Water Usage', icon: Droplets, description: 'Water consumption and wastewater management in processing' },
  { id: 'child_labor', label: 'Child Labor', icon: Users, description: 'Risk of child labor in farming and processing operations' },
  { id: 'biodiversity', label: 'Biodiversity Loss', icon: Leaf, description: 'Impact on local ecosystems and biodiversity from farming practices' },
]

const FINANCIAL_FACTORS = [
  { id: 'eu_border', label: 'EU Border Rejection Risk', icon: Shield, description: 'Financial risk of shipments being rejected at EU borders under EUDR' },
  { id: 'processing_cost', label: 'Processing Cost Risk', icon: Factory, description: 'Rising costs from compliance requirements and processing standards' },
  { id: 'brand_reputation', label: 'Brand Reputation Risk', icon: Globe2, description: 'Reputational damage from non-compliance or sustainability failures' },
]

// ─── Helper ──────────────────────────────────────────────────────

function computeRiskFromRecords(records: EudrRecord[], factorId: string): 'Low' | 'Medium' | 'High' {
  if (records.length === 0) return 'Low'
  const criticalCount = records.filter(r => r.riskLevel === 'critical').length
  const highCount = records.filter(r => r.riskLevel === 'high').length
  const nonCompliantCount = records.filter(r => r.status === 'non_compliant').length
  const avgRisk = records.reduce((s, r) => s + (r.deforestationRiskScore || 0), 0) / records.length

  switch (factorId) {
    case 'deforestation':
      return avgRisk > 60 ? 'High' : avgRisk > 30 ? 'Medium' : 'Low'
    case 'water':
      return avgRisk > 50 ? 'Medium' : 'Low'
    case 'child_labor':
      return highCount > 0 ? 'High' : criticalCount > 0 ? 'High' : 'Medium'
    case 'biodiversity':
      return avgRisk > 55 ? 'High' : avgRisk > 25 ? 'Medium' : 'Low'
    case 'eu_border':
      return nonCompliantCount > 0 ? 'High' : records.filter(r => r.status === 'pending').length > 2 ? 'Medium' : 'Low'
    case 'processing_cost':
      return avgRisk > 50 ? 'Medium' : 'Low'
    case 'brand_reputation':
      return nonCompliantCount > 1 || criticalCount > 0 ? 'High' : nonCompliantCount > 0 ? 'Medium' : 'Low'
    default:
      return 'Low'
  }
}

const RISK_DISPLAY: Record<string, { color: string; bg: string }> = {
  Low: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-950/30' },
  Medium: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-950/30' },
  High: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/30' },
}

// ─── ESG Reporting Suite Page ────────────────────────────────────

export default function ESGReportingPage() {
  const [records, setRecords] = useState<EudrRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('frameworks')
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['csrd'])
  const [reportPeriodStart, setReportPeriodStart] = useState('2024-01-01')
  const [reportPeriodEnd, setReportPeriodEnd] = useState('2024-12-31')
  const [generating, setGenerating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/eudr-compliance?pageSize=1000')
      const data = await res.json()
      setRecords(data?.data?.data || data?.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Computed stats
  const stats = useMemo(() => {
    const totalFarmers = new Set(records.map(r => r.farmerId).filter(Boolean)).size
    const totalFarmArea = 0 // Not available from compliance records directly
    const compliant = records.filter(r => r.status === 'compliant').length
    const complianceRate = records.length > 0 ? Math.round((compliant / records.length) * 100) : 0
    const avgRiskScore = records.length > 0
      ? Math.round(records.reduce((s, r) => s + (r.deforestationRiskScore || 0), 0) / records.length)
      : 0
    // Scope 3 estimate: rough calculation based on avg risk and number of records
    const scope3Estimate = records.length * (avgRiskScore * 0.5 + 12)
    return { totalFarmers, totalFarmArea, complianceRate, avgRiskScore, scope3Estimate }
  }, [records])

  // Impact materiality ratings
  const impactRatings = useMemo(() => {
    return IMPACT_FACTORS.map(f => ({
      ...f,
      rating: computeRiskFromRecords(records, f.id),
    }))
  }, [records])

  // Financial materiality ratings
  const financialRatings = useMemo(() => {
    return FINANCIAL_FACTORS.map(f => ({
      ...f,
      rating: computeRiskFromRecords(records, f.id),
    }))
  }, [records])

  const toggleFramework = (fwId: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(fwId) ? prev.filter(id => id !== fwId) : [...prev, fwId]
    )
  }

  const handleGenerateReport = () => {
    if (selectedFrameworks.length === 0) {
      toast.error('Please select at least one reporting framework')
      return
    }
    setGenerating(true)
    // Build assessment result from current data and call PDF API
    const assessmentResult = buildAssessmentResult()
    fetch('/api/assessment/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentResult),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to generate PDF')
        return res.blob()
      })
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ESG-Report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('PDF report downloaded successfully')
      })
      .catch(err => {
        console.error('PDF generation failed:', err)
        toast.error('Failed to generate PDF report')
      })
      .finally(() => setGenerating(false))
  }

  const buildAssessmentResult = () => {
    const compliant = records.filter(r => r.status === 'compliant').length
    const complianceRate = records.length > 0 ? Math.round((compliant / records.length) * 100) : 0
    const avgRiskScore = records.length > 0
      ? Math.round(records.reduce((s, r) => s + (r.deforestationRiskScore || 0), 0) / records.length)
      : 0

    const categories = [
      {
        category: 'traceability',
        label: 'Supply Chain Traceability',
        score: Math.min(25, stats.complianceRate * 0.25),
        maxScore: 25,
        status: stats.complianceRate >= 80 ? 'excellent' : stats.complianceRate >= 60 ? 'good' : stats.complianceRate >= 40 ? 'moderate' : stats.complianceRate >= 20 ? 'low' : 'critical',
        recommendation: stats.complianceRate >= 80
          ? 'Traceability systems are well established. Continue monitoring and maintaining current standards.'
          : 'Implement farm-level GPS tracking and batch tracing to improve supply chain traceability for EUDR compliance.',
      },
      {
        category: 'deforestation',
        label: 'Deforestation Risk Management',
        score: Math.min(25, Math.max(0, 25 - avgRiskScore * 0.4)),
        maxScore: 25,
        status: avgRiskScore <= 20 ? 'excellent' : avgRiskScore <= 40 ? 'good' : avgRiskScore <= 60 ? 'moderate' : avgRiskScore <= 80 ? 'low' : 'critical',
        recommendation: avgRiskScore <= 30
          ? 'Deforestation risk is well managed. Maintain satellite monitoring and regular risk assessments.'
          : 'Deploy satellite deforestation monitoring and establish risk mitigation procedures for high-risk sourcing regions.',
      },
      {
        category: 'documentation',
        label: 'Due Diligence Documentation',
        score: Math.min(25, compliant * 2.5),
        maxScore: 25,
        status: compliant >= 8 ? 'excellent' : compliant >= 5 ? 'good' : compliant >= 3 ? 'moderate' : compliant >= 1 ? 'low' : 'critical',
        recommendation: compliant >= 5
          ? 'Documentation practices are solid. Ensure all due diligence statements are kept up to date.'
          : 'Establish formal due diligence documentation processes including TRACES-NT registration and DDS generation.',
      },
      {
        category: 'certifications',
        label: 'Certifications & Standards',
        score: Math.min(25, stats.totalFarmers * 2),
        maxScore: 25,
        status: stats.totalFarmers >= 10 ? 'excellent' : stats.totalFarmers >= 6 ? 'good' : stats.totalFarmers >= 3 ? 'moderate' : stats.totalFarmers >= 1 ? 'low' : 'critical',
        recommendation: 'Encourage suppliers to obtain UTZ/Rainforest Alliance, Organic, and Fair Trade certifications to strengthen compliance position.',
      },
    ]

    const totalScore = categories.reduce((s, c) => s + c.score, 0)
    const readinessLevel = totalScore >= 80 ? 'ready' : totalScore >= 65 ? 'mostly_ready' : totalScore >= 45 ? 'partially_ready' : totalScore >= 25 ? 'needs_work' : 'not_ready'

    return {
      totalScore: Math.round(totalScore),
      maxScore: 100,
      readinessLevel,
      categories,
      overallRecommendation: readinessLevel === 'ready'
        ? 'Your organization demonstrates strong ESG readiness. Focus on maintaining compliance and continuous improvement.'
        : readinessLevel === 'mostly_ready'
        ? 'Good progress on ESG compliance. Address the remaining gaps in documentation and certification coverage.'
        : 'Significant improvements needed in ESG compliance. Prioritize traceability, deforestation monitoring, and due diligence documentation.',
      eudrImpactNote: `Based on ${records.length} EUDR compliance records with an average risk score of ${avgRiskScore}. Compliance rate: ${stats.complianceRate}%. ${selectedFrameworks.join(', ')} framework(s) selected for reporting period ${reportPeriodStart} to ${reportPeriodEnd}.`,
      assessedAt: new Date().toISOString(),
    }
  }

  const handleExportPDF = async () => {
    const assessmentResult = buildAssessmentResult()
    try {
      toast.info('Generating PDF report...')
      const res = await fetch('/api/assessment/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentResult),
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ESG-Report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully')
    } catch (err) {
      console.error('PDF export failed:', err)
      toast.error('Failed to export PDF')
    }
  }

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error('No data available to export')
      return
    }
    try {
      const headers = ['ID', 'Compliance ID', 'Batch ID', 'Farmer', 'Farm Land', 'Status', 'Risk Level', 'Risk Score', 'Land Use', 'Verification Date', 'Valid From', 'Valid Until', 'Created At']
      const rows = records.map(r => [
        r.id,
        r.complianceId || '',
        r.batchId || '',
        r.farmer?.fullName || '',
        r.farmLand?.farmName || '',
        r.status,
        r.riskLevel,
        r.deforestationRiskScore?.toString() || '',
        r.landUseType || '',
        r.verificationDate || '',
        r.validFrom || '',
        r.validUntil || '',
        r.createdAt,
      ].map(v => `"${v.replace(/"/g, '""')}"`))
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ESG-Data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded successfully')
    } catch (err) {
      console.error('CSV export failed:', err)
      toast.error('Failed to export CSV')
    }
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#6D2932' }}>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#6D2932' }}>ESG Reporting Suite</h1>
              <p className="text-sm text-muted-foreground">CSRD, GHG Protocol, and EUDR-aligned reporting</p>
            </div>
          </div>
        </FadeIn>

        <Separator />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="frameworks" className="text-xs">Frameworks</TabsTrigger>
            <TabsTrigger value="materiality" className="text-xs">Double Materiality</TabsTrigger>
            <TabsTrigger value="generate" className="text-xs">Generate Report</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          </TabsList>

          {/* ─── Framework Selection ──────────────────────────────── */}
          <TabsContent value="frameworks" className="space-y-4 mt-4">
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRAMEWORKS.map((fw) => (
                <StaggerItem key={fw.id}>
                  <MotionCard {...hoverScale} className="rounded-xl border shadow-sm h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${fw.bgColor}`}>
                          <fw.icon className="w-5 h-5" style={{ color: fw.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold">{fw.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{fw.fullName}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">{fw.description}</p>
                      <Button
                        size="sm"
                        className="w-full text-xs gap-1"
                        style={{ backgroundColor: fw.color, color: 'white' }}
                        onClick={() => {
                          if (!selectedFrameworks.includes(fw.id)) toggleFramework(fw.id)
                          setActiveTab('generate')
                        }}
                      >
                        Generate Report <ArrowRight className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </MotionCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </TabsContent>

          {/* ─── Double Materiality Assessment ────────────────────── */}
          <TabsContent value="materiality" className="space-y-4 mt-4">
            <FadeIn>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Impact Materiality (Inside-Out) */}
                <Card className="rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#6D2932' }}>
                      <TreePine className="w-4 h-4" /> Impact Materiality
                    </CardTitle>
                    <CardDescription className="text-xs">Inside-out perspective: How the organization impacts people and the environment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : impactRatings.map((factor) => {
                      const rd = RISK_DISPLAY[factor.rating]
                      return (
                        <div key={factor.id} className={`p-3 rounded-lg border ${rd.bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <factor.icon className="w-4 h-4" style={{ color: '#6D2932' }} />
                              <span className="text-sm font-medium">{factor.label}</span>
                            </div>
                            <Badge className={`${rd.bg} ${rd.color} border-0 font-bold text-xs`}>
                              {factor.rating}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Financial Materiality (Outside-In) */}
                <Card className="rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#6D2932' }}>
                      <TrendingUp className="w-4 h-4" /> Financial Materiality
                    </CardTitle>
                    <CardDescription className="text-xs">Outside-in perspective: How sustainability issues affect the organization financially</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : financialRatings.map((factor) => {
                      const rd = RISK_DISPLAY[factor.rating]
                      return (
                        <div key={factor.id} className={`p-3 rounded-lg border ${rd.bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <factor.icon className="w-4 h-4" style={{ color: '#6D2932' }} />
                              <span className="text-sm font-medium">{factor.label}</span>
                            </div>
                            <Badge className={`${rd.bg} ${rd.color} border-0 font-bold text-xs`}>
                              {factor.rating}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </TabsContent>

          {/* ─── Report Generation ────────────────────────────────── */}
          <TabsContent value="generate" className="space-y-6 mt-4">
            <FadeIn>
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#6D2932' }}>
                    <FileText className="w-4 h-4" /> Report Configuration
                  </CardTitle>
                  <CardDescription className="text-xs">Select reporting period, frameworks, and generate your ESG report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Reporting Period */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Reporting Period</Label>
                    <div className="flex gap-3 items-center">
                      <Input type="date" value={reportPeriodStart} onChange={e => setReportPeriodStart(e.target.value)} className="w-44 text-sm" />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input type="date" value={reportPeriodEnd} onChange={e => setReportPeriodEnd(e.target.value)} className="w-44 text-sm" />
                    </div>
                  </div>

                  <Separator />

                  {/* Framework Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">Reporting Frameworks</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FRAMEWORKS.map((fw) => (
                        <label key={fw.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedFrameworks.includes(fw.id) ? 'bg-[#6D2932]/5 border-[#6D2932]/30' : 'hover:bg-muted/50'}`}>
                          <Checkbox
                            checked={selectedFrameworks.includes(fw.id)}
                            onCheckedChange={() => toggleFramework(fw.id)}
                          />
                          <div className="flex items-center gap-2">
                            <fw.icon className="w-4 h-4" style={{ color: fw.color }} />
                            <div>
                              <span className="text-sm font-medium">{fw.name}</span>
                              <p className="text-xs text-muted-foreground">{fw.fullName}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Generate Button */}
                  <Button
                    size="lg"
                    className="w-full text-sm gap-2"
                    style={{ backgroundColor: '#6D2932', color: 'white' }}
                    onClick={handleGenerateReport}
                    disabled={generating || selectedFrameworks.length === 0}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating Report...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" /> Generate ESG Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Report Summary Preview */}
            <FadeIn delay={0.1}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#6D2932' }}>
                    <Activity className="w-4 h-4" /> Report Summary
                  </CardTitle>
                  <CardDescription className="text-xs">Preview of key metrics that will be included in the report</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { label: 'Total Farmers', value: stats.totalFarmers, icon: Users, color: '#6D2932' },
                        { label: 'Total Farm Area', value: '—', icon: TreePine, color: '#059669' },
                        { label: 'EUDR Compliance Rate', value: `${stats.complianceRate}%`, icon: Shield, color: stats.complianceRate >= 80 ? '#059669' : '#d97706' },
                        { label: 'Average Risk Score', value: stats.avgRiskScore, icon: AlertTriangle, color: stats.avgRiskScore > 60 ? '#dc2626' : stats.avgRiskScore > 30 ? '#d97706' : '#059669' },
                        { label: 'Scope 3 Estimate (tCO₂e)', value: stats.scope3Estimate.toLocaleString(), icon: Factory, color: '#6366f1' },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-3 rounded-lg border bg-muted/30">
                          <item.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: item.color }} />
                          <p className="text-lg font-bold font-mono" style={{ color: item.color }}>{item.value}</p>
                          <p className="text-xs text-muted-foreground leading-tight mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* ─── Export Options ────────────────────────────────────── */}
          <TabsContent value="export" className="space-y-4 mt-4">
            <FadeIn>
              <div className="grid md:grid-cols-3 gap-6">
                {/* PDF Export */}
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                  <CardHeader className="pb-3 text-center">
                    <div className="mx-auto p-3 rounded-xl bg-red-100 dark:bg-red-950/30 w-fit">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-sm font-medium mt-3">PDF Report</CardTitle>
                    <CardDescription className="text-xs">Download a formatted PDF report for stakeholders and regulatory submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full text-xs gap-1"
                      onClick={handleExportPDF}
                      disabled={records.length === 0}
                    >
                      <Download className="w-3.5 h-3.5" /> Export PDF
                    </Button>
                  </CardContent>
                </MotionCard>

                {/* Excel Export */}
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                  <CardHeader className="pb-3 text-center">
                    <div className="mx-auto p-3 rounded-xl bg-green-100 dark:bg-green-950/30 w-fit">
                      <BarChart3 className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-sm font-medium mt-3">Excel Workbook</CardTitle>
                    <CardDescription className="text-xs">Export raw data and calculations in Excel format for further analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full text-xs gap-1"
                      onClick={handleExportCSV}
                      disabled={records.length === 0}
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                  </CardContent>
                </MotionCard>

                {/* API Export */}
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                  <CardHeader className="pb-3 text-center">
                    <div className="mx-auto p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30 w-fit">
                      <Zap className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm font-medium mt-3">API Access</CardTitle>
                    <CardDescription className="text-xs">Access report data programmatically via REST API for integration with other systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full text-xs gap-1"
                      onClick={() => toast.info('API documentation and access tokens available in API Settings')}
                    >
                      <Globe2 className="w-3.5 h-3.5" /> API Docs
                    </Button>
                  </CardContent>
                </MotionCard>
              </div>
            </FadeIn>
          </TabsContent>
        </Tabs>
      </div>
  )
}

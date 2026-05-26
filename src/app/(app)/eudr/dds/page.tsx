'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Plus, CheckCircle2, Clock, AlertTriangle,
  Download, Upload, Eye, Send, ChevronRight, ChevronLeft,
  Building2, Globe, Leaf, ShieldCheck, AlertCircle, FileCheck,
  Printer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem, PulseDot } from '@/components/ui/animations'
import { SensitiveField } from '@/components/ui/sensitive-field'
import Link from 'next/link'

// ======== MOCK DDS RECORDS ========
const MOCK_DDS = [
  { id: 'DDS-001', batchId: 'BATCH-2024-001', destination: 'Germany', status: 'approved', submissionDate: '2024-01-15', tracesRef: 'TRACES-EU-2024-001', operatorName: 'Terra Brew Vietnam', commodity: 'Coffee (Arabica)' },
  { id: 'DDS-002', batchId: 'BATCH-2024-002', destination: 'Netherlands', status: 'pending_approval', submissionDate: '2024-01-18', tracesRef: 'TRACES-EU-2024-002', operatorName: 'Terra Brew Vietnam', commodity: 'Coffee (Robusta)' },
  { id: 'DDS-003', batchId: 'BATCH-2024-003', destination: 'France', status: 'draft', submissionDate: null, tracesRef: null, operatorName: 'Terra Brew Vietnam', commodity: 'Coffee (Arabica)' },
  { id: 'DDS-004', batchId: 'BATCH-2024-004', destination: 'Italy', status: 'approved', submissionDate: '2024-01-20', tracesRef: 'TRACES-EU-2024-004', operatorName: 'Terra Brew Vietnam', commodity: 'Coffee (Arabica)' },
  { id: 'DDS-005', batchId: 'BATCH-2024-005', destination: 'Belgium', status: 'rejected', submissionDate: '2024-01-22', tracesRef: null, operatorName: 'Terra Brew Vietnam', commodity: 'Coffee (Robusta)' },
]

const statusIcons: Record<string, React.ElementType> = {
  approved: CheckCircle2,
  pending_approval: Clock,
  draft: FileText,
  rejected: AlertTriangle,
}

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  draft: 'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-700',
}

// ======== WIZARD STEPS ========
const WIZARD_STEPS = [
  { id: 1, label: 'Operator & Commodity', icon: Building2 },
  { id: 2, label: 'Production & Supply Chain', icon: Leaf },
  { id: 3, label: 'Risk Assessment & Declaration', icon: ShieldCheck },
]

// ======== DDS STATUS TIMELINE ========
function DdsStatusTimeline({ status }: { status: string }) {
  const steps = [
    { label: 'Draft', completed: true },
    { label: 'Submitted', completed: ['pending_approval', 'approved'].includes(status) },
    { label: 'Under Review', completed: ['pending_approval', 'approved'].includes(status), current: status === 'pending_approval' },
    { label: 'Approved', completed: status === 'approved', current: status === 'approved' },
  ]

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex items-center gap-1">
            <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
              step.current ? 'bg-amber-500 text-white' :
              step.completed ? 'bg-emerald-500 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {step.completed ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-4 h-0.5 mx-0.5 ${steps[i + 1]?.completed ? 'bg-emerald-400' : 'bg-muted-foreground/20'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ======== PREVIEW DDS DOCUMENT ========
function DdsPreview({ form }: { form: any }) {
  return (
    <div className="border rounded-lg p-4 text-xs space-y-3 bg-white dark:bg-muted/20">
      <div className="text-center border-b pb-3">
        <p className="font-bold text-sm">DUE DILIGENCE STATEMENT</p>
        <p className="text-muted-foreground">EUDR Regulation (EU) 2023/1115</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><span className="text-muted-foreground">Operator:</span> <span className="font-medium">{form.operatorName || '—'}</span></div>
        <div><span className="text-muted-foreground">Commodity:</span> <span className="font-medium">{form.commodityType || 'Coffee'}</span></div>
        <div><span className="text-muted-foreground">Batch ID:</span> <span className="font-medium">{form.batchId || '—'}</span></div>
        <div><span className="text-muted-foreground">Destination:</span> <span className="font-medium">{form.destination || '—'}</span></div>
        <div><span className="text-muted-foreground">Country of Origin:</span> <span className="font-medium">{form.originCountry || 'Vietnam'}</span></div>
        <div><span className="text-muted-foreground">Production Date:</span> <span className="font-medium">{form.productionDate || '—'}</span></div>
      </div>
      <div className="border-t pt-2">
        <p className="font-medium mb-1">Risk Assessment</p>
        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-muted-foreground">Risk Level:</span> <span className="font-medium">{form.riskLevel || '—'}</span></div>
          <div><span className="text-muted-foreground">Deforestation Risk:</span> <span className="font-medium">{form.deforestationRisk || '—'}</span></div>
        </div>
      </div>
      <div className="border-t pt-2 text-center">
        <p className="italic text-muted-foreground">This statement is made in accordance with EU Regulation 2023/1115</p>
      </div>
    </div>
  )
}

// ======== MAIN PAGE ========
export default function DdsPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [form, setForm] = useState({
    // Step 1
    operatorName: '',
    operatorRegNo: '',
    operatorCountry: 'Vietnam',
    commodityType: 'coffee',
    coffeeSpecies: 'Arabica',
    batchId: '',
    destination: '',
    // Step 2
    originCountry: 'Vietnam',
    province: '',
    productionDate: '',
    farmLandId: '',
    processingFacility: '',
    supplyChainActors: '',
    // Step 3
    riskLevel: '',
    deforestationRisk: '',
    riskMitigation: '',
    declarationAccepted: false,
  })

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    setShowWizard(false)
    setWizardStep(1)
    setShowPreview(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/eudr">
                <Button variant="ghost" size="sm" className="text-emerald-600 -ml-2">← EUDR</Button>
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">Due Diligence Statement</h2>
            <p className="text-sm text-muted-foreground mt-1">Create and manage EUDR Due Diligence Statements for EU import compliance</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setShowWizard(true); setWizardStep(1) }}>
            <Plus className="h-4 w-4 mr-2" /> New DDS
          </Button>
        </div>
      </FadeIn>

      {/* Multi-Step Wizard */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-sm ring-2 ring-emerald-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Create Due Diligence Statement</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setShowWizard(false); setShowPreview(false) }}>Cancel</Button>
                </div>
                {/* Step indicators */}
                <div className="flex items-center gap-2 mt-2">
                  {WIZARD_STEPS.map((step, i) => {
                    const Icon = step.icon
                    const isActive = wizardStep === step.id
                    const isCompleted = wizardStep > step.id
                    return (
                      <div key={step.id} className="flex items-center">
                        <button
                          onClick={() => isCompleted && setWizardStep(step.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            isActive ? 'bg-emerald-100 text-emerald-700' :
                            isCompleted ? 'bg-emerald-50 text-emerald-600 cursor-pointer' :
                            'bg-muted text-muted-foreground'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-emerald-600 text-white' :
                            isCompleted ? 'bg-emerald-500 text-white' :
                            'bg-muted-foreground/20 text-muted-foreground'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                          </div>
                          <span className="hidden sm:inline">{step.label}</span>
                        </button>
                        {i < WIZARD_STEPS.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {/* Step 1: Operator & Commodity */}
                  {wizardStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Operator Name *</Label>
                          <Input placeholder="Legal entity name" value={form.operatorName} onChange={e => updateForm('operatorName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Operator Registration No.</Label>
                          <Input placeholder="e.g. VN-REG-001" value={form.operatorRegNo} onChange={e => updateForm('operatorRegNo', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Country of Establishment</Label>
                          <Input value={form.operatorCountry} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Commodity Type</Label>
                          <Input value="Coffee" disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Coffee Species</Label>
                          <Input placeholder="Arabica, Robusta, etc." value={form.coffeeSpecies} onChange={e => updateForm('coffeeSpecies', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Batch ID *</Label>
                          <Input placeholder="e.g. BATCH-2024-001" value={form.batchId} onChange={e => updateForm('batchId', e.target.value)} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Destination Country *</Label>
                          <Input placeholder="e.g. Germany" value={form.destination} onChange={e => updateForm('destination', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setWizardStep(2)}>
                          Next: Production Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Production & Supply Chain */}
                  {wizardStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Country of Origin</Label>
                          <Input value={form.originCountry} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Province / Region</Label>
                          <Input placeholder="e.g. Dak Lak" value={form.province} onChange={e => updateForm('province', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Production Date</Label>
                          <Input type="date" value={form.productionDate} onChange={e => updateForm('productionDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Farm Land Reference</Label>
                          <Input placeholder="Farm land ID or code" value={form.farmLandId} onChange={e => updateForm('farmLandId', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Processing Facility</Label>
                          <Input placeholder="Name of processing plant" value={form.processingFacility} onChange={e => updateForm('processingFacility', e.target.value)} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Supply Chain Actors</Label>
                          <Textarea placeholder="List all actors in the supply chain (farmers, aggregators, processors, exporters)..." value={form.supplyChainActors} onChange={e => updateForm('supplyChainActors', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => setWizardStep(1)}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setWizardStep(3)}>
                          Next: Risk Assessment <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Risk Assessment & Declaration */}
                  {wizardStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Overall Risk Level</Label>
                          <Input placeholder="Low, Medium, High, Critical" value={form.riskLevel} onChange={e => updateForm('riskLevel', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Deforestation Risk Assessment</Label>
                          <Input placeholder="No deforestation risk identified / Risk identified" value={form.deforestationRisk} onChange={e => updateForm('deforestationRisk', e.target.value)} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Risk Mitigation Measures</Label>
                          <Textarea placeholder="Describe measures taken to mitigate any identified risks..." value={form.riskMitigation} onChange={e => updateForm('riskMitigation', e.target.value)} />
                        </div>
                      </div>

                      {/* Preview toggle */}
                      <div className="mt-4">
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                          <Eye className="h-4 w-4 mr-1" /> {showPreview ? 'Hide' : 'Preview'} DDS Document
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showPreview && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                            <DdsPreview form={form} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Declaration */}
                      <div className="mt-4 p-3 rounded-lg border bg-muted/30">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.declarationAccepted}
                            onChange={e => updateForm('declarationAccepted', e.target.checked)}
                            className="mt-1 rounded border-muted-foreground/30"
                          />
                          <p className="text-xs text-muted-foreground">
                            I declare that the information provided in this Due Diligence Statement is accurate and complete to the best of my knowledge.
                            I confirm that the products covered comply with the requirements of EU Regulation 2023/1115 (EUDR) and that no deforestation or forest degradation has occurred in the production of these commodities.
                          </p>
                        </label>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => setWizardStep(2)}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => { setShowPreview(!showPreview) }}>
                            <Printer className="h-4 w-4 mr-1" /> Print
                          </Button>
                          <Button variant="outline" onClick={() => { setShowPreview(!showPreview) }}>
                            <Download className="h-4 w-4 mr-1" /> Export PDF
                          </Button>
                          <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={!form.declarationAccepted} onClick={handleSubmit}>
                            <Send className="h-4 w-4 mr-1" /> Submit DDS
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DDS Summary */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total DDS', value: MOCK_DDS.length, icon: FileText, gradient: 'kpi-emerald' },
          { title: 'Approved', value: MOCK_DDS.filter(d => d.status === 'approved').length, icon: CheckCircle2, gradient: 'kpi-teal' },
          { title: 'Pending', value: MOCK_DDS.filter(d => d.status === 'pending_approval').length, icon: Clock, gradient: 'kpi-amber' },
          { title: 'Rejected', value: MOCK_DDS.filter(d => d.status === 'rejected').length, icon: AlertTriangle, gradient: 'kpi-rose' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <StaggerItem key={kpi.title}>
              <AnimatedCard>
                <Card className="card-lift overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className={`h-8 w-8 rounded-lg ${kpi.gradient} flex items-center justify-center mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* DDS List */}
      <FadeIn delay={0.1}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Due Diligence Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {MOCK_DDS.map((dds, idx) => {
                const StatusIcon = statusIcons[dds.status] || FileText
                return (
                  <motion.div
                    key={dds.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      dds.status === 'approved' ? 'bg-emerald-100' :
                      dds.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <StatusIcon className={`h-5 w-5 ${
                        dds.status === 'approved' ? 'text-emerald-600' :
                        dds.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{dds.id}</p>
                        <span className="text-xs font-mono text-muted-foreground">{dds.batchId}</span>
                        <Badge className={`text-[10px] ${statusColors[dds.status] || 'bg-gray-100 text-gray-700'}`}>
                          {dds.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          → {dds.destination || 'No destination'} · {dds.commodity}
                        </p>
                      </div>
                      <div className="mt-1.5">
                        <DdsStatusTimeline status={dds.status} />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAppStore, type ViewName } from '@/lib/store'
import * as api from '@/lib/spa-api'
import { AnimatedPage, FadeIn, ScaleIn } from '@/components/ui/animations'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus, Search, Pencil, Trash2, Loader2, Factory, Sparkles, Cog, Sun, Filter,
  Flame, Package, BarChart3, CheckCircle2, ArrowRight, ChevronLeft,
} from 'lucide-react'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const PIPELINE_STEPS = [
  { key: 'CLEANING_WASHING', label: '1. Cleaning & Washing', icon: Sparkles, color: 'bg-blue-500' },
  { key: 'DEPULPING_FERMENTATION', label: '2. Depulping & Fermentation', icon: Cog, color: 'bg-green-500' },
  { key: 'DRYING_HULLING', label: '3. Drying & Hulling', icon: Sun, color: 'bg-amber-500' },
  { key: 'GRADING_SORTING', label: '4. Grading & Sorting', icon: Filter, color: 'bg-orange-500' },
  { key: 'ROASTING_BLENDING', label: '5. Roasting & Blending', icon: Flame, color: 'bg-red-500' },
  { key: 'GRINDING_PACKAGING', label: '6. Grinding & Packaging', icon: Package, color: 'bg-purple-500' },
  { key: 'QUALITY_CONTROL', label: '7. Quality Control', icon: BarChart3, color: 'bg-teal-500' },
]

// ═══════════════════════════════════════════════════════
// PROCESSING JOB ORDERS LIST
// ═══════════════════════════════════════════════════════

export function ProcessingJobOrdersView() {
  const { setCurrentView, setSelectedRecord } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProcessingJobOrders(search).then(data => { setItems(data.items || data); setLoading(false) }).catch(() => setLoading(false))
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await api.deleteProcessingJobOrder(id); setItems(items.filter(i => i.id !== id)) } catch (e: any) { alert(e.message) }
  }

  return (
    <AnimatedPage viewKey="processing-job-orders">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn><div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Processing Job Orders ({items.length})</h2>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedRecord(null); setCurrentView('processing-job-order-form') }}><Plus className="h-4 w-4 mr-2" /> New Job Order</Button>
        </div></FadeIn>
        <FadeIn delay={0.1}><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div></FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div> : (
          <FadeIn delay={0.2}><div className="space-y-3">
            {items.map(item => {
              const completedStages = item.processingStages?.map((s: any) => s.stageType) || []
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedRecord(item); setCurrentView('processing-job-order-form') }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{item.jobOrderId || `Job #${item.id.slice(-6)}`}</p>
                        <p className="text-xs text-muted-foreground">{item.coffeeVarietyInput || item.coffeeTypeInput || '—'} · {item.processingMethod || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{completedStages.length}/7 stages</Badge>
                        <motion.button whileHover={{ scale: 1.15 }} className="h-7 w-7 rounded-md text-red-600 hover:bg-red-50 flex items-center justify-center" onClick={e => { e.stopPropagation(); handleDelete(item.id) }}><Trash2 className="h-3.5 w-3.5" /></motion.button>
                      </div>
                    </div>
                    {/* Pipeline Progress */}
                    <div className="flex items-center gap-1">
                      {PIPELINE_STEPS.map((step, i) => {
                        const isCompleted = completedStages.includes(step.key)
                        const Icon = step.icon
                        return (
                          <div key={step.key} className="flex items-center">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${isCompleted ? step.color + ' text-white' : 'bg-muted text-muted-foreground'}`}>
                              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3 w-3" />}
                            </div>
                            {i < PIPELINE_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 mx-0.5" />}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {item.inputWeightKg && <span>Input: {item.inputWeightKg}kg</span>}
                      {item.finalOutputWeightKg && <span>Output: {item.finalOutputWeightKg}kg</span>}
                      {item.cupScore && <span>Cup: {item.cupScore}</span>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No job orders</div>}
          </div></FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ═══════════════════════════════════════════════════════
// PROCESSING JOB ORDER FORM (7-Step Pipeline Wizard)
// ═══════════════════════════════════════════════════════

export function ProcessingJobOrderFormView() {
  const { currentUser, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(-1) // -1 = job order details, 0-6 = pipeline steps
  const [form, setForm] = useState<any>({
    jobOrderId: '', processingDate: '', batchIdInput: '', coffeeTypeInput: '', coffeeVarietyInput: '',
    inputQuantityKg: '', processingMethod: '', targetOutputProduct: '', operatorName: '', plantFacilityName: '',
  })
  const [stages, setStages] = useState<any[]>([])
  const [stageForm, setStageForm] = useState<any>({ inputWeight: '', outputWeight: '', durationMinutes: '', temperature: '', humidity: '', machineUsed: '', operatorName: '', notes: '' })

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        jobOrderId: selectedRecord.jobOrderId || '',
        processingDate: selectedRecord.processingDate ? selectedRecord.processingDate.split('T')[0] : '',
        batchIdInput: selectedRecord.batchIdInput || '',
        coffeeTypeInput: selectedRecord.coffeeTypeInput || '',
        coffeeVarietyInput: selectedRecord.coffeeVarietyInput || '',
        inputQuantityKg: selectedRecord.inputQuantityKg || '',
        processingMethod: selectedRecord.processingMethod || '',
        targetOutputProduct: selectedRecord.targetOutputProduct || '',
        operatorName: selectedRecord.operatorName || '',
        plantFacilityName: selectedRecord.plantFacilityName || '',
      })
      setStages(selectedRecord.processingStages || [])
    }
  }, [selectedRecord])

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedRecord) {
        await api.updateProcessingJobOrder(selectedRecord.id, form)
      } else {
        const result = await api.createProcessingJobOrder(form)
        setSelectedRecord({ ...result, processingStages: [] })
      }
      setActiveStep(0)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStage = async () => {
    if (!selectedRecord?.id) return
    setLoading(true)
    try {
      const step = PIPELINE_STEPS[activeStep]
      const stageData = {
        ...stageForm,
        tenantId: currentUser!.tenantId,
        jobOrderId: selectedRecord.id,
        stageType: step.key,
        stageDate: new Date().toISOString(),
        qualityCheckPassed: true,
      }
      const newStage = await api.createProcessingStage(stageData)
      setStages([...stages, newStage])
      setStageForm({ inputWeight: '', outputWeight: '', durationMinutes: '', temperature: '', humidity: '', machineUsed: '', operatorName: '', notes: '' })
      if (activeStep < PIPELINE_STEPS.length - 1) {
        setActiveStep(activeStep + 1)
      } else {
        setSelectedRecord(null)
        setCurrentView('processing-job-orders')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage viewKey="processing-job-order-form">
      <div className="p-4 md:p-6">
        <FadeIn><div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView('processing-job-orders') }}>← Back</Button>
          <h2 className="text-xl font-bold">{selectedRecord ? 'Edit Job Order' : 'New Processing Job Order'}</h2>
        </div></FadeIn>

        {/* Pipeline Progress */}
        {selectedRecord && (
          <FadeIn delay={0.1}>
            <Card className="mb-6"><CardContent className="p-4">
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                <div className={`flex flex-col items-center min-w-[60px] cursor-pointer ${activeStep === -1 ? 'opacity-100' : 'opacity-60'}`} onClick={() => setActiveStep(-1)}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${activeStep === -1 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Factory className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] mt-1">Details</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground/30 mx-0.5 shrink-0" />
                {PIPELINE_STEPS.map((step, i) => {
                  const isCompleted = stages.some((s: any) => s.stageType === step.key)
                  const Icon = step.icon
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex flex-col items-center min-w-[60px] cursor-pointer ${activeStep === i ? 'opacity-100' : 'opacity-60'}`} onClick={() => setActiveStep(i)}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${isCompleted ? step.color + ' text-white' : activeStep === i ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-[9px] mt-1 text-center">{step.label.split('. ')[1]}</span>
                      </div>
                      {i < PIPELINE_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 mx-0.5 shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </CardContent></Card>
          </FadeIn>
        )}

        {/* Job Order Details Form */}
        {activeStep === -1 && (
          <form onSubmit={handleSubmitJob}>
            <div className="space-y-6 max-w-4xl">
              <FadeIn delay={0.1}>
                <Card><CardHeader><CardTitle className="text-base">Job Order Details</CardTitle></CardHeader>
                  <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Job Order ID</Label><Input value={form.jobOrderId} onChange={e => setForm({...form, jobOrderId: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Processing Date</Label><Input type="date" value={form.processingDate} onChange={e => setForm({...form, processingDate: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Batch ID Input</Label><Input value={form.batchIdInput} onChange={e => setForm({...form, batchIdInput: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Coffee Type</Label>
                      <Select value={form.coffeeTypeInput} onValueChange={v => setForm({...form, coffeeTypeInput: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="Arabica">Arabica</SelectItem><SelectItem value="Robusta">Robusta</SelectItem><SelectItem value="Liberica">Liberica</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Variety</Label><Input value={form.coffeeVarietyInput} onChange={e => setForm({...form, coffeeVarietyInput: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Input Quantity (kg)</Label><Input type="number" value={form.inputQuantityKg} onChange={e => setForm({...form, inputQuantityKg: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Processing Method</Label>
                      <Select value={form.processingMethod} onValueChange={v => setForm({...form, processingMethod: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="Washed">Washed</SelectItem><SelectItem value="Natural">Natural</SelectItem><SelectItem value="Honey">Honey</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Operator</Label><Input value={form.operatorName} onChange={e => setForm({...form, operatorName: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Facility</Label><Input value={form.plantFacilityName} onChange={e => setForm({...form, plantFacilityName: e.target.value})} /></div>
                  </CardContent>
                </Card>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setSelectedRecord(null); setCurrentView('processing-job-orders') }}>Cancel</Button>
                  <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedRecord ? 'Update & Continue' : 'Create & Start Pipeline'}
                  </Button>
                </div>
              </FadeIn>
            </div>
          </form>
        )}

        {/* Pipeline Step Form */}
        {activeStep >= 0 && selectedRecord && (
          <div className="space-y-6 max-w-4xl">
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {(() => { const StepIcon = PIPELINE_STEPS[activeStep].icon; return <StepIcon className="h-4 w-4" /> })()}
                    {PIPELINE_STEPS[activeStep].label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1"><Label>Input Weight (kg)</Label><Input type="number" value={stageForm.inputWeight} onChange={e => setStageForm({...stageForm, inputWeight: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Output Weight (kg)</Label><Input type="number" value={stageForm.outputWeight} onChange={e => setStageForm({...stageForm, outputWeight: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Duration (min)</Label><Input type="number" value={stageForm.durationMinutes} onChange={e => setStageForm({...stageForm, durationMinutes: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Temperature (°C)</Label><Input type="number" value={stageForm.temperature} onChange={e => setStageForm({...stageForm, temperature: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Humidity (%)</Label><Input type="number" value={stageForm.humidity} onChange={e => setStageForm({...stageForm, humidity: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Machine Used</Label><Input value={stageForm.machineUsed} onChange={e => setStageForm({...stageForm, machineUsed: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Operator</Label><Input value={stageForm.operatorName} onChange={e => setStageForm({...stageForm, operatorName: e.target.value})} /></div>
                  <div className="space-y-1 sm:col-span-2"><Label>Notes</Label><Textarea value={stageForm.notes} onChange={e => setStageForm({...stageForm, notes: e.target.value})} rows={2} /></div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => { setSelectedRecord(null); setCurrentView('processing-job-orders') }}>Finish Later</Button>
                <Button className="bg-emerald-700 hover:bg-emerald-800" disabled={loading} onClick={handleSaveStage}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {activeStep < PIPELINE_STEPS.length - 1 ? 'Save & Next Step' : 'Save & Complete'}
                </Button>
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}

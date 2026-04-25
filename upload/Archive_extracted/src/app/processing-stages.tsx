'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type ViewName } from '@/lib/store'
import {
  getProcessingStages, createProcessingStage, updateProcessingStage, deleteProcessingStage,
} from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Pencil, Trash2, ArrowLeft, Link2 } from 'lucide-react'
import { AnimatedPage, FadeIn, StaggerContainer, StaggerItem, AnimatedCard, ScaleIn } from '@/components/ui/animations'
import { motion } from 'framer-motion'

// ====================== FIELD CONFIGURATION ======================

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'number' | 'datetime' | 'date' | 'select' | 'textarea' | 'boolean'
  options?: string[]
  showInList?: boolean // show this column in the list table
}

const STAGE_FIELDS: Record<string, { label: string; fields: FieldDef[]; listKeys: string[] }> = {
  CLEANING_WASHING: {
    label: 'Cleaning & Washing',
    fields: [
      { key: 'cleaningDate', label: 'Cleaning Date', type: 'datetime', showInList: true },
      { key: 'equipmentUsed', label: 'Equipment Used', type: 'text', showInList: true },
      { key: 'contaminantsRemoved', label: 'Contaminants Removed', type: 'text' },
      { key: 'floatTestResult', label: 'Float Test Result', type: 'text', showInList: true },
      { key: 'weightAfterCleaning', label: 'Weight After Cleaning (kg)', type: 'number', showInList: true },
      { key: 'washingPasses', label: 'Washing Passes', type: 'number' },
      { key: 'totalWaterUsed', label: 'Total Water Used (L)', type: 'number' },
      { key: 'waterPhAfterWash', label: 'Water pH After Wash', type: 'number' },
      { key: 'effluentDisposalMethod', label: 'Effluent Disposal Method', type: 'text' },
      { key: 'weightAfterWashing', label: 'Weight After Washing (kg)', type: 'number', showInList: true },
    ],
    listKeys: ['cleaningDate', 'equipmentUsed', 'floatTestResult', 'weightAfterCleaning', 'weightAfterWashing'],
  },
  DEPULPING_FERMENTATION: {
    label: 'Depulping & Fermentation',
    fields: [
      { key: 'depulpingDate', label: 'Depulping Date', type: 'datetime', showInList: true },
      { key: 'depulperMachineId', label: 'Depulper Machine ID', type: 'text', showInList: true },
      { key: 'pulpDischargeMethod', label: 'Pulp Discharge Method', type: 'text' },
      { key: 'weightAfterDepulping', label: 'Weight After Depulping (kg)', type: 'number', showInList: true },
      { key: 'fermentationStart', label: 'Fermentation Start', type: 'datetime' },
      { key: 'fermentationEnd', label: 'Fermentation End', type: 'datetime' },
      { key: 'fermentationDuration', label: 'Fermentation Duration (hours)', type: 'number', showInList: true },
      { key: 'fermentationType', label: 'Fermentation Type', type: 'text', showInList: true },
      { key: 'tankId', label: 'Tank ID', type: 'text' },
      { key: 'waterVolumeUsed', label: 'Water Volume Used (L)', type: 'number' },
      { key: 'mucilageRemovalConfirmed', label: 'Mucilage Removal Confirmed', type: 'boolean' },
    ],
    listKeys: ['depulpingDate', 'depulperMachineId', 'weightAfterDepulping', 'fermentationDuration', 'fermentationType'],
  },
  DRYING_HULLING: {
    label: 'Drying & Hulling',
    fields: [
      { key: 'dryingStartDate', label: 'Drying Start Date', type: 'datetime', showInList: true },
      { key: 'dryingMethod', label: 'Drying Method', type: 'text', showInList: true },
      { key: 'dryingTemperature', label: 'Drying Temperature (°C)', type: 'number' },
      { key: 'turningFrequency', label: 'Turning Frequency', type: 'text', showInList: true },
      { key: 'dryingDuration', label: 'Drying Duration (days)', type: 'number' },
      { key: 'targetMoisture', label: 'Target Moisture (%)', type: 'number' },
      { key: 'finalMoisture', label: 'Final Moisture (%)', type: 'number', showInList: true },
      { key: 'dryingEndDate', label: 'Drying End Date', type: 'datetime' },
      { key: 'hullingDate', label: 'Hulling Date', type: 'datetime', showInList: true },
      { key: 'hullerMachineId', label: 'Huller Machine ID', type: 'text', showInList: true },
      { key: 'weightAfterHulling', label: 'Weight After Hulling (kg)', type: 'number', showInList: true },
      { key: 'hullingLoss', label: 'Hulling Loss (kg)', type: 'number' },
    ],
    listKeys: ['dryingStartDate', 'dryingMethod', 'turningFrequency', 'finalMoisture', 'hullingDate', 'weightAfterHulling'],
  },
  GRADING_SORTING: {
    label: 'Grading & Sorting',
    fields: [
      { key: 'gradingDate', label: 'Grading Date', type: 'datetime', showInList: true },
      { key: 'screenSizeUsed', label: 'Screen Size Used', type: 'text', showInList: true },
      { key: 'gradeAchieved', label: 'Grade Achieved', type: 'select', options: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Premium', 'Standard', 'Off-grade'], showInList: true },
      { key: 'defectCountPer300g', label: 'Defect Count per 300g', type: 'number' },
      { key: 'colorSortingUsed', label: 'Color Sorting Used', type: 'boolean' },
      { key: 'densitySortingUsed', label: 'Density Sorting Used', type: 'boolean' },
      { key: 'weightAfterGrading', label: 'Weight After Grading (kg)', type: 'number', showInList: true },
      { key: 'rejectsOffGrade', label: 'Rejects / Off-grade (kg)', type: 'number' },
      { key: 'overallOutturn', label: 'Overall Outturn (%)', type: 'number', showInList: true },
    ],
    listKeys: ['gradingDate', 'screenSizeUsed', 'gradeAchieved', 'weightAfterGrading', 'overallOutturn'],
  },
  ROASTING_BLENDING: {
    label: 'Roasting & Blending',
    fields: [
      { key: 'blendingDate', label: 'Blending Date', type: 'datetime', showInList: true },
      { key: 'blendRecipeId', label: 'Blend Recipe ID', type: 'text', showInList: true },
      { key: 'componentBatch1Id', label: 'Component Batch 1 ID', type: 'text' },
      { key: 'component1Ratio', label: 'Component 1 Ratio (%)', type: 'number' },
      { key: 'component2Ratio', label: 'Component 2 Ratio (%)', type: 'number' },
      { key: 'blendOutputWeight', label: 'Blend Output Weight (kg)', type: 'number', showInList: true },
      { key: 'roastingDate', label: 'Roasting Date', type: 'datetime', showInList: true },
      { key: 'roasterMachineId', label: 'Roaster Machine ID', type: 'text', showInList: true },
      { key: 'roastLevel', label: 'Roast Level', type: 'select', options: ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark', 'French'], showInList: true },
      { key: 'chargeTemp', label: 'Charge Temp (°C)', type: 'number' },
      { key: 'firstCrackTime', label: 'First Crack Time (min)', type: 'number' },
      { key: 'dropTemp', label: 'Drop Temp (°C)', type: 'number' },
      { key: 'totalRoastDuration', label: 'Total Roast Duration (min)', type: 'number', showInList: true },
      { key: 'roastLoss', label: 'Roast Loss (%)', type: 'number' },
      { key: 'outputWeightAfterRoast', label: 'Output Weight After Roast (kg)', type: 'number', showInList: true },
    ],
    listKeys: ['blendingDate', 'blendRecipeId', 'blendOutputWeight', 'roastingDate', 'roastLevel', 'outputWeightAfterRoast'],
  },
  GRINDING_PACKAGING: {
    label: 'Grinding & Packaging',
    fields: [
      { key: 'grindingDate', label: 'Grinding Date', type: 'datetime', showInList: true },
      { key: 'grinderMachineId', label: 'Grinder Machine ID', type: 'text', showInList: true },
      { key: 'grindSizeSetting', label: 'Grind Size Setting', type: 'select', options: ['Extra Coarse', 'Coarse', 'Medium-Coarse', 'Medium', 'Medium-Fine', 'Fine', 'Extra Fine', 'Turkish'], showInList: true },
      { key: 'outputWeightAfterGrinding', label: 'Output Weight After Grinding (kg)', type: 'number', showInList: true },
      { key: 'co2DegassingTime', label: 'CO₂ Degassing Time (hours)', type: 'number' },
      { key: 'packagingDate', label: 'Packaging Date', type: 'datetime', showInList: true },
      { key: 'finalProductType', label: 'Final Product Type', type: 'select', options: ['Whole Bean', 'Ground Coffee', 'Instant', 'Pods/Capsules', 'Drip Bags'], showInList: true },
      { key: 'packagingMaterial', label: 'Packaging Material', type: 'select', options: ['Foil Bag', 'Kraft Bag', 'Tin Can', 'Glass Jar', 'Stand-up Pouch', 'Vacuum Pack'] },
      { key: 'packSize', label: 'Pack Size (g)', type: 'number', showInList: true },
      { key: 'unitsPacked', label: 'Units Packed', type: 'number', showInList: true },
      { key: 'totalPackagedWeight', label: 'Total Packaged Weight (kg)', type: 'number', showInList: true },
      { key: 'nitrogenFlushApplied', label: 'Nitrogen Flush Applied', type: 'boolean' },
      { key: 'bestBeforeDate', label: 'Best Before Date', type: 'date' },
      { key: 'finalBatchId', label: 'Final Batch ID', type: 'text', showInList: true },
    ],
    listKeys: ['grindingDate', 'grinderMachineId', 'grindSizeSetting', 'packagingDate', 'finalProductType', 'packSize', 'totalPackagedWeight', 'finalBatchId'],
  },
  QUALITY_CONTROL: {
    label: 'Quality Control',
    fields: [
      { key: 'inputWeight', label: 'Input Weight (kg)', type: 'number', showInList: true },
      { key: 'finalOutputWeight', label: 'Final Output Weight (kg)', type: 'number', showInList: true },
      { key: 'overallOutturn', label: 'Overall Outturn (%)', type: 'number', showInList: true },
      { key: 'totalProcessingCost', label: 'Total Processing Cost', type: 'number' },
      { key: 'costPerKg', label: 'Cost per Kg', type: 'number', showInList: true },
      { key: 'finalMoisture', label: 'Final Moisture (%)', type: 'number' },
      { key: 'cupScore', label: 'Cup Score', type: 'number', showInList: true },
      { key: 'cuppingNotes', label: 'Cupping Notes', type: 'textarea' },
      { key: 'qcApprovedBy', label: 'QC Approved By', type: 'text', showInList: true },
      { key: 'qcApprovalDate', label: 'QC Approval Date', type: 'date' },
    ],
    listKeys: ['inputWeight', 'finalOutputWeight', 'overallOutturn', 'costPerKg', 'cupScore', 'qcApprovedBy'],
  },
}

// Stage type -> view name mapping for navigation
const STAGE_VIEW_MAP: Record<string, { list: ViewName; form: ViewName }> = {
  CLEANING_WASHING: { list: 'ps-cleaning-washing', form: 'ps-cleaning-washing-form' },
  DEPULPING_FERMENTATION: { list: 'ps-depulping-fermentation', form: 'ps-depulping-fermentation-form' },
  DRYING_HULLING: { list: 'ps-drying-hulling', form: 'ps-drying-hulling-form' },
  GRADING_SORTING: { list: 'ps-grading-sorting', form: 'ps-grading-sorting-form' },
  ROASTING_BLENDING: { list: 'ps-roasting-blending', form: 'ps-roasting-blending-form' },
  GRINDING_PACKAGING: { list: 'ps-grinding-packaging', form: 'ps-grinding-packaging-form' },
  QUALITY_CONTROL: { list: 'ps-quality-control', form: 'ps-quality-control-form' },
}

const ALL_STAGE_TYPES = Object.keys(STAGE_FIELDS)

// ====================== GENERIC LIST VIEW ======================

function ProcessingStageListView({ stageType, stageLabel }: { stageType: string; stageLabel: string }) {
  const { selectedModule, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [records, setRecords] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterBatchId, setFilterBatchId] = useState('')

  const fields = STAGE_FIELDS[stageType]
  const listKeys = fields?.listKeys || []

  useEffect(() => {
    if (!selectedModule) return
    getProcessingStages(selectedModule.id, stageType, filterBatchId || undefined)
      .then(data => {
        setRecords(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => { setRecords([]); setLoading(false) })
  }, [selectedModule, stageType, filterBatchId])

  const filtered = records.filter(r =>
    r.batchId.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try {
      await deleteProcessingStage(id)
      toast({ title: 'Record deleted' })
      setRecords(records.filter(r => r.id !== id))
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    }
  }

  const formViewName = STAGE_VIEW_MAP[stageType]?.form || 'ps-cleaning-washing-form'

  const getCellValue = (record: any, key: string) => {
    const val = record.stageData?.[key]
    if (val === undefined || val === null || val === '') return '-'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      try {
        const d = new Date(val)
        return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString()
      } catch { return String(val) }
    }
    return String(val)
  }

  return (
    <AnimatedPage viewKey={`ps-${stageType}`}>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">{stageLabel} ({records.length})</h2>
              <p className="text-sm text-muted-foreground">Processing pipeline stage records</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 4px 16px -2px rgba(4,120,87,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-md bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-sm font-medium text-white transition-colors"
              onClick={() => { setSelectedRecord(null); setCurrentView(formViewName) }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Record
            </motion.button>
          </div>
        </FadeIn>

        {/* Search / Filter */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Batch ID..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Input placeholder="Filter by Batch ID" className="sm:w-64" value={filterBatchId} onChange={e => setFilterBatchId(e.target.value)} />
          </div>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.2}>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900/80 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium min-w-[160px]">Batch ID</th>
                      {listKeys.map(key => {
                        const field = fields?.fields.find(f => f.key === key)
                        return (
                          <th key={key} className="text-left p-3 font-medium min-w-[120px]">
                            {field?.label || key}
                          </th>
                        )
                      })}
                      <th className="text-left p-3 font-medium">Notes</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(record => (
                      <tr key={record.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                        <td className="p-3">
                          <button
                            onClick={() => { setFilterBatchId(record.batchId) }}
                            className="text-emerald-700 hover:text-emerald-900 font-mono text-xs font-medium flex items-center gap-1 hover:underline"
                          >
                            <Link2 className="h-3 w-3" />
                            {record.batchId}
                          </button>
                        </td>
                        {listKeys.map(key => (
                          <td key={key} className="p-3 text-xs">
                            {getCellValue(record, key)}
                          </td>
                        ))}
                        <td className="p-3 text-xs max-w-[150px] truncate">{record.notes || '-'}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
                              onClick={() => { setSelectedRecord(record); setCurrentView(formViewName) }}
                            >
                              <Pencil className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={listKeys.length + 3} className="p-8 text-center text-muted-foreground">
                          <ScaleIn>
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-3xl">📋</div>
                              <span>No records found. Click &quot;Add Record&quot; to create one.</span>
                            </div>
                          </ScaleIn>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

// ====================== GENERIC FORM VIEW ======================

function ProcessingStageFormView({ stageType, stageLabel }: { stageType: string; stageLabel: string }) {
  const { selectedModule, selectedRecord, setCurrentView, setSelectedRecord } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const fields = STAGE_FIELDS[stageType]?.fields || []

  const [form, setForm] = useState<any>({
    batchId: '',
    notes: '',
    recordedBy: '',
  })
  const [stageData, setStageData] = useState<any>({})

  useEffect(() => {
    if (selectedRecord) {
      setForm({
        batchId: selectedRecord.batchId || '',
        notes: selectedRecord.notes || '',
        recordedBy: selectedRecord.recordedBy || '',
      })
      setStageData(selectedRecord.stageData || {})
    }
  }, [selectedRecord])

  const handleStageDataChange = (key: string, value: any) => {
    setStageData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModule) return
    setLoading(true)
    try {
      const payload = {
        moduleId: selectedModule.id,
        batchId: form.batchId,
        stageType,
        stageData,
        notes: form.notes || null,
        recordedBy: form.recordedBy || null,
      }

      if (selectedRecord) {
        await updateProcessingStage(selectedRecord.id, payload)
        toast({ title: `${stageLabel} record updated` })
      } else {
        await createProcessingStage(payload)
        toast({ title: `${stageLabel} record created` })
      }
      setSelectedRecord(null)
      setCurrentView(STAGE_VIEW_MAP[stageType]?.list || 'ps-cleaning-washing')
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const backView = STAGE_VIEW_MAP[stageType]?.list || 'ps-cleaning-washing'

  const renderField = (field: FieldDef) => {
    const val = stageData[field.key]

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-1">
            <Label>{field.label}</Label>
            <Input type="text" value={val || ''} onChange={e => handleStageDataChange(field.key, e.target.value)} />
          </div>
        )
      case 'number':
        return (
          <div className="space-y-1">
            <Label>{field.label}</Label>
            <Input type="number" step="any" value={val ?? ''} onChange={e => handleStageDataChange(field.key, e.target.value === '' ? '' : parseFloat(e.target.value))} />
          </div>
        )
      case 'datetime':
        return (
          <div className="space-y-1">
            <Label>{field.label}</Label>
            <Input type="datetime-local" value={val ? val.substring(0, 16) : ''} onChange={e => handleStageDataChange(field.key, e.target.value)} />
          </div>
        )
      case 'date':
        return (
          <div className="space-y-1">
            <Label>{field.label}</Label>
            <Input type="date" value={val || ''} onChange={e => handleStageDataChange(field.key, e.target.value)} />
          </div>
        )
      case 'select':
        return (
          <div className="space-y-1">
            <Label>{field.label}</Label>
            <Select value={val || ''} onValueChange={v => handleStageDataChange(field.key, v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case 'textarea':
        return (
          <div className="space-y-1">
            <Label>{field.label}</Label>
            <Textarea value={val || ''} onChange={e => handleStageDataChange(field.key, e.target.value)} rows={3} />
          </div>
        )
      case 'boolean':
        return (
          <div className="flex items-center gap-3 pt-6">
            <Switch checked={!!val} onCheckedChange={v => handleStageDataChange(field.key, v)} />
            <Label>{field.label}</Label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <AnimatedPage viewKey={`ps-${stageType}-form`}>
      <div className="p-4 md:p-6">
        {/* Back + Title */}
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(null); setCurrentView(backView) }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h2 className="text-xl font-bold">{selectedRecord ? `Edit ${stageLabel}` : `New ${stageLabel} Record`}</h2>
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* Batch Traceability */}
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-emerald-600" />
                  Batch Traceability
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Batch ID <span className="text-red-500">*</span></Label>
                  <Input type="text" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} placeholder="e.g. BATCH-2026-001" required />
                </div>
                <div className="space-y-1">
                  <Label>Recorded By</Label>
                  <Input type="text" value={form.recordedBy} onChange={e => setForm({ ...form, recordedBy: e.target.value })} placeholder="Operator name" />
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Stage-specific fields */}
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{stageLabel} Details</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : field.type === 'boolean' ? '' : ''}>
                    {renderField(field)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Notes */}
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any additional notes or observations..." />
              </CardContent>
            </Card>
          </FadeIn>

          {/* Submit */}
          <FadeIn delay={0.4}>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 4px 16px -2px rgba(4,120,87,0.4)' }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || !form.batchId}
                className="inline-flex items-center justify-center rounded-md bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                {loading ? 'Saving...' : selectedRecord ? 'Update Record' : 'Create Record'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => { setSelectedRecord(null); setCurrentView(backView) }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </FadeIn>
        </form>
      </div>
    </AnimatedPage>
  )
}

// ====================== STAGE WRAPPER COMPONENTS ======================

export function CleaningListView() { return <ProcessingStageListView stageType="CLEANING_WASHING" stageLabel="Cleaning & Washing" /> }
export function CleaningFormView() { return <ProcessingStageFormView stageType="CLEANING_WASHING" stageLabel="Cleaning & Washing" /> }

export function DepulpingListView() { return <ProcessingStageListView stageType="DEPULPING_FERMENTATION" stageLabel="Depulping & Fermentation" /> }
export function DepulpingFormView() { return <ProcessingStageFormView stageType="DEPULPING_FERMENTATION" stageLabel="Depulping & Fermentation" /> }

export function DryingListView() { return <ProcessingStageListView stageType="DRYING_HULLING" stageLabel="Drying & Hulling" /> }
export function DryingFormView() { return <ProcessingStageFormView stageType="DRYING_HULLING" stageLabel="Drying & Hulling" /> }

export function GradingListView() { return <ProcessingStageListView stageType="GRADING_SORTING" stageLabel="Grading & Sorting" /> }
export function GradingFormView() { return <ProcessingStageFormView stageType="GRADING_SORTING" stageLabel="Grading & Sorting" /> }

export function RoastingListView() { return <ProcessingStageListView stageType="ROASTING_BLENDING" stageLabel="Roasting & Blending" /> }
export function RoastingFormView() { return <ProcessingStageFormView stageType="ROASTING_BLENDING" stageLabel="Roasting & Blending" /> }

export function GrindingListView() { return <ProcessingStageListView stageType="GRINDING_PACKAGING" stageLabel="Grinding & Packaging" /> }
export function GrindingFormView() { return <ProcessingStageFormView stageType="GRINDING_PACKAGING" stageLabel="Grinding & Packaging" /> }

export function QcSummaryListView() { return <ProcessingStageListView stageType="QUALITY_CONTROL" stageLabel="Quality Control" /> }
export function QcSummaryFormView() { return <ProcessingStageFormView stageType="QUALITY_CONTROL" stageLabel="Quality Control" /> }

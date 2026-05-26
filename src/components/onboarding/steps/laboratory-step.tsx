'use client'

import { FlaskConical, Microscope, Beaker } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, LaboratoryData } from '../types'

const TEST_CAPABILITIES = [
  'Moisture Content', 'Density Analysis', 'Cup Score / Sensory Evaluation',
  'Defect Count', 'Screen Size / Grading', 'Aflatoxin Testing',
  'Ochratoxin Testing', 'Pesticide Residue', 'Heavy Metals',
  'Microbiological Analysis', 'Caffeine Content', 'Chlorogenic Acids',
  'Mycotoxin Screening', 'Water Activity', 'Color Analysis'
]

const EQUIPMENT_TYPES = [
  'Moisture Meter', 'Colorimeter', 'Spectrophotometer', 'HPLC',
  'GC-MS', 'NIR Analyzer', 'Density Gradient Column', 'Cupping Lab',
  'Roasting Equipment (Sample)', 'Grading Sieves', 'pH Meter', 'Water Activity Meter'
]

export function LaboratoryStep({ data, onChange }: StepProps<LaboratoryData>) {
  const update = (field: keyof LaboratoryData, value: string | string[]) => {
    onChange({ [field]: value })
  }

  const toggleCapability = (cap: string) => {
    const current = data.testCapabilities || []
    if (current.includes(cap)) {
      update('testCapabilities', current.filter((c) => c !== cap))
    } else {
      update('testCapabilities', [...current, cap])
    }
  }

  const toggleEquipment = (eq: string) => {
    const current = data.equipmentTypes || []
    if (current.includes(eq)) {
      update('equipmentTypes', current.filter((e) => e !== eq))
    } else {
      update('equipmentTypes', [...current, eq])
    }
  }

  return (
    <div className="space-y-6">
      {/* Lab Accreditation */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Lab Accreditation</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Provide your laboratory accreditation details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labAccreditation" className="text-coffee-700 text-sm font-medium">
                Accreditation Standard <span className="text-red-500">*</span>
              </Label>
              <Input
                id="labAccreditation"
                value={data.labAccreditation}
                onChange={(e) => update('labAccreditation', e.target.value)}
                placeholder="e.g. ISO 17025:2017"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accreditationNumber" className="text-coffee-700 text-sm font-medium">
                Accreditation Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accreditationNumber"
                value={data.accreditationNumber}
                onChange={(e) => update('accreditationNumber', e.target.value)}
                placeholder="e.g. LAB-2024-00891"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accreditationExpiry" className="text-coffee-700 text-sm font-medium">
                Accreditation Expiry Date
              </Label>
              <Input
                id="accreditationExpiry"
                type="date"
                value={data.accreditationExpiry}
                onChange={(e) => update('accreditationExpiry', e.target.value)}
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sampleCapacity" className="text-coffee-700 text-sm font-medium">
                Monthly Sample Capacity
              </Label>
              <Input
                id="sampleCapacity"
                value={data.sampleCapacity}
                onChange={(e) => update('sampleCapacity', e.target.value)}
                placeholder="e.g. 500"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Capabilities */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center shadow-sm">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Test Capabilities</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select the tests your laboratory can perform.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TEST_CAPABILITIES.map((cap) => (
              <label
                key={cap}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.testCapabilities?.includes(cap) || false}
                  onCheckedChange={() => toggleCapability(cap)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {cap}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-300 to-coffee-500 flex items-center justify-center shadow-sm">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Lab Equipment</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select the equipment available in your laboratory.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EQUIPMENT_TYPES.map((eq) => (
              <label
                key={eq}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.equipmentTypes?.includes(eq) || false}
                  onCheckedChange={() => toggleEquipment(eq)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {eq}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

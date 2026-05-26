'use client'

import { Factory, Warehouse, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, AggregatorData } from '../types'

const PROCESSING_METHODS = [
  'Washed / Wet', 'Natural / Dry', 'Honey / Pulped Natural', 'Semi-washed / Wet-hulled', 'Anaerobic', 'Carbonic Maceration'
]

const CERTIFICATION_OPTIONS = [
  'Organic', 'Fair Trade', 'Rainforest Alliance', 'UTZ', '4C', 'C.A.F.E. Practices', 'ISO 22000', 'FSSC 22000'
]

export function AggregatorStep({ data, onChange }: StepProps<AggregatorData>) {
  const update = (field: keyof AggregatorData, value: string | string[]) => {
    onChange({ [field]: value })
  }

  const toggleCertification = (cert: string) => {
    const current = data.certifications || []
    if (current.includes(cert)) {
      update('certifications', current.filter((c) => c !== cert))
    } else {
      update('certifications', [...current, cert])
    }
  }

  const toggleProcessingMethod = (method: string) => {
    const current = data.processingMethods || []
    if (current.includes(method)) {
      update('processingMethods', current.filter((m) => m !== method))
    } else {
      update('processingMethods', [...current, method])
    }
  }

  return (
    <div className="space-y-6">
      {/* Processing Capacity */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Processing Details</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Describe your processing capabilities and methods.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processingCapacity" className="text-coffee-700 text-sm font-medium">
                Processing Capacity (metric tons/year) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="processingCapacity"
                value={data.processingCapacity}
                onChange={(e) => update('processingCapacity', e.target.value)}
                placeholder="e.g. 5000"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionCentreCount" className="text-coffee-700 text-sm font-medium">
                Number of Collection Centres
              </Label>
              <Input
                id="collectionCentreCount"
                value={data.collectionCentreCount}
                onChange={(e) => update('collectionCentreCount', e.target.value)}
                placeholder="e.g. 12"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Processing Methods */}
          <div className="space-y-3">
            <Label className="text-coffee-700 text-sm font-medium">Processing Methods</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PROCESSING_METHODS.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
                >
                  <Checkbox
                    checked={data.processingMethods?.includes(method) || false}
                    onCheckedChange={() => toggleProcessingMethod(method)}
                    className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Centres */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center shadow-sm">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Primary Collection Centre</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Register your main collection point.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mainCollectionCentreName" className="text-coffee-700 text-sm font-medium">
              Centre Name
            </Label>
            <Input
              id="mainCollectionCentreName"
              value={data.mainCollectionCentreName}
              onChange={(e) => update('mainCollectionCentreName', e.target.value)}
              placeholder="e.g. Cooxupe Main Processing Centre"
              className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainCollectionCentreAddress" className="text-coffee-700 text-sm font-medium">
              Centre Address
            </Label>
            <Input
              id="mainCollectionCentreAddress"
              value={data.mainCollectionCentreAddress}
              onChange={(e) => update('mainCollectionCentreAddress', e.target.value)}
              placeholder="e.g. Rod. MG 260, Km 8, Guaxupe - MG"
              className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-300 to-coffee-500 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Certifications</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select certifications your organization holds.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CERTIFICATION_OPTIONS.map((cert) => (
              <label
                key={cert}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.certifications?.includes(cert) || false}
                  onCheckedChange={() => toggleCertification(cert)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {cert}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

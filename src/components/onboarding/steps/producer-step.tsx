'use client'

import { Sprout, MapPin, Users, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, ProducerData } from '../types'

const CERTIFICATION_OPTIONS = [
  'Organic', 'Fair Trade', 'Rainforest Alliance', 'UTZ', '4C', 'C.A.F.E. Practices', 'Bird Friendly', 'Smithsonian Migratory Bird Center'
]

const PROCESSING_METHODS = [
  'Washed / Wet', 'Natural / Dry', 'Honey / Pulped Natural', 'Semi-washed / Wet-hulled', 'Anaerobic', 'Carbonic Maceration'
]

export function ProducerStep({ data, onChange }: StepProps<ProducerData>) {
  const update = (field: keyof ProducerData, value: string | string[]) => {
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

  return (
    <div className="space-y-6">
      {/* Farm Details */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Farm Details</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Tell us about your primary farm operations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmName" className="text-coffee-700 text-sm font-medium">
                Primary Farm Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="farmName"
                value={data.farmName}
                onChange={(e) => update('farmName', e.target.value)}
                placeholder="e.g. Dak Lak Highland Farm"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmSize" className="text-coffee-700 text-sm font-medium">
                Total Farm Area (hectares)
              </Label>
              <Input
                id="farmSize"
                value={data.farmSize}
                onChange={(e) => update('farmSize', e.target.value)}
                placeholder="e.g. 50"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altitude" className="text-coffee-700 text-sm font-medium">
                Average Altitude (meters)
              </Label>
              <Input
                id="altitude"
                value={data.altitude}
                onChange={(e) => update('altitude', e.target.value)}
                placeholder="e.g. 1200"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coffeeVarieties" className="text-coffee-700 text-sm font-medium">
                Coffee Varieties Grown
              </Label>
              <Input
                id="coffeeVarieties"
                value={data.coffeeVarieties}
                onChange={(e) => update('coffeeVarieties', e.target.value)}
                placeholder="e.g. Robusta, Catimor, Bourbon"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Processing Methods */}
          <div className="space-y-3">
            <Label className="text-coffee-700 text-sm font-medium">Processing Methods Used</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PROCESSING_METHODS.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
                >
                  <Checkbox
                    checked={data.processingMethods?.includes(method) || false}
                    onCheckedChange={() => {
                      const current = data.processingMethods ? data.processingMethods.split(',').map(s => s.trim()) : []
                      const updated = current.includes(method)
                        ? current.filter((m) => m !== method)
                        : [...current, method]
                      update('processingMethods', updated.join(', '))
                    }}
                    className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <Label className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Certifications Held
            </Label>
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
          </div>
        </CardContent>
      </Card>

      {/* First Farmer */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">First Farmer</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Register your first farmer to get started quickly.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstFarmerName" className="text-coffee-700 text-sm font-medium">
                Farmer Full Name
              </Label>
              <Input
                id="firstFarmerName"
                value={data.firstFarmerName}
                onChange={(e) => update('firstFarmerName', e.target.value)}
                placeholder="e.g. Nguyen Van Minh"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstFarmerPhone" className="text-coffee-700 text-sm font-medium">
                Contact Number
              </Label>
              <Input
                id="firstFarmerPhone"
                value={data.firstFarmerPhone}
                onChange={(e) => update('firstFarmerPhone', e.target.value)}
                placeholder="e.g. +84 912 345 678"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstFarmerVillage" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Village / Commune
            </Label>
            <Input
              id="firstFarmerVillage"
              value={data.firstFarmerVillage}
              onChange={(e) => update('firstFarmerVillage', e.target.value)}
              placeholder="e.g. Ea Kao Commune, Buon Ma Thuot"
              className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

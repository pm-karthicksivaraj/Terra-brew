'use client'

import { Ship, Globe, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, ExporterData } from '../types'

const DESTINATION_COUNTRIES = [
  'Germany', 'Netherlands', 'Belgium', 'Italy', 'France', 'Spain', 'United Kingdom',
  'United States', 'Japan', 'South Korea', 'Australia', 'Canada', 'Sweden', 'Norway', 'Other'
]

const COFFEE_TYPES = [
  'Green Arabica', 'Green Robusta', 'Roasted Whole Bean', 'Roasted Ground',
  'Instant / Soluble', 'Decaf', 'Specialty / Single Origin', 'Blends'
]

export function ExporterStep({ data, onChange }: StepProps<ExporterData>) {
  const update = (field: keyof ExporterData, value: string | string[]) => {
    onChange({ [field]: value })
  }

  const toggleDestination = (country: string) => {
    const current = data.destinationCountries || []
    if (current.includes(country)) {
      update('destinationCountries', current.filter((c) => c !== country))
    } else {
      update('destinationCountries', [...current, country])
    }
  }

  const toggleCoffeeType = (type: string) => {
    const current = data.primaryCoffeeTypes || []
    if (current.includes(type)) {
      update('primaryCoffeeTypes', current.filter((t) => t !== type))
    } else {
      update('primaryCoffeeTypes', [...current, type])
    }
  }

  return (
    <div className="space-y-6">
      {/* Export License */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Export Licenses</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Provide your export license information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exportLicenseNumber" className="text-coffee-700 text-sm font-medium">
                Export License Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="exportLicenseNumber"
                value={data.exportLicenseNumber}
                onChange={(e) => update('exportLicenseNumber', e.target.value)}
                placeholder="e.g. EXP-2024-001234"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate" className="text-coffee-700 text-sm font-medium">
                License Expiry Date
              </Label>
              <Input
                id="licenseExpiryDate"
                type="date"
                value={data.licenseExpiryDate}
                onChange={(e) => update('licenseExpiryDate', e.target.value)}
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualExportVolume" className="text-coffee-700 text-sm font-medium">
                Annual Export Volume (metric tons)
              </Label>
              <Input
                id="annualExportVolume"
                value={data.annualExportVolume}
                onChange={(e) => update('annualExportVolume', e.target.value)}
                placeholder="e.g. 10000"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portOfExport" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5" />
                Port of Export
              </Label>
              <Input
                id="portOfExport"
                value={data.portOfExport}
                onChange={(e) => update('portOfExport', e.target.value)}
                placeholder="e.g. Port of Rotterdam"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination Countries */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Destination Countries</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select the countries you export coffee to.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DESTINATION_COUNTRIES.map((country) => (
              <label
                key={country}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.destinationCountries?.includes(country) || false}
                  onCheckedChange={() => toggleDestination(country)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {country}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coffee Types */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-coffee-900 text-lg">Primary Coffee Types Exported</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COFFEE_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.primaryCoffeeTypes?.includes(type) || false}
                  onCheckedChange={() => toggleCoffeeType(type)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {type}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

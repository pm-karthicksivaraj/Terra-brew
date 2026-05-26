'use client'

import { Building2, Globe, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, ImporterData } from '../types'

const SOURCE_COUNTRIES = [
  'Vietnam', 'Brazil', 'Ethiopia', 'Kenya', 'Colombia', 'Indonesia',
  'Honduras', 'Peru', 'Uganda', 'India', 'Rwanda', 'Tanzania', 'Guatemala', 'Other'
]

const COMPLIANCE_NEEDS = [
  'EUDR Due Diligence', 'EU Food Safety (EFSA)', 'EU Organic Equivalence',
  'Fair Trade Verification', 'Rainforest Alliance Chain of Custody',
  'Deforestation Risk Assessment', 'Carbon Footprint Reporting', 'Customs & Tariff Management'
]

export function ImporterStep({ data, onChange }: StepProps<ImporterData>) {
  const update = (field: keyof ImporterData, value: string | string[]) => {
    onChange({ [field]: value })
  }

  const toggleSourceCountry = (country: string) => {
    const current = data.sourceCountries || []
    if (current.includes(country)) {
      update('sourceCountries', current.filter((c) => c !== country))
    } else {
      update('sourceCountries', [...current, country])
    }
  }

  const toggleComplianceNeed = (need: string) => {
    const current = data.complianceNeeds || []
    if (current.includes(need)) {
      update('complianceNeeds', current.filter((n) => n !== need))
    } else {
      update('complianceNeeds', [...current, need])
    }
  }

  return (
    <div className="space-y-6">
      {/* EU EORI & Import Details */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Import Registration</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Provide your EU import registration details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eoriNumber" className="text-coffee-700 text-sm font-medium">
                EU EORI Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eoriNumber"
                value={data.eoriNumber}
                onChange={(e) => update('eoriNumber', e.target.value)}
                placeholder="e.g. NL123456789"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
              <p className="text-xs text-coffee-400">
                Economic Operator Registration and Identification number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="importVolumeAnnual" className="text-coffee-700 text-sm font-medium">
                Annual Import Volume (metric tons)
              </Label>
              <Input
                id="importVolumeAnnual"
                value={data.importVolumeAnnual}
                onChange={(e) => update('importVolumeAnnual', e.target.value)}
                placeholder="e.g. 5000"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseLocations" className="text-coffee-700 text-sm font-medium">
                Warehouse Location(s)
              </Label>
              <Input
                id="warehouseLocations"
                value={data.warehouseLocations}
                onChange={(e) => update('warehouseLocations', e.target.value)}
                placeholder="e.g. Rotterdam, Hamburg"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distributionRegions" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Distribution Regions
              </Label>
              <Input
                id="distributionRegions"
                value={data.distributionRegions}
                onChange={(e) => update('distributionRegions', e.target.value)}
                placeholder="e.g. Western Europe, Nordics"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Countries */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Source Countries</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select the countries you import coffee from.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SOURCE_COUNTRIES.map((country) => (
              <label
                key={country}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.sourceCountries?.includes(country) || false}
                  onCheckedChange={() => toggleSourceCountry(country)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {country}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Needs */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-300 to-coffee-500 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Compliance Needs</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select compliance areas where you need support.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {COMPLIANCE_NEEDS.map((need) => (
              <label
                key={need}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.complianceNeeds?.includes(need) || false}
                  onCheckedChange={() => toggleComplianceNeed(need)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {need}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

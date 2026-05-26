'use client'

import { Award, Users, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, CertificationBodyData } from '../types'

const CERTIFICATION_STANDARDS = [
  'Organic (EU)', 'Organic (USDA NOP)', 'Fair Trade (FLO)', 'Rainforest Alliance',
  'UTZ', '4C Code of Conduct', 'C.A.F.E. Practices', 'Bird Friendly',
  'Demeter Biodynamic', 'ISO 17065', 'ISO 17020', 'ISO 19011'
]

const GEOGRAPHIC_COVERAGE = [
  'Vietnam', 'Brazil', 'Ethiopia', 'Kenya', 'Colombia', 'Indonesia',
  'Central America', 'East Africa', 'West Africa', 'Southeast Asia',
  'South America', 'Global'
]

export function CertificationStep({ data, onChange }: StepProps<CertificationBodyData>) {
  const update = (field: keyof CertificationBodyData, value: string | string[]) => {
    onChange({ [field]: value })
  }

  const toggleStandard = (standard: string) => {
    const current = data.certificationStandards || []
    if (current.includes(standard)) {
      update('certificationStandards', current.filter((s) => s !== standard))
    } else {
      update('certificationStandards', [...current, standard])
    }
  }

  const toggleCoverage = (region: string) => {
    const current = data.geographicCoverage || []
    if (current.includes(region)) {
      update('geographicCoverage', current.filter((r) => r !== region))
    } else {
      update('geographicCoverage', [...current, region])
    }
  }

  return (
    <div className="space-y-6">
      {/* Accreditation Details */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Accreditation Details</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Provide your certifying body accreditation information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accreditationBody" className="text-coffee-700 text-sm font-medium">
                Accreditation Body <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accreditationBody"
                value={data.accreditationBody}
                onChange={(e) => update('accreditationBody', e.target.value)}
                placeholder="e.g. ISO, ASCEN, DAkks"
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
                placeholder="e.g. CB-2024-00567"
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
              <Label htmlFor="inspectorCount" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Number of Certified Inspectors
              </Label>
              <Input
                id="inspectorCount"
                value={data.inspectorCount}
                onChange={(e) => update('inspectorCount', e.target.value)}
                placeholder="e.g. 15"
                type="number"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certification Standards */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-coffee-900 text-lg">Certification Standards</CardTitle>
          <CardDescription className="text-coffee-500 text-sm">
            Select the standards you are authorized to certify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CERTIFICATION_STANDARDS.map((standard) => (
              <label
                key={standard}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.certificationStandards?.includes(standard) || false}
                  onCheckedChange={() => toggleStandard(standard)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {standard}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Coverage */}
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Geographic Coverage</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Select the regions where you operate.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {GEOGRAPHIC_COVERAGE.map((region) => (
              <label
                key={region}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200/60 bg-coffee-50/30 hover:bg-coffee-100/50 cursor-pointer transition-colors text-sm text-coffee-700"
              >
                <Checkbox
                  checked={data.geographicCoverage?.includes(region) || false}
                  onCheckedChange={() => toggleCoverage(region)}
                  className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                />
                {region}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

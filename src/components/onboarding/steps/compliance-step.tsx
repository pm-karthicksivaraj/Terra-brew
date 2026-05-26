'use client'

import { Shield, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { StepProps, ComplianceData } from '../types'

export function ComplianceStep({ data, onChange }: StepProps<ComplianceData>) {
  const update = (field: keyof ComplianceData, value: boolean | string) => {
    onChange({ [field]: value })
  }

  const questions = [
    {
      id: 'exportsToEU' as const,
      label: 'Does your organization export coffee to the European Union?',
      description: 'This includes direct exports or supplying to entities that export to the EU.',
      icon: Shield,
    },
    {
      id: 'eudrAware' as const,
      label: 'Are you aware of the EU Deforestation Regulation (EUDR)?',
      description: 'The EUDR requires due diligence to ensure products are not linked to deforestation.',
      icon: AlertTriangle,
    },
    {
      id: 'hasDueDiligenceProcess' as const,
      label: 'Do you have a due diligence process in place?',
      description: 'A formal process for assessing and mitigating deforestation risk in your supply chain.',
      icon: CheckCircle2,
    },
    {
      id: 'hasGeolocationData' as const,
      label: 'Do you have GPS/geolocation data for your farm plots or supply sources?',
      description: 'Required for EUDR compliance — geolocation of all production areas.',
      icon: CheckCircle2,
    },
    {
      id: 'deforestationRiskAssessed' as const,
      label: 'Has a deforestation risk assessment been conducted?',
      description: 'Assessment of whether production areas overlap with recently deforested land.',
      icon: CheckCircle2,
    },
    {
      id: 'traceabilitySystemInPlace' as const,
      label: 'Do you have a traceability system for your supply chain?',
      description: 'A system to trace coffee from farm to export, tracking all intermediaries.',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">EUDR Readiness Assessment</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Help us understand your current compliance status with the EU Deforestation Regulation.
                This will help us tailor your dashboard and compliance tools.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, idx) => {
            const Icon = q.icon
            return (
              <div
                key={q.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-coffee-200/60 bg-coffee-50/20 hover:bg-coffee-50/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-coffee-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-coffee-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-coffee-800 text-sm font-medium cursor-pointer" htmlFor={q.id}>
                    {q.label}
                  </Label>
                  <p className="text-coffee-500 text-xs">{q.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <label
                    htmlFor={q.id}
                    className="flex items-center gap-1.5 cursor-pointer text-xs text-coffee-500"
                  >
                    <Checkbox
                      id={q.id}
                      checked={data[q.id] as boolean}
                      onCheckedChange={(checked) => update(q.id, checked === true)}
                      className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600"
                    />
                    Yes
                  </label>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card className="border-coffee-200/60 bg-gradient-to-br from-coffee-50 to-amber-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Need Help with EUDR Compliance?</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Terra Brew can guide you through every step of the compliance process.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="needsHelp"
            className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-coffee-50/50 transition-colors"
          >
            <Checkbox
              id="needsHelp"
              checked={data.needsHelp}
              onCheckedChange={(checked) => update('needsHelp', checked === true)}
              className="border-coffee-300 data-[state=checked]:bg-coffee-600 data-[state=checked]:border-coffee-600 mt-0.5"
            />
            <div>
              <p className="text-coffee-700 text-sm font-medium">
                I would like guidance on EUDR compliance
              </p>
              <p className="text-coffee-500 text-xs mt-1">
                We&apos;ll set up your dashboard with EUDR compliance tools, risk assessment guides, and step-by-step walkthroughs to help you meet the regulatory requirements.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>
    </div>
  )
}

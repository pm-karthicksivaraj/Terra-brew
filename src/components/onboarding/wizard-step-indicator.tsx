'use client'

import { CheckCircle2 } from 'lucide-react'

export interface WizardStepIndicatorProps {
  current: number
  total: number
  labels: string[]
}

export function WizardStepIndicator({ current, total, labels }: WizardStepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 shrink-0 ${
                i < current
                  ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                  : i === current
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] hidden sm:inline truncate transition-colors ${
                i === current ? 'font-bold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-green-500' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default WizardStepIndicator

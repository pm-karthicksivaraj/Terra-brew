'use client'

import { Check } from 'lucide-react'
import { useI18n } from '@/i18n'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  const { t2 } = useI18n()

  return (
    <div className="w-full">
      {/* Step counter text */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#6D2932]/70">
          {t2(`Bước ${currentStep} / ${totalSteps}`, `Step ${currentStep} of ${totalSteps}`)}
        </p>
        <p className="text-xs text-[#6D2932]/50">
          {stepLabels[currentStep - 1] || ''}
        </p>
      </div>

      {/* Progress bar background */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep
          const isPending = stepNum > currentStep

          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0
                  ${isCompleted
                    ? 'bg-[#6D2932] text-[#E8D8C4] shadow-md shadow-[#6D2932]/20'
                    : isActive
                      ? 'bg-[#561C24] text-[#E8D8C4] ring-2 ring-[#C7B7A3] ring-offset-2 ring-offset-white shadow-lg shadow-[#561C24]/20'
                      : 'bg-[#E8D8C4]/60 text-[#6D2932]/40 border border-[#C7B7A3]/50'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNum
                )}
              </div>

              {/* Connecting line */}
              {stepNum < totalSteps && (
                <div className="flex-1 h-0.5 mx-1.5 relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-[#C7B7A3]/40" />
                  <div
                    className="absolute inset-y-0 left-0 bg-[#6D2932] rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels row */}
      <div className="flex items-start gap-2 mt-2">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <div key={stepNum} className="flex-1 last:flex-none">
              <p
                className={`
                  text-[10px] leading-tight transition-colors duration-300 truncate
                  ${isCompleted
                    ? 'text-[#6D2932] font-medium'
                    : isActive
                      ? 'text-[#561C24] font-semibold'
                      : 'text-[#6D2932]/30'
                  }
                `}
              >
                {label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

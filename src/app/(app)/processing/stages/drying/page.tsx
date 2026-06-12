'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Sun } from 'lucide-react'

export default function DryingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'drying',
        labelVi: 'Qua trinh Say',
        labelEn: 'Drying Stage',
        icon: Sun,
        color: 'from-amber-500 to-amber-700',
      }}
    />
  )
}

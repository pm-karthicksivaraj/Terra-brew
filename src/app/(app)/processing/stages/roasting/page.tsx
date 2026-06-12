'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Flame } from 'lucide-react'

export default function RoastingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'roasting',
        labelVi: 'Qua trinh Rang',
        labelEn: 'Roasting Stage',
        icon: Flame,
        color: 'from-red-500 to-red-700',
      }}
    />
  )
}

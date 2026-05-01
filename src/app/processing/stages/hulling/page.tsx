'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Hammer } from 'lucide-react'

export default function HullingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'hulling',
        labelVi: 'Qua trinh Bachop',
        labelEn: 'Hulling Stage',
        icon: Hammer,
        color: 'from-orange-500 to-orange-700',
      }}
    />
  )
}

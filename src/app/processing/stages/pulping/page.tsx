'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Droplets } from 'lucide-react'

export default function PulpingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'pulping',
        labelVi: 'Qua trinh Xoac',
        labelEn: 'Pulping Stage',
        icon: Droplets,
        color: 'from-blue-500 to-blue-700',
      }}
    />
  )
}

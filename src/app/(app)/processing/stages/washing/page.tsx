'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Waves } from 'lucide-react'

export default function WashingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'washing',
        labelVi: 'Qua trinhRua',
        labelEn: 'Washing Stage',
        icon: Waves,
        color: 'from-sky-500 to-sky-700',
      }}
    />
  )
}

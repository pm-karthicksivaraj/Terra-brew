'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Beaker } from 'lucide-react'

export default function FermentationPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'fermentation',
        labelVi: 'Qua trinh Len men',
        labelEn: 'Fermentation Stage',
        icon: Beaker,
        color: 'from-purple-500 to-purple-700',
      }}
    />
  )
}

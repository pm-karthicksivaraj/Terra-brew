'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Filter } from 'lucide-react'

export default function SortingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'sorting',
        labelVi: 'Qua trinh Phan loai',
        labelEn: 'Sorting/Grading Stage',
        icon: Filter,
        color: 'from-cyan-500 to-cyan-700',
      }}
    />
  )
}

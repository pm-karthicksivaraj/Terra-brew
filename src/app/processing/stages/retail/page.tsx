'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Store } from 'lucide-react'

export default function RetailPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'retail',
        labelVi: 'Bán lẻ',
        labelEn: 'Retail Stage',
        icon: Store,
        color: 'from-rose-500 to-rose-700',
      }}
    />
  )
}

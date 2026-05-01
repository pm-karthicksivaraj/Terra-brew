'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Truck } from 'lucide-react'

export default function DistributionPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'distribution',
        labelVi: 'Quá trình Phân phối',
        labelEn: 'Distribution Stage',
        icon: Truck,
        color: 'from-orange-500 to-orange-700',
      }}
    />
  )
}

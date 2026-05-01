'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Package } from 'lucide-react'

export default function PackagingPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'packaging',
        labelVi: 'Quá trình Đóng gói',
        labelEn: 'Packaging Stage',
        icon: Package,
        color: 'from-teal-500 to-teal-700',
      }}
    />
  )
}

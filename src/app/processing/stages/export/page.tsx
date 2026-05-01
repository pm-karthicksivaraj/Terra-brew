'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Ship } from 'lucide-react'

export default function ExportPage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'export',
        labelVi: 'Quá trình Xuất khẩu',
        labelEn: 'Export Stage',
        icon: Ship,
        color: 'from-sky-500 to-sky-700',
      }}
    />
  )
}

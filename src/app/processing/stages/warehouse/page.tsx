'use client'

import { ProcessingStagePage } from '../stage-layout'
import { Warehouse } from 'lucide-react'

export default function WarehousePage() {
  return (
    <ProcessingStagePage
      config={{
        stageType: 'warehouse',
        labelVi: 'Quản lý Kho bãi',
        labelEn: 'Warehouse Stage',
        icon: Warehouse,
        color: 'from-slate-500 to-slate-700',
      }}
    />
  )
}

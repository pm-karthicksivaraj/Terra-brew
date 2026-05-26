'use client'

import { AdminDashboard } from './admin-dashboard'
import { OperationsDashboard } from './operations-dashboard'
import { FieldDashboard } from './field-dashboard'
import { QualityDashboard } from './quality-dashboard'
import { TraderDashboard } from './trader-dashboard'
import { FinanceDashboard } from './finance-dashboard'
import { ViewerDashboard } from './viewer-dashboard'

type Role = 'tenant_admin' | 'operations_manager' | 'field_officer' | 'quality_controller' | 'trader' | 'finance_manager' | 'viewer'
type EntityType = 'producer' | 'aggregator' | 'exporter' | 'importer' | 'certification_body' | 'laboratory'

interface DashboardRouterProps {
  role: string
  entityType: string
}

export function DashboardRouter({ role, entityType }: DashboardRouterProps) {
  switch (role as Role) {
    case 'tenant_admin':
      return <AdminDashboard />
    case 'operations_manager':
      return <OperationsDashboard />
    case 'field_officer':
      return <FieldDashboard />
    case 'quality_controller':
      return <QualityDashboard />
    case 'trader':
      return <TraderDashboard />
    case 'finance_manager':
      return <FinanceDashboard />
    case 'viewer':
      return <ViewerDashboard />
    default:
      // Fallback to viewer (least privileged) for unknown roles — security-first
      return <ViewerDashboard />
  }
}

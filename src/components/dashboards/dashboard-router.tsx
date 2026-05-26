'use client'

import { useSession } from 'next-auth/react'
import { Loader2, Coffee } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import AdminDashboard from '@/components/dashboards/admin-dashboard'
import FieldOfficerDashboard from '@/components/dashboards/field-officer-dashboard'
import QualityDashboard from '@/components/dashboards/quality-dashboard'
import TraderDashboard from '@/components/dashboards/trader-dashboard'
import FinanceDashboard from '@/components/dashboards/finance-dashboard'
import OperationsDashboard from '@/components/dashboards/operations-dashboard'

/**
 * Dashboard Router — renders the correct role-specific dashboard
 * based on the authenticated user's role.
 *
 * Role mapping:
 *   tenant_admin       → AdminDashboard (full overview)
 *   field_officer      → FieldOfficerDashboard (farm visits, crop alerts)
 *   quality_controller → QualityDashboard (inspections, cup scores, compliance)
 *   trader             → TraderDashboard (marketplace, RFQs, shipments)
 *   finance_manager    → FinanceDashboard (revenue, payments, billing)
 *   operations_manager → OperationsDashboard (processing, shipments, tasks)
 *   default/unknown    → AdminDashboard (fallback)
 */
export default function DashboardRouter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2 } = useI18n()

  // Loading state
  if (status === 'loading') {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading dashboard...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Not authenticated — redirect handled by parent page
  if (!session) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
            <span className="text-sm text-foreground">{t2('Đang chuyển hướng...', 'Redirecting...')}</span>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const role = session.user?.role || ''

  // Welcome header (shared across all dashboards)
  const userName = session.user?.name || 'User'
  const userRole = role.replace(/_/g, ' ')

  const renderDashboard = () => {
    switch (role) {
      case 'field_officer':
        return <FieldOfficerDashboard />
      case 'quality_controller':
        return <QualityDashboard />
      case 'trader':
        return <TraderDashboard />
      case 'finance_manager':
        return <FinanceDashboard />
      case 'operations_manager':
        return <OperationsDashboard />
      case 'tenant_admin':
      default:
        return <AdminDashboard />
    }
  }

  return (
    <DashboardShell>
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {t2(`Xin chào, ${userName}`, `Welcome back, ${userName}`)}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px] capitalize font-normal">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>

      {/* Role-specific dashboard */}
      {renderDashboard()}
    </DashboardShell>
  )
}

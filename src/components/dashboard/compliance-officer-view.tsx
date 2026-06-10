'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, AlertTriangle, CheckCircle, FileWarning, Clock,
  TreePine, MapPin, Satellite, FileCheck, Zap, ArrowRight,
  TrendingDown, TrendingUp, AlertOctagon, FileText, ChevronRight, Inbox,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import EudrComplianceScore from '@/components/compliance/eudr-compliance-score'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { DdsStatusWidget } from './dds-status-widget'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion'

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Inbox className="w-8 h-8 text-muted-foreground/40 mb-2" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  )
}

export function ComplianceOfficerView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const [eudrRecords, setEudrRecords] = useState<any[]>([])
  const [farmlands, setFarmlands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEudrCompliance = useCallback(async () => {
    try {
      const res = await fetch('/api/eudr-compliance?pageSize=20')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setEudrRecords(records)
      }
    } catch (err) {
      console.error('Failed to fetch EUDR compliance', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFarmlands = useCallback(async () => {
    try {
      const res = await fetch('/api/farmlands?pageSize=50')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setFarmlands(records)
      }
    } catch (err) {
      console.error('Failed to fetch farmlands', err)
    }
  }, [])

  useEffect(() => { fetchEudrCompliance(); fetchFarmlands() }, [fetchEudrCompliance, fetchFarmlands])

  // Compute pending DDS from real EUDR compliance data
  const pendingDds = eudrRecords
    .filter((r: any) => r.complianceStatus !== 'Compliant' && r.overallStatus !== 'Compliant')
    .slice(0, 6)
    .map((r: any) => ({
      id: r.id,
      farm: r.farmName || r.farmerName || r.entityName || `Record ${r.id}`,
      status: r.complianceStatus === 'Expired' || r.overallStatus === 'Expired' ? 'expired'
        : r.complianceStatus === 'Non-Compliant' || r.overallStatus === 'Non-Compliant' ? 'missing'
        : r.complianceStatus === 'Pending' || r.overallStatus === 'Pending Review' ? 'pending_review'
        : 'expiring',
      risk: (r.complianceStatus === 'Expired' || r.complianceStatus === 'Non-Compliant' || r.overallStatus === 'Expired' || r.overallStatus === 'Non-Compliant') ? 'high' : 'medium',
      daysSince: r.daysSinceUpdate || 0,
      reason: r.notes || r.observations || (r.complianceStatus || r.overallStatus || 'Status unknown'),
    }))

  // Compute risk alerts from EUDR records
  const riskAlerts = eudrRecords
    .filter((r: any) => r.complianceStatus === 'Non-Compliant' || r.overallStatus === 'Non-Compliant' || r.riskLevel === 'High')
    .slice(0, 5)
    .map((r: any, i: number) => ({
      id: r.id || String(i),
      severity: r.riskLevel === 'High' || r.complianceStatus === 'Non-Compliant' ? 'critical' : 'warning',
      message: `${r.farmName || r.farmerName || r.entityName || 'Entity'}: ${r.complianceStatus || r.overallStatus || 'Non-compliant'}`,
      time: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A',
      action: r.complianceStatus === 'Non-Compliant' ? 'Generate DDS' : 'View details',
    }))

  // Compute plot verification by province from farmlands
  const provinceMap = new Map<string, { total: number; verified: number }>()
  for (const fl of farmlands) {
    const prov = fl.province || fl.region || 'Unknown'
    const current = provinceMap.get(prov) || { total: 0, verified: 0 }
    current.total++
    if (fl.gpsVerified || fl.isGpsVerified || fl.verificationStatus === 'Verified') {
      current.verified++
    }
    provinceMap.set(prov, current)
  }
  const plotVerification = Array.from(provinceMap.entries()).map(([province, data]) => ({
    province,
    total: data.total,
    verified: data.verified,
    pending: data.total - data.verified,
  }))

  const totalPlots = plotVerification.reduce((s, p) => s + p.total, 0)
  const nonCompliantCount = eudrRecords.filter((r: any) => r.complianceStatus === 'Non-Compliant' || r.overallStatus === 'Non-Compliant').length
  const compliantCount = eudrRecords.filter((r: any) => r.complianceStatus === 'Compliant' || r.overallStatus === 'Compliant').length
  const compliancePct = eudrRecords.length > 0 ? Math.round((compliantCount / eudrRecords.length) * 100) : 0
  const highRiskCount = eudrRecords.filter((r: any) => r.riskLevel === 'High' || r.complianceStatus === 'Non-Compliant').length
  const pendingDdsCount = eudrRecords.filter((r: any) => r.complianceStatus !== 'Compliant' && r.overallStatus !== 'Compliant').length
  const gpsGaps = farmlands.filter((fl: any) => !fl.gpsVerified && !fl.isGpsVerified && fl.verificationStatus !== 'Verified').length

  return (
    <StaggerContainer className="space-y-6">
      {/* Fear Banner */}
      <StaggerItem>
        <ComplianceFearBanner
          severity={nonCompliantCount > 0 ? 'critical' : 'warning'}
          deadline="Dec 30, 2025"
          nonCompliantCount={nonCompliantCount}
          penaltyPct="4%"
          complianceLink="/eudr-compliance"
          storageKey="terra-brew-compliance-officer-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Welcome + Actions */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              {t2(`Tuân thủ EUDR — ${userName}`, `EUDR Compliance — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2('Bảng điều khiển tuân thủ của bạn — Ưu tiên hành động dưới đây', 'Your compliance dashboard — Prioritize actions below')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="destructive" className="gap-1.5 rounded-xl text-xs font-bold" onClick={() => router.push('/eudr-compliance')}>
              <FileWarning className="w-3.5 h-3.5" />
              {t2('Tạo DDS', 'Generate DDS')}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/eudr-compliance')}>
              <Satellite className="w-3.5 h-3.5" />
              {t2('Chạy kiểm tra vệ tinh', 'Run Satellite Check')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* EUDR Score + DDS Widget */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EudrComplianceScore
              score={compliancePct}
              shipmentsAtRisk={nonCompliantCount}
              penaltyPct="4%"
              onGenerateDDS={() => router.push('/eudr-compliance')}
              onFixGPS={() => router.push('/eudr-compliance')}
              onViewRisk={() => router.push('/eudr-compliance')}
            />
          </div>
          <div className="space-y-4">
            <DdsStatusWidget
              totalShipments={eudrRecords.length}
              completeDds={compliantCount}
              pendingPlots={pendingDdsCount}
              expiringSoon={0}
              highRisk={highRiskCount}
              onGenerateDds={() => router.push('/eudr-compliance')}
              onViewDetails={() => router.push('/eudr-compliance')}
            />
            {/* Quick KPIs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{highRiskCount}</p>
                <p className="text-[9px] text-muted-foreground">{t2('Lô rủi ro cao', 'High Risk')}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{pendingDdsCount}</p>
                <p className="text-[9px] text-muted-foreground">{t2('DDS chờ xử lý', 'Pending DDS')}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{compliancePct}%</p>
                <p className="text-[9px] text-muted-foreground">{t2('Tuân thủ', 'Compliant')}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-lg font-bold text-foreground">{gpsGaps}</p>
                <p className="text-[9px] text-muted-foreground">{t2('GPS thiếu', 'GPS Gaps')}</p>
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Pending DDS + Risk Alerts */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending DDS List */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-red-500" />
                  {t2('DDS cần xử lý', 'Pending DDS Actions')}
                </CardTitle>
                <Badge variant="destructive" className="text-[9px]">{pendingDds.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {pendingDds.length > 0 ? (
                <div className="space-y-2">
                  {pendingDds.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push('/eudr-compliance')}
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors text-left group"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        item.risk === 'high' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{item.farm}</span>
                          <Badge variant="outline" className={`text-[8px] h-4 ${
                            item.status === 'expired' ? 'border-red-300 text-red-600' :
                            item.status === 'missing' ? 'border-red-300 text-red-600' :
                            item.status === 'expiring' ? 'border-amber-300 text-amber-600' :
                            'border-blue-300 text-blue-600'
                          }`}>
                            {item.status === 'expired' ? t2('Hết hạn', 'EXPIRED') :
                             item.status === 'missing' ? t2('Thiếu', 'MISSING') :
                             item.status === 'expiring' ? t2('Sắp hết hạn', 'EXPIRING') :
                             t2('Chờ duyệt', 'REVIEW')}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.reason}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState message={t2('Không có DDS cần xử lý', 'No pending DDS actions')} />
              )}
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  {t2('Cảnh báo rủi ro', 'Risk Alerts')}
                </CardTitle>
                {riskAlerts.length > 0 && (
                  <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-0 text-[9px] font-bold">
                    {t2('SỰ CHÚ Ý CẦN THIẾT', 'NEEDS ATTENTION')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {riskAlerts.length > 0 ? (
                <div className="space-y-2">
                  {riskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
                      }`}
                    >
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{alert.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-muted-foreground">{alert.time}</span>
                          <button
                            onClick={() => router.push('/eudr-compliance')}
                            className="text-[9px] font-medium text-primary hover:text-primary/80"
                          >
                            {alert.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t2('Không có cảnh báo rủi ro', 'No risk alerts')} />
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Plot Verification by Province */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t2('Xác minh theo tỉnh', 'Plot Verification by Province')}
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">{t2(`${totalPlots} plots`, `${totalPlots} plots`)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {plotVerification.length > 0 ? (
              <div className="space-y-3">
                {plotVerification.map((prov) => {
                  const pct = prov.total > 0 ? Math.round((prov.verified / prov.total) * 100) : 0
                  return (
                    <div key={prov.province} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{prov.province}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{prov.verified}/{prov.total}</span>
                          <span className={`text-xs font-bold ${pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState message={t2('Chưa có dữ liệu mảnh đất', 'No farmland data yet')} />
            )}
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default ComplianceOfficerView

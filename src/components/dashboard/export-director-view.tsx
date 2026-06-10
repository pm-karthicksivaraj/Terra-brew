'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Ship, FileCheck, FileWarning, Clock, PackageCheck, Truck,
  ShieldCheck, AlertTriangle, ChevronRight, Container, ArrowRight,
  CheckCircle, XCircle, Loader2, Inbox,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { DdsStatusWidget } from './dds-status-widget'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Inbox className="w-8 h-8 text-muted-foreground/40 mb-2" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  )
}

export function ExportDirectorView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const [shipments, setShipments] = useState<any[]>([])
  const [eudrRecords, setEudrRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShipments = useCallback(async () => {
    try {
      const res = await fetch('/api/shipments?pageSize=20')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setShipments(records)
      }
    } catch (err) {
      console.error('Failed to fetch shipments', err)
    }
  }, [])

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
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await fetchShipments()
      await fetchEudrCompliance()
    }
    load()
  }, [fetchShipments, fetchEudrCompliance])

  // Map shipments with DDS status
  const shipmentList = shipments.slice(0, 6).map((s: any) => {
    // Find matching EUDR record for this shipment
    const eudr = eudrRecords.find((e: any) => e.shipmentId === s.id || e.referenceCode === s.shipmentCode)
    const ddsStatus = eudr
      ? (eudr.complianceStatus === 'Compliant' || eudr.overallStatus === 'Compliant' ? 'compliant'
        : eudr.complianceStatus === 'Pending' || eudr.overallStatus === 'Pending Review' ? 'pending_review'
        : eudr.complianceStatus === 'Expired' || eudr.overallStatus === 'Expired' ? 'expired'
        : 'missing')
      : 'missing'
    const docsComplete = ddsStatus === 'compliant' || ddsStatus === 'pending_review'
    return {
      id: s.shipmentCode || s.id,
      container: s.containerNumber || s.containerId || 'N/A',
      destination: s.destination || s.destinationPort || 'Unknown',
      status: s.status === 'Delivered' ? 'ready' : s.status === 'In Transit' || s.status === 'in_transit' ? 'ready' : s.status === 'Booked' ? 'loading' : 'pending',
      docsComplete,
      ddsStatus,
      eta: s.estimatedArrival || s.eta || 'N/A',
    }
  })

  const readyCount = shipmentList.filter(s => s.status === 'ready').length
  const pendingCount = shipmentList.filter(s => s.status === 'pending').length
  const missingDds = shipmentList.filter(s => s.ddsStatus === 'missing' || s.ddsStatus === 'expired').length

  return (
    <StaggerContainer className="space-y-6">
      {/* Fear Banner */}
      <StaggerItem>
        <ComplianceFearBanner
          severity="warning"
          deadline="Dec 30, 2025"
          nonCompliantCount={missingDds}
          penaltyPct="4%"
          complianceLink="/eudr-compliance"
          storageKey="terra-brew-export-director-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Header */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Ship className="w-5 h-5 text-primary" />
              {t2(`Sẵn sàng xuất khẩu — ${userName}`, `Export Readiness — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2('Trạng thái tài liệu và DDS cho mỗi lô hàng', 'Document and DDS status for each shipment')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="destructive" className="gap-1.5 rounded-xl text-xs font-bold" onClick={() => router.push('/eudr-compliance')}>
              <FileWarning className="w-3.5 h-3.5" />
              {t2('Tạo DDS còn thiếu', 'Generate Missing DDS')}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/shipments')}>
              <Truck className="w-3.5 h-3.5" />
              {t2('Tất cả vận chuyển', 'All Shipments')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* KPI Row */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Sẵn sàng', 'Ready')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{readyCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Chờ xử lý', 'Pending')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 mb-1">
              <FileWarning className="w-4 h-4 text-red-600" />
              <span className="text-[10px] text-muted-foreground">{t2('DDS thiếu', 'Missing DDS')}</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{missingDds}</p>
          </div>
          <div>
            <DdsStatusWidget
              totalShipments={shipments.length}
              completeDds={shipmentList.filter(s => s.ddsStatus === 'compliant').length}
              pendingPlots={0}
              expiringSoon={0}
              highRisk={missingDds}
              compact
            />
          </div>
        </div>
      </StaggerItem>

      {/* Shipment Board */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Container className="w-4 h-4 text-primary" />
                {t2('Bảng trạng thái lô hàng', 'Shipment Readiness Board')}
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">{shipments.length} {t2('lô', 'shipments')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {shipmentList.length > 0 ? (
              <div className="space-y-2">
                {shipmentList.map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => router.push('/shipments')}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors text-left group"
                  >
                    {/* Status indicator */}
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      shipment.status === 'ready' ? 'bg-green-500' :
                      shipment.status === 'loading' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />

                    {/* Container + Destination */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground font-mono">{shipment.container}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 ${
                          shipment.status === 'ready' ? 'border-green-300 text-green-600' :
                          shipment.status === 'loading' ? 'border-blue-300 text-blue-600' :
                          'border-amber-300 text-amber-600'
                        }`}>
                          {shipment.status === 'ready' ? t2('Sẵn sàng', 'READY') :
                           shipment.status === 'loading' ? t2('Đang xếp', 'LOADING') :
                           t2('Chờ', 'PENDING')}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">→ {shipment.destination} · ETA {shipment.eta}</p>
                    </div>

                    {/* Docs + DDS indicators */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1">
                        {shipment.docsComplete ? (
                          <FileCheck className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <FileWarning className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="text-[9px] text-muted-foreground">{t2('Tài liệu', 'Docs')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shipment.ddsStatus === 'compliant' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        ) : shipment.ddsStatus === 'pending_review' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="text-[9px] text-muted-foreground">DDS</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState message={t2('Chưa có lô hàng. Tạo vận chuyển để bắt đầu.', 'No shipments yet. Create a shipment to get started.')} />
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      {/* DDS Status + Export Compliance Pack */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DdsStatusWidget
            totalShipments={shipments.length}
            completeDds={shipmentList.filter(s => s.ddsStatus === 'compliant').length}
            pendingPlots={0}
            expiringSoon={0}
            highRisk={missingDds}
            onGenerateDds={() => router.push('/eudr-compliance')}
            onViewDetails={() => router.push('/eudr-compliance')}
          />
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-primary" />
                {t2('Bộ tài liệu xuất khẩu', 'Export Compliance Pack')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <p className="text-xs text-muted-foreground">
                {t2('Chọn lô hàng để tự động đóng gói tất cả tài liệu tuân thủ', 'Select a shipment to auto-assemble all compliance documents')}
              </p>
              <Button className="w-full rounded-xl gap-2" onClick={() => router.push('/export-docs')}>
                <FileCheck className="w-4 h-4" />
                {t2('Tạo bộ tài liệu', 'Generate Pack')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <div className="text-[10px] text-muted-foreground space-y-1">
                <p className="font-medium">{t2('Bao gồm:', 'Includes:')}</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Due Diligence Statement (DDS)</li>
                  <li>Certificate of Origin</li>
                  <li>Phytosanitary Certificate</li>
                  <li>Packing List</li>
                  <li>Bill of Lading Reference</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default ExportDirectorView

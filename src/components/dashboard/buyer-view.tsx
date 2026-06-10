'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock,
  Download, ChevronRight, PackageCheck, Truck, FileText,
  ArrowRight, Building2, Globe, Star, Inbox,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Inbox className="w-8 h-8 text-muted-foreground/40 mb-2" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  )
}

export function BuyerView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const [eudrRecords, setEudrRecords] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])

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

  const fetchShipments = useCallback(async () => {
    try {
      const res = await fetch('/api/shipments?pageSize=10')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setShipments(records)
      }
    } catch (err) {
      console.error('Failed to fetch shipments', err)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await fetchEudrCompliance()
      await fetchShipments()
    }
    load()
  }, [fetchEudrCompliance, fetchShipments])

  // Map suppliers from EUDR compliance records
  const suppliers = eudrRecords.slice(0, 5).map((r: any) => ({
    id: r.id,
    name: r.farmName || r.farmerName || r.entityName || `Supplier ${r.id}`,
    country: r.country || r.province || 'Vietnam',
    ddsStatus: r.complianceStatus === 'Compliant' || r.overallStatus === 'Compliant' ? 'compliant'
      : r.complianceStatus === 'Pending' || r.overallStatus === 'Pending Review' ? 'pending'
      : 'non_compliant',
    lastVerified: r.lastVerified || r.updatedAt ? new Date(r.lastVerified || r.updatedAt).toLocaleDateString() : 'N/A',
    risk: r.riskLevel === 'High' || r.complianceStatus === 'Non-Compliant' || r.overallStatus === 'Non-Compliant' ? 'high'
      : r.riskLevel === 'Medium' || r.complianceStatus === 'Pending' ? 'medium' : 'low',
    score: r.complianceScore || (r.complianceStatus === 'Compliant' ? 90 : r.complianceStatus === 'Pending' ? 65 : 40),
    expiringSoon: r.complianceStatus === 'Expiring' || r.overallStatus === 'Expiring',
  }))

  // Map incoming shipments from real data
  const shipmentList = shipments.slice(0, 4).map((s: any) => ({
    id: s.shipmentCode || s.id,
    supplier: s.supplierName || s.origin || s.shipper || 'Unknown',
    origin: s.origin || s.originCountry || 'Vietnam',
    variety: s.coffeeType || s.productType || 'Coffee',
    weight: s.weight ? `${(s.weight / 1000).toFixed(0)}T` : 'N/A',
    eta: s.estimatedArrival || s.eta || 'N/A',
    ddsStatus: s.ddsStatus === 'compliant' || s.eudrCompliant ? 'compliant'
      : s.ddsStatus === 'pending' ? 'pending' : 'non_compliant',
    stage: s.status === 'In Transit' || s.status === 'in_transit' ? 'in_transit'
      : s.status === 'Loading' || s.status === 'loading' ? 'loading' : 'pending',
  }))

  const compliantCount = suppliers.filter(s => s.ddsStatus === 'compliant').length
  const highRiskCount = suppliers.filter(s => s.risk === 'high').length
  const expiringCount = suppliers.filter(s => s.expiringSoon).length

  return (
    <StaggerContainer className="space-y-6">
      {/* Fear Banner */}
      <StaggerItem>
        <ComplianceFearBanner
          severity={highRiskCount > 0 ? 'critical' : 'warning'}
          deadline="Dec 30, 2025"
          nonCompliantCount={highRiskCount}
          penaltyPct="4%"
          complianceLink="/eudr-compliance"
          storageKey="terra-brew-buyer-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Header */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {t2(`Tuân thủ nhà cung cấp — ${userName}`, `Supplier Compliance — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2('Tình trạng tuân thủ EUDR của tất cả nhà cung cấp đã liên kết', 'EUDR compliance health of all linked suppliers')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/eudr-compliance')}>
              <FileText className="w-3.5 h-3.5" />
              {t2('Xem báo cáo', 'View Report')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* Compliance KPIs */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Tuân thủ', 'Compliant')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{compliantCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Rủi ro cao', 'High Risk')}</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highRiskCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Sắp hết hạn', 'Expiring')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{expiringCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">{t2('Tổng NCC', 'Suppliers')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{suppliers.length}</p>
          </div>
        </div>
      </StaggerItem>

      {/* Supplier Compliance Grid */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {t2('Lưới tuân thủ nhà cung cấp', 'Supplier Compliance Grid')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {suppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className={`p-4 rounded-xl border ${
                      supplier.risk === 'low' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30' :
                      supplier.risk === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30' :
                      'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{supplier.name}</p>
                        <p className="text-[10px] text-muted-foreground">{supplier.country}</p>
                      </div>
                      <Badge className={`text-[8px] font-bold tracking-wider border-0 ${
                        supplier.ddsStatus === 'compliant' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                        supplier.ddsStatus === 'pending' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                      }`}>
                        {supplier.ddsStatus === 'compliant' ? t2('ĐẠT', 'PASS') :
                         supplier.ddsStatus === 'pending' ? t2('CHỜ', 'PENDING') :
                         t2('RỦI RO', 'RISK')}
                      </Badge>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              supplier.score >= 80 ? 'bg-green-500' :
                              supplier.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${supplier.score}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        supplier.score >= 80 ? 'text-green-600' :
                        supplier.score >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {supplier.score}%
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                      <span>{t2('Xác minh', 'Verified')}: {supplier.lastVerified}</span>
                      {supplier.expiringSoon && (
                        <Badge variant="outline" className="text-[8px] h-4 border-amber-300 text-amber-600">
                          {t2('Sắp hết hạn', 'EXPIRING')}
                        </Badge>
                      )}
                    </div>

                    {/* Download DDS */}
                    <Button
                      size="sm"
                      variant={supplier.ddsStatus === 'compliant' ? 'outline' : 'destructive'}
                      className="w-full mt-3 rounded-xl text-[10px] gap-1.5"
                      onClick={() => {
                        if (supplier.ddsStatus !== 'compliant') {
                          router.push('/eudr-compliance')
                        }
                      }}
                    >
                      {supplier.ddsStatus === 'compliant' ? (
                        <>
                          <Download className="w-3 h-3" />
                          {t2('Tải DDS', 'Download DDS')}
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          {t2('Xem vấn đề', 'View Issues')}
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t2('Chưa có nhà cung cấp. Dữ liệu sẽ xuất hiện khi có bản ghi EUDR.', 'No suppliers yet. Data will appear as EUDR records are added.')} />
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      {/* Incoming Shipments */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-primary" />
                {t2('Lô hàng sắp đến', 'Incoming Shipments')}
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">{shipments.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {shipmentList.length > 0 ? (
              <div className="space-y-2">
                {shipmentList.map((shipment) => (
                  <div key={shipment.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                    {/* Stage indicator */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      shipment.stage === 'in_transit' ? 'bg-blue-100 dark:bg-blue-900/40' :
                      shipment.stage === 'loading' ? 'bg-amber-100 dark:bg-amber-900/40' :
                      'bg-muted/50'
                    }`}>
                      {shipment.stage === 'in_transit' ? <Truck className="w-4 h-4 text-blue-600" /> :
                       shipment.stage === 'loading' ? <PackageCheck className="w-4 h-4 text-amber-600" /> :
                       <Clock className="w-4 h-4 text-muted-foreground" />}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{shipment.supplier}</span>
                        <Badge variant="outline" className="text-[8px] h-4">{shipment.variety}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {shipment.origin} · {shipment.weight} · ETA {shipment.eta}
                      </p>
                    </div>

                    {/* DDS status */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {shipment.ddsStatus === 'compliant' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : shipment.ddsStatus === 'pending' ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Button size="sm" variant="ghost" className="text-[9px] h-6 px-1.5 rounded-lg">
                        {shipment.ddsStatus === 'compliant' ? t2('Tải DDS', 'Download') : t2('Chi tiết', 'Details')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t2('Chưa có lô hàng. Dữ liệu sẽ xuất hiện khi có vận chuyển.', 'No shipments yet. Data will appear as shipments are created.')} />
            )}
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default BuyerView

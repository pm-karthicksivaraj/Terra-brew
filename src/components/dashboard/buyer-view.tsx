'use client'

import { useRouter } from 'next/navigation'
import {
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock,
  Download, ChevronRight, PackageCheck, Truck, FileText,
  ArrowRight, Building2, Globe, Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

const MOCK_SUPPLIERS = [
  { id: '1', name: 'Metrang Coffee', country: 'Vietnam', ddsStatus: 'compliant', lastVerified: '2 days ago', risk: 'low', score: 89, expiringSoon: false },
  { id: '2', name: 'Cooxupé Cooperative', country: 'Brazil', ddsStatus: 'compliant', lastVerified: '5 days ago', risk: 'low', score: 92, expiringSoon: false },
  { id: '3', name: 'Yirgacheffe Union', country: 'Ethiopia', ddsStatus: 'pending', lastVerified: '30 days ago', risk: 'medium', score: 67, expiringSoon: true },
  { id: '4', name: 'Othaya Cooperative', country: 'Kenya', ddsStatus: 'non_compliant', lastVerified: '60 days ago', risk: 'high', score: 41, expiringSoon: true },
  { id: '5', name: 'Euro Coffee Imports', country: 'Netherlands', ddsStatus: 'compliant', lastVerified: '1 day ago', risk: 'low', score: 95, expiringSoon: false },
]

const MOCK_SHIPMENTS = [
  { id: 'SHP-001', supplier: 'Metrang Coffee', origin: 'Vietnam', variety: 'Robusta G1', weight: '24T', eta: 'Jun 15, 2026', ddsStatus: 'compliant', stage: 'in_transit' },
  { id: 'SHP-002', supplier: 'Cooxupé', origin: 'Brazil', variety: 'Arabica SC15', weight: '18T', eta: 'Jun 22, 2026', ddsStatus: 'compliant', stage: 'loading' },
  { id: 'SHP-003', supplier: 'Yirgacheffe Union', origin: 'Ethiopia', variety: 'Arabica Yirgacheffe', weight: '12T', eta: 'Jul 01, 2026', ddsStatus: 'pending', stage: 'booked' },
  { id: 'SHP-004', supplier: 'Othaya Cooperative', origin: 'Kenya', variety: 'AA Top', weight: '8T', eta: 'Jul 10, 2026', ddsStatus: 'non_compliant', stage: 'pending' },
]

export function BuyerView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'

  const compliantCount = MOCK_SUPPLIERS.filter(s => s.ddsStatus === 'compliant').length
  const highRiskCount = MOCK_SUPPLIERS.filter(s => s.risk === 'high').length
  const expiringCount = MOCK_SUPPLIERS.filter(s => s.expiringSoon).length

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
            <p className="text-2xl font-bold text-foreground">{MOCK_SUPPLIERS.length}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOCK_SUPPLIERS.map((supplier) => (
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
                    className={`w-full mt-3 rounded-xl text-[10px] gap-1.5 ${supplier.ddsStatus === 'compliant' ? '' : ''}`}
                    onClick={() => {
                      if (supplier.ddsStatus === 'compliant') {
                        // Download compliance package
                      } else {
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
              <Badge variant="outline" className="text-[9px]">{MOCK_SHIPMENTS.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {MOCK_SHIPMENTS.map((shipment) => (
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
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default BuyerView

'use client'

import { useRouter } from 'next/navigation'
import {
  TrendingUp, FileQuestion, FileText, DollarSign, Clock,
  ArrowRight, BarChart3, Store, ChevronRight, BadgeCheck,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

const MOCK_PRICES = [
  { variety: 'Robusta', price: 4235, change: +2.1, unit: 'USD/MT' },
  { variety: 'Arabica', price: 6890, change: -1.3, unit: 'USD/MT' },
  { variety: 'Vietnam G1', price: 4150, change: +1.8, unit: 'USD/MT' },
  { variety: 'Brazil Cerrado', price: 6420, change: -0.5, unit: 'USD/MT' },
]

const MOCK_RFQS = [
  { id: 'RFQ-2026-001', buyer: 'Neue Kaffee GmbH', variety: 'Robusta G1', quantity: 24000, unit: 'kg', bids: 4, deadline: '3 days', status: 'active' },
  { id: 'RFQ-2026-002', buyer: 'Terra Rossa Srl', variety: 'Arabica SC15', quantity: 12000, unit: 'kg', bids: 2, deadline: '5 days', status: 'active' },
  { id: 'RFQ-2026-003', buyer: 'Nordic Bean AB', variety: 'Robusta G2', quantity: 36000, unit: 'kg', bids: 6, deadline: '1 day', status: 'closing' },
  { id: 'RFQ-2026-004', buyer: 'Café Direct Ltd', variety: 'Arabica SC17', quantity: 8000, unit: 'kg', bids: 0, deadline: '7 days', status: 'new' },
]

const MOCK_CONTRACTS = [
  { id: 'SC-2026-0344', buyer: 'Alpine Roast AG', value: 480000000, status: 'executed', currency: 'VND' },
  { id: 'SC-2026-0345', buyer: 'Bean Brothers Co', value: 320000000, status: 'pending', currency: 'VND' },
  { id: 'SC-2026-0346', buyer: 'Neue Kaffee GmbH', value: 560000000, status: 'draft', currency: 'VND' },
]

export function TraderView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const currency = session?.user?.currency || 'VND'

  return (
    <StaggerContainer className="space-y-6">
      {/* Fear Banner */}
      <StaggerItem>
        <ComplianceFearBanner
          severity="info"
          deadline="Dec 30, 2025"
          nonCompliantCount={0}
          penaltyPct="4%"
          complianceLink="/eudr-compliance"
          storageKey="terra-brew-trader-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Header */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t2(`Sàn giao dịch — ${userName}`, `Trading Desk — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2('Giá thị trường, RFQ và hợp đồng', 'Live market prices, RFQs & contract pipeline')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/rfq')}>
              <FileQuestion className="w-3.5 h-3.5" />
              {t2('Tạo RFQ', 'New RFQ')}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/trading-desk')}>
              <Store className="w-3.5 h-3.5" />
              {t2('Sàn giao dịch', 'Trading Desk')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* Live Price Ticker */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MOCK_PRICES.map((p) => (
            <Card key={p.variety} className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-medium">{p.variety}</span>
                  <div className={`flex items-center gap-0.5 text-[10px] font-bold ${p.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {p.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(p.change)}%
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">${p.price.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{p.unit} · ICE Futures</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </StaggerItem>

      {/* Active RFQs + Contract Pipeline */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active RFQs */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-primary" />
                  {t2('RFQ đang hoạt động', 'Active RFQs')}
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">{MOCK_RFQS.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {MOCK_RFQS.map((rfq) => (
                  <button
                    key={rfq.id}
                    onClick={() => router.push('/rfq')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors text-left group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      rfq.status === 'closing' ? 'bg-red-500' :
                      rfq.status === 'new' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{rfq.buyer}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 ${
                          rfq.status === 'closing' ? 'border-red-300 text-red-600' :
                          rfq.status === 'new' ? 'border-green-300 text-green-600' :
                          'border-blue-300 text-blue-600'
                        }`}>
                          {rfq.status === 'closing' ? t2('Sắp đóng', 'CLOSING') :
                           rfq.status === 'new' ? t2('Mới', 'NEW') : t2('Đang mở', 'OPEN')}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {rfq.variety} · {(rfq.quantity / 1000).toFixed(0)}T · {rfq.bids} {t2('đấu thầu', 'bids')} · {rfq.deadline} {t2('còn lại', 'left')}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Pipeline */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {t2('Hợp đồng', 'Contract Pipeline')}
                </CardTitle>
                <Button size="sm" variant="outline" className="text-[9px] h-6 rounded-lg gap-1" onClick={() => router.push('/smart-contracts')}>
                  {t2('Xem tất cả', 'View All')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {MOCK_CONTRACTS.map((contract) => (
                  <div key={contract.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      contract.status === 'executed' ? 'bg-green-100 dark:bg-green-900/60' :
                      contract.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/60' :
                      'bg-muted/50'
                    }`}>
                      {contract.status === 'executed' ? <BadgeCheck className="w-4 h-4 text-green-600" /> :
                       contract.status === 'pending' ? <Clock className="w-4 h-4 text-amber-600" /> :
                       <FileText className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground font-mono">{contract.id}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 ${
                          contract.status === 'executed' ? 'border-green-300 text-green-600' :
                          contract.status === 'pending' ? 'border-amber-300 text-amber-600' :
                          'border-border text-muted-foreground'
                        }`}>
                          {contract.status === 'executed' ? t2('Đã ký', 'EXECUTED') :
                           contract.status === 'pending' ? t2('Chờ xử lý', 'PENDING') :
                           t2('Nháp', 'DRAFT')}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{contract.buyer}</p>
                    </div>
                    <span className="text-xs font-bold text-foreground shrink-0">
                      {(contract.value / 1e6).toFixed(0)}M
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default TraderView

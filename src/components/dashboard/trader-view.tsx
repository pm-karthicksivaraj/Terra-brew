'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, FileQuestion, FileText, DollarSign, Clock,
  ArrowRight, BarChart3, Store, ChevronRight, BadgeCheck,
  ArrowUpRight, ArrowDownRight, Loader2, Inbox,
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

export function TraderView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const currency = session?.user?.currency || 'VND'
  const [priceTickers, setPriceTickers] = useState<any[]>([])
  const [rfqs, setRfqs] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPriceTickers = useCallback(async () => {
    try {
      const res = await fetch('/api/price-tickers?pageSize=10')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setPriceTickers(records.slice(0, 4))
      }
    } catch (err) {
      console.error('Failed to fetch price tickers', err)
    }
  }, [])

  const fetchRfqs = useCallback(async () => {
    try {
      const res = await fetch('/api/rfq?pageSize=10')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setRfqs(records.slice(0, 4))
      }
    } catch (err) {
      console.error('Failed to fetch RFQs', err)
    }
  }, [])

  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch('/api/smart-contracts?pageSize=10')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setContracts(records.slice(0, 4))
      }
    } catch (err) {
      console.error('Failed to fetch contracts', err)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await fetchPriceTickers()
      await fetchRfqs()
      await fetchContracts()
    }
    load()
  }, [fetchPriceTickers, fetchRfqs, fetchContracts])

  // Map prices from real price tickers
  const prices = priceTickers.map((pt: any) => ({
    variety: pt.coffeeType || pt.variety || pt.name || 'Coffee',
    price: pt.price || pt.currentPrice || 0,
    change: pt.changePercentage || pt.change || 0,
    unit: pt.unit || 'USD/MT',
  }))

  // Map RFQs
  const rfqList = rfqs.map((rfq: any) => ({
    id: rfq.rfqCode || rfq.id,
    buyer: rfq.buyerName || rfq.counterparty || 'Unknown',
    variety: rfq.coffeeType || rfq.productType || 'Coffee',
    quantity: rfq.quantity || 0,
    unit: 'kg',
    bids: rfq.bidCount || 0,
    deadline: rfq.deadline || rfq.closingDate || 'N/A',
    status: rfq.status === 'Closing' || rfq.status === 'Closing Soon' ? 'closing' : rfq.status === 'New' || rfq.status === 'Draft' ? 'new' : 'active',
  }))

  // Map contracts
  const contractList = contracts.map((c: any) => ({
    id: c.contractCode || c.id,
    buyer: c.counterparty || c.buyerName || 'Unknown',
    value: c.totalValue || c.contractValue || 0,
    status: c.status === 'Executed' || c.status === 'Active' || c.status === 'Completed' ? 'executed'
      : c.status === 'Pending' || c.status === 'Awaiting Signature' ? 'pending' : 'draft',
    currency: c.currency || 'VND',
  }))

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
        {prices.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {prices.map((p) => (
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
                  <p className="text-[9px] text-muted-foreground">{p.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-2xl border border-border/50 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center h-[80px]">
                  <p className="text-[10px] text-muted-foreground">{t2('Chưa có bảng giá', 'No price data')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                <Badge variant="outline" className="text-[9px]">{rfqs.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {rfqList.length > 0 ? (
                <div className="space-y-2">
                  {rfqList.map((rfq) => (
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
                          {rfq.variety} · {rfq.quantity > 0 ? `${(rfq.quantity / 1000).toFixed(0)}T` : 'N/A'} · {rfq.bids} {t2('đấu thầu', 'bids')} · {rfq.deadline} {t2('còn lại', 'left')}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState message={t2('Chưa có RFQ. Tạo RFQ để bắt đầu.', 'No RFQs yet. Create an RFQ to get started.')} />
              )}
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
              {contractList.length > 0 ? (
                <div className="space-y-3">
                  {contractList.map((contract) => (
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
                      {contract.value > 0 && (
                        <span className="text-xs font-bold text-foreground shrink-0">
                          {(contract.value / 1e6).toFixed(0)}M
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t2('Chưa có hợp đồng. Tạo hợp đồng để bắt đầu.', 'No contracts yet. Create a contract to get started.')} />
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default TraderView

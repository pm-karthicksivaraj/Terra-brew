'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, ShoppingCart, Truck,
  Activity, Loader2, DollarSign, BarChart3,
  Zap, Globe, FileCheck, Package, ArrowRightLeft,
  Clock, Store, Inbox,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/i18n'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, LineChart, Line,
} from 'recharts'
import { MotionCard, hoverScale } from '@/components/ui/motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { formatCurrency } from '@/types'
import type { DashboardStats } from '@/types'

const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516']

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-center p-6">
      <div>
        <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function TraderDashboard() {
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceTickers, setPriceTickers] = useState<any[]>([])
  const [rfqs, setRfqs] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPriceTickers = useCallback(async () => {
    try {
      const res = await fetch('/api/price-tickers?pageSize=20')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setPriceTickers(records)
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
        setRfqs(records)
      }
    } catch (err) {
      console.error('Failed to fetch RFQs', err)
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

  useEffect(() => { fetchStats(); fetchPriceTickers(); fetchRfqs(); fetchShipments() }, [fetchStats, fetchPriceTickers, fetchRfqs, fetchShipments])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalListings = stats?.totalMarketplaceListings || 0
  const avgPrice = stats?.avgPricePerKg || 0
  const totalVolume = stats?.totalNetWeight || 0
  const currency = 'VND'

  // Compute price trends from price tickers
  const priceTrends = priceTickers.slice(0, 12).map((pt: any, i: number) => ({
    month: pt.effectiveDate ? new Date(pt.effectiveDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : `Period ${i + 1}`,
    arabica: pt.arabicaPrice || pt.price || 0,
    robusta: pt.robustaPrice || 0,
    cPrice: pt.cPrice || 0,
  }))

  // Compute trading volume from harvest trends
  const tradingVolume = (stats?.harvestTrends || []).map((h) => ({
    month: h.name,
    volume: h.weight,
    revenue: Math.round(h.weight * (avgPrice || 1)),
  }))

  // Map RFQs
  const openRfqs = rfqs.slice(0, 5).map((rfq: any) => ({
    id: rfq.rfqCode || rfq.id,
    buyer: rfq.buyerName || rfq.counterparty || 'Unknown',
    type: rfq.coffeeType || rfq.productType || 'Coffee',
    quantity: rfq.quantity ? `${Number(rfq.quantity).toLocaleString()} kg` : 'N/A',
    deadline: rfq.deadline || rfq.closingDate || 'N/A',
    bids: rfq.bidCount || 0,
  }))

  // Map shipments
  const shipmentList = shipments.slice(0, 5).map((s: any) => ({
    id: s.shipmentCode || s.id,
    destination: s.destination || s.destinationPort || 'Unknown',
    status: s.status || 'planned',
    eta: s.estimatedArrival || s.eta || 'N/A',
    progress: s.status === 'Delivered' ? 100 : s.status === 'In Transit' ? 65 : s.status === 'Booked' ? 25 : 10,
  }))

  const kpis = [
    { title: t2('RFQ mở', 'Open RFQs'), value: rfqs.length, icon: ShoppingCart, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Lô hàng hoạt động', 'Active Shipments'), value: shipments.length, icon: Truck, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Danh sách thị trường', 'Marketplace Listings'), value: totalListings, icon: Store, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Báo giá chờ xử lý', 'Pending Bids'), value: 0, icon: ArrowRightLeft, iconBg: 'bg-cyan-100 dark:bg-cyan-950', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    { title: t2('Giá TB/kg', 'Avg Price/kg'), value: formatCurrency(avgPrice, currency), icon: DollarSign, iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: 'text-orange-600 dark:text-orange-400' },
    { title: t2('Tổng khối lượng (kg)', 'Total Volume (kg)'), value: totalVolume.toLocaleString(), icon: Package, iconBg: 'bg-rose-100 dark:bg-rose-950', iconColor: 'text-rose-600 dark:text-rose-400' },
  ]

  return (
    <StaggerContainer className="space-y-6">
      {/* KPI Cards */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {kpis.map((kpi, i) => (
            <MotionCard key={i} {...hoverScale} className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-default">
              <CardContent className="p-4 space-y-2">
                <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold text-foreground leading-none">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.title}</p>
                </div>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </StaggerItem>

      {/* Charts Row 1 */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Price Trends */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t2('Xu hướng giá', 'Price Trends')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Giá từ bảng giá', 'Prices from tickers')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {priceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={priceTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="arabica" stroke="#0d9488" strokeWidth={2} name="Arabica" dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="robusta" stroke="#8b5a1e" strokeWidth={2} name="Robusta" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có bảng giá', 'Data will appear as price tickers are added')} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trading Volume */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                {t2('Khối lượng giao dịch', 'Trading Volume')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Khối lượng & doanh thu hàng tháng', 'Monthly volume & revenue')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {tradingVolume.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={tradingVolume} margin={{ bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="volume" name={t2('Khối lượng (kg)', 'Volume (kg)')} fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có thu hoạch', 'Data will appear as harvests are recorded')} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* RFQs + Shipments */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Open RFQs */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  {t2('RFQ mở', 'Open RFQs')}
                </CardTitle>
                <Button size="sm" variant="ghost" className="text-[10px] h-7 rounded-lg" onClick={() => router.push('/rfq')}>
                  {t2('Xem tất cả', 'View All')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {openRfqs.length > 0 ? (
                <ScrollArea className="h-[260px]">
                  <div className="space-y-2">
                    {openRfqs.map((rfq) => (
                      <div key={rfq.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px]">{rfq.id}</Badge>
                            <span className="text-xs font-medium text-foreground truncate">{rfq.buyer}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{rfq.type} — {rfq.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground">{rfq.deadline}</p>
                          <Badge variant="secondary" className="text-[8px] h-4">{rfq.bids} {t2('báo giá', 'bids')}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-[260px]">
                  <EmptyChart message={t2('Chưa có RFQ', 'No RFQs yet')} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipment Tracking */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                {t2('Theo dõi lô hàng', 'Shipment Tracking')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4 space-y-3">
              {shipmentList.length > 0 ? (
                shipmentList.map((shipment) => {
                  const statusColors: Record<string, string> = {
                    'In Transit': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
                    'in_transit': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
                    'Booked': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                    'booked': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                    'planned': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                  }
                  return (
                    <div key={shipment.id} className="p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px]">{shipment.id}</Badge>
                          <span className="text-xs font-medium text-foreground">{shipment.destination}</span>
                        </div>
                        <Badge className={`text-[8px] ${statusColors[shipment.status] || statusColors.planned}`}>{shipment.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={shipment.progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground shrink-0">{shipment.progress}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">ETA: {shipment.eta}</p>
                    </div>
                  )
                })
              ) : (
                <div className="h-[260px]">
                  <EmptyChart message={t2('Chưa có lô hàng', 'No shipments yet')} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Quick Actions */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t2('Thao tác nhanh', 'Quick Actions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: ShoppingCart, label: t2('Tạo RFQ', 'Create RFQ'), href: '/rfq' },
                { icon: Store, label: t2('Đăng thị trường', 'Marketplace Listing'), href: '/marketplace' },
                { icon: Truck, label: t2('Theo dõi lô hàng', 'Track Shipment'), href: '/shipments' },
                { icon: Globe, label: t2('Bàn giao dịch', 'Trading Desk'), href: '/trading-desk' },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="gap-2 rounded-xl h-auto py-3 text-xs" onClick={() => router.push(action.href)}>
                  <action.icon className="w-4 h-4 text-primary" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

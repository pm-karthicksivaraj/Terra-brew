'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, ShoppingCart, Truck,
  Activity, Loader2, DollarSign, BarChart3,
  Zap, Globe, FileCheck, Package, ArrowRightLeft,
  Clock, Store,
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

const MOCK_PRICE_TRENDS = [
  { month: 'May 25', arabica: 4200, robusta: 2100, cPrice: 3800 },
  { month: 'Jun 25', arabica: 4350, robusta: 2200, cPrice: 3950 },
  { month: 'Jul 25', arabica: 4400, robusta: 2250, cPrice: 4000 },
  { month: 'Aug 25', arabica: 4500, robusta: 2300, cPrice: 4100 },
  { month: 'Sep 25', arabica: 4450, robusta: 2280, cPrice: 4050 },
  { month: 'Oct 25', arabica: 4600, robusta: 2350, cPrice: 4200 },
  { month: 'Nov 25', arabica: 4700, robusta: 2400, cPrice: 4300 },
  { month: 'Dec 25', arabica: 4650, robusta: 2380, cPrice: 4250 },
  { month: 'Jan 26', arabica: 4800, robusta: 2450, cPrice: 4400 },
  { month: 'Feb 26', arabica: 4900, robusta: 2500, cPrice: 4500 },
  { month: 'Mar 26', arabica: 4850, robusta: 2480, cPrice: 4450 },
  { month: 'Apr 26', arabica: 5000, robusta: 2550, cPrice: 4600 },
]

const MOCK_OPEN_RFQS = [
  { id: 'RFQ-2026-089', buyer: 'Neue Kaffee GmbH', type: 'Arabica SHB', quantity: '2,400 kg', deadline: '3 days', bids: 4 },
  { id: 'RFQ-2026-090', buyer: 'Terra Rossa Srl', type: 'Robusta Grade 1', quantity: '5,000 kg', deadline: '5 days', bids: 2 },
  { id: 'RFQ-2026-091', buyer: 'Nordic Bean AB', type: 'Arabica HB', quantity: '1,800 kg', deadline: '7 days', bids: 3 },
  { id: 'RFQ-2026-092', buyer: 'Café Direct Ltd', type: 'Blend Special', quantity: '3,200 kg', deadline: '4 days', bids: 1 },
]

const MOCK_SHIPMENTS = [
  { id: 'SHP-2026-041', destination: 'Hamburg, DE', status: 'in_transit', eta: 'Mar 15', progress: 65 },
  { id: 'SHP-2026-042', destination: 'Genoa, IT', status: 'booked', eta: 'Mar 20', progress: 25 },
  { id: 'SHP-2026-043', destination: 'Gothenburg, SE', status: 'in_transit', eta: 'Mar 12', progress: 80 },
  { id: 'SHP-2026-044', destination: 'Felixstowe, UK', status: 'planned', eta: 'Mar 28', progress: 10 },
]

const MOCK_TRADING_VOLUME = [
  { month: 'May', volume: 18500, revenue: 85000000 },
  { month: 'Jun', volume: 22000, revenue: 102000000 },
  { month: 'Jul', volume: 19500, revenue: 91000000 },
  { month: 'Aug', volume: 28000, revenue: 132000000 },
  { month: 'Sep', volume: 32000, revenue: 154000000 },
  { month: 'Oct', volume: 35000, revenue: 171000000 },
  { month: 'Nov', volume: 31000, revenue: 148000000 },
  { month: 'Dec', volume: 26000, revenue: 122000000 },
  { month: 'Jan', volume: 21000, revenue: 98000000 },
  { month: 'Feb', volume: 24000, revenue: 112000000 },
  { month: 'Mar', volume: 29000, revenue: 136000000 },
  { month: 'Apr', volume: 27000, revenue: 128000000 },
]

export default function TraderDashboard() {
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const openRFQs = 4
  const activeShipments = 4
  const totalListings = stats?.totalMarketplaceListings || 0
  const pendingBids = 10
  const avgPrice = stats?.avgPricePerKg || 48500
  const totalVolume = stats?.totalNetWeight || 0
  const currency = 'VND'

  const kpis = [
    { title: t2('RFQ mở', 'Open RFQs'), value: openRFQs, icon: ShoppingCart, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Lô hàng hoạt động', 'Active Shipments'), value: activeShipments, icon: Truck, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Danh sách thị trường', 'Marketplace Listings'), value: totalListings, icon: Store, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Báo giá chờ xử lý', 'Pending Bids'), value: pendingBids, icon: ArrowRightLeft, iconBg: 'bg-cyan-100 dark:bg-cyan-950', iconColor: 'text-cyan-600 dark:text-cyan-400' },
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
                {t2('Giá Arabica, Robusta & C Price ($/kg)', 'Arabica, Robusta & C Price ($/kg)')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={MOCK_PRICE_TRENDS}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="arabica" stroke="#0d9488" strokeWidth={2} name="Arabica" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="robusta" stroke="#8b5a1e" strokeWidth={2} name="Robusta" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="cPrice" stroke="#6d4516" strokeWidth={2} strokeDasharray="5 5" name="C Price" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_TRADING_VOLUME} margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="volume" name={t2('Khối lượng (kg)', 'Volume (kg)')} fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
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
              <ScrollArea className="h-[260px]">
                <div className="space-y-2">
                  {MOCK_OPEN_RFQS.map((rfq) => (
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
              {MOCK_SHIPMENTS.map((shipment) => {
                const statusColors: Record<string, string> = {
                  in_transit: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
                  booked: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                  planned: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                }
                return (
                  <div key={shipment.id} className="p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px]">{shipment.id}</Badge>
                        <span className="text-xs font-medium text-foreground">{shipment.destination}</span>
                      </div>
                      <Badge className={`text-[8px] ${statusColors[shipment.status]}`}>{shipment.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={shipment.progress} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground shrink-0">{shipment.progress}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">ETA: {shipment.eta}</p>
                  </div>
                )
              })}
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

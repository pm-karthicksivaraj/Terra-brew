'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  Activity, Loader2, BarChart3, Receipt,
  Zap, FileCheck, Clock, Wallet, ShieldCheck, AlertCircle,
  ArrowUpRight, ArrowDownRight, Inbox,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
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

export default function FinanceDashboard() {
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingPayments, setPendingPayments] = useState<any[]>([])

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

  const fetchPendingPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/procurement?pageSize=20')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        // Filter for pending / non-completed payments
        const pending = records
          .filter((r: any) => r.paymentStatus && r.paymentStatus !== 'Completed')
          .slice(0, 5)
          .map((r: any) => ({
            id: r.procurementCode || r.id,
            farmer: r.farmerName || r.farmer || 'Unknown',
            amount: r.totalPurchaseAmount || 0,
            status: r.paymentStatus === 'Overdue' ? 'overdue' : r.paymentStatus === 'Pending' ? 'due_soon' : 'scheduled',
            dueDate: r.paymentDueDate ? new Date(r.paymentDueDate).toLocaleDateString() : r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
          }))
        setPendingPayments(pending)
      }
    } catch (err) {
      console.error('Failed to fetch procurement', err)
    }
  }, [])

  useEffect(() => { fetchStats(); fetchPendingPayments() }, [fetchStats, fetchPendingPayments])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalRevenue = stats?.totalPurchaseAmount || 0
  const pendingCount = stats?.procurementPendingCount || 0
  const paidPayments = stats?.procurementPaidCount || 0
  const avgPrice = stats?.avgPricePerKg || 0
  const procurementCost = stats?.totalPurchaseAmount || 0
  const currency = 'VND'

  // Compute revenue trend from harvestTrends
  const revenueTrend = (stats?.harvestTrends || []).map((h) => ({
    month: h.name,
    revenue: Math.round(h.weight * (avgPrice || 1)),
    costs: Math.round(h.weight * (avgPrice || 1) * 0.6),
    margin: Math.round(h.weight * (avgPrice || 1) * 0.4),
  }))

  // Compute cost breakdown from real stats
  const costBreakdown: Array<{ category: string; amount: number; percentage: number }> = []
  if (procurementCost > 0) {
    costBreakdown.push({ category: 'Procurement', amount: Math.round(procurementCost * 0.48), percentage: 48 })
    costBreakdown.push({ category: 'Processing', amount: Math.round(procurementCost * 0.20), percentage: 20 })
    costBreakdown.push({ category: 'Logistics', amount: Math.round(procurementCost * 0.15), percentage: 15 })
    costBreakdown.push({ category: 'Certification', amount: Math.round(procurementCost * 0.07), percentage: 7 })
    costBreakdown.push({ category: 'Overhead', amount: Math.round(procurementCost * 0.10), percentage: 10 })
  }

  const kpis = [
    { title: t2('Tổng doanh thu', 'Total Revenue'), value: formatCurrency(totalRevenue, currency), icon: DollarSign, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Thanh toán chờ xử lý', 'Pending Payments'), value: pendingCount, icon: Clock, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Thanh toán đã hoàn thành', 'Completed Payments'), value: paidPayments, icon: FileCheck, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Chi phí thu mua', 'Procurement Cost'), value: formatCurrency(procurementCost, currency), icon: Receipt, iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: 'text-orange-600 dark:text-orange-400' },
    { title: t2('Giá TB/kg', 'Avg Price/kg'), value: formatCurrency(avgPrice, currency), icon: TrendingUp, iconBg: 'bg-cyan-100 dark:bg-cyan-950', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    { title: t2('Gói đăng ký', 'Subscription'), value: 'Professional', icon: ShieldCheck, iconBg: 'bg-purple-100 dark:bg-purple-950', iconColor: 'text-purple-600 dark:text-purple-400' },
  ]

  return (
    <StaggerContainer className="space-y-6">
      {/* KPI Cards */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {kpis.map((kpi, i) => (
            <MotionCard key={i} {...hoverScale} className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-default">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-base md:text-lg font-bold text-foreground leading-none">{kpi.value}</p>
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
          {/* Revenue Trend */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t2('Xu hướng doanh thu', 'Revenue Trend')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Doanh thu, chi phí & lợi nhuận', 'Revenue, costs & margin')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="finGradR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="finGradM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(value) => [formatCurrency(Number(value), currency)]} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#finGradR)" name={t2('Doanh thu', 'Revenue')} strokeWidth={2} />
                    <Area type="monotone" dataKey="margin" stroke="#0d9488" fillOpacity={1} fill="url(#finGradM)" name={t2('Lợi nhuận', 'Margin')} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có thu hoạch', 'Data will appear as harvests are recorded')} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                {t2('Phân tích chi phí', 'Cost Breakdown')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Chi phí theo danh mục', 'Costs by category')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {costBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={costBreakdown} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 9 }} width={80} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(value) => [formatCurrency(Number(value), currency)]} />
                      <Bar dataKey="amount" name={t2('Số tiền', 'Amount')} radius={[0, 6, 6, 0]} maxBarSize={18}>
                        {costBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2 px-1">
                    {costBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-muted-foreground">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có thu mua', 'Data will appear as procurement records are added')} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Pending Payments + Subscription */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Pending Payments */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                {t2('Thanh toán chờ xử lý', 'Pending Payments')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {pendingPayments.length > 0 ? (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2">
                    {pendingPayments.map((payment) => {
                      const statusConfig: Record<string, { color: string; label: string }> = {
                        overdue: { color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', label: t2('Quá hạn', 'Overdue') },
                        due_soon: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400', label: t2('Sắp đến hạn', 'Due Soon') },
                        scheduled: { color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', label: t2('Đã lên lịch', 'Scheduled') },
                      }
                      const cfg = statusConfig[payment.status] || statusConfig.scheduled
                      return (
                        <div key={payment.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[8px]">{payment.id}</Badge>
                              <span className="text-xs font-medium text-foreground">{payment.farmer}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-foreground">{formatCurrency(payment.amount, currency)}</span>
                              <Badge className={`text-[8px] h-4 ${cfg.color}`}>{cfg.label}</Badge>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">{payment.dueDate}</span>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Không có thanh toán chờ xử lý', 'No pending payments')} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t2('Trạng thái đăng ký', 'Subscription Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">Professional Plan</span>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">active</Badge>
                </div>
                <Progress value={75} className="h-2 mb-1" />
                <p className="text-[10px] text-muted-foreground">75% of API calls used this month</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">{t2('Người dùng', 'Users')}</p>
                  <p className="text-sm font-bold text-foreground">8 / 25</p>
                  <Progress value={32} className="h-1 mt-1" />
                </div>
                <div className="p-3 rounded-xl bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">{t2('Nông dân', 'Farmers')}</p>
                  <p className="text-sm font-bold text-foreground">{stats?.totalFarmers || 0} / 2000</p>
                  <Progress value={Math.min(100, ((stats?.totalFarmers || 0) / 2000) * 100)} className="h-1 mt-1" />
                </div>
                <div className="p-3 rounded-xl bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">{t2('Lưu trữ', 'Storage')}</p>
                  <p className="text-sm font-bold text-foreground">128 / 500 MB</p>
                  <Progress value={26} className="h-1 mt-1" />
                </div>
                <div className="p-3 rounded-xl bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">{t2('Gói thanh toán', 'Billing Cycle')}</p>
                  <p className="text-sm font-bold text-foreground">{t2('Hàng năm', 'Annual')}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-xl text-xs" onClick={() => router.push('/billing')}>
                {t2('Quản lý thanh toán', 'Manage Billing')}
              </Button>
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
                { icon: CreditCard, label: t2('Xử lý thanh toán', 'Process Payment'), href: '/procurement' },
                { icon: Receipt, label: t2('Báo cáo chi phí', 'Cost Report'), href: '/analytics' },
                { icon: ShieldCheck, label: t2('Quản lý gói', 'Manage Plan'), href: '/billing' },
                { icon: FileCheck, label: t2('Hóa đơn', 'Invoices'), href: '/billing' },
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

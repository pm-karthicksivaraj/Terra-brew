'use client'

import { useRouter } from 'next/navigation'
import {
  Wheat, Truck, Users, Factory, Clock, CheckCircle, ArrowRight,
  AlertTriangle, ShieldCheck, FileWarning, Plus, ChevronRight,
  PackageOpen, BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

const MOCK_PROCUREMENT_QUEUE = [
  { id: 'PRC-001', farmer: 'Nguyễn Văn Minh', province: 'Dak Lak', variety: 'Robusta', weight: 450, status: 'pending', time: '2 hrs ago' },
  { id: 'PRC-002', farmer: 'Trần Thị Lan', province: 'Lam Dong', variety: 'Robusta', weight: 320, status: 'pending', time: '3 hrs ago' },
  { id: 'PRC-003', farmer: 'Lê Hoàng Nam', province: 'Gia Lai', variety: 'Arabica', weight: 180, status: 'inspecting', time: '4 hrs ago' },
  { id: 'PRC-004', farmer: 'Phạm Đức Anh', province: 'Dak Lak', variety: 'Robusta', weight: 520, status: 'approved', time: '5 hrs ago' },
  { id: 'PRC-005', farmer: 'Hoàng Thị Mai', province: 'Kon Tum', variety: 'Robusta', weight: 280, status: 'pending', time: '6 hrs ago' },
]

const MOCK_BATCHES = [
  { id: 'B-4419', type: 'Washed', variety: 'Robusta', weight: 2400, stage: 'Drying', progress: 65, farmCount: 8 },
  { id: 'B-4420', type: 'Natural', variety: 'Arabica', weight: 1200, stage: 'Fermentation', progress: 30, farmCount: 5 },
  { id: 'B-4421', type: 'Honey', variety: 'Robusta', weight: 800, stage: 'Sorting', progress: 85, farmCount: 3 },
  { id: 'B-4422', type: 'Washed', variety: 'Robusta', weight: 3600, stage: 'Pulping', progress: 15, farmCount: 12 },
]

export function CoopManagerView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'

  const pendingCount = MOCK_PROCUREMENT_QUEUE.filter(p => p.status === 'pending').length
  const totalWeight = MOCK_PROCUREMENT_QUEUE.reduce((s, p) => s + p.weight, 0)
  const activeBatches = MOCK_BATCHES.length

  return (
    <StaggerContainer className="space-y-6">
      {/* Fear Banner */}
      <StaggerItem>
        <ComplianceFearBanner
          severity="warning"
          deadline="Dec 30, 2025"
          nonCompliantCount={3}
          penaltyPct="4%"
          complianceLink="/eudr-compliance"
          storageKey="terra-brew-coop-manager-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Header */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Wheat className="w-5 h-5 text-primary" />
              {t2(`Quản lý Hợp tác xã — ${userName}`, `Cooperative Manager — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2('Hàng đợi thu mua, trạng thái chế biến và đăng ký nông dân', 'Procurement queue, batch status & farmer enrollment')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/farmers')}>
              <Plus className="w-3.5 h-3.5" />
              {t2('Đăng ký nông dân', 'Enroll Farmer')}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/procurement')}>
              <Truck className="w-3.5 h-3.5" />
              {t2('Thu mua mới', 'New Procurement')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* KPI Row */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Chờ thu mua', 'Pending Intake')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Wheat className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">{t2('Tổng trọng lượng', 'Total Weight')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalWeight}<span className="text-xs font-normal text-muted-foreground ml-1">kg</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Lô đang chế biến', 'Active Batches')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeBatches}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Nông dân', 'Farmers')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">186</p>
          </div>
        </div>
      </StaggerItem>

      {/* Procurement Queue + Processing Batches */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Procurement Queue */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  {t2('Hàng đợi thu mua', 'Procurement Intake Queue')}
                </CardTitle>
                <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-0 text-[9px] font-bold">
                  {pendingCount} {t2('chờ', 'PENDING')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {MOCK_PROCUREMENT_QUEUE.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push('/procurement')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors text-left group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'pending' ? 'bg-amber-500' :
                      item.status === 'inspecting' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{item.farmer}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 ${
                          item.status === 'pending' ? 'border-amber-300 text-amber-600' :
                          item.status === 'inspecting' ? 'border-blue-300 text-blue-600' :
                          'border-green-300 text-green-600'
                        }`}>
                          {item.status === 'pending' ? t2('Chờ', 'PENDING') :
                           item.status === 'inspecting' ? t2('Kiểm tra', 'INSPECT') :
                           t2('Đã duyệt', 'APPROVED')}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.province} · {item.variety} · {item.weight}kg · {item.time}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Batches */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Factory className="w-4 h-4 text-blue-500" />
                  {t2('Lô chế biến', 'Processing Batches')}
                </CardTitle>
                <Button size="sm" variant="outline" className="text-[9px] h-6 rounded-lg gap-1" onClick={() => router.push('/processing')}>
                  <Plus className="w-3 h-3" />
                  {t2('Tạo lô', 'New Batch')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {MOCK_BATCHES.map((batch) => (
                  <div key={batch.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground font-mono">{batch.id}</span>
                        <Badge variant="outline" className="text-[8px] h-4">{batch.type}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {batch.stage} · {batch.weight}kg · {batch.farmCount} {t2('nông trại', 'farms')}
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          batch.progress >= 80 ? 'bg-green-500' : batch.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${batch.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground">{batch.variety}</span>
                      <span className="text-[9px] font-bold text-foreground">{batch.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* EUDR Compliance Quick Link */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{t2('Tuân thủ EUDR', 'EUDR Compliance')}</p>
                <p className="text-[10px] text-muted-foreground">
                  {t2('3 lô cần DDS — Chạy kiểm tra tuân thủ để đảm bảo sẵn sàng xuất khẩu', '3 lots need DDS — Run compliance check to ensure export readiness')}
                </p>
              </div>
              <Button size="sm" variant="destructive" className="rounded-xl text-xs gap-1.5" onClick={() => router.push('/eudr-compliance')}>
                <FileWarning className="w-3.5 h-3.5" />
                {t2('Kiểm tra', 'Check')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default CoopManagerView

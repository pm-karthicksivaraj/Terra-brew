'use client'

import { useRouter } from 'next/navigation'
import {
  ClipboardList, Users, MapPin, CheckCircle, Clock,
  Plus, ChevronRight, Smartphone, Wifi, WifiOff,
  ArrowRight, CalendarDays, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

const MOCK_TASKS = [
  { id: '1', type: 'register', titleVi: 'Đăng ký nông dân mới', titleEn: 'Register new farmer', detailVi: 'Nguyễn Văn Hùng — Dak Lak', detailEn: 'Nguyễn Văn Hùng — Dak Lak', priority: 'high', due: 'Today' },
  { id: '2', type: 'map', titleVi: 'Lập bản đồ mảnh đất', titleEn: 'Map farm plot GPS', detailVi: 'Plot P-302 cho Farm F-1087', detailEn: 'Plot P-302 for Farm F-1087', priority: 'high', due: 'Today' },
  { id: '3', type: 'verify', titleVi: 'Xác minh tọa độ GPS', titleEn: 'Verify GPS coordinates', detailVi: '3 mảnh đất chưa xác minh — Lam Dong', detailEn: '3 unmapped plots — Lam Dong', priority: 'medium', due: 'Today' },
  { id: '4', type: 'register', titleVi: 'Đăng ký nông dân mới', titleEn: 'Register new farmer', detailVi: 'Trần Thị Lan — Dak Lak', detailEn: 'Trần Thị Lan — Dak Lak', priority: 'medium', due: 'Tomorrow' },
  { id: '5', type: 'harvest', titleVi: 'Cập nhật thu hoạch', titleEn: 'Update harvest record', detailVi: 'Farm F-2034 — Robusta 450kg', detailEn: 'Farm F-2034 — Robusta 450kg', priority: 'low', due: 'This week' },
  { id: '6', type: 'map', titleVi: 'Lập bản đồ mảnh đất', titleEn: 'Map farm plot GPS', detailVi: '2 mảnh đất mới — Gia Lai', detailEn: '2 new plots — Gia Lai', priority: 'medium', due: 'This week' },
]

export function FieldOfficerView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'

  const todayTasks = MOCK_TASKS.filter(t => t.due === 'Today')
  const highPriority = MOCK_TASKS.filter(t => t.priority === 'high')

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
          storageKey="terra-brew-field-officer-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Header */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {t2(`Nhiệm vụ hôm nay — ${userName}`, `Today's Tasks — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2(`${todayTasks.length} nhiệm vụ hôm nay · ${highPriority.length} ưu tiên cao`, `${todayTasks.length} tasks today · ${highPriority.length} high priority`)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/farmers')}>
              <Plus className="w-3.5 h-3.5" />
              {t2('Đăng ký nông dân', 'Register Farmer')}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/farmlands')}>
              <MapPin className="w-3.5 h-3.5" />
              {t2('Lập bản đồ mảnh đất', 'Map Plot')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* Quick Stats + Sync Status */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">{t2('Hôm nay', 'Today')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{todayTasks.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Ưu tiên cao', 'High Priority')}</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highPriority.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Nông dân đã đăng ký', 'Registered')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">186</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] text-muted-foreground">{t2('Mảnh đất đã map', 'Mapped Plots')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">148</p>
          </div>
        </div>
      </StaggerItem>

      {/* Task List + Sync Status */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Task List */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    {t2('Danh sách nhiệm vụ', 'Task List')}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[8px] h-5 cursor-pointer">{t2('Hôm nay', 'Today')}</Badge>
                    <Badge variant="outline" className="text-[8px] h-5 cursor-pointer opacity-60">{t2('Tuần này', 'This Week')}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {MOCK_TASKS.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        if (task.type === 'register') router.push('/farmers')
                        else if (task.type === 'map') router.push('/farmlands')
                        else router.push('/farmers')
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors text-left group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        task.type === 'register' ? 'bg-green-100 dark:bg-green-900/40' :
                        task.type === 'map' ? 'bg-blue-100 dark:bg-blue-900/40' :
                        task.type === 'verify' ? 'bg-amber-100 dark:bg-amber-900/40' :
                        'bg-primary/10'
                      }`}>
                        {task.type === 'register' ? <Users className="w-4 h-4 text-green-600" /> :
                         task.type === 'map' ? <MapPin className="w-4 h-4 text-blue-600" /> :
                         task.type === 'verify' ? <CheckCircle className="w-4 h-4 text-amber-600" /> :
                         <ClipboardList className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{t2(task.titleVi, task.titleEn)}</span>
                          {task.priority === 'high' && (
                            <Badge variant="destructive" className="text-[8px] h-4">{t2('Gấp', 'URGENT')}</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t2(task.detailVi, task.detailEn)} · {task.due}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Status + Quick Links */}
          <div className="space-y-4">
            {/* Offline Sync Status */}
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  {t2('Đồng bộ ngoại tuyến', 'Offline Sync')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-foreground">{t2('Đã kết nối', 'Connected')}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{t2('Chờ tải lên', 'Pending uploads')}</span>
                    <span className="font-bold text-foreground">3</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{t2('Lần đồng bộ cuối', 'Last sync')}</span>
                    <span className="font-bold text-foreground">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{t2('Dữ liệu đã tải', 'Data cached')}</span>
                    <span className="font-bold text-foreground">186 records</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full rounded-xl text-xs gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  {t2('Đồng bộ ngay', 'Sync Now')}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <button onClick={() => router.push('/farmers')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/30 transition-colors text-left">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{t2('Danh sách nông dân', 'Farmer Directory')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </button>
                <button onClick={() => router.push('/farmlands')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/30 transition-colors text-left">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{t2('Mảnh đất', 'Farm Lands')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </button>
                <button onClick={() => router.push('/harvest')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/30 transition-colors text-left">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{t2('Truy xuất thu hoạch', 'Harvest Records')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default FieldOfficerView

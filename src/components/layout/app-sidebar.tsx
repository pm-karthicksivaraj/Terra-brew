'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Users, MapPin, Sprout,
  TreePine, Tractor, Activity, FlaskConical, Shield,
  Wheat, Truck, Factory,
  Award, ClipboardCheck, FileText, Store,
  UserCog, Link2, QrCode, GitBranch, Nfc,
  Coffee, ChevronLeft, ChevronRight, Globe,
  Droplets, Beaker, Waves, Sun, Hammer, Filter, Flame,
  Package, Ship, Warehouse as WarehouseIcon, Truck as TruckIcon, Store as StoreIcon,
  ShieldCheck, FileCheck, CreditCard, Key, Thermometer,
  TrendingUp, Anchor, Satellite, ShoppingBag,
  Radio, CheckSquare, Truck as TruckIcon2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ─── Navigation types ────────────────────────────────────────────

interface NavItem {
  label: string
  labelVi: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  title: string
  titleVi: string
  items: NavItem[]
}

// ─── Navigation definition ───────────────────────────────────────

const NAVIGATION: NavGroup[] = [
  {
    title: 'Core',
    titleVi: 'Chính',
    items: [
      { label: 'Dashboard', labelVi: 'Bảng điều khiển', href: '/dashboard', icon: BarChart3 },
      { label: 'Farmers', labelVi: 'Nông dân', href: '/farmers', icon: Users },
      { label: 'Farm Lands', labelVi: 'Đất nông trại', href: '/farmlands', icon: MapPin },
      { label: 'Cultivations', labelVi: 'Canh tác', href: '/cultivations', icon: Sprout },
    ],
  },
  {
    title: 'Farm Management',
    titleVi: 'Quản lý nông trại',
    items: [
      { label: 'Nurseries', labelVi: 'Vườn ươm', href: '/nurseries', icon: TreePine },
      { label: 'Land Preparation', labelVi: 'Chuẩn bị đất', href: '/land-preparations', icon: Tractor },
      { label: 'Crop Monitoring', labelVi: 'Giám sát cây trồng', href: '/crop-monitorings', icon: Activity },
      { label: 'Fertilizer', labelVi: 'Phân bón', href: '/fertilizer-apps', icon: FlaskConical },
      { label: 'Pest & Disease', labelVi: 'Sâu bệnh', href: '/pest-disease', icon: Shield },
    ],
  },
  {
    title: 'Supply Chain',
    titleVi: 'Chuoi cung ung',
    items: [
      { label: 'Harvest', labelVi: 'Thu hoach', href: '/harvest', icon: Wheat },
      { label: 'Procurement', labelVi: 'Thu mua', href: '/procurement', icon: Truck },
      { label: 'Processing', labelVi: 'Che bien', href: '/processing', icon: Factory },
      { label: 'Processing Wizard', labelVi: 'Tao lenh CB 7 buoc', href: '/processing/wizard', icon: Factory },
      { label: 'Track Journey', labelVi: 'Truy xuat hanh trinh', href: '/traceability', icon: GitBranch },
    ],
  },
  {
    title: 'Processing Stages',
    titleVi: 'Cac buoc che bien',
    items: [
      { label: 'Pulping', labelVi: 'Xoac', href: '/processing/stages/pulping', icon: Droplets },
      { label: 'Fermentation', labelVi: 'Len men', href: '/processing/stages/fermentation', icon: Beaker },
      { label: 'Washing', labelVi: 'Rua', href: '/processing/stages/washing', icon: Waves },
      { label: 'Drying', labelVi: 'Say', href: '/processing/stages/drying', icon: Sun },
      { label: 'Hulling', labelVi: 'Bachop', href: '/processing/stages/hulling', icon: Hammer },
      { label: 'Sorting/Grading', labelVi: 'Phan loai', href: '/processing/stages/sorting', icon: Filter },
      { label: 'Roasting', labelVi: 'Rang', href: '/processing/stages/roasting', icon: Flame },
      { label: 'Packaging', labelVi: 'Đóng gói', href: '/processing/stages/packaging', icon: Package },
      { label: 'Export', labelVi: 'Xuất khẩu', href: '/processing/stages/export', icon: Ship },
      { label: 'Warehouse', labelVi: 'Kho bãi', href: '/processing/stages/warehouse', icon: WarehouseIcon },
      { label: 'Distribution', labelVi: 'Phân phối', href: '/processing/stages/distribution', icon: TruckIcon },
      { label: 'Retail', labelVi: 'Bán lẻ', href: '/processing/stages/retail', icon: StoreIcon },
    ],
  },
  {
    title: 'Compliance & Trade',
    titleVi: 'Tuân thủ & Thương mại',
    items: [
      { label: 'Certifications', labelVi: 'Chứng nhận', href: '/cert-assessments', icon: Award },
      { label: 'Inspections', labelVi: 'Kiểm tra', href: '/coffee-inspections', icon: ClipboardCheck },
      { label: 'Smart Contracts', labelVi: 'HĐ thông minh', href: '/smart-contracts', icon: FileText },
      { label: 'Marketplace', labelVi: 'Thị trường', href: '/marketplace', icon: Store },
    ],
  },
  {
    title: 'B2B & Compliance',
    titleVi: 'B2B & Tuân thủ',
    items: [
      { label: 'EUDR Compliance', labelVi: 'Tuân thủ EUDR', href: '/eudr-compliance', icon: Shield },
      { label: 'Export Documents', labelVi: 'Tài liệu xuất khẩu', href: '/export-docs', icon: FileText },
      { label: 'Shipments', labelVi: 'Lô hàng', href: '/shipments', icon: Ship },
      { label: 'Buyers', labelVi: 'Người mua', href: '/buyers', icon: Users },
      { label: 'Trading Desk', labelVi: 'Sàn giao dịch', href: '/trading-desk', icon: TrendingUp },
      { label: 'Deforestation', labelVi: 'Rủi ro phá rừng', href: '/deforestation', icon: TreePine },
    ],
  },
  {
    title: 'Platform',
    titleVi: 'Nền tảng',
    items: [
      { label: 'API & Webhooks', labelVi: 'API & Webhooks', href: '/api-settings', icon: Key },
      { label: 'IoT Sensors', labelVi: 'Cảm biến IoT', href: '/iot-sensors', icon: Radio },
      { label: 'QC Verification', labelVi: 'Kiểm định CL', href: '/qc-verifications', icon: CheckSquare },
      { label: 'Marketplace', labelVi: 'Thị trường tuân thủ', href: '/compliance-marketplace', icon: Store },
      { label: 'Analytics', labelVi: 'Phân tích', href: '/analytics', icon: BarChart3 },
      { label: 'Logistics', labelVi: 'Vận tải & Hải quan', href: '/logistics', icon: TruckIcon2 },
    ],
  },
  {
    title: 'Account',
    titleVi: 'Tài khoản',
    items: [
      { label: 'Billing', labelVi: 'Thanh toán', href: '/billing', icon: CreditCard },
    ],
  },
  {
    title: 'System',
    titleVi: 'Hệ thống',
    items: [
      { label: 'Users & Roles', labelVi: 'Người dùng & Vai trò', href: '/users', icon: UserCog },
      { label: 'Blockchain', labelVi: 'Blockchain', href: '/blockchain', icon: Link2 },
      { label: 'QR Verify', labelVi: 'Xác minh QR', href: '/qr-verify', icon: QrCode },
      { label: 'NFC Tags', labelVi: 'NFC Tags', href: '/nfc-tags', icon: Nfc },

    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────

function NavItemLink({
  item,
  collapsed,
  isActive,
  lang,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
  lang: 'vi' | 'en'
}) {
  const label = lang === 'vi' ? item.labelVi : item.label
  const Icon = item.icon

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition-all duration-200',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
      {!collapsed && (
          <span className="truncate overflow-hidden whitespace-nowrap">
            {label}
          </span>
        )}
</Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

function SidebarContent({
  collapsed,
  tenantName,
  userRole,
  lang,
  onLangToggle,
  onNavClick,
}: {
  collapsed: boolean
  tenantName: string
  userRole: string
  lang: 'vi' | 'en'
  onLangToggle: () => void
  onNavClick?: () => void
}) {
  const pathname = usePathname()

  const isActive = useMemo(
    () => (href: string) => {
      if (href === '/dashboard') return pathname === '/dashboard'
      return pathname.startsWith(href)
    },
    [pathname]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Tenant header */}
      <div className={cn('px-3 pt-4 pb-2', collapsed && 'px-2')}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-sidebar-foreground truncate">{tenantName || 'Terra Brew'}</p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate capitalize">{userRole?.replace('_', ' ')}</p>
              </div>
            )}
</div>
      </div>

      <Separator className="mx-3 my-1 bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-2 space-y-4">
          {NAVIGATION.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                  <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
                    {lang === 'vi' ? group.titleVi : group.title}
                  </p>
                )}
<div className="space-y-0.5">
                {group.items.map((item) => (
                  <div key={item.href} onClick={onNavClick}>
                    <NavItemLink
                      item={item}
                      collapsed={collapsed}
                      isActive={isActive(item.href)}
                      lang={lang}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="mx-3 bg-sidebar-border" />

      {/* Footer: Language toggle */}
      <div className={cn('px-3 py-3', collapsed && 'px-2')}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLangToggle}
          className={cn(
            'w-full gap-2 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 text-xs rounded-xl',
            collapsed && 'justify-center px-2'
          )}
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && (
              <span className="overflow-hidden whitespace-nowrap">
                {lang === 'vi' ? 'Tiếng Anh' : 'Tiếng Việt'}
              </span>
            )}
{!collapsed && (
            <span className="ml-auto text-[10px] font-bold text-sidebar-foreground/50">
              {lang === 'vi' ? 'VI' : 'EN'}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

// ─── Main AppSidebar ──────────────────────────────────────────────

interface AppSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  tenantName: string
  userRole: string
  lang: 'vi' | 'en'
  onLangToggle: () => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  tenantName,
  userRole,
  lang,
  onLangToggle,
  mobileOpen,
  onMobileOpenChange,
}: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar-background border-r border-sidebar-border"
>
        <SidebarContent
          collapsed={collapsed}
          tenantName={tenantName}
          userRole={userRole}
          lang={lang}
          onLangToggle={onLangToggle}
        />

        {/* Collapse toggle button */}
        <div className="px-2 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-xl h-8"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar-background border-sidebar-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            collapsed={false}
            tenantName={tenantName}
            userRole={userRole}
            lang={lang}
            onLangToggle={onLangToggle}
            onNavClick={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

'use client'

import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Menu, LogOut, Coffee, Globe, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useI18n } from '@/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { AppSidebar } from '@/components/layout/app-sidebar'

// ─── Breadcrumb map ───────────────────────────────────────────────

const BREADCRUMB_MAP: Record<string, { en: string; vi: string }> = {
  dashboard: { en: 'Dashboard', vi: 'Bảng điều khiển' },
  farmers: { en: 'Farmers', vi: 'Nông dân' },
  farmlands: { en: 'Farm Lands', vi: 'Đất nông trại' },
  cultivations: { en: 'Cultivations', vi: 'Canh tác' },
  nurseries: { en: 'Nurseries', vi: 'Vườn ươm' },
  'land-preparations': { en: 'Land Preparation', vi: 'Chuẩn bị đất' },
  'crop-monitorings': { en: 'Crop Monitoring', vi: 'Giám sát cây trồng' },
  'fertilizer-apps': { en: 'Fertilizer', vi: 'Phân bón' },
  'pest-disease': { en: 'Pest & Disease', vi: 'Sâu bệnh' },
  harvest: { en: 'Harvest', vi: 'Thu hoạch' },
  procurement: { en: 'Procurement', vi: 'Thu mua' },
  processing: { en: 'Processing', vi: 'Chế biến' },
  wizard: { en: 'Wizard', vi: 'Tạo lệnh' },
  'cert-assessments': { en: 'Certifications', vi: 'Chứng nhận' },
  'coffee-inspections': { en: 'Inspections', vi: 'Kiểm tra' },
  'smart-contracts': { en: 'Smart Contracts', vi: 'HĐ thông minh' },
  marketplace: { en: 'Marketplace', vi: 'Thị trường' },
  users: { en: 'Users & Roles', vi: 'Người dùng & Vai trò' },
  blockchain: { en: 'Blockchain', vi: 'Blockchain' },
  'qr-verify': { en: 'QR Verify', vi: 'Xac minh QR' },
  'nfc-tags': { en: 'NFC Tags', vi: 'NFC Tags' },
  traceability: { en: 'Traceability', vi: 'Truy xuat' },
  stages: { en: 'Stages', vi: 'Cac buoc' },
  pulping: { en: 'Pulping', vi: 'Xoac' },
  fermentation: { en: 'Fermentation', vi: 'Len men' },
  washing: { en: 'Washing', vi: 'Rua' },
  drying: { en: 'Drying', vi: 'Say' },
  hulling: { en: 'Hulling', vi: 'Bachop' },
  sorting: { en: 'Sorting/Grading', vi: 'Phan loai' },
  roasting: { en: 'Roasting', vi: 'Rang' },
  packaging: { en: 'Packaging', vi: 'Đóng gói' },
  export: { en: 'Export', vi: 'Xuất khẩu' },
  warehouse: { en: 'Warehouse', vi: 'Kho bãi' },
  distribution: { en: 'Distribution', vi: 'Phân phối' },
  retail: { en: 'Retail', vi: 'Bán lẻ' },
  'eudr-compliance': { en: 'EUDR Compliance', vi: 'Tuân thủ EUDR' },
  'carbon-tracking': { en: 'Carbon Tracking', vi: 'Theo dõi Carbon' },
  'new': { en: 'New Record', vi: 'Tạo mới' },
  'export-docs': { en: 'Export Documents', vi: 'Tài liệu Xuất khẩu' },
  deforestation: { en: 'Deforestation', vi: 'Phá rừng' },
  shipments: { en: 'Shipments', vi: 'Vận chuyển' },
  buyers: { en: 'Buyers', vi: 'Người mua' },
  'trading-desk': { en: 'Trading Desk', vi: 'Mặt bằng Giao dịch' },
  'qc-verifications': { en: 'QC Verifications', vi: 'Xác minh QC' },
  'iot-sensors': { en: 'IoT Sensors', vi: 'Cảm biến IoT' },
  analytics: { en: 'Analytics', vi: 'Phân tích' },
  logistics: { en: 'Logistics', vi: 'Logistics' },
  rfq: { en: 'RFQ Management', vi: 'Quản lý RFQ' },
  inspections: { en: 'Inspection Service', vi: 'Dịch vụ kiểm tra' },
  'product-monitoring': { en: 'Product Monitoring', vi: 'Giám sát sản phẩm' },
  'compliance-marketplace': { en: 'Compliance Marketplace', vi: 'Thị trường Tuân thủ' },
  billing: { en: 'Billing', vi: 'Thanh toán' },
  'api-settings': { en: 'API Settings', vi: 'Cài đặt API' },
  'buyer-portal': { en: 'Buyer Portal', vi: 'Cổng người mua' },
  'esg-reporting': { en: 'ESG Reporting', vi: 'Báo cáo ESG' },
  'trust-score': { en: 'Trust Score™', vi: 'Trust Score™' },
  'climate-intelligence': { en: 'Climate Intelligence', vi: 'Khí hậu thông minh' },
}

// ─── Animation variants ───────────────────────────────────────────
// All animations use CSS keyframes defined in globals.css.
// No framer-motion exit animations — they cause React 19 removeChild errors.

// Theme toggle icon — no exit animations to prevent React 19 removeChild errors.
// We use simple CSS transitions instead of AnimatePresence.

// ─── Helpers ───────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function useIsDesktop(breakpoint = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches)
    onChange(mql)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isDesktop
}

// ─── Component ────────────────────────────────────────────────────

interface DashboardShellProps {
  children: ReactNode
  /** @deprecated Use useI18n() hook instead — lang is now managed globally */
  lang?: string
  /** @deprecated Use useI18n() hook instead — lang is now managed globally */
  onLangToggle?: () => void
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isDesktop = useIsDesktop()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t, t2 } = useI18n()

  // Hydration guard: only render dynamic layout after client mount.
  const [mounted, setMounted] = useState(false)

  // Sidebar collapse state persisted to localStorage
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Read localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch {
      // ignore storage errors
    }
    setMounted(true)
  }, [])

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sidebar-collapsed', String(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [])

  // Build breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/')
      const label = BREADCRUMB_MAP[seg]
      return {
        label: label ? (lang === 'vi' ? label.vi : label.en) : seg,
        href,
        isLast: idx === segments.length - 1,
      }
    })
  }, [pathname, lang])

  const tenantName = session?.user?.tenantName || 'Terra Brew'
  const userName = session?.user?.name || 'User'
  const userRole = session?.user?.role || 'viewer'
  const entityType = session?.user?.entityType || 'producer'

  const onLangToggle = () => {
    const locales: string[] = ['vi', 'en', 'pt', 'am', 'sw']
    const idx = locales.indexOf(lang)
    setLang(locales[(idx + 1) % locales.length] as any)
  }

  // Compute margin-left: only on desktop, matches sidebar width
  const marginLeft = mounted && isDesktop ? (collapsed ? 72 : 256) : 0

  // Before client mount, render a minimal shell that matches the server output.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">...</span>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        tenantName={tenantName}
        userRole={userRole}
        entityType={entityType}
        lang={lang}
        onLangToggle={onLangToggle}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      {/* Main area — offset by sidebar width on desktop */}
      <div
        className="flex flex-col min-h-screen transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft }}
        suppressHydrationWarning
      >
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
            {/* Left: hamburger (mobile) + breadcrumb */}
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-foreground hover:text-foreground -ml-1"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>

              {/* Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, idx) => (
                    <BreadcrumbItem key={crumb.href}>
                      {idx > 0 && <BreadcrumbSeparator />}
                      {crumb.isLast ? (
                        <BreadcrumbPage className="text-sm text-foreground font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href} className="text-sm text-muted-foreground hover:text-foreground">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Right: theme toggle + language toggle + user menu */}
            <div className="flex items-center gap-2">
              {/* Theme toggle — simple CSS transition to avoid React 19 removeChild errors */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground text-xs rounded-xl relative w-9 h-9 p-0 flex items-center justify-center"
                aria-label="Toggle theme"
              >
                <div className="transition-transform duration-200 hover:rotate-12">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </div>
              </Button>

              {/* Language toggle (compact, in header) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLangToggle}
                className="gap-1 text-muted-foreground hover:text-foreground text-xs rounded-xl"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang.toUpperCase()}
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-xl px-2 hover:bg-accent">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-xs font-medium text-foreground">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium text-foreground">{userName}</p>
                      <Badge variant="outline" className="w-fit text-[10px] capitalize">
                        {userRole.replace('_', ' ')}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 text-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    {t('auth.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area with page enter animation */}
        {/* Using CSS animation instead of framer-motion AnimatePresence to prevent
            React 19 removeChild errors. The key forces re-mount on route change. */}
        <div
          key={pathname}
          className="flex-1 animate-slide-in-up"
        >
          <main className="px-4 md:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-border bg-card/60">
          <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Coffee className="w-3 h-3" />
              <span>{t('app.footer')}</span>
            </div>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, LogOut, Coffee, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  'cert-assessments': { en: 'Certifications', vi: 'Chứng nhận' },
  'coffee-inspections': { en: 'Inspections', vi: 'Kiểm tra' },
  'smart-contracts': { en: 'Smart Contracts', vi: 'HĐ thông minh' },
  marketplace: { en: 'Marketplace', vi: 'Thị trường' },
  users: { en: 'Users & Roles', vi: 'Người dùng & Vai trò' },
  blockchain: { en: 'Blockchain', vi: 'Blockchain' },
  'qr-verify': { en: 'QR Verify', vi: 'Xác minh QR' },
  'nfc-tags': { en: 'NFC Tags', vi: 'NFC Tags' },
  traceability: { en: 'Traceability', vi: 'Truy xuất' },
}

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
  lang: 'vi' | 'en'
  onLangToggle: () => void
}

export function DashboardShell({ children, lang, onLangToggle }: DashboardShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isDesktop = useIsDesktop()

  // Hydration guard: only render dynamic layout after client mount.
  // This prevents removeChild errors from margin-left / collapsed state
  // differing between server and client.
  const [mounted, setMounted] = useState(false)

  // Sidebar collapse state persisted to localStorage
  // Initialize with false (server-safe), then read from localStorage in effect
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

  // Mobile drawer is closed via onNavClick callback in AppSidebar when user clicks a nav item
  // No pathname-based effect to avoid lint violation with setState-in-effect

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
  const userRole = session?.user?.role || ''

  // Compute margin-left: only on desktop, matches sidebar width
  // Before mount, always use 0 to match SSR output and prevent hydration mismatch
  const marginLeft = mounted && isDesktop ? (collapsed ? 64 : 256) : 0

  // Before client mount, render a minimal shell that matches the server output.
  // After mount, render the full dynamic layout.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-coffee-50/50" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-coffee-200/50">
            <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-coffee-500">...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-coffee-500">...</span>
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
    <div className="min-h-screen bg-coffee-50/50" style={{ fontFamily: '"Space Mono", monospace' }} suppressHydrationWarning>
      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        tenantName={tenantName}
        userRole={userRole}
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-coffee-200/50">
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
            {/* Left: hamburger (mobile) + breadcrumb */}
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-coffee-600 hover:text-coffee-900 -ml-1"
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
                        <BreadcrumbPage className="text-xs text-coffee-800 font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href} className="text-xs text-coffee-500 hover:text-coffee-800">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Right: language toggle + user menu */}
            <div className="flex items-center gap-2">
              {/* Language toggle (compact, in header) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLangToggle}
                className="gap-1 text-coffee-500 hover:text-coffee-800 text-xs rounded-xl"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'EN' : 'VI'}
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-xl px-2 hover:bg-coffee-50">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-gradient-to-br from-coffee-500 to-coffee-800 text-white text-[10px] font-bold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-xs font-medium text-coffee-700">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium text-coffee-800">{userName}</p>
                      <Badge variant="outline" className="w-fit text-[10px] border-coffee-300 capitalize">
                        {userRole.replace('_', ' ')}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 text-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    {lang === 'vi' ? 'Đăng xuất' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-coffee-100 bg-white/60">
          <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between text-[10px] text-coffee-400">
            <div className="flex items-center gap-1.5">
              <Coffee className="w-3 h-3" />
              <span>Terra Brew Coffee Platform</span>
            </div>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

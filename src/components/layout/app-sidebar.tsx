'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Users, MapPin, Sprout,
  TreePine, Tractor, Activity, FlaskConical, Shield,
  Wheat, Truck, Factory,
  Award, ClipboardCheck, FileText, Store,
  UserCog, Coffee, ChevronLeft, ChevronRight, Globe, ChevronDown,
  CreditCard,
  TrendingUp, Ship,
  Radio, CheckCircle,
  LayoutDashboard, FileQuestion, Container, FileOutput,
  UserCheck, Route, Link as LinkIcon, Webhook,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'
import {
  getGroupedNavigation,
  ENTITY_TYPE_LABELS,
  ROLE_LABELS,
  type EntityType,
  type TenantRole,
  type ModuleDef,
} from '@/lib/module-config'

// ─── Icon lookup ──────────────────────────────────────────────────

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  Users,
  MapPin,
  Sprout,
  TreePine,
  Tractor,
  Activity,
  FlaskConical,
  Shield,
  Wheat,
  Truck,
  Factory,
  ClipboardCheck,
  CheckCircle,
  Award,
  Store,
  FileQuestion,
  FileText,
  TrendingUp,
  Ship,
  Container,
  FileOutput,
  UserCheck,
  Route,
  CreditCard,
  UserCog,
  Radio,
  Link: LinkIcon,
  Webhook,
}

function getIcon(iconName: string): LucideIcon {
  return LUCIDE_ICON_MAP[iconName] ?? BarChart3
}

// ─── Navigation types ────────────────────────────────────────────

interface NavItem {
  label: string
  labelVi: string
  href: string
  icon: LucideIcon
  color: string
}

interface NavGroupRender {
  id: string
  title: string
  titleVi: string
  items: NavItem[]
  defaultOpen: boolean
}

// ─── Sub-components ───────────────────────────────────────────────

function NavItemLink({
  item,
  collapsed,
  isActive,
  lang,
  onClick,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
  lang: string
  onClick?: () => void
}) {
  const label = item.label  // Already resolved to current locale in SidebarContent
  const Icon = item.icon

  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
        isActive
          ? 'bg-primary/20 text-primary font-semibold shadow-sm border-l-[3px] border-primary'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2 border-l-0'
      )}
    >
      <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
      {!collapsed && (
        <span className="truncate overflow-hidden whitespace-nowrap leading-tight">
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
  entityType,
  lang,
  onLangToggle,
  onNavClick,
}: {
  collapsed: boolean
  tenantName: string
  userRole: string
  entityType: string
  lang: string
  onLangToggle: () => void
  onNavClick?: () => void
}) {
  const pathname = usePathname()
  const { t } = useI18n()

  // Build dynamic navigation based on entity type and role
  const navigation = useMemo<NavGroupRender[]>(() => {
    const et = (entityType || 'producer') as EntityType
    const role = (userRole || 'viewer') as TenantRole
    const grouped = getGroupedNavigation(et, role)

    // Map module slugs to i18n nav keys
    const slugToNavKey: Record<string, string> = {
      'dashboard': 'nav.dashboard', 'farmers': 'nav.farmers', 'farmlands': 'nav.farmlands',
      'cultivations': 'nav.cultivations', 'nurseries': 'nav.nurseries',
      'land-preparations': 'nav.landPreparations', 'crop-monitorings': 'nav.cropMonitorings',
      'fertilizer-apps': 'nav.fertilizerApps', 'pest-disease-mgmts': 'nav.pestDiseaseMgmts',
      'harvest-traceabilities': 'nav.harvestTraceabilities', 'procurement': 'nav.procurement',
      'processing': 'nav.processing', 'coffee-inspections': 'nav.coffeeInspections',
      'qc-verifications': 'nav.coffeeInspections', 'eudr-compliance': 'nav.eudrCompliance',
      'cert-assessments': 'nav.certAssessments', 'deforestation': 'nav.cropMonitorings',
      'marketplace': 'nav.marketplace', 'rfq': 'nav.procurement',
      'inspections': 'nav.coffeeInspections', 'product-monitoring': 'nav.cropMonitorings',
      'smart-contracts': 'nav.smartContracts', 'trading-desk': 'nav.marketplace',
      'shipments': 'nav.procurementTransports', 'logistics': 'nav.procurementTransports',
      'export-docs': 'nav.export', 'buyers': 'nav.procurement',
      'trace-journey': 'nav.traceability', 'billing': 'nav.settings',
      'users': 'nav.users', 'iot-sensors': 'nav.cropMonitorings',
      'blockchain': 'nav.smartContracts', 'api-settings': 'nav.settings',
      'analytics': 'nav.reports',
      'carbon-tracking': 'nav.cropMonitorings',
    }

    return grouped.map(group => ({
      id: group.id,
      title: group.label,
      titleVi: group.labelVi,
      defaultOpen: group.defaultOpen,
      items: group.items.map((mod: ModuleDef) => {
        const navKey = slugToNavKey[mod.slug]
        const i18nLabel = navKey ? t(navKey) : undefined
        // Use i18n label if available and not just the key itself, otherwise fall back
        const resolvedLabel = (i18nLabel && !i18nLabel.includes('.')) ? i18nLabel : (lang === 'vi' ? mod.labelVi : mod.label)
        return {
          label: resolvedLabel,
          labelVi: mod.labelVi,
          href: mod.href,
          icon: getIcon(mod.icon),
          color: mod.color,
        }
      }),
    }))
  }, [entityType, userRole, lang, t])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navigation.forEach((group) => {
      initial[group.id] = group.defaultOpen ?? false
    })
    return initial
  })

  const isActive = useMemo(
    () => (href: string) => {
      if (href === '/dashboard') return pathname === '/dashboard'
      return pathname.startsWith(href)
    },
    [pathname]
  )

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Resolve labels for badges
  const entityTypeLabel = ENTITY_TYPE_LABELS[(entityType || 'producer') as EntityType]
  const roleLabel = ROLE_LABELS[(userRole || 'viewer') as TenantRole]

  return (
    <div className="flex flex-col h-full">
      {/* Tenant header */}
      <div className={cn('px-3 pt-4 pb-2', collapsed && 'px-2')}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-sidebar-foreground leading-tight">{tenantName || 'Terra Brew'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {entityTypeLabel && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0 h-4 border-primary/30 text-primary capitalize"
                  >
                    {(entityTypeLabel as any)[lang] || entityTypeLabel.en}
                  </Badge>
                )}
                {roleLabel && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-4 capitalize"
                  >
                    {(roleLabel as any)[lang] || roleLabel.en}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="mx-3 my-1 bg-sidebar-border" />

      {/* Navigation - scrollable */}
      <ScrollArea className="flex-1 px-2 overflow-y-auto">
        <div className="py-2 space-y-1">
          {navigation.map((group) => {
            const isGroupOpen = openGroups[group.id] ?? false
            const hasActiveItem = group.items.some((item) => isActive(item.href))

            return (
              <div key={group.id}>
                {collapsed ? (
                  /* Collapsed: just show icons */
                  <div className="space-y-0.5">
                    <div className="px-1 py-1">
                      <div className="w-full h-px bg-sidebar-border/60" />
                    </div>
                    {group.items.map((item) => (
                      <div key={item.href} onClick={onNavClick}>
                        <NavItemLink
                          item={item}
                          collapsed={collapsed}
                          isActive={isActive(item.href)}
                          lang={lang}
                          onClick={onNavClick}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Expanded: collapsible groups */
                  <div className="mb-1">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors',
                        hasActiveItem
                          ? 'text-primary/90'
                          : 'text-sidebar-foreground/55 hover:text-sidebar-foreground/75'
                      )}
                    >
                      <span className='text-left leading-tight'>{lang === 'vi' ? group.titleVi : lang === 'en' ? group.title : t('nav.' + group.id) !== 'nav.' + group.id ? t('nav.' + group.id) : group.title}</span>
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 transition-transform duration-200',
                          isGroupOpen ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    </button>
                    {isGroupOpen && (
                      <div className="space-y-0.5 overflow-hidden">
                        {group.items.map((item) => (
                          <div key={item.href} onClick={onNavClick}>
                            <NavItemLink
                              item={item}
                              collapsed={collapsed}
                              isActive={isActive(item.href)}
                              lang={lang}
                              onClick={onNavClick}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <Separator className="mx-3 bg-sidebar-border" />

      {/* Footer: Language toggle */}
      <div className={cn('px-3 py-3 shrink-0', collapsed && 'px-2')}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLangToggle}
          className={cn(
            'w-full gap-2 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 text-xs rounded-lg',
            collapsed && 'justify-center px-2'
          )}
        >
          <Globe className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="overflow-hidden whitespace-nowrap">
              {lang === 'vi' ? 'English' : lang === 'en' ? 'Português' : lang === 'pt' ? 'አማርኛ' : lang === 'am' ? 'Kiswahili' : 'Tiếng Việt'}
            </span>
          )}
          {!collapsed && (
            <span className="ml-auto text-[10px] font-bold text-sidebar-foreground/50">
              {lang.toUpperCase()}
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
  entityType: string  // from session
  lang: string
  onLangToggle: () => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  tenantName,
  userRole,
  entityType,
  lang,
  onLangToggle,
  mobileOpen,
  onMobileOpenChange,
}: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar-background border-r border-sidebar-border transition-all duration-300',
          collapsed ? 'w-18' : 'w-72'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          tenantName={tenantName}
          userRole={userRole}
          entityType={entityType}
          lang={lang}
          onLangToggle={onLangToggle}
        />

        {/* Collapse toggle button */}
        <div className="px-2 pb-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-lg h-8"
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
            entityType={entityType}
            lang={lang}
            onLangToggle={onLangToggle}
            onNavClick={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

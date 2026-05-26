'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MapPin, Sprout, ShieldCheck, ClipboardCheck,
  Package, QrCode, ChevronLeft, CreditCard, Leaf,
  Baby, Tractor, ScanSearch, FlaskConical, Bug, Wheat, FileText, Store, Award,
  Coffee, Route, Printer, BarChart3, ChevronDown, Truck, Building2,
  Factory, ClipboardList, TreePine, Sparkles, Cog, Plus,
  Sun, Filter, Flame, LogOut, Globe, Ship, Handshake, FileCheck, TreeDeciduous,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScaleIn } from '@/components/ui/animations'

// ======== DATABASE ICON (custom) ========
function Database(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}

// ======== NAV CONFIGURATION ========

interface NavChild {
  href: string
  label: string
  icon: React.ElementType
  roles?: string[] // If specified, only these roles can see this item
}

interface NavGroup {
  label: string
  icon: React.ElementType
  color: string
  children: NavChild[]
  roles?: string[] // If specified, only these roles can see this group
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Core Data',
    icon: Database,
    color: 'text-blue-600',
    children: [
      { href: '/farmers', label: 'Farmers', icon: Users, roles: ['tenant_admin', 'aggregator', 'processor'] },
      { href: '/farmlands', label: 'Farm Lands', icon: MapPin, roles: ['tenant_admin', 'aggregator', 'processor'] },
      { href: '/cultivations', label: 'Cultivations', icon: Sprout, roles: ['tenant_admin', 'aggregator', 'processor'] },
    ],
  },
  {
    label: 'Pre-Harvest',
    icon: TreePine,
    color: 'text-green-600',
    roles: ['tenant_admin', 'aggregator', 'processor'],
    children: [
      { href: '/nurseries', label: 'Nursery Mgmt', icon: Baby, roles: ['tenant_admin', 'aggregator'] },
      { href: '/land-preparations', label: 'Land Prep', icon: Tractor, roles: ['tenant_admin', 'aggregator'] },
      { href: '/crop-monitorings', label: 'Crop Monitoring', icon: ScanSearch, roles: ['tenant_admin', 'aggregator', 'processor'] },
      { href: '/fertilizer-apps', label: 'Fertilizer', icon: FlaskConical, roles: ['tenant_admin', 'aggregator'] },
      { href: '/pest-disease', label: 'Pest & Disease', icon: Bug, roles: ['tenant_admin', 'aggregator'] },
      { href: '/coffee-inspections', label: 'Inspection & Cert', icon: ClipboardCheck, roles: ['tenant_admin', 'processor'] },
      { href: '/cert-assessments', label: 'Cert Assessment', icon: ClipboardList, roles: ['tenant_admin', 'processor'] },
    ],
  },
  {
    label: 'Harvest & QC',
    icon: Wheat,
    color: 'text-amber-600',
    roles: ['tenant_admin', 'aggregator', 'processor', 'exporter'],
    children: [
      { href: '/harvest', label: 'Harvest Records', icon: Wheat, roles: ['tenant_admin', 'aggregator', 'processor'] },
    ],
  },
  {
    label: 'Procurement',
    icon: Truck,
    color: 'text-purple-600',
    roles: ['tenant_admin', 'aggregator'],
    children: [
      { href: '/collection-centres', label: 'Collection Centres', icon: Building2 },
      { href: '/procurement', label: 'Purchase Records', icon: FileText },
      { href: '/procurement-transports', label: 'Transport', icon: Truck },
    ],
  },
  {
    label: 'Processing',
    icon: Factory,
    color: 'text-orange-600',
    roles: ['tenant_admin', 'processor'],
    children: [
      { href: '/processing/washing', label: '1. Cleaning & Washing', icon: Sparkles },
      { href: '/processing/fermentation', label: '2. Depulping & Fermentation', icon: Cog },
      { href: '/processing/drying', label: '3. Drying & Hulling', icon: Sun },
      { href: '/processing/sorting', label: '4. Grading & Sorting', icon: Filter },
      { href: '/processing/roasting', label: '5. Roasting & Blending', icon: Flame },
      { href: '/processing/packaging', label: '6. Grinding & Packaging', icon: Package },
      { href: '/processing/retail', label: '7. Quality Control', icon: BarChart3 },
    ],
  },
  {
    label: 'EUDR & Export',
    icon: Globe,
    color: 'text-emerald-700',
    roles: ['tenant_admin', 'exporter'],
    children: [
      { href: '/eudr', label: 'EUDR Compliance', icon: ShieldCheck },
      { href: '/eudr/deforestation', label: 'Deforestation Risk', icon: TreeDeciduous },
      { href: '/eudr/dds', label: 'Due Diligence (DDS)', icon: FileCheck },
      { href: '/shipments', label: 'Shipments & Tracking', icon: Ship },
      { href: '/export-documents', label: 'Export Documents', icon: FileText },
      { href: '/buyers', label: 'Buyers', icon: Users },
      { href: '/trading-contracts', label: 'Trading Contracts', icon: Handshake },
    ],
  },
  {
    label: 'Track & Trace',
    icon: Route,
    color: 'text-cyan-600',
    roles: ['tenant_admin', 'aggregator', 'processor', 'exporter'],
    children: [
      { href: '/qr-verify', label: 'QR Scanner', icon: QrCode },
      { href: '/trace-journey', label: 'Trace Journey', icon: Route },
      { href: '/traceability', label: 'Batch Traceability', icon: Package },
    ],
  },
  {
    label: 'Commercial',
    icon: Store,
    color: 'text-indigo-600',
    roles: ['tenant_admin', 'exporter'],
    children: [
      { href: '/smart-contracts', label: 'Smart Contracts', icon: FileText },
      { href: '/marketplace', label: 'Marketplace', icon: Store },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    color: 'text-rose-600',
    children: [
      { href: '/analytics', label: 'Admin Reports', icon: BarChart3 },
      { href: '/credit-score', label: 'Credit Score', icon: CreditCard },
    ],
  },
]

// Helper: check if current path belongs to a group
function isPathInGroup(pathname: string, group: NavGroup): boolean {
  return group.children.some(c => pathname.startsWith(c.href))
}

// ======== GROUP COMPONENT ========

function NavGroupItem({ group, pathname, onClose, userRole }: {
  group: NavGroup
  pathname: string
  onClose: () => void
  userRole: string
}) {
  const groupHasActive = isPathInGroup(pathname, group)
  const [open, setOpen] = useState(groupHasActive)
  const GroupIcon = group.icon
  const router = useRouter()

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors',
            groupHasActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-2">
            <GroupIcon className={cn('h-3.5 w-3.5', group.color)} />
            {group.label}
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </button>
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 space-y-0.5 pl-1">
              {group.children
                .filter(child => !child.roles || child.roles.includes(userRole))
                .map(child => {
                const Icon = child.icon
                const isActive = pathname === child.href || pathname.startsWith(child.href + '/')
                return (
                  <motion.button
                    key={child.href}
                    onClick={() => { router.push(child.href); onClose() }}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className={cn(
                      'flex items-center gap-3 w-full pl-3 pr-2 py-2 rounded-md text-sm transition-colors relative',
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 font-medium dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      />
                    )}
                    <motion.span
                      className="shrink-0"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.span>
                    <span className="truncate">{child.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Collapsible>
  )
}

// ======== SINGLE MENU ITEM ========

function SidebarItem({ icon: Icon, label, href, pathname, onClose }: {
  icon: React.ElementType
  label: string
  href: string
  pathname: string
  onClose: () => void
}) {
  const router = useRouter()
  const isActive = pathname === href

  return (
    <motion.button
      onClick={() => { router.push(href); onClose() }}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
        isActive
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full"
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        />
      )}
      <motion.span
        className="shrink-0"
        whileHover={{ rotate: 15, scale: 1.1 }}
      >
        <Icon className="h-4 w-4" />
      </motion.span>
      {label}
    </motion.button>
  )
}

// ======== SIDEBAR ========

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  userRole?: string
  tenantName?: string
  onLogout?: () => void
}

export function Sidebar({ sidebarOpen, setSidebarOpen, userRole = 'admin', tenantName = 'Terra Brew', onLogout }: SidebarProps) {
  const pathname = usePathname()

  const handleClose = () => {
    setSidebarOpen(false)
  }

  // Filter nav groups based on role
  const filteredGroups = NAV_GROUPS.filter(group => {
    if (!group.roles) return true
    return group.roles.includes(userRole)
  }).filter(group => {
    // Also filter out groups where no children are visible to this role
    const visibleChildren = group.children.filter(child => !child.roles || child.roles.includes(userRole))
    return visibleChildren.length > 0
  })

  // Farmer role = minimal sidebar (dashboard + credit score only)
  const isFarmer = userRole === 'farmer'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header — Logo/Brand area with glow effect */}
          <div className="flex items-center justify-between p-4 border-b">
            <ScaleIn className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full" />
                <Leaf className="relative h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground">{tenantName}</h2>
                <p className="text-xs text-muted-foreground">Terra Ecosystem</p>
              </div>
            </ScaleIn>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleClose}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-3">
            <nav className="px-3 space-y-1">
              {/* Dashboard — always visible */}
              <SidebarItem
                icon={LayoutDashboard}
                label="Dashboard"
                href="/dashboard"
                pathname={pathname}
                onClose={handleClose}
              />

              {isFarmer ? (
                // Farmer only sees credit score
                <SidebarItem
                  icon={CreditCard}
                  label="Credit Score"
                  href="/credit-score"
                  pathname={pathname}
                  onClose={handleClose}
                />
              ) : (
                <>
                  <Separator className="my-2" />
                  {filteredGroups.map(group => (
                    <NavGroupItem
                      key={group.label}
                      group={group}
                      pathname={pathname}
                      onClose={handleClose}
                      userRole={userRole}
                    />
                  ))}
                </>
              )}
            </nav>
          </ScrollArea>

          {/* Footer with gradient line */}
          <div className="border-t p-3">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-3" />
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

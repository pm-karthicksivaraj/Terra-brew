'use client'

import { useState } from 'react'
import { useAppStore, type ViewName } from '@/lib/store'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn, PulseDot, ScaleIn, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import {
  LayoutDashboard, Users, MapPin, Sprout, ShieldCheck, ClipboardCheck,
  Package, QrCode, LogOut, ChevronLeft, Menu, CreditCard, Leaf,
  Baby, Tractor, ScanSearch, FlaskConical, Bug, Wheat, FileText, Store, Award,
  Coffee, Route, Printer, BarChart3, ChevronDown, Truck, Building2,
  Factory, ClipboardList, TreePine, Sparkles, Cog, Plus,
  Sun, Filter, Flame, Gauge, ShieldAlert, Globe, Ship, Handshake
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// ======== NAV CONFIGURATION ========

interface NavChild {
  key: ViewName
  label: string
  icon: React.ElementType
  roles?: string[] // if undefined, all roles see it; if defined, only those roles
  readOnly?: string[] // roles that can only view, not create
}

interface NavGroup {
  label: string
  icon: React.ElementType
  color: string
  children: NavChild[]
  roles?: string[] // if defined, only these roles see the entire group
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Core Data',
    icon: Database,
    color: 'text-blue-600',
    roles: ['tenant_admin', 'aggregator', 'processor'],
    children: [
      { key: 'farmers', label: 'Farmers', icon: Users, readOnly: ['aggregator', 'processor'] },
      { key: 'farmlands', label: 'Farm Lands', icon: MapPin, readOnly: ['aggregator', 'processor'] },
      { key: 'cultivations', label: 'Cultivations', icon: Sprout, readOnly: ['aggregator'] },
    ],
  },
  {
    label: 'Pre-Harvest',
    icon: TreePine,
    color: 'text-green-600',
    roles: ['tenant_admin', 'processor'],
    children: [
      { key: 'nurseries', label: 'Nursery Mgmt', icon: Baby },
      { key: 'land-preparations', label: 'Land Prep', icon: Tractor },
      { key: 'crop-monitorings', label: 'Crop Monitoring', icon: ScanSearch },
      { key: 'fertilizer-apps', label: 'Fertilizer', icon: FlaskConical },
      { key: 'pest-disease-mgmts', label: 'Pest & Disease', icon: Bug },
      { key: 'coffee-inspections', label: 'Inspection & Cert', icon: ClipboardCheck },
      { key: 'cert-assessments', label: 'Cert Assessment', icon: ClipboardList },
    ],
  },
  {
    label: 'Harvest & QC',
    icon: Wheat,
    color: 'text-amber-600',
    roles: ['tenant_admin', 'processor', 'exporter'],
    children: [
      { key: 'harvest-traceabilities', label: 'Harvest Records', icon: Wheat, readOnly: ['processor', 'exporter'] },
    ],
  },
  {
    label: 'Procurement',
    icon: Truck,
    color: 'text-purple-600',
    roles: ['tenant_admin', 'aggregator'],
    children: [
      { key: 'collection-centres', label: 'Collection Centres', icon: Building2 },
      { key: 'procurement-records', label: 'Purchase Records', icon: FileText },
      { key: 'procurement-transports', label: 'Transport', icon: Truck },
    ],
  },
  {
    label: 'Processing',
    icon: Factory,
    color: 'text-orange-600',
    roles: ['tenant_admin', 'processor'],
    children: [
      { key: 'processing-job-orders', label: 'Job Orders', icon: Factory },
      { key: 'ps-cleaning-washing', label: '1. Cleaning & Washing', icon: Sparkles },
      { key: 'ps-depulping-fermentation', label: '2. Depulping & Fermentation', icon: Cog },
      { key: 'ps-drying-hulling', label: '3. Drying & Hulling', icon: Sun },
      { key: 'ps-grading-sorting', label: '4. Grading & Sorting', icon: Filter },
      { key: 'ps-roasting-blending', label: '5. Roasting & Blending', icon: Flame },
      { key: 'ps-grinding-packaging', label: '6. Grinding & Packaging', icon: Package },
      { key: 'ps-quality-control', label: '7. Quality Control', icon: BarChart3 },
    ],
  },
  {
    label: 'Track & Trace',
    icon: Route,
    color: 'text-cyan-600',
    roles: ['tenant_admin', 'processor', 'aggregator', 'exporter'],
    children: [
      { key: 'qr-scan', label: 'QR Scanner', icon: QrCode, roles: ['tenant_admin', 'processor'] },
      { key: 'qr-label', label: 'Print Labels', icon: Printer, roles: ['tenant_admin', 'processor'] },
      { key: 'trace-journey', label: 'Trace Journey', icon: Route },
      { key: 'batches', label: 'Batch Traceability', icon: Package },
    ],
  },
  {
    label: 'Commercial',
    icon: Store,
    color: 'text-indigo-600',
    roles: ['tenant_admin', 'exporter'],
    children: [
      { key: 'smart-contracts', label: 'Smart Contracts', icon: FileText },
      { key: 'marketplace', label: 'Marketplace', icon: Store },
      { key: 'buyers', label: 'Buyers', icon: Handshake },
      { key: 'trading-contracts', label: 'Trading Contracts', icon: FileText },
    ],
  },
  {
    label: 'EUDR & Export',
    icon: Globe,
    color: 'text-teal-600',
    roles: ['tenant_admin', 'exporter'],
    children: [
      { key: 'eudr-compliance', label: 'EUDR Compliance', icon: ShieldAlert },
      { key: 'eudr-deforestation', label: 'Deforestation Risk', icon: TreePine },
      { key: 'eudr-dds', label: 'Due Diligence (DDS)', icon: ClipboardCheck },
      { key: 'export-docs', label: 'Export Documents', icon: FileText },
      { key: 'shipments', label: 'Shipments', icon: Ship },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    color: 'text-rose-600',
    roles: ['tenant_admin', 'farmer'],
    children: [
      { key: 'admin-reports', label: 'Admin Reports', icon: BarChart3, roles: ['tenant_admin'] },
      { key: 'credit-score', label: 'Credit Score', icon: CreditCard },
    ],
  },
]

function isViewInGroup(view: ViewName, group: NavGroup): boolean {
  return group.children.some(c => c.key === view)
}

// ======== GROUP COMPONENT ========

function NavGroupItem({ group, currentView, onNavigate, onClose, role }: {
  group: NavGroup
  currentView: ViewName
  onNavigate: (view: ViewName) => void
  onClose: () => void
  role: string
}) {
  const groupHasActive = isViewInGroup(currentView, group)
  const [open, setOpen] = useState(groupHasActive)
  const GroupIcon = group.icon

  // Filter children by role
  const visibleChildren = group.children.filter(child => {
    if (!child.roles) return true
    return child.roles.includes(role)
  })

  if (visibleChildren.length === 0) return null

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
              {visibleChildren.map(child => {
                const Icon = child.icon
                const isActive = currentView === child.key
                return (
                  <motion.button
                    key={child.key}
                    onClick={() => { onNavigate(child.key); onClose() }}
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
                    {child.readOnly?.includes(role) && (
                      <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">view</span>
                    )}
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

// ======== DATABASE ICON ========
function Database(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}

// ======== SIDEBAR ========

export function Sidebar() {
  const { currentView, currentUser, setCurrentView, sidebarOpen, setSidebarOpen, logout } = useAppStore()

  if (!currentUser || currentView === 'login') return null

  const role = currentUser.role || 'farmer'
  const tenantName = currentUser.tenantName || 'Terra Brew'

  const handleNavigate = (view: ViewName) => {
    setCurrentView(view)
  }

  const handleClose = () => {
    setSidebarOpen(false)
  }

  // Filter groups by role
  const visibleGroups = NAV_GROUPS.filter(group => {
    if (!group.roles) return true
    return group.roles.includes(role)
  })

  // Farmer: minimal sidebar - just Dashboard + Credit Score
  const isFarmer = role === 'farmer'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo/Brand area with glow effect */}
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
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-1">
          {/* Dashboard — always visible */}
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={currentView === 'dashboard'}
            onClick={() => { handleNavigate('dashboard'); handleClose() }}
          />

          {isFarmer ? (
            <>
              <Separator className="my-2" />
              <SidebarItem
                icon={CreditCard}
                label="Credit Score"
                active={currentView === 'credit-score'}
                onClick={() => { handleNavigate('credit-score'); handleClose() }}
              />
            </>
          ) : (
            <>
              <Separator className="my-2" />
              {visibleGroups.map(group => (
                <NavGroupItem
                  key={group.label}
                  group={group}
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  onClose={handleClose}
                  role={role}
                />
              ))}
            </>
          )}
        </nav>
      </ScrollArea>
      {/* Footer with gradient line */}
      <div className="border-t p-3">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-3" />
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
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
        {sidebarContent}
      </aside>
    </>
  )
}

// ======== SINGLE MENU ITEM ========

function SidebarItem({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
        active
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {active && (
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

// ======== HEADER ========

const VIEW_TITLES: Partial<Record<ViewName, string>> = {
  'dashboard': 'Dashboard',
  'farmers': 'Farmers',
  'farmer-form': 'Farmer Form',
  'farmer-detail': 'Farmer Detail',
  'farmlands': 'Farm Lands',
  'farmland-form': 'Farm Land Form',
  'farmland-detail': 'Farm Land Detail',
  'cultivations': 'Cultivations',
  'cultivation-form': 'Cultivation Form',
  'nurseries': 'Nursery Management',
  'nursery-form': 'Nursery Form',
  'land-preparations': 'Land Preparation',
  'land-prep-form': 'Land Prep Form',
  'crop-monitorings': 'Crop Monitoring',
  'crop-monitoring-form': 'Crop Monitoring Form',
  'fertilizer-apps': 'Fertilizer Applications',
  'fertilizer-app-form': 'Fertilizer App Form',
  'pest-disease-mgmts': 'Pest & Disease Management',
  'pest-disease-mgmt-form': 'Pest & Disease Form',
  'coffee-inspections': 'Inspection & Certification',
  'coffee-inspection-form': 'Inspection Form',
  'cert-assessments': 'Certification Assessment',
  'cert-assessment-form': 'Cert Assessment Form',
  'harvest-traceabilities': 'Harvest Records',
  'harvest-trace-form': 'Harvest Form',
  'collection-centres': 'Collection Centres',
  'collection-centre-form': 'Collection Centre Form',
  'procurement-records': 'Purchase Records',
  'procurement-record-form': 'Purchase Record Form',
  'procurement-transports': 'Procurement Transport',
  'procurement-transport-form': 'Transport Form',
  'processing-job-orders': 'Processing Job Orders',
  'processing-job-order-form': 'Job Order Form',
  'ps-cleaning-washing': '1. Cleaning & Washing',
  'ps-depulping-fermentation': '2. Depulping & Fermentation',
  'ps-drying-hulling': '3. Drying & Hulling',
  'ps-grading-sorting': '4. Grading & Sorting',
  'ps-roasting-blending': '5. Roasting & Blending',
  'ps-grinding-packaging': '6. Grinding & Packaging',
  'ps-quality-control': '7. Quality Control',
  'qr-scan': 'QR Scanner',
  'qr-label': 'Print Labels',
  'trace-journey': 'Trace Journey',
  'batches': 'Batch Traceability',
  'smart-contracts': 'Smart Contracts',
  'smart-contract-form': 'Contract Form',
  'marketplace': 'Marketplace',
  'marketplace-form': 'Listing Form',
  'admin-reports': 'Admin Reports',
  'credit-score': 'Credit Score',
  'eudr-compliance': 'EUDR Compliance',
  'eudr-deforestation': 'Deforestation Risk Assessment',
  'eudr-dds': 'Due Diligence Statement',
  'eudr-traces': 'TRACES Certificate',
  'export-docs': 'Export Documents',
  'export-doc-form': 'Export Document Form',
  'shipments': 'Shipments',
  'shipment-form': 'Shipment Form',
  'buyers': 'Buyers',
  'buyer-form': 'Buyer Form',
  'trading-contracts': 'Trading Contracts',
  'trading-contract-form': 'Contract Form',
}

export function Header() {
  const { currentUser, currentView, setSidebarOpen, setCurrentView } = useAppStore()

  if (!currentUser || currentView === 'login') return null

  const viewTitle = VIEW_TITLES[currentView] || currentView.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const quickActions = [
    { icon: Users, label: 'Add Farmer', view: 'farmer-form' as ViewName },
    { icon: Wheat, label: 'New Harvest', view: 'harvest-trace-form' as ViewName },
    { icon: FileText, label: 'Add Procurement', view: 'procurement-record-form' as ViewName },
    { icon: QrCode, label: 'Trace Batch', view: 'trace-journey' as ViewName },
  ]

  const roleColors: Record<string, string> = {
    tenant_admin: 'bg-emerald-100 text-emerald-700',
    farmer: 'bg-amber-100 text-amber-700',
    aggregator: 'bg-purple-100 text-purple-700',
    processor: 'bg-orange-100 text-orange-700',
    exporter: 'bg-blue-100 text-blue-700',
  }

  return (
    <motion.header
      className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b shadow-sm"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <motion.div whileHover={{ rotate: 90 }} transition={{ type: 'spring', damping: 15, stiffness: 200 }}>
              <Menu className="h-5 w-5" />
            </motion.div>
          </Button>
          <FadeIn key={viewTitle} duration={0.2} direction="left">
            <h1 className="text-lg font-semibold">{viewTitle}</h1>
          </FadeIn>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Action Icons */}
          <StaggerContainer className="hidden md:flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
            <TooltipProvider>
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <StaggerItem key={action.view}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => setCurrentView(action.view)}
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>{action.label}</TooltipContent>
                    </Tooltip>
                  </StaggerItem>
                )
              })}
            </TooltipProvider>
          </StaggerContainer>

          <Separator orientation="vertical" className="hidden md:block h-6" />

          {/* User Profile */}
          {currentUser && (
            <ScaleIn className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5">
                  <PulseDot color="bg-emerald-500" size="sm" />
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', roleColors[currentUser.role] || 'bg-gray-100 text-gray-700')}>
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </ScaleIn>
          )}
        </div>
      </div>
    </motion.header>
  )
}

// ======== APP SHELL ========

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, PulseDot } from '@/components/ui/animations'
import { Users, Wheat, FileText, QrCode, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

// Path → Title mapping
const PATH_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/farmers': 'Farmers',
  '/farmlands': 'Farm Lands',
  '/cultivations': 'Cultivations',
  '/nurseries': 'Nursery Management',
  '/land-preparations': 'Land Preparation',
  '/crop-monitorings': 'Crop Monitoring',
  '/fertilizer-apps': 'Fertilizer Applications',
  '/pest-disease': 'Pest & Disease Management',
  '/coffee-inspections': 'Inspection & Certification',
  '/cert-assessments': 'Certification Assessment',
  '/harvest': 'Harvest Records',
  '/collection-centres': 'Collection Centres',
  '/procurement': 'Purchase Records',
  '/trace-journey': 'Trace Journey',
  '/smart-contracts': 'Smart Contracts',
  '/marketplace': 'Marketplace',
  '/analytics': 'Admin Reports',
  '/credit-score': 'Credit Score',
  '/eudr': 'EUDR Compliance',
  '/eudr/deforestation': 'Deforestation Assessment',
  '/eudr/dds': 'Due Diligence Statement',
  '/shipments': 'Shipments',
  '/buyers': 'Buyers',
  '/qr-verify': 'QR Scanner',
  '/traceability': 'Batch Traceability',
}

function getViewTitle(pathname: string): string {
  // Exact match first
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname]
  // Prefix match
  const match = Object.keys(PATH_TITLES).find(key => pathname.startsWith(key + '/'))
  if (match) return PATH_TITLES[match]
  // Default
  return pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard'
}

interface HeaderProps {
  onMenuClick: () => void
  userName?: string
  userRole?: string
}

export function Header({ onMenuClick, userName = 'Admin', userRole = 'admin' }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const viewTitle = getViewTitle(pathname)

  const quickActions = [
    { icon: Users, label: 'Add Farmer', href: '/farmers' },
    { icon: Wheat, label: 'New Harvest', href: '/harvest' },
    { icon: FileText, label: 'Add Procurement', href: '/procurement' },
    { icon: QrCode, label: 'Trace Batch', href: '/trace-journey' },
  ]

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-emerald-100 text-emerald-700',
    aggregator: 'bg-purple-100 text-purple-700',
    processor: 'bg-orange-100 text-orange-700',
    exporter: 'bg-cyan-100 text-cyan-700',
    farmer: 'bg-amber-100 text-amber-700',
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
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
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
                  <StaggerItem key={action.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => router.push(action.href)}
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
          <ScaleIn className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5">
                <PulseDot color="bg-emerald-500" size="sm" />
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadgeColors[userRole] || 'bg-gray-100 text-gray-700'}`}>
                  {userRole}
                </span>
              </div>
            </div>
          </ScaleIn>
        </div>
      </div>
    </motion.header>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import {
  ArrowLeft, User, MapPin, Sprout, Wheat, Award, ClipboardCheck,
  Phone, Mail, Calendar, CreditCard, Shield, QrCode,
  Printer, Share2, Edit, TreePine, Activity, Clock,
  CheckCircle2, AlertTriangle, XCircle, LandPlot, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem, PulseDot } from '@/components/ui/animations'
import { SensitiveField } from '@/components/ui/sensitive-field'

// ======== INFO FIELD COMPONENT ========
function InfoField({ label, value, icon: Icon }: {
  label: string
  value: string | number | null | undefined
  icon?: React.ElementType
}) {
  const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : '—'
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      <p className="text-sm font-medium">{displayValue}</p>
    </div>
  )
}

// ======== MASKED FIELD ========
function MaskedField({ label, value, icon: Icon }: {
  label: string
  value: string | number | null | undefined
  icon?: React.ElementType
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      <SensitiveField value={value} />
    </div>
  )
}

// ======== CREDIT SCORE GAUGE ========
function CreditScoreGauge({ score }: { score: number | null | undefined }) {
  const clampedScore = Math.min(Math.max(score || 0, 0), 100)
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (clampedScore / 100) * circumference
  const color = clampedScore >= 70 ? '#059669' : clampedScore >= 40 ? '#d97706' : '#dc2626'

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{clampedScore}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
      </div>
    </div>
  )
}

// ======== FARM LAND CARD ========
function FarmLandCard({ land }: { land: any }) {
  return (
    <AnimatedCard>
      <Card className="border-0 shadow-sm h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-sm">{land.farmName || 'Unnamed Farm'}</p>
              {land.plotBlockId && <p className="text-xs text-muted-foreground font-mono">{land.plotBlockId}</p>}
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoField label="Area" value={land.totalLandHolding ? `${land.totalLandHolding} Ha` : null} icon={LandPlot} />
            <InfoField label="Altitude" value={land.altitude ? `${land.altitude}m` : null} icon={MapPin} />
            <InfoField label="Soil" value={land.soilType} />
            <InfoField label="Boundary" value={land.boundaryArea ? `${land.boundaryArea} Ha` : null} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Sprout className="h-3 w-3" />
            <span>{land._count?.cultivations || 0} cultivations</span>
            <span className="text-muted-foreground/40">·</span>
            <Wheat className="h-3 w-3" />
            <span>{land._count?.harvestTraceabilities || 0} harvests</span>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

// ======== CULTIVATION CARD ========
function CultivationCard({ cultivation }: { cultivation: any }) {
  return (
    <AnimatedCard>
      <Card className="border-0 shadow-sm h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-sm">{cultivation.farmPlotName || 'Unnamed Plot'}</p>
              {cultivation.plotBlockId && <p className="text-xs text-muted-foreground font-mono">{cultivation.plotBlockId}</p>}
            </div>
            <div className="flex gap-1">
              {cultivation.isPrimaryCrop && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Primary</Badge>}
              {cultivation.intercroppingEnabled && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Intercrop</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoField label="Variety" value={cultivation.cropVariety || cultivation.cultivatedCrop} />
            <InfoField label="Species" value={cultivation.coffeeSpecies} />
            <InfoField label="Area" value={cultivation.cultivationArea ? `${cultivation.cultivationArea} Ha` : null} />
            <InfoField label="Season" value={cultivation.harvestSeason} />
          </div>
          {cultivation.intercroppingEnabled && cultivation.intercroppingPartner && (
            <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-xs">
              <span className="text-amber-700 dark:text-amber-400 font-medium">Intercrop: </span>
              <span>{cultivation.intercroppingPartner} {cultivation.intercroppingRatio ? `(${cultivation.intercroppingRatio})` : ''}</span>
            </div>
          )}
          {cultivation.sowingDate && (
            <p className="mt-2 text-xs text-muted-foreground">Planted: {new Date(cultivation.sowingDate).toLocaleDateString()}</p>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

// ======== HARVEST RECORD ========
function HarvestRecord({ harvest }: { harvest: any }) {
  const cupScore = harvest.cupScore || 0
  const qualityLabel = cupScore >= 85 ? 'Specialty' : cupScore >= 80 ? 'Premium' : cupScore >= 75 ? 'Standard' : 'Below Grade'
  const qualityColor = cupScore >= 85 ? 'bg-emerald-100 text-emerald-700' : cupScore >= 80 ? 'bg-teal-100 text-teal-700' : cupScore >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
    >
      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-100">
        <Wheat className="h-5 w-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium font-mono">{harvest.batchId || '—'}</p>
          {cupScore > 0 && <Badge className={`text-[10px] ${qualityColor}`}>{qualityLabel}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {harvest.actualHarvestDate ? new Date(harvest.actualHarvestDate).toLocaleDateString() : '—'}
          {harvest.processingMethod ? ` · ${harvest.processingMethod}` : ''}
          {harvest.coffeeVariety ? ` · ${harvest.coffeeVariety}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0">
        {cupScore > 0 ? (
          <>
            <p className="text-sm font-bold">{cupScore}</p>
            <p className="text-[10px] text-muted-foreground">Cup Score</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>
    </motion.div>
  )
}

// ======== ACTIVITY TIMELINE ITEM ========
function ActivityItem({ icon: Icon, title, description, time, color = 'text-emerald-600 bg-emerald-100' }: {
  icon: React.ElementType
  title: string
  description: string
  time: string
  color?: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  )
}

// ======== MAIN PAGE ========
interface FarmerDetail {
  id: string
  fullName: string
  firstName?: string
  lastName?: string
  farmerCode?: string
  contactNumber: string
  email?: string
  gender?: string
  dob?: string
  age?: number
  nationalIdType?: string
  nationalIdNo?: string
  province?: string
  district?: string
  commune?: string
  village?: string
  isCertified: boolean
  certificationType?: string
  creditScore?: number
  farmerPhoto?: string
  yearsOfFarmingExperience?: number
  education?: string
  maritalStatus?: string
  noOfFamilyMembers?: number
  enrollmentDate: string
  isActive: boolean
  farmLands?: any[]
  cultivations?: any[]
  harvestTraceabilities?: any[]
  certAssessments?: any[]
  coffeeInspections?: any[]
  _count?: { farmLands: number; cultivations: number; harvestTraceabilities: number; certAssessments: number; coffeeInspections: number }
}

export default function FarmerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const farmerId = params.id as string
  const [farmer, setFarmer] = useState<FarmerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/farmers?id=${farmerId}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const farmerData = data?.data?.data || data?.data || data
        setFarmer(farmerData)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [farmerId])

  // Generate QR code — use secure verification if available, otherwise plain URL
  useEffect(() => {
    if (farmer?.farmerCode || farmer?.id) {
      const generateQR = async () => {
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : ''
          // Use secure verification URL pattern: /verify/{farmerCode}
          // The /verify/[qrCode] route will look up the QRVerification record
          const verifyPath = `/verify/${farmer.farmerCode || farmer.id}`
          const url = await QRCode.toDataURL(`${origin}${verifyPath}`, {
            width: 160,
            margin: 2,
            color: { dark: '#6D2932', light: '#ffffff' }  // Coffee brown QR code
          })
          setQrUrl(url)
        } catch (err) {
          // Fallback: silent fail
          console.error('QR generation failed:', err)
        }
      }
      generateQR()
    }
  }, [farmer?.farmerCode, farmer?.id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="p-4 md:p-6 text-center">
        <p className="text-muted-foreground">Farmer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/farmers')}>
          Back to Farmers
        </Button>
      </div>
    )
  }

  const farmLands = farmer.farmLands || []
  const cultivations = farmer.cultivations || []
  const harvests = farmer.harvestTraceabilities || []
  const certAssessments = farmer.certAssessments || []
  const inspections = farmer.coffeeInspections || []
  const totalFarmArea = farmLands.reduce((sum: number, fl: any) => sum + (fl.totalLandHolding || 0), 0)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero Section */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 md:p-8 text-white">
          {/* Decorative coffee plant patterns */}
          <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.06]">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="50" r="30" fill="currentColor" />
              <circle cx="60" cy="100" r="25" fill="currentColor" />
              <circle cx="140" cy="100" r="25" fill="currentColor" />
              <circle cx="80" cy="150" r="20" fill="currentColor" />
              <circle cx="120" cy="150" r="20" fill="currentColor" />
              <rect x="95" y="50" width="10" height="100" rx="5" fill="currentColor" />
              <rect x="55" y="100" width="10" height="60" rx="5" fill="currentColor" transform="rotate(-20 60 100)" />
              <rect x="135" y="100" width="10" height="60" rx="5" fill="currentColor" transform="rotate(20 140 100)" />
            </svg>
          </div>
          <div className="absolute top-4 left-4 w-40 h-40 bg-white/5 rounded-full -translate-y-1/3 -translate-x-1/3" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full translate-y-1/3" />

          <div className="relative">
            {/* Back button */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 mb-4" onClick={() => router.push('/farmers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar + Certification */}
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-3 border-white/30 shadow-lg">
                  {farmer.fullName?.charAt(0) || '?'}
                </div>
                {farmer.isCertified && (
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md ring-2 ring-emerald-700">
                    <Award className="h-4 w-4 text-amber-900" />
                  </div>
                )}
              </div>

              {/* Name & Badges */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold">{farmer.fullName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {farmer.farmerCode && (
                    <Badge className="bg-white/20 text-white border-0 font-mono">
                      <QrCode className="h-3 w-3 mr-1" />
                      {farmer.farmerCode}
                    </Badge>
                  )}
                  {farmer.isCertified && (
                    <Badge className="bg-amber-400/80 text-amber-900 border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      {farmer.certificationType || 'Certified'}
                    </Badge>
                  )}
                  <Badge className={`${farmer.isActive ? 'bg-emerald-400/30 text-emerald-100' : 'bg-red-400/30 text-red-100'} border-0`}>
                    <span className="mr-1">{farmer.isActive ? '●' : '○'}</span>
                    {farmer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-emerald-100/80">
                  {farmer.province && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{farmer.province}</span>}
                  {farmer._count && <span className="flex items-center gap-1"><LandPlot className="h-3.5 w-3.5" />{farmer._count.farmLands} farms</span>}
                  {farmer._count && <span className="flex items-center gap-1"><Wheat className="h-3.5 w-3.5" />{farmer._count.harvestTraceabilities} harvests</span>}
                </div>
              </div>

              {/* Credit Score + QR + Actions */}
              <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                <div className="flex items-center gap-4">
                  {/* Credit Score */}
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <CreditScoreGauge score={farmer.creditScore} />
                  </div>
                  {/* QR Code */}
                  {qrUrl ? (
                    <div className="bg-white rounded-xl p-2 shadow-lg">
                      <img src={qrUrl} alt="QR Code" className="h-24 w-24" />
                    </div>
                  ) : (
                    <div className="h-28 w-28 bg-white rounded-xl flex items-center justify-center">
                      <QrCode className="h-10 w-10 text-emerald-700" />
                    </div>
                  )}
                </div>
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8 text-xs">
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8 text-xs">
                    <Printer className="h-3.5 w-3.5 mr-1" /> Print Card
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8 text-xs">
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Tabbed Layout */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="farmlands" className="text-xs">Farm Lands</TabsTrigger>
          <TabsTrigger value="cultivations" className="text-xs">Cultivations</TabsTrigger>
          <TabsTrigger value="harvest" className="text-xs">Harvest</TabsTrigger>
          <TabsTrigger value="eudr" className="text-xs">EUDR</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatedCard>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" /> Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <InfoField label="Full Name" value={farmer.fullName} />
                  <InfoField label="Gender" value={farmer.gender} />
                  <InfoField label="Date of Birth" value={farmer.dob ? new Date(farmer.dob).toLocaleDateString() : null} icon={Calendar} />
                  <InfoField label="Age" value={
                    farmer.age && farmer.age > 0 ? `${farmer.age} years` :
                    farmer.dob ? `${Math.floor((Date.now() - new Date(farmer.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years` :
                    '—'
                  } />
                  <InfoField label="Education" value={farmer.education} />
                  <InfoField label="Marital Status" value={farmer.maritalStatus} />
                  <InfoField label="Family Members" value={farmer.noOfFamilyMembers} />
                  <InfoField label="Farming Experience" value={farmer.yearsOfFarmingExperience ? `${farmer.yearsOfFarmingExperience} years` : null} />
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-600" /> Contact & Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <MaskedField label="Contact Number" value={farmer.contactNumber} icon={Phone} />
                  <MaskedField label="Email" value={farmer.email} icon={Mail} />
                  <MaskedField label="National ID Type" value={farmer.nationalIdType} />
                  <MaskedField label="National ID No" value={farmer.nationalIdNo} />
                  <InfoField label="Enrollment Date" value={new Date(farmer.enrollmentDate).toLocaleDateString()} icon={Calendar} />
                  <InfoField label="Farmer Code" value={farmer.farmerCode} icon={QrCode} />
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <InfoField label="Province" value={farmer.province} />
                  <InfoField label="District" value={farmer.district} />
                  <InfoField label="Commune" value={farmer.commune} />
                  <InfoField label="Village" value={farmer.village} />
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" /> Credit & Financial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Credit Score</span>
                        <span className="text-sm font-bold text-emerald-600">{farmer.creditScore?.toFixed(0) || '—'}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((farmer.creditScore || 0), 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <InfoField label="Certification" value={farmer.isCertified ? 'Yes' : 'No'} icon={Shield} />
                    <InfoField label="Cert Type" value={farmer.certificationType} />
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </TabsContent>

        {/* Farm Lands Tab */}
        <TabsContent value="farmlands" className="space-y-4">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Farm Lands</h3>
                <p className="text-xs text-muted-foreground">{farmLands.length} farm land(s) · Total area: {totalFarmArea.toFixed(1)} Ha</p>
              </div>
            </div>
          </FadeIn>
          {farmLands.length > 0 ? (
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmLands.map((land: any) => (
                <StaggerItem key={land.id}>
                  <FarmLandCard land={land} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No farm lands recorded for this farmer</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cultivations Tab */}
        <TabsContent value="cultivations" className="space-y-4">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Cultivations</h3>
                <p className="text-xs text-muted-foreground">{cultivations.length} cultivation record(s)</p>
              </div>
            </div>
          </FadeIn>
          {cultivations.length > 0 ? (
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cultivations.map((cult: any) => (
                <StaggerItem key={cult.id}>
                  <CultivationCard cultivation={cult} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Sprout className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No cultivation records for this farmer</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Harvest Tab */}
        <TabsContent value="harvest" className="space-y-4">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Harvest Records</h3>
                <p className="text-xs text-muted-foreground">{harvests.length} harvest record(s)</p>
              </div>
            </div>
          </FadeIn>
          {harvests.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2">
                <div className="space-y-1 max-h-[480px] overflow-y-auto">
                  {harvests.map((h: any) => (
                    <HarvestRecord key={h.id} harvest={h} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Wheat className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No harvest records for this farmer</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* EUDR & Compliance Tab */}
        <TabsContent value="eudr" className="space-y-4">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">EUDR & Compliance</h3>
                <p className="text-xs text-muted-foreground">Deforestation risk assessment and certifications</p>
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4">
            {/* EUDR Compliance Status */}
            <AnimatedCard>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-emerald-600" /> Deforestation Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {farmLands.length > 0 ? (
                    <div className="space-y-3">
                      {farmLands.map((fl: any) => (
                        <div key={fl.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-sm font-medium">{fl.farmName}</p>
                            <p className="text-xs text-muted-foreground">{fl.totalLandHolding ? `${fl.totalLandHolding} Ha` : '—'}</p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Low Risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No farm lands to assess</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Certifications */}
            <AnimatedCard delay={0.1}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" /> Certification Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certAssessments.length > 0 ? (
                    <div className="space-y-3">
                      {certAssessments.map((cert: any) => (
                        <div key={cert.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-sm font-medium">{cert.certificationStandard || '—'}</p>
                            <p className="text-xs text-muted-foreground">{cert.certifyingBody || '—'} {cert.certificateNumber ? `· ${cert.certificateNumber}` : ''}</p>
                          </div>
                          <Badge className={`text-[10px] ${cert.status === 'approved' || cert.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : cert.status === 'rejected' || cert.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {cert.status || 'pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {farmer.isCertified ? `Certified: ${farmer.certificationType || 'Yes'}` : 'No certifications on record'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Activity & Inspections</h3>
                <p className="text-xs text-muted-foreground">Recent activity timeline and inspection records</p>
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Activity Timeline */}
            <AnimatedCard>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0 max-h-72 overflow-y-auto">
                    <ActivityItem icon={User} title="Farmer Enrolled" description={`Code: ${farmer.farmerCode || farmer.id}`} time={new Date(farmer.enrollmentDate).toLocaleDateString()} />
                    {farmLands.slice(0, 2).map((fl: any, i: number) => (
                      <ActivityItem key={fl.id} icon={MapPin} title="Farm Land Added" description={fl.farmName} color="text-teal-600 bg-teal-100" time="—" />
                    ))}
                    {harvests.slice(0, 2).map((h: any) => (
                      <ActivityItem key={h.id} icon={Wheat} title="Harvest Recorded" description={`Batch: ${h.batchId || '—'}`} color="text-amber-600 bg-amber-100" time={h.actualHarvestDate ? new Date(h.actualHarvestDate).toLocaleDateString() : '—'} />
                    ))}
                    {certAssessments.slice(0, 2).map((c: any) => (
                      <ActivityItem key={c.id} icon={Award} title="Cert Assessment" description={c.certificationStandard || '—'} color="text-purple-600 bg-purple-100" time={c.assessmentDate ? new Date(c.assessmentDate).toLocaleDateString() : '—'} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Inspections */}
            <AnimatedCard delay={0.1}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" /> Inspection Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inspections.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {inspections.map((insp: any) => (
                        <div key={insp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            insp.passFail === 'Pass' ? 'bg-emerald-100' : insp.passFail === 'Fail' ? 'bg-red-100' : 'bg-amber-100'
                          }`}>
                            {insp.passFail === 'Pass' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
                             insp.passFail === 'Fail' ? <XCircle className="h-4 w-4 text-red-600" /> :
                             <Clock className="h-4 w-4 text-amber-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{insp.inspectionType || 'Inspection'}</p>
                            <p className="text-xs text-muted-foreground">{insp.inspectorName || '—'} · {insp.inspectionDate ? new Date(insp.inspectionDate).toLocaleDateString() : '—'}</p>
                          </div>
                          <Badge className={`text-[10px] ${
                            insp.passFail === 'Pass' ? 'bg-emerald-100 text-emerald-700' :
                            insp.passFail === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {insp.passFail || insp.overallGrade || 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Eye className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No inspections on record</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

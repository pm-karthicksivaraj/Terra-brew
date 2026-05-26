'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import QRCode from 'qrcode'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Users, Loader2, Pencil, Phone, Mail, MapPin,
  CreditCard, Award, GraduationCap, Smartphone, CheckCircle,
  XCircle, Shield, Heart, Banknote, Calendar, Hash, TreePine,
  Eye, EyeOff, Printer, QrCode, Share2, Download, FileText,
  Droplets, Mountain, Sprout, Gauge, Package, Truck, DollarSign,
  ClipboardCheck, ShieldCheck, TrendingUp, Landmark, Wheat,
  Leaf, CircleDot, Map, Layers, BadgeCheck, Stamp, Search,
  ChevronRight, ExternalLink, Copy, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SensitiveField } from '@/components/ui/sensitive-field'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, SlideIn } from '@/components/ui/motion'

// Dynamic import for map — SSR must be disabled for Leaflet
const FarmerLandMap = dynamic(
  () => import('@/components/map/eudr-location-map').then(mod => ({ default: mod.EudrLocationMap })),
  { ssr: false, loading: () => <div className="h-[250px] bg-muted animate-pulse rounded-xl" /> }
)

// ─── Data Types ──────────────────────────────────────────────────────

interface FarmLandDetail {
  id: string
  farmName: string
  plotBlockId: string
  totalLandHolding: number
  soilType: string
  elevation: number
  irrigationMethod: string
  gpsPolygon: string
  latitude: number
  longitude: number
  primaryCrop: string
  secondaryCrop: string | null
  cultivations: CultivationDetail[]
}

interface CultivationDetail {
  id: string
  cropName: string
  variety: string
  areaPlanted: number
  plantingDate: string
  expectedHarvestDate: string
  status: string
}

interface HarvestRecord {
  id: string
  season: string
  harvestDate: string
  cropName: string
  volumeKg: number
  qualityGrade: string
  pricePerKg: number
  totalRevenue: number
  status: string
}

interface CertificationRecord {
  id: string
  type: string
  certificateNumber: string
  issuedDate: string
  expiryDate: string
  status: string
  issuingBody: string
}

interface InspectionRecord {
  id: string
  type: string
  inspectorName: string
  inspectionDate: string
  result: string
  findings: string
  nextInspection: string
}

interface LoanRecord {
  id: string
  source: string
  amount: number
  purpose: string
  interestRate: number
  disbursedDate: string
  maturityDate: string
  status: string
  outstandingBalance: number
}

interface ProcurementRecord {
  id: string
  batchCode: string
  date: string
  volumeKg: number
  pricePerKg: number
  centreName: string
  status: string
}

interface DocumentRecord {
  id: string
  name: string
  type: string
  uploadedDate: string
  fileSize: string
  status: string
}

interface VerificationRecord {
  id: string
  date: string
  verifiedBy: string
  method: string
  result: string
}

interface FarmerDetailFull {
  id: string
  farmerCode: string
  fullName: string
  firstName: string
  lastName: string
  middleName: string
  contactNumber: string
  email: string
  gender: string
  age: number | null
  dob: string
  nationalIdType: string
  nationalIdNo: string
  ekycConsent: boolean
  education: string
  maritalStatus: string
  spouseName: string
  noOfFamilyMembers: number | null
  housingOwnership: string
  houseType: string
  yearsOfFarmingExperience: number | null
  country: string
  province: string
  district: string
  commune: string
  village: string
  zipCode: string
  latitude: number | null
  longitude: number | null
  isCertified: boolean
  certificationType: string
  yearOfICS: string
  cooperative: string
  creditScore: number | null
  loanTaken: boolean
  loanTakenFrom: string
  loanAmount: number | null
  loanPurpose: string
  loanInterest: number | null
  loanSecurity: boolean
  cropInsurance: boolean
  lifeInsurance: boolean
  healthInsurance: boolean
  smartphoneOwnership: boolean
  gapTrainingAttended: boolean
  enrollmentDate: string
  enrollmentPlace: string
  isActive: boolean
  eudrCompliant: boolean
  createdAt: string
  updatedAt: string
  _count: {
    farmLands: number
    cultivations: number
    harvestTraceabilities: number
  }
  farmLands: FarmLandDetail[]
  harvests: HarvestRecord[]
  certifications: CertificationRecord[]
  inspections: InspectionRecord[]
  loans: LoanRecord[]
  procurements: ProcurementRecord[]
  documents: DocumentRecord[]
  verifications: VerificationRecord[]
}

// ─── Helpers ────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function getCreditScoreColor(score: number | null | undefined): string {
  if (!score) return 'text-muted-foreground'
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getCreditScoreBarColor(score: number | null | undefined): string {
  if (!score) return 'bg-muted'
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getCreditScoreLabel(score: number | null | undefined): string {
  if (!score) return 'N/A'
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

// ─── Sub-components ─────────────────────────────────────────────────

function InfoRow({ label, value, icon }: { label: string; value: string | number | null | undefined; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      {icon && <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-base text-foreground font-medium truncate">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function BoolBadge({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <Badge className={`${value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'} text-xs border-0 gap-1`}>
      {value ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </Badge>
  )
}

function StatCard({ icon: Icon, label, value, suffix, color }: { icon: React.ElementType; label: string; value: string | number; suffix?: string; color: string }) {
  return (
    <MotionCard
      className="rounded-xl border-0 shadow-sm bg-card hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-xl font-bold text-foreground">{value}</p>
          {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </CardContent>
    </MotionCard>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export default function FarmerDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [farmer, setFarmer] = useState<FarmerDetailFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const fetchFarmer = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/farmers?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        const apiData = data.data.data
        // Use API data directly, initialize empty arrays for related data
        setFarmer({
          ...apiData,
          farmLands: apiData.farmLands || [],
          harvests: apiData.harvests || apiData.harvestTraceabilities || [],
          certifications: apiData.certifications || apiData.certAssessments || [],
          inspections: apiData.inspections || apiData.coffeeInspections || [],
          loans: [],
          procurements: apiData.procurements || apiData.procurementRecords || [],
          documents: [],
          verifications: [],
          eudrCompliant: apiData.eudrCompliant ?? false,
          _count: apiData._count ?? { farmLands: 0, cultivations: 0, harvestTraceabilities: 0 },
        })
      } else {
        setFarmer(null)
      }
    } catch {
      setFarmer(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFarmer()
    }
  }, [status, router, fetchFarmer])

  const qrUrl = farmer ? `/verify/${encodeURIComponent(farmer.farmerCode)}` : ''
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (farmer && qrUrl) {
      const fullUrl = `${window.location.origin}${qrUrl}`
      QRCode.toDataURL(fullUrl, { width: 150, margin: 2, color: { dark: '#6D2932', light: '#ffffff' } })
        .then(url => setQrDataUrl(url))
        .catch(() => setQrDataUrl(''))
    }
  }, [farmer, qrUrl])

  const handleDownloadQR = useCallback(() => {
    if (!farmer || !qrDataUrl) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 340
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Background
      ctx.fillStyle = '#ffffff'
      ctx.roundRect(0, 0, 300, 340, 16)
      ctx.fill()

      // QR image
      ctx.drawImage(img, 75, 20, 150, 150)

      // Farmer code text
      ctx.fillStyle = '#4e3010'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(farmer.farmerCode, 150, 195)

      // Terra Brew label
      ctx.fillStyle = '#8b5a1e'
      ctx.font = '11px monospace'
      ctx.fillText('Terra Brew Traceability', 150, 215)

      // Verification URL
      ctx.fillStyle = '#888888'
      ctx.font = '10px monospace'
      ctx.fillText(qrUrl, 150, 240)

      // Decorative line
      ctx.strokeStyle = '#e0ccb0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(40, 255)
      ctx.lineTo(260, 255)
      ctx.stroke()

      // Status
      ctx.fillStyle = farmer.isActive ? '#16a34a' : '#dc2626'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(farmer.isActive ? '● VERIFIED — ACTIVE' : '● INACTIVE', 150, 278)

      // Timestamp
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '9px monospace'
      ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 150, 300)

      // Border
      ctx.strokeStyle = '#e0ccb0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(1, 1, 298, 338, 16)
      ctx.stroke()

      const link = document.createElement('a')
      link.download = `QR-${farmer.farmerCode}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success(t2('Đã tải QR code', 'QR code downloaded'))
    }
    img.onerror = () => {
      toast.error(t2('Không thể tải QR', 'Failed to download QR'))
    }
    img.src = qrDataUrl
  }, [farmer, qrDataUrl, qrUrl, t2])

  const handleCopyLink = useCallback(() => {
    if (!farmer) return
    navigator.clipboard.writeText(`${window.location.origin}${qrUrl}`)
    toast.success(t2('Đã sao chép liên kết', 'Link copied to clipboard'))
  }, [farmer, qrUrl, t2])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleShare = useCallback(async () => {
    if (!farmer) return
    const shareData = {
      title: `Farmer: ${farmer.fullName}`,
      text: `${farmer.fullName} — ${farmer.farmerCode} | ${farmer.village}, ${farmer.commune}`,
      url: `${window.location.origin}${qrUrl}`,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      toast.success(t2('Đã sao chép liên kết', 'Link copied'))
    }
  }, [farmer, qrUrl, t2])

  // ─── Loading State ───────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-coffee-500 flex items-center justify-center animate-pulse">
              <Users className="w-9 h-9 text-white" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải hồ sơ nông dân...', 'Loading farmer profile...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!farmer) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Không tìm thấy dữ liệu', 'Data not found')}</p>
        </div>
      </DashboardShell>
    )
  }

  const totalArea = farmer.farmLands.reduce((sum, fl) => sum + fl.totalLandHolding, 0)
  const totalHarvestVolume = farmer.harvests.reduce((sum, h) => sum + h.volumeKg, 0)
  const totalRevenue = farmer.harvests.reduce((sum, h) => sum + h.totalRevenue, 0)
  const initials = getInitials(farmer.fullName)

  // ─── Tab Content Components ──────────────────────────────────────

  const OverviewTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Info */}
      <FadeIn>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-coffee-500" />
              {t2('Thông tin cá nhân', 'Personal Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <InfoRow label={t2('Họ và tên', 'Full Name')} value={farmer.fullName} icon={<Users className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Giới tính', 'Gender')} value={farmer.gender === 'Male' ? t2('Nam', 'Male') : farmer.gender === 'Female' ? t2('Nữ', 'Female') : farmer.gender} />
              <InfoRow label={t2('Tuổi', 'Age')} value={(!farmer.age || farmer.age === 0) ? t2('Trống', 'Empty') : `${farmer.age} ${t2('tuổi', 'yrs')}`} />
              <InfoRow label={t2('Ngày sinh', 'Date of Birth')} value={formatDate(farmer.dob)} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Trình độ học vấn', 'Education')} value={farmer.education} icon={<GraduationCap className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Tình trạng hôn nhân', 'Marital Status')} value={farmer.maritalStatus === 'Married' ? t2('Đã kết hôn', 'Married') : farmer.maritalStatus} />
              <InfoRow label={t2('Tên vợ/chồng', 'Spouse Name')} value={farmer.spouseName} icon={<Heart className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Số thành viên gia đình', 'Family Members')} value={farmer.noOfFamilyMembers} />
              <InfoRow label={t2('Loại nhà', 'House Type')} value={farmer.houseType} />
              <InfoRow label={t2('Sở hữu nhà', 'Housing Ownership')} value={farmer.housingOwnership} />
            </div>
            <Separator className="my-3 bg-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <InfoRow label={t2('Loại CCCD', 'ID Type')} value={farmer.nationalIdType} icon={<Shield className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Số CMND/CCCD', 'National ID')} value={farmer.nationalIdNo} />
              <InfoRow label={t2('Đồng ý eKYC', 'eKYC Consent')} value={farmer.ekycConsent ? t2('Có', 'Yes') : t2('Không', 'No')} />
              <InfoRow label={t2('Sở hữu điện thoại', 'Smartphone')} value={farmer.smartphoneOwnership ? t2('Có', 'Yes') : t2('Không', 'No')} icon={<Smartphone className="w-3.5 h-3.5" />} />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Contact & Location */}
      <FadeIn delay={0.1}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-coffee-500" />
              {t2('Liên hệ & Địa chỉ', 'Contact & Location')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <InfoRow label={t2('Số điện thoại', 'Contact Number')} value={farmer.contactNumber} icon={<Phone className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Email', 'Email')} value={farmer.email} icon={<Mail className="w-3.5 h-3.5" />} />
              <Separator className="my-3 bg-border md:col-span-2" />
              <InfoRow label={t2('Quốc gia', 'Country')} value={farmer.country} icon={<MapPin className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Tỉnh/Thành phố', 'Province')} value={farmer.province} />
              <InfoRow label={t2('Quận/Huyện', 'District')} value={farmer.district} />
              <InfoRow label={t2('Xã/Phường', 'Commune')} value={farmer.commune} />
              <InfoRow label={t2('Thôn/Bản', 'Village')} value={farmer.village} />
              <InfoRow label={t2('Mã bưu điện', 'Zip Code')} value={farmer.zipCode} />
              <InfoRow label={t2('Tọa độ GPS', 'GPS Coordinates')} value={`${farmer.latitude}, ${farmer.longitude}`} icon={<CircleDot className="w-3.5 h-3.5" />} />
            </div>
            <Separator className="my-3 bg-border" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <InfoRow label={t2('Ngày đăng ký', 'Enrollment Date')} value={formatDate(farmer.enrollmentDate)} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Nơi đăng ký', 'Enrollment Place')} value={farmer.enrollmentPlace} />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Quick Metrics */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-coffee-50 to-coffee-100 dark:from-coffee-900/20 dark:to-coffee-800/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-coffee-500/20 flex items-center justify-center">
                  <Wheat className="w-5 h-5 text-coffee-600 dark:text-coffee-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{t2('Kinh nghiệm', 'Experience')}</p>
                  <p className="text-xl font-bold text-coffee-700 dark:text-coffee-300">{farmer.yearsOfFarmingExperience} <span className="text-sm">{t2('năm', 'yrs')}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{t2('Tổng diện tích', 'Total Area')}</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{totalArea.toFixed(1)} <span className="text-sm">ha</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{t2('Sản lượng mùa này', 'Yield This Season')}</p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{(totalHarvestVolume / 1000).toFixed(1)} <span className="text-sm">{t2('tấn', 'tons')}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Insurance */}
      <FadeIn delay={0.3}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-coffee-500" />
              {t2('Bảo hiểm', 'Insurance Coverage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <BoolBadge value={farmer.cropInsurance} trueLabel={t2('BH mùa vụ', 'Crop Insurance')} falseLabel={t2('Không BH mùa vụ', 'No Crop Ins.')} />
              <BoolBadge value={farmer.lifeInsurance} trueLabel={t2('BH sinh mạng', 'Life Insurance')} falseLabel={t2('Không BH sinh mạng', 'No Life Ins.')} />
              <BoolBadge value={farmer.healthInsurance} trueLabel={t2('BH y tế', 'Health Insurance')} falseLabel={t2('Không BH y tế', 'No Health Ins.')} />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )

  const FarmLandTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Farm Land Cards */}
      <StaggerContainer className="space-y-6">
        {farmer.farmLands.map((fl, idx) => (
          <StaggerItem key={fl.id}>
            <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-coffee-500 to-coffee-700 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{fl.farmName}</h3>
                    <p className="text-xs text-coffee-200 font-mono">{fl.plotBlockId}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                    {fl.totalLandHolding} ha
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-coffee-100 dark:bg-coffee-900/30 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-coffee-600 dark:text-coffee-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{t2('Loại đất', 'Soil Type')}</p>
                      <p className="text-xs font-medium text-foreground">{fl.soilType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                      <Mountain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{t2('Độ cao', 'Elevation')}</p>
                      <p className="text-xs font-medium text-foreground">{fl.elevation}m ASL</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{t2('Tưới tiêu', 'Irrigation')}</p>
                      <p className="text-xs font-medium text-foreground">{fl.irrigationMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{t2('Cây trồng chính', 'Primary Crop')}</p>
                      <p className="text-xs font-medium text-foreground">{fl.primaryCrop}</p>
                      {fl.secondaryCrop && <p className="text-xs text-muted-foreground">+ {fl.secondaryCrop}</p>}
                    </div>
                  </div>
                </div>

                {/* GPS Polygon */}
                <div className="mb-5 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase">{t2('Ranh giới GPS (Polygon)', 'GPS Polygon Boundary')}</p>
                  </div>
                  <p className="text-xs font-mono text-foreground break-all">{fl.gpsPolygon}</p>
                </div>

                {/* Farm Land Map */}
                <div className="rounded-xl overflow-hidden border border-border">
                  <FarmerLandMap
                    latitude={fl.latitude || 0}
                    longitude={fl.longitude || 0}
                    farmerName={fl.farmName}
                    zoom={14}
                  />
                </div>

                {/* Cultivations */}
                {fl.cultivations?.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sprout className="w-3.5 h-3.5 text-coffee-500" />
                      {t2('Chi tiết canh tác', 'Cultivation Details')} ({fl.cultivations.length})
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs uppercase">{t2('Cây trồng', 'Crop')}</TableHead>
                            <TableHead className="text-xs uppercase">{t2('Giống', 'Variety')}</TableHead>
                            <TableHead className="text-xs uppercase">{t2('Diện tích', 'Area')}</TableHead>
                            <TableHead className="text-xs uppercase">{t2('Ngày trồng', 'Planted')}</TableHead>
                            <TableHead className="text-xs uppercase">{t2('Trạng thái', 'Status')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fl.cultivations.map((cult) => (
                            <TableRow key={cult.id} className="table-row-hover">
                              <TableCell className="text-xs font-medium">{cult.cropName}</TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">{cult.variety}</TableCell>
                              <TableCell className="text-xs">{cult.areaPlanted} ha</TableCell>
                              <TableCell className="text-xs">{formatDate(cult.plantingDate)}</TableCell>
                              <TableCell>
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs border-0">
                                  {cult.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Farm Summary */}
      <FadeIn delay={0.2}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4 text-coffee-500" />
              {t2('Tổng kết nông trại', 'Farm Summary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-xl font-bold text-coffee-600 dark:text-coffee-400">{farmer.farmLands.length}</p>
                <p className="text-xs text-muted-foreground uppercase">{t2('Mảnh đất', 'Plots')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalArea.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground uppercase">{t2('Tổng ha', 'Total ha')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{farmer._count.cultivations}</p>
                <p className="text-xs text-muted-foreground uppercase">{t2('Vụ canh tác', 'Cultivations')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{farmer.yearsOfFarmingExperience}</p>
                <p className="text-xs text-muted-foreground uppercase">{t2('Năm KN', 'Yrs Exp')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )

  const CertificationsTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* EUDR Compliance */}
      <FadeIn>
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <div className={`px-5 py-4 ${farmer.eudrCompliant ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">EUDR Compliance</h3>
                <p className="text-xs text-white/80">{t2('Quy định chống phá rừng EU', 'EU Deforestation Regulation')}</p>
              </div>
              <div className="ml-auto">
                <Badge className={`${farmer.eudrCompliant ? 'bg-emerald-400/30 text-white' : 'bg-red-400/30 text-white'} border-0 text-xs`}>
                  {farmer.eudrCompliant ? t2('Tuân thủ', 'Compliant') : t2('Không tuân thủ', 'Non-Compliant')}
                </Badge>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">{t2('Trạng thái', 'Status')}</p>
                <div className="flex items-center gap-2 mt-1">
                  {farmer.eudrCompliant ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${farmer.eudrCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {farmer.eudrCompliant ? t2('Tuân thủ', 'Compliant') : t2('Không tuân thủ', 'Non-Compliant')}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{t2('Địa chỉ GPS', 'GPS Verified')}</p>
                <p className="text-sm font-medium text-foreground mt-1">{t2('Đã xác minh', 'Verified')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">{t2('Ngày kiểm tra', 'Last Check')}</p>
                <p className="text-sm font-medium text-foreground mt-1">{formatDate('2025-07-22')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Certification Records */}
      <FadeIn delay={0.1}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-coffee-500" />
              {t2('Chứng nhận', 'Certification Records')} ({farmer.certifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StaggerContainer className="space-y-3">
              {farmer.certifications.map((cert) => (
                <StaggerItem key={cert.id}>
                  <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-coffee-100 dark:bg-coffee-900/30 flex items-center justify-center">
                          <BadgeCheck className="w-5 h-5 text-coffee-600 dark:text-coffee-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{cert.type}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cert.certificateNumber}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs border-0 ${cert.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {cert.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-xs">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t2('Cấp ngày', 'Issued')}</p>
                        <p className="font-medium">{formatDate(cert.issuedDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t2('Hết hạn', 'Expiry')}</p>
                        <p className="font-medium">{formatDate(cert.expiryDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t2('Tổ chức cấp', 'Issuing Body')}</p>
                        <p className="font-medium">{cert.issuingBody}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Inspection History */}
      <FadeIn delay={0.2}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-coffee-500" />
              {t2('Lịch sử kiểm tra', 'Inspection History')} ({farmer.inspections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase">{t2('Loại', 'Type')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Kiểm tra viên', 'Inspector')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Ngày', 'Date')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Kết quả', 'Result')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Kế tiếp', 'Next')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmer.inspections.map((insp) => (
                    <TableRow key={insp.id} className="table-row-hover">
                      <TableCell className="text-xs font-medium">{insp.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{insp.inspectorName}</TableCell>
                      <TableCell className="text-xs">{formatDate(insp.inspectionDate)}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border-0 ${insp.result === 'Passed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {insp.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(insp.nextInspection)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Credit Score & Loan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.3}>
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-coffee-500" />
                {t2('Điểm tín dụng', 'Credit Score')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${getCreditScoreColor(farmer.creditScore)}`}>
                  {farmer.creditScore ?? '—'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t2('trên 100', 'out of 100')}</p>
                <Badge className={`mt-2 text-xs border-0 ${
                  (farmer.creditScore ?? 0) >= 80
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : (farmer.creditScore ?? 0) >= 60
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {getCreditScoreLabel(farmer.creditScore)}
                </Badge>
              </div>
              <Progress value={farmer.creditScore} className={`h-3 ${getCreditScoreBarColor(farmer.creditScore)}`} />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>0</span>
                <span>{t2('Rủi ro cao', 'High Risk')}</span>
                <span>{t2('Tốt', 'Good')}</span>
                <span>100</span>
              </div>
              <Separator className="my-4 bg-border" />
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t2('Lịch sử thanh toán', 'Payment History')}</span>
                  <span className="font-medium">{t2('Tốt', 'Good')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t2('Tỷ lệ nợ/thu nhập', 'Debt/Income Ratio')}</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t2('Thời gian tín dụng', 'Credit Length')}</span>
                  <span className="font-medium">3 {t2('năm', 'years')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t2('Chứng nhận tích cực', 'Positive Certifications')}</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">+2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Banknote className="w-4 h-4 text-coffee-500" />
                {t2('Thông tin vay vốn', 'Loan Information')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {farmer.loans.length > 0 ? (
                <StaggerContainer className="space-y-4">
                  {farmer.loans.map((loan) => (
                    <StaggerItem key={loan.id}>
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{loan.source}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(loan.disbursedDate)}</p>
                          </div>
                          <Badge className={`text-xs border-0 ${loan.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                            {loan.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">{t2('Số tiền vay', 'Loan Amount')}</p>
                            <p className="font-semibold text-foreground">{formatCurrency(loan.amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">{t2('Dư nợ', 'Outstanding')}</p>
                            <p className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(loan.outstandingBalance)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">{t2('Lãi suất', 'Interest Rate')}</p>
                            <p className="font-medium">{loan.interestRate}%/yr</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">{t2('Đáo hạn', 'Maturity')}</p>
                            <p className="font-medium">{formatDate(loan.maturityDate)}</p>
                          </div>
                        </div>
                        <Separator className="my-3 bg-border" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{t2('Mục đích:', 'Purpose:')}</span> {loan.purpose}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="text-center py-8">
                  <Banknote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t2('Không có khoản vay', 'No active loans')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )

  const SupplyChainTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Harvest History */}
      <FadeIn>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Sprout className="w-4 h-4 text-coffee-500" />
                {t2('Lịch sử thu hoạch', 'Harvest History')} ({farmer.harvests.length})
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {t2('Tổng sản lượng', 'Total Volume')}: <span className="font-semibold text-foreground">{(totalHarvestVolume / 1000).toFixed(1)} {t2('tấn', 'tons')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase">{t2('Mùa vụ', 'Season')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Ngày', 'Date')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Cây trồng', 'Crop')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('KL (kg)', 'Vol (kg)')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Hạng chất lượng', 'Quality')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Doanh thu', 'Revenue')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Trạng thái', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmer.harvests.map((hv) => (
                    <TableRow key={hv.id} className="table-row-hover cursor-pointer" onClick={() => router.push(`/harvest/${hv.id}`)}>
                      <TableCell className="text-xs font-mono">{hv.season}</TableCell>
                      <TableCell className="text-xs">{formatDate(hv.harvestDate)}</TableCell>
                      <TableCell className="text-xs font-medium">{hv.cropName}</TableCell>
                      <TableCell className="text-xs font-semibold">{hv.volumeKg.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-coffee-100 text-coffee-700 dark:bg-coffee-900/30 dark:text-coffee-400 text-xs border-0">
                          {hv.qualityGrade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(hv.totalRevenue)}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs border-0">
                          {hv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Procurement Records */}
      <FadeIn delay={0.1}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-coffee-500" />
              {t2('Hồ sơ thu mua', 'Procurement Records')} ({farmer.procurements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StaggerContainer className="space-y-3">
              {farmer.procurements.map((proc) => (
                <StaggerItem key={proc.id}>
                  <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground font-mono">{proc.batchCode}</p>
                          <p className="text-xs text-muted-foreground">{proc.centreName}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs border-0 ${proc.status === 'Processed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {proc.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t2('Ngày', 'Date')}</p>
                        <p className="font-medium">{formatDate(proc.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t2('Khối lượng', 'Volume')}</p>
                        <p className="font-medium">{proc.volumeKg.toLocaleString()} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t2('Đơn giá', 'Unit Price')}</p>
                        <p className="font-medium">{formatCurrency(proc.pricePerKg)}/kg</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Revenue Tracking */}
      <FadeIn delay={0.2}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-coffee-500" />
              {t2('Theo dõi doanh thu', 'Revenue Tracking')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">{t2('Tổng doanh thu', 'Total Revenue')}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{(totalHarvestVolume / 1000).toFixed(1)} {t2('tấn', 'tons')}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">{t2('Tổng sản lượng', 'Total Volume')}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-coffee-50 dark:bg-coffee-900/20">
                <p className="text-xl font-bold text-coffee-600 dark:text-coffee-400">{farmer.harvests.length}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">{t2('Vụ thu hoạch', 'Harvests')}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20">
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{formatCurrency(Math.round(totalRevenue / totalHarvestVolume))}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">{t2('Giá TB/kg', 'Avg Price/kg')}</p>
              </div>
            </div>

            {/* Processing Batch Linkage */}
            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-coffee-500" />
              {t2('Liên kết lô chế biến', 'Processing Batch Linkage')}
            </h4>
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-coffee-100 dark:bg-coffee-900/30 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-coffee-600 dark:text-coffee-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{t2('Các mẻ thu mua đã liên kết đến lô chế biến', 'Procurement batches linked to processing')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t2('Truy xuất nguồn gốc từ nông trại đến cốc', 'Traceability from farm to cup')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 shrink-0"
                onClick={() => router.push('/traceability')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t2('Xem chuỗi', 'View Chain')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )

  const DocumentsQRTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* QR Code Display (Large) */}
      <FadeIn>
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-coffee-500 to-coffee-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-white" />
              <h3 className="text-base font-bold text-white">{t2('Mã QR Truy xuất', 'Traceability QR Code')}</h3>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${farmer.farmerCode}`}
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-bold text-foreground font-mono">{farmer.farmerCode}</p>
                  <p className="text-xs text-muted-foreground">{t2('Quét để xác minh', 'Scan to verify')}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={handleDownloadQR}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t2('Tải PNG', 'Download PNG')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {t2('Sao chép', 'Copy Link')}
                  </Button>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">{t2('URL xác minh', 'Verification URL')}</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-mono text-foreground flex-1 break-all">{qrUrl}</p>
                    <Button variant="ghost" size="sm" className="shrink-0" onClick={handleCopyLink}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">{t2('Mã nông dân', 'Farmer Code')}</p>
                    <p className="text-sm font-semibold text-foreground font-mono">{farmer.farmerCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">{t2('Trạng thái', 'Status')}</p>
                    <div className="flex items-center gap-1.5">
                      {farmer.isActive ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{farmer.isActive ? t2('Đang hoạt động', 'Active') : t2('Không hoạt động', 'Inactive')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">{t2('Đã xác minh eKYC', 'eKYC Verified')}</p>
                    <div className="flex items-center gap-1.5">
                      {farmer.ekycConsent ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{farmer.ekycConsent ? t2('Có', 'Yes') : t2('Không', 'No')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">{t2('EUDR', 'EUDR')}</p>
                    <Badge className={`text-xs border-0 ${farmer.eudrCompliant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {farmer.eudrCompliant ? t2('Tuân thủ', 'Compliant') : t2('Không tuân thủ', 'Non-Compliant')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Documents List */}
      <FadeIn delay={0.1}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-coffee-500" />
              {t2('Tài liệu', 'Documents')} ({farmer.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StaggerContainer className="space-y-2">
              {farmer.documents.map((doc) => (
                <StaggerItem key={doc.id}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-coffee-100 dark:bg-coffee-900/30 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-coffee-600 dark:text-coffee-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} · {doc.fileSize} · {formatDate(doc.uploadedDate)}</p>
                    </div>
                    <Badge className={`text-xs border-0 shrink-0 ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {doc.status}
                    </Badge>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Verification History */}
      <FadeIn delay={0.2}>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-coffee-500" />
              {t2('Lịch sử xác minh', 'Verification History')} ({farmer.verifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase">{t2('Ngày', 'Date')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Xác minh bởi', 'Verified By')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Phương thức', 'Method')}</TableHead>
                    <TableHead className="text-xs uppercase">{t2('Kết quả', 'Result')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmer.verifications.map((ver) => (
                    <TableRow key={ver.id} className="table-row-hover">
                      <TableCell className="text-xs">{formatDate(ver.date)}</TableCell>
                      <TableCell className="text-xs">{ver.verifiedBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1">
                          {ver.method === 'NFC Tag Scan' ? <Smartphone className="w-3 h-3" /> : ver.method === 'QR Code Scan' ? <QrCode className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {ver.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{ver.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* ─── Hero Section ──────────────────────────────────────────── */}
        <FadeIn>
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-coffee-700 via-coffee-600 to-coffee-500 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-coffee-400/20 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-coffee-800/30 rounded-full translate-y-1/3 -translate-x-1/4" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-coffee-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

              <div className="relative px-6 py-8 md:px-8 md:py-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center gap-5">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/30 shadow-xl">
                      <AvatarFallback className="bg-coffee-800 text-white text-2xl md:text-3xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push('/farmers')}
                          className="text-white/70 hover:text-white hover:bg-white/10 -ml-2 gap-1 h-8"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="hidden sm:inline text-xs">{t2('Quay lại', 'Back')}</span>
                        </Button>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white">{farmer.fullName}</h1>
                      <p className="text-sm text-coffee-200 font-mono mt-0.5">{farmer.farmerCode}</p>
                      <div className="flex items-center gap-2 mt-2 text-coffee-200">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{farmer.village}, {farmer.commune}, {farmer.district}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge className={`${farmer.isActive ? 'bg-emerald-400/20 text-emerald-100' : 'bg-red-400/20 text-red-100'} border-0 text-xs backdrop-blur-sm`}>
                          {farmer.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
                        </Badge>
                        {farmer.isCertified && (
                          <Badge className="bg-amber-400/20 text-amber-100 border-0 text-xs backdrop-blur-sm gap-1">
                            <Award className="w-3 h-3" />
                            {farmer.certificationType}
                          </Badge>
                        )}
                        {farmer.gapTrainingAttended && (
                          <Badge className="bg-sky-400/20 text-sky-100 border-0 text-xs backdrop-blur-sm gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {t2('Đào tạo GAP', 'GAP Trained')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: QR Code + Actions */}
                  <div className="flex flex-col items-center md:items-end gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-lg">
                        <img
                          src={qrDataUrl}
                          alt={`QR for ${farmer.farmerCode}`}
                          width={100}
                          height={100}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="hidden md:flex flex-col gap-2">
                        <p className="text-xs text-coffee-200 uppercase">{t2('Mã truy xuất', 'Trace Code')}</p>
                        <p className="text-sm font-bold text-white font-mono">{farmer.farmerCode}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-coffee-200 hover:text-white hover:bg-white/10 text-xs gap-1 h-7 -ml-1"
                          onClick={handleDownloadQR}
                        >
                          <Download className="w-3 h-3" />
                          {t2('Tải QR', 'QR')}
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-8"
                              onClick={() => router.push('/farmers')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t2('Chỉnh sửa', 'Edit')}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t2('Chỉnh sửa thông tin', 'Edit farmer info')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-8"
                              onClick={handlePrint}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t2('In', 'Print')}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t2('In hồ sơ', 'Print profile')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-8"
                              onClick={handleDownloadQR}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t2('Mã QR', 'QR')}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t2('Tải mã QR', 'Download QR code')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-8"
                              onClick={handleShare}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t2('Chia sẻ', 'Share')}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t2('Chia sẻ hồ sơ', 'Share profile')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="bg-card px-6 py-4 md:px-8">
              <div className="grid grid-cols-4 gap-3 md:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <TreePine className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-xs text-muted-foreground uppercase">{t2('Đất', 'Lands')}</p>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-foreground">{farmer._count.farmLands}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <Sprout className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-xs text-muted-foreground uppercase">{t2('Canh tác', 'Crops')}</p>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-foreground">{farmer._count.cultivations}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    <p className="text-xs text-muted-foreground uppercase">{t2('Thu hoạch', 'Harvests')}</p>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-foreground">{farmer._count.harvestTraceabilities}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-coffee-500" />
                    <p className="text-xs text-muted-foreground uppercase">{t2('Tín dụng', 'Credit')}</p>
                  </div>
                  <p className={`text-lg md:text-xl font-bold ${getCreditScoreColor(farmer.creditScore)}`}>{farmer.creditScore ?? '—'}</p>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ─── Tabbed Interface ──────────────────────────────────────── */}
        <FadeIn delay={0.15}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full md:w-auto bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
              <TabsTrigger value="overview" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Users className="w-3.5 h-3.5" />
                {t2('Tổng quan', 'Overview')}
              </TabsTrigger>
              <TabsTrigger value="farmland" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <TreePine className="w-3.5 h-3.5" />
                {t2('Đất & Canh tác', 'Farm & Land')}
              </TabsTrigger>
              <TabsTrigger value="certifications" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Award className="w-3.5 h-3.5" />
                {t2('Chứng nhận', 'Certifications')}
              </TabsTrigger>
              <TabsTrigger value="supply" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Package className="w-3.5 h-3.5" />
                {t2('Chuỗi cung ứng', 'Supply Chain')}
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <QrCode className="w-3.5 h-3.5" />
                {t2('Tài liệu & QR', 'Docs & QR')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="farmland">
              <FarmLandTab />
            </TabsContent>
            <TabsContent value="certifications">
              <CertificationsTab />
            </TabsContent>
            <TabsContent value="supply">
              <SupplyChainTab />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsQRTab />
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* ─── Footer Info ──────────────────────────────────────────── */}
        <FadeIn delay={0.2}>
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{t2('Ngày tạo', 'Created')}: {formatDate(farmer.createdAt)}</span>
                  <span>{t2('Cập nhật', 'Updated')}: {formatDate(farmer.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-coffee-500">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">{farmer.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Hidden canvas for QR download */}
      <canvas ref={qrCanvasRef} className="hidden" />
    </DashboardShell>
  )
}

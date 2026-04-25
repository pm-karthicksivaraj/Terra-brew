'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coffee, CheckCircle2, XCircle, AlertTriangle, Shield, Globe,
  MapPin, Sprout, Truck, Package, Clock, Eye, Link2, Hash,
  Leaf, Award, Fingerprint, ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Deterministic pseudo-random based on seed to avoid SSR/client mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// ─── Types ───────────────────────────────────────────────────────
interface TraceStep {
  blockIndex: number
  stage: string
  timestamp: string
  dataHash: string
  blockHash: string
}

interface VerifyData {
  qrCode: string
  status?: string
  message?: string
  entityType: string | null
  entityId: string | null
  signatureValid: boolean
  chainIntegrity: { valid: boolean; totalBlocks: number }
  traceSteps: TraceStep[]
  entityDetails: Record<string, unknown> | null
  scanCount: number
  lastScannedAt: string | null
}

type PageState = 'loading' | 'verified' | 'tampered' | 'not_found' | 'error'

// ─── Stage Icons & Labels ────────────────────────────────────────
const STAGE_META: Record<string, { icon: React.ElementType; labelVi: string; labelEn: string; color: string }> = {
  FARMER_REGISTRATION: { icon: Sprout, labelVi: 'Đăng ký Nông dân', labelEn: 'Farmer Registration', color: 'text-green-600' },
  FARM_LAND: { icon: MapPin, labelVi: 'Đất Nông trại', labelEn: 'Farm Land', color: 'text-amber-600' },
  CULTIVATION: { icon: Leaf, labelVi: 'Canh tác', labelEn: 'Cultivation', color: 'text-emerald-600' },
  LAND_PREPARATION: { icon: Sprout, labelVi: 'Chuẩn bị Đất', labelEn: 'Land Preparation', color: 'text-lime-600' },
  NURSERY: { icon: Sprout, labelVi: 'Ươm mầm', labelEn: 'Nursery', color: 'text-green-500' },
  FERTILIZER_APPLICATION: { icon: Leaf, labelVi: 'Bón Phân', labelEn: 'Fertilizer Application', color: 'text-teal-600' },
  CROP_MONITORING: { icon: Eye, labelVi: 'Giám sát Mùa màng', labelEn: 'Crop Monitoring', color: 'text-cyan-600' },
  PEST_DISEASE: { icon: Leaf, labelVi: 'Sâu Bệnh', labelEn: 'Pest & Disease', color: 'text-orange-600' },
  COFFEE_INSPECTION: { icon: Award, labelVi: 'Kiểm tra Cà phê', labelEn: 'Coffee Inspection', color: 'text-yellow-600' },
  HARVEST: { icon: Coffee, labelVi: 'Thu hoạch', labelEn: 'Harvest', color: 'text-amber-700' },
  PROCUREMENT: { icon: Truck, labelVi: 'Thu mua', labelEn: 'Procurement', color: 'text-orange-600' },
  PROCESSING: { icon: Package, labelVi: 'Chế biến', labelEn: 'Processing', color: 'text-coffee-700' },
  PACKAGING: { icon: Package, labelVi: 'Đóng gói', labelEn: 'Packaging', color: 'text-coffee-800' },
}

const ENTITY_LABELS: Record<string, { labelVi: string; labelEn: string }> = {
  Farmer: { labelVi: 'Nông dân', labelEn: 'Farmer' },
  NFC_Farmer: { labelVi: 'Nông dân (NFC)', labelEn: 'Farmer (NFC)' },
  FarmLand: { labelVi: 'Đất Nông trại', labelEn: 'Farm Land' },
  Cultivation: { labelVi: 'Canh tác', labelEn: 'Cultivation' },
  HarvestTraceability: { labelVi: 'Lô Thu hoạch', labelEn: 'Harvest Batch' },
  ProcurementRecord: { labelVi: 'Thu mua', labelEn: 'Procurement' },
  ProcessingJobOrder: { labelVi: 'Chế biến', labelEn: 'Processing' },
}

// ─── Coffee Bean Spinner Component ──────────────────────────────
function CoffeeBeanSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Coffee className="w-16 h-16 text-amber-200" />
      </motion.div>
      <div className="flex flex-col items-center gap-1">
        <motion.p
          className="text-amber-200 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Đang xác minh...
        </motion.p>
        <p className="text-amber-200/50 text-xs">Verifying authenticity...</p>
      </div>
    </div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────
export default function PublicVerifyPage() {
  const params = useParams()
  const qrCode = params.qrCode as string

  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [pageState, setPageState] = useState<PageState>('loading')
  const [data, setData] = useState<VerifyData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [mounted, setMounted] = useState(false)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  // Pre-compute particle positions using deterministic random
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      width: 3 + seededRandom(i * 4 + 1) * 6,
      height: 3 + seededRandom(i * 4 + 2) * 6,
      left: seededRandom(i * 4 + 3) * 100,
      top: seededRandom(i * 4 + 4) * 100,
      opacity: 0.08 + seededRandom(i * 4 + 5) * 0.15,
      xShift: seededRandom(i * 4 + 6) * 16 - 8,
      duration: 5 + seededRandom(i * 4 + 7) * 8,
      delay: seededRandom(i * 4 + 8) * 4,
    })),
  [])

  useEffect(() => { setMounted(true) }, [])

  // Fetch verification data on mount
  useEffect(() => {
    if (!qrCode) return

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/verify/${encodeURIComponent(qrCode)}`)
        const json = await res.json()

        if (!json.success) {
          setPageState('error')
          setErrorMsg(json.error || 'Unknown error')
          return
        }

        const verifyData: VerifyData = json.data
        setData(verifyData)

        if (verifyData.status === 'not_found') {
          setPageState('not_found')
        } else if (!verifyData.signatureValid || !verifyData.chainIntegrity.valid) {
          setPageState('tampered')
        } else {
          setPageState('verified')
        }
      } catch {
        setPageState('error')
        setErrorMsg('Network error')
      }
    }

    fetchData()
  }, [qrCode])

  // Format timestamp
  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return lang === 'vi'
      ? d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Extract entity details for display
  const getEntityFields = () => {
    if (!data?.entityDetails) return []
    const skip = ['id', 'createdAt', 'updatedAt', 'isActive', 'tenantId', 'farmer']
    return Object.entries(data.entityDetails)
      .filter(([key, val]) => !skip.includes(key) && val !== null && val !== undefined && typeof val !== 'object')
      .slice(0, 10)
  }

  // Extract certifications from entity details
  const getCertifications = () => {
    if (!data?.entityDetails) return []
    const certs: string[] = []
    const d = data.entityDetails
    if (d.organicCertified) certs.push(lang === 'vi' ? 'Hữu cơ' : 'Organic')
    if (d.fairTradeCertified) certs.push('Fair Trade')
    if (d.rainforestAlliance) certs.push(lang === 'vi' ? 'Liên minh Rừng mưa' : 'Rainforest Alliance')
    if (d.certifications && typeof d.certifications === 'string') certs.push(d.certifications as string)
    if (d.certificationType) certs.push(d.certificationType as string)
    if (d.qualityGrade) certs.push(`${lang === 'vi' ? 'Hạng' : 'Grade'}: ${d.qualityGrade}`)
    return certs
  }

  // Coffee variety
  const getVariety = () => {
    if (!data?.entityDetails) return null
    const d = data.entityDetails
    return (d.coffeeVariety || d.variety || d.coffeeType || null) as string | null
  }

  // Origin
  const getOrigin = () => {
    if (!data?.entityDetails) return null
    const d = data.entityDetails
    return (d.region || d.province || d.district || d.origin || null) as string | null
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* ─── Background ─── */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-800 via-coffee-900 to-stone-900" />

      {/* Floating coffee particles — only after mount to prevent hydration mismatch */}
      {mounted && particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `rgba(212, 165, 116, ${p.opacity})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.xShift, 0],
            opacity: [0.08, 0.25, 0.08],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4a574, transparent)', top: '-8%', right: '-8%' }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5a1e, transparent)', bottom: '-5%', left: '-5%' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ─── Header Bar ─── */}
      <header className="relative z-10 w-full">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-lg shadow-coffee-400/20">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Terra Brew</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="gap-1.5 text-amber-200/70 hover:text-amber-100 hover:bg-white/10 text-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'English' : 'Tiếng Việt'}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pb-8 pt-2">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* ─── Loading State ─── */}
            {pageState === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <CoffeeBeanSpinner />
              </motion.div>
            )}

            {/* ─── Verified State ─── */}
            {pageState === 'verified' && data && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Verified Hero Card */}
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Green Verified Banner */}
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
                    >
                      <CheckCircle2 className="w-14 h-14 text-white drop-shadow-lg" />
                    </motion.div>
                    <motion.h1
                      className="text-xl font-bold text-white mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {t('Sản phẩm Đã Xác minh', 'Product Verified')}
                    </motion.h1>
                    <motion.p
                      className="text-green-100 text-xs mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {t('Nguồn gốc cà phê đã được xác thực qua blockchain', 'Coffee origin verified via blockchain')}
                    </motion.p>
                  </div>

                  {/* Product Info */}
                  <div className="px-6 py-5 space-y-4">
                    {/* Entity Type & Blockchain Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      {data.entityType && (
                        <Badge className="bg-coffee-100 text-coffee-800 text-[10px] border-0 font-medium px-2.5 py-1 rounded-lg">
                          {ENTITY_LABELS[data.entityType]?.[lang === 'vi' ? 'labelVi' : 'labelEn'] || data.entityType}
                        </Badge>
                      )}
                      <Badge className="bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 font-medium px-2.5 py-1 rounded-lg gap-1">
                        <Shield className="w-3 h-3" />
                        {t('Chữ ký hợp lệ', 'Signature Valid')}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-700 text-[10px] border border-blue-200 font-medium px-2.5 py-1 rounded-lg gap-1">
                        <Link2 className="w-3 h-3" />
                        {t('Chuỗi toàn vẹn', 'Chain Intact')}
                      </Badge>
                    </div>

                    {/* Coffee Details */}
                    {(getVariety() || getOrigin() || getCertifications().length > 0) && (
                      <div className="bg-gradient-to-br from-coffee-50 to-amber-50/50 rounded-xl p-4 space-y-3">
                        {getVariety() && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-coffee-200/60 flex items-center justify-center">
                              <Coffee className="w-3.5 h-3.5 text-coffee-700" />
                            </div>
                            <div>
                              <p className="text-[10px] text-coffee-500 uppercase tracking-wider">{t('Giống cà phê', 'Coffee Variety')}</p>
                              <p className="text-xs font-bold text-coffee-900">{getVariety()}</p>
                            </div>
                          </div>
                        )}
                        {getOrigin() && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-coffee-200/60 flex items-center justify-center">
                              <MapPin className="w-3.5 h-3.5 text-coffee-700" />
                            </div>
                            <div>
                              <p className="text-[10px] text-coffee-500 uppercase tracking-wider">{t('Xuất xứ', 'Origin')}</p>
                              <p className="text-xs font-bold text-coffee-900">{getOrigin()}</p>
                            </div>
                          </div>
                        )}
                        {getCertifications().length > 0 && (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-coffee-200/60 flex items-center justify-center">
                              <Award className="w-3.5 h-3.5 text-coffee-700" />
                            </div>
                            <div>
                              <p className="text-[10px] text-coffee-500 uppercase tracking-wider">{t('Chứng nhận', 'Certifications')}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {getCertifications().map((cert, i) => (
                                  <span key={i} className="inline-flex items-center bg-white/80 text-coffee-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-coffee-200/50">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Entity Details Table */}
                    {getEntityFields().length > 0 && (
                      <div className="bg-white/60 rounded-xl p-3.5 space-y-1.5">
                        <p className="text-[10px] text-coffee-500 uppercase tracking-wider font-medium mb-2">
                          {t('Thông tin chi tiết', 'Detailed Information')}
                        </p>
                        {getEntityFields().map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start text-[11px]">
                            <span className="text-coffee-500 capitalize shrink-0">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-coffee-800 font-medium text-right ml-3 max-w-[60%] break-all">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* ─── Product Journey Timeline ─── */}
                {data.traceSteps.length > 0 && (
                  <motion.div
                    className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="px-6 py-4 border-b border-coffee-100">
                      <h2 className="text-sm font-bold text-coffee-900 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-coffee-600" />
                        {t('Hành trình Sản phẩm', 'Product Journey')}
                      </h2>
                      <p className="text-[10px] text-coffee-500 mt-0.5">
                        {t('Mỗi bước được ghi nhận trên blockchain không thể thay đổi', 'Each step is immutably recorded on blockchain')}
                      </p>
                    </div>

                    <div className="px-6 py-4">
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 via-amber-300 to-coffee-300 rounded-full" />

                        <div className="space-y-0">
                          {data.traceSteps.map((step, idx) => {
                            const meta = STAGE_META[step.stage] || {
                              icon: Hash,
                              labelVi: step.stage,
                              labelEn: step.stage,
                              color: 'text-coffee-600',
                            }
                            const Icon = meta.icon
                            const isFirst = idx === 0
                            const isLast = idx === data.traceSteps.length - 1

                            return (
                              <motion.div
                                key={step.blockIndex}
                                className="relative flex gap-4"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                              >
                                {/* Timeline node */}
                                <div className={`relative z-10 flex-shrink-0 w-[31px] h-[31px] rounded-full flex items-center justify-center ${
                                  isFirst
                                    ? 'bg-emerald-100 ring-2 ring-emerald-400'
                                    : isLast
                                      ? 'bg-coffee-100 ring-2 ring-coffee-400'
                                      : 'bg-amber-50 ring-2 ring-amber-300'
                                }`}>
                                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                                </div>

                                {/* Content */}
                                <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-coffee-900">
                                      {t(meta.labelVi, meta.labelEn)}
                                    </p>
                                    <span className="text-[9px] text-coffee-400 font-mono">
                                      #{step.blockIndex}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Clock className="w-3 h-3 text-coffee-400" />
                                    <span className="text-[10px] text-coffee-500">
                                      {formatTime(step.timestamp)}
                                    </span>
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-1">
                                    <div className="h-1 w-1 rounded-full bg-emerald-400" />
                                    <span className="text-[9px] font-mono text-coffee-400 truncate max-w-[220px]">
                                      {step.dataHash.substring(0, 16)}...
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── Blockchain Verification Badge ─── */}
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-coffee-900">
                          {t('Xác minh Blockchain', 'Blockchain Verified')}
                        </p>
                        <p className="text-[10px] text-coffee-500 mt-0.5">
                          {t(
                            `${data.chainIntegrity.totalBlocks} khối dữ liệu đã được xác minh toàn vẹn`,
                            `${data.chainIntegrity.totalBlocks} data blocks verified with full integrity`
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge className="bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 font-medium">
                          {t('Hợp lệ', 'Valid')}
                        </Badge>
                      </div>
                    </div>

                    {/* Verification details */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-coffee-50/80 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Fingerprint className="w-3 h-3 text-coffee-600" />
                          <span className="text-[9px] font-bold text-coffee-700 uppercase tracking-wider">HMAC</span>
                        </div>
                        <p className="text-[10px] text-coffee-600">
                          {data.signatureValid
                            ? t('Chữ ký hợp lệ ✓', 'Signature valid ✓')
                            : t('Chữ ký không hợp lệ ✗', 'Signature invalid ✗')
                          }
                        </p>
                      </div>
                      <div className="bg-coffee-50/80 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Link2 className="w-3 h-3 text-coffee-600" />
                          <span className="text-[9px] font-bold text-coffee-700 uppercase tracking-wider">Hash Chain</span>
                        </div>
                        <p className="text-[10px] text-coffee-600">
                          {data.chainIntegrity.valid
                            ? t('Toàn vẹn ✓', 'Intact ✓')
                            : t('Đứt chuỗi ✗', 'Broken ✗')
                          }
                        </p>
                      </div>
                    </div>

                    {/* Scan count */}
                    <div className="mt-3 flex items-center justify-between text-[10px] text-coffee-400 pt-3 border-t border-coffee-100">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {t(`Lượt quét: ${data.scanCount}`, `Scans: ${data.scanCount}`)}
                      </span>
                      {data.lastScannedAt && (
                        <span>
                          {t('Quét gần nhất', 'Last scan')}: {formatTime(data.lastScannedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── Tampered State ─── */}
            {pageState === 'tampered' && data && (
              <motion.div
                key="tampered"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Red Warning Banner */}
                  <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      <XCircle className="w-14 h-14 text-white drop-shadow-lg" />
                    </motion.div>
                    <motion.h1
                      className="text-xl font-bold text-white mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {t('Phát hiện Giả mạo!', 'Tampering Detected!')}
                    </motion.h1>
                    <motion.p
                      className="text-red-100 text-xs mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {t('Dữ liệu sản phẩm không khớp với bản ghi blockchain', 'Product data does not match blockchain records')}
                    </motion.p>
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    {/* Warning details */}
                    <div className="bg-red-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-800">
                            {t('Cảnh báo Bảo mật', 'Security Warning')}
                          </p>
                          <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                            {t(
                              'Sản phẩm này có thể đã bị thay đổi hoặc giả mạo. Chữ ký HMAC hoặc chuỗi hash không còn toàn vẹn. Vui lòng liên hệ nhà sản xuất.',
                              'This product may have been altered or counterfeited. The HMAC signature or hash chain is no longer intact. Please contact the manufacturer.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* What failed */}
                    <div className="space-y-2">
                      {!data.signatureValid && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-700 font-medium">
                            {t('Chữ ký HMAC không hợp lệ', 'HMAC signature is invalid')}
                          </span>
                        </div>
                      )}
                      {!data.chainIntegrity.valid && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-700 font-medium">
                            {t('Chuỗi hash bị đứt', 'Hash chain is broken')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* QR code info */}
                    <div className="bg-coffee-50/80 rounded-xl p-3 space-y-1">
                      <p className="text-[10px] text-coffee-500 uppercase tracking-wider font-medium">
                        {t('Mã QR', 'QR Code')}
                      </p>
                      <p className="text-[11px] font-mono text-coffee-700 break-all">{data.qrCode}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── Not Found State ─── */}
            {pageState === 'not_found' && (
              <motion.div
                key="not_found"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Yellow Warning Banner */}
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-5 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      <AlertTriangle className="w-14 h-14 text-white drop-shadow-lg" />
                    </motion.div>
                    <motion.h1
                      className="text-xl font-bold text-white mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {t('Không tìm thấy', 'Not Found')}
                    </motion.h1>
                    <motion.p
                      className="text-amber-900/60 text-xs mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {t('Mã QR không có trong hệ thống', 'QR code not found in system')}
                    </motion.p>
                  </div>

                  <div className="px-6 py-6 space-y-4">
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <Coffee className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {t(
                          'Mã QR bạn quét không tồn tại trong hệ thống Terra Brew. Điều này có thể do mã chưa được đăng ký, đã hết hạn, hoặc bạn đang quét một sản phẩm không thuộc nền tảng của chúng tôi.',
                          'The QR code you scanned does not exist in the Terra Brew system. This may be because the code hasn\'t been registered, has expired, or you\'re scanning a product not on our platform.'
                        )}
                      </p>
                    </div>

                    <div className="bg-coffee-50/80 rounded-xl p-3 space-y-1">
                      <p className="text-[10px] text-coffee-500 uppercase tracking-wider font-medium">
                        {t('Mã đã quét', 'Scanned Code')}
                      </p>
                      <p className="text-[11px] font-mono text-coffee-700 break-all">{qrCode}</p>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-coffee-500 uppercase tracking-wider font-medium">
                        {t('Gợi ý', 'Suggestions')}
                      </p>
                      <ul className="text-[11px] text-coffee-600 space-y-1.5">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-coffee-400 shrink-0 mt-0.5" />
                          {t('Kiểm tra lại mã QR trên bao bì sản phẩm', 'Double-check the QR code on the product packaging')}
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-coffee-400 shrink-0 mt-0.5" />
                          {t('Đảm bảo quét mã chính xác, không bị mờ hoặc rách', 'Ensure you scan the correct code without blur or damage')}
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-coffee-400 shrink-0 mt-0.5" />
                          {t('Liên hệ nhà sản xuất nếu vấn đề vẫn tiếp tục', 'Contact the manufacturer if the problem persists')}
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── Error State ─── */}
            {pageState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gradient-to-r from-stone-500 to-stone-600 px-6 py-5 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      <AlertTriangle className="w-14 h-14 text-white drop-shadow-lg" />
                    </motion.div>
                    <motion.h1
                      className="text-xl font-bold text-white mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {t('Lỗi Hệ thống', 'System Error')}
                    </motion.h1>
                    <motion.p
                      className="text-stone-200 text-xs mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {t('Không thể xác minh lúc này', 'Unable to verify at this time')}
                    </motion.p>
                  </div>

                  <div className="px-6 py-6 space-y-4">
                    <div className="bg-stone-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t(
                          'Đã xảy ra lỗi khi xác minh mã QR của bạn. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.',
                          'An error occurred while verifying your QR code. Please try again later or check your network connection.'
                        )}
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="bg-coffee-50/80 rounded-xl p-3">
                        <p className="text-[10px] text-coffee-500 uppercase tracking-wider font-medium mb-1">
                          {t('Chi tiết lỗi', 'Error Details')}
                        </p>
                        <p className="text-[11px] font-mono text-red-600 break-all">{errorMsg}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <p className="text-amber-200/40 text-[10px]">
            &copy; {new Date().getFullYear()} Terra Brew — {t('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
          </p>
        </div>
      </footer>
    </div>
  )
}

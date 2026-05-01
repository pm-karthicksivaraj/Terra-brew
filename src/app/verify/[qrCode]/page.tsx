'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Coffee, CheckCircle2, XCircle, AlertTriangle, Shield, Globe,
  MapPin, Sprout, Truck, Package, Clock, Eye, Link2, Hash,
  Leaf, Award, Fingerprint, ArrowRight, EyeOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'

// Deterministic pseudo-random to avoid SSR/client mismatch
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

// ─── Sensitive Field Component ───────────────────────────────

const VERIFY_SENSITIVE_KEYS = new Set([
  'contactNumber', 'nationalIdNo', 'phone', 'email',
  'pricePerKg', 'totalAmount', 'paymentStatus', 'totalPurchaseAmount',
  'purchasePricePerKg', 'latitude', 'longitude', 'gpsLat', 'gpsLng',
  'idProofPhoto', 'farmerPhoto', 'firstName', 'lastName', 'middleName',
])

function VerifySensitiveField({ fieldKey, value }: { fieldKey: string; value: string }) {
  const [revealed, setRevealed] = useState(false)
  const isSensitive = VERIFY_SENSITIVE_KEYS.has(fieldKey)

  if (!isSensitive) {
    return <>{value}</>
  }

  return (
    <span className="inline-flex items-center gap-1">
      {revealed ? (
        <span>{value}</span>
      ) : (
        <span className="text-stone-400 tracking-wider">{'*'.repeat(Math.min(String(value).length, 8))}</span>
      )}
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="inline-flex items-center justify-center w-4 h-4 text-stone-400 hover:text-stone-600 transition-colors"
        aria-label={revealed ? 'Hide' : 'Reveal'}
      >
        {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </span>
  )
}

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
  PROCESSING: { icon: Package, labelVi: 'Chế biến', labelEn: 'Processing', color: 'text-foreground' },
  PACKAGING: { icon: Package, labelVi: 'Đóng gói', labelEn: 'Packaging', color: 'text-foreground' },
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

// ─── Main Page Component ─────────────────────────────────────────
export default function PublicVerifyPage() {
  const params = useParams()
  const qrCode = params.qrCode as string
  const { t: tI18n, t2, lang, setLang } = useI18n()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [data, setData] = useState<VerifyData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Translation helper (vi, en) for this page
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* ─── Background ─── */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-stone-900" />

      {/* Floating coffee particles — pure CSS */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `rgba(212, 165, 116, ${p.opacity})`,
            animation: `verifyFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Gradient orbs — pure CSS */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4a574, transparent)', top: '-8%', right: '-8%', animation: 'verifyPulse 10s ease-in-out infinite' }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5a1e, transparent)', bottom: '-5%', left: '-5%', animation: 'verifyPulse 12s ease-in-out infinite' }}
      />

      {/* ─── Header Bar ─── */}
      <header className="relative z-10 w-full">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5" style={{ animation: 'verifySlideLeft 0.5s ease-out 0.2s both' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">{t2('Terra Brew', 'Terra Brew')}</span>
          </div>

          <div style={{ animation: 'verifySlideRight 0.5s ease-out 0.3s both' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="gap-1.5 text-amber-200/70 hover:text-amber-100 hover:bg-white/10 text-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'English' : 'Tiếng Việt'}
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pb-8 pt-2">
        <div className="w-full max-w-lg space-y-4">

          {/* ─── Loading State ─── */}
          {pageState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-16 h-16" style={{ animation: 'verifySpin 2s linear infinite' }}>
                <Coffee className="w-16 h-16 text-amber-200" />
              </div>
              <div className="flex flex-col items-center gap-1 mt-4">
                <p className="text-amber-200 text-sm font-medium" style={{ animation: 'verifyPulseText 1.5s ease-in-out infinite' }}>
                  Đang xác minh...
                </p>
                <p className="text-amber-200/50 text-xs">Verifying authenticity...</p>
              </div>
            </div>
          )}

          {/* ─── Verified State ─── */}
          {pageState === 'verified' && data && (
            <>
              {/* Verified Hero Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden" style={{ animation: 'verifyFadeUp 0.5s ease-out both' }}>
                {/* Green Verified Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 flex flex-col items-center text-center">
                  <div style={{ animation: 'verifyScaleIn 0.4s ease-out 0.3s both' }}>
                    <CheckCircle2 className="w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                  <h1 className="text-xl font-bold text-white mt-2">{t2('Sản phẩm Đã Xác minh', 'Product Verified')}</h1>
                  <p className="text-green-100 text-xs mt-1">{t2('Nguồn gốc cà phê đã được xác thực qua blockchain', 'Coffee origin verified via blockchain')}</p>
                </div>

                {/* Product Info */}
                <div className="px-6 py-5 space-y-4">
                  {/* Entity Type & Blockchain Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    {data.entityType && (
                      <Badge className="bg-muted text-foreground text-[10px] border-0 font-medium px-2.5 py-1 rounded-lg">
                        {ENTITY_LABELS[data.entityType]?.[lang === 'vi' ? 'labelVi' : 'labelEn'] || data.entityType}
                      </Badge>
                    )}
                    <Badge className="bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 font-medium px-2.5 py-1 rounded-lg gap-1">
                      <Shield className="w-3 h-3" />
                      {t2('Chữ ký hợp lệ', 'Signature Valid')}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 text-[10px] border border-blue-200 font-medium px-2.5 py-1 rounded-lg gap-1">
                      <Link2 className="w-3 h-3" />
                      {t2('Chuỗi toàn vẹn', 'Chain Intact')}
                    </Badge>
                  </div>

                  {/* Coffee Details */}
                  {(getVariety() || getOrigin() || getCertifications().length > 0) && (
                    <div className="bg-gradient-to-br from-primary to-amber-50/50 rounded-xl p-4 space-y-3">
                      {getVariety() && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                            <Coffee className="w-3.5 h-3.5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] text-foreground uppercase tracking-wider">{t2('Giống cà phê', 'Coffee Variety')}</p>
                            <p className="text-xs font-bold text-foreground">{getVariety()}</p>
                          </div>
                        </div>
                      )}
                      {getOrigin() && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] text-foreground uppercase tracking-wider">{t2('Xuất xứ', 'Origin')}</p>
                            <p className="text-xs font-bold text-foreground">{getOrigin()}</p>
                          </div>
                        </div>
                      )}
                      {getCertifications().length > 0 && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                            <Award className="w-3.5 h-3.5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] text-foreground uppercase tracking-wider">{t2('Chứng nhận', 'Certifications')}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {getCertifications().map((cert, i) => (
                                <span key={i} className="inline-flex items-center bg-card/80 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-md border border-border">
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
                    <div className="bg-card/60 rounded-xl p-3.5 space-y-1.5">
                      <p className="text-[10px] text-foreground uppercase tracking-wider font-medium mb-2">
                        {t2('Thông tin chi tiết', 'Detailed Information')}
                      </p>
                      {getEntityFields().map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start text-[11px]">
                          <span className="text-foreground capitalize shrink-0">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-foreground font-medium text-right ml-3 max-w-[60%] break-all">
                            <VerifySensitiveField fieldKey={key} value={String(value)} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Product Journey Timeline ─── */}
              {data.traceSteps.length > 0 && (
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden" style={{ animation: 'verifyFadeUp 0.5s ease-out 0.3s both' }}>
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-foreground" />
                      {t2('Hành trình Sản phẩm', 'Product Journey')}
                    </h2>
                    <p className="text-[10px] text-foreground mt-0.5">
                      {t2('Mỗi bước được ghi nhận trên blockchain không thể thay đổi', 'Each step is immutably recorded on blockchain')}
                    </p>
                  </div>

                  <div className="px-6 py-4">
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 via-amber-300 to-primary rounded-full" />

                      <div className="space-y-0">
                        {data.traceSteps.map((step, idx) => {
                          const meta = STAGE_META[step.stage] || {
                            icon: Hash,
                            labelVi: step.stage,
                            labelEn: step.stage,
                            color: 'text-foreground',
                          }
                          const Icon = meta.icon
                          const isFirst = idx === 0
                          const isLast = idx === data.traceSteps.length - 1

                          return (
                            <div key={step.blockIndex} className="relative flex gap-4" style={{ animation: `verifySlideIn 0.4s ease-out ${0.4 + idx * 0.1}s both` }}>
                              {/* Timeline node */}
                              <div className={`relative z-10 flex-shrink-0 w-[31px] h-[31px] rounded-full flex items-center justify-center ${
                                isFirst
                                  ? 'bg-emerald-100 ring-2 ring-emerald-400'
                                  : isLast
                                    ? 'bg-muted ring-2 ring-primary'
                                    : 'bg-amber-50 ring-2 ring-amber-300'
                              }`}>
                                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                              </div>

                              {/* Content */}
                              <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-foreground">
                                    {t(meta.labelVi, meta.labelEn)}
                                  </p>
                                  <span className="text-[9px] text-foreground font-mono">
                                    #{step.blockIndex}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3 h-3 text-foreground" />
                                  <span className="text-[10px] text-foreground">
                                    {formatTime(step.timestamp)}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-1">
                                  <div className="h-1 w-1 rounded-full bg-emerald-400" />
                                  <span className="text-[9px] font-mono text-foreground truncate max-w-[220px]">
                                    {step.dataHash.substring(0, 16)}...
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Blockchain Verification Badge ─── */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden" style={{ animation: 'verifyFadeUp 0.5s ease-out 0.5s both' }}>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">
                        {t2('Xác minh Blockchain', 'Blockchain Verified')}
                      </p>
                      <p className="text-[10px] text-foreground mt-0.5">
                        {t(
                          `${data.chainIntegrity.totalBlocks} khối dữ liệu đã được xác minh toàn vẹn`,
                          `${data.chainIntegrity.totalBlocks} data blocks verified with full integrity`
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className="bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 font-medium">
                        {t2('Hợp lệ', 'Valid')}
                      </Badge>
                    </div>
                  </div>

                  {/* Verification details */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Fingerprint className="w-3 h-3 text-foreground" />
                        <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">{t2('HMAC', 'HMAC')}</span>
                      </div>
                      <p className="text-[10px] text-foreground">
                        {data.signatureValid
                          ? t2('Chữ ký hợp lệ ✓', 'Signature valid ✓')
                          : t2('Chữ ký không hợp lệ ✗', 'Signature invalid ✗')
                        }
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Link2 className="w-3 h-3 text-foreground" />
                        <span className="text-[9px] font-bold text-foreground uppercase tracking-wider">{t2('Chuỗi Hash', 'Hash Chain')}</span>
                      </div>
                      <p className="text-[10px] text-foreground">
                        {data.chainIntegrity.valid
                          ? t2('Toàn vẹn ✓', 'Intact ✓')
                          : t2('Đứt chuỗi ✗', 'Broken ✗')
                        }
                      </p>
                    </div>
                  </div>

                  {/* Scan count */}
                  <div className="mt-3 flex items-center justify-between text-[10px] text-foreground pt-3 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {t(`Lượt quét: ${data.scanCount}`, `Scans: ${data.scanCount}`)}
                    </span>
                    {data.lastScannedAt && (
                      <span>
                        {t2('Quét gần nhất', 'Last scan')}: {formatTime(data.lastScannedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── Tampered State ─── */}
          {pageState === 'tampered' && data && (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden" style={{ animation: 'verifyFadeUp 0.5s ease-out both' }}>
              {/* Red Warning Banner */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex flex-col items-center text-center">
                <div style={{ animation: 'verifyScaleIn 0.4s ease-out 0.2s both' }}>
                  <XCircle className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-xl font-bold text-white mt-2">{t2('Phát hiện Giả mạo!', 'Tampering Detected!')}</h1>
                <p className="text-red-100 text-xs mt-1">{t2('Dữ liệu sản phẩm không khớp với bản ghi blockchain', 'Product data does not match blockchain records')}</p>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="bg-red-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-800">{t2('Cảnh báo Bảo mật', 'Security Warning')}</p>
                      <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                        {t(
                          'Sản phẩm này có thể đã bị thay đổi hoặc giả mạo. Chữ ký HMAC hoặc chuỗi hash không còn toàn vẹn. Vui lòng liên hệ nhà sản xuất.',
                          'This product may have been altered or counterfeited. The HMAC signature or hash chain is no longer intact. Please contact the manufacturer.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {!data.signatureValid && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700 font-medium">{t2('Chữ ký HMAC không hợp lệ', 'HMAC signature is invalid')}</span>
                    </div>
                  )}
                  {!data.chainIntegrity.valid && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700 font-medium">{t2('Chuỗi hash bị đứt', 'Hash chain is broken')}</span>
                    </div>
                  )}
                </div>

                <div className="bg-muted rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-foreground uppercase tracking-wider font-medium">{t2('Mã QR', 'QR Code')}</p>
                  <p className="text-[11px] font-mono text-foreground break-all">{data.qrCode}</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Not Found State ─── */}
          {pageState === 'not_found' && (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden" style={{ animation: 'verifyFadeUp 0.5s ease-out both' }}>
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-5 flex flex-col items-center text-center">
                <div style={{ animation: 'verifyScaleIn 0.4s ease-out 0.2s both' }}>
                  <AlertTriangle className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-xl font-bold text-white mt-2">{t2('Không tìm thấy', 'Not Found')}</h1>
                <p className="text-amber-900/60 text-xs mt-1">{t2('Mã QR không có trong hệ thống', 'QR code not found in system')}</p>
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

                <div className="bg-muted rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-foreground uppercase tracking-wider font-medium">{t2('Mã đã quét', 'Scanned Code')}</p>
                  <p className="text-[11px] font-mono text-foreground break-all">{qrCode}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-foreground uppercase tracking-wider font-medium">{t2('Gợi ý', 'Suggestions')}</p>
                  <ul className="text-[11px] text-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-foreground shrink-0 mt-0.5" />
                      {t2('Kiểm tra lại mã QR trên bao bì sản phẩm', 'Double-check the QR code on the product packaging')}
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-foreground shrink-0 mt-0.5" />
                      {t2('Đảm bảo quét mã chính xác, không bị mờ hoặc rách', 'Ensure you scan the correct code without blur or damage')}
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-foreground shrink-0 mt-0.5" />
                      {t2('Liên hệ nhà sản xuất nếu vấn đề vẫn tiếp tục', 'Contact the manufacturer if the problem persists')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ─── Error State ─── */}
          {pageState === 'error' && (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 overflow-hidden" style={{ animation: 'verifyFadeUp 0.5s ease-out both' }}>
              <div className="bg-gradient-to-r from-stone-500 to-stone-600 px-6 py-5 flex flex-col items-center text-center">
                <div style={{ animation: 'verifyScaleIn 0.4s ease-out 0.2s both' }}>
                  <AlertTriangle className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-xl font-bold text-white mt-2">{t2('Lỗi Hệ thống', 'System Error')}</h1>
                <p className="text-stone-200 text-xs mt-1">{t2('Không thể xác minh lúc này', 'Unable to verify at this time')}</p>
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
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] text-foreground uppercase tracking-wider font-medium mb-1">{t2('Chi tiết lỗi', 'Error Details')}</p>
                    <p className="text-[11px] font-mono text-red-600 break-all">{errorMsg}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <p className="text-amber-200/40 text-[10px]">
            &copy; {new Date().getFullYear()} Terra Brew — {t2('Nền tảng Truy xuất Nguồn gốc Cà phê', 'Coffee Traceability Platform')}
          </p>
        </div>
      </footer>

      {/* CSS Keyframes */}
    </div>
  )
}

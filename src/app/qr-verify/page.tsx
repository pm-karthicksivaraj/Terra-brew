'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, QrCode, Search, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Download, Shield, Scan, Eye, Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface VerificationResult {
  status: 'valid' | 'invalid' | 'not_found'
  message: string
  qrCode: string
  entityType?: string
  entityId?: string
  entityDetails?: Record<string, unknown> | null
  signatureValid?: boolean
  hmacSignature?: string
  scanCount?: number
  lastScannedAt?: string | null
  createdAt?: string
}

interface QRGenerateResult {
  qrCode: string
  hmacSignature: string
  payload: string
  createdAt: string
  message: string
}

interface EntityOption {
  id: string
  label: string
}

const ENTITY_TYPES = [
  { value: 'Farmer', labelVi: 'Nông dân', labelEn: 'Farmer' },
  { value: 'FarmLand', labelVi: 'Đất nông trại', labelEn: 'Farm Land' },
  { value: 'Cultivation', labelVi: 'Canh tác', labelEn: 'Cultivation' },
  { value: 'HarvestTraceability', labelVi: 'Thu hoạch', labelEn: 'Harvest Batch' },
  { value: 'ProcurementRecord', labelVi: 'Thu mua', labelEn: 'Procurement' },
  { value: 'ProcessingJobOrder', labelVi: 'Chế biến', labelEn: 'Processing' },
]

export default function QRVerifyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Verify state
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null)

  // Generate state
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([])
  const [entityOptionsLoading, setEntityOptionsLoading] = useState(false)
  const [generatedQR, setGeneratedQR] = useState<QRGenerateResult | null>(null)
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(null)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  // Fetch entity options when entityType changes
  useEffect(() => {
    if (!entityType || !session?.user) return
    setEntityOptionsLoading(true)
    setEntityId('')

    const apiMap: Record<string, string> = {
      Farmer: '/api/farmers',
      FarmLand: '/api/farmlands',
      Cultivation: '/api/cultivations',
      HarvestTraceability: '/api/harvest-traceabilities',
      ProcurementRecord: '/api/procurement',
      ProcessingJobOrder: '/api/processing',
    }

    const apiUrl = apiMap[entityType]
    if (!apiUrl) {
      setEntityOptionsLoading(false)
      return
    }

    fetch(`${apiUrl}?pageSize=100`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // API returns: { success: true, data: { data: [...items], total, ... } }
          const items = data.data?.data || data.data?.farmers || data.data?.farmLands || data.data?.cultivations ||
            data.data?.harvestTraceabilities || data.data?.procurementRecords || data.data?.processingJobOrders || []
          const labelKey: Record<string, string> = {
            Farmer: 'fullName',
            FarmLand: 'farmName',
            Cultivation: 'farmPlotName',
            HarvestTraceability: 'batchId',
            ProcurementRecord: 'procurementId',
            ProcessingJobOrder: 'jobOrderId',
          }
          const key = labelKey[entityType] || 'id'
          const options = (Array.isArray(items) ? items : []).map((item: Record<string, unknown>) => ({
            id: item.id as string,
            label: (item[key] as string) || (item.id as string).substring(0, 8),
          }))
          setEntityOptions(options)
        }
      })
      .catch(() => setEntityOptions([]))
      .finally(() => setEntityOptionsLoading(false))
  }, [entityType, session?.user])

  const handleVerify = useCallback(async () => {
    if (!qrCodeInput.trim()) {
      toast.error(t('Vui lòng nhập mã QR', 'Please enter a QR code'))
      return
    }
    setLoading(true)
    setVerifyResult(null)
    try {
      const res = await fetch(`/api/qr-verify?qrCode=${encodeURIComponent(qrCodeInput.trim())}`)
      const data = await res.json()
      if (data.success) {
        setVerifyResult(data.data)
      } else {
        setVerifyResult({
          status: 'not_found',
          message: data.error || t('Không thể xác minh', 'Unable to verify'),
          qrCode: qrCodeInput.trim(),
          entityDetails: null,
          signatureValid: false,
          scanCount: 0,
        })
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [qrCodeInput, t])

  const handleGenerate = useCallback(async () => {
    if (!entityType || !entityId) {
      toast.error(t('Vui lòng chọn loại và ID thực thể', 'Please select entity type and ID'))
      return
    }
    setGenerating(true)
    setGeneratedQR(null)
    setQrImageDataUrl(null)
    try {
      const res = await fetch('/api/qr-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId }),
      })
      const data = await res.json()
      if (data.success) {
        setGeneratedQR(data.data)
        toast.success(t('Tạo mã QR thành công!', 'QR code generated!'))

        // Generate QR code image using the qrcode library (client-side)
        const QRCode = (await import('qrcode')).default
        const qrDataUrl = await QRCode.toDataURL(data.data.qrCode, {
          width: 280,
          margin: 2,
          color: { dark: '#3C2415', light: '#FEFCE8' },
        })
        setQrImageDataUrl(qrDataUrl)
      } else {
        toast.error(data.error || t('Lỗi khi tạo mã QR', 'Error generating QR code'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setGenerating(false)
    }
  }, [entityType, entityId, t])

  const handleDownloadQR = useCallback(() => {
    if (!qrImageDataUrl || !generatedQR) return
    const a = document.createElement('a')
    a.href = qrImageDataUrl
    a.download = `qr-${generatedQR.qrCode}.png`
    a.click()
  }, [qrImageDataUrl, generatedQR])

  if (status === 'loading') {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br   flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-foreground" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <QrCode className="w-5 h-5 text-foreground" />
              {t('Xác minh Mã QR', 'QR Code Verification')}
            </h2>
            <p className="text-sm text-foreground">
              {t('Xác minh tính toàn vẹn và tạo mã QR cho các thực thể', 'Verify integrity & generate QR codes for entities')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── Verify Section ─── */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br   flex items-center justify-center">
                  <Scan className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {t('Quét & Xác minh', 'Scan & Verify')}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">
                    {t('Nhập mã QR', 'Enter QR Code')}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                      <Input
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        placeholder={t('Dán hoặc nhập mã QR...', 'Paste or enter QR code...')}
                        className="pl-9 rounded-xl border-border focus:border-border font-mono text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      />
                    </div>
                    <Button
                      onClick={handleVerify}
                      disabled={loading}
                      className="btn-primary-gradient rounded-xl gap-2 shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {t('Xác minh', 'Verify')}
                    </Button>
                  </div>
                </div>

                {/* Verification Result */}
                {verifyResult && (
                    <div key={verifyResult.status}>
                      {verifyResult.status === 'valid' && (
                        <div className="rounded-xl border-2 border-green-200 bg-green-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm font-bold text-green-800">
                              {t('Hợp lệ — Chuỗi toàn vẹn', 'Valid — Chain Intact')}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                                {verifyResult.entityType}
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                                <Shield className="w-3 h-3 mr-1" />
                                {t('Chữ ký hợp lệ', 'Signature Valid')}
                              </Badge>
                            </div>
                            {verifyResult.entityDetails && (
                              <div className="bg-card/60 rounded-lg p-3 space-y-1">
                                {Object.entries(verifyResult.entityDetails).slice(0, 8).map(([key, value]) => {
                                  if (value === null || value === undefined || typeof value === 'object') return null
                                  return (
                                    <div key={key} className="flex justify-between text-[11px]">
                                      <span className="text-foreground">{key}</span>
                                      <span className="text-foreground font-medium truncate ml-2 max-w-[160px]">
                                        {String(value)}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {t(`Lượt quét: ${verifyResult.scanCount || 0}`, `Scans: ${verifyResult.scanCount || 0}`)}
                              </span>
                              {verifyResult.createdAt && (
                                <span>{new Date(verifyResult.createdAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {verifyResult.status === 'invalid' && (
                        <div className="rounded-xl border-2 border-red-200 bg-red-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-sm font-bold text-red-800">
                              {t('Không hợp lệ — Phát hiện giả mạo!', 'Invalid — Tampering Detected!')}
                            </span>
                          </div>
                          <p className="text-xs text-red-700">
                            {verifyResult.message}
                          </p>
                          {verifyResult.hmacSignature && (
                            <div className="bg-card/60 rounded-lg p-2">
                              <div className="flex items-center gap-1 text-[10px] text-foreground mb-1">
                                <Hash className="w-3 h-3" />
                                HMAC Signature
                              </div>
                              <p className="text-[10px] font-mono text-foreground break-all">
                                {verifyResult.hmacSignature}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {verifyResult.status === 'not_found' && (
                        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <span className="text-sm font-bold text-yellow-800">
                              {t('Không tìm thấy', 'Not Found')}
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700">
                            {t('Mã QR không tồn tại trong hệ thống. Vui lòng kiểm tra lại.', 'QR code not found in system. Please double check.')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
</div>
            </Card>
          </div>

          {/* ─── Generate Section ─── */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br   flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {t('Tạo Mã QR', 'Generate QR Code')}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Entity Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">
                    {t('Loại thực thể', 'Entity Type')}
                  </Label>
                  <Select value={entityType} onValueChange={setEntityType}>
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder={t('Chọn loại...', 'Select type...')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((et) => (
                        <SelectItem key={et.value} value={et.value}>
                          {t(et.labelVi, et.labelEn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity ID */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">
                    {t('Chọn thực thể', 'Select Entity')}
                  </Label>
                  {entityOptionsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-foreground py-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t('Đang tải...', 'Loading...')}
                    </div>
                  ) : entityOptions.length > 0 ? (
                    <Select value={entityId} onValueChange={setEntityId}>
                      <SelectTrigger className="rounded-xl border-border">
                        <SelectValue placeholder={t('Chọn...', 'Select...')} />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {entityOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            <span className="font-mono text-xs">{opt.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : entityType ? (
                    <p className="text-xs text-foreground py-2">
                      {t('Không có dữ liệu', 'No data available')}
                    </p>
                  ) : (
                    <p className="text-xs text-foreground py-2">
                      {t('Chọn loại thực thể trước', 'Select entity type first')}
                    </p>
                  )}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !entityType || !entityId}
                  className="w-full btn-primary-gradient rounded-xl gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('Đang tạo...', 'Generating...')}
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      {t('Tạo Mã QR', 'Generate QR Code')}
                    </>
                  )}
                </Button>

                {/* Generated QR Code */}
                {generatedQR && (
                    <div>
                      <div className="rounded-xl border border-border bg-gradient-to-br  to-amber-50/50 p-4 space-y-3">
                        {/* QR Image */}
                        {qrImageDataUrl && (
                          <div className="flex justify-center">
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              <img
                                src={qrImageDataUrl}
                                alt="Generated QR Code"
                                className="w-56 h-56"
                              />
                            </div>
                          </div>
                        )}

                        {/* QR Code Text */}
                        <div className="bg-card/60 rounded-lg p-3 space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-foreground">{t('Mã QR', 'QR Code')}</span>
                            <span className="text-foreground font-mono font-medium text-[10px] break-all text-right max-w-[200px]">
                              {generatedQR.qrCode}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-foreground">HMAC</span>
                            <span className="text-foreground font-mono text-[10px] break-all text-right max-w-[200px]">
                              {generatedQR.hmacSignature.substring(0, 32)}...
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-foreground">{t('Payload', 'Payload')}</span>
                            <span className="text-foreground font-mono text-[10px]">{generatedQR.payload}</span>
                          </div>
                        </div>

                        {/* Download Button */}
                        <Button
                          onClick={handleDownloadQR}
                          variant="outline"
                          className="w-full rounded-xl border-border text-foreground hover:bg-muted gap-2"
                          size="sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t('Tải xuống QR', 'Download QR')}
                        </Button>
                      </div>
                    </div>
                  )}
</div>
            </Card>
          </div>
        </div>

        {/* ─── HMAC Signature Details Card ─── */}
        <div className="mt-6">
          <Card className="rounded-2xl border-0 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br   flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {t('Chi tiết Xác minh HMAC', 'HMAC Verification Details')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-muted/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-foreground" />
                  <span className="text-xs font-bold text-foreground">
                    {t('Thuật toán', 'Algorithm')}
                  </span>
                </div>
                <p className="text-[11px] text-foreground">
                  HMAC-SHA256
                </p>
                <p className="text-[10px] text-foreground">
                  {t('Ký mã QR bằng khóa bí mật để chống giả mạo', 'Signs QR codes with a secret key to prevent tampering')}
                </p>
              </div>
              <div className="rounded-xl bg-muted/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-foreground" />
                  <span className="text-xs font-bold text-foreground">
                    {t('Quy trình xác minh', 'Verification Process')}
                  </span>
                </div>
                <ol className="text-[10px] text-foreground space-y-1 list-decimal list-inside">
                  <li>{t('Quét mã QR', 'Scan QR code')}</li>
                  <li>{t('Truy xuất bản ghi HMAC', 'Retrieve HMAC record')}</li>
                  <li>{t('Tái tính toán chữ ký', 'Recompute signature')}</li>
                  <li>{t('So sánh an toàn thời gian', 'Timing-safe comparison')}</li>
                </ol>
              </div>
              <div className="rounded-xl bg-muted/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-foreground" />
                  <span className="text-xs font-bold text-foreground">
                    {t('Bảo vệ', 'Protection')}
                  </span>
                </div>
                <p className="text-[10px] text-foreground">
                  {t(
                    'Chữ ký HMAC đảm bảo bất kỳ thay đổi nào đối với dữ liệu QR sẽ làm mất hiệu lực chữ ký, phát hiện giả mạo ngay lập tức.',
                    'HMAC signatures ensure any changes to QR data invalidate the signature, detecting tampering immediately.'
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

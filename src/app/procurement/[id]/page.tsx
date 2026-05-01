'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Truck, Loader2, Pencil, Calendar, Scale, Hash,
  CheckCircle, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface ProcurementDetail {
  id: string
  procurementId: string | null
  procurementDate: string | null
  batchId: string | null
  coffeeType: string | null
  coffeeVariety: string | null
  grossWeight: number | null
  tareWeight: number | null
  netWeight: number | null
  moistureContentAtGate: number | null
  adjustedNetWeight: number | null
  cherryRipenessGrade: string | null
  defects: number | null
  purchasePricePerKg: number | null
  totalPurchaseAmount: number | null
  priceBasis: string | null
  certPremiumApplied: number | null
  paymentMethod: string | null
  paymentStatus: string | null
  paymentDate: string | null
  transportId: string | null
  vehicleNumber: string | null
  driverName: string | null
  departureTime: string | null
  arrivalTime: string | null
  destination: string | null
  transportCost: number | null
  transportNotes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  collectionCentre: { id: string; centreName: string; centreId: string | null } | null
}

export default function ProcurementDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<ProcurementDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/procurement?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/procurement')
      }
    } catch {
      toast.error(t2('Loi ket noi', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router, t])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated') fetchItem()
  }, [status, router, fetchItem])

  if (status === 'loading' || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Truck className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Dang tai...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!item) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Khong tim thay du lieu', 'Data not found')}</p>
        </div>
      </DashboardShell>
    )
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string | number | null | undefined; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-2">
      {icon && <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value ?? '-'}</p>
      </div>
    </div>
  )

  const paymentStatusColor = (s: string | null) => {
    switch (s?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-muted text-foreground'
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/procurement')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.procurementId || t2('Thu mua', 'Procurement')}</h1>
              <p className="text-xs text-muted-foreground">{item.farmer.fullName} - {item.batchId || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${paymentStatusColor(item.paymentStatus)} text-[10px] border-0`}>
              {item.paymentStatus || '-'}
            </Badge>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/procurement')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('TL tinh', 'Net Weight'), value: item.netWeight ? `${item.netWeight} kg` : '-', color: 'from-blue-500 to-blue-700' },
            { label: t2('Do am', 'Moisture'), value: item.moistureContentAtGate !== null ? `${item.moistureContentAtGate}%` : '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Gia/kg', 'Price/kg'), value: item.purchasePricePerKg ? `${item.purchasePricePerKg.toLocaleString()}` : '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Tong tien', 'Total'), value: item.totalPurchaseAmount ? `${item.totalPurchaseAmount.toLocaleString()}` : '-', color: 'from-green-500 to-green-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin thu mua', 'Procurement Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ma thu mua', 'Proc. ID')} value={item.procurementId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Ma lo', 'Batch ID')} value={item.batchId} />
              <InfoRow label={t2('Loai CP', 'Coffee Type')} value={item.coffeeType} />
              <InfoRow label={t2('Giong', 'Variety')} value={item.coffeeVariety} />
              <InfoRow label={t2('Ngay', 'Date')} value={item.procurementDate ? new Date(item.procurementDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('TL ca bi (kg)', 'Gross Weight')} value={item.grossWeight} />
              <InfoRow label={t2('TL bi (kg)', 'Tare Weight')} value={item.tareWeight} />
              <InfoRow label={t2('TL tinh (kg)', 'Net Weight')} value={item.netWeight} />
              <InfoRow label={t2('Do am (%)', 'Moisture')} value={item.moistureContentAtGate} />
              <InfoRow label={t2('TL tinh DC (kg)', 'Adjusted Net')} value={item.adjustedNetWeight} />
              <InfoRow label={t2('Hang do chin', 'Ripeness Grade')} value={item.cherryRipenessGrade} />
              <InfoRow label={t2('Loi (%)', 'Defects')} value={item.defects} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer.fullName} />
              <InfoRow label={t2('Tram', 'Centre')} value={item.collectionCentre?.centreName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                {t2('Thanh toan & Van chuyen', 'Payment & Transport')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Gia/kg', 'Price/kg')}</p>
                  <SensitiveField value={item.purchasePricePerKg} />
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Tong tien', 'Total Amount')}</p>
                  <SensitiveField value={item.totalPurchaseAmount} />
                </div>
              </div>
              <InfoRow label={t2('Co so gia', 'Price Basis')} value={item.priceBasis} />
              <InfoRow label={t2('CC them', 'Cert Premium')} value={item.certPremiumApplied} />
              <InfoRow label={t2('PT thanh toan', 'Payment Method')} value={item.paymentMethod} />
              <InfoRow label={t2('TT thanh toan', 'Payment Status')} value={item.paymentStatus} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('So xe', 'Vehicle')} value={item.vehicleNumber} />
              <InfoRow label={t2('Tai xe', 'Driver')} value={item.driverName} />
              <InfoRow label={t2('Diem den', 'Destination')} value={item.destination} />
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Chi phi VC', 'Transport Cost')}</p>
                  <SensitiveField value={item.transportCost} />
                </div>
              </div>
              {item.transportNotes && (
                <><Separator className="my-2 bg-muted" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Ghi chu VC', 'Transport Notes')}</p>
                <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.transportNotes}</p></div></>
              )}
              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div><span className="uppercase">{t2('Ngay tao', 'Created')}</span><p className="font-medium text-xs">{new Date(item.createdAt).toLocaleDateString()}</p></div>
                <div><span className="uppercase">{t2('Cap nhat', 'Updated')}</span><p className="font-medium text-xs">{new Date(item.updatedAt).toLocaleDateString()}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

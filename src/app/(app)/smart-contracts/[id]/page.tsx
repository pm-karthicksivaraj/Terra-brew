'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, FileText, Loader2, Pencil, Calendar, CheckCircle, XCircle,
  Hash, Scale,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface SmartContractDetail {
  id: string
  contractId: string | null
  contractType: string | null
  title: string | null
  description: string | null
  partyA: string | null
  partyB: string | null
  quantityKg: number | null
  pricePerKg: number | null
  totalValue: number | null
  currency: string | null
  deliveryDate: string | null
  deliveryLocation: string | null
  qualityGrade: string | null
  terms: string | null
  status: string | null
  signedByA: boolean
  signedByB: boolean
  signedDateA: string | null
  signedDateB: string | null
  effectiveDate: string | null
  expiryDate: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null } | null
}

export default function SmartContractDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<SmartContractDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/smart-contracts?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/smart-contracts')
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
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <FileText className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Dang tai...', 'Loading...')}</span>
            </div>
          </div>
        </div>
    )
  }

  if (!item) {
    return (
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Khong tim thay du lieu', 'Data not found')}</p>
        </div>
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

  const statusColor = (s: string | null) => {
    switch (s?.toLowerCase()) {
      case 'active': case 'executed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'expired': case 'terminated': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-muted text-foreground'
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/smart-contracts')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.title || item.contractId || t2('Hop dong', 'Contract')}</h1>
              <p className="text-xs text-muted-foreground">{item.partyA || '-'} vs {item.partyB || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusColor(item.status)} text-[10px] border-0`}>
              {item.status || '-'}
            </Badge>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/smart-contracts')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('SL (kg)', 'Qty (kg)'), value: item.quantityKg?.toLocaleString() ?? '-', color: 'from-slate-500 to-slate-700' },
            { label: t2('Gia/kg', 'Price/kg'), value: item.pricePerKg?.toLocaleString() ?? '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Tong GT', 'Total Value'), value: item.totalValue?.toLocaleString() ?? '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Hang', 'Grade'), value: item.qualityGrade || '-', color: 'from-green-500 to-green-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <FileText className="w-4 h-4 text-white" />
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
                <FileText className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin hop dong', 'Contract Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ma HD', 'Contract ID')} value={item.contractId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Loai', 'Type')} value={item.contractType} />
              <InfoRow label={t2('Tieu de', 'Title')} value={item.title} />
              {item.description && <InfoRow label={t2('Mo ta', 'Description')} value={item.description} />}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Ben A', 'Party A')} value={item.partyA} />
              <InfoRow label={t2('Ben B', 'Party B')} value={item.partyB} />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer?.fullName} />
              <Separator className="my-2 bg-muted" />
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Gia/kg', 'Price/kg')}</p>
                  <SensitiveField value={item.pricePerKg} />
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Tong gia tri', 'Total Value')}</p>
                  <SensitiveField value={item.totalValue} />
                </div>
              </div>
              <InfoRow label={t2('Tien te', 'Currency')} value={item.currency} />
              <InfoRow label={t2('Hang', 'Grade')} value={item.qualityGrade} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {t2('Ky ngay & Giao hang', 'Sign & Delivery')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={`${item.signedByA ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'} text-[10px] border-0 gap-1`}>
                  {item.signedByA ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {t2('Ben A ky', 'A Signed')}
                </Badge>
                <Badge className={`${item.signedByB ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'} text-[10px] border-0 gap-1`}>
                  {item.signedByB ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {t2('Ben B ky', 'B Signed')}
                </Badge>
              </div>
              <InfoRow label={t2('Ngay A ky', 'A Signed Date')} value={item.signedDateA ? new Date(item.signedDateA).toLocaleDateString() : null} />
              <InfoRow label={t2('Ngay B ky', 'B Signed Date')} value={item.signedDateB ? new Date(item.signedDateB).toLocaleDateString() : null} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Ngay giao', 'Delivery Date')} value={item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Dia diem', 'Location')} value={item.deliveryLocation} />
              <InfoRow label={t2('Hieu luc', 'Effective')} value={item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString() : null} />
              <InfoRow label={t2('Han HD', 'Expiry')} value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : null} />
              {item.terms && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Dieu khoan', 'Terms')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.terms}</p></div>
                </>
              )}
              {item.notes && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Ghi chu', 'Notes')}</p>
                  <div className="p-3 rounded-lg bg-muted mt-1"><p className="text-sm text-foreground">{item.notes}</p></div>
                </>
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
  )
}

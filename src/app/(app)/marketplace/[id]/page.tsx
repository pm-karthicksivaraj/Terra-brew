'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Store, Loader2, Pencil, Calendar, Hash, Coffee, Scale,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface MarketplaceDetail {
  id: string
  listingId: string | null
  title: string
  description: string | null
  coffeeType: string | null
  coffeeVariety: string | null
  grade: string | null
  quantityKg: number | null
  pricePerKg: number | null
  totalValue: number | null
  currency: string | null
  origin: string | null
  processingMethod: string | null
  cupScore: number | null
  certifications: string | null
  harvestYear: string | null
  availability: string | null
  listingStatus: string | null
  listingDate: string | null
  expiryDate: string | null
  buyerId: string | null
  saleDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null } | null
}

export default function MarketplaceDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<MarketplaceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/marketplace?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setItem(data.data.data)
      } else {
        toast.error(data.error || t2('Khong tim thay', 'Not found'))
        router.push('/marketplace')
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
              <Store className="w-9 h-9 text-primary-foreground animate-pulse" />
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
      case 'active': case 'listed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'sold': case 'completed': return 'bg-blue-100 text-blue-700'
      case 'expired': case 'delisted': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-muted text-foreground'
    }
  }

  const cupScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted text-muted-foreground'
    if (score >= 85) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/marketplace')} className="text-muted-foreground hover:text-foreground gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lai', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{item.title}</h1>
              <p className="text-xs text-muted-foreground">{item.listingId || '-'} - {item.origin || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusColor(item.listingStatus)} text-[10px] border-0`}>
              {item.listingStatus || '-'}
            </Badge>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs" onClick={() => router.push('/marketplace')}>
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chinh sua', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('SL (kg)', 'Qty (kg)'), value: item.quantityKg?.toLocaleString() ?? '-', color: 'from-rose-500 to-rose-700' },
            { label: t2('Gia/kg', 'Price/kg'), value: item.pricePerKg?.toLocaleString() ?? '-', color: 'from-teal-500 to-teal-700' },
            { label: t2('Tong GT', 'Total Value'), value: item.totalValue?.toLocaleString() ?? '-', color: 'from-amber-500 to-amber-700' },
            { label: t2('Cup Score', 'Cup Score'), value: item.cupScore ?? '-', color: 'from-green-500 to-green-700' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <Store className="w-4 h-4 text-white" />
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
                <Store className="w-4 h-4 text-muted-foreground" />
                {t2('Thong tin gio hang', 'Listing Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Ma GD', 'Listing ID')} value={item.listingId} icon={<Hash className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Tieu de', 'Title')} value={item.title} />
              {item.description && <InfoRow label={t2('Mo ta', 'Description')} value={item.description} />}
              <InfoRow label={t2('Loai CP', 'Coffee Type')} value={item.coffeeType} icon={<Coffee className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Giong', 'Variety')} value={item.coffeeVariety} />
              <InfoRow label={t2('Hang', 'Grade')} value={item.grade} />
              <InfoRow label={t2('PP che bien', 'Processing Method')} value={item.processingMethod} />
              <InfoRow label={t2('Nguon goc', 'Origin')} value={item.origin} />
              <InfoRow label={t2('Nam thu hoach', 'Harvest Year')} value={item.harvestYear} />
              {item.certifications && <InfoRow label={t2('Chung nhan', 'Certifications')} value={item.certifications} />}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Nong dan', 'Farmer')} value={item.farmer?.fullName} />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                {t2('Gia & Tinh trang', 'Price & Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('SL (kg)', 'Quantity (kg)')} value={item.quantityKg?.toLocaleString()} icon={<Scale className="w-3.5 h-3.5" />} />
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
              {item.cupScore !== null && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground uppercase">{t2('Cup Score', 'Cup Score')}</p>
                    <Badge className={`${cupScoreColor(item.cupScore)} text-[10px] border-0 font-bold`}>{item.cupScore}/100</Badge>
                  </div>
                </div>
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Tinh trang', 'Status')} value={item.listingStatus} />
              <InfoRow label={t2('Kha dung', 'Availability')} value={item.availability} />
              <InfoRow label={t2('Ngay dang', 'Listing Date')} value={item.listingDate ? new Date(item.listingDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Han', 'Expiry Date')} value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : null} />
              {item.saleDate && <InfoRow label={t2('Ngay ban', 'Sale Date')} value={new Date(item.saleDate).toLocaleDateString()} />}
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

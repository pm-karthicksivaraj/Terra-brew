'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Globe, Search, Plus, Loader2, Eye,
  MapPin, Users, Wheat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

interface OriginCountry {
  id: string
  countryCode: string
  countryName: string
  eudrRiskCategory: string
  deforestationRate: string
  activeFarmers: number
  totalProduction: number
  localContact: string
}

const MOCK_ORIGINS: OriginCountry[] = [
  { id: '1', countryCode: 'VN', countryName: 'Vietnam', eudrRiskCategory: 'standard', deforestationRate: '-0.3%', activeFarmers: 1250, totalProduction: 1800000, localContact: 'Nguyen Van A' },
  { id: '2', countryCode: 'ET', countryName: 'Ethiopia', eudrRiskCategory: 'high', deforestationRate: '-2.8%', activeFarmers: 890, totalProduction: 510000, localContact: 'Abebe Mulugeta' },
  { id: '3', countryCode: 'KE', countryName: 'Kenya', eudrRiskCategory: 'standard', deforestationRate: '-1.1%', activeFarmers: 430, totalProduction: 280000, localContact: 'Kamau Njoroge' },
]

function riskCatBadge(cat: string): string {
  switch (cat) {
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'standard': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default function MultiOriginPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [origins, setOrigins] = useState<OriginCountry[]>(MOCK_ORIGINS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ countryCode: '', countryName: '', eudrRiskCategory: 'standard', localContact: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newOrigin: OriginCountry = {
        id: String(Date.now()),
        countryCode: form.countryCode.toUpperCase(),
        countryName: form.countryName,
        eudrRiskCategory: form.eudrRiskCategory,
        deforestationRate: '0%',
        activeFarmers: 0,
        totalProduction: 0,
        localContact: form.localContact,
      }
      setOrigins([newOrigin, ...origins])
      toast.success(t2('Đã thêm nguồn gốc!', 'Origin added!'))
      setDialogOpen(false)
      setForm({ countryCode: '', countryName: '', eudrRiskCategory: 'standard', localContact: '' })
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              {t('multiOrigin.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('multiOrigin.subtitle')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('multiOrigin.addOrigin')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {t('multiOrigin.addOrigin')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('multiOrigin.countryCode')}</Label>
                    <Input value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} placeholder="VN, ET..." className="rounded-xl border-border" maxLength={2} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('multiOrigin.countryName')}</Label>
                    <Input value={form.countryName} onChange={(e) => setForm({ ...form, countryName: e.target.value })} className="rounded-xl border-border" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('multiOrigin.eudrRiskCategory')}</Label>
                    <Select value={form.eudrRiskCategory} onValueChange={(v) => setForm({ ...form, eudrRiskCategory: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t2('Thấp', 'Low')}</SelectItem>
                        <SelectItem value="standard">{t2('Tiêu chuẩn', 'Standard')}</SelectItem>
                        <SelectItem value="high">{t2('Cao', 'High')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('multiOrigin.localContact')}</Label>
                    <Input value={form.localContact} onChange={(e) => setForm({ ...form, localContact: e.target.value })} className="rounded-xl border-border" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="btn-primary-gradient rounded-xl">
                    {submitting ? (<span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang thêm...', 'Adding...')}</span>) : t2('Thêm', 'Add')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Origin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {origins.map((o) => (
            <Card key={o.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {o.countryCode}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{o.countryName}</CardTitle>
                      <Badge className={`${riskCatBadge(o.eudrRiskCategory)} text-[9px] border-0 mt-1`}>
                        {o.eudrRiskCategory === 'low' ? t2('Rủi ro thấp', 'Low Risk') : o.eudrRiskCategory === 'standard' ? t2('Tiêu chuẩn', 'Standard') : t2('Rủi ro cao', 'High Risk')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(o.activeFarmers)}</p>
                    <p className="text-[9px] text-muted-foreground">{t('multiOrigin.activeFarmers')}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Wheat className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { notation: 'compact' }).format(o.totalProduction)}</p>
                    <p className="text-[9px] text-muted-foreground">{t('multiOrigin.totalProduction')}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground">
                    <span>{t('multiOrigin.deforestationRate')}: </span>
                    <span className={o.deforestationRate.startsWith('-') && parseFloat(o.deforestationRate) < -1 ? 'text-red-500 font-medium' : 'text-foreground'}>
                      {o.deforestationRate}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{o.localContact}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  )
}

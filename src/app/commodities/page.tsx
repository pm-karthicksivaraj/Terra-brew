'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Wheat, Search, Plus, Loader2,
  Coffee, TreePine, Droplets, Sprout,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface Commodity {
  id: string
  commodityType: string
  eudrRegulated: boolean
  eudrRiskCategory: string
  countriesOfOrigin: string[]
  totalFarmers: number
  totalArea: number
  annualProduction: number
  processingMethods: string[]
  qualityGrades: string[]
  requiredCerts: string[]
  hsCodes: string[]
}

const MOCK_COMMODITIES: Commodity[] = [
  { id: '1', commodityType: 'coffee', eudrRegulated: true, eudrRiskCategory: 'standard', countriesOfOrigin: ['VN', 'ET', 'KE'], totalFarmers: 2570, totalArea: 45000, annualProduction: 2590000, processingMethods: ['Washed', 'Natural', 'Honey'], qualityGrades: ['SHG', 'HG', 'LG'], requiredCerts: ['EUDR', 'Organic', 'Fairtrade'], hsCodes: ['0901.11', '0901.12'] },
  { id: '2', commodityType: 'cocoa', eudrRegulated: true, eudrRiskCategory: 'high', countriesOfOrigin: ['GH', 'CI', 'EC'], totalFarmers: 0, totalArea: 0, annualProduction: 0, processingMethods: ['Fermented', 'Sun-dried'], qualityGrades: ['Grade A', 'Grade B'], requiredCerts: ['EUDR', 'UTZ'], hsCodes: ['1801.00'] },
  { id: '3', commodityType: 'palm_oil', eudrRegulated: true, eudrRiskCategory: 'high', countriesOfOrigin: ['ID', 'MY'], totalFarmers: 0, totalArea: 0, annualProduction: 0, processingMethods: ['Refined', 'Crude'], qualityGrades: ['RSPO', 'Conventional'], requiredCerts: ['EUDR', 'RSPO'], hsCodes: ['1511.10'] },
  { id: '4', commodityType: 'soy', eudrRegulated: true, eudrRiskCategory: 'standard', countriesOfOrigin: ['BR', 'AR'], totalFarmers: 0, totalArea: 0, annualProduction: 0, processingMethods: ['Crushed', 'Whole'], qualityGrades: ['Non-GMO', 'Standard'], requiredCerts: ['EUDR', 'ProTerra'], hsCodes: ['1201.90'] },
]

function typeIcon(type: string) {
  switch (type) {
    case 'coffee': return Coffee
    case 'cocoa': return Droplets
    case 'palm_oil': return TreePine
    case 'soy': return Sprout
    case 'rubber': return TreePine
    case 'timber': return TreePine
    default: return Wheat
  }
}

function typeLabel(type: string, t: (key: string) => string, t2: (vi: string, en: string) => string): string {
  switch (type) {
    case 'coffee': return t('commodities.typeCoffee')
    case 'cocoa': return t('commodities.typeCocoa')
    case 'palm_oil': return t('commodities.typePalmOil')
    case 'soy': return t('commodities.typeSoy')
    case 'rubber': return t('commodities.typeRubber')
    case 'timber': return t('commodities.typeTimber')
    default: return type
  }
}

function riskBadge(cat: string): string {
  switch (cat) {
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'standard': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default function CommoditiesPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [commodities, setCommodities] = useState<Commodity[]>(MOCK_COMMODITIES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ commodityType: 'rubber', eudrRiskCategory: 'standard' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newCommodity: Commodity = {
        id: String(Date.now()),
        commodityType: form.commodityType,
        eudrRegulated: true,
        eudrRiskCategory: form.eudrRiskCategory,
        countriesOfOrigin: [],
        totalFarmers: 0,
        totalArea: 0,
        annualProduction: 0,
        processingMethods: [],
        qualityGrades: [],
        requiredCerts: ['EUDR'],
        hsCodes: [],
      }
      setCommodities([newCommodity, ...commodities])
      toast.success(t2('Đã thêm hàng hóa!', 'Commodity added!'))
      setDialogOpen(false)
      setForm({ commodityType: 'rubber', eudrRiskCategory: 'standard' })
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
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Wheat className="w-6 h-6 text-primary" />
              {t('commodities.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('commodities.subtitle')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('commodities.addCommodity')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-primary" />
                  {t('commodities.addCommodity')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('commodities.commodityType')}</Label>
                    <Select value={form.commodityType} onValueChange={(v) => setForm({ ...form, commodityType: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rubber">{t('commodities.typeRubber')}</SelectItem>
                        <SelectItem value="timber">{t('commodities.typeTimber')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('commodities.eudrRiskCategory')}</Label>
                    <Select value={form.eudrRiskCategory} onValueChange={(v) => setForm({ ...form, eudrRiskCategory: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t2('Thấp', 'Low')}</SelectItem>
                        <SelectItem value="standard">{t2('Tiêu chuẩn', 'Standard')}</SelectItem>
                        <SelectItem value="high">{t2('Cao', 'High')}</SelectItem>
                      </SelectContent>
                    </Select>
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

        {/* Commodity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commodities.map((c) => {
            const Icon = typeIcon(c.commodityType)
            return (
              <Card key={c.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">{typeLabel(c.commodityType, t, t2)}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {c.eudrRegulated && (
                            <Badge className="bg-primary/10 text-primary text-[9px] border-0">{t('commodities.eudrCommodity')}</Badge>
                          )}
                          <Badge className={`${riskBadge(c.eudrRiskCategory)} text-[9px] border-0`}>
                            {c.eudrRiskCategory === 'low' ? t2('Thấp', 'Low') : c.eudrRiskCategory === 'standard' ? t2('Tiêu chuẩn', 'Standard') : t2('Cao', 'High')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-bold text-foreground">{new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { notation: 'compact' }).format(c.totalFarmers)}</p>
                      <p className="text-[8px] text-muted-foreground">{t('commodities.totalFarmers')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-bold text-foreground">{c.totalArea > 0 ? new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { notation: 'compact' }).format(c.totalArea) : '—'}</p>
                      <p className="text-[8px] text-muted-foreground">{t('commodities.totalArea')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-bold text-foreground">{c.annualProduction > 0 ? new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { notation: 'compact' }).format(c.annualProduction) : '—'}</p>
                      <p className="text-[8px] text-muted-foreground">{t('commodities.annualProduction')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">{t('commodities.countriesOfOrigin')}</p>
                      <div className="flex flex-wrap gap-1">
                        {c.countriesOfOrigin.length > 0 ? c.countriesOfOrigin.map((co) => (
                          <Badge key={co} variant="outline" className="text-[9px] border-border">{co}</Badge>
                        )) : <span className="text-[10px] text-muted-foreground">—</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">{t('commodities.hsCodes')}</p>
                      <div className="flex flex-wrap gap-1">
                        {c.hsCodes.length > 0 ? c.hsCodes.map((hs) => (
                          <Badge key={hs} variant="outline" className="text-[9px] border-border font-mono">{hs}</Badge>
                        )) : <span className="text-[10px] text-muted-foreground">—</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}

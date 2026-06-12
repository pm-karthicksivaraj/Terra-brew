'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Store, Search, Plus, Loader2, Star,
  Clock, ShieldCheck, FlaskConical, Award,
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

interface Service {
  id: string
  serviceName: string
  category: string
  provider: string
  standard: string
  pricing: string
  turnAround: string
  rating: number
  description: string
}

const MOCK_SERVICES: Service[] = [
  { id: '1', serviceName: 'EUDR Compliance Audit', category: 'audit', provider: 'Bureau Veritas', standard: 'EUDR 2023/1115', pricing: '$2,500', turnAround: '5-7 days', rating: 4.8, description: 'Full EUDR due diligence compliance audit' },
  { id: '2', serviceName: 'Cup Quality Assessment', category: 'lab_testing', provider: 'SCA Lab Vietnam', standard: 'SCA Protocol', pricing: '$350', turnAround: '2-3 days', rating: 4.9, description: 'SCA cup scoring and grading' },
  { id: '3', serviceName: 'Organic Certification', category: 'certification', provider: 'Control Union', standard: 'EU Organic', pricing: '$4,000', turnAround: '30 days', rating: 4.5, description: 'EU organic farming certification' },
  { id: '4', serviceName: 'Supply Chain Consulting', category: 'consulting', provider: 'Terra Advisors', standard: 'ISO 28000', pricing: '$5,000', turnAround: '14 days', rating: 4.3, description: 'Supply chain risk assessment and optimization' },
  { id: '5', serviceName: 'Freight Insurance', category: 'logistics', provider: 'Marsh Insurance', standard: 'Institute Cargo Clauses', pricing: '1.2% value', turnAround: '1 day', rating: 4.6, description: 'Marine cargo insurance for coffee shipments' },
  { id: '6', serviceName: 'Legal Review', category: 'legal', provider: 'Baker McKenzie', standard: 'EU Trade Law', pricing: '$800/hr', turnAround: '3-5 days', rating: 4.7, description: 'EU trade regulation legal consultation' },
]

function categoryIcon(cat: string) {
  switch (cat) {
    case 'audit': return ShieldCheck
    case 'lab_testing': return FlaskConical
    case 'certification': return Award
    default: return Store
  }
}

function catBadge(cat: string): string {
  switch (cat) {
    case 'audit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'lab_testing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    case 'certification': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'consulting': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    case 'logistics': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
    case 'legal': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default function ServicesMarketplacePage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const filtered = services.filter((s) => {
    const matchesSearch = !search || s.serviceName.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase())
    const matchesCat = catFilter === 'all' || s.category === catFilter
    return matchesSearch && matchesCat
  })

  const handleBook = (s: Service) => {
    toast.success(t2(`Đã gửi yêu cầu đặt ${s.serviceName}!`, `Booking requested for ${s.serviceName}!`))
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            {t('servicesMarketplace.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('servicesMarketplace.subtitle')}</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('servicesMarketplace.searchServices')} className="pl-9 rounded-xl border-border bg-background" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[200px] rounded-xl border-border"><SelectValue placeholder={t('servicesMarketplace.category')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t2('Tất cả', 'All Categories')}</SelectItem>
              <SelectItem value="audit">{t('servicesMarketplace.catAudit')}</SelectItem>
              <SelectItem value="lab_testing">{t('servicesMarketplace.catLabTesting')}</SelectItem>
              <SelectItem value="certification">{t('servicesMarketplace.catCertification')}</SelectItem>
              <SelectItem value="consulting">{t('servicesMarketplace.catConsulting')}</SelectItem>
              <SelectItem value="logistics">{t('servicesMarketplace.catLogistics')}</SelectItem>
              <SelectItem value="legal">{t('servicesMarketplace.catLegal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const Icon = categoryIcon(s.category)
            return (
              <Card key={s.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">{s.serviceName}</CardTitle>
                        <CardDescription className="text-[10px]">{s.provider}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground mb-3 flex-1">{s.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge className={`${catBadge(s.category)} text-[9px] border-0`}>
                      {s.category === 'audit' ? t('servicesMarketplace.catAudit') : s.category === 'lab_testing' ? t('servicesMarketplace.catLabTesting') : s.category === 'certification' ? t('servicesMarketplace.catCertification') : s.category === 'consulting' ? t('servicesMarketplace.catConsulting') : s.category === 'logistics' ? t('servicesMarketplace.catLogistics') : t('servicesMarketplace.catLegal')}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] border-border">{s.standard}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground">{s.pricing}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-foreground">{s.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {s.turnAround}
                    </div>
                  </div>
                  <Button className="w-full mt-3 btn-primary-gradient rounded-xl text-xs" onClick={() => handleBook(s)}>
                    {t('servicesMarketplace.bookService')}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
  )
}

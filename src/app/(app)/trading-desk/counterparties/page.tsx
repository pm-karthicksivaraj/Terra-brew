'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  UserCheck, Search, Plus, Loader2, Eye,
  ShieldCheck, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

interface Counterparty {
  id: string
  companyName: string
  businessType: string
  country: string
  verificationStatus: string
  riskRating: string
  kycDocuments: number
  sanctionsCheck: string
  amlCompliance: string
}

const MOCK_COUNTERPARTIES: Counterparty[] = [
  { id: '1', companyName: 'Kaffee GmbH', businessType: 'importer', country: 'DE', verificationStatus: 'verified', riskRating: 'low', kycDocuments: 5, sanctionsCheck: 'clear', amlCompliance: 'compliant' },
  { id: '2', companyName: 'Java Traders BV', businessType: 'distributor', country: 'NL', verificationStatus: 'verified', riskRating: 'low', kycDocuments: 4, sanctionsCheck: 'clear', amlCompliance: 'compliant' },
  { id: '3', companyName: 'Nippon Coffee Co', businessType: 'roaster', country: 'JP', verificationStatus: 'pending', riskRating: 'medium', kycDocuments: 2, sanctionsCheck: 'clear', amlCompliance: 'pending' },
  { id: '4', companyName: 'Pacific Beans Ltd', businessType: 'broker', country: 'SG', verificationStatus: 'pending', riskRating: 'medium', kycDocuments: 1, sanctionsCheck: 'pending', amlCompliance: 'pending' },
  { id: '5', companyName: 'Euro Roasters SA', businessType: 'roaster', country: 'FR', verificationStatus: 'verified', riskRating: 'low', kycDocuments: 6, sanctionsCheck: 'clear', amlCompliance: 'compliant' },
]

function verifBadgeClasses(s: string): string {
  switch (s) {
    case 'verified': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function riskBadgeClasses(s: string): string {
  switch (s) {
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

export default function CounterpartiesPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [counterparties, setCounterparties] = useState<Counterparty[]>(MOCK_COUNTERPARTIES)
  const [search, setSearch] = useState('')
  const [verifFilter, setVerifFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    companyName: '',
    businessType: 'importer',
    country: '',
  })

  const filtered = counterparties.filter((c) => {
    const matchesSearch = !search || c.companyName.toLowerCase().includes(search.toLowerCase())
    const matchesVerif = verifFilter === 'all' || c.verificationStatus === verifFilter
    return matchesSearch && matchesVerif
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newCP: Counterparty = {
        id: String(Date.now()),
        companyName: form.companyName,
        businessType: form.businessType,
        country: form.country,
        verificationStatus: 'pending',
        riskRating: 'medium',
        kycDocuments: 0,
        sanctionsCheck: 'pending',
        amlCompliance: 'pending',
      }
      setCounterparties([newCP, ...counterparties])
      toast.success(t2('Đã thêm đối tác!', 'Counterparty added!'))
      setDialogOpen(false)
      setForm({ companyName: '', businessType: 'importer', country: '' })
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
              <UserCheck className="w-6 h-6 text-primary" />
              {t('tradingDesk.counterparties')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('tradingDesk.counterpartyVerification')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t2('Thêm đối tác', 'Add Counterparty')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  {t2('Thêm đối tác mới', 'New Counterparty')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t('tradingDesk.companyName')}</Label>
                  <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="rounded-xl border-border" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('tradingDesk.businessType')}</Label>
                    <Select value={form.businessType} onValueChange={(v) => setForm({ ...form, businessType: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="importer">{t2('Nhà nhập khẩu', 'Importer')}</SelectItem>
                        <SelectItem value="distributor">{t2('Nhà phân phối', 'Distributor')}</SelectItem>
                        <SelectItem value="roaster">{t2('Rang xay', 'Roaster')}</SelectItem>
                        <SelectItem value="broker">{t2('Môi giới', 'Broker')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Quốc gia', 'Country')}</Label>
                    <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="DE, NL, JP..." className="rounded-xl border-border" />
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('tradingDesk.searchCounterparties')} className="pl-9 rounded-xl border-border bg-background" />
          </div>
          <Select value={verifFilter} onValueChange={setVerifFilter}>
            <SelectTrigger className="w-[180px] rounded-xl border-border"><SelectValue placeholder={t('tradingDesk.verificationStatus')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t2('Tất cả', 'All')}</SelectItem>
              <SelectItem value="verified">{t2('Đã xác minh', 'Verified')}</SelectItem>
              <SelectItem value="pending">{t2('Chờ xác minh', 'Pending')}</SelectItem>
              <SelectItem value="failed">{t2('Lỗi', 'Failed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('tradingDesk.companyName')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('tradingDesk.businessType')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('tradingDesk.verificationStatus')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('tradingDesk.riskRating')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('tradingDesk.kycDocuments')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('tradingDesk.sanctionsCheck')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UserCheck className="w-10 h-10 opacity-30" />
                        <p className="text-sm">{t2('Chưa có đối tác', 'No counterparties yet')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((cp) => (
                    <tr key={cp.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{cp.companyName}</p>
                        <p className="text-[10px] text-muted-foreground">{cp.country}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground capitalize hidden md:table-cell">{cp.businessType}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${verifBadgeClasses(cp.verificationStatus)} text-[10px] border-0`}>
                          {cp.verificationStatus === 'verified' ? t2('Đã xác minh', 'Verified') : cp.verificationStatus === 'pending' ? t2('Chờ xác minh', 'Pending') : t2('Lỗi', 'Failed')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge className={`${riskBadgeClasses(cp.riskRating)} text-[10px] border-0`}>
                          {cp.riskRating === 'low' ? t2('Thấp', 'Low') : cp.riskRating === 'medium' ? t2('TB', 'Medium') : t2('Cao', 'High')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground hidden lg:table-cell">{cp.kycDocuments}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge className={`${cp.sanctionsCheck === 'clear' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'} text-[10px] border-0`}>
                          {cp.sanctionsCheck === 'clear' ? t2('Sạch', 'Clear') : t2('Chờ kiểm tra', 'Pending')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
  )
}

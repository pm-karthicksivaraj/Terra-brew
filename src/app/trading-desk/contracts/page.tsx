'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  FileText, Search, Plus, Loader2, Eye,
  DollarSign, Package,
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
import { DashboardShell } from '@/components/layout/dashboard-shell'

// ─── Types ────────────────────────────────────────────────────────

interface Contract {
  id: string
  contractNumber: string
  buyer: string
  commodity: string
  quantityKg: number
  pricePerKg: number
  totalValue: number
  incoterms: string
  status: string
  createdAt: string
}

// ─── Badge helpers ────────────────────────────────────────────────

function statusBadgeClasses(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    case 'expired': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

// ─── Mock data ────────────────────────────────────────────────────

const MOCK_CONTRACTS: Contract[] = [
  { id: '1', contractNumber: 'TC-2024-001', buyer: 'Kaffee GmbH', commodity: 'Coffee Arabica', quantityKg: 20000, pricePerKg: 4.50, totalValue: 90000, incoterms: 'FOB', status: 'active', createdAt: '2024-11-15' },
  { id: '2', contractNumber: 'TC-2024-002', buyer: 'Java Traders BV', commodity: 'Coffee Robusta', quantityKg: 15000, pricePerKg: 3.20, totalValue: 48000, incoterms: 'CIF', status: 'active', createdAt: '2024-11-20' },
  { id: '3', contractNumber: 'TC-2024-003', buyer: 'Nippon Coffee Co', commodity: 'Coffee Arabica', quantityKg: 10000, pricePerKg: 5.10, totalValue: 51000, incoterms: 'FOB', status: 'draft', createdAt: '2024-12-01' },
  { id: '4', contractNumber: 'TC-2024-004', buyer: 'Euro Roasters SA', commodity: 'Coffee Arabica', quantityKg: 25000, pricePerKg: 4.80, totalValue: 120000, incoterms: 'CIF', status: 'completed', createdAt: '2024-09-10' },
  { id: '5', contractNumber: 'TC-2024-005', buyer: 'Pacific Beans Ltd', commodity: 'Coffee Robusta', quantityKg: 8000, pricePerKg: 3.00, totalValue: 24000, incoterms: 'FOB', status: 'cancelled', createdAt: '2024-10-05' },
]

// ─── Main Component ───────────────────────────────────────────────

export default function ContractsPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    buyer: '',
    commodity: 'coffee_arabica',
    quantityKg: '',
    pricePerKg: '',
    incoterms: 'FOB',
    paymentTerms: 'LC',
  })

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = !search || c.contractNumber.toLowerCase().includes(search.toLowerCase()) || c.buyer.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      draft: t('tradingDesk.statusDraft'),
      active: t('tradingDesk.statusActive'),
      completed: t('tradingDesk.statusCompleted'),
      cancelled: t('tradingDesk.statusCancelled'),
      expired: t('tradingDesk.statusExpired'),
    }
    return map[s] || s
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newContract: Contract = {
        id: String(Date.now()),
        contractNumber: `TC-2024-${String(contracts.length + 1).padStart(3, '0')}`,
        buyer: form.buyer,
        commodity: form.commodity === 'coffee_arabica' ? 'Coffee Arabica' : 'Coffee Robusta',
        quantityKg: parseFloat(form.quantityKg) || 0,
        pricePerKg: parseFloat(form.pricePerKg) || 0,
        totalValue: (parseFloat(form.quantityKg) || 0) * (parseFloat(form.pricePerKg) || 0),
        incoterms: form.incoterms,
        status: 'draft',
        createdAt: new Date().toISOString(),
      }
      setContracts([newContract, ...contracts])
      toast.success(t2('Đã tạo hợp đồng thành công!', 'Contract created successfully!'))
      setDialogOpen(false)
      setForm({ buyer: '', commodity: 'coffee_arabica', quantityKg: '', pricePerKg: '', incoterms: 'FOB', paymentTerms: 'LC' })
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
              <FileText className="w-6 h-6 text-primary" />
              {t('tradingDesk.contracts')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t2('Danh sách hợp đồng thương mại', 'Trading contracts list')}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('tradingDesk.createContract')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t('tradingDesk.createContract')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('tradingDesk.buyer')}</Label>
                    <Input value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} placeholder={t2('Tên người mua', 'Buyer name')} className="rounded-xl border-border" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('tradingDesk.commodity')}</Label>
                    <Select value={form.commodity} onValueChange={(v) => setForm({ ...form, commodity: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coffee_arabica">{t2('Cà phê Arabica', 'Coffee Arabica')}</SelectItem>
                        <SelectItem value="coffee_robusta">{t2('Cà phê Robusta', 'Coffee Robusta')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('tradingDesk.incoterms')}</Label>
                    <Select value={form.incoterms} onValueChange={(v) => setForm({ ...form, incoterms: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOB">FOB</SelectItem>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="DDP">DDP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('tradingDesk.quantityKg')}</Label>
                    <Input type="number" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} className="rounded-xl border-border" min="0" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('tradingDesk.pricePerKg')}</Label>
                    <Input type="number" step="0.01" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} className="rounded-xl border-border" min="0" required />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="btn-primary-gradient rounded-xl">
                    {submitting ? (<span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang tạo...', 'Creating...')}</span>) : t2('Tạo hợp đồng', 'Create Contract')}
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
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('tradingDesk.searchContracts')} className="pl-9 rounded-xl border-border bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl border-border"><SelectValue placeholder={t2('Lọc trạng thái', 'Filter status')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t2('Tất cả', 'All Status')}</SelectItem>
              <SelectItem value="draft">{t('tradingDesk.statusDraft')}</SelectItem>
              <SelectItem value="active">{t('tradingDesk.statusActive')}</SelectItem>
              <SelectItem value="completed">{t('tradingDesk.statusCompleted')}</SelectItem>
              <SelectItem value="cancelled">{t('tradingDesk.statusCancelled')}</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            {t2(`${filteredContracts.length} hợp đồng`, `${filteredContracts.length} contracts`)}
          </Badge>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('tradingDesk.contractNumber')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('tradingDesk.buyer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('tradingDesk.commodity')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('tradingDesk.quantityKg')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('tradingDesk.pricePerKg')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('tradingDesk.totalValue')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('tradingDesk.status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="w-10 h-10 opacity-30" />
                        <p className="text-sm">{t2('Chưa có hợp đồng', 'No contracts yet')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">{contract.contractNumber}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{contract.buyer}</td>
                      <td className="px-4 py-3 text-xs text-foreground hidden md:table-cell">{contract.commodity}</td>
                      <td className="px-4 py-3 text-xs text-foreground hidden md:table-cell">{new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(contract.quantityKg)}</td>
                      <td className="px-4 py-3 text-xs text-foreground hidden lg:table-cell">${contract.pricePerKg.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground hidden lg:table-cell">${new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(contract.totalValue)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${statusBadgeClasses(contract.status)} text-[10px] border-0`}>{statusLabel(contract.status)}</Badge>
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
    </DashboardShell>
  )
}

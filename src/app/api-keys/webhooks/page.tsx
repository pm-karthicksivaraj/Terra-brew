'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Link2, Search, Plus, Loader2, Trash2,
  CheckCircle2, XCircle, Clock,
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

interface Webhook {
  id: string
  url: string
  events: string[]
  status: string
  deliverySuccessRate: number
  totalDeliveries: number
  lastDelivery: string | null
  createdAt: string
}

const MOCK_WEBHOOKS: Webhook[] = [
  { id: '1', url: 'https://api.example.com/webhooks/eudr', events: ['eudr.approved', 'eudr.rejected'], status: 'active', deliverySuccessRate: 99.2, totalDeliveries: 1250, lastDelivery: '2024-12-10T09:15:00Z', createdAt: '2024-06-01' },
  { id: '2', url: 'https://erp.example.com/hooks/shipment', events: ['shipment.delivered', 'shipment.delayed'], status: 'active', deliverySuccessRate: 97.8, totalDeliveries: 840, lastDelivery: '2024-12-09T16:30:00Z', createdAt: '2024-08-20' },
  { id: '3', url: 'https://legacy.example.com/hook', events: ['order.created'], status: 'disabled', deliverySuccessRate: 45.0, totalDeliveries: 120, lastDelivery: '2024-09-15T12:00:00Z', createdAt: '2024-03-10' },
]

export default function WebhooksPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ url: '', events: 'eudr.approved' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newWebhook: Webhook = {
        id: String(Date.now()),
        url: form.url,
        events: form.events.split(','),
        status: 'active',
        deliverySuccessRate: 0,
        totalDeliveries: 0,
        lastDelivery: null,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setWebhooks([newWebhook, ...webhooks])
      toast.success(t2('Đã tạo webhook!', 'Webhook created!'))
      setDialogOpen(false)
      setForm({ url: '', events: 'eudr.approved' })
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
              <Link2 className="w-6 h-6 text-primary" />
              {t('apiAccess.webhooks')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t2('Quản lý webhook cho tích hợp', 'Manage webhooks for integrations')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('apiAccess.createWebhook')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  {t('apiAccess.createWebhook')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t('apiAccess.webhookUrl')}</Label>
                  <Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="rounded-xl border-border" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t('apiAccess.events')}</Label>
                  <Select value={form.events} onValueChange={(v) => setForm({ ...form, events: v })}>
                    <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eudr.approved">eudr.approved</SelectItem>
                      <SelectItem value="eudr.rejected">eudr.rejected</SelectItem>
                      <SelectItem value="shipment.delivered">shipment.delivered</SelectItem>
                      <SelectItem value="shipment.delayed">shipment.delayed</SelectItem>
                      <SelectItem value="order.created">order.created</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="btn-primary-gradient rounded-xl">
                    {submitting ? (<span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang tạo...', 'Creating...')}</span>) : t('apiAccess.createWebhook')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('apiAccess.webhookUrl')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('apiAccess.events')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('apiAccess.deliveryStats')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('apiAccess.lastUsed')}</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((w) => (
                  <tr key={w.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-foreground max-w-[250px] truncate">{w.url}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((ev) => (
                          <Badge key={ev} variant="outline" className="text-[9px] border-border">{ev}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${w.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} text-[10px] border-0`}>
                        {w.status === 'active' ? t2('Hoạt động', 'Active') : t2('Tắt', 'Disabled')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {w.deliverySuccessRate >= 95 ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : w.deliverySuccessRate >= 80 ? <Clock className="w-3.5 h-3.5 text-yellow-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                        <span className="text-xs text-foreground">{w.deliverySuccessRate}%</span>
                        <span className="text-[10px] text-muted-foreground">({new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(w.totalDeliveries)})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground hidden lg:table-cell">
                      {w.lastDelivery ? new Date(w.lastDelivery).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}

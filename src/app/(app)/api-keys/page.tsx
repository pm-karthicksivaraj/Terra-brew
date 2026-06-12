'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Key, Search, Plus, Loader2, Eye, Copy,
  Trash2, Activity, AlertTriangle,
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

interface ApiKey {
  id: string
  keyName: string
  keyPrefix: string
  scopes: string[]
  rateLimit: string
  lastUsed: string | null
  totalRequests: number
  status: string
  createdAt: string
  expiresAt: string | null
}

const MOCK_KEYS: ApiKey[] = [
  { id: '1', keyName: 'Production API', keyPrefix: 'tb_live_', scopes: ['read', 'write'], rateLimit: '1000/min', lastUsed: '2024-12-10T08:30:00Z', totalRequests: 45230, status: 'active', createdAt: '2024-06-01', expiresAt: '2025-06-01' },
  { id: '2', keyName: 'Staging API', keyPrefix: 'tb_test_', scopes: ['read'], rateLimit: '500/min', lastUsed: '2024-12-09T14:20:00Z', totalRequests: 12850, status: 'active', createdAt: '2024-08-15', expiresAt: '2025-08-15' },
  { id: '3', keyName: 'Old Integration', keyPrefix: 'tb_live_', scopes: ['read', 'write', 'admin'], rateLimit: '100/min', lastUsed: '2024-09-01T12:00:00Z', totalRequests: 3420, status: 'revoked', createdAt: '2024-01-10', expiresAt: null },
]

export default function ApiKeysPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [form, setForm] = useState({ keyName: '', scopes: 'read', rateLimit: '1000' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const generatedKey = `tb_${form.scopes === 'read' ? 'test' : 'live'}_${Math.random().toString(36).slice(2, 10)}...`
      const newKey: ApiKey = {
        id: String(Date.now()),
        keyName: form.keyName,
        keyPrefix: generatedKey.slice(0, 10),
        scopes: form.scopes.split(','),
        rateLimit: `${form.rateLimit}/min`,
        lastUsed: null,
        totalRequests: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
      setKeys([newKey, ...keys])
      setNewKeyValue(generatedKey)
      toast.success(t('apiAccess.apiKeyCreated'))
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = (id: string) => {
    setKeys(keys.map((k) => k.id === id ? { ...k, status: 'revoked' } : k))
    toast.success(t('apiAccess.apiKeyRevoked'))
  }

  const handleCopyKey = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue)
      toast.success(t2('Đã sao chép!', 'Copied!'))
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
              <Key className="w-6 h-6 text-primary" />
              {t('apiAccess.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('apiAccess.subtitle')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setNewKeyValue(null) }}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('apiAccess.createKey')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  {t('apiAccess.createKey')}
                </DialogTitle>
              </DialogHeader>
              {newKeyValue ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{t('apiAccess.warningKeyVisible')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded-lg text-xs font-mono break-all">{newKeyValue}</code>
                      <Button variant="outline" size="sm" className="shrink-0 rounded-xl" onClick={handleCopyKey}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full btn-primary-gradient rounded-xl" onClick={() => { setDialogOpen(false); setNewKeyValue(null) }}>{t2('Đã hiểu', 'Got it')}</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('apiAccess.keyName')}</Label>
                    <Input value={form.keyName} onChange={(e) => setForm({ ...form, keyName: e.target.value })} className="rounded-xl border-border" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('apiAccess.scopes')}</Label>
                      <Select value={form.scopes} onValueChange={(v) => setForm({ ...form, scopes: v })}>
                        <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">{t2('Chỉ đọc', 'Read Only')}</SelectItem>
                          <SelectItem value="read,write">{t2('Đọc & Ghi', 'Read & Write')}</SelectItem>
                          <SelectItem value="read,write,admin">{t2('Đầy đủ', 'Full Access')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('apiAccess.rateLimit')}</Label>
                      <Select value={form.rateLimit} onValueChange={(v) => setForm({ ...form, rateLimit: v })}>
                        <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100/min</SelectItem>
                          <SelectItem value="500">500/min</SelectItem>
                          <SelectItem value="1000">1000/min</SelectItem>
                          <SelectItem value="5000">5000/min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
                    <Button type="submit" disabled={submitting} className="btn-primary-gradient rounded-xl">
                      {submitting ? (<span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang tạo...', 'Creating...')}</span>) : t('apiAccess.createKey')}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t2('Khóa hoạt động', 'Active Keys')}</p>
                  <p className="text-2xl font-bold text-foreground">{keys.filter((k) => k.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('apiAccess.totalRequests')}</p>
                  <p className="text-2xl font-bold text-foreground">{new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { notation: 'compact' }).format(keys.reduce((s, k) => s + k.totalRequests, 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('apiAccess.keyName')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('apiAccess.keyPrefix')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('apiAccess.scopes')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('apiAccess.totalRequests')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('apiAccess.lastUsed')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{k.keyName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{k.keyPrefix}••••</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <Badge key={s} variant="outline" className="text-[9px] border-border capitalize">{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground hidden lg:table-cell">{new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(k.totalRequests)}</td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground hidden lg:table-cell">
                      {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${k.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'} text-[10px] border-0`}>
                        {k.status === 'active' ? t2('Hoạt động', 'Active') : t2('Đã thu hồi', 'Revoked')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {k.status === 'active' && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleRevoke(k.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {t('apiAccess.revokeKey')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
  )
}

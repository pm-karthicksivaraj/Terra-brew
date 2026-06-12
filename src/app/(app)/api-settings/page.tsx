'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Key, Webhook, Plus, Trash2, Copy, AlertTriangle, Loader2, Shield, Clock, CheckCircle2 } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  tier: string
  rateLimitPerMin: number
  lastUsedAt?: string
  createdAt: string
  permissions?: string[]
  isActive?: boolean
}

interface Webhook {
  id: string
  url: string
  events: string[]
  lastTriggeredAt?: string
  failureCount: number
  isActive?: boolean
  createdAt: string
}

const WEBHOOK_EVENTS = [
  'compliance.created', 'compliance.updated', 'shipment.status_changed',
  'contract.created', 'contract.activated', 'iot.alert',
  'deforestation.detected', 'qc.verification.completed',
]

const PERMISSION_OPTIONS = [
  'read:compliance', 'write:compliance', 'read:shipments', 'write:shipments',
  'read:contracts', 'write:contracts', 'read:buyers', 'read:analytics',
]

export default function ApiSettingsPage() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [keyDialogOpen, setKeyDialogOpen] = useState(false)
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState<any>({ name: '', tier: 'starter', permissions: [] })
  const [newWebhook, setNewWebhook] = useState<any>({ url: '', events: [], secret: '' })
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [keysRes, webhooksRes] = await Promise.all([
        fetch('/api/api-keys'),
        fetch('/api/webhooks'),
      ])
      const keysData = await keysRes.json()
      const webhooksData = await webhooksRes.json()
      if (keysData.success) setApiKeys(keysData.data || [])
      if (webhooksData.success) setWebhooks(webhooksData.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateKey() {
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      })
      const data = await res.json()
      if (data.success && data.data?.key) {
        setCreatedKey(data.data.key)
        setKeyDialogOpen(false)
        setNewKey({ name: '', tier: 'starter', permissions: [] })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  async function handleRevokeKey(id: string) {
    if (!confirm('Are you sure you want to revoke this API key?')) return
    try {
      await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) { console.error(e) }
  }

  async function handleCreateWebhook() {
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      })
      if (res.ok) {
        setWebhookDialogOpen(false)
        setNewWebhook({ url: '', events: [], secret: '' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  async function handleDeleteWebhook(id: string) {
    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) { console.error(e) }
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => { setCopied(false); setCreatedKey(null) }, 2000)
  }

  const stats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.isActive !== false).length,
    totalWebhooks: webhooks.length,
    failedWebhooks: webhooks.filter(w => w.failureCount > 0).length,
  }

  return (
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" /> API & Webhook Settings
            </h1>
            <p className="text-sm text-muted-foreground">Manage API keys and webhook endpoints</p>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Keys', value: stats.totalKeys, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Active Keys', value: stats.activeKeys, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Webhooks', value: stats.totalWebhooks, bg: 'bg-blue-100', color: 'text-blue-600' },
            { label: 'Failed Hooks', value: stats.failedWebhooks, bg: 'bg-red-100', color: 'text-red-600' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Created Key Alert */}
        {createdKey && (
          <FadeIn>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">API Key Created Successfully</p>
                    <p className="text-sm text-green-800 mt-1">Copy this key now — it won&apos;t be shown again:</p>
                    <code className="block mt-2 p-2 bg-white rounded text-xs break-all border">{createdKey}</code>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleCopyKey(createdKey)}>
                        {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied!' : 'Copy Key'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCreatedKey(null)}>Dismiss</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* API Keys Section */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2"><Key className="w-5 h-5" /><CardTitle>API Keys</CardTitle></div>
              <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-3 h-3" /> Generate Key</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Generate API Key</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name *</label>
                      <Input placeholder="My API Key" value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tier</label>
                      <Select value={newKey.tier} onValueChange={v => setNewKey({ ...newKey, tier: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter (60/min)</SelectItem>
                          <SelectItem value="professional">Professional (300/min)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000/min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PERMISSION_OPTIONS.map(perm => (
                          <label key={perm} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newKey.permissions.includes(perm)} onChange={e => {
                              const perms = e.target.checked ? [...newKey.permissions, perm] : newKey.permissions.filter((p: string) => p !== perm)
                              setNewKey({ ...newKey, permissions: perms })
                            }} />
                            <span className="text-xs font-mono">{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleCreateKey} className="w-full">Generate API Key</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                  ) : apiKeys.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No API keys. Generate your first key!</TableCell></TableRow>
                  ) : apiKeys.map((key) => (
                    <TableRow key={key.id} className="group">
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{key.keyPrefix}...</code></TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{key.tier}</Badge></TableCell>
                      <TableCell>{key.rateLimitPerMin}/min</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(key.permissions || []).map((p: string) => <Badge key={p} variant="outline" className="text-[9px] font-mono">{p}</Badge>)}
                          {(!key.permissions || key.permissions.length === 0) && <span className="text-xs text-muted-foreground">All</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRevokeKey(key.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Webhooks Section */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2"><Webhook className="w-5 h-5" /><CardTitle>Webhook Endpoints</CardTitle></div>
              <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-3 h-3" /> Register Webhook</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Register Webhook</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL *</label>
                      <Input placeholder="https://your-app.com/webhooks" value={newWebhook.url} onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Secret (optional)</label>
                      <Input placeholder="Webhook signing secret" value={newWebhook.secret || ''} onChange={e => setNewWebhook({ ...newWebhook, secret: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Events</label>
                      <div className="grid grid-cols-2 gap-2">
                        {WEBHOOK_EVENTS.map(event => (
                          <label key={event} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newWebhook.events.includes(event)} onChange={e => {
                              const events = e.target.checked ? [...newWebhook.events, event] : newWebhook.events.filter((ev: string) => ev !== event)
                              setNewWebhook({ ...newWebhook, events })
                            }} />
                            <span className="text-xs font-mono">{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleCreateWebhook} className="w-full">Register Webhook</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead>Failures</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                  ) : webhooks.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No webhooks registered</TableCell></TableRow>
                  ) : webhooks.map((wh) => (
                    <TableRow key={wh.id} className="group">
                      <TableCell className="font-mono text-xs max-w-[250px] truncate">{wh.url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(wh.events || []).map((e: string) => <Badge key={e} variant="outline" className="text-[9px] font-mono">{e}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{wh.lastTriggeredAt ? new Date(wh.lastTriggeredAt).toLocaleString() : 'Never'}</TableCell>
                      <TableCell>{wh.failureCount > 0 ? <Badge className="bg-red-100 text-red-800">{wh.failureCount}</Badge> : <span className="text-green-600 text-xs">0</span>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(wh.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteWebhook(wh.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
  )
}

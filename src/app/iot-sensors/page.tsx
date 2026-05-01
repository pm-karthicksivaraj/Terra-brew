'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Thermometer, Plus, Search, Battery, Loader2, AlertTriangle, Wifi, WifiOff, Activity, Eye } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SENSOR_TYPE_LABELS: Record<string, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  gps: 'GPS Tracker',
  shock: 'Shock Sensor',
  light: 'Light Sensor',
  co2: 'CO2 Sensor',
}

const SENSOR_TYPE_ICONS: Record<string, string> = {
  temperature: '🌡️',
  humidity: '💧',
  gps: '📍',
  shock: '⚡',
  light: '☀️',
  co2: '🫧',
}

const SENSOR_TYPE_COLORS: Record<string, string> = {
  temperature: 'bg-red-100 text-red-800 border-red-200',
  humidity: 'bg-blue-100 text-blue-800 border-blue-200',
  gps: 'bg-green-100 text-green-800 border-green-200',
  shock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  light: 'bg-amber-100 text-amber-800 border-amber-200',
  co2: 'bg-teal-100 text-teal-800 border-teal-200',
}

interface IoTSensor {
  id: string
  deviceId: string
  deviceName?: string
  sensorType: string
  manufacturer?: string
  lastReading?: string
  lastReadingAt?: string
  batteryLevel?: number
  isActive: boolean
  farmLandId?: string
  farmLand?: { farmName: string }
  createdAt: string
  alertCount?: number
}

export default function IoTSensorsPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<IoTSensor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<IoTSensor | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [form, setForm] = useState<any>({ sensorType: 'temperature' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter && typeFilter !== 'all') params.set('sensorType', typeFilter)
      const res = await fetch(`/api/iot-sensors?${params}`)
      const data = await res.json()
      if (data.success) setItems(data.data?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: items.length,
    active: items.filter(s => s.isActive).length,
    lowBattery: items.filter(s => s.batteryLevel != null && s.batteryLevel < 20).length,
    alerts: items.reduce((sum, s) => sum + (s.alertCount || 0), 0),
  }

  const typeChartData = Object.entries(SENSOR_TYPE_LABELS).map(([key, label]) => ({
    name: label,
    count: items.filter(s => s.sensorType === key).length,
  })).filter(d => d.count > 0)

  function getBatteryColor(level?: number): string {
    if (level == null) return 'text-gray-400'
    if (level > 60) return 'text-green-600'
    if (level > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  function getBatteryBg(level?: number): string {
    if (level == null) return 'bg-gray-200'
    if (level > 60) return 'bg-green-500'
    if (level > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  async function handleCreate() {
    try {
      const res = await fetch('/api/iot-sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ sensorType: 'temperature' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Thermometer className="w-6 h-6 text-primary" /> IoT Sensor Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Monitor and manage IoT sensors and live readings</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Register Sensor</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Register IoT Sensor</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Device ID *</label><Input placeholder="SENSOR-001" value={form.deviceId || ''} onChange={e => setForm({ ...form, deviceId: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Device Name</label><Input placeholder="Temp Sensor #1" value={form.deviceName || ''} onChange={e => setForm({ ...form, deviceName: e.target.value })} /></div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sensor Type</label>
                    <Select value={form.sensorType} onValueChange={v => setForm({ ...form, sensorType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SENSOR_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><label className="text-sm font-medium">Manufacturer</label><Input placeholder="SensorTech" value={form.manufacturer || ''} onChange={e => setForm({ ...form, manufacturer: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Farm Land ID</label><Input placeholder="Link to farm land" value={form.farmLandId || ''} onChange={e => setForm({ ...form, farmLandId: e.target.value })} /></div>
                  <Button onClick={handleCreate} className="w-full">Register Sensor</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sensors', value: stats.total, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Active', value: stats.active, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Low Battery', value: stats.lowBattery, bg: 'bg-red-100', color: 'text-red-600' },
            { label: 'Alerts', value: stats.alerts, bg: 'bg-yellow-100', color: 'text-yellow-600' },
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

        {/* Filters & View Toggle */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search sensors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(SENSOR_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} className="text-xs">Cards</Button>
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="text-xs">Table</Button>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : viewMode === 'cards' ? (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <MotionCard {...hoverScale} className="rounded-xl border shadow-sm cursor-pointer" onClick={() => setDetailItem(item)}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{SENSOR_TYPE_ICONS[item.sensorType] || '📡'}</span>
                        <div>
                          <p className="font-medium text-sm">{item.deviceName || item.deviceId}</p>
                          <p className="text-xs text-muted-foreground">{item.deviceId}</p>
                        </div>
                      </div>
                      {item.isActive ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${SENSOR_TYPE_COLORS[item.sensorType] || 'bg-gray-100'} border text-xs`}>{SENSOR_TYPE_LABELS[item.sensorType] || item.sensorType}</Badge>
                      {item.alertCount && item.alertCount > 0 && <Badge className="bg-red-100 text-red-800 border border-red-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />{item.alertCount}</Badge>}
                    </div>
                    {/* Last Reading */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Reading:</span>
                      <span className="font-mono font-medium">{item.lastReading || '—'}</span>
                    </div>
                    {/* Battery */}
                    {item.batteryLevel != null && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1"><Battery className="w-3 h-3" />Battery</span>
                          <span className={getBatteryColor(item.batteryLevel)}>{item.batteryLevel}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getBatteryBg(item.batteryLevel)}`} style={{ width: `${item.batteryLevel}%` }} />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{item.lastReadingAt ? new Date(item.lastReadingAt).toLocaleString() : 'No readings yet'}</p>
                  </CardContent>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Reading</TableHead>
                      <TableHead>Last Reading At</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Alerts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Thermometer className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No sensors found</p></TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailItem(item)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-muted-foreground" />
                            <div><p className="font-medium">{item.deviceName || item.deviceId}</p><p className="text-xs text-muted-foreground">{item.deviceId}</p></div>
                          </div>
                        </TableCell>
                        <TableCell><Badge className={`${SENSOR_TYPE_COLORS[item.sensorType]} border text-xs`}>{SENSOR_TYPE_LABELS[item.sensorType] || item.sensorType}</Badge></TableCell>
                        <TableCell className="text-sm font-mono">{item.lastReading || '—'}</TableCell>
                        <TableCell className="text-xs">{item.lastReadingAt ? new Date(item.lastReadingAt).toLocaleString() : '—'}</TableCell>
                        <TableCell>{item.batteryLevel != null ? <div className="flex items-center gap-1"><Battery className={`w-4 h-4 ${getBatteryColor(item.batteryLevel)}`} />{item.batteryLevel}%</div> : '—'}</TableCell>
                        <TableCell>{item.isActive ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>}</TableCell>
                        <TableCell>{item.alertCount && item.alertCount > 0 ? <Badge className="bg-red-100 text-red-800">{item.alertCount}</Badge> : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Sensor Type Distribution */}
        {typeChartData.length > 0 && (
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader><CardTitle className="text-base">Sensors by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5a1e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Sensor Details</DialogTitle></DialogHeader>
            {detailItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{SENSOR_TYPE_ICONS[detailItem.sensorType] || '📡'}</span>
                  <div>
                    <h3 className="font-semibold">{detailItem.deviceName || detailItem.deviceId}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className={`${SENSOR_TYPE_COLORS[detailItem.sensorType]} border text-xs`}>{SENSOR_TYPE_LABELS[detailItem.sensorType] || detailItem.sensorType}</Badge>
                      {detailItem.isActive ? <Badge className="bg-green-100 text-green-800 text-xs"><Wifi className="w-3 h-3 mr-1" />Active</Badge> : <Badge className="bg-gray-100 text-gray-800 text-xs"><WifiOff className="w-3 h-3 mr-1" />Inactive</Badge>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Device ID:</span><p className="font-mono">{detailItem.deviceId}</p></div>
                  <div><span className="text-muted-foreground">Manufacturer:</span><p>{detailItem.manufacturer || '—'}</p></div>
                  <div><span className="text-muted-foreground">Last Reading:</span><p className="font-mono">{detailItem.lastReading || '—'}</p></div>
                  <div><span className="text-muted-foreground">Reading At:</span><p>{detailItem.lastReadingAt ? new Date(detailItem.lastReadingAt).toLocaleString() : '—'}</p></div>
                  <div><span className="text-muted-foreground">Battery:</span><p className={getBatteryColor(detailItem.batteryLevel)}>{detailItem.batteryLevel != null ? `${detailItem.batteryLevel}%` : '—'}</p></div>
                  <div><span className="text-muted-foreground">Alerts:</span><p>{detailItem.alertCount || 0}</p></div>
                  <div><span className="text-muted-foreground">Farm:</span><p>{detailItem.farmLand?.farmName || '—'}</p></div>
                  <div><span className="text-muted-foreground">Created:</span><p>{new Date(detailItem.createdAt).toLocaleDateString()}</p></div>
                </div>
                {/* Reading History Placeholder */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><Activity className="w-4 h-4" />Reading History</h4>
                  <p className="text-xs text-muted-foreground">Recent readings will be displayed here</p>
                  <div className="space-y-1 mt-2">
                    {detailItem.lastReading && (
                      <div className="flex justify-between text-xs"><span>Latest</span><span className="font-mono">{detailItem.lastReading}</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

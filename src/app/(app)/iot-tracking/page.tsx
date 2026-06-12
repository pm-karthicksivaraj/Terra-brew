'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Radio, Search, Plus, Loader2,
  Battery, Wifi, WifiOff, AlertTriangle,
  Thermometer, Droplets, Zap, MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

interface IoTDevice {
  id: string
  deviceName: string
  deviceType: string
  deviceCode: string
  batteryLevel: number
  status: string
  lastPing: string
  currentShipment: string | null
}

interface Alert {
  id: string
  deviceName: string
  alertType: string
  severity: string
  message: string
  timestamp: string
}

const MOCK_DEVICES: IoTDevice[] = [
  { id: '1', deviceName: 'Temp Sensor #1', deviceType: 'temperature', deviceCode: 'IOT-T-001', batteryLevel: 85, status: 'online', lastPing: '2024-12-10T09:30:00Z', currentShipment: 'SH-2024-001' },
  { id: '2', deviceName: 'Humidity Sensor #1', deviceType: 'humidity', deviceCode: 'IOT-H-001', batteryLevel: 72, status: 'online', lastPing: '2024-12-10T09:28:00Z', currentShipment: 'SH-2024-001' },
  { id: '3', deviceName: 'GPS Tracker #1', deviceType: 'gps', deviceCode: 'IOT-G-001', batteryLevel: 45, status: 'online', lastPing: '2024-12-10T09:29:00Z', currentShipment: 'SH-2024-002' },
  { id: '4', deviceName: 'Shock Sensor #1', deviceType: 'shock', deviceCode: 'IOT-S-001', batteryLevel: 12, status: 'low_battery', lastPing: '2024-12-10T08:15:00Z', currentShipment: 'SH-2024-001' },
  { id: '5', deviceName: 'Door Sensor #1', deviceType: 'door', deviceCode: 'IOT-D-001', batteryLevel: 0, status: 'offline', lastPing: '2024-12-08T16:00:00Z', currentShipment: null },
]

const MOCK_ALERTS: Alert[] = [
  { id: '1', deviceName: 'Temp Sensor #1', alertType: 'threshold_exceeded', severity: 'warning', message: 'Temperature exceeded 25°C threshold (27.3°C)', timestamp: '2024-12-10T08:45:00Z' },
  { id: '2', deviceName: 'Shock Sensor #1', alertType: 'low_battery', severity: 'critical', message: 'Battery level critically low (12%)', timestamp: '2024-12-10T08:15:00Z' },
  { id: '3', deviceName: 'GPS Tracker #1', alertType: 'route_deviation', severity: 'info', message: 'Route deviation detected (2km off-route)', timestamp: '2024-12-09T22:30:00Z' },
]

function typeIcon(type: string) {
  switch (type) {
    case 'temperature': return Thermometer
    case 'humidity': return Droplets
    case 'shock': return Zap
    case 'gps': return MapPin
    case 'door': return Radio
    case 'light': return Radio
    default: return Radio
  }
}

function severityBadge(sev: string): string {
  switch (sev) {
    case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function batteryColor(level: number): string {
  if (level > 50) return 'text-green-500'
  if (level > 20) return 'text-yellow-500'
  return 'text-red-500'
}

export default function IoTrackingPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [devices, setDevices] = useState<IoTDevice[]>(MOCK_DEVICES)
  const [activeTab, setActiveTab] = useState('devices')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ deviceName: '', deviceType: 'temperature', deviceCode: '' })

  const onlineCount = devices.filter((d) => d.status === 'online').length
  const lowBatteryCount = devices.filter((d) => d.batteryLevel < 20 && d.batteryLevel > 0).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newDevice: IoTDevice = {
        id: String(Date.now()),
        deviceName: form.deviceName,
        deviceType: form.deviceType,
        deviceCode: form.deviceCode || `IOT-${form.deviceType[0].toUpperCase()}-${String(devices.length + 1).padStart(3, '0')}`,
        batteryLevel: 100,
        status: 'offline',
        lastPing: new Date().toISOString(),
        currentShipment: null,
      }
      setDevices([newDevice, ...devices])
      toast.success(t2('Đã thêm thiết bị!', 'Device added!'))
      setDialogOpen(false)
      setForm({ deviceName: '', deviceType: 'temperature', deviceCode: '' })
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
              <Radio className="w-6 h-6 text-primary" />
              {t('iotTracking.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('iotTracking.subtitle')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('iotTracking.addDevice')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  {t('iotTracking.addDevice')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t('iotTracking.deviceName')}</Label>
                  <Input value={form.deviceName} onChange={(e) => setForm({ ...form, deviceName: e.target.value })} className="rounded-xl border-border" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('iotTracking.deviceType')}</Label>
                    <Select value={form.deviceType} onValueChange={(v) => setForm({ ...form, deviceType: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">{t('iotTracking.typeTemperature')}</SelectItem>
                        <SelectItem value="humidity">{t('iotTracking.typeHumidity')}</SelectItem>
                        <SelectItem value="shock">{t('iotTracking.typeShock')}</SelectItem>
                        <SelectItem value="gps">{t('iotTracking.typeGps')}</SelectItem>
                        <SelectItem value="door">{t('iotTracking.typeDoor')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('iotTracking.deviceCode')}</Label>
                    <Input value={form.deviceCode} onChange={(e) => setForm({ ...form, deviceCode: e.target.value })} placeholder={t2('Tự động tạo', 'Auto-generated')} className="rounded-xl border-border" />
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

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('iotTracking.devices')}</p>
                  <p className="text-2xl font-bold text-foreground">{devices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t2('Trực tuyến', 'Online')}</p>
                  <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Battery className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t2('Pin yếu', 'Low Battery')}</p>
                  <p className="text-2xl font-bold text-foreground">{lowBatteryCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('iotTracking.alerts')}</p>
                  <p className="text-2xl font-bold text-foreground">{MOCK_ALERTS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted rounded-xl p-1">
            <TabsTrigger value="devices" className="rounded-lg text-xs">{t('iotTracking.devices')}</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg text-xs">{t('iotTracking.alerts')}</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="mt-4">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('iotTracking.deviceName')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('iotTracking.deviceType')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('iotTracking.batteryLevel')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('iotTracking.lastPing')}</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('iotTracking.currentShipment')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d) => {
                      const Icon = typeIcon(d.deviceType)
                      return (
                        <tr key={d.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-foreground">{d.deviceName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{d.deviceCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs capitalize text-foreground hidden md:table-cell">{d.deviceType}</td>
                          <td className="px-4 py-3">
                            <Badge className={`${d.status === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : d.status === 'low_battery' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} text-[10px] border-0`}>
                              {d.status === 'online' ? t2('Trực tuyến', 'Online') : d.status === 'low_battery' ? t2('Pin yếu', 'Low Battery') : t2('Ngoại tuyến', 'Offline')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Battery className={`w-3.5 h-3.5 ${batteryColor(d.batteryLevel)}`} />
                              <span className="text-xs text-foreground">{d.batteryLevel}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-muted-foreground hidden lg:table-cell">
                            {new Date(d.lastPing).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-foreground hidden lg:table-cell">{d.currentShipment || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4 space-y-3">
            {MOCK_ALERTS.map((a) => (
              <Card key={a.id} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.severity === 'critical' ? 'text-red-500' : a.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">{a.deviceName}</span>
                          <Badge className={`${severityBadge(a.severity)} text-[9px] border-0`}>
                            {a.severity === 'critical' ? t('iotTracking.severityCritical') : a.severity === 'warning' ? t('iotTracking.severityWarning') : t('iotTracking.severityInfo')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{a.message}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(a.timestamp).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
  )
}

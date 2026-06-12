'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Activity, Cloud, Droplets, Thermometer, Wind,
  AlertTriangle, Mountain, TreePine, Sun, CloudRain,
  Snowflake, MapPin, Loader2, Coffee, Leaf,
  Sprout, Waves, Eye, Info,
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'

// ─── Risk badge helpers ───

interface FarmlandData {
  id: string
  farmName: string
  altitude: number | null
  latitude: number | null
  longitude: number | null
  soilType: string | null
  region?: string
  farmer?: { fullName: string }
}

function getFrostRisk(altitude: number | null): { level: string; color: string; icon: typeof Snowflake } {
  if (!altitude) return { level: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Snowflake }
  if (altitude > 2000) return { level: 'High', color: 'bg-red-100 text-red-700 border-red-200', icon: Snowflake }
  if (altitude > 1500) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Snowflake }
  return { level: 'Low', color: 'bg-green-100 text-green-700 border-green-200', icon: Snowflake }
}

function getDroughtRisk(altitude: number | null): { level: string; color: string } {
  // Placeholder logic — lower altitude farms tend to be more drought-prone
  if (!altitude) return { level: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  if (altitude < 800) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  return { level: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
}

function getFloodRisk(soilType: string | null): { level: string; color: string } {
  // Placeholder logic
  if (!soilType) return { level: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  if (soilType.toLowerCase().includes('clay')) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  if (soilType.toLowerCase().includes('sandy')) return { level: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
  return { level: 'Low', color: 'bg-green-100 text-green-700 border-green-200' }
}

// ─── Adaptation Recommendations ───

const CLIMATE_RECOMMENDATIONS = [
  {
    icon: TreePine,
    title: 'Plant shade trees to reduce heat stress',
    description: 'Integrate leguminous shade trees (e.g., Inga, Erythrina) to lower canopy temperature by 3–5°C and improve soil nitrogen fixation.',
    priority: 'high',
  },
  {
    icon: Droplets,
    title: 'Implement water harvesting for dry seasons',
    description: 'Build contour trenches and micro-catchments to capture rainfall runoff for use during dry periods.',
    priority: 'high',
  },
  {
    icon: Activity,
    title: 'Monitor NDVI for early drought detection',
    description: 'Use satellite-derived Normalized Difference Vegetation Index (NDVI) to detect vegetation stress 2–4 weeks before visible symptoms.',
    priority: 'medium',
  },
  {
    icon: Sprout,
    title: 'Consider drought-resistant coffee varieties for altitudes below 800m',
    description: 'Varieties like Catimor, Sarchimor, and Ruiru 11 show better drought tolerance in lowland conditions.',
    priority: 'medium',
  },
  {
    icon: Waves,
    title: 'Improve soil water retention with mulching',
    description: 'Apply 5–10cm of organic mulch (coffee husks, leaves) to reduce soil evaporation by up to 50%.',
    priority: 'low',
  },
  {
    icon: Leaf,
    title: 'Diversify with intercropping',
    description: 'Integrate banana, avocado, or pepper as companion crops to reduce climate risk and diversify income.',
    priority: 'low',
  },
]

// ─── Main Component ───

export default function ClimateIntelligencePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [farmlands, setFarmlands] = useState<FarmlandData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetch('/api/farmlands?pageSize=500')
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            const items = res.data?.data ?? res.data?.items ?? []
            setFarmlands(Array.isArray(items) ? items : [])
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status, router])

  // Stats
  const stats = useMemo(() => {
    const withAltitude = farmlands.filter(f => f.altitude != null)
    const avgAltitude = withAltitude.length > 0
      ? Math.round(withAltitude.reduce((sum, f) => sum + (f.altitude || 0), 0) / withAltitude.length)
      : 0
    const highFrostRisk = farmlands.filter(f => f.altitude && f.altitude > 2000).length
    const mediumFrostRisk = farmlands.filter(f => f.altitude && f.altitude > 1500 && f.altitude <= 2000).length
    const lowAltitude = farmlands.filter(f => f.altitude && f.altitude < 800).length
    return { avgAltitude, highFrostRisk, mediumFrostRisk, lowAltitude, total: farmlands.length }
  }, [farmlands])

  if (status === 'loading' || loading) {
    return (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Coffee className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading climate data...</span>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 shrink-0" style={{ color: '#00a3e0' }} />
                Climate Intelligence
              </h2>
              <p className="text-sm text-muted-foreground">
                Weather risk monitoring and climate adaptation for your farm plots
              </p>
            </div>
          </div>
        </FadeIn>

        {/* KPI Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Farm Plots', value: stats.total, icon: MapPin, bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Avg Altitude', value: `${stats.avgAltitude}m`, icon: Mountain, bg: 'bg-sky-100', color: 'text-sky-600' },
            { label: 'High Frost Risk', value: stats.highFrostRisk, icon: Snowflake, bg: 'bg-red-100', color: 'text-red-600' },
            { label: 'Low Altitude (<800m)', value: stats.lowAltitude, icon: Sun, bg: 'bg-amber-100', color: 'text-amber-600' },
          ].map((card) => (
            <StaggerItem key={card.label}>
              <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-4 h-4 ${card.color}`} /></div>
                    <div>
                      <p className="text-xl font-bold font-mono">{card.value}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Climate Risk Dashboard + Current Weather */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Current Weather */}
          <FadeIn>
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="w-4 h-4" style={{ color: '#00a3e0' }} />
                  Current Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-3">
                    <Cloud className="w-10 h-10 text-sky-300" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Weather data not connected</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
                    Connect a weather API (e.g., OpenWeather, WeatherAPI) for real-time temperature, humidity, and rainfall data for your farm regions.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3 w-full">
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <Thermometer className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Temp</p>
                      <p className="text-xs font-mono font-bold text-muted-foreground">—</p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <Droplets className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Humidity</p>
                      <p className="text-xs font-mono font-bold text-muted-foreground">—</p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <Wind className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Wind</p>
                      <p className="text-xs font-mono font-bold text-muted-foreground">—</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Climate Risk Dashboard */}
          <FadeIn delay={0.1} className="md:col-span-2">
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#00a3e0' }} />
                  Climate Risk Dashboard
                </CardTitle>
                <CardDescription className="text-xs">
                  Farm plots with risk indicators based on altitude and soil data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {farmlands.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No farm plots registered yet</p>
                    <p className="text-xs text-muted-foreground">Add farmlands to see climate risk analysis</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {farmlands.map((farm) => {
                      const frost = getFrostRisk(farm.altitude)
                      const drought = getDroughtRisk(farm.altitude)
                      const flood = getFloodRisk(farm.soilType)

                      return (
                        <div
                          key={farm.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                        >
                          <div className="p-1.5 rounded-md bg-sky-50 shrink-0 mt-0.5">
                            <Mountain className="w-3.5 h-3.5 text-sky-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-foreground truncate">{farm.farmName}</p>
                              {farm.altitude && (
                                <span className="text-[10px] text-muted-foreground font-mono shrink-0">{farm.altitude}m</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {farm.farmer && (
                                <span className="text-[10px] text-muted-foreground truncate">{farm.farmer.fullName}</span>
                              )}
                              {farm.soilType && (
                                <span className="text-[10px] text-muted-foreground">· {farm.soilType}</span>
                              )}
                            </div>
                            {/* Risk badges */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <Badge className={`${frost.color} border text-[9px] px-1.5 py-0`}>
                                <Snowflake className="w-2.5 h-2.5 mr-0.5" />
                                Frost: {frost.level}
                              </Badge>
                              <Badge className={`${drought.color} border text-[9px] px-1.5 py-0`}>
                                <Sun className="w-2.5 h-2.5 mr-0.5" />
                                Drought: {drought.level}
                              </Badge>
                              <Badge className={`${flood.color} border text-[9px] px-1.5 py-0`}>
                                <CloudRain className="w-2.5 h-2.5 mr-0.5" />
                                Flood: {flood.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Seasonal Forecast + Adaptation Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Seasonal Forecast */}
          <FadeIn delay={0.2}>
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CloudRain className="w-4 h-4" style={{ color: '#00a3e0' }} />
                  Seasonal Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-3">
                    <CloudRain className="w-8 h-8 text-sky-300" />
                  </div>
                  <Badge variant="outline" className="text-[10px] mb-3">Coming Soon</Badge>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Connect to OpenWeather or similar API
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[280px]">
                    Seasonal climate forecasts will provide 3-month outlooks for temperature, precipitation,
                    and growing condition indices specific to your coffee growing regions.
                  </p>
                  <div className="mt-4 w-full grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Thermometer className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Temperature Outlook</p>
                      <p className="text-xs font-mono text-muted-foreground">—</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Droplets className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Rainfall Outlook</p>
                      <p className="text-xs font-mono text-muted-foreground">—</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Sun className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">UV Index</p>
                      <p className="text-xs font-mono text-muted-foreground">—</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Leaf className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Growing Index</p>
                      <p className="text-xs font-mono text-muted-foreground">—</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Climate Adaptation Recommendations */}
          <FadeIn delay={0.3}>
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sprout className="w-4 h-4" style={{ color: '#00a3e0' }} />
                    Climate Adaptation Recommendations
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    <Info className="w-3 h-3 mr-1" />
                    {CLIMATE_RECOMMENDATIONS.length} tips
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Actionable strategies to improve climate resilience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {CLIMATE_RECOMMENDATIONS.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-1.5 rounded-md shrink-0 ${
                        rec.priority === 'high' ? 'bg-red-50' : rec.priority === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                      }`}>
                        <rec.icon className={`w-3.5 h-3.5 ${
                          rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground">{rec.title}</p>
                          <Badge className={`text-[8px] px-1 py-0 border-0 ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
  )
}

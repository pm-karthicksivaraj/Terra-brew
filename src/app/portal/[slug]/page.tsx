'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Award, Leaf, TreePine, Coffee, Users,
  ChevronRight, Globe, ExternalLink, Shield, Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Branding {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  heroTitle: string
  heroSubtitle: string
  logoUrl: string
  showSustainability: boolean
  showFarmerProfile: boolean
  showMap: boolean
  showCertifications: boolean
  socialLinks: Record<string, string>
}

interface PortalData {
  tenant: {
    name: string
    slug: string
    logoUrl: string | null
    eudrCompliant: boolean
    certifications: string | null
    commodityTypes: string
    country: string
  }
  branding: Branding
  traceData?: {
    batchId: string
    harvestRecords: any[]
    procurementRecords: any[]
    processingRecords: any[]
    eudrCompliance: any
    hashChainBlocks: any[]
    totalStages: number
  }
}

const STAGE_LABELS: Record<string, string> = {
  farm: 'Farm Origin', harvest: 'Harvest', procurement: 'Collection',
  processing: 'Processing', quality: 'Quality Check', export: 'Export',
  shipping: 'Shipping', roasting: 'Roasting', retail: 'Retail',
}

const STAGE_ICONS: Record<string, string> = {
  farm: '🌱', harvest: '🫘', procurement: '📦', processing: '⚙️',
  quality: '✅', export: '🚢', shipping: '✈️', roasting: '🔥', retail: '☕',
}

export default function ConsumerPortal() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchBatch, setSearchBatch] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const loadPortal = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/${slug}`)
      if (!res.ok) {
        setError('This brand portal is not available.')
        return
      }
      const result = await res.json()
      setData(result.data || result)
    } catch {
      setError('Failed to load portal.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { loadPortal() }, [loadPortal])

  const handleSearch = async () => {
    if (!searchBatch.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/portal/${slug}?batchId=${encodeURIComponent(searchBatch.trim())}`)
      if (res.ok) {
        const result = await res.json()
        setData(prev => prev ? { ...prev, traceData: (result.data || result).traceData } : prev)
      }
    } finally {
      setSearching(false)
    }
  }

  // Apply custom branding colors via CSS custom properties
  useEffect(() => {
    if (data?.branding) {
      const root = document.documentElement
      root.style.setProperty('--wl-primary', data.branding.primaryColor)
      root.style.setProperty('--wl-secondary', data.branding.secondaryColor)
      root.style.setProperty('--wl-accent', data.branding.accentColor)
    }
  }, [data?.branding])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--wl-primary, #0D9488)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Coffee className="w-16 h-16 text-gray-300 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800">Portal Not Available</h1>
          <p className="text-gray-500">{error || 'This brand has not set up their consumer portal yet.'}</p>
        </div>
      </div>
    )
  }

  const { tenant, branding, traceData } = data
  const primary = branding.primaryColor || '#0D9488'
  const secondary = branding.secondaryColor || '#115E59'
  const accent = branding.accentColor || '#F59E0B'

  const farmer = traceData?.harvestRecords?.[0]?.farmer
  const farmLand = traceData?.harvestRecords?.[0]?.farmLand
  const hashBlocks = traceData?.hashChainBlocks || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={tenant.name} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primary }}>
                {tenant.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg" style={{ color: secondary }}>{tenant.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {tenant.eudrCompliant && (
              <Badge className="text-xs gap-1" style={{ backgroundColor: `${primary}20`, color: primary, borderColor: 'transparent' }}>
                <Shield className="w-3 h-3" /> EUDR Compliant
              </Badge>
            )}
            {branding.socialLinks?.website && (
              <a href={branding.socialLinks.website} target="_blank" rel="noopener noreferrer">
                <Globe className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {branding.heroTitle}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {branding.heroSubtitle}
            </p>

            {/* Search */}
            <div className="max-w-lg mx-auto mt-8">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter batch ID to trace your coffee..."
                  value={searchBatch}
                  onChange={e => setSearchBatch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="h-12 bg-white/95 border-0 text-gray-800 placeholder:text-gray-400 rounded-xl px-4"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="h-12 px-6 rounded-xl text-white font-semibold shrink-0"
                  style={{ backgroundColor: accent }}
                >
                  {searching ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trace Results */}
      <AnimatePresence>
        {traceData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-4 py-12 space-y-10"
          >
            {/* Journey Timeline */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Coffee className="w-6 h-6" style={{ color: primary }} />
                Farm to Cup Journey
              </h2>
              <div className="relative">
                {hashBlocks.length > 0 ? (
                  <div className="flex overflow-x-auto pb-4 gap-0">
                    {hashBlocks.map((block: any, i: number) => (
                      <motion.div
                        key={block.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center shrink-0"
                      >
                        <div className="flex flex-col items-center text-center w-24">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-md"
                            style={{ backgroundColor: i < hashBlocks.length ? primary : '#e5e7eb' }}>
                            {STAGE_ICONS[block.stage] || '📋'}
                          </div>
                          <span className="text-xs font-medium text-gray-700 mt-2">
                            {STAGE_LABELS[block.stage] || block.stage}
                          </span>
                        </div>
                        {i < hashBlocks.length - 1 && (
                          <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mx-1" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No trace data found for this batch ID.</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Two Column: Farmer + Sustainability */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Meet the Farmer */}
              {branding.showFarmerProfile && farmer && (
                <Card className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: primary }} />
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5" style={{ color: primary }} />
                      Meet the Farmer
                    </h3>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                        👨‍🌾
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-800">{farmer.fullName}</p>
                        {farmer.province && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {farmer.district}, {farmer.province}
                          </p>
                        )}
                        {farmer.isCertified && farmer.certificationType && (
                          <Badge variant="outline" className="mt-1 text-xs" style={{ borderColor: primary, color: primary }}>
                            <Award className="w-3 h-3 mr-1" /> {farmer.certificationType} Certified
                          </Badge>
                        )}
                      </div>
                    </div>
                    {farmLand && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                        {farmLand.altitude && (
                          <div><span className="text-gray-400">Altitude</span><br /><span className="font-medium">{farmLand.altitude}m</span></div>
                        )}
                        {farmLand.totalLandHolding && (
                          <div><span className="text-gray-400">Farm Size</span><br /><span className="font-medium">{farmLand.totalLandHolding} ha</span></div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sustainability */}
              {branding.showSustainability && (
                <Card className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: '#22c55e' }} />
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Leaf className="w-5 h-5 text-green-600" />
                      Sustainability
                    </h3>
                    <div className="space-y-3">
                      {traceData.eudrCompliance && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                          <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <TreePine className="w-4 h-4" /> Deforestation-Free
                          </span>
                          <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                        </div>
                      )}
                      {tenant.eudrCompliant && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                          <span className="text-sm font-medium text-blue-800 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> EU EUDR Compliant
                          </span>
                          <Badge className="bg-blue-600 text-white text-xs">Yes</Badge>
                        </div>
                      )}
                      {farmer?.isCertified && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                          <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
                            <Award className="w-4 h-4" /> {farmer.certificationType} Certified
                          </span>
                          <Badge className="bg-amber-600 text-white text-xs">Certified</Badge>
                        </div>
                      )}
                      {!traceData.eudrCompliance && !tenant.eudrCompliant && !farmer?.isCertified && (
                        <p className="text-sm text-gray-500">Sustainability data will appear here once verified.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Certifications */}
            {branding.showCertifications && tenant.certifications && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5" style={{ color: accent }} />
                    Certifications & Standards
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(tenant.certifications).map((cert: string, i: number) => (
                      <Badge key={i} variant="outline" className="px-3 py-1" style={{ borderColor: primary, color: primary }}>
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Placeholder */}
            {branding.showMap && farmer && (farmer.latitude || farmLand?.latitude) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5" style={{ color: primary }} />
                    Origin Location
                  </h3>
                  <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: primary }} />
                      <p className="text-sm font-medium text-gray-700">
                        {farmer.commune && `${farmer.commune}, `}{farmer.district}, {farmer.province}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {farmer.latitude?.toFixed(4)}, {farmer.longitude?.toFixed(4)}
                      </p>
                    </div>
                    <div className="absolute inset-0 opacity-5">
                      <svg viewBox="0 0 400 200" className="w-full h-full">
                        <path d="M0,100 Q100,50 200,80 T400,60 L400,200 L0,200 Z" fill={primary} />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blockchain Verification */}
            {hashBlocks.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5" style={{ color: primary }} />
                    Blockchain Verified
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    This batch has been verified through {hashBlocks.length} immutable blockchain records, ensuring complete data integrity.
                  </p>
                  <div className="font-mono text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto">
                    <div className="text-gray-400 mb-1">Latest Block Hash:</div>
                    <div className="text-gray-700 break-all">{hashBlocks[hashBlocks.length - 1].blockHash}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features Section (when no search) */}
      {!traceData && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TreePine, title: 'Deforestation-Free', desc: 'Every batch is verified against EU EUDR requirements using satellite imagery', color: '#22c55e' },
              { icon: Shield, title: 'Blockchain Verified', desc: 'Tamper-proof records ensure complete transparency from farm to cup', color: primary },
              { icon: Users, title: 'Farmer First', desc: 'Meet the farmers behind your coffee and learn about their sustainable practices', color: accent },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ backgroundColor: `${item.color}15` }}>
                      <item.icon className="w-7 h-7" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="" className="h-5 w-5 rounded" />
            ) : (
              <div className="h-5 w-5 rounded text-white text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: primary }}>
                {tenant.name.charAt(0)}
              </div>
            )}
            <span className="text-sm text-gray-500">Powered by <span className="font-semibold" style={{ color: primary }}>Terra Brew</span></span>
          </div>
          <div className="flex items-center gap-4">
            {branding.socialLinks?.facebook && (
              <a href={branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600"><Globe className="w-4 h-4" /></a>
            )}
            {branding.socialLinks?.instagram && (
              <a href={branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600"><ExternalLink className="w-4 h-4" /></a>
            )}
          </div>
        </div>
      </footer>

      <style jsx>{`
        :root {
          --wl-primary: ${primary};
          --wl-secondary: ${secondary};
          --wl-accent: ${accent};
        }
      `}</style>
    </div>
  )
}

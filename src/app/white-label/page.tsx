'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Palette, Globe, Save, Eye, Lock, Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface WhiteLabelConfig {
  enabled: boolean
  primaryColor: string
  secondaryColor: string
  accentColor: string
  heroTitle: string
  heroSubtitle: string
  logoUrl: string
  faviconUrl: string
  customCss: string
  showSustainability: boolean
  showFarmerProfile: boolean
  showMap: boolean
  showCertifications: boolean
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; website?: string }
}

const defaultConfig: WhiteLabelConfig = {
  enabled: false,
  primaryColor: '#0D9488',
  secondaryColor: '#115E59',
  accentColor: '#F59E0B',
  heroTitle: '',
  heroSubtitle: '',
  logoUrl: '',
  faviconUrl: '',
  customCss: '',
  showSustainability: true,
  showFarmerProfile: true,
  showMap: true,
  showCertifications: true,
  socialLinks: {},
}

export default function WhiteLabelPage() {
  const { data: session } = useSession() || { data: null, status: 'unauthenticated' as const }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEnterprise, setIsEnterprise] = useState(false)
  const [whiteLabelDomain, setWhiteLabelDomain] = useState('')
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig)
  const [previewOpen, setPreviewOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/white-label')
      if (res.ok) {
        const result = await res.json()
        const data = result.data || result
        setIsEnterprise(data.isEnterprise)
        setWhiteLabelDomain(data.whiteLabelDomain || '')
        if (data.config) {
          setConfig({ ...defaultConfig, ...data.config, socialLinks: data.config.socialLinks || {} })
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/white-label', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, whiteLabelDomain }),
      })
      if (res.ok) {
        toast.success('White-label configuration saved!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save configuration')
      }
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: keyof WhiteLabelConfig, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateSocial = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isEnterprise) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <Lock className="w-16 h-16 text-gray-300 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-800">Enterprise Feature</h1>
        <p className="text-gray-500">White-label consumer portal is available on the Enterprise plan ($799/mo).</p>
        <Button onClick={() => window.location.href = '/billing'}>Upgrade to Enterprise</Button>
      </div>
    )
  }

  const portalUrl = whiteLabelDomain || `${window.location.origin}/portal/${session?.user?.tenantSlug || 'your-brand'}`

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            White-Label Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure your consumer-facing traceability portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(portalUrl, '_blank')}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Portal URL */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <Label className="text-xs text-gray-500">Portal URL</Label>
              <p className="text-sm font-medium text-gray-700 truncate">{portalUrl}</p>
            </div>
            <Badge variant="outline" className={config.enabled ? 'text-green-600 border-green-200' : 'text-gray-400'}>
              {config.enabled ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
              {config.enabled ? 'Active' : 'Disabled'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Enable Portal */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Portal Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Enable White-Label Portal</Label>
                <p className="text-xs text-gray-500">Make your consumer portal publicly accessible</p>
              </div>
              <Switch checked={config.enabled} onCheckedChange={v => updateConfig('enabled', v)} />
            </div>
            <div className="space-y-2">
              <Label>Custom Domain</Label>
              <Input
                placeholder="trace.yourbrand.com"
                value={whiteLabelDomain}
                onChange={e => setWhiteLabelDomain(e.target.value)}
              />
              <p className="text-xs text-gray-400">Point your domain CNAME to portal.terrabrew.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader><CardTitle className="text-base">Brand Colors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'primaryColor', label: 'Primary Color' },
              { key: 'secondaryColor', label: 'Secondary Color' },
              { key: 'accentColor', label: 'Accent Color' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={config[key as keyof WhiteLabelConfig] as string}
                  onChange={e => updateConfig(key as keyof WhiteLabelConfig, e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                />
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">{label}</Label>
                  <Input
                    value={config[key as keyof WhiteLabelConfig] as string}
                    onChange={e => updateConfig(key as keyof WhiteLabelConfig, e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
            {/* Color Preview */}
            <div className="flex gap-2 mt-2">
              {['primaryColor', 'secondaryColor', 'accentColor'].map(key => (
                <div key={key} className="flex-1 h-8 rounded-lg"
                  style={{ backgroundColor: config[key as keyof WhiteLabelConfig] as string }} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hero Content */}
        <Card>
          <CardHeader><CardTitle className="text-base">Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hero Title</Label>
              <Input
                value={config.heroTitle}
                onChange={e => updateConfig('heroTitle', e.target.value)}
                placeholder="Discover the Journey of Your Coffee"
              />
            </div>
            <div className="space-y-2">
              <Label>Hero Subtitle</Label>
              <Textarea
                value={config.heroSubtitle}
                onChange={e => updateConfig('heroSubtitle', e.target.value)}
                placeholder="From farm to cup — trace every step with transparency"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={config.logoUrl}
                onChange={e => updateConfig('logoUrl', e.target.value)}
                placeholder="https://yourbrand.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader><CardTitle className="text-base">Display Options</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'showSustainability', label: 'Sustainability Section', desc: 'Show EUDR & eco certifications' },
              { key: 'showFarmerProfile', label: 'Farmer Profile', desc: 'Display farmer information' },
              { key: 'showMap', label: 'Origin Map', desc: 'Show farm location on map' },
              { key: 'showCertifications', label: 'Certifications', desc: 'List quality certifications' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{label}</Label>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <Switch
                  checked={config[key as keyof WhiteLabelConfig] as boolean}
                  onCheckedChange={v => updateConfig(key as keyof WhiteLabelConfig, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader><CardTitle className="text-base">Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {['website', 'facebook', 'instagram', 'twitter'].map(platform => (
              <div key={platform} className="space-y-1">
                <Label className="text-xs capitalize">{platform}</Label>
                <Input
                  value={config.socialLinks[platform as keyof typeof config.socialLinks] || ''}
                  onChange={e => updateSocial(platform, e.target.value)}
                  placeholder={`https://${platform}.com/yourbrand`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Custom CSS */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Custom CSS</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={config.customCss}
              onChange={e => updateConfig('customCss', e.target.value)}
              placeholder="/* Add custom CSS overrides for your portal */"
              rows={6}
              className="font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

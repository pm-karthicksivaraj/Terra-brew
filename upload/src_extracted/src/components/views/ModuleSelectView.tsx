'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { getModules, seedFullFlow } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import {
  Coffee,
  Wine,
  Flame,
  Bean,
  Fish,
  Carrot,
  TreePine,
  Apple,
  Flower2,
  Trees,
  Leaf,
  Waves,
  Globe,
  Loader2,
  Sprout,
} from 'lucide-react'

const moduleConfig = [
  { name: 'Terra Nexus', slug: 'terra-nexus', icon: Coffee, color: 'from-amber-600 to-amber-800', desc: 'Premium Coffee Traceability & Certification', accent: 'text-amber-700', bgLight: 'bg-amber-50' },
  { name: 'Terra Brew', slug: 'metrang-coffee', icon: Wine, color: 'from-purple-600 to-purple-800', desc: 'Beverage Supply Chain Management', accent: 'text-purple-700', bgLight: 'bg-purple-50' },
  { name: 'Terra Spices', slug: 'terra-spices', icon: Flame, color: 'from-red-600 to-red-800', desc: 'Organic Spice Certification Platform', accent: 'text-red-700', bgLight: 'bg-red-50' },
  { name: 'Terra Bean', slug: 'terra-bean', icon: Bean, color: 'from-yellow-700 to-yellow-900', desc: 'Cocoa & Cacao Traceability System', accent: 'text-yellow-800', bgLight: 'bg-yellow-50' },
  { name: 'Terra Blue', slug: 'terra-blue', icon: Fish, color: 'from-cyan-600 to-cyan-800', desc: 'Aquaculture & Fisheries Management', accent: 'text-cyan-700', bgLight: 'bg-cyan-50' },
  { name: 'Terra Veggies', slug: 'terra-veggies', icon: Carrot, color: 'from-green-600 to-green-800', desc: 'Organic Vegetable Certification', accent: 'text-green-700', bgLight: 'bg-green-50' },
  { name: 'Terra Graze', slug: 'terra-graze', icon: TreePine, color: 'from-emerald-700 to-emerald-900', desc: 'Livestock & Pastoral Management', accent: 'text-emerald-800', bgLight: 'bg-emerald-50' },
  { name: 'Terra Orchard', slug: 'terra-orchard', icon: Apple, color: 'from-rose-600 to-rose-800', desc: 'Fruit Orchard Traceability', accent: 'text-rose-700', bgLight: 'bg-rose-50' },
  { name: 'Terra Flora', slug: 'terra-flora', icon: Flower2, color: 'from-pink-600 to-pink-800', desc: 'Floriculture Supply Chain Platform', accent: 'text-pink-700', bgLight: 'bg-pink-50' },
  { name: 'Terra Forest', slug: 'terra-forest', icon: Trees, color: 'from-lime-700 to-lime-900', desc: 'Forestry & Timber Certification', accent: 'text-lime-800', bgLight: 'bg-lime-50' },
  { name: 'Terra Silvi', slug: 'terra-silvi', icon: Leaf, color: 'from-teal-600 to-teal-800', desc: 'Silviculture & Agroforestry', accent: 'text-teal-700', bgLight: 'bg-teal-50' },
  { name: 'Terra Mangrove', slug: 'terra-mangrove', icon: Waves, color: 'from-sky-600 to-sky-800', desc: 'Mangrove Conservation & Monitoring', accent: 'text-sky-700', bgLight: 'bg-sky-50' },
]

export function ModuleSelectView() {
  const { setSelectedModule, setCurrentView, setModules, modules } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getModules()
        setModules(data)
      } catch {
        // If no modules in DB, use config
        setModules([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setModules])

  const handleSelect = (mod: typeof moduleConfig[0], dbModule?: any) => {
    const selected = dbModule
      ? { id: dbModule.id, name: dbModule.name, slug: dbModule.slug, description: dbModule.description, icon: dbModule.icon, color: dbModule.color, isActive: dbModule.isActive }
      : { id: mod.slug, name: mod.name, slug: mod.slug, description: mod.desc, icon: mod.name, color: mod.color, isActive: true }
    setSelectedModule(selected)
    setCurrentView('login')
  }

    const handleSeed = async (mod: typeof moduleConfig[0], dbModule?: any) => {
    try {
      const moduleId = dbModule?.id || mod.slug
      await seedFullFlow(moduleId)
      toast.success(`Data seeded! Login with admin@${mod.slug}.test / admin123`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to seed data')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-emerald-600">Loading Terra Ecosystem...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <Toaster position="top-right" richColors />
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-200">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Terra <span className="text-emerald-600">Ecosystem</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Multi-tenant Agricultural Traceability Platform with Organic Certification Inspection.
            Select your module to get started.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sprout className="h-3 w-3" />
            <span>Sustainable Agriculture • Organic Certification • Full Traceability</span>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {moduleConfig.map((mod) => {
            const dbModule = modules.find((m: any) => m.slug === mod.slug)
            const Icon = mod.icon
            return (
              <Card
                key={mod.slug}
                className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => handleSelect(mod, dbModule)}
              >
                <div className={`h-2 bg-gradient-to-r ${mod.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mod.bgLight}`}>
                      <Icon className={`h-5 w-5 ${mod.accent}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {mod.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{mod.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className={`h-8 bg-gradient-to-r ${mod.color} hover:opacity-90 text-white border-0 shadow-sm`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(mod, dbModule)
                      }}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSeed(mod, dbModule)
                      }}
                    >
                      Seed Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-muted-foreground">
          <p>Terra Ecosystem &copy; {new Date().getFullYear()} — Agricultural Traceability Platform</p>
        </div>
      </div>
    </div>
  )
}

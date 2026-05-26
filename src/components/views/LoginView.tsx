'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { login, getTenants } from '@/lib/spa-api'
import { motion } from 'framer-motion'
import { Leaf, Eye, EyeOff, Loader2, Globe, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function LoginView() {
  const { setCurrentView, setCurrentUser } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantSlug, setTenantSlug] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenants, setTenants] = useState<any[]>([])

  useEffect(() => {
    getTenants().then(setTenants).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password, tenantSlug)
      setCurrentUser(user)
      setCurrentView('dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (slug: string, role: string) => {
    setTenantSlug(slug)
    setEmail(`${role}@${slug}.terrabrew.com`)
    setPassword('Admin@2024')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full" />
                <Coffee className="relative h-10 w-10 text-emerald-300" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Terra Brew</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">
              End-to-End Coffee<br />
              <span className="text-gradient-emerald bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                Traceability Platform
              </span>
            </h1>
            <p className="text-emerald-200/80 text-lg mb-8 max-w-md">
              Multi-tenant agricultural traceability with organic certification, supply chain tracking, and EUDR compliance.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Countries', value: '4+', icon: Globe },
                { label: 'Farmers', value: '2,500+', icon: Leaf },
                { label: 'Batches', value: '10K+', icon: Coffee },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-emerald-300" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-emerald-200/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full" />
              <Coffee className="relative h-8 w-8 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-foreground">Terra Brew</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={tenantSlug} onValueChange={setTenantSlug}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your organization..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t: any) => (
                    <SelectItem key={t.id} value={t.slug}>
                      {t.name} ({t.countryCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@organization.terrabrew.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={loading || !tenantSlug}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-8">
            <p className="text-xs text-muted-foreground mb-3 text-center">Quick demo access:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { slug: 'metrang-coffee', role: 'tenant_admin', label: 'Vietnam Admin' },
                { slug: 'yirgacheffe-union', role: 'aggregator', label: 'Ethiopia Agg.' },
                { slug: 'nyeri-cooperative', role: 'processor', label: 'Kenya Processor' },
                { slug: 'huila-coffee', role: 'exporter', label: 'Colombia Export' },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => fillDemo(d.slug, d.role)}
                  className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors text-muted-foreground truncate"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

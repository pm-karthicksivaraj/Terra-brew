'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { login } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster, toast } from 'sonner'
import { Leaf, ArrowLeft, Loader2 } from 'lucide-react'

export function LoginView() {
  const { selectedModule, setCurrentView, setCurrentUser, setSelectedModule } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      const user = await login({ email, password, moduleId: selectedModule!.id })
      setCurrentUser(user)
      setCurrentView('dashboard')
      toast.success(`Welcome back, ${user.name}!`)
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to <span className="font-medium text-emerald-700">{selectedModule?.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Button
              variant="link"
              className="p-0 h-auto text-emerald-600"
              onClick={() => setCurrentView('register')}
            >
              Create Account
            </Button>
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground"
              onClick={() => {
                setSelectedModule(null)
                setCurrentView('module-select')
              }}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to Modules
            </Button>
          </div>

          <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs font-medium text-emerald-800">Demo Credentials</p>
            <p className="mt-1 text-xs text-emerald-600">
              Seed demo data first, then use the provided email/password.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

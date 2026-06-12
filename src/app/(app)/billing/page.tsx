'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, XCircle, CreditCard, Crown, Zap, Building2, ExternalLink, Loader2, FileText, Receipt } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  icon: typeof Zap
  color: string
  bgColor: string
  features: string[]
  popular?: boolean
  featureList?: { name: string; included: boolean }[]
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$99',
    period: '/mo',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['5 users', '100 farmers', 'Basic EUDR compliance', 'Email support', '60 API calls/min'],
    featureList: [
      { name: 'Users', included: true }, { name: 'Farmers (100)', included: true },
      { name: 'EUDR Compliance', included: true }, { name: 'Export Documents', included: false },
      { name: 'Shipment Tracking', included: false }, { name: 'Priority Support', included: false },
      { name: 'API Access & Webhooks', included: false }, { name: 'White Label', included: false },
      { name: 'Dedicated Support', included: false }, { name: '1000 API calls/min', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$299',
    period: '/mo',
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    features: ['25 users', '1,000 farmers', 'Full EUDR compliance', 'Export documents', 'Shipments tracking', 'Priority support', '300 API calls/min'],
    popular: true,
    featureList: [
      { name: 'Users (25)', included: true }, { name: 'Farmers (1,000)', included: true },
      { name: 'EUDR Compliance', included: true }, { name: 'Export Documents', included: true },
      { name: 'Shipment Tracking', included: true }, { name: 'Priority Support', included: true },
      { name: 'API Access & Webhooks', included: true }, { name: 'White Label', included: false },
      { name: 'Dedicated Support', included: false }, { name: '1000 API calls/min', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$799',
    period: '/mo',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Unlimited users', 'Unlimited farmers', 'Full platform access', 'API access & webhooks', 'White label', 'Dedicated support', '1,000 API calls/min'],
    featureList: [
      { name: 'Unlimited Users', included: true }, { name: 'Unlimited Farmers', included: true },
      { name: 'EUDR Compliance', included: true }, { name: 'Export Documents', included: true },
      { name: 'Shipment Tracking', included: true }, { name: 'Priority Support', included: true },
      { name: 'API Access & Webhooks', included: true }, { name: 'White Label', included: true },
      { name: 'Dedicated Support', included: true }, { name: '1000 API calls/min', included: true },
    ],
  },
]

const FEATURE_COMPARISON = [
  { name: 'Users', starter: '5', professional: '25', enterprise: 'Unlimited' },
  { name: 'Farmers', starter: '100', professional: '1,000', enterprise: 'Unlimited' },
  { name: 'EUDR Compliance', starter: true, professional: true, enterprise: true },
  { name: 'Export Documents', starter: false, professional: true, enterprise: true },
  { name: 'Shipment Tracking', starter: false, professional: true, enterprise: true },
  { name: 'Trading Desk', starter: false, professional: true, enterprise: true },
  { name: 'Priority Support', starter: false, professional: true, enterprise: true },
  { name: 'API Access', starter: false, professional: true, enterprise: true },
  { name: 'Webhooks', starter: false, professional: true, enterprise: true },
  { name: 'White Label', starter: false, professional: false, enterprise: true },
  { name: 'Dedicated Support', starter: false, professional: false, enterprise: true },
  { name: 'API Rate Limit', starter: '60/min', professional: '300/min', enterprise: '1,000/min' },
]

export default function BillingPage() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<string>('stripe')

  useEffect(() => { loadSubscription() }, [])

  async function loadSubscription() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/subscription')
      const data = await res.json()
      if (data.success) setSubscription(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout(planId: string) {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, provider: paymentProvider }),
      })
      const data = await res.json()
      if (data.success && data.data?.url) {
        window.open(data.data.url, '_blank')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.success && data.data?.url) window.open(data.data.url, '_blank')
    } catch (e) { console.error(e) }
  }

  async function handleCancel() {
    try {
      await fetch('/api/billing/cancel', { method: 'POST' })
      loadSubscription()
    } catch (e) { console.error(e) }
  }

  const currentPlan = subscription?.plan || 'starter'
  const status = subscription?.status || 'inactive'

  return (
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" /> Billing & Subscription
              </h1>
              <p className="text-sm text-muted-foreground">Manage your subscription plan and billing</p>
            </div>
            {subscription?.provider === 'stripe' && status === 'active' && (
              <Button variant="outline" onClick={handlePortal} className="gap-2"><ExternalLink className="w-4 h-4" /> Manage Billing</Button>
            )}
          </div>
        </FadeIn>

        {/* Current Plan */}
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10"><CreditCard className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-lg">Current Plan: <span className="capitalize">{currentPlan}</span></h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : status === 'trialing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {status}
                      </Badge>
                      {subscription?.provider && <span className="text-xs text-muted-foreground">via {subscription.provider}</span>}
                      {subscription?.currentPeriodEnd && (
                        <span className="text-xs text-muted-foreground">
                          Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {status === 'active' && (
                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancel}>Cancel</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Plan Cards</TabsTrigger>
            <TabsTrigger value="comparison">Feature Comparison</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Payment Method Selector */}
            <FadeIn>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Payment Method:</span>
                <Select value={paymentProvider} onValueChange={setPaymentProvider}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FadeIn>

            {/* Plan Cards */}
            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => {
                const Icon = plan.icon
                const isCurrent = currentPlan === plan.id
                return (
                  <StaggerItem key={plan.id}>
                    <MotionCard {...hoverScale} className={`relative ${plan.popular ? 'border-primary shadow-md' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                      {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-primary-foreground">Most Popular</Badge></div>}
                      <CardHeader className="text-center pb-2">
                        <div className={`mx-auto p-3 rounded-xl ${plan.bgColor} w-fit`}><Icon className={`w-6 h-6 ${plan.color}`} /></div>
                        <CardTitle className="mt-3">{plan.name}</CardTitle>
                        <div className="mt-2"><span className="text-3xl font-bold">{plan.price}</span><span className="text-muted-foreground">{plan.period}</span></div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}</li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          variant={isCurrent ? 'outline' : 'default'}
                          disabled={isCurrent || checkoutLoading === plan.id}
                          onClick={() => handleCheckout(plan.id)}
                        >
                          {isCurrent ? 'Current Plan' : checkoutLoading === plan.id ? 'Processing...' : currentPlan === 'enterprise' && plan.id !== 'enterprise' ? 'Downgrade' : 'Subscribe'}
                        </Button>
                      </CardContent>
                    </MotionCard>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="comparison">
            <FadeIn>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Feature</th>
                          <th className="text-center p-4 font-medium">Starter ($99)</th>
                          <th className="text-center p-4 font-medium bg-primary/5">Professional ($299)</th>
                          <th className="text-center p-4 font-medium">Enterprise ($799)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FEATURE_COMPARISON.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="p-4 font-medium">{row.name}</td>
                            {(['starter', 'professional', 'enterprise'] as const).map(plan => (
                              <td key={plan} className={`text-center p-4 ${plan === 'professional' ? 'bg-primary/5' : ''}`}>
                                {typeof row[plan] === 'boolean' ? (
                                  row[plan] ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                                ) : (
                                  <span className="text-sm">{row[plan]}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          <TabsContent value="invoices">
            <FadeIn>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4" /> Invoice History</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No invoices yet</p>
                    <p className="text-xs mt-1">Invoices will appear here after your first payment</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>
        </Tabs>
      </div>
  )
}

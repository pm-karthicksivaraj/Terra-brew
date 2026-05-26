'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Plus, Mail, Phone, MapPin, Globe,
  Search, FileText, Handshake,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { SensitiveField } from '@/components/ui/sensitive-field'

const MOCK_BUYERS = [
  { id: '1', buyerCode: 'BUY-001', companyName: 'European Coffee Roasters GmbH', contactPerson: 'Hans Mueller', email: 'hans@eurocoffee.de', phone: '+49 30 1234567', city: 'Berlin', country: 'Germany', euRegistration: true },
  { id: '2', buyerCode: 'BUY-002', companyName: 'Dutch Import BV', contactPerson: 'Jan van der Berg', email: 'jan@dutchimport.nl', phone: '+31 20 9876543', city: 'Amsterdam', country: 'Netherlands', euRegistration: true },
  { id: '3', buyerCode: 'BUY-003', companyName: 'Café Français SAS', contactPerson: 'Pierre Dupont', email: 'pierre@cafefr.fr', phone: '+33 1 5551234', city: 'Paris', country: 'France', euRegistration: true },
  { id: '4', buyerCode: 'BUY-004', companyName: 'Tokyo Coffee Trading Co.', contactPerson: 'Yuki Tanaka', email: 'yuki@tokyocoffee.jp', phone: '+81 3 12345678', city: 'Tokyo', country: 'Japan', euRegistration: false },
  { id: '5', buyerCode: 'BUY-005', companyName: 'Nordic Roasters AB', contactPerson: 'Erik Lindqvist', email: 'erik@nordicroast.se', phone: '+46 8 7654321', city: 'Stockholm', country: 'Sweden', euRegistration: true },
  { id: '6', buyerCode: 'BUY-006', companyName: 'Italian Espresso Imports Srl', contactPerson: 'Marco Rossi', email: 'marco@itcoffee.it', phone: '+39 06 1122334', city: 'Rome', country: 'Italy', euRegistration: true },
]

export default function BuyersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [buyers, setBuyers] = useState(MOCK_BUYERS)

  useEffect(() => {
    fetch('/api/buyers')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || []
        if (items.length > 0) setBuyers(items)
      })
      .catch(() => {})
  }, [])

  const filtered = buyers.filter(b =>
    b.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.country?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">Buyers</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage coffee buyers and trading partners</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" /> Add Buyer
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Summary */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Buyers', value: buyers.length, icon: Building2, gradient: 'kpi-emerald' },
          { title: 'EU Registered', value: buyers.filter(b => b.euRegistration).length, icon: Globe, gradient: 'kpi-teal' },
          { title: 'Active Contracts', value: 12, icon: Handshake, gradient: 'kpi-amber' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <StaggerItem key={kpi.title}>
              <AnimatedCard>
                <Card className="card-lift overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className={`h-8 w-8 rounded-lg ${kpi.gradient} flex items-center justify-center mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Buyer Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((buyer, idx) => (
          <FadeIn key={buyer.id} delay={0.05 * idx}>
            <Card className="card-lift border-0 shadow-sm hover:ring-2 hover:ring-emerald-500/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{buyer.companyName}</p>
                    <p className="text-xs text-muted-foreground">{buyer.buyerCode}</p>
                  </div>
                  {buyer.euRegistration && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">EU</Badge>
                  )}
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 shrink-0" />
                    <SensitiveField value={buyer.email} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 shrink-0" />
                    <SensitiveField value={buyer.phone} />
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{buyer.city}, {buyer.country}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <FileText className="h-3 w-3 mr-1" /> Contracts
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Handshake className="h-3 w-3 mr-1" /> Deals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}

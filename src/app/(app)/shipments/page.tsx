'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Ship, Plus, MapPin, Calendar, CheckCircle2, Clock,
  Truck, Anchor, FileText, Search, Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem } from '@/components/ui/animations'

const MOCK_SHIPMENTS = [
  { id: 'SHP-001', shipmentId: 'SH-2024-001', status: 'in_transit', originCountry: 'Vietnam', destinationCountry: 'Germany', vesselName: 'MSC Isabella', containerNumber: 'MSCU-1234567', estimatedDeparture: '2024-02-15', estimatedArrival: '2024-03-20', totalWeightKg: 18500, commodity: 'coffee', grade: 'Premium' },
  { id: 'SHP-002', shipmentId: 'SH-2024-002', status: 'delivered', originCountry: 'Vietnam', destinationCountry: 'Netherlands', vesselName: 'Maersk Elba', containerNumber: 'MAEU-7654321', estimatedDeparture: '2024-01-10', estimatedArrival: '2024-02-15', totalWeightKg: 22000, commodity: 'coffee', grade: 'Specialty' },
  { id: 'SHP-003', shipmentId: 'SH-2024-003', status: 'planned', originCountry: 'Ethiopia', destinationCountry: 'France', vesselName: 'TBD', containerNumber: 'TBD', estimatedDeparture: '2024-03-01', estimatedArrival: '2024-04-10', totalWeightKg: 12000, commodity: 'coffee', grade: 'Grade A' },
  { id: 'SHP-004', shipmentId: 'SH-2024-004', status: 'booked', originCountry: 'Kenya', destinationCountry: 'Italy', vesselName: 'CMA Marco Polo', containerNumber: 'CMAU-9876543', estimatedDeparture: '2024-03-05', estimatedArrival: '2024-04-12', totalWeightKg: 8000, commodity: 'coffee', grade: 'AA' },
  { id: 'SHP-005', shipmentId: 'SH-2024-005', status: 'arrived', originCountry: 'Colombia', destinationCountry: 'Belgium', vesselName: 'Hapag Express', containerNumber: 'HLCU-1122334', estimatedDeparture: '2024-02-01', estimatedArrival: '2024-03-08', totalWeightKg: 15000, commodity: 'coffee', grade: 'Supremo' },
]

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-700',
  booked: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-amber-100 text-amber-700',
  arrived: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusIcons: Record<string, React.ElementType> = {
  planned: Globe,
  booked: Anchor,
  in_transit: Truck,
  arrived: MapPin,
  delivered: CheckCircle2,
  cancelled: Clock,
}

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS)

  useEffect(() => {
    fetch('/api/shipments')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || []
        if (items.length > 0) setShipments(items)
      })
      .catch(() => {})
  }, [])

  const filtered = shipments.filter(s =>
    (s.shipmentId || s.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.originCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destinationCountry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">Shipments</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage EU-bound coffee shipments & logistics</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" /> New Shipment
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Status Summary */}
      <StaggerContainer className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {['planned', 'booked', 'in_transit', 'arrived', 'delivered', 'cancelled'].map(status => {
          const Icon = statusIcons[status] || Globe
          const count = shipments.filter(s => s.status === status).length
          return (
            <StaggerItem key={status}>
              <Card className="card-lift border-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-500/20">
                <CardContent className="p-3 text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{status.replace('_', ' ')}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Shipment Cards */}
      <div className="space-y-3">
        {filtered.map((shipment, idx) => {
          const StatusIcon = statusIcons[shipment.status] || Globe
          return (
            <FadeIn key={shipment.id} delay={0.05 * idx}>
              <Card className="card-lift border-0 shadow-sm hover:ring-2 hover:ring-emerald-500/10">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      shipment.status === 'delivered' ? 'bg-emerald-100' :
                      shipment.status === 'in_transit' ? 'bg-amber-100' : 'bg-muted'
                    }`}>
                      <Ship className={`h-6 w-6 ${
                        shipment.status === 'delivered' ? 'text-emerald-600' :
                        shipment.status === 'in_transit' ? 'text-amber-600' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{shipment.shipmentId || shipment.id}</p>
                        <Badge className={`text-[10px] ${statusColors[shipment.status] || 'bg-gray-100 text-gray-700'}`}>
                          {shipment.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {shipment.originCountry} → {shipment.destinationCountry}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          {shipment.vesselName || 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          ETD: {shipment.estimatedDeparture ? new Date(shipment.estimatedDeparture).toLocaleDateString() : 'TBD'}
                        </span>
                        <span className="font-mono">
                          {(shipment.totalWeightKg || 0).toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3.5 w-3.5 mr-1" /> Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )
        })}
      </div>
    </div>
  )
}

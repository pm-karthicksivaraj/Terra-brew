'use client'

import { Building2, MapPin, Phone, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { StepProps, OrganizationData } from '../types'

const COUNTRIES = [
  { value: 'VN', label: 'Vietnam' },
  { value: 'BR', label: 'Brazil' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'KE', label: 'Kenya' },
  { value: 'CO', label: 'Colombia' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'DE', label: 'Germany' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'JP', label: 'Japan' },
  { value: 'AU', label: 'Australia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'UG', label: 'Uganda' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'PE', label: 'Peru' },
  { value: 'HN', label: 'Honduras' },
  { value: 'IN', label: 'India' },
  { value: 'OTHER', label: 'Other' },
]

export function OrganizationStep({ data, onChange }: StepProps<OrganizationData>) {
  const update = (field: keyof OrganizationData, value: string) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card className="border-coffee-200/60 bg-white/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-coffee-900 text-lg">Organization Details</CardTitle>
              <CardDescription className="text-coffee-500 text-sm">
                Tell us about your organization so we can set up your account correctly.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Legal Name & Tax ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalName" className="text-coffee-700 text-sm font-medium">
                Legal Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="legalName"
                value={data.legalName}
                onChange={(e) => update('legalName', e.target.value)}
                placeholder="e.g. Metrang Coffee Joint Stock Company"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-coffee-700 text-sm font-medium">
                Tax ID / Registration Number
              </Label>
              <Input
                id="taxId"
                value={data.taxId}
                onChange={(e) => update('taxId', e.target.value)}
                placeholder="e.g. 0123456789"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="e.g. 123 Coffee Street, District 1"
              className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-coffee-700 text-sm font-medium">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="e.g. Ho Chi Minh City"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-coffee-700 text-sm font-medium">
                State / Province
              </Label>
              <Input
                id="state"
                value={data.state}
                onChange={(e) => update('state', e.target.value)}
                placeholder="e.g. Dong Nai"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-coffee-700 text-sm font-medium">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                value={data.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
                placeholder="e.g. 700000"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-coffee-700 text-sm font-medium">
              Country <span className="text-red-500">*</span>
            </Label>
            <select
              id="country"
              value={data.country}
              onChange={(e) => update('country', e.target.value)}
              className="w-full h-11 bg-coffee-50/50 border border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl px-3 text-sm text-coffee-900 appearance-none cursor-pointer"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="e.g. +84 28 1234 5678"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-coffee-700 text-sm font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Website
              </Label>
              <Input
                id="website"
                value={data.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="e.g. https://metrang-coffee.vn"
                className="bg-coffee-50/50 border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500/20 rounded-xl h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

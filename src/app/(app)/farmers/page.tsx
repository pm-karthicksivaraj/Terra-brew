'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, Plus, Phone, MapPin, Award, ChevronLeft, ChevronRight,
  Loader2, Filter, Download, Eye, Trash2, CheckCircle2, XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────

interface Farmer {
  id: string
  fullName: string
  farmerCode?: string
  contactNumber: string
  province?: string
  district?: string
  isCertified: boolean
  creditScore?: number
  enrollmentDate: string
  _count?: { farmLands: number; cultivations: number }
}

interface FarmerListResponse {
  success: boolean
  data: Farmer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Add Farmer Dialog ───────────────────────────────────────────

function AddFarmerDialog({ open, onOpenChange, onCreated }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    farmerCode: '',
    province: '',
    district: '',
    gender: '',
  })

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.contactNumber.trim()) {
      toast.error('Full name and contact number are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success !== false) {
        toast.success('Farmer created successfully')
        setForm({ fullName: '', contactNumber: '', farmerCode: '', province: '', district: '', gender: '' })
        onOpenChange(false)
        onCreated()
      } else {
        toast.error(data.error || 'Failed to create farmer')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Add New Farmer
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName" className="text-xs font-medium">Full Name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Enter farmer's full name"
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contactNumber" className="text-xs font-medium">Contact Number *</Label>
              <Input
                id="contactNumber"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="+84..."
                className="text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="farmerCode" className="text-xs font-medium">Farmer Code</Label>
              <Input
                id="farmerCode"
                value={form.farmerCode}
                onChange={(e) => setForm({ ...form, farmerCode: e.target.value })}
                placeholder="Auto-generated if empty"
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="province" className="text-xs font-medium">Province</Label>
              <Input
                id="province"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                placeholder="e.g. Lâm Đồng"
                className="text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="district" className="text-xs font-medium">District</Label>
              <Input
                id="district"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="e.g. Đạ Huoai"
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender" className="text-xs font-medium">Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="text-sm">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting} className="text-sm gap-1.5">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create Farmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Farmers List Page ──────────────────────────────────────

export default function FarmersListPage() {
  const router = useRouter()
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const pageSize = 20

  const fetchFarmers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy: 'enrollmentDate',
        sortOrder: 'desc',
      })
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/farmers?${params}`)
      const data = await res.json()
      const farmersArr = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.data?.data) ? data.data.data : [])
      setFarmers(farmersArr)
      setTotal(data?.total ?? data?.data?.total ?? 0)
      setTotalPages(data?.totalPages ?? data?.data?.totalPages ?? 1)
    } catch (err) {
      console.error('Failed to fetch farmers:', err)
      toast.error('Failed to load farmers')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  // Debounced search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this farmer?')) return
    try {
      const res = await fetch(`/api/farmers?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success !== false) {
        toast.success('Farmer deactivated')
        fetchFarmers()
      } else {
        toast.error(data.error || 'Failed to deactivate farmer')
      }
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Farmer Management</h1>
              <p className="text-sm text-muted-foreground">
                {total} farmer{total !== 1 ? 's' : ''} registered
              </p>
            </div>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-1.5 text-sm">
            <Plus className="w-4 h-4" />
            Add Farmer
          </Button>
        </div>
      </FadeIn>

      {/* Search & Filters */}
      <FadeIn delay={0.1}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, code, or province..."
                  className="pl-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Page {page} of {totalPages}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Farmers Table */}
      <FadeIn delay={0.2}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">All Farmers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading farmers...</span>
                </div>
              </div>
            ) : farmers.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/40" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No farmers found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? 'Try a different search term' : 'Click "Add Farmer" to register the first farmer'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold">Code</TableHead>
                      <TableHead className="text-xs font-semibold hidden md:table-cell">Phone</TableHead>
                      <TableHead className="text-xs font-semibold hidden lg:table-cell">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Farms</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                      <TableHead className="text-xs font-semibold hidden sm:table-cell">Credit</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmers.map((farmer) => (
                      <TableRow
                        key={farmer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/farmers/${farmer.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {farmer.fullName?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[180px]">{farmer.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(farmer.enrollmentDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {farmer.farmerCode || '—'}
                          </code>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{farmer.contactNumber || '—'}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {farmer.district ? `${farmer.district}, ` : ''}{farmer.province || '—'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {farmer._count?.farmLands ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {farmer.isCertified ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Certified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              <XCircle className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {farmer.creditScore ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(farmer.creditScore, 100)}%`,
                                    backgroundColor: farmer.creditScore >= 75 ? '#059669' : farmer.creditScore >= 50 ? '#d97706' : '#dc2626',
                                  }}
                                />
                              </div>
                              <span className="text-xs font-mono">{Math.round(farmer.creditScore)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => router.push(`/farmers/${farmer.id}`)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(farmer.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page + i - 2
                    if (pageNum > totalPages || pageNum < 1) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="h-7 w-7 p-0 text-xs"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Add Farmer Dialog */}
      <AddFarmerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={fetchFarmers}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useAppStore, type FarmerItem } from '@/lib/store'
import { getFarmers, deleteFarmer } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Toaster, toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react'

export function FarmersView() {
  const { selectedModule, farmers, setFarmers, setCurrentView, setSelectedFarmer, setIsLoading } = useAppStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!selectedModule) return
    setIsLoading(true)
    getFarmers(selectedModule.id)
      .then(setFarmers)
      .catch(() => toast.error('Failed to load farmers'))
      .finally(() => setIsLoading(false))
  }, [selectedModule, setFarmers, setIsLoading])

  const filtered = farmers.filter(
    (f) =>
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.farmerCode?.toLowerCase().includes(search.toLowerCase()) ||
      f.province?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this farmer?')) return
    try {
      await deleteFarmer(id)
      setFarmers(farmers.filter((f) => f.id !== id))
      toast.success('Farmer deleted')
    } catch {
      toast.error('Failed to delete farmer')
    }
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farmers</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} farmers registered</p>
        </div>
        <Button
          onClick={() => {
            setSelectedFarmer(null)
            setCurrentView('farmer-form')
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Farmer
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search farmers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50/50">
                  <TableHead className="text-xs font-semibold text-emerald-800">Code</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden md:table-cell">Contact</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden lg:table-cell">Gender</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden lg:table-cell">Province</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800">Certified</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden xl:table-cell">Score</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
                      <p className="mt-2 text-sm text-muted-foreground">No farmers found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((farmer) => (
                    <TableRow key={farmer.id} className="hover:bg-emerald-50/30 cursor-pointer" onClick={() => {
                      setSelectedFarmer(farmer)
                      setCurrentView('farmer-form')
                    }}>
                      <TableCell className="font-mono text-xs">{farmer.farmerCode || '—'}</TableCell>
                      <TableCell className="font-medium">{farmer.fullName} {farmer.lastName}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{farmer.contactNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{farmer.gender || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{farmer.province || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={farmer.isCertified ? 'default' : 'secondary'} className={farmer.isCertified ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                          {farmer.isCertified ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {farmer.creditScore ? (
                          <Badge variant={farmer.creditScore >= 80 ? 'default' : 'secondary'} className={farmer.creditScore >= 80 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                            {farmer.creditScore}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFarmer(farmer)
                              setCurrentView('farmer-form')
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(farmer.id)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

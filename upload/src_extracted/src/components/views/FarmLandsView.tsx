'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { getFarmLands, deleteFarmLand } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Toaster, toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Map } from 'lucide-react'

export function FarmLandsView() {
  const { selectedModule, farmLands, setFarmLands, setCurrentView, setSelectedFarmLand, setIsLoading } = useAppStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!selectedModule) return
    setIsLoading(true)
    getFarmLands(selectedModule.id)
      .then(setFarmLands)
      .catch(() => toast.error('Failed to load farm lands'))
      .finally(() => setIsLoading(false))
  }, [selectedModule, setFarmLands, setIsLoading])

  const filtered = farmLands.filter(
    (f) =>
      f.farmName.toLowerCase().includes(search.toLowerCase()) ||
      f.farmer?.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this farm land?')) return
    try {
      await deleteFarmLand(id)
      setFarmLands(farmLands.filter((f) => f.id !== id))
      toast.success('Farm land deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farm Lands</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} farm lands registered</p>
        </div>
        <Button
          onClick={() => {
            setSelectedFarmLand(null)
            setCurrentView('farmland-form')
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Farm Land
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search farm lands..."
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
                  <TableHead className="text-xs font-semibold text-emerald-800">Farm Name</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden md:table-cell">Farmer</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden lg:table-cell">Area (ha)</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden lg:table-cell">Ownership</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 hidden xl:table-cell">Water Source</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-800 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Map className="mx-auto h-8 w-8 text-muted-foreground/30" />
                      <p className="mt-2 text-sm text-muted-foreground">No farm lands found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((fl) => (
                    <TableRow key={fl.id} className="hover:bg-emerald-50/30 cursor-pointer" onClick={() => {
                      setSelectedFarmLand(fl)
                      setCurrentView('farmland-form')
                    }}>
                      <TableCell className="font-medium">{fl.farmName}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {fl.farmer ? `${fl.farmer.fullName} ${fl.farmer.lastName}` : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{fl.totalLandHolding || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{fl.landOwnership || '—'}</TableCell>
                      <TableCell className="hidden xl:table-cell">{fl.waterSource || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          fl.currentConversionStatus === 'Certified'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : fl.currentConversionStatus === 'In Conversion'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : ''
                        }>
                          {fl.currentConversionStatus || 'New'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFarmLand(fl)
                            setCurrentView('farmland-form')
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(fl.id)
                          }}>
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

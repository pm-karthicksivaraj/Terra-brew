import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  const chart = searchParams.get('chart')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  try {
    if (chart === 'farmersPerProvince') {
      const result = await db.farmer.groupBy({
        by: ['province'],
        where: { moduleId, isActive: true, province: { not: null } },
        _count: true,
      })
      return NextResponse.json(result.map((r: any) => ({ name: r.province || 'Unknown', value: r._count })))
    }

    if (chart === 'cultivationsByCrop') {
      const result = await db.cultivation.groupBy({
        by: ['cultivatedCrop'],
        where: { moduleId, isActive: true, cultivatedCrop: { not: null } },
        _count: true,
      })
      return NextResponse.json(result.map((r: any) => ({ name: r.cultivatedCrop || 'Unknown', value: r._count })))
    }

    if (chart === 'harvestTrends') {
      const records = await db.harvestTraceability.findMany({
        where: { moduleId, isActive: true, actualHarvestDate: { not: null } },
        select: { actualHarvestDate: true },
      })
      const monthMap: Record<string, number> = {}
      for (const r of records) {
        if (r.actualHarvestDate) {
          const d = new Date(r.actualHarvestDate)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          monthMap[key] = (monthMap[key] || 0) + 1
        }
      }
      return NextResponse.json(
        Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, value]) => ({ name, value }))
      )
    }

    if (chart === 'processingByStage') {
      const result = await db.processingStageRecord.groupBy({
        by: ['stageType'],
        where: { moduleId, isActive: true },
        _count: true,
      })
      return NextResponse.json(result.map((r: any) => ({ name: r.stageType || 'Unknown', value: r._count })))
    }

    return NextResponse.json({ message: 'Invalid chart type' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

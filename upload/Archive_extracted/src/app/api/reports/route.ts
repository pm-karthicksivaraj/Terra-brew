import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const [
    totalFarmers, certifiedFarmers, totalFarmLands, totalCultivations,
    totalNurseries, totalLandPreps, totalCropMonitors, totalFertilizerApps,
    totalPestMgmts, totalHarvestTraces, totalSmartContracts, totalMarketplaceListings,
    totalInspections,
    harvestByMonth, processingStageDist, certOutcomes,
    farmersByProvince, avgYieldData, recentActivities, pestDiseaseSummary,
  ] = await Promise.all([
    prisma.farmer.count({ where: { moduleId } }),
    prisma.farmer.count({ where: { moduleId, isCertified: true } }),
    prisma.farmLand.count({ where: { moduleId } }),
    prisma.cultivation.count({ where: { moduleId } }),
    prisma.nursery.count({ where: { moduleId } }),
    prisma.landPreparation.count({ where: { moduleId } }),
    prisma.cropMonitoring.count({ where: { moduleId } }),
    prisma.fertilizerApplication.count({ where: { moduleId } }),
    prisma.pestDiseaseManagement.count({ where: { moduleId } }),
    prisma.harvestTraceability.count({ where: { moduleId } }),
    prisma.smartContract.count({ where: { moduleId } }),
    prisma.marketplaceListing.count({ where: { moduleId } }),
    prisma.coffeeInspection.count({ where: { moduleId } }),

    // Harvest by month
    prisma.harvestTraceability.groupBy({
      by: ['actualHarvestDate'],
      where: { moduleId },
      _count: true,
    }),

    // Processing stage distribution
    prisma.harvestTraceability.groupBy({
      by: ['processingStage'],
      where: { moduleId },
      _count: true,
    }),

    // Certification outcomes (from unified model)
    prisma.coffeeInspection.groupBy({
      by: ['certStatus'],
      where: { moduleId },
      _count: true,
    }),

    // Farmers by province
    prisma.farmer.groupBy({
      by: ['province'],
      where: { moduleId },
      _count: true,
    }),

    // Average yield data
    prisma.harvestTraceability.findMany({
      where: { moduleId, estimatedYieldPerHa: { not: null } },
      select: { estimatedYieldPerHa: true, batchId: true, actualHarvestDate: true },
      take: 50,
    }),

    // Recent activities (from coffee inspections)
    prisma.coffeeInspection.findMany({
      where: { moduleId },
      include: { farmer: { select: { fullName: true } }, cultivation: { select: { farmPlotName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),

    // Pest & Disease summary
    prisma.pestDiseaseManagement.findMany({
      where: { moduleId },
      select: { scoutingDate: true, pestIdentified: true, diseaseIdentified: true, severityLevel: true, treatmentType: true },
      take: 50,
    }),
  ])

  // Format harvest by month
  const harvestMonthly = harvestByMonth.reduce((acc: Record<string, number>, item) => {
    if (item.actualHarvestDate) {
      const month = new Date(item.actualHarvestDate).toLocaleString('default', { month: 'short', year: '2-digit' })
      acc[month] = (acc[month] || 0) + item._count
    }
    return acc
  }, {})

  // Format processing stages
  const processingStages = processingStageDist.map(s => ({
    name: s.processingStage || 'Unknown',
    value: s._count,
  }))

  // Format cert outcomes
  const certOutcomesData = certOutcomes.map(s => ({
    name: s.certStatus || 'Unknown',
    value: s._count,
  }))

  // Format farmers by province
  const farmersProvince = farmersByProvince
    .filter(f => f.province)
    .map(f => ({ name: f.province!, value: f._count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return NextResponse.json({
    summary: {
      totalFarmers, certifiedFarmers, totalFarmLands, totalCultivations,
      totalNurseries, totalLandPreps, totalCropMonitors, totalFertilizerApps,
      totalPestMgmts, totalHarvestTraces, totalSmartContracts, totalMarketplaceListings,
      totalInspections,
    },
    charts: {
      harvestMonthly,
      processingStages,
      certOutcomes: certOutcomesData,
      farmersProvince,
      avgYield: avgYieldData.filter(y => y.estimatedYieldPerHa).map(y => ({
        batchId: y.batchId,
        yield: y.estimatedYieldPerHa,
        date: y.actualHarvestDate,
      })),
      pestDisease: {
        totalScouted: pestDiseaseSummary.length,
        withPest: pestDiseaseSummary.filter(p => p.pestIdentified).length,
        withDisease: pestDiseaseSummary.filter(p => p.diseaseIdentified).length,
        bySeverity: pestDiseaseSummary.reduce((acc: Record<string, number>, p) => {
          const s = p.severityLevel || 'Unknown'
          acc[s] = (acc[s] || 0) + 1
          return acc
        }, {}),
      },
    },
    recentActivities,
  })
  } catch (error: any) {
    console.error('Reports API error:', error)
    return NextResponse.json({ message: error.message || 'Failed to generate reports' }, { status: 500 })
  }
}

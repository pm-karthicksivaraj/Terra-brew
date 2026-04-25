import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper: safely run a Prisma query and return fallback on error
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() }
  catch (e) {
    console.error('[Dashboard Stats] safe() caught:', (e as Error)?.message || e)
    return fallback
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  try {
    // ── Core stat counters (all wrapped in safe) ──
    const [
      totalFarmers,
      totalFarmLands,
      totalCultivations,
      totalHarvestRecords,
      activeCertifications,
      totalProcurementRecords,
      totalMarketplaceListings,
      completedProcessingStages,
      avgScore,
      avgCupScore,
      totalCherryAgg,
      totalPurchaseAgg,
    ] = await Promise.all([
      safe(() => db.farmer.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.farmLand.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.cultivation.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.harvestTraceability.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.certAssessment.count({ where: { moduleId, certificationOutcome: { contains: 'Recommended' } } }), 0),
      safe(() => db.procurementRecord.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.marketplaceListing.count({ where: { moduleId } }), 0),
      safe(() => db.processingStageRecord.count({ where: { moduleId } }), 0),
      safe(() => db.farmer.aggregate({
        where: { moduleId, isActive: true, creditScore: { not: null } },
        _avg: { creditScore: true },
      }), { _avg: { creditScore: null } }),
      safe(() => db.harvestTraceability.aggregate({
        where: { moduleId, isActive: true, cupScore: { not: null } },
        _avg: { cupScore: true },
      }), { _avg: { cupScore: null } }),
      safe(() => db.harvestTraceability.aggregate({
        where: { moduleId, isActive: true },
        _sum: { sampleWeight: true },
      }), { _sum: { sampleWeight: null } }),
      safe(() => db.procurementRecord.aggregate({
        where: { moduleId, isActive: true },
        _sum: { totalPurchaseAmount: true },
      }), { _sum: { totalPurchaseAmount: null } }),
    ])

    // ── Extended counters (safe — returns 0 on error) ──
    const [
      totalNurseries,
      totalCropMonitorings,
      totalLandPreps,
      totalFertilizerApps,
      totalPestMgmts,
      totalSmartContracts,
      totalInspections,
      totalCollectionCentres,
      certifiedFarmersCount,
    ] = await Promise.all([
      safe(() => db.nursery.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.cropMonitoring.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.landPreparation.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.fertilizerApplication.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.pestDiseaseManagement.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.smartContract.count({ where: { moduleId } }), 0),
      safe(() => db.coffeeInspection.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.collectionCentre.count({ where: { moduleId, isActive: true } }), 0),
      safe(() => db.farmer.count({ where: { moduleId, isActive: true, isCertified: true } }), 0),
    ])

    // ── Financial Aggregates (safe) ──
    const [
      avgPriceAgg,
      totalNetWeightAgg,
      procurementPaidCount,
      procurementPendingCount,
      totalMarketplaceValue,
      smartContractOpenCount,
      smartContractClosedCount,
      totalLandAreaAgg,
    ] = await Promise.all([
      safe(() => db.procurementRecord.aggregate({
        where: { moduleId, isActive: true, purchasePricePerKg: { not: null } },
        _avg: { purchasePricePerKg: true },
      }), { _avg: { purchasePricePerKg: null } }),
      safe(() => db.procurementRecord.aggregate({
        where: { moduleId, isActive: true },
        _sum: { netWeight: true },
      }), { _sum: { netWeight: null } }),
      safe(() => db.procurementRecord.count({ where: { moduleId, isActive: true, paymentStatus: 'Paid' } }), 0),
      safe(() => db.procurementRecord.count({ where: { moduleId, isActive: true, paymentStatus: 'Pending' } }), 0),
      safe(() => db.marketplaceListing.aggregate({
        where: { moduleId, availableQty: { not: null }, pricePerKg: { not: null } },
        _sum: { availableQty: true },
        _avg: { pricePerKg: true },
      }), { _sum: { availableQty: null }, _avg: { pricePerKg: null } }),
      safe(() => db.smartContract.count({ where: { moduleId, status: 'Open' } }), 0),
      safe(() => db.smartContract.count({ where: { moduleId, status: 'Closed' } }), 0),
      safe(() => db.farmLand.aggregate({
        where: { moduleId, isActive: true, totalLandHolding: { not: null } },
        _sum: { totalLandHolding: true },
      }), { _sum: { totalLandHolding: null } }),
    ])

    // ── Chart & detail data (safe) ──
    const [
      farmersPerProvince,
      cultivationsByCrop,
      processingByStage,
      recentProcurements,
      recentMarketplace,
      harvestMonthly,
      procurementMonthly,
      certByType,
      cropAlerts,
      recentInspections,
    ] = await Promise.all([
      safe(() => db.farmer.groupBy({
        by: ['province'],
        where: { moduleId, isActive: true, province: { not: null } },
        _count: { province: true },
        orderBy: { _count: { province: 'desc' } },
        take: 8,
      }), []),
      safe(() => db.cultivation.groupBy({
        by: ['cultivatedCrop'],
        where: { moduleId, isActive: true, cultivatedCrop: { not: null } },
        _count: { cultivatedCrop: true },
      }), []),
      safe(() => db.processingStageRecord.groupBy({
        by: ['stageType'],
        where: { moduleId },
        _count: { stageType: true },
        orderBy: { _count: { stageType: 'desc' } },
      }), []),
      safe(() => db.procurementRecord.findMany({
        where: { moduleId, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          farmer: { select: { fullName: true } },
          collectionCentre: { select: { centreName: true } },
        },
      }), []),
      safe(() => db.marketplaceListing.findMany({
        where: { moduleId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }), []),
      safe(() => db.harvestTraceability.findMany({
        where: { moduleId, isActive: true, actualHarvestDate: { not: null } },
        select: { actualHarvestDate: true, sampleWeight: true, cupScore: true },
        orderBy: { actualHarvestDate: 'asc' },
        take: 100,
      }), []),
      safe(() => db.procurementRecord.findMany({
        where: { moduleId, isActive: true, procurementDate: { not: null } },
        select: { procurementDate: true, netWeight: true, totalPurchaseAmount: true },
        orderBy: { procurementDate: 'asc' },
        take: 100,
      }), []),
      safe(() => db.certAssessment.groupBy({
        by: ['certificationStandard'],
        where: { moduleId, certificationStandard: { not: null } },
        _count: { certificationStandard: true },
      }), []),
      safe(() => db.cropMonitoring.findMany({
        where: { moduleId, isActive: true, alertTriggered: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }), []),
      safe(() => db.coffeeInspection.findMany({
        where: { moduleId, isActive: true },
        orderBy: { inspectionDate: 'desc' },
        take: 5,
        include: { farmer: { select: { fullName: true } } },
      }), []),
    ])

    // ── Process monthly harvest data ──
    const harvestMonthMap: Record<string, { count: number; weight: number; cupScores: number[] }> = {}
    for (const r of harvestMonthly) {
      if (r.actualHarvestDate) {
        const d = new Date(r.actualHarvestDate)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!harvestMonthMap[key]) harvestMonthMap[key] = { count: 0, weight: 0, cupScores: [] }
        harvestMonthMap[key].count++
        harvestMonthMap[key].weight += r.sampleWeight || 0
        if (r.cupScore) harvestMonthMap[key].cupScores.push(r.cupScore)
      }
    }
    const harvestTrends = Object.entries(harvestMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month,
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        harvests: data.count,
        weight: Math.round(data.weight),
        avgCupScore: data.cupScores.length > 0 ? Math.round((data.cupScores.reduce((a, b) => a + b, 0) / data.cupScores.length) * 10) / 10 : 0,
      }))

    // ── Process monthly procurement data ──
    const procMonthMap: Record<string, { count: number; weight: number; amount: number }> = {}
    for (const r of procurementMonthly) {
      if (r.procurementDate) {
        const d = new Date(r.procurementDate)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!procMonthMap[key]) procMonthMap[key] = { count: 0, weight: 0, amount: 0 }
        procMonthMap[key].count++
        procMonthMap[key].weight += r.netWeight || 0
        procMonthMap[key].amount += r.totalPurchaseAmount || 0
      }
    }
    const procurementTrends = Object.entries(procMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month,
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        procurements: data.count,
        weight: Math.round(data.weight),
        amount: Math.round(data.amount),
      }))

    // ── Quality Score Distribution ──
    const qualityDist: Record<string, number> = { 'Excellent (85+)': 0, 'Good (75-84)': 0, 'Fair (60-74)': 0, 'Below (<60)': 0 }
    for (const h of harvestMonthly) {
      if (h.cupScore) {
        if (h.cupScore >= 85) qualityDist['Excellent (85+)']++
        else if (h.cupScore >= 75) qualityDist['Good (75-84)']++
        else if (h.cupScore >= 60) qualityDist['Fair (60-74)']++
        else qualityDist['Below (<60)']++
      }
    }
    const qualityDistribution = Object.entries(qualityDist).map(([name, value]) => ({ name, value }))

    // ── Build the response ──
    const responseData = {
      // ── Counters ──
      totalFarmers,
      totalFarmLands,
      totalCultivations,
      totalHarvestRecords,
      activeCertifications,
      totalProcurementRecords,
      totalMarketplaceListings,
      completedProcessingStages,
      totalNurseries,
      totalCropMonitorings,
      totalLandPreps,
      totalFertilizerApps,
      totalPestMgmts,
      totalSmartContracts,
      totalInspections,
      totalCollectionCentres,
      certifiedFarmersCount,

      // ── Aggregates ──
      avgCreditScore: avgScore._avg.creditScore ?? 0,
      avgCupScore: avgCupScore._avg.cupScore ?? 0,
      totalCherryWeight: totalCherryAgg._sum.sampleWeight ?? 0,
      totalPurchaseAmount: totalPurchaseAgg._sum.totalPurchaseAmount ?? 0,
      avgPricePerKg: avgPriceAgg._avg.purchasePricePerKg ?? 0,
      totalNetWeight: totalNetWeightAgg._sum.netWeight ?? 0,
      procurementPaidCount,
      procurementPendingCount,
      totalMarketplaceAvailableKg: totalMarketplaceValue._sum.availableQty ?? 0,
      avgMarketplacePrice: totalMarketplaceValue._avg.pricePerKg ?? 0,
      smartContractOpenCount,
      smartContractClosedCount,
      totalLandArea: totalLandAreaAgg._sum.totalLandHolding ?? 0,

      // ── Chart data ──
      farmersPerProvince,
      cultivationsByCrop,
      processingByStage,
      harvestTrends,
      procurementTrends,
      certByType,
      qualityDistribution,

      // ── Recent activity ──
      recentProcurements,
      recentMarketplace,
      cropAlerts,
      recentInspections,
    }

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('[Dashboard Stats] Unhandled error:', error)
    return NextResponse.json({
      // Return safe defaults so the dashboard always renders
      totalFarmers: 0, totalFarmLands: 0, totalCultivations: 0,
      totalHarvestRecords: 0, activeCertifications: 0,
      totalProcurementRecords: 0, totalMarketplaceListings: 0,
      completedProcessingStages: 0, totalNurseries: 0,
      totalCropMonitorings: 0, totalLandPreps: 0, totalFertilizerApps: 0,
      totalPestMgmts: 0, totalSmartContracts: 0, totalInspections: 0,
      totalCollectionCentres: 0, certifiedFarmersCount: 0,
      avgCreditScore: 0, avgCupScore: 0, totalCherryWeight: 0,
      totalPurchaseAmount: 0, avgPricePerKg: 0, totalNetWeight: 0,
      procurementPaidCount: 0, procurementPendingCount: 0,
      totalMarketplaceAvailableKg: 0, avgMarketplacePrice: 0,
      smartContractOpenCount: 0, smartContractClosedCount: 0, totalLandArea: 0,
      farmersPerProvince: [], cultivationsByCrop: [], processingByStage: [],
      harvestTrends: [], procurementTrends: [], certByType: [],
      qualityDistribution: [], recentProcurements: [], recentMarketplace: [],
      cropAlerts: [], recentInspections: [],
      message: error.message,
    }, { status: 200 })
  }
}

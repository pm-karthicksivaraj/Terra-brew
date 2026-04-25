import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'dashboard', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const currency = user!.currency || 'VND'

    const [
      totalFarmers, totalFarmLands, totalCultivations,
      totalHarvestRecords, totalProcurementRecords, totalMarketplaceListings,
      completedProcessingStages, totalNurseries, totalCropMonitorings,
      totalSmartContracts, totalInspections, totalCollectionCentres,
      certifiedFarmersCount, totalLandPreps, totalFertilizerApps, totalPestMgmts,
      activeCertifications, procurementPaidCount, procurementPendingCount,
    ] = await Promise.all([
      db.farmer.count({ where: { tenantId, isActive: true } }),
      db.farmLand.count({ where: { tenantId, isActive: true } }),
      db.cultivation.count({ where: { tenantId, isActive: true } }),
      db.harvestTraceability.count({ where: { tenantId, isActive: true } }),
      db.procurementRecord.count({ where: { tenantId, isActive: true } }),
      db.marketplaceListing.count({ where: { tenantId } }),
      db.processingStageRecord.count({ where: { tenantId, qualityCheckPassed: true } }),
      db.nursery.count({ where: { tenantId, isActive: true } }),
      db.cropMonitoring.count({ where: { tenantId, isActive: true } }),
      db.smartContract.count({ where: { tenantId } }),
      db.coffeeInspection.count({ where: { tenantId, isActive: true } }),
      db.collectionCentre.count({ where: { tenantId, isActive: true } }),
      db.farmer.count({ where: { tenantId, isActive: true, isCertified: true } }),
      db.landPreparation.count({ where: { tenantId, isActive: true } }),
      db.fertilizerApplication.count({ where: { tenantId, isActive: true } }),
      db.pestDiseaseManagement.count({ where: { tenantId, isActive: true } }),
      db.certAssessment.count({ where: { tenantId, status: 'Đạt', isActive: true } }),
      db.procurementRecord.count({ where: { tenantId, isActive: true, paymentStatus: 'Completed' } }),
      db.procurementRecord.count({ where: { tenantId, isActive: true, paymentStatus: { not: 'Completed' } } }),
    ])

    // Aggregates
    const [avgScore, avgCupScore, totalPurchaseAgg, avgPriceAgg, totalNetWeightAgg, totalLandAreaAgg, totalCherryWeightAgg] = await Promise.all([
      db.farmer.aggregate({ where: { tenantId, isActive: true, creditScore: { not: null } }, _avg: { creditScore: true } }),
      db.harvestTraceability.aggregate({ where: { tenantId, isActive: true, cupScore: { not: null } }, _avg: { cupScore: true } }),
      db.procurementRecord.aggregate({ where: { tenantId, isActive: true }, _sum: { totalPurchaseAmount: true } }),
      db.procurementRecord.aggregate({ where: { tenantId, isActive: true, purchasePricePerKg: { not: null } }, _avg: { purchasePricePerKg: true } }),
      db.procurementRecord.aggregate({ where: { tenantId, isActive: true }, _sum: { netWeight: true } }),
      db.farmLand.aggregate({ where: { tenantId, isActive: true, totalLandHolding: { not: null } }, _sum: { totalLandHolding: true } }),
      db.procurementRecord.aggregate({ where: { tenantId, isActive: true }, _sum: { grossWeight: true } }),
    ])

    // Chart data
    const [farmersPerProvince, cultivationsByCrop, processingByStage, certByType] = await Promise.all([
      db.farmer.groupBy({ by: ['province'], where: { tenantId, isActive: true, province: { not: null } }, _count: { province: true }, orderBy: { _count: { province: 'desc' } }, take: 8 }),
      db.cultivation.groupBy({ by: ['cultivatedCrop'], where: { tenantId, isActive: true, cultivatedCrop: { not: null } }, _count: { cultivatedCrop: true } }),
      db.processingStageRecord.groupBy({ by: ['stageType'], where: { tenantId, stageType: { not: null } }, _count: { stageType: true }, orderBy: { _count: { stageType: 'desc' } } }),
      db.certAssessment.groupBy({ by: ['certificationStandard'], where: { tenantId, certificationStandard: { not: null } }, _count: { certificationStandard: true } }),
    ])

    // Harvest trends
    const harvestMonthly = await db.harvestTraceability.findMany({
      where: { tenantId, isActive: true, actualHarvestDate: { not: null } },
      select: { actualHarvestDate: true, sampleWeight: true, cupScore: true },
      orderBy: { actualHarvestDate: 'asc' }, take: 100,
    })

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
    const harvestTrends = Object.entries(harvestMonthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, data]) => ({
      month, name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      harvests: data.count, weight: Math.round(data.weight),
      avgCupScore: data.cupScores.length > 0 ? Math.round((data.cupScores.reduce((a, b) => a + b, 0) / data.cupScores.length) * 10) / 10 : 0,
    }))

    // Quality distribution
    const qualityDist: Record<string, number> = { 'Excellent (85+)': 0, 'Good (75-84)': 0, 'Fair (60-74)': 0, 'Below (<60)': 0 }
    for (const h of harvestMonthly) {
      if (h.cupScore) {
        if (h.cupScore >= 85) qualityDist['Excellent (85+)']++
        else if (h.cupScore >= 75) qualityDist['Good (75-84)']++
        else if (h.cupScore >= 60) qualityDist['Fair (60-74)']++
        else qualityDist['Below (<60)']++
      }
    }

    // Recent activity from audit logs
    const recentActivityRaw = await db.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    const recentActivity = recentActivityRaw.map(log => {
      const typeMap: Record<string, string> = {
        Farmer: 'farmer', Cultivation: 'farmer', FarmLand: 'farmer',
        ProcurementRecord: 'procurement', HarvestTraceability: 'procurement',
        CoffeeInspection: 'inspection', CertAssessment: 'inspection',
        SmartContract: 'contract', MarketplaceListing: 'contract',
        CropMonitoring: 'alert', PestDiseaseManagement: 'alert',
      }
      return {
        id: log.id,
        type: typeMap[log.entity] || 'procurement',
        action: `${log.action} ${log.entity}`,
        entity: log.details || log.entityId || '',
        time: log.createdAt.toISOString(),
      }
    })

    return apiResponse({
      totalFarmers, totalFarmLands, totalCultivations, totalHarvestRecords,
      totalProcurementRecords, totalMarketplaceListings, completedProcessingStages,
      totalNurseries, totalCropMonitorings, totalSmartContracts, totalInspections,
      totalCollectionCentres, certifiedFarmersCount,
      totalLandPreps, totalFertilizerApps, totalPestMgmts,
      activeCertifications, procurementPaidCount, procurementPendingCount,
      avgCreditScore: avgScore._avg.creditScore ?? 0,
      avgCupScore: avgCupScore._avg.cupScore ?? 0,
      totalPurchaseAmount: totalPurchaseAgg._sum.totalPurchaseAmount ?? 0,
      avgPricePerKg: avgPriceAgg._avg.purchasePricePerKg ?? 0,
      totalNetWeight: totalNetWeightAgg._sum.netWeight ?? 0,
      totalCherryWeight: totalCherryWeightAgg._sum.grossWeight ?? 0,
      totalLandArea: totalLandAreaAgg._sum.totalLandHolding ?? 0,
      currency,
      farmersPerProvince, cultivationsByCrop, processingByStage, certByType,
      harvestTrends,
      qualityDistribution: Object.entries(qualityDist).map(([name, value]) => ({ name, value })),
      procurementTrends: [],
      recentProcurements: [],
      recentMarketplace: [],
      cropAlerts: [],
      recentInspections: [],
      recentActivity,
    })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

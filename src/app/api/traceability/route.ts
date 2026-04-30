import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { computeDataHash, computeBlockHash } from '@/lib/crypto'

/**
 * E2E Traceability API:
 * GET with ?batchId=xxx — Fetch all related records across all modules for a batch
 */

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'harvest-traceabilities', 'read')
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const batchId = url.searchParams.get('batchId')
    if (!batchId) return apiError('batchId query parameter is required', 400)

    const tenantId = user!.tenantId!

    // 1. Find HarvestTraceability by batchId
    const harvest = await db.harvestTraceability.findFirst({
      where: { tenantId, batchId, isActive: true },
      include: { farmer: true, farmLand: true },
    })

    if (!harvest) {
      return apiResponse({
        batchId,
        found: false,
        stages: [],
        chainVerification: null,
        message: 'No traceability record found for this batch ID',
      })
    }

    const farmerId = harvest.farmerId
    const farmLandId = harvest.farmLandId

    // 2. Find the Farmer
    const farmer = await db.farmer.findFirst({
      where: { id: farmerId, tenantId, isActive: true },
    })

    // 3. Find the FarmLand
    const farmLand = await db.farmLand.findFirst({
      where: { id: farmLandId, tenantId, isActive: true },
    })

    // 4. Find Cultivation
    const cultivation = await db.cultivation.findFirst({
      where: { tenantId, farmerId, farmLandId, isActive: true },
    })

    // 5. Find Nursery (by farmerId)
    const nursery = await db.nursery.findFirst({
      where: { tenantId, farmerId, isActive: true },
    })

    // 6. Find LandPreparation
    const landPreparation = await db.landPreparation.findFirst({
      where: { tenantId, farmerId, farmLandId, isActive: true },
    })

    // 7. Find CropMonitoring
    const cropMonitoring = await db.cropMonitoring.findFirst({
      where: { tenantId, farmerId, farmLandId, isActive: true },
    })

    // 8. Find FertilizerApplication
    const fertilizerApp = await db.fertilizerApplication.findFirst({
      where: { tenantId, farmerId, farmLandId, isActive: true },
    })

    // 9. Find PestDiseaseManagement
    const pestDisease = await db.pestDiseaseManagement.findFirst({
      where: { tenantId, farmerId, farmLandId, isActive: true },
    })

    // 10. Find ProcurementRecord by batchId
    const procurement = await db.procurementRecord.findFirst({
      where: { tenantId, batchId, isActive: true },
      include: { collectionCentre: true, farmer: true },
    })

    // 11. Find ProcessingJobOrder by batchIdInput
    const processing = await db.processingJobOrder.findFirst({
      where: { tenantId, batchIdInput: batchId, isActive: true },
      include: { processingStages: { where: { isActive: true }, orderBy: { stageDate: 'asc' } } },
    })

    // 12. Find CertAssessment by farmerId
    const certAssessment = await db.certAssessment.findFirst({
      where: { tenantId, farmerId, isActive: true },
    })

    // 13. Find CoffeeInspection by batchId
    const inspection = await db.coffeeInspection.findFirst({
      where: { tenantId, batchId, isActive: true },
    })

    // 14. Find HashChainBlock by batchId
    const hashBlocks = await db.hashChainBlock.findMany({
      where: { tenantId, batchId, isActive: true },
      orderBy: { blockIndex: 'asc' },
    })

    // 15. Find MarketplaceListing (via farmerId)
    const marketplace = await db.marketplaceListing.findFirst({
      where: { tenantId, farmerId, isActive: true },
    })

    // Verify hash chain integrity
    let chainVerification: { valid: boolean; totalBlocks: number; brokenAt?: number; message: string } | null = null
    if (hashBlocks.length > 0) {
      chainVerification = { valid: true, totalBlocks: hashBlocks.length, message: 'Chain integrity verified' }
      for (let i = 1; i < hashBlocks.length; i++) {
        const prev = hashBlocks[i - 1]
        const curr = hashBlocks[i]
        if (curr.previousHash !== prev.blockHash) {
          chainVerification = { valid: false, totalBlocks: hashBlocks.length, brokenAt: curr.blockIndex, message: `Chain broken at block ${curr.blockIndex}` }
          break
        }
        const expectedDataHash = computeDataHash(curr.data)
        if (curr.dataHash !== expectedDataHash) {
          chainVerification = { valid: false, totalBlocks: hashBlocks.length, brokenAt: curr.blockIndex, message: `Data hash mismatch at block ${curr.blockIndex}` }
          break
        }
        const expectedBlockHash = computeBlockHash(curr.dataHash, curr.previousHash, new Date(curr.timestamp).toISOString())
        if (curr.blockHash !== expectedBlockHash) {
          chainVerification = { valid: false, totalBlocks: hashBlocks.length, brokenAt: curr.blockIndex, message: `Block hash mismatch at block ${curr.blockIndex}` }
          break
        }
      }
    }

    // Organize by stage
    const stages = [
      {
        key: 'farmer',
        icon: '🌱',
        nameVi: 'Đăng ký nông dân',
        nameEn: 'Farmer Registration',
        status: farmer ? 'completed' as const : 'not_available' as const,
        date: farmer?.createdAt ? new Date(farmer.createdAt).toISOString() : null,
        data: farmer ? {
          name: farmer.fullName,
          code: farmer.farmerCode,
          province: farmer.province,
          isCertified: farmer.isCertified,
        } : null,
      },
      {
        key: 'farmland',
        icon: '🏞️',
        nameVi: 'Đất nông trại',
        nameEn: 'Farm Land',
        status: farmLand ? 'completed' as const : 'not_available' as const,
        date: farmLand?.createdAt ? new Date(farmLand.createdAt).toISOString() : null,
        data: farmLand ? {
          farmName: farmLand.farmName,
          area: farmLand.totalLandHolding,
          altitude: farmLand.altitude,
          soilType: farmLand.soilType,
          trees: farmLand.noOfTrees,
        } : null,
      },
      {
        key: 'cultivation',
        icon: '🌿',
        nameVi: 'Canh tác',
        nameEn: 'Cultivation',
        status: cultivation ? 'completed' as const : 'not_available' as const,
        date: cultivation?.sowingDate ? new Date(cultivation.sowingDate).toISOString() : cultivation?.createdAt ? new Date(cultivation.createdAt).toISOString() : null,
        data: cultivation ? {
          plotName: cultivation.farmPlotName,
          crop: cultivation.cultivatedCrop,
          variety: cultivation.cropVariety,
          area: cultivation.cultivationArea,
          method: cultivation.intendedProcessingMethod,
        } : null,
      },
      {
        key: 'nursery',
        icon: '🌳',
        nameVi: 'Vườn ươm',
        nameEn: 'Nursery',
        status: nursery ? 'completed' as const : 'not_available' as const,
        date: nursery?.plantingDate ? new Date(nursery.plantingDate).toISOString() : nursery?.createdAt ? new Date(nursery.createdAt).toISOString() : null,
        data: nursery ? {
          name: nursery.nurseryName,
          species: nursery.species,
          variety: nursery.variety,
          germinationRate: nursery.germinationRate,
          healthStatus: nursery.healthStatus,
        } : null,
      },
      {
        key: 'land_preparation',
        icon: '🔄',
        nameVi: 'Chuẩn bị đất',
        nameEn: 'Land Preparation',
        status: landPreparation ? 'completed' as const : 'not_available' as const,
        date: landPreparation?.preparationDate ? new Date(landPreparation.preparationDate).toISOString() : null,
        data: landPreparation ? {
          type: landPreparation.preparationType,
          method: landPreparation.method,
          soilPhBefore: landPreparation.soilPhBefore,
          soilPhAfter: landPreparation.soilPhAfter,
          organicMatter: landPreparation.organicMatterPct,
        } : null,
      },
      {
        key: 'crop_monitoring',
        icon: '📊',
        nameVi: 'Giám sát cây trồng',
        nameEn: 'Crop Monitoring',
        status: cropMonitoring ? 'completed' as const : 'not_available' as const,
        date: cropMonitoring?.monitoringDate ? new Date(cropMonitoring.monitoringDate).toISOString() : null,
        data: cropMonitoring ? {
          growthStage: cropMonitoring.growthStage,
          healthScore: cropMonitoring.healthScore,
          alertTriggered: cropMonitoring.alertTriggered,
          alertType: cropMonitoring.alertType,
        } : null,
      },
      {
        key: 'fertilizer',
        icon: '🧪',
        nameVi: 'Phân bón',
        nameEn: 'Fertilizer Application',
        status: fertilizerApp ? 'completed' as const : 'not_available' as const,
        date: fertilizerApp?.applicationDate ? new Date(fertilizerApp.applicationDate).toISOString() : null,
        data: fertilizerApp ? {
          type: fertilizerApp.fertilizerType,
          name: fertilizerApp.fertilizerName,
          isOrganic: fertilizerApp.isOrganic,
          quantity: fertilizerApp.totalQuantity,
        } : null,
      },
      {
        key: 'pest_disease',
        icon: '🛡️',
        nameVi: 'Sâu bệnh',
        nameEn: 'Pest & Disease Management',
        status: pestDisease ? 'completed' as const : 'not_available' as const,
        date: pestDisease?.detectionDate ? new Date(pestDisease.detectionDate).toISOString() : null,
        data: pestDisease ? {
          pestOrDisease: pestDisease.pestOrDisease,
          severity: pestDisease.severity,
          treatment: pestDisease.treatmentMethod,
          outcome: pestDisease.outcome,
        } : null,
      },
      {
        key: 'harvest',
        icon: '🌾',
        nameVi: 'Thu hoạch',
        nameEn: 'Harvest',
        status: 'completed' as const,
        date: harvest.actualHarvestDate ? new Date(harvest.actualHarvestDate).toISOString() : harvest.createdAt ? new Date(harvest.createdAt).toISOString() : null,
        data: {
          batchId: harvest.batchId,
          variety: harvest.coffeeVariety,
          method: harvest.harvestMethod,
          cupScore: harvest.cupScore,
          moisture: harvest.moistureContent,
          processingStage: harvest.processingStage,
        },
      },
      {
        key: 'procurement',
        icon: '🚛',
        nameVi: 'Thu mua & Vận chuyển',
        nameEn: 'Procurement & Transport',
        status: procurement ? 'completed' as const : 'pending' as const,
        date: procurement?.procurementDate ? new Date(procurement.procurementDate).toISOString() : null,
        data: procurement ? {
          netWeight: procurement.netWeight,
          pricePerKg: procurement.purchasePricePerKg,
          totalAmount: procurement.totalPurchaseAmount,
          paymentStatus: procurement.paymentStatus,
          collectionCentre: procurement.collectionCentre?.centreName,
        } : null,
      },
      {
        key: 'processing',
        icon: '⚙️',
        nameVi: 'Chế biến',
        nameEn: 'Processing',
        status: processing ? 'completed' as const : 'pending' as const,
        date: processing?.processingDate ? new Date(processing.processingDate).toISOString() : null,
        data: processing ? {
          method: processing.processingMethod,
          inputWeight: processing.inputWeightKg,
          outputWeight: processing.finalOutputWeightKg,
          outturn: processing.overallOutturn,
          cupScore: processing.cupScore,
          stages: processing.processingStages.length,
        } : null,
      },
      {
        key: 'certification',
        icon: '📋',
        nameVi: 'Chứng nhận',
        nameEn: 'Certification',
        status: certAssessment ? (certAssessment.status === 'Đạt' || certAssessment.status === 'Active' ? 'completed' as const : 'pending' as const) : 'not_available' as const,
        date: certAssessment?.assessmentDate ? new Date(certAssessment.assessmentDate).toISOString() : null,
        data: certAssessment ? {
          standard: certAssessment.certificationStandard,
          status: certAssessment.status,
          score: certAssessment.score,
          certBody: certAssessment.certifyingBody,
          validUntil: certAssessment.validUntil,
        } : null,
      },
      {
        key: 'inspection',
        icon: '🔍',
        nameVi: 'Kiểm tra',
        nameEn: 'Inspection',
        status: inspection ? 'completed' as const : 'not_available' as const,
        date: inspection?.inspectionDate ? new Date(inspection.inspectionDate).toISOString() : null,
        data: inspection ? {
          inspector: inspection.inspectorName,
          cupScore: inspection.cupScore,
          grade: inspection.overallGrade,
          passFail: inspection.passFail,
          moisture: inspection.moistureContent,
        } : null,
      },
      {
        key: 'marketplace',
        icon: '🏪',
        nameVi: 'Thị trường',
        nameEn: 'Marketplace',
        status: marketplace ? (marketplace.listingStatus === 'Sold' ? 'completed' as const : 'pending' as const) : 'not_available' as const,
        date: marketplace?.listingDate ? new Date(marketplace.listingDate).toISOString() : null,
        data: marketplace ? {
          title: marketplace.title,
          coffeeType: marketplace.coffeeType,
          quantity: marketplace.quantityKg,
          pricePerKg: marketplace.pricePerKg,
          status: marketplace.listingStatus,
        } : null,
      },
    ]

    return apiResponse({
      batchId,
      found: true,
      farmerName: farmer?.fullName,
      farmName: farmLand?.farmName,
      coffeeVariety: harvest.coffeeVariety || harvest.coffeeVarietyAtBatch,
      stages,
      hashChainBlocks: hashBlocks,
      chainVerification,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return apiError(msg, 500)
  }
}

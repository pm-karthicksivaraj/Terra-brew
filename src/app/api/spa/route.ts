import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'

function getUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(authHeader.substring(7), JWT_SECRET) as any
  } catch {
    return null
  }
}

function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, error: msg }, { status })
}

function ok(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

// Dashboard Stats
export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return err('Unauthorized', 401)

  const tenantId = user.tenantId
  if (!tenantId) return err('No tenant context', 403)

  const url = new URL(req.url)
  const resource = url.searchParams.get('resource')
  const id = url.searchParams.get('id')

  try {
    // Dashboard stats
    if (resource === 'dashboard') {
      const [
        totalFarmers, totalFarmLands, totalCultivations,
        activeCertifications, pendingInspections, totalBatches,
        avgCreditScore, certifiedFarmers,
        farmersPerProvince, cultivationsByCrop, harvestTrends, recentActivities,
      ] = await Promise.all([
        db.farmer.count({ where: { tenantId, isActive: true } }),
        db.farmLand.count({ where: { tenantId, isActive: true } }),
        db.cultivation.count({ where: { tenantId, isActive: true } }),
        db.certAssessment.count({ where: { tenantId, isActive: true, status: 'Compliant' } }),
        db.coffeeInspection.count({ where: { tenantId, isActive: true, passFail: 'Pending' } }),
        db.harvestTraceability.count({ where: { tenantId, isActive: true, batchId: { not: null } } }),
        db.farmer.aggregate({ where: { tenantId, creditScore: { not: null } }, _avg: { creditScore: true } }),
        db.farmer.count({ where: { tenantId, isCertified: true } }),
        db.farmer.groupBy({ by: ['province'], where: { tenantId, province: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
        db.cultivation.groupBy({ by: ['cultivatedCrop'], where: { tenantId, cultivatedCrop: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 6 }),
        // Recent harvests by month
        db.$queryRaw`SELECT strftime('%Y-%m', "actualHarvestDate") as month, COUNT(*) as count FROM "HarvestTraceability" WHERE "tenantId" = ${tenantId} AND "actualHarvestDate" IS NOT NULL AND "isActive" = 1 GROUP BY month ORDER BY month DESC LIMIT 12`,
        db.auditLog.findMany({ where: { tenantId }, take: 8, orderBy: { createdAt: 'desc' }, select: { id: true, action: true, entity: true, details: true, createdAt: true } }),
      ])

      return ok({
        totalFarmers, totalFarmLands, totalCultivations,
        activeCertifications, pendingInspections, totalBatches,
        avgCreditScore: avgCreditScore._avg.creditScore || 0,
        certifiedFarmers,
        farmersPerProvince: farmersPerProvince.map((f: any) => ({ province: f.province || 'Unknown', count: f._count.id })),
        cultivationsByCrop: cultivationsByCrop.map((c: any) => ({ crop: c.cultivatedCrop || 'Unknown', count: c._count.id })),
        harvestTrends: (harvestTrends as any[]).map((h: any) => ({ month: h.month, count: Number(h.count) })),
        recentActivities: recentActivities.map((a: any) => ({ id: a.id, type: a.entity, description: a.details || `${a.action} ${a.entity}`, date: a.createdAt })),
      })
    }

    // Farmers
    if (resource === 'farmers') {
      if (id) {
        const farmer = await db.farmer.findUnique({
          where: { id, tenantId },
          include: {
            farmLands: { where: { isActive: true }, include: { _count: { select: { cultivations: true } } } },
            cultivations: { where: { isActive: true } },
            _count: { select: { farmLands: true, cultivations: true, harvestTraceabilities: true, procurementRecords: true } },
          },
        })
        if (!farmer) return err('Not found', 404)
        return ok(farmer)
      }
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) {
        where.OR = [
          { fullName: { contains: search } },
          { farmerCode: { contains: search } },
          { province: { contains: search } },
        ]
      }
      const [items, total] = await Promise.all([
        db.farmer.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { _count: { select: { farmLands: true, cultivations: true } } } }),
        db.farmer.count({ where }),
      ])
      return ok({ items, total })
    }

    // Farm Lands
    if (resource === 'farmlands') {
      if (id) {
        const item = await db.farmLand.findUnique({
          where: { id, tenantId },
          include: { farmer: { select: { id: true, fullName: true, farmerCode: true } }, cultivations: { where: { isActive: true } }, _count: { select: { cultivations: true } } },
        })
        if (!item) return err('Not found', 404)
        return ok(item)
      }
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) {
        where.OR = [{ farmName: { contains: search } }, { farmer: { fullName: { contains: search } } }]
      }
      const [items, total] = await Promise.all([
        db.farmLand.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true, farmerCode: true } } } }),
        db.farmLand.count({ where }),
      ])
      return ok({ items, total })
    }

    // Cultivations
    if (resource === 'cultivations') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) {
        where.OR = [{ farmPlotName: { contains: search } }, { cultivatedCrop: { contains: search } }]
      }
      const [items, total] = await Promise.all([
        db.cultivation.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } } }),
        db.cultivation.count({ where }),
      ])
      return ok({ items, total })
    }

    // Nurseries
    if (resource === 'nurseries') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) {
        where.OR = [{ nurseryName: { contains: search } }, { variety: { contains: search } }]
      }
      const [items, total] = await Promise.all([
        db.nursery.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } } } }),
        db.nursery.count({ where }),
      ])
      return ok({ items, total })
    }

    // Land Preparations
    if (resource === 'land-preparations') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.preparationType = { contains: search }
      const [items, total] = await Promise.all([
        db.landPreparation.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } } }),
        db.landPreparation.count({ where }),
      ])
      return ok({ items, total })
    }

    // Crop Monitorings
    if (resource === 'crop-monitorings') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.growthStage = { contains: search }
      const [items, total] = await Promise.all([
        db.cropMonitoring.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } } }),
        db.cropMonitoring.count({ where }),
      ])
      return ok({ items, total })
    }

    // Fertilizer Applications
    if (resource === 'fertilizer-apps') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.fertilizerName = { contains: search }
      const [items, total] = await Promise.all([
        db.fertilizerApplication.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } } }),
        db.fertilizerApplication.count({ where }),
      ])
      return ok({ items, total })
    }

    // Pest Disease Managements
    if (resource === 'pest-disease-mgmts') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.pestOrDisease = { contains: search }
      const [items, total] = await Promise.all([
        db.pestDiseaseManagement.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } } }),
        db.pestDiseaseManagement.count({ where }),
      ])
      return ok({ items, total })
    }

    // Harvest Traceabilities
    if (resource === 'harvest-traceabilities') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) {
        where.OR = [{ batchId: { contains: search } }, { coffeeVariety: { contains: search } }]
      }
      const [items, total] = await Promise.all([
        db.harvestTraceability.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } } }),
        db.harvestTraceability.count({ where }),
      ])
      return ok({ items, total })
    }

    // Collection Centres
    if (resource === 'collection-centres') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.centreName = { contains: search }
      const [items, total] = await Promise.all([
        db.collectionCentre.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
        db.collectionCentre.count({ where }),
      ])
      return ok({ items, total })
    }

    // Procurement Records
    if (resource === 'procurement-records') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) {
        where.OR = [{ procurementId: { contains: search } }, { batchId: { contains: search } }]
      }
      const [items, total] = await Promise.all([
        db.procurementRecord.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, collectionCentre: { select: { centreName: true } } } }),
        db.procurementRecord.count({ where }),
      ])
      return ok({ items, total })
    }

    // Processing Job Orders
    if (resource === 'processing-job-orders') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.jobOrderId = { contains: search }
      const [items, total] = await Promise.all([
        db.processingJobOrder.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { processingStages: { orderBy: { createdAt: 'asc' } } } }),
        db.processingJobOrder.count({ where }),
      ])
      return ok({ items, total })
    }

    // Coffee Inspections
    if (resource === 'coffee-inspections') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.inspectionId = { contains: search }
      const [items, total] = await Promise.all([
        db.coffeeInspection.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } } } }),
        db.coffeeInspection.count({ where }),
      ])
      return ok({ items, total })
    }

    // Cert Assessments
    if (resource === 'cert-assessments') {
      const search = url.searchParams.get('search') || ''
      const where: any = { tenantId, isActive: true }
      if (search) where.certificationStandard = { contains: search }
      const [items, total] = await Promise.all([
        db.certAssessment.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } } } }),
        db.certAssessment.count({ where }),
      ])
      return ok({ items, total })
    }

    // Smart Contracts
    if (resource === 'smart-contracts') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.smartContract.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } } } }),
        db.smartContract.count({ where }),
      ])
      return ok({ items, total })
    }

    // Marketplace Listings
    if (resource === 'marketplace') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.marketplaceListing.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } } } }),
        db.marketplaceListing.count({ where }),
      ])
      return ok({ items, total })
    }

    // EUDR Compliance
    if (resource === 'eudr-compliance') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.eudrCompliance.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } }, deforestationAssessments: true } }),
        db.eudrCompliance.count({ where }),
      ])
      return ok({ items, total })
    }

    // Deforestation Assessments
    if (resource === 'deforestation') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.deforestationAssessment.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
        db.deforestationAssessment.count({ where }),
      ])
      return ok({ items, total })
    }

    // Export Documents
    if (resource === 'export-docs') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.exportDocument.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
        db.exportDocument.count({ where }),
      ])
      return ok({ items, total })
    }

    // Shipments
    if (resource === 'shipments') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.shipment.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { buyer: { select: { companyName: true } }, exportDocuments: true } }),
        db.shipment.count({ where }),
      ])
      return ok({ items, total })
    }

    // Buyers
    if (resource === 'buyers') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.buyer.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
        db.buyer.count({ where }),
      ])
      return ok({ items, total })
    }

    // Trading Contracts
    if (resource === 'trading-contracts') {
      const where: any = { tenantId, isActive: true }
      const [items, total] = await Promise.all([
        db.tradingContract.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { buyer: { select: { companyName: true } } } }),
        db.tradingContract.count({ where }),
      ])
      return ok({ items, total })
    }

    // Farmers list for dropdowns
    if (resource === 'farmers-list') {
      const items = await db.farmer.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, fullName: true, farmerCode: true },
        orderBy: { fullName: 'asc' },
        take: 200,
      })
      return ok(items)
    }

    // Farmlands list for dropdowns
    if (resource === 'farmlands-list') {
      const farmerId = url.searchParams.get('farmerId')
      const where: any = { tenantId, isActive: true }
      if (farmerId) where.farmerId = farmerId
      const items = await db.farmLand.findMany({
        where,
        select: { id: true, farmName: true, farmer: { select: { fullName: true } } },
        orderBy: { farmName: 'asc' },
        take: 200,
      })
      return ok(items)
    }

    // Cultivations list for dropdowns
    if (resource === 'cultivations-list') {
      const items = await db.cultivation.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, farmPlotName: true, cultivatedCrop: true, farmer: { select: { fullName: true } }, farmLand: { select: { farmName: true } } },
        orderBy: { farmPlotName: 'asc' },
        take: 200,
      })
      return ok(items)
    }

    return err('Unknown resource', 400)
  } catch (e: any) {
    console.error('[SPA API Error]', e)
    return err(e.message, 500)
  }
}

// POST - Create records
export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return err('Unauthorized', 401)

  const tenantId = user.tenantId
  if (!tenantId) return err('No tenant context', 403)

  try {
    const body = await req.json()
    const { resource, data } = body

    if (!resource || !data) return err('resource and data required', 400)

    // Add tenant context
    data.tenantId = tenantId
    data.createdBy = user.id

    const modelMap: Record<string, any> = {
      'farmers': db.farmer,
      'farmlands': db.farmLand,
      'cultivations': db.cultivation,
      'nurseries': db.nursery,
      'land-preparations': db.landPreparation,
      'crop-monitorings': db.cropMonitoring,
      'fertilizer-apps': db.fertilizerApplication,
      'pest-disease-mgmts': db.pestDiseaseManagement,
      'harvest-traceabilities': db.harvestTraceability,
      'collection-centres': db.collectionCentre,
      'procurement-records': db.procurementRecord,
      'processing-job-orders': db.processingJobOrder,
      'processing-stage-records': db.processingStageRecord,
      'coffee-inspections': db.coffeeInspection,
      'cert-assessments': db.certAssessment,
      'smart-contracts': db.smartContract,
      'marketplace': db.marketplaceListing,
      'eudr-compliance': db.eudrCompliance,
      'export-docs': db.exportDocument,
      'shipments': db.shipment,
      'buyers': db.buyer,
      'trading-contracts': db.tradingContract,
      'deforestation': db.deforestationAssessment,
    }

    const model = modelMap[resource]
    if (!model) return err('Unknown resource: ' + resource, 400)

    const item = await model.create({ data })
    return ok(item, 201)
  } catch (e: any) {
    console.error('[SPA API Create Error]', e)
    return err(e.message, 500)
  }
}

// PUT - Update records
export async function PUT(req: NextRequest) {
  const user = getUser(req)
  if (!user) return err('Unauthorized', 401)

  const tenantId = user.tenantId
  if (!tenantId) return err('No tenant context', 403)

  try {
    const body = await req.json()
    const { resource, id, data } = body

    if (!resource || !id || !data) return err('resource, id, and data required', 400)

    const modelMap: Record<string, any> = {
      'farmers': db.farmer,
      'farmlands': db.farmLand,
      'cultivations': db.cultivation,
      'nurseries': db.nursery,
      'land-preparations': db.landPreparation,
      'crop-monitorings': db.cropMonitoring,
      'fertilizer-apps': db.fertilizerApplication,
      'pest-disease-mgmts': db.pestDiseaseManagement,
      'harvest-traceabilities': db.harvestTraceability,
      'collection-centres': db.collectionCentre,
      'procurement-records': db.procurementRecord,
      'processing-job-orders': db.processingJobOrder,
      'processing-stage-records': db.processingStageRecord,
      'coffee-inspections': db.coffeeInspection,
      'cert-assessments': db.certAssessment,
      'smart-contracts': db.smartContract,
      'marketplace': db.marketplaceListing,
      'eudr-compliance': db.eudrCompliance,
      'export-docs': db.exportDocument,
      'shipments': db.shipment,
      'buyers': db.buyer,
      'trading-contracts': db.tradingContract,
      'deforestation': db.deforestationAssessment,
    }

    const model = modelMap[resource]
    if (!model) return err('Unknown resource: ' + resource, 400)

    // Remove fields that shouldn't be updated
    delete data.id
    delete data.tenantId
    delete data.createdAt
    delete data.updatedAt

    const item = await model.update({ where: { id, tenantId }, data })
    return ok(item)
  } catch (e: any) {
    console.error('[SPA API Update Error]', e)
    return err(e.message, 500)
  }
}

// DELETE - Soft delete records
export async function DELETE(req: NextRequest) {
  const user = getUser(req)
  if (!user) return err('Unauthorized', 401)

  const tenantId = user.tenantId
  if (!tenantId) return err('No tenant context', 403)

  try {
    const url = new URL(req.url)
    const resource = url.searchParams.get('resource')
    const id = url.searchParams.get('id')

    if (!resource || !id) return err('resource and id required', 400)

    const modelMap: Record<string, any> = {
      'farmers': db.farmer,
      'farmlands': db.farmLand,
      'cultivations': db.cultivation,
      'nurseries': db.nursery,
      'land-preparations': db.landPreparation,
      'crop-monitorings': db.cropMonitoring,
      'fertilizer-apps': db.fertilizerApplication,
      'pest-disease-mgmts': db.pestDiseaseManagement,
      'harvest-traceabilities': db.harvestTraceability,
      'collection-centres': db.collectionCentre,
      'procurement-records': db.procurementRecord,
      'processing-job-orders': db.processingJobOrder,
      'processing-stage-records': db.processingStageRecord,
      'coffee-inspections': db.coffeeInspection,
      'cert-assessments': db.certAssessment,
      'smart-contracts': db.smartContract,
      'marketplace': db.marketplaceListing,
      'eudr-compliance': db.eudrCompliance,
      'export-docs': db.exportDocument,
      'shipments': db.shipment,
      'buyers': db.buyer,
      'trading-contracts': db.tradingContract,
      'deforestation': db.deforestationAssessment,
    }

    const model = modelMap[resource]
    if (!model) return err('Unknown resource: ' + resource, 400)

    const item = await model.update({ where: { id, tenantId }, data: { isActive: false } })
    return ok(item)
  } catch (e: any) {
    console.error('[SPA API Delete Error]', e)
    return err(e.message, 500)
  }
}

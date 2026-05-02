import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  const moduleId = searchParams.get('moduleId')

  if (!batchId || !moduleId) {
    return NextResponse.json({ message: 'batchId and moduleId required' }, { status: 400 })
  }

  try {
    // Get harvest record
    const harvest = await db.harvestTraceability.findFirst({
      where: { moduleId, batchId, isActive: true },
      include: {
        farmer: { select: { id: true, fullName: true, farmerCode: true, contactNumber: true, province: true, district: true, commune: true, isCertified: true, creditScore: true, cooperative: true } },
        cultivation: {
          include: {
            farmLand: { select: { farmName: true, totalLandHolding: true, altitude: true, soilType: true, irrigationType: true, shadeTreeCover: true } },
          },
        },
        farmLand: { select: { id: true, farmName: true } },
      },
    })

    if (!harvest) {
      return NextResponse.json({ message: 'No harvest found for this batch' }, { status: 404 })
    }

    const farmerId = harvest.farmerId
    const cultivationId = harvest.cultivationId

    // Get all processing stages for this batch
    const processingStages = await db.processingStageRecord.findMany({
      where: { moduleId, batchId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    // Get procurement
    const procurement = await db.procurementRecord.findFirst({
      where: { moduleId, batchId, isActive: true },
      include: { collectionCentre: { select: { centreName: true, province: true, district: true } } },
    })

    // Get transport
    let transport = null
    if (procurement) {
      transport = await db.procurementTransport.findFirst({
        where: { moduleId, procurementRecordId: procurement.id, isActive: true },
      })
    }

    // Get marketplace listing
    const marketplace = await db.marketplaceListing.findFirst({
      where: { moduleId, batchId },
    })

    // Get smart contract
    const contract = await db.smartContract.findFirst({
      where: { moduleId, batchId },
    })

    // Get certifications
    const inspections = await db.coffeeInspection.findMany({
      where: { moduleId, farmerId },
      take: 3,
      orderBy: { createdAt: 'desc' },
    })

    const certAssessments = await db.certAssessment.findMany({
      where: { moduleId, farmerId },
      take: 3,
      orderBy: { createdAt: 'desc' },
    })

    // Get nursery data
    const nursery = await db.nursery.findFirst({
      where: { moduleId, cultivationId },
    })

    // Get land preparation
    const landPrep = await db.landPreparation.findFirst({
      where: { moduleId, cultivationId },
    })

    // Get crop monitoring
    const cropMonitorings = await db.cropMonitoring.findMany({
      where: { moduleId, cultivationId },
      orderBy: { visitDate: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      batchId,
      farmer: harvest.farmer,
      farmLand: harvest.farmLand || harvest.cultivation?.farmLand,
      cultivation: harvest.cultivation ? {
        farmPlotName: harvest.cultivation.farmPlotName,
        cultivatedCrop: harvest.cultivation.cultivatedCrop,
        cropVariety: harvest.cultivation.cropVariety,
        coffeeSpecies: harvest.cultivation.coffeeSpecies,
        cultivationArea: harvest.cultivation.cultivationArea,
        sowingDate: harvest.cultivation.sowingDate,
        seedSource: harvest.cultivation.seedSource,
        shadeCover: harvest.cultivation.shadeCover,
      } : null,
      nursery: nursery ? {
        nurseryId: nursery.nurseryId,
        coffeeVariety: nursery.coffeeVariety,
        nurseryCapacity: nursery.nurseryCapacity,
        sowingDate: nursery.sowingDate,
        germinationRate: nursery.germinationRate,
        seedlingHealth: nursery.seedlingHealth,
        transplantDate: nursery.transplantDate,
        survivalRate: nursery.survivalRate,
      } : null,
      landPreparation: landPrep ? {
        eventDate: landPrep.eventDate,
        activity: landPrep.activity,
        implementsUsed: landPrep.implementsUsed,
        compostApplied: landPrep.compostApplied,
        compostType: landPrep.compostType,
        plantingDate: landPrep.plantingDate,
        plantingMethod: landPrep.plantingMethod,
        seedlingAge: landPrep.seedlingAge,
        plantsPerHa: landPrep.plantsPerHa,
        spacing: landPrep.spacing,
      } : null,
      cropMonitorings: cropMonitorings.map((cm) => ({
        visitDate: cm.visitDate,
        growthStage: cm.growthStage,
        plantHeight: cm.plantHeight,
        canopyCover: cm.canopyCover,
        leafColorIndex: cm.leafColorIndex,
        soilMoisture: cm.soilMoisture,
        ndviIndex: cm.ndviIndex,
        pestInfestation: cm.pestInfestation,
        pestType: cm.pestType,
        diseaseSymptoms: cm.diseaseSymptoms,
        alertTriggered: cm.alertTriggered,
        recommendation: cm.recommendation,
      })),
      harvest: {
        plannedDate: harvest.plannedHarvestDate,
        actualDate: harvest.actualHarvestDate,
        method: harvest.harvestMethod,
        equipment: harvest.harvestEquipment,
        cherryRipeness: harvest.cherryRipeness,
        sampleYield: harvest.sampleYield,
        moisture: harvest.moistureContent,
        cupScore: harvest.cupScore,
        processingMethod: harvest.processingMethod,
        dryingMethod: harvest.dryingMethod,
        dryingDurationDays: harvest.dryingDurationDays,
        defectiveBeans: harvest.defectiveBeans,
        processingStage: harvest.processingStage,
        location: harvest.location,
        actor: harvest.actor,
        notes: harvest.batchNotes,
      },
      processingStages: processingStages.map((s) => ({
        stageType: s.stageType,
        stageData: typeof s.stageData === 'string' ? JSON.parse(s.stageData) : s.stageData,
        notes: s.notes,
        recordedAt: s.createdAt,
      })),
      procurement: procurement ? {
        date: procurement.procurementDate,
        centre: procurement.collectionCentre?.centreName,
        grossWeight: procurement.grossWeight,
        netWeight: procurement.netWeight,
        pricePerKg: procurement.purchasePricePerKg,
        totalAmount: procurement.totalPurchaseAmount,
        paymentStatus: procurement.paymentStatus,
        cherryRipenessGrade: procurement.cherryRipenessGrade,
        certPremiumApplied: procurement.certPremiumApplied,
      } : null,
      transport: transport ? {
        vehicle: transport.vehiclePlateNo,
        driver: transport.driverName,
        route: transport.transportRoute,
        receivedWeight: transport.receivedAtPlantKg,
        departure: transport.departureDateTime,
        arrival: transport.arrivalDateTime,
        cost: transport.transportCost,
      } : null,
      marketplace: marketplace ? {
        variety: marketplace.coffeeVariety,
        processingMethod: marketplace.processingMethod,
        price: marketplace.pricePerKg,
        qty: marketplace.availableQty,
        listingDate: marketplace.listingDate,
        validUntil: marketplace.priceValidUntil,
        certLabels: marketplace.certificationLabels,
        cupScore: marketplace.cupScore,
      } : null,
      contract: contract ? {
        buyer: contract.buyer,
        quantity: contract.quantity,
        pricePerKg: contract.pricePerKg,
        status: contract.status,
        paymentTerms: contract.paymentTerms,
        contractDate: contract.contractDate,
      } : null,
      certifications: {
        inspections: inspections.map((insp) => ({
          inspectionId: insp.inspectionId,
          certificationType: insp.certificationType,
          certifyingBody: insp.certifyingBody,
          certificateNo: insp.certificateNo,
          certStatus: insp.certStatus,
          complianceStatus: insp.complianceStatus,
          auditDate: insp.auditDate,
          certIssueDate: insp.certIssueDate,
          certExpiryDate: insp.certExpiryDate,
          auditorName: insp.auditorName,
          inspectionType: insp.inspectionType,
        })),
        assessments: certAssessments.map((ca) => ({
          assessmentId: ca.assessmentId,
          certificationStandard: ca.certificationStandard,
          assessmentDate: ca.assessmentDate,
          assessorName: ca.assessorName,
          certificationOutcome: ca.certificationOutcome,
          totalScorePercentage: ca.totalScorePercentage,
        })),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

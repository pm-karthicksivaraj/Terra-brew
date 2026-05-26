import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'farmers', 'read')
  if (authError) return authError

  try {
    const { id } = await params
    const farmer = await db.farmer.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
      include: {
        farmLands: {
          where: { isActive: true },
          select: {
            id: true, farmName: true, plotBlockId: true, totalLandHolding: true,
            soilType: true, altitude: true, boundaryArea: true, latitude: true,
            longitude: true, landOwnership: true, irrigationSource: true,
            noOfTrees: true, shadeTreeSpecies: true, fertilityStatus: true,
            isActive: true,
            _count: { select: { cultivations: true, harvestTraceabilities: true } },
          },
        },
        cultivations: {
          where: { isActive: true },
          select: {
            id: true, farmPlotName: true, plotBlockId: true, cultivatedCrop: true,
            cropVariety: true, coffeeSpecies: true, cultivationArea: true,
            sowingDate: true, intercroppingEnabled: true, intercroppingPartner: true,
            intercroppingRatio: true, isPrimaryCrop: true, harvestSeason: true,
            isActive: true,
          },
        },
        harvestTraceabilities: {
          select: {
            id: true, batchId: true, coffeeVariety: true, harvestMethod: true,
            actualHarvestDate: true, processingMethod: true, cupScore: true,
            moistureContent: true, defectiveBeans: true, cherryRipeness: true,
            estimatedYieldPerHa: true, batchTimestamp: true, processingStage: true,
            isActive: true,
          },
        },
        certAssessments: {
          select: {
            id: true, assessmentId: true, assessmentDate: true,
            certificationStandard: true, certifyingBody: true, status: true,
            score: true, maxScore: true, validFrom: true, validUntil: true,
            certificateNumber: true,
          },
        },
        coffeeInspections: {
          select: {
            id: true, inspectionId: true, inspectionDate: true,
            inspectorName: true, inspectionType: true, cupScore: true,
            overallGrade: true, passFail: true,
          },
        },
        _count: {
          select: {
            farmLands: true, cultivations: true, harvestTraceabilities: true,
            certAssessments: true, coffeeInspections: true,
          },
        },
      },
    })
    if (!farmer) return apiError('Farmer not found', 404)
    return apiResponse(farmer)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

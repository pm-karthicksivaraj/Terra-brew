import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

  const items = await prisma.processingJobOrder.findMany({
    where: { moduleId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      moduleId, tenantId,
      processingDate, batchIdInput, coffeeTypeInput, coffeeVarietyInput,
      inputQuantityKg, processingMethod, targetOutputProduct,
      operatorName, plantFacilityName,
      stage1Cleaning, stage2Depulping, stage3Fermentation, stage4Washing,
      stage5Drying, stage6Hulling, stage7Grading, stage8Blending,
      stage9Roasting, stage10Grinding, stage11Packaging,
      inputWeightKg, finalOutputWeightKg, overallOutturn,
      totalProcessingCost, costPerKg, finalMoistureContent,
      cupScore, cuppingNotes, qcApprovedBy,
      qcApprovalDate, qcReportUpload,
    } = body

    if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

    const item = await prisma.processingJobOrder.create({
      data: {
        moduleId, tenantId,
        jobOrderId: `PJ-${Date.now()}`,
        processingDate: processingDate ? new Date(processingDate) : new Date(),
        batchIdInput, coffeeTypeInput, coffeeVarietyInput,
        inputQuantityKg, processingMethod, targetOutputProduct,
        operatorName, plantFacilityName,
        stage1Cleaning, stage2Depulping, stage3Fermentation, stage4Washing,
        stage5Drying, stage6Hulling, stage7Grading, stage8Blending,
        stage9Roasting, stage10Grinding, stage11Packaging,
        inputWeightKg, finalOutputWeightKg, overallOutturn,
        totalProcessingCost, costPerKg, finalMoistureContent,
        cupScore, cuppingNotes, qcApprovedBy,
        qcApprovalDate: qcApprovalDate ? new Date(qcApprovalDate) : null,
        qcReportUpload,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Create failed' }, { status: 500 })
  }
}

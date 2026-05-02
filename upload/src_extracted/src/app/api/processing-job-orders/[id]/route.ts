import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.processingJobOrder.findUnique({
    where: { id: params.id },
  })
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
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

    const item = await prisma.processingJobOrder.update({
      where: { id: params.id },
      data: {
        processingDate: processingDate ? new Date(processingDate) : undefined,
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
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.processingJobOrder.update({
      where: { id: params.id },
      data: { isActive: false },
    })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Delete failed' }, { status: 500 })
  }
}

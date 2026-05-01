import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'processing', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(req.url)
    const idParam = url.searchParams.get('id')

    // Single-item fetch by ID
    if (idParam) {
      const item = await db.processingJobOrder.findFirst({
        where: { id: idParam, tenantId, isActive: true },
        include: {
          processingStages: {
            where: { isActive: true },
            orderBy: { stageDate: 'asc' },
          },
        },
      })
      if (!item) return apiError('Processing job order not found', 404)
      return apiResponse({ data: item })
    }

    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)

    const batchIdInputFilter = url.searchParams.get('batchIdInput')

    const where: any = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { jobOrderId: { contains: search } },
        { batchIdInput: { contains: search } },
        { processingMethod: { contains: search } },
        { operatorName: { contains: search } },
        { plantFacilityName: { contains: search } },
      ]
    }
    // Support batchIdInput filter
    if (batchIdInputFilter) {
      where.batchIdInput = batchIdInputFilter
    }

    const [items, total] = await Promise.all([
      db.processingJobOrder.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          processingStages: {
            where: { isActive: true },
            orderBy: { stageDate: 'asc' },
          },
        },
      }),
      db.processingJobOrder.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'processing', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const tenantId = user!.tenantId!

    // Extract processingStages if present (for wizard flow)
    const { processingStages, stages, ...restBody } = body
    const stagesData = processingStages || (stages ? { create: stages } : null)

    const data: any = {
      ...restBody,
      tenantId,
      createdBy: user!.id,
    }

    // If stages are provided, add them as nested create with tenantId
    if (stagesData?.create && Array.isArray(stagesData.create)) {
      data.processingStages = {
        create: stagesData.create.map((stage: any) => ({
          ...stage,
          tenantId,
        })),
      }
    }

    const item = await db.processingJobOrder.create({
      data,
      include: {
        processingStages: true,
      },
    })

    return apiResponse(item, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'processing', 'update')
  if (authError) return authError

  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return apiError('ID is required', 400)

    const existing = await db.processingJobOrder.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Processing job order not found', 404)

    const item = await db.processingJobOrder.update({
      where: { id },
      data,
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'processing', 'delete')
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('ID is required', 400)

    const existing = await db.processingJobOrder.findFirst({ where: { id, tenantId: user!.tenantId!, isActive: true } })
    if (!existing) return apiError('Processing job order not found', 404)

    const item = await db.processingJobOrder.update({
      where: { id },
      data: { isActive: false },
    })

    return apiResponse(item)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

import { apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'
import { db } from '@/lib/db'

// Public endpoint — no auth required since ComplianceService is platform-level
export async function GET(req: Request) {
  try {
    const { page, pageSize, search, sortBy, sortOrder } = getPaginationParams(req as any)
    const url = new URL(req.url)
    const serviceType = url.searchParams.get('serviceType') || undefined
    const isVerified = url.searchParams.get('isVerified')

    const where: any = { isActive: true }
    if (serviceType) where.serviceType = serviceType
    if (isVerified !== null && isVerified !== undefined) {
      where.isVerified = isVerified === 'true'
    }
    if (search) {
      where.OR = [
        { providerName: { contains: search } },
        { description: { contains: search } },
        { coverage: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.complianceService.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { bookings: true } },
        },
      }),
      db.complianceService.count({ where }),
    ])

    return apiResponse({ data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

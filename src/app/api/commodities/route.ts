import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  try {
    const tenantId = user!.tenantId!
    const url = new URL(request.url)
    const commodityType = url.searchParams.get('commodityType') || 'coffee'

    // Return commodity types from tenant's commodityTypes field
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { commodityTypes: true, country: true, currency: true, currencySymbol: true },
    })

    if (!tenant) return apiError('Tenant not found', 404)

    const types = JSON.parse(tenant.commodityTypes || '["coffee"]')
    
    const commodities = types.map((type: string) => ({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      country: tenant.country,
      currency: tenant.currency,
      currencySymbol: tenant.currencySymbol,
    }))

    return apiResponse({ data: commodities })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'create')
  if (authError) return authError

  try {
    const body = await request.json()
    const tenantId = user!.tenantId!

    if (!body.type) return apiError('Commodity type is required', 400)

    // Add commodity type to tenant's commodityTypes
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { commodityTypes: true },
    })

    if (!tenant) return apiError('Tenant not found', 404)

    const types = JSON.parse(tenant.commodityTypes || '["coffee"]')
    if (!types.includes(body.type)) {
      types.push(body.type)
      await db.tenant.update({
        where: { id: tenantId },
        data: { commodityTypes: JSON.stringify(types) },
      })
    }

    return apiResponse({ data: { type: body.type, added: true } }, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

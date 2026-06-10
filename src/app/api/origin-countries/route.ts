import { NextRequest } from 'next/server'
import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  // OriginCountry model does not exist in the schema
  return apiResponse({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'create')
  if (authError) return authError

  // OriginCountry model does not exist in the schema
  return apiError('Not Implemented: OriginCountry model does not exist', 501)
}

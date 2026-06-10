import { NextRequest } from 'next/server'
import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'export-docs', 'read')
  if (authError) return authError

  // CustomsEntry model does not exist in the schema
  return apiResponse({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'export-docs', 'create')
  if (authError) return authError

  // CustomsEntry model does not exist in the schema
  return apiError('Not Implemented: CustomsEntry model does not exist', 501)
}

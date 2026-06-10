import { getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  // DueDiligenceStatement model does not exist in the schema
  return apiResponse({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'create')
  if (authError) return authError

  // DueDiligenceStatement model does not exist in the schema
  return apiError('Not Implemented: DueDiligenceStatement model does not exist', 501)
}

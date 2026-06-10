import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'update')
  if (authError) return authError

  // DueDiligenceStatement model does not exist in the schema
  return apiError('Not Implemented: DueDiligenceStatement model does not exist', 501)
}

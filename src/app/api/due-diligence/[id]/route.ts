import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'read')
  if (authError) return authError

  // DueDiligenceStatement model does not exist in the schema
  return apiError('Not Implemented: DueDiligenceStatement model does not exist', 501)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'update')
  if (authError) return authError

  // DueDiligenceStatement model does not exist in the schema
  return apiError('Not Implemented: DueDiligenceStatement model does not exist', 501)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'eudr-compliance', 'delete')
  if (authError) return authError

  // DueDiligenceStatement model does not exist in the schema
  return apiError('Not Implemented: DueDiligenceStatement model does not exist', 501)
}

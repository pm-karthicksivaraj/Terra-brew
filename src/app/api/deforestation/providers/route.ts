import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { getAvailableProviders } from '@/lib/integrations/deforestation'

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'deforestation', 'read')
  if (authError) return authError

  try {
    const providers = getAvailableProviders()
    return apiResponse(providers)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { getComplianceRequirements } from '@/lib/integrations/traces'

export async function GET(request: Request, { params }: { params: Promise<{ countryCode: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'traces', 'read')
  if (authError) return authError

  try {
    const { countryCode } = await params

    if (!countryCode || countryCode.length !== 2) {
      return apiError('Invalid countryCode: must be a 2-letter ISO code', 400)
    }

    const result = await getComplianceRequirements(countryCode)
    return apiResponse(result)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

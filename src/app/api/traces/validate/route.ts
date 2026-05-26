import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { validateTracesRegistration } from '@/lib/integrations/traces'

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'traces', 'read')
  if (authError) return authError

  try {
    const body = await req.json()
    const { registrationNumber } = body

    if (!registrationNumber) {
      return apiError('Missing required field: registrationNumber', 400)
    }

    const result = await validateTracesRegistration(registrationNumber)
    return apiResponse(result)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

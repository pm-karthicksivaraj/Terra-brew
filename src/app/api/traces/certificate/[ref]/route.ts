import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { getCertificateStatus } from '@/lib/integrations/traces'

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'traces', 'read')
  if (authError) return authError

  try {
    const { ref } = await params

    if (!ref) {
      return apiError('Missing certificate reference', 400)
    }

    const result = await getCertificateStatus(ref)
    return apiResponse(result)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

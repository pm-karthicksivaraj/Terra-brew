import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { db } from '@/lib/db'
import { generateRiskReport } from '@/lib/integrations/deforestation'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  const authError = requireTenantAccess(user, 'deforestation', 'read')
  if (authError) return authError

  try {
    const { id } = await params

    // Verify the assessment exists and belongs to this tenant
    const assessment = await db.deforestationAssessment.findFirst({
      where: { id, tenantId: user!.tenantId!, isActive: true },
    })
    if (!assessment) return apiError('Deforestation assessment not found', 404)

    const report = await generateRiskReport(id)
    return apiResponse(report)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

import { getAuthUser, requireTenantAccess, apiResponse, apiError } from '@/lib/api-middleware'
import { assessDeforestationRisk, type GeoJSONPolygon } from '@/lib/integrations/deforestation'

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requireTenantAccess(user, 'deforestation', 'create')
  if (authError) return authError

  try {
    const body = await req.json()
    const { geojson, referencePeriodStart, referencePeriodEnd } = body

    if (!geojson || !referencePeriodStart || !referencePeriodEnd) {
      return apiError('Missing required fields: geojson, referencePeriodStart, referencePeriodEnd', 400)
    }

    // Validate geojson structure
    if (!geojson.type || geojson.type !== 'Polygon' || !Array.isArray(geojson.coordinates)) {
      return apiError('Invalid geojson: must be a Polygon with coordinates array', 400)
    }

    const result = await assessDeforestationRisk({
      geojson: geojson as GeoJSONPolygon,
      referencePeriodStart,
      referencePeriodEnd,
    })

    return apiResponse(result)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

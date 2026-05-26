import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/api-middleware'
import { db } from '@/lib/db'

/**
 * GET /api/tenants/me/modules
 * Returns the list of module slugs enabled for the current user's tenant.
 * Used by the sidebar to determine which navigation items to show.
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (!user || !user.tenantId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // 1. Check TenantModule join table (preferred, normalized)
    const tenantModules = await db.tenantModule.findMany({
      where: {
        tenantId: user.tenantId,
        isEnabled: true,
      },
      select: { moduleSlug: true },
    })

    let enabledSlugs = tenantModules.map(tm => tm.moduleSlug)

    // 2. Fallback: if TenantModule table is empty (not seeded or migrated),
    //    parse the Tenant.enabledModules JSON field
    if (enabledSlugs.length === 0) {
      const tenant = await db.tenant.findUnique({
        where: { id: user.tenantId },
        select: { enabledModules: true, entityType: true },
      })

      if (tenant?.enabledModules) {
        try {
          const parsed = JSON.parse(tenant.enabledModules)
          if (typeof parsed === 'object' && parsed !== null) {
            // enabledModules is Record<slug, boolean>
            enabledSlugs = Object.entries(parsed)
              .filter(([, enabled]) => enabled === true)
              .map(([slug]) => slug)
          }
        } catch {
          // Invalid JSON, fall through
        }
      }

      // 3. Ultimate fallback: if no enabled modules configured at all,
      //    return default modules for the entity type
      if (enabledSlugs.length === 0) {
        const moduleByEntity: Record<string, string[]> = {
          producer: ['dashboard','analytics','farmers','farmlands','cultivations','nurseries','land-preparations','crop-monitorings','fertilizer-apps','pest-disease-mgmts','harvest-traceabilities','procurement','eudr-compliance','cert-assessments','deforestation','marketplace','trace-journey','billing','users'],
          aggregator: ['dashboard','analytics','harvest-traceabilities','procurement','processing','coffee-inspections','qc-verifications','eudr-compliance','cert-assessments','marketplace','rfq','inspections','product-monitoring','smart-contracts','trading-desk','shipments','logistics','buyers','trace-journey','iot-sensors','blockchain','billing','users'],
          exporter: ['dashboard','analytics','eudr-compliance','marketplace','rfq','inspections','product-monitoring','smart-contracts','trading-desk','shipments','logistics','export-docs','buyers','trace-journey','blockchain','billing','users'],
          importer: ['dashboard','analytics','eudr-compliance','marketplace','rfq','smart-contracts','trading-desk','shipments','logistics','buyers','trace-journey','blockchain','billing','users'],
          certification_body: ['dashboard','analytics','coffee-inspections','inspections','cert-assessments','eudr-compliance','deforestation','billing','users'],
          laboratory: ['dashboard','analytics','coffee-inspections','qc-verifications','billing','users'],
        }
        const entityType = tenant?.entityType || 'producer'
        enabledSlugs = moduleByEntity[entityType] || moduleByEntity.producer
      }
    }

    return NextResponse.json({
      success: true,
      tenantId: user.tenantId,
      enabledModules: enabledSlugs,
    })
  } catch (error) {
    console.error('Error fetching tenant modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant modules' },
      { status: 500 },
    )
  }
}

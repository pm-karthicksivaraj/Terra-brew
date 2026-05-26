import { NextRequest } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getAuthUser, requireAuth, apiResponse, apiError } from '@/lib/api-middleware'

// GET /api/white-label — Get white-label config for current tenant
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireAuth(user)
    if (authError) return authError

    const tenant = await prisma.tenant.findUnique({
      where: { id: user!.tenantId },
      select: {
        whiteLabelConfig: true,
        whiteLabelDomain: true,
        plan: true,
        name: true,
        logoUrl: true,
      },
    })

    if (!tenant) return apiError('Tenant not found', 404)

    const config = tenant.whiteLabelConfig
      ? JSON.parse(tenant.whiteLabelConfig as string)
      : null

    return apiResponse({
      enabled: config?.enabled || false,
      plan: tenant.plan,
      isEnterprise: tenant.plan === 'enterprise',
      whiteLabelDomain: tenant.whiteLabelDomain,
      config: config || {
        enabled: false,
        primaryColor: '#0D9488',
        secondaryColor: '#115E59',
        accentColor: '#F59E0B',
        heroTitle: `Discover the Journey of Your ${tenant.name} Coffee`,
        heroSubtitle: 'From farm to cup — trace every step with transparency',
        logoUrl: tenant.logoUrl || '',
        faviconUrl: '',
        customCss: '',
        showSustainability: true,
        showFarmerProfile: true,
        showMap: true,
        showCertifications: true,
        socialLinks: {},
      },
    })
  } catch (error) {
    console.error('White-label GET error:', error)
    return apiError('Failed to get white-label config', 500)
  }
}

// PUT /api/white-label — Update white-label config
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireAuth(user)
    if (authError) return authError

    const tenant = await prisma.tenant.findUnique({
      where: { id: user!.tenantId },
      select: { plan: true },
    })

    if (!tenant) return apiError('Tenant not found', 404)

    // Only Enterprise tier can configure white-label
    if (tenant.plan !== 'enterprise') {
      return apiError('White-label is only available on the Enterprise plan. Please upgrade to access this feature.', 403)
    }

    const body = await request.json()
    const {
      enabled,
      primaryColor,
      secondaryColor,
      accentColor,
      heroTitle,
      heroSubtitle,
      logoUrl,
      faviconUrl,
      customCss,
      showSustainability,
      showFarmerProfile,
      showMap,
      showCertifications,
      socialLinks,
      whiteLabelDomain,
    } = body

    const config = {
      enabled: enabled || false,
      primaryColor: primaryColor || '#0D9488',
      secondaryColor: secondaryColor || '#115E59',
      accentColor: accentColor || '#F59E0B',
      heroTitle: heroTitle || '',
      heroSubtitle: heroSubtitle || '',
      logoUrl: logoUrl || '',
      faviconUrl: faviconUrl || '',
      customCss: customCss || '',
      showSustainability: showSustainability !== false,
      showFarmerProfile: showFarmerProfile !== false,
      showMap: showMap !== false,
      showCertifications: showCertifications !== false,
      socialLinks: socialLinks || {},
    }

    await prisma.tenant.update({
      where: { id: user!.tenantId },
      data: {
        whiteLabelConfig: JSON.stringify(config),
        ...(whiteLabelDomain !== undefined && { whiteLabelDomain }),
      },
    })

    return apiResponse({ success: true, config })
  } catch (error) {
    console.error('White-label PUT error:', error)
    return apiError('Failed to update white-label config', 500)
  }
}

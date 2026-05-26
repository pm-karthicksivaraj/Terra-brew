import { NextRequest } from 'next/server'
import { db as prisma } from '@/lib/db'
import { apiResponse, apiError } from '@/lib/api-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    // Find tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        whiteLabelConfig: true,
        whiteLabelDomain: true,
        eudrCompliant: true,
        certifications: true,
        commodityTypes: true,
        country: true,
        currency: true,
        currencySymbol: true,
        language: true,
      },
    })

    if (!tenant || !tenant.whiteLabelConfig) {
      return apiError('Tenant not found or white-label not configured', 404)
    }

    const config = JSON.parse(tenant.whiteLabelConfig as string || '{}')

    // If not enabled, return error
    if (!config.enabled) {
      return apiError('White-label portal not enabled', 403)
    }

    const result: Record<string, unknown> = {
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
        eudrCompliant: tenant.eudrCompliant,
        certifications: tenant.certifications,
        commodityTypes: tenant.commodityTypes,
        country: tenant.country,
      },
      branding: {
        primaryColor: config.primaryColor || '#0D9488',
        secondaryColor: config.secondaryColor || '#115E59',
        accentColor: config.accentColor || '#F59E0B',
        heroTitle: config.heroTitle || `Discover the Journey of Your ${tenant.name} Coffee`,
        heroSubtitle: config.heroSubtitle || 'From farm to cup — trace every step with transparency',
        logoUrl: config.logoUrl || tenant.logoUrl,
        showSustainability: config.showSustainability !== false,
        showFarmerProfile: config.showFarmerProfile !== false,
        showMap: config.showMap !== false,
        showCertifications: config.showCertifications !== false,
        socialLinks: config.socialLinks || {},
      },
    }

    // If batchId provided, fetch trace data
    if (batchId) {
      const harvestRecords = await prisma.harvestTraceability.findMany({
        where: { tenantId: tenant.id, batchId, isActive: true },
        include: {
          farmer: {
            select: {
              id: true, fullName: true, province: true, district: true,
              commune: true, latitude: true, longitude: true,
              isCertified: true, certificationType: true, farmerPhoto: true,
            },
          },
          farmLand: {
            select: {
              id: true, farmName: true, altitude: true, latitude: true, longitude: true,
              totalLandHolding: true,
            },
          },
        },
        orderBy: { batchTimestamp: 'asc' },
      })

      const procurementRecords = await prisma.procurementRecord.findMany({
        where: { tenantId: tenant.id, batchId, isActive: true },
        take: 5,
      })

      const processingRecords = await prisma.processingJobOrder.findMany({
        where: { tenantId: tenant.id, batchIdInput: batchId, isActive: true },
        take: 5,
      })

      const eudrCompliance = await prisma.eudrCompliance.findFirst({
        where: { tenantId: tenant.id, batchId, isActive: true },
      })

      const hashChainBlocks = await prisma.hashChainBlock.findMany({
        where: { tenantId: tenant.id, batchId, isActive: true },
        orderBy: { blockIndex: 'asc' },
      })

      result.traceData = {
        batchId,
        harvestRecords,
        procurementRecords,
        processingRecords,
        eudrCompliance,
        hashChainBlocks,
        totalStages: hashChainBlocks.length,
      }
    }

    return apiResponse(result)
  } catch (error) {
    console.error('Portal API error:', error)
    return apiError('Failed to load portal data', 500)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { encode } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { getSessionCookieName, getSessionCookieOptions } from '@/lib/auth/cookies'

/**
 * POST /api/onboarding/complete
 *
 * Marks the current user's onboarding as completed and updates
 * the tenant with organization details provided during onboarding.
 *
 * Also re-encodes the JWT with onboardingCompleted=true so the
 * middleware no longer redirects to /onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token || !token.id || !token.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // 2. Parse the onboarding data
    const body = await req.json()
    const { organization, compliance, entityType } = body

    // 3. Update the User record (onboardingCompleted is tracked via JWT, not a DB field)
    await db.user.update({
      where: { id: token.id as string },
      data: {
        lastLoginAt: new Date(),
      },
    })

    // 4. Update the Tenant record with organization details
    const tenantUpdateData: Record<string, unknown> = {}

    if (organization?.legalName) {
      tenantUpdateData.legalName = organization.legalName
    }
    if (organization?.taxId) {
      tenantUpdateData.taxId = organization.taxId
    }
    if (organization?.country) {
      tenantUpdateData.countryCode = organization.country
      tenantUpdateData.country = organization.country
    }

    // Set EUDR compliance status based on onboarding answers
    if (compliance) {
      // If they export to EU and have due diligence + geolocation, mark as compliant-ready
      if (compliance.exportsToEU && compliance.hasDueDiligenceProcess && compliance.hasGeolocationData) {
        tenantUpdateData.eudrCompliant = true
      }
    }

    if (Object.keys(tenantUpdateData).length > 0) {
      await db.tenant.update({
        where: { id: token.tenantId as string },
        data: tenantUpdateData,
      })
    }

    // 5. Create an audit log entry
    await db.auditLog.create({
      data: {
        tenantId: token.tenantId as string,
        userId: token.id as string,
        action: 'ONBOARDING_COMPLETED',
        entity: 'User',
        entityId: token.id as string,
        details: JSON.stringify({
          entityType: entityType || token.entityType,
          hasOrganizationDetails: !!organization?.legalName,
          eudrComplianceAssessed: !!compliance,
          exportsToEU: compliance?.exportsToEU || false,
        }),
      },
    })

    // 6. Re-encode the JWT with onboardingCompleted=true
    // This is critical so the middleware sees the updated status
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 24 * 60 * 60 // 24 hours

    const newToken = await encode({
      token: {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        tenantId: token.tenantId,
        tenantSlug: token.tenantSlug,
        tenantName: token.tenantName,
        entityType: token.entityType,
        currency: token.currency,
        currencySymbol: token.currencySymbol,
        language: token.language,
        isPlatformAdmin: token.isPlatformAdmin || false,
        tenantCreatedAt: token.tenantCreatedAt,
        onboardingCompleted: true, // ← Updated!
        iat: now,
        exp: now + maxAge,
      },
      secret: process.env.NEXTAUTH_SECRET || '',
    })

    // 7. Return success with the new session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    })

    // Set the updated NextAuth session cookie — must use the SAME name NextAuth expects
    const sessionCookieName = getSessionCookieName()
    const sessionCookieOpts = getSessionCookieOptions()
    response.cookies.set(sessionCookieName, newToken, {
      ...sessionCookieOpts,
      maxAge,
    })

    return response
  } catch (e: any) {
    console.error('[Onboarding Complete API] Error:', e)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}

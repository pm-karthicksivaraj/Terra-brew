/**
 * NextAuth.js v4 configuration with multi-tenant JWT strategy.
 * 
 * Two auth flows:
 * 1. Super Admin → /super-admin/login → PlatformUser table
 * 2. Tenant User → /t/[tenantSlug]/login → User table (scoped by tenantId)
 */
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'tenant-login',
      name: 'Tenant Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantSlug: { label: 'Tenant', type: 'text' },
      },
      async authorize(credentials) {
        console.log('[Auth] tenant-login attempt:', { email: credentials?.email, tenantSlug: credentials?.tenantSlug })

        if (!credentials?.email || !credentials?.password || !credentials?.tenantSlug) {
          console.log('[Auth] Missing required fields')
          throw new Error('Missing required fields')
        }

        const tenant = await db.tenant.findUnique({
          where: { slug: credentials.tenantSlug, isActive: true },
        })
        if (!tenant) {
          console.log('[Auth] Tenant not found:', credentials.tenantSlug)
          throw new Error('Tenant not found or inactive')
        }

        const user = await db.user.findUnique({
          where: { email_tenantId: { email: credentials.email, tenantId: tenant.id } },
        })
        if (!user) {
          console.log('[Auth] User not found:', credentials.email)
          throw new Error('Invalid credentials')
        }
        if (!user.isActive) throw new Error('Account deactivated')

        const valid = await verifyPassword(credentials.password, user.passwordHash)
        if (!valid) {
          console.log('[Auth] Invalid password for:', credentials.email)
          throw new Error('Invalid credentials')
        }

        console.log('[Auth] Login successful:', credentials.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantName: tenant.name,
          currency: tenant.currency,
          currencySymbol: tenant.currencySymbol,
          language: tenant.language,
        }
      },
    }),
    CredentialsProvider({
      id: 'platform-login',
      name: 'Platform Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing required fields')
        }

        const admin = await db.platformUser.findUnique({
          where: { email: credentials.email },
        })
        if (!admin) throw new Error('Invalid credentials')
        if (!admin.isActive) throw new Error('Account deactivated')

        const valid = await verifyPassword(credentials.password, admin.passwordHash)
        if (!valid) throw new Error('Invalid credentials')

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isPlatformAdmin: true,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId
        token.tenantSlug = (user as any).tenantSlug
        token.tenantName = (user as any).tenantName
        token.currency = (user as any).currency
        token.currencySymbol = (user as any).currencySymbol
        token.language = (user as any).language
        token.isPlatformAdmin = (user as any).isPlatformAdmin || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).tenantId = token.tenantId
        ;(session.user as any).tenantSlug = token.tenantSlug
        ;(session.user as any).tenantName = token.tenantName
        ;(session.user as any).currency = token.currency
        ;(session.user as any).currencySymbol = token.currencySymbol
        ;(session.user as any).language = token.language
        ;(session.user as any).isPlatformAdmin = token.isPlatformAdmin
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Type extensions for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      tenantId?: string
      tenantSlug?: string
      tenantName?: string
      currency?: string
      currencySymbol?: string
      language?: string
      isPlatformAdmin?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    tenantId?: string
    tenantSlug?: string
    tenantName?: string
    currency?: string
    currencySymbol?: string
    language?: string
    isPlatformAdmin?: boolean
  }
}

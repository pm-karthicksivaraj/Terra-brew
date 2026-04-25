import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    // Protect all dashboard and module routes
    '/dashboard/:path*',
    '/farmers/:path*',
    '/farmlands/:path*',
    '/cultivations/:path*',
    '/nurseries/:path*',
    '/land-preparations/:path*',
    '/crop-monitorings/:path*',
    '/fertilizer-apps/:path*',
    '/pest-disease/:path*',
    '/harvest/:path*',
    '/procurement/:path*',
    '/processing/:path*',
    '/cert-assessments/:path*',
    '/coffee-inspections/:path*',
    '/smart-contracts/:path*',
    '/marketplace/:path*',
    '/users/:path*',
    '/blockchain/:path*',
    '/qr-verify/:path*',
    '/traceability/:path*',
    // Protect super-admin dashboard (but not the login page)
    '/super-admin/dashboard/:path*',
  ],
}

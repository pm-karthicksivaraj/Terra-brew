/**
 * NextAuth v4 secure cookie naming utilities.
 *
 * On HTTPS (production / Vercel), NextAuth with `trustHost: true` uses
 * `__Secure-next-auth.session-token` as the cookie name.
 * On HTTP (localhost), it uses `next-auth.session-token`.
 *
 * Custom login APIs must match this naming convention, otherwise
 * the session cookie set by the login API won't be found by NextAuth's
 * session reader, causing the user to appear unauthenticated.
 */

export function getSessionCookieName(): string {
  const useSecureCookies =
    process.env.NODE_ENV === 'production' ||
    (process.env.NEXTAUTH_URL?.startsWith('https://') ?? false)
  return useSecureCookies
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'
}

export function getCallbackUrlCookieName(): string {
  const useSecureCookies =
    process.env.NODE_ENV === 'production' ||
    (process.env.NEXTAUTH_URL?.startsWith('https://') ?? false)
  return useSecureCookies
    ? '__Secure-next-auth.callback-url'
    : 'next-auth.callback-url'
}

export function getSessionCookieOptions() {
  const useSecureCookies =
    process.env.NODE_ENV === 'production' ||
    (process.env.NEXTAUTH_URL?.startsWith('https://') ?? false)
  return {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60,
  }
}

export function getCallbackUrlCookieOptions() {
  const useSecureCookies =
    process.env.NODE_ENV === 'production' ||
    (process.env.NEXTAUTH_URL?.startsWith('https://') ?? false)
  return {
    httpOnly: false,
    secure: useSecureCookies,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60,
  }
}

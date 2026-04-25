---
Task ID: 1
Agent: Main Agent
Task: Fix all three runtime errors (removeChild, Failed to fetch x2) + create middleware

Work Log:
- Analyzed root cause of "Failed to fetch" login error: NextAuth v4's signIn() CSRF token flow is broken with Next.js 16.1.3 App Router
- Modified /api/auth/login/route.ts to use next-auth/jwt encode() to set the session cookie directly, eliminating need for signIn() call
- Modified /api/auth/platform-login/route.ts with the same fix for super-admin login
- Updated src/components/pages/login-page.tsx to remove signIn() call and use single-step login via custom API
- Updated src/components/pages/super-admin-login-page.tsx with the same fix
- Fixed removeChild hydration mismatch in dashboard-shell.tsx by adding mounted guard state
- Fixed ThemeProvider in providers.tsx (added enableColorScheme={false})
- Created src/proxy.ts (Next.js 16 replacement for middleware.ts) with NextAuth withAuth route protection
- Verified build succeeds with no errors
- Tested login API: returns 200 OK with session cookie set correctly

Stage Summary:
- All 3 runtime errors fixed: removeChild, Failed to fetch on login, Failed to fetch on super-admin login
- Login flow now uses single-step: custom API validates + sets JWT cookie directly
- Hydration mismatch prevented with mounted guard + CSS safety
- Route protection added via proxy.ts (NextAuth middleware)
- Build successful, API tested and working

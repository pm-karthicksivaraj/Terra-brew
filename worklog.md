---
Task ID: 1
Agent: Main Agent
Task: Fix TerraBrew Flutter mobile app login stuck on loading

Work Log:
- Analyzed uploaded screenshot (filename encoding issue prevented VLM analysis)
- Deep code exploration revealed 5 critical bugs in the auth flow
- Bug #1 (CRITICAL): Dual auth providers — router reads from core provider, login updates features provider
- Bug #2: _isRefreshEndpoint() too broad — wrong password wipes existing session tokens
- Bug #3: onAuthFailure callback never wired up — expired tokens don't redirect to login
- Bug #4: Profile sign-out only navigates, doesn't clear auth state/tokens
- Bug #5: Platform admin missing tenantId causes empty X-Tenant-Id header

Fixes Applied:
1. Rewrote core/providers/auth_provider.dart — authProvider is now a computed Provider that derives from features authStateProvider, fixing the dual-provider desync
2. Fixed api_interceptor.dart _isRefreshEndpoint() — now only matches /mobile/auth/refresh exactly
3. Wired up ApiInterceptor.onAuthFailure in main.dart — calls logout and redirects to login on token expiry
4. Fixed profile sign-out in app_router.dart — now calls authStateProvider.notifier.logout() before navigating
5. Fixed auth_repository.dart — only saves tenantId when non-empty (skips for platform admins)

Stage Summary:
- Root cause: Login updates features/auth/.../authStateProvider but router/guards read from core/providers/authProvider — they were never in sync
- Core auth provider now delegates to features provider via Riverpod computed Provider
- All existing consumers of core providers (route_guards, main_layout, app_router) continue to work without import changes

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/auth_provider.dart';

/// Route guard: Auth check - redirect to login if no token
GoRouterRedirect? authGuard(Ref ref) {
  return (context, state) {
    final isAuthenticated = ref.read(isAuthenticatedProvider);
    final currentPath = state.matchedLocation;

    // Allow access to splash and login without auth
    final publicPaths = ['/splash', '/login'];
    if (publicPaths.contains(currentPath)) return null;

    // Redirect to login if not authenticated
    if (!isAuthenticated) return '/login';

    return null;
  };
}

/// Route guard: RBAC check - redirect to dashboard if no access
GoRouterRedirect? rbacGuard(Ref ref, String requiredPermission) {
  return (context, state) {
    final auth = ref.read(authProvider);
    final currentPath = state.matchedLocation;

    // Super admin has access to everything
    if (auth.isSuperAdmin) return null;

    // Check if user has required permission
    if (!auth.hasPermission(requiredPermission)) {
      return '/dashboard';
    }

    return null;
  };
}

/// Route guard: Super admin route protection
GoRouterRedirect? superAdminGuard(Ref ref) {
  return (context, state) {
    final auth = ref.read(authProvider);

    if (!auth.isSuperAdmin) {
      return '/dashboard';
    }

    return null;
  };
}

/// Combined redirect logic for the router
String? handleRedirect(Ref ref, String matchedLocation) {
  final isAuthenticated = ref.read(isAuthenticatedProvider);
  final auth = ref.read(authProvider);

  // Public paths - always accessible
  final publicPaths = ['/splash', '/login'];
  if (publicPaths.contains(matchedLocation)) {
    // If authenticated and trying to access login, redirect to dashboard
    if (isAuthenticated && matchedLocation == '/login') {
      return '/dashboard';
    }
    return null;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) return '/login';

  // Super admin paths
  if (matchedLocation.startsWith('/super-admin')) {
    if (!auth.isSuperAdmin) return '/dashboard';
  }

  // Permission-based route access
  final routePermissions = <String, String>{
    '/dashboard': 'dashboard',
    '/eudr': 'eudr-compliance',
    '/map': 'farmlands',
    '/trading': 'trading-desk',
    '/farmers': 'farmers',
    '/farmlands': 'farmlands',
    '/cultivations': 'cultivations',
    '/nurseries': 'nurseries',
    '/land-preparations': 'land-preparations',
    '/crop-monitorings': 'crop-monitorings',
    '/fertilizer-apps': 'fertilizer-apps',
    '/pest-disease-mgmts': 'pest-disease-mgmts',
    '/harvest-traceabilities': 'harvest-traceabilities',
    '/climate-intelligence': 'climate-intelligence',
    '/procurement': 'procurement',
    '/processing': 'processing',
    '/coffee-inspections': 'coffee-inspections',
    '/qc-verifications': 'qc-verifications',
    '/cert-assessments': 'cert-assessments',
    '/deforestation': 'deforestation',
    '/trace-journey': 'trace-journey',
    '/carbon': 'carbon-tracking',
    '/trust-score': 'trust-score',
    '/esg-reporting': 'esg-reporting',
    '/marketplace': 'marketplace',
    '/rfq': 'rfq',
    '/inspections': 'inspections',
    '/product-monitoring': 'product-monitoring',
    '/smart-contracts': 'smart-contracts',
    '/shipments': 'shipments',
    '/logistics': 'logistics',
    '/export-docs': 'export-docs',
    '/buyers': 'buyers',
    '/buyer-portal': 'buyer-portal',
    '/billing': 'billing',
    '/users': 'users',
    '/iot-sensors': 'iot-sensors',
    '/blockchain': 'blockchain',
    '/api-settings': 'api-settings',
  };

  // Check permission for exact match or parent path
  for (final entry in routePermissions.entries) {
    if (matchedLocation == entry.key || matchedLocation.startsWith('${entry.key}/')) {
      if (!auth.hasPermission(entry.value) && !auth.isSuperAdmin) {
        return '/dashboard';
      }
      break;
    }
  }

  return null;
}

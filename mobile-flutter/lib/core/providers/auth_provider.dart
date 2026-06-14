import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/domain/providers/auth_provider.dart';
import '../../features/auth/data/models/user_model.dart';

/// User role enum for RBAC
enum UserRole {
  superAdmin,
  admin,
  manager,
  inspector,
  operator,
  viewer,
}

/// Entity type for multi-tenant context
enum EntityType {
  cooperative,
  processor,
  exporter,
  importer,
  roaster,
  certifier,
  government,
}

/// Auth state model used by routing and RBAC guards.
///
/// This is now a COMPUTED provider that derives its state from the
/// features auth provider ([authStateProvider]). When login succeeds
/// in the features layer, this provider automatically reflects the
/// authenticated state, so route guards and tab visibility work correctly.
class AuthState {
  final bool isAuthenticated;
  final String? token;
  final String? userId;
  final String? email;
  final String? name;
  final String? avatarUrl;
  final UserRole role;
  final EntityType entityType;
  final String? tenantId;
  final Set<String> permissions;

  const AuthState({
    this.isAuthenticated = false,
    this.token,
    this.userId,
    this.email,
    this.name,
    this.avatarUrl,
    this.role = UserRole.viewer,
    this.entityType = EntityType.cooperative,
    this.tenantId,
    this.permissions = const {},
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? token,
    String? userId,
    String? email,
    String? name,
    String? avatarUrl,
    UserRole? role,
    EntityType? entityType,
    String? tenantId,
    Set<String>? permissions,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      token: token ?? this.token,
      userId: userId ?? this.userId,
      email: email ?? this.email,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      entityType: entityType ?? this.entityType,
      tenantId: tenantId ?? this.tenantId,
      permissions: permissions ?? this.permissions,
    );
  }

  bool hasPermission(String permission) => permissions.contains(permission);

  bool get isSuperAdmin => role == UserRole.superAdmin;

  String get initials {
    if (name == null || name!.isEmpty) return '??';
    final parts = name!.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}

// ── Role / Entity mapping helpers ─────────────────────────────────

/// Maps a string role from the server/API to the [UserRole] enum.
///
/// Handles common formats: "superAdmin", "super_admin", "SUPER_ADMIN", etc.
UserRole _mapRole(String roleStr) {
  // Try exact enum name match first (e.g. "superAdmin")
  for (final role in UserRole.values) {
    if (role.name == roleStr) return role;
  }
  // Try snake_case match (e.g. "super_admin" → superAdmin)
  final camelCase = roleStr
      .split('_')
      .asMap()
      .entries
      .map((e) => e.key == 0 ? e.value.toLowerCase() : _capitalize(e.value.toLowerCase()))
      .join('');
  for (final role in UserRole.values) {
    if (role.name == camelCase) return role;
  }
  // Try case-insensitive match
  for (final role in UserRole.values) {
    if (role.name.toLowerCase() == roleStr.toLowerCase()) return role;
  }
  return UserRole.viewer;
}

String _capitalize(String s) {
  if (s.isEmpty) return s;
  return s[0].toUpperCase() + s.substring(1);
}

/// Maps a string entity type from the server to the [EntityType] enum.
EntityType _mapEntityType(String entityStr) {
  for (final et in EntityType.values) {
    if (et.name == entityStr) return et;
  }
  // Try snake_case → camelCase
  final camelCase = entityStr
      .split('_')
      .asMap()
      .entries
      .map((e) => e.key == 0 ? e.value.toLowerCase() : _capitalize(e.value.toLowerCase()))
      .join('');
  for (final et in EntityType.values) {
    if (et.name == camelCase) return et;
  }
  return EntityType.cooperative;
}

/// Computes the set of permission strings for a given [UserRole].
Set<String> _getPermissionsForRole(UserRole role) {
  switch (role) {
    case UserRole.superAdmin:
      return {...AppModules.allModules};
    case UserRole.admin:
      return {...AppModules.allModules}..remove('api-settings');
    case UserRole.manager:
      return {...AppModules.farmModules, ...AppModules.processingModules, ...AppModules.complianceModules, ...AppModules.tradeModules, 'dashboard', 'analytics'};
    case UserRole.inspector:
      return {'dashboard', 'analytics', 'coffee-inspections', 'qc-verifications', 'eudr-compliance', 'cert-assessments', 'trace-journey', 'trust-score'};
    case UserRole.operator:
      return {'dashboard', 'farmers', 'farmlands', 'cultivations', 'nurseries', 'procurement', 'processing', 'shipments', 'logistics'};
    case UserRole.viewer:
      return {'dashboard', 'analytics'};
  }
}

// ── Providers ─────────────────────────────────────────────────────

/// Core auth state provider.
///
/// DERIVED from the features-layer [authStateProvider]. This ensures
/// that when login succeeds (updating the features provider), the
/// core provider immediately reflects the authenticated state —
/// fixing the bug where route guards read from a stale provider.
final authProvider = Provider<AuthState>((ref) {
  final featuresState = ref.watch(authStateProvider);

  if (featuresState is AuthAuthenticated) {
    final user = featuresState.user;
    final role = _mapRole(user.role);
    final entityType = _mapEntityType(user.entityType);

    return AuthState(
      isAuthenticated: true,
      token: null, // Token is managed by AuthStorage / ApiInterceptor
      userId: user.id,
      email: user.email,
      name: user.name,
      role: role,
      entityType: entityType,
      tenantId: user.tenantId.isNotEmpty ? user.tenantId : null,
      permissions: _getPermissionsForRole(role),
    );
  }

  // Not authenticated — return default unauthenticated state
  return const AuthState();
});

/// Convenience provider: whether the user is authenticated.
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

/// Convenience provider: the full auth state for the current user.
final currentUserProvider = Provider<AuthState>((ref) {
  return ref.watch(authProvider);
});

/// RBAC module definitions
class AppModules {
  AppModules._();

  // Overview
  static const String dashboard = 'dashboard';
  static const String analytics = 'analytics';

  // Farm
  static const String farmers = 'farmers';
  static const String farmlands = 'farmlands';
  static const String cultivations = 'cultivations';
  static const String nurseries = 'nurseries';
  static const String landPreparations = 'land-preparations';
  static const String cropMonitorings = 'crop-monitorings';
  static const String fertilizerApps = 'fertilizer-apps';
  static const String pestDiseaseMgmts = 'pest-disease-mgmts';
  static const String harvestTraceabilities = 'harvest-traceabilities';
  static const String climateIntelligence = 'climate-intelligence';

  // Processing
  static const String procurement = 'procurement';
  static const String processing = 'processing';
  static const String coffeeInspections = 'coffee-inspections';
  static const String qcVerifications = 'qc-verifications';

  // Compliance
  static const String eudrCompliance = 'eudr-compliance';
  static const String certAssessments = 'cert-assessments';
  static const String deforestation = 'deforestation';
  static const String traceJourney = 'trace-journey';
  static const String carbonTracking = 'carbon-tracking';
  static const String trustScore = 'trust-score';
  static const String esgReporting = 'esg-reporting';

  // Trade
  static const String marketplace = 'marketplace';
  static const String rfq = 'rfq';
  static const String inspections = 'inspections';
  static const String productMonitoring = 'product-monitoring';
  static const String smartContracts = 'smart-contracts';
  static const String tradingDesk = 'trading-desk';
  static const String shipments = 'shipments';
  static const String logistics = 'logistics';
  static const String exportDocs = 'export-docs';
  static const String buyers = 'buyers';
  static const String buyerPortal = 'buyer-portal';

  // Finance
  static const String billing = 'billing';
  static const String users = 'users';

  // System
  static const String iotSensors = 'iot-sensors';
  static const String blockchain = 'blockchain';
  static const String apiSettings = 'api-settings';

  // Module groups
  static const Set<String> overviewModules = {dashboard, analytics};
  static const Set<String> farmModules = {
    farmers, farmlands, cultivations, nurseries, landPreparations,
    cropMonitorings, fertilizerApps, pestDiseaseMgmts, harvestTraceabilities,
    climateIntelligence,
  };
  static const Set<String> processingModules = {
    procurement, processing, coffeeInspections, qcVerifications,
  };
  static const Set<String> complianceModules = {
    eudrCompliance, certAssessments, deforestation, traceJourney,
    carbonTracking, trustScore, esgReporting,
  };
  static const Set<String> tradeModules = {
    marketplace, rfq, inspections, productMonitoring, smartContracts,
    tradingDesk, shipments, logistics, exportDocs, buyers, buyerPortal,
  };
  static const Set<String> financeModules = {billing, users};
  static const Set<String> systemModules = {iotSensors, blockchain, apiSettings};

  static const Set<String> allModules = {
    ...overviewModules, ...farmModules, ...processingModules,
    ...complianceModules, ...tradeModules, ...financeModules, ...systemModules,
  };
}

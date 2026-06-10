import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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

/// Auth state model
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

/// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final FlutterSecureStorage _storage;

  AuthNotifier(this._storage) : super(const AuthState()) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final token = await _storage.read(key: 'auth_token');
    final userId = await _storage.read(key: 'user_id');
    final email = await _storage.read(key: 'user_email');
    final name = await _storage.read(key: 'user_name');
    final avatarUrl = await _storage.read(key: 'avatar_url');
    final roleStr = await _storage.read(key: 'user_role');
    final entityTypeStr = await _storage.read(key: 'entity_type');
    final tenantId = await _storage.read(key: 'tenant_id');

    if (token != null && userId != null) {
      state = AuthState(
        isAuthenticated: true,
        token: token,
        userId: userId,
        email: email,
        name: name,
        avatarUrl: avatarUrl,
        role: roleStr != null
            ? UserRole.values.firstWhere(
                (r) => r.name == roleStr,
                orElse: () => UserRole.viewer,
              )
            : UserRole.viewer,
        entityType: entityTypeStr != null
            ? EntityType.values.firstWhere(
                (e) => e.name == entityTypeStr,
                orElse: () => EntityType.cooperative,
              )
            : EntityType.cooperative,
        tenantId: tenantId,
        permissions: _getPermissionsForRole(
          roleStr != null
              ? UserRole.values.firstWhere(
                  (r) => r.name == roleStr,
                  orElse: () => UserRole.viewer,
                )
              : UserRole.viewer,
        ),
      );
    }
  }

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

  Future<void> login({
    required String token,
    required String userId,
    String? email,
    String? name,
    String? avatarUrl,
    required UserRole role,
    required EntityType entityType,
    String? tenantId,
  }) async {
    final permissions = _getPermissionsForRole(role);

    state = AuthState(
      isAuthenticated: true,
      token: token,
      userId: userId,
      email: email,
      name: name,
      avatarUrl: avatarUrl,
      role: role,
      entityType: entityType,
      tenantId: tenantId,
      permissions: permissions,
    );

    await _storage.write(key: 'auth_token', value: token);
    await _storage.write(key: 'user_id', value: userId);
    if (email != null) await _storage.write(key: 'user_email', value: email);
    if (name != null) await _storage.write(key: 'user_name', value: name);
    if (avatarUrl != null) await _storage.write(key: 'avatar_url', value: avatarUrl);
    await _storage.write(key: 'user_role', value: role.name);
    await _storage.write(key: 'entity_type', value: entityType.name);
    if (tenantId != null) await _storage.write(key: 'tenant_id', value: tenantId);
  }

  Future<void> logout() async {
    state = const AuthState();
    await _storage.deleteAll();
  }
}

/// Secure storage provider
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// Auth state provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(secureStorageProvider));
});

/// Convenience providers
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

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

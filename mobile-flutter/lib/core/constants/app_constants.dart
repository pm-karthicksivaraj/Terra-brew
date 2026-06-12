class AppConstants {
  AppConstants._();

  static const String appName = 'TerraBrew Coffee';
  static const String appTagline = 'EUDR Compliance & Traceability';

  // Storage keys
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String rememberMeKey = 'remember_me';
  static const String savedEmailKey = 'saved_email';
  static const String savedTenantSlugKey = 'saved_tenant_slug';

  // API
  static const String apiBaseUrl = '/api';
  static const String mobileAuthEndpoint = '/mobile/auth';
  static const String mobilePlatformAuthEndpoint = '/mobile/auth/platform';

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Pagination
  static const int defaultPageSize = 20;

  // Roles (string values matching UserRole enum)
  static const String roleAdmin = 'super_admin';
  static const String roleFieldOfficer = 'field_officer';
  static const String roleViewer = 'viewer';

  // Gender Options
  static const List<String> genderOptions = ['Male', 'Female', 'Other'];

  // Coffee Producing Countries
  static const List<String> coffeeProducingCountries = [
    'Ethiopia', 'Colombia', 'Brazil', 'Vietnam', 'Indonesia',
    'Honduras', 'India', 'Uganda', 'Peru', 'Mexico',
    'Guatemala', 'Nicaragua', 'Costa Rica', 'Kenya', 'Tanzania',
    'Rwanda', 'Papua New Guinea', 'Ecuador', 'El Salvador', 'Cameroon',
  ];

  // Soil Types
  static const List<String> soilTypes = [
    'Volcanic', 'Loam', 'Sandy Loam', 'Clay Loam', 'Red Soil',
    'Laterite', 'Alluvial', 'Peat', 'Sandy', 'Clay',
  ];
}

enum UserRole {
  superAdmin('super_admin'),
  tenantAdmin('tenant_admin'),
  operationsManager('operations_manager'),
  fieldOfficer('field_officer'),
  qualityController('quality_controller'),
  trader('trader'),
  financeManager('finance_manager'),
  buyer('buyer'),
  viewer('viewer');

  const UserRole(this.value);
  final String value;

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (e) => e.value == value,
      orElse: () => UserRole.viewer,
    );
  }

  String get displayName {
    switch (this) {
      case UserRole.superAdmin:
        return 'Super Admin';
      case UserRole.tenantAdmin:
        return 'Tenant Admin';
      case UserRole.operationsManager:
        return 'Operations Manager';
      case UserRole.fieldOfficer:
        return 'Field Officer';
      case UserRole.qualityController:
        return 'Quality Controller';
      case UserRole.trader:
        return 'Trader';
      case UserRole.financeManager:
        return 'Finance Manager';
      case UserRole.buyer:
        return 'Buyer';
      case UserRole.viewer:
        return 'Viewer';
    }
  }

  bool get isAdmin => this == UserRole.superAdmin || this == UserRole.tenantAdmin;
  bool get canManageUsers => isAdmin;
  bool get canManageFarms => isAdmin || this == UserRole.operationsManager || this == UserRole.fieldOfficer;
  bool get canAccessCompliance => isAdmin || this == UserRole.qualityController || this == UserRole.operationsManager;
  bool get canTrade => this == UserRole.trader || isAdmin;
  bool get canAccessFinance => this == UserRole.financeManager || isAdmin;
  bool get canBuy => this == UserRole.buyer;
}

enum EntityType {
  producer('producer'),
  aggregator('aggregator'),
  exporter('exporter'),
  importer('importer'),
  certificationBody('certification_body'),
  laboratory('laboratory');

  const EntityType(this.value);
  final String value;

  static EntityType fromString(String value) {
    return EntityType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => EntityType.producer,
    );
  }

  String get displayName {
    switch (this) {
      case EntityType.producer:
        return 'Producer';
      case EntityType.aggregator:
        return 'Aggregator';
      case EntityType.exporter:
        return 'Exporter';
      case EntityType.importer:
        return 'Importer';
      case EntityType.certificationBody:
        return 'Certification Body';
      case EntityType.laboratory:
        return 'Laboratory';
    }
  }
}

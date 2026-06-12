/// RBAC (Role-Based Access Control) constants for TerraBrew Coffee.
///
/// Defines all roles, entity types, access levels, modules, and the
/// complete permission matrix that determines what each combination of
/// entity type + role can access. This mirrors the web app's
/// module-config.ts exactly.
///
/// Access = min(entityTypeAccess, roleAccess)
/// - If either is 'hidden', the result is 'hidden'.
/// - If either is 'view' and the other is not 'hidden', the result is 'view'.
/// - If both are 'full', the result is 'full'.

// ═══════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════

/// Roles within each tenant entity.
///
/// - super_admin:     Platform operator managing all tenants, price tickers, platform settings.
/// - tenant_admin:    Organization administrator — manages their org's users, settings, all modules.
/// - operations_manager: Oversees farm operations and processing.
/// - field_officer:   Collects data in the field, registers farmers.
/// - quality_controller: Manages inspections, QC, EUDR compliance.
/// - trader:          Handles marketplace, RFQ, trading, shipments.
/// - finance_manager: Manages billing, payments, financial reports.
/// - buyer:           External buyer with access to buyer portal and trade modules.
/// - viewer:          Read-only access to permitted modules.
enum AppRole {
  superAdmin('super_admin'),
  tenantAdmin('tenant_admin'),
  operationsManager('operations_manager'),
  fieldOfficer('field_officer'),
  qualityController('quality_controller'),
  trader('trader'),
  financeManager('finance_manager'),
  buyer('buyer'),
  viewer('viewer');

  const AppRole(this.value);

  /// String value matching the backend API.
  final String value;

  /// Display label for the role.
  String get label {
    switch (this) {
      case AppRole.superAdmin:
        return 'Super Admin';
      case AppRole.tenantAdmin:
        return 'Administrator';
      case AppRole.operationsManager:
        return 'Operations Manager';
      case AppRole.fieldOfficer:
        return 'Field Officer';
      case AppRole.qualityController:
        return 'Quality Controller';
      case AppRole.trader:
        return 'Trader';
      case AppRole.financeManager:
        return 'Finance Manager';
      case AppRole.buyer:
        return 'Buyer';
      case AppRole.viewer:
        return 'Viewer';
    }
  }

  /// Vietnamese label for the role.
  String get labelVi {
    switch (this) {
      case AppRole.superAdmin:
        return 'Siêu Quản trị';
      case AppRole.tenantAdmin:
        return 'Quản trị viên';
      case AppRole.operationsManager:
        return 'Quản lý vận hành';
      case AppRole.fieldOfficer:
        return 'Cán bộ hiện trường';
      case AppRole.qualityController:
        return 'Kiểm soát chất lượng';
      case AppRole.trader:
        return 'Thương nhân';
      case AppRole.financeManager:
        return 'Quản lý tài chính';
      case AppRole.buyer:
        return 'Người mua';
      case AppRole.viewer:
        return 'Người xem';
    }
  }

  /// Find an AppRole from its string value.
  static AppRole fromValue(String value) {
    return AppRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => AppRole.viewer,
    );
  }
}

/// Entity types in the TerraBrew platform.
enum EntityType {
  producer('producer'),
  aggregator('aggregator'),
  exporter('exporter'),
  importer('importer'),
  certificationBody('certification_body'),
  laboratory('laboratory');

  const EntityType(this.value);

  /// String value matching the backend API.
  final String value;

  /// Display label for the entity type.
  String get label {
    switch (this) {
      case EntityType.producer:
        return 'Coffee Producer';
      case EntityType.aggregator:
        return 'Aggregator / Processor';
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

  /// Vietnamese label for the entity type.
  String get labelVi {
    switch (this) {
      case EntityType.producer:
        return 'Nhà sản xuất cà phê';
      case EntityType.aggregator:
        return 'Tập hợp / Chế biến';
      case EntityType.exporter:
        return 'Nhà xuất khẩu';
      case EntityType.importer:
        return 'Nhà nhập khẩu';
      case EntityType.certificationBody:
        return 'Tổ chức chứng nhận';
      case EntityType.laboratory:
        return 'Phòng thí nghiệm';
    }
  }

  /// Icon emoji for the entity type.
  String get icon {
    switch (this) {
      case EntityType.producer:
        return '🏭';
      case EntityType.aggregator:
        return '📦';
      case EntityType.exporter:
        return '🚢';
      case EntityType.importer:
        return '🏛️';
      case EntityType.certificationBody:
        return '✅';
      case EntityType.laboratory:
        return '🔬';
    }
  }

  /// Find an EntityType from its string value.
  static EntityType fromValue(String value) {
    return EntityType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => EntityType.producer,
    );
  }
}

/// Access levels for modules.
///
/// The ordering matters: hidden < view < full.
enum AccessLevel {
  hidden('hidden', 0),
  view('view', 1),
  full('full', 2);

  const AccessLevel(this.value, this.priority);

  /// String value matching the backend API.
  final String value;

  /// Numeric priority for comparison (higher = more access).
  final int priority;

  /// Find an AccessLevel from its string value.
  static AccessLevel fromValue(String value) {
    return AccessLevel.values.firstWhere(
      (level) => level.value == value,
      orElse: () => AccessLevel.hidden,
    );
  }
}

/// Navigation module categories matching the web app sidebar groups.
enum ModuleCategory {
  overview('overview', 'Overview', 'Tổng quan', true, 1),
  farm('farm', 'Farm Operations', 'Vận hành nông trại', true, 2),
  processing('processing', 'Processing & Quality', 'Chế biến & Chất lượng', false, 3),
  compliance('compliance', 'EUDR Compliance & Certification', 'Tuân thủ EUDR & Chứng nhận', false, 4),
  trade('trade', 'Trade & Logistics', 'Thương mại & Vận tải', false, 5),
  finance('finance', 'Finance & Admin', 'Tài chính & Quản trị', false, 6),
  system('system', 'System & Integrations', 'Hệ thống & Tích hợp', false, 7);

  const ModuleCategory(
    this.id,
    this.label,
    this.labelVi,
    this.defaultOpen,
    this.order,
  );

  final String id;
  final String label;
  final String labelVi;
  final bool defaultOpen;
  final int order;
}

/// All 32 application modules matching the web app sidebar.
///
/// Each module has a unique slug, display labels, route path,
/// icon name, accent color, category, and sort order within its group.
enum AppModule {
  // ── Overview ────────────────────────────────────────────────────
  dashboard('dashboard', 'Dashboard', 'Bảng điều khiển', '/dashboard', 'LayoutDashboard', '#059669', ModuleCategory.overview, 1),
  analytics('analytics', 'Analytics & Reports', 'Phân tích & Báo cáo', '/analytics', 'BarChart3', '#2563eb', ModuleCategory.overview, 2),

  // ── Farm Operations ─────────────────────────────────────────────
  farmers('farmers', 'Farmers', 'Nông dân', '/farmers', 'Users', '#059669', ModuleCategory.farm, 1),
  farmlands('farmlands', 'Farm Lands', 'Đất nông trại', '/farmlands', 'MapPin', '#d97706', ModuleCategory.farm, 2),
  cultivations('cultivations', 'Cultivations', 'Canh tác', '/cultivations', 'Sprout', '#2563eb', ModuleCategory.farm, 3),
  nurseries('nurseries', 'Nurseries', 'Vườn ươm', '/nurseries', 'TreePine', '#7c3aed', ModuleCategory.farm, 4),
  landPreparations('land-preparations', 'Land Preparation', 'Chuẩn bị đất', '/land-preparations', 'Tractor', '#0891b2', ModuleCategory.farm, 5),
  cropMonitorings('crop-monitorings', 'Crop Monitoring', 'Giám sát cây trồng', '/crop-monitorings', 'Activity', '#db2777', ModuleCategory.farm, 6),
  fertilizerApps('fertilizer-apps', 'Fertilizer Management', 'Quản lý phân bón', '/fertilizer-apps', 'FlaskConical', '#65a30d', ModuleCategory.farm, 7),
  pestDiseaseMgmts('pest-disease-mgmts', 'Pest & Disease', 'Sâu bệnh', '/pest-disease', 'Shield', '#dc2626', ModuleCategory.farm, 8),
  harvestTraceabilities('harvest-traceabilities', 'Harvest Traceability', 'Truy xuất thu hoạch', '/harvest', 'Wheat', '#b45309', ModuleCategory.farm, 9),
  climateIntelligence('climate-intelligence', 'Climate Intelligence', 'Khí hậu thông minh', '/climate-intelligence', 'Activity', '#00a3e0', ModuleCategory.farm, 10),

  // ── Processing & Quality ────────────────────────────────────────
  procurement('procurement', 'Procurement', 'Thu mua', '/procurement', 'Truck', '#4f46e5', ModuleCategory.processing, 1),
  processing('processing', 'Processing Pipeline', 'Dây chuyền chế biến', '/processing', 'Factory', '#0d9488', ModuleCategory.processing, 2),
  coffeeInspections('coffee-inspections', 'Coffee Inspection', 'Kiểm tra cà phê', '/coffee-inspections', 'ClipboardCheck', '#9333ea', ModuleCategory.processing, 3),
  qcVerifications('qc-verifications', 'QC Verifications', 'Kiểm định CL', '/qc-verifications', 'CheckCircle', '#059669', ModuleCategory.processing, 4),

  // ── EUDR Compliance & Certification ─────────────────────────────
  eudrCompliance('eudr-compliance', 'EUDR Records', 'Hồ sơ EUDR', '/eudr-compliance', 'Shield', '#dc2626', ModuleCategory.compliance, 1),
  certAssessments('cert-assessments', 'Certification Assessment', 'Đánh giá chứng nhận', '/cert-assessments', 'Award', '#be185d', ModuleCategory.compliance, 2),
  deforestation('deforestation', 'Deforestation Monitoring', 'Giám sát phá rừng', '/deforestation', 'TreePine', '#059669', ModuleCategory.compliance, 3),
  traceJourney('trace-journey', 'EUDR Compliance', 'Tuân thủ EUDR', '/traceability', 'Route', '#7c3aed', ModuleCategory.compliance, 4),
  carbonTracking('carbon-tracking', 'Carbon Tracking', 'Theo dõi Carbon', '/carbon-tracking', 'Activity', '#059669', ModuleCategory.compliance, 5),
  trustScore('trust-score', 'Trust Score™', 'Trust Score™', '/trust-score', 'Shield', '#ffc627', ModuleCategory.compliance, 6),
  esgReporting('esg-reporting', 'ESG Reporting', 'Báo cáo ESG', '/esg-reporting', 'BarChart3', '#6366f1', ModuleCategory.compliance, 7),

  // ── Trade & Logistics ───────────────────────────────────────────
  marketplace('marketplace', 'Marketplace', 'Thị trường', '/marketplace', 'Store', '#ea580c', ModuleCategory.trade, 1),
  rfq('rfq', 'RFQ Management', 'Quản lý RFQ', '/rfq', 'FileQuestion', '#7c3aed', ModuleCategory.trade, 2),
  inspections('inspections', 'Inspection Service', 'Dịch vụ kiểm tra', '/inspections', 'ClipboardCheck', '#9333ea', ModuleCategory.trade, 3),
  productMonitoring('product-monitoring', 'Product Monitoring', 'Giám sát sản phẩm', '/product-monitoring', 'Activity', '#0d9488', ModuleCategory.trade, 4),
  smartContracts('smart-contracts', 'Smart Contracts', 'Hợp đồng thông minh', '/smart-contracts', 'FileText', '#0369a1', ModuleCategory.trade, 5),
  tradingDesk('trading-desk', 'Trading Desk', 'Sàn giao dịch', '/trading-desk', 'TrendingUp', '#0d9488', ModuleCategory.trade, 6),
  shipments('shipments', 'Shipments', 'Vận chuyển', '/shipments', 'Ship', '#2563eb', ModuleCategory.trade, 7),
  logistics('logistics', 'Logistics Booking', 'Đặt logistics', '/logistics', 'Container', '#4f46e5', ModuleCategory.trade, 8),
  exportDocs('export-docs', 'Export Documents', 'Tài liệu xuất khẩu', '/export-docs', 'FileOutput', '#0891b2', ModuleCategory.trade, 9),
  buyers('buyers', 'Buyers', 'Người mua', '/buyers', 'UserCheck', '#65a30d', ModuleCategory.trade, 10),
  buyerPortal('buyer-portal', 'Buyer Portal', 'Cổng người mua', '/buyer-portal', 'UserCheck', '#00a3e0', ModuleCategory.trade, 11),

  // ── Finance & Admin ─────────────────────────────────────────────
  billing('billing', 'Billing', 'Thanh toán', '/billing', 'CreditCard', '#be185d', ModuleCategory.finance, 1),
  users('users', 'Users', 'Người dùng', '/users', 'UserCog', '#6366f1', ModuleCategory.finance, 2),

  // ── System & Integrations ───────────────────────────────────────
  iotSensors('iot-sensors', 'IoT Sensors', 'Cảm biến IoT', '/iot-sensors', 'Radio', '#0891b2', ModuleCategory.system, 1),
  blockchain('blockchain', 'Blockchain', 'Blockchain', '/blockchain', 'Link', '#7c3aed', ModuleCategory.system, 2),
  apiSettings('api-settings', 'API & Webhooks', 'API & Webhooks', '/api-settings', 'Webhook', '#6366f1', ModuleCategory.system, 3);

  const AppModule(
    this.slug,
    this.label,
    this.labelVi,
    this.href,
    this.iconName,
    this.colorHex,
    this.category,
    this.orderInGroup,
  );

  /// Unique slug identifier matching the Module table in the database.
  final String slug;

  /// English display label.
  final String label;

  /// Vietnamese display label.
  final String labelVi;

  /// Route path for navigation.
  final String href;

  /// Lucide icon name (for reference; Flutter uses Material icons).
  final String iconName;

  /// Hex color string for the module accent.
  final String colorHex;

  /// Navigation group this module belongs to.
  final ModuleCategory category;

  /// Sort order within the category group.
  final int orderInGroup;

  /// Find an AppModule from its slug string.
  static AppModule fromSlug(String slug) {
    return AppModule.values.firstWhere(
      (mod) => mod.slug == slug,
      orElse: () => AppModule.dashboard,
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// PERMISSION MATRIX
// ═══════════════════════════════════════════════════════════════════

/// Entity type access matrix: EntityType → AppModule → AccessLevel.
///
/// Defines what each entity type can see regardless of role.
/// This is the first gate in the access check.
const Map<EntityType, Map<AppModule, AccessLevel>> entityModuleAccess = {
  EntityType.producer: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.full,
    // Farm
    AppModule.farmers: AccessLevel.full,
    AppModule.farmlands: AccessLevel.full,
    AppModule.cultivations: AccessLevel.full,
    AppModule.nurseries: AccessLevel.full,
    AppModule.landPreparations: AccessLevel.full,
    AppModule.cropMonitorings: AccessLevel.full,
    AppModule.fertilizerApps: AccessLevel.full,
    AppModule.pestDiseaseMgmts: AccessLevel.full,
    AppModule.harvestTraceabilities: AccessLevel.full,
    AppModule.climateIntelligence: AccessLevel.full,
    // Processing
    AppModule.procurement: AccessLevel.full,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.view,
    AppModule.qcVerifications: AccessLevel.hidden,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.full,
    AppModule.deforestation: AccessLevel.full,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.full,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.view,
    AppModule.inspections: AccessLevel.view,
    AppModule.productMonitoring: AccessLevel.view,
    AppModule.smartContracts: AccessLevel.hidden,
    AppModule.tradingDesk: AccessLevel.hidden,
    AppModule.shipments: AccessLevel.hidden,
    AppModule.logistics: AccessLevel.hidden,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.hidden,
    AppModule.buyerPortal: AccessLevel.hidden,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.full,
    AppModule.blockchain: AccessLevel.full,
    AppModule.apiSettings: AccessLevel.full,
  },

  EntityType.aggregator: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.full,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.view,
    AppModule.climateIntelligence: AccessLevel.view,
    // Processing
    AppModule.procurement: AccessLevel.full,
    AppModule.processing: AccessLevel.full,
    AppModule.coffeeInspections: AccessLevel.view,
    AppModule.qcVerifications: AccessLevel.full,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.full,
    AppModule.deforestation: AccessLevel.full,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.full,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.full,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.full,
    AppModule.smartContracts: AccessLevel.full,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.full,
    AppModule.logistics: AccessLevel.full,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.full,
    AppModule.buyerPortal: AccessLevel.view,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.full,
    AppModule.blockchain: AccessLevel.full,
    AppModule.apiSettings: AccessLevel.full,
  },

  EntityType.exporter: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.full,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.hidden,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.hidden,
    AppModule.qcVerifications: AccessLevel.view,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.view,
    AppModule.deforestation: AccessLevel.view,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.full,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.full,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.full,
    AppModule.smartContracts: AccessLevel.full,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.full,
    AppModule.logistics: AccessLevel.full,
    AppModule.exportDocs: AccessLevel.full,
    AppModule.buyers: AccessLevel.full,
    AppModule.buyerPortal: AccessLevel.view,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.full,
    AppModule.apiSettings: AccessLevel.full,
  },

  EntityType.importer: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.full,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.hidden,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.hidden,
    AppModule.qcVerifications: AccessLevel.full,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.view,
    AppModule.deforestation: AccessLevel.hidden,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.full,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.full,
    AppModule.smartContracts: AccessLevel.full,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.full,
    AppModule.logistics: AccessLevel.full,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.full,
    AppModule.buyerPortal: AccessLevel.full,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.full,
    AppModule.apiSettings: AccessLevel.full,
  },

  EntityType.certificationBody: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.view,
    AppModule.farmlands: AccessLevel.view,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.hidden,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.full,
    AppModule.qcVerifications: AccessLevel.hidden,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.full,
    AppModule.deforestation: AccessLevel.full,
    AppModule.traceJourney: AccessLevel.view,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.view,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.hidden,
    AppModule.rfq: AccessLevel.hidden,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.hidden,
    AppModule.smartContracts: AccessLevel.hidden,
    AppModule.tradingDesk: AccessLevel.hidden,
    AppModule.shipments: AccessLevel.hidden,
    AppModule.logistics: AccessLevel.hidden,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.hidden,
    AppModule.buyerPortal: AccessLevel.view,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.hidden,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  EntityType.laboratory: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.hidden,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.full,
    AppModule.qcVerifications: AccessLevel.full,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.hidden,
    AppModule.certAssessments: AccessLevel.hidden,
    AppModule.deforestation: AccessLevel.hidden,
    AppModule.traceJourney: AccessLevel.hidden,
    AppModule.carbonTracking: AccessLevel.hidden,
    AppModule.trustScore: AccessLevel.hidden,
    AppModule.esgReporting: AccessLevel.hidden,
    // Trade
    AppModule.marketplace: AccessLevel.hidden,
    AppModule.rfq: AccessLevel.hidden,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.hidden,
    AppModule.smartContracts: AccessLevel.hidden,
    AppModule.tradingDesk: AccessLevel.hidden,
    AppModule.shipments: AccessLevel.hidden,
    AppModule.logistics: AccessLevel.hidden,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.hidden,
    AppModule.buyerPortal: AccessLevel.hidden,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.hidden,
    AppModule.apiSettings: AccessLevel.hidden,
  },
};

/// Role access matrix: AppRole → AppModule → AccessLevel.
///
/// Defines what each role can see regardless of entity type.
/// This is the second gate in the access check.
const Map<AppRole, Map<AppModule, AccessLevel>> roleModuleAccess = {
  AppRole.tenantAdmin: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.full,
    // Farm
    AppModule.farmers: AccessLevel.full,
    AppModule.farmlands: AccessLevel.full,
    AppModule.cultivations: AccessLevel.full,
    AppModule.nurseries: AccessLevel.full,
    AppModule.landPreparations: AccessLevel.full,
    AppModule.cropMonitorings: AccessLevel.full,
    AppModule.fertilizerApps: AccessLevel.full,
    AppModule.pestDiseaseMgmts: AccessLevel.full,
    AppModule.harvestTraceabilities: AccessLevel.full,
    AppModule.climateIntelligence: AccessLevel.full,
    // Processing
    AppModule.procurement: AccessLevel.full,
    AppModule.processing: AccessLevel.full,
    AppModule.coffeeInspections: AccessLevel.full,
    AppModule.qcVerifications: AccessLevel.full,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.full,
    AppModule.deforestation: AccessLevel.full,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.full,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.full,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.full,
    AppModule.smartContracts: AccessLevel.full,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.full,
    AppModule.logistics: AccessLevel.full,
    AppModule.exportDocs: AccessLevel.full,
    AppModule.buyers: AccessLevel.full,
    AppModule.buyerPortal: AccessLevel.full,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.full,
    // System
    AppModule.iotSensors: AccessLevel.full,
    AppModule.blockchain: AccessLevel.full,
    AppModule.apiSettings: AccessLevel.full,
  },

  AppRole.operationsManager: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.full,
    AppModule.farmlands: AccessLevel.full,
    AppModule.cultivations: AccessLevel.full,
    AppModule.nurseries: AccessLevel.full,
    AppModule.landPreparations: AccessLevel.full,
    AppModule.cropMonitorings: AccessLevel.full,
    AppModule.fertilizerApps: AccessLevel.full,
    AppModule.pestDiseaseMgmts: AccessLevel.full,
    AppModule.harvestTraceabilities: AccessLevel.full,
    AppModule.climateIntelligence: AccessLevel.full,
    // Processing
    AppModule.procurement: AccessLevel.full,
    AppModule.processing: AccessLevel.full,
    AppModule.coffeeInspections: AccessLevel.view,
    AppModule.qcVerifications: AccessLevel.view,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.view,
    AppModule.certAssessments: AccessLevel.view,
    AppModule.deforestation: AccessLevel.view,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.view,
    AppModule.esgReporting: AccessLevel.view,
    // Trade
    AppModule.marketplace: AccessLevel.view,
    AppModule.rfq: AccessLevel.view,
    AppModule.inspections: AccessLevel.view,
    AppModule.productMonitoring: AccessLevel.full,
    AppModule.smartContracts: AccessLevel.view,
    AppModule.tradingDesk: AccessLevel.view,
    AppModule.shipments: AccessLevel.full,
    AppModule.logistics: AccessLevel.full,
    AppModule.exportDocs: AccessLevel.view,
    AppModule.buyers: AccessLevel.view,
    AppModule.buyerPortal: AccessLevel.hidden,
    // Finance
    AppModule.billing: AccessLevel.hidden,
    AppModule.users: AccessLevel.hidden,
    // System
    AppModule.iotSensors: AccessLevel.full,
    AppModule.blockchain: AccessLevel.view,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  AppRole.fieldOfficer: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.hidden,
    // Farm
    AppModule.farmers: AccessLevel.full,
    AppModule.farmlands: AccessLevel.full,
    AppModule.cultivations: AccessLevel.full,
    AppModule.nurseries: AccessLevel.full,
    AppModule.landPreparations: AccessLevel.full,
    AppModule.cropMonitorings: AccessLevel.full,
    AppModule.fertilizerApps: AccessLevel.full,
    AppModule.pestDiseaseMgmts: AccessLevel.full,
    AppModule.harvestTraceabilities: AccessLevel.full,
    AppModule.climateIntelligence: AccessLevel.full,
    // Processing
    AppModule.procurement: AccessLevel.view,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.hidden,
    AppModule.qcVerifications: AccessLevel.hidden,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.hidden,
    AppModule.certAssessments: AccessLevel.hidden,
    AppModule.deforestation: AccessLevel.hidden,
    AppModule.traceJourney: AccessLevel.view,
    AppModule.carbonTracking: AccessLevel.hidden,
    AppModule.trustScore: AccessLevel.hidden,
    AppModule.esgReporting: AccessLevel.hidden,
    // Trade
    AppModule.marketplace: AccessLevel.hidden,
    AppModule.rfq: AccessLevel.hidden,
    AppModule.inspections: AccessLevel.hidden,
    AppModule.productMonitoring: AccessLevel.hidden,
    AppModule.smartContracts: AccessLevel.hidden,
    AppModule.tradingDesk: AccessLevel.hidden,
    AppModule.shipments: AccessLevel.hidden,
    AppModule.logistics: AccessLevel.hidden,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.hidden,
    AppModule.buyerPortal: AccessLevel.hidden,
    // Finance
    AppModule.billing: AccessLevel.hidden,
    AppModule.users: AccessLevel.hidden,
    // System
    AppModule.iotSensors: AccessLevel.view,
    AppModule.blockchain: AccessLevel.hidden,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  AppRole.qualityController: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.view,
    AppModule.farmlands: AccessLevel.view,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.view,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.view,
    AppModule.harvestTraceabilities: AccessLevel.view,
    AppModule.climateIntelligence: AccessLevel.view,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.full,
    AppModule.coffeeInspections: AccessLevel.full,
    AppModule.qcVerifications: AccessLevel.full,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.full,
    AppModule.certAssessments: AccessLevel.full,
    AppModule.deforestation: AccessLevel.full,
    AppModule.traceJourney: AccessLevel.view,
    AppModule.carbonTracking: AccessLevel.full,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.hidden,
    AppModule.rfq: AccessLevel.hidden,
    AppModule.inspections: AccessLevel.full,
    AppModule.productMonitoring: AccessLevel.full,
    AppModule.smartContracts: AccessLevel.hidden,
    AppModule.tradingDesk: AccessLevel.hidden,
    AppModule.shipments: AccessLevel.hidden,
    AppModule.logistics: AccessLevel.hidden,
    AppModule.exportDocs: AccessLevel.hidden,
    AppModule.buyers: AccessLevel.hidden,
    AppModule.buyerPortal: AccessLevel.hidden,
    // Finance
    AppModule.billing: AccessLevel.hidden,
    AppModule.users: AccessLevel.hidden,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.hidden,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  AppRole.trader: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.view,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.hidden,
    AppModule.qcVerifications: AccessLevel.view,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.view,
    AppModule.certAssessments: AccessLevel.hidden,
    AppModule.deforestation: AccessLevel.hidden,
    AppModule.traceJourney: AccessLevel.view,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.view,
    AppModule.esgReporting: AccessLevel.view,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.full,
    AppModule.inspections: AccessLevel.view,
    AppModule.productMonitoring: AccessLevel.view,
    AppModule.smartContracts: AccessLevel.full,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.full,
    AppModule.logistics: AccessLevel.full,
    AppModule.exportDocs: AccessLevel.view,
    AppModule.buyers: AccessLevel.full,
    AppModule.buyerPortal: AccessLevel.full,
    // Finance
    AppModule.billing: AccessLevel.hidden,
    AppModule.users: AccessLevel.hidden,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.hidden,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  AppRole.financeManager: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.full,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.hidden,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.full,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.hidden,
    AppModule.qcVerifications: AccessLevel.hidden,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.hidden,
    AppModule.certAssessments: AccessLevel.hidden,
    AppModule.deforestation: AccessLevel.hidden,
    AppModule.traceJourney: AccessLevel.hidden,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.view,
    AppModule.esgReporting: AccessLevel.full,
    // Trade
    AppModule.marketplace: AccessLevel.view,
    AppModule.rfq: AccessLevel.view,
    AppModule.inspections: AccessLevel.hidden,
    AppModule.productMonitoring: AccessLevel.hidden,
    AppModule.smartContracts: AccessLevel.view,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.view,
    AppModule.logistics: AccessLevel.view,
    AppModule.exportDocs: AccessLevel.view,
    AppModule.buyers: AccessLevel.view,
    AppModule.buyerPortal: AccessLevel.hidden,
    // Finance
    AppModule.billing: AccessLevel.full,
    AppModule.users: AccessLevel.view,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.hidden,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  AppRole.buyer: {
    // Overview
    AppModule.dashboard: AccessLevel.full,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.hidden,
    AppModule.farmlands: AccessLevel.hidden,
    AppModule.cultivations: AccessLevel.hidden,
    AppModule.nurseries: AccessLevel.hidden,
    AppModule.landPreparations: AccessLevel.hidden,
    AppModule.cropMonitorings: AccessLevel.hidden,
    AppModule.fertilizerApps: AccessLevel.hidden,
    AppModule.pestDiseaseMgmts: AccessLevel.hidden,
    AppModule.harvestTraceabilities: AccessLevel.view,
    AppModule.climateIntelligence: AccessLevel.hidden,
    // Processing
    AppModule.procurement: AccessLevel.hidden,
    AppModule.processing: AccessLevel.hidden,
    AppModule.coffeeInspections: AccessLevel.view,
    AppModule.qcVerifications: AccessLevel.view,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.view,
    AppModule.certAssessments: AccessLevel.view,
    AppModule.deforestation: AccessLevel.view,
    AppModule.traceJourney: AccessLevel.full,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.full,
    AppModule.esgReporting: AccessLevel.view,
    // Trade
    AppModule.marketplace: AccessLevel.full,
    AppModule.rfq: AccessLevel.full,
    AppModule.inspections: AccessLevel.view,
    AppModule.productMonitoring: AccessLevel.view,
    AppModule.smartContracts: AccessLevel.view,
    AppModule.tradingDesk: AccessLevel.full,
    AppModule.shipments: AccessLevel.view,
    AppModule.logistics: AccessLevel.view,
    AppModule.exportDocs: AccessLevel.view,
    AppModule.buyers: AccessLevel.full,
    AppModule.buyerPortal: AccessLevel.full,
    // Finance
    AppModule.billing: AccessLevel.view,
    AppModule.users: AccessLevel.hidden,
    // System
    AppModule.iotSensors: AccessLevel.hidden,
    AppModule.blockchain: AccessLevel.view,
    AppModule.apiSettings: AccessLevel.hidden,
  },

  AppRole.viewer: {
    // Overview
    AppModule.dashboard: AccessLevel.view,
    AppModule.analytics: AccessLevel.view,
    // Farm
    AppModule.farmers: AccessLevel.view,
    AppModule.farmlands: AccessLevel.view,
    AppModule.cultivations: AccessLevel.view,
    AppModule.nurseries: AccessLevel.view,
    AppModule.landPreparations: AccessLevel.view,
    AppModule.cropMonitorings: AccessLevel.view,
    AppModule.fertilizerApps: AccessLevel.view,
    AppModule.pestDiseaseMgmts: AccessLevel.view,
    AppModule.harvestTraceabilities: AccessLevel.view,
    AppModule.climateIntelligence: AccessLevel.view,
    // Processing
    AppModule.procurement: AccessLevel.view,
    AppModule.processing: AccessLevel.view,
    AppModule.coffeeInspections: AccessLevel.view,
    AppModule.qcVerifications: AccessLevel.view,
    // Compliance
    AppModule.eudrCompliance: AccessLevel.view,
    AppModule.certAssessments: AccessLevel.view,
    AppModule.deforestation: AccessLevel.view,
    AppModule.traceJourney: AccessLevel.view,
    AppModule.carbonTracking: AccessLevel.view,
    AppModule.trustScore: AccessLevel.view,
    AppModule.esgReporting: AccessLevel.view,
    // Trade
    AppModule.marketplace: AccessLevel.view,
    AppModule.rfq: AccessLevel.view,
    AppModule.inspections: AccessLevel.view,
    AppModule.productMonitoring: AccessLevel.view,
    AppModule.smartContracts: AccessLevel.view,
    AppModule.tradingDesk: AccessLevel.view,
    AppModule.shipments: AccessLevel.view,
    AppModule.logistics: AccessLevel.view,
    AppModule.exportDocs: AccessLevel.view,
    AppModule.buyers: AccessLevel.view,
    AppModule.buyerPortal: AccessLevel.view,
    // Finance
    AppModule.billing: AccessLevel.view,
    AppModule.users: AccessLevel.hidden,
    // System
    AppModule.iotSensors: AccessLevel.view,
    AppModule.blockchain: AccessLevel.view,
    AppModule.apiSettings: AccessLevel.hidden,
  },
};

// ═══════════════════════════════════════════════════════════════════
// ACCESS COMPUTATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/// Computes the effective access level for a given entity type, role,
/// and module by taking the minimum (most restrictive) of entity
/// type access and role access.
///
/// The access resolution follows these rules:
/// - If either is `hidden`, the result is `hidden`.
/// - If either is `view` and the other is not `hidden`, the result is `view`.
/// - If both are `full`, the result is `full`.
///
/// Super admins always get `full` access regardless of other factors.
AccessLevel getAccessLevel(
  EntityType entityType,
  AppRole role,
  AppModule module,
) {
  // Super admin always has full access
  if (role == AppRole.superAdmin) return AccessLevel.full;

  final entityAccess = entityModuleAccess[entityType]?[module] ?? AccessLevel.hidden;
  final roleAccess = roleModuleAccess[role]?[module] ?? AccessLevel.hidden;

  // If either is hidden, result is hidden
  if (entityAccess == AccessLevel.hidden || roleAccess == AccessLevel.hidden) {
    return AccessLevel.hidden;
  }

  // If either is view and the other isn't hidden, result is view
  if (entityAccess == AccessLevel.view || roleAccess == AccessLevel.view) {
    return AccessLevel.view;
  }

  // Both are full
  return AccessLevel.full;
}

/// Checks whether the user has at least the required access level
/// for a given module.
///
/// [requiredAccess] defaults to `view`.
bool hasAccess(
  EntityType entityType,
  AppRole role,
  AppModule module, {
  AccessLevel requiredAccess = AccessLevel.view,
}) {
  final effective = getAccessLevel(entityType, role, module);

  if (requiredAccess == AccessLevel.full) {
    return effective == AccessLevel.full;
  }

  // For 'view' requirement, any non-hidden access is sufficient
  return effective != AccessLevel.hidden;
}

/// Returns a list of modules visible to the given entity type + role
/// combination, sorted by category and order within each category.
List<AppModule> getFilteredModules(EntityType entityType, AppRole role) {
  return AppModule.values.where((module) {
    final access = getAccessLevel(entityType, role, module);
    return access != AccessLevel.hidden;
  }).toList()
    ..sort((a, b) {
      // Sort by category order first, then by order within group
      final categoryCompare = a.category.order.compareTo(b.category.order);
      if (categoryCompare != 0) return categoryCompare;
      return a.orderInGroup.compareTo(b.orderInGroup);
    });
}

/// Returns a map of category → list of visible modules for the given
/// entity type + role, suitable for rendering grouped navigation.
Map<ModuleCategory, List<AppModule>> getGroupedModules(
  EntityType entityType,
  AppRole role,
) {
  final filtered = getFilteredModules(entityType, role);

  final Map<ModuleCategory, List<AppModule>> grouped = {};

  for (final module in filtered) {
    grouped.putIfAbsent(module.category, () => []).add(module);
  }

  // Sort categories by their order
  final sortedKeys = grouped.keys.toList()
    ..sort((a, b) => a.order.compareTo(b.order));

  return {for (final key in sortedKeys) key: grouped[key]!};
}

/// Returns the access level for each module visible to the given
/// entity type + role, useful for rendering access badges or
/// determining edit vs. read-only mode per module.
Map<AppModule, AccessLevel> getModuleAccessMap(
  EntityType entityType,
  AppRole role,
) {
  final result = <AppModule, AccessLevel>{};

  for (final module in AppModule.values) {
    final access = getAccessLevel(entityType, role, module);
    if (access != AccessLevel.hidden) {
      result[module] = access;
    }
  }

  return result;
}

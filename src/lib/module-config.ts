// ════════════════════════════════════════════════════════════════
// MODULE CONFIGURATION SYSTEM
// Defines all available modules, navigation groups, and
// role-based access control for the Terra Brew sidebar.
// ════════════════════════════════════════════════════════════════

// ─── RBAC User Roles ─────────────────────────────────────────────
//
// Super Admin:      Platform operator managing all tenants, price tickers, platform settings.
//                   Full platform access. Authenticates via /login → redirected to /super-admin/dashboard.
//
// Tenant Admin:     Organization administrator — manages their org's users, settings, all modules.
//                   Full tenant access.
//
// Operations Manager: Oversees farm operations and processing.
//                   Farm + Processing modules.
//
// Field Officer:    Collects data in the field, registers farmers.
//                   Farm data entry only.
//
// Quality Controller: Manages inspections, QC, EUDR compliance.
//                   Quality + Compliance modules.
//
// Trader:           Handles marketplace, RFQ, trading, shipments.
//                   Trade + Logistics modules.
//
// Finance Manager:  Manages billing, payments, financial reports.
//                   Finance + Billing modules.
//
// Viewer:           Read-only access to permitted modules.
//                   View only.
// ──────────────────────────────────────────────────────────────────

// Entity types in the platform
export type EntityType = 'producer' | 'aggregator' | 'exporter' | 'importer' | 'certification_body' | 'laboratory'

// Access levels for modules
export type AccessLevel = 'full' | 'view' | 'hidden'

// Roles within each entity
export type TenantRole = 'tenant_admin' | 'operations_manager' | 'field_officer' | 'quality_controller' | 'trader' | 'finance_manager' | 'buyer' | 'viewer'

// Module definition
export interface ModuleDef {
  slug: string           // unique identifier matching Module table slug
  label: string          // English label
  labelVi: string        // Vietnamese label
  href: string           // route path
  icon: string           // Lucide icon name
  color: string          // hex color
  group: string          // navigation group
  orderInGroup: number   // sort order within group
  entityTypeAccess: Record<EntityType, AccessLevel>
  roleAccess: Record<TenantRole, AccessLevel>  // within the entity types that can see it
}

// Navigation group definition
export interface NavGroup {
  id: string
  label: string
  labelVi: string
  defaultOpen: boolean
  order: number
}

export const NAV_GROUPS: NavGroup[] = [
  { id: 'overview', label: 'Overview', labelVi: 'Tổng quan', defaultOpen: true, order: 1 },
  { id: 'farm', label: 'Farm Operations', labelVi: 'Vận hành nông trại', defaultOpen: true, order: 2 },
  { id: 'processing', label: 'Processing & Quality', labelVi: 'Chế biến & Chất lượng', defaultOpen: false, order: 3 },
  { id: 'compliance', label: 'EUDR Compliance & Certification', labelVi: 'Tuân thủ EUDR & Chứng nhận', defaultOpen: false, order: 4 },
  { id: 'trade', label: 'Trade & Logistics', labelVi: 'Thương mại & Vận tải', defaultOpen: false, order: 5 },
  { id: 'finance', label: 'Finance & Admin', labelVi: 'Tài chính & Quản trị', defaultOpen: false, order: 6 },
  { id: 'system', label: 'System & Integrations', labelVi: 'Hệ thống & Tích hợp', defaultOpen: false, order: 7 },
]

// Entity type labels for UI
export const ENTITY_TYPE_LABELS: Record<EntityType, { en: string; vi: string; pt: string; am: string; sw: string; icon: string }> = {
  producer: { en: 'Coffee Producer', vi: 'Nhà sản xuất cà phê', pt: 'Produtor de Café', am: 'የቡና አምራች', sw: 'Mzalishaji wa Kahawa', icon: '🏭' },
  aggregator: { en: 'Aggregator / Processor', vi: 'Tập hợp / Chế biến', pt: 'Agregador / Processador', am: 'ሰብሳቢ / አገግሞ አዘጋጅ', sw: 'Mkusanyaji / Mchakataji', icon: '📦' },
  exporter: { en: 'Exporter', vi: 'Nhà xuất khẩu', pt: 'Exportador', am: 'ላኪ', sw: 'Mtoaji wa Nje', icon: '🚢' },
  importer: { en: 'Importer', vi: 'Nhà nhập khẩu', pt: 'Importador', am: 'ተቀባይ', sw: 'Mpokeaji wa Nje', icon: '🏛️' },
  certification_body: { en: 'Certification Body', vi: 'Tổ chức chứng nhận', pt: 'Organismo de Certificação', am: 'የሰርተፍኬት አስተዳዳሪ', sw: 'Chombo cha Cheti', icon: '✅' },
  laboratory: { en: 'Laboratory', vi: 'Phòng thí nghiệm', pt: 'Laboratório', am: 'የሙያ ፈተና ቤት', sw: 'Maabara', icon: '🔬' },
}

// Role labels for UI
export const ROLE_LABELS: Record<TenantRole, { en: string; vi: string; pt: string; am: string; sw: string }> = {
  tenant_admin: { en: 'Administrator', vi: 'Quản trị viên', pt: 'Administrador', am: 'አስተዳዳሪ', sw: 'Msimamizi' },
  operations_manager: { en: 'Operations Manager', vi: 'Quản lý vận hành', pt: 'Gerente de Operações', am: 'የኦፕሬሽን ሥራ አስኪያጅ', sw: 'Meneja wa Uendeshaji' },
  field_officer: { en: 'Field Officer', vi: 'Cán bộ hiện trường', pt: 'Agente de Campo', am: 'የመስክ ባለሙያ', sw: 'Afisa wa Uga' },
  quality_controller: { en: 'Quality Controller', vi: 'Kiểm soát chất lượng', pt: 'Controlador de Qualidade', am: 'የጥራት መቆጣጠሪያ', sw: 'Mkidhibiti Ubora' },
  trader: { en: 'Trader', vi: 'Thương nhân', pt: 'Trader', am: 'ነጋዴ', sw: 'Mfanyabiashara' },
  finance_manager: { en: 'Finance Manager', vi: 'Quản lý tài chính', pt: 'Gerente Financeiro', am: 'የገንዘብ ሥራ አስኪያጅ', sw: 'Meneja wa Fedha' },
  buyer: { en: 'Buyer', vi: 'Người mua', pt: 'Comprador', am: 'ገዢ', sw: 'Mnunuzi' },
  viewer: { en: 'Viewer', vi: 'Người xem', pt: 'Visualizador', am: 'መመልከቻ', sw: 'Mtazamaji' },
}

export const MODULES: ModuleDef[] = [
  // OVERVIEW
  {
    slug: 'dashboard', label: 'Dashboard', labelVi: 'Bảng điều khiển', href: '/dashboard', icon: 'LayoutDashboard', color: '#059669',
    group: 'overview', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'full', laboratory: 'full' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'full', trader: 'full', finance_manager: 'full', buyer: 'full', viewer: 'view' },
  },
  {
    slug: 'analytics', label: 'Analytics & Reports', labelVi: 'Phân tích & Báo cáo', href: '/analytics', icon: 'BarChart3', color: '#2563eb',
    group: 'overview', orderInGroup: 2,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'view', laboratory: 'view' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'view', trader: 'view', finance_manager: 'full', buyer: 'view', viewer: 'view' },
  },

  // FARM OPERATIONS (producer only mostly)
  {
    slug: 'farmers', label: 'Farmers', labelVi: 'Nông dân', href: '/farmers', icon: 'Users', color: '#059669',
    group: 'farm', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'view', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'view', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'farmlands', label: 'Farm Lands', labelVi: 'Đất nông trại', href: '/farmlands', icon: 'MapPin', color: '#d97706',
    group: 'farm', orderInGroup: 2,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'view', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'view', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'cultivations', label: 'Cultivations', labelVi: 'Canh tác', href: '/cultivations', icon: 'Sprout', color: '#2563eb',
    group: 'farm', orderInGroup: 3,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'nurseries', label: 'Nurseries', labelVi: 'Vườn ươm', href: '/nurseries', icon: 'TreePine', color: '#7c3aed',
    group: 'farm', orderInGroup: 4,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'land-preparations', label: 'Land Preparation', labelVi: 'Chuẩn bị đất', href: '/land-preparations', icon: 'Tractor', color: '#0891b2',
    group: 'farm', orderInGroup: 5,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'crop-monitorings', label: 'Crop Monitoring', labelVi: 'Giám sát cây trồng', href: '/crop-monitorings', icon: 'Activity', color: '#db2777',
    group: 'farm', orderInGroup: 6,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'view', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'fertilizer-apps', label: 'Fertilizer Management', labelVi: 'Quản lý phân bón', href: '/fertilizer-apps', icon: 'FlaskConical', color: '#65a30d',
    group: 'farm', orderInGroup: 7,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'pest-disease-mgmts', label: 'Pest & Disease', labelVi: 'Sâu bệnh', href: '/pest-disease', icon: 'Shield', color: '#dc2626',
    group: 'farm', orderInGroup: 8,
    entityTypeAccess: { producer: 'full', aggregator: 'hidden', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'view', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'harvest-traceabilities', label: 'Harvest Traceability', labelVi: 'Truy xuất thu hoạch', href: '/harvest', icon: 'Wheat', color: '#b45309',
    group: 'farm', orderInGroup: 9,
    entityTypeAccess: { producer: 'full', aggregator: 'view', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'view', trader: 'view', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'climate-intelligence', label: 'Climate Intelligence', labelVi: 'Khí hậu thông minh', href: '/climate-intelligence', icon: 'Activity', color: '#00a3e0',
    group: 'farm', orderInGroup: 10,
    entityTypeAccess: { producer: 'full', aggregator: 'view', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'full', quality_controller: 'view', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },

  // PROCESSING & QUALITY
  {
    slug: 'procurement', label: 'Procurement', labelVi: 'Thu mua', href: '/procurement', icon: 'Truck', color: '#4f46e5',
    group: 'processing', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'view', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'full', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'processing', label: 'Processing Pipeline', labelVi: 'Dây chuyền chế biến', href: '/processing', icon: 'Factory', color: '#0d9488',
    group: 'processing', orderInGroup: 2,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'hidden', quality_controller: 'full', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'coffee-inspections', label: 'Coffee Inspection', labelVi: 'Kiểm tra cà phê', href: '/coffee-inspections', icon: 'ClipboardCheck', color: '#9333ea',
    group: 'processing', orderInGroup: 3,
    entityTypeAccess: { producer: 'view', aggregator: 'view', exporter: 'hidden', importer: 'hidden', certification_body: 'full', laboratory: 'full' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'hidden', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'qc-verifications', label: 'QC Verifications', labelVi: 'Kiểm định CL', href: '/qc-verifications', icon: 'CheckCircle', color: '#059669',
    group: 'processing', orderInGroup: 4,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'view', importer: 'full', certification_body: 'hidden', laboratory: 'full' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },

  // COMPLIANCE & CERTIFICATION
  {
    slug: 'eudr-compliance', label: 'EUDR Records', labelVi: 'Hồ sơ EUDR', href: '/eudr-compliance', icon: 'Shield', color: '#dc2626',
    group: 'compliance', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'full', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'cert-assessments', label: 'Certification Assessment', labelVi: 'Đánh giá chứng nhận', href: '/cert-assessments', icon: 'Award', color: '#be185d',
    group: 'compliance', orderInGroup: 2,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'view', importer: 'view', certification_body: 'full', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'hidden', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'deforestation', label: 'Deforestation Monitoring', labelVi: 'Giám sát phá rừng', href: '/deforestation', icon: 'TreePine', color: '#059669',
    group: 'compliance', orderInGroup: 3,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'view', importer: 'hidden', certification_body: 'full', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'hidden', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'trace-journey', label: 'EUDR Compliance', labelVi: 'Tuân thủ EUDR', href: '/traceability', icon: 'Route', color: '#7c3aed',
    group: 'compliance', orderInGroup: 4,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'view', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'view', quality_controller: 'view', trader: 'view', finance_manager: 'hidden', buyer: 'full', viewer: 'view' },
  },
  {
    slug: 'carbon-tracking', label: 'Carbon Tracking', labelVi: 'Theo dõi Carbon', href: '/carbon-tracking', icon: 'Activity', color: '#059669',
    group: 'compliance', orderInGroup: 5,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'view', certification_body: 'view', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'view', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'esg-reporting', label: 'ESG Reporting', labelVi: 'Báo cáo ESG', href: '/esg-reporting', icon: 'BarChart3', color: '#6366f1',
    group: 'compliance', orderInGroup: 7,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'full', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'full', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'trust-score', label: 'Trust Score™', labelVi: 'Trust Score™', href: '/trust-score', icon: 'Shield', color: '#ffc627',
    group: 'compliance', orderInGroup: 6,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'view', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'view', buyer: 'full', viewer: 'view' },
  },

  // TRADE & LOGISTICS
  {
    slug: 'marketplace', label: 'Marketplace', labelVi: 'Thị trường', href: '/marketplace', icon: 'Store', color: '#ea580c',
    group: 'trade', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'view', buyer: 'full', viewer: 'view' },
  },
  {
    slug: 'rfq', label: 'RFQ Management', labelVi: 'Quản lý RFQ', href: '/rfq', icon: 'FileQuestion', color: '#7c3aed',
    group: 'trade', orderInGroup: 2,
    entityTypeAccess: { producer: 'view', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'view', buyer: 'full', viewer: 'view' },
  },
  {
    slug: 'inspections', label: 'Inspection Service', labelVi: 'Dịch vụ kiểm tra', href: '/inspections', icon: 'ClipboardCheck', color: '#9333ea',
    group: 'trade', orderInGroup: 3,
    entityTypeAccess: { producer: 'view', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'full', laboratory: 'full' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'product-monitoring', label: 'Product Monitoring', labelVi: 'Giám sát sản phẩm', href: '/product-monitoring', icon: 'Activity', color: '#0d9488',
    group: 'trade', orderInGroup: 4,
    entityTypeAccess: { producer: 'view', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'hidden', quality_controller: 'full', trader: 'view', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'smart-contracts', label: 'Smart Contracts', labelVi: 'Hợp đồng thông minh', href: '/smart-contracts', icon: 'FileText', color: '#0369a1',
    group: 'trade', orderInGroup: 5,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'view', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'trading-desk', label: 'Trading Desk', labelVi: 'Sàn giao dịch', href: '/trading-desk', icon: 'TrendingUp', color: '#0d9488',
    group: 'trade', orderInGroup: 6,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'full', buyer: 'full', viewer: 'view' },
  },
  {
    slug: 'shipments', label: 'Shipments', labelVi: 'Vận chuyển', href: '/shipments', icon: 'Ship', color: '#2563eb',
    group: 'trade', orderInGroup: 7,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'view', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'logistics', label: 'Logistics Booking', labelVi: 'Đặt logistics', href: '/logistics', icon: 'Container', color: '#4f46e5',
    group: 'trade', orderInGroup: 8,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'view', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'export-docs', label: 'Export Documents', labelVi: 'Tài liệu xuất khẩu', href: '/export-docs', icon: 'FileOutput', color: '#0891b2',
    group: 'trade', orderInGroup: 9,
    entityTypeAccess: { producer: 'hidden', aggregator: 'hidden', exporter: 'full', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'view', finance_manager: 'view', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'buyers', label: 'Buyers', labelVi: 'Người mua', href: '/buyers', icon: 'UserCheck', color: '#65a30d',
    group: 'trade', orderInGroup: 10,
    entityTypeAccess: { producer: 'hidden', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'view', buyer: 'full', viewer: 'view' },
  },
  {
    slug: 'buyer-portal', label: 'Buyer Portal', labelVi: 'Cổng người mua', href: '/buyer-portal', icon: 'UserCheck', color: '#00a3e0',
    group: 'trade', orderInGroup: 11,
    entityTypeAccess: { producer: 'hidden', aggregator: 'view', exporter: 'view', importer: 'full', certification_body: 'view', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'hidden', field_officer: 'hidden', quality_controller: 'hidden', trader: 'full', finance_manager: 'hidden', buyer: 'full', viewer: 'view' },
  },
  // FINANCE & ADMIN
  {
    slug: 'billing', label: 'Billing', labelVi: 'Thanh toán', href: '/billing', icon: 'CreditCard', color: '#be185d',
    group: 'finance', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'full', laboratory: 'full' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'hidden', field_officer: 'hidden', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'full', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'users', label: 'Users', labelVi: 'Người dùng', href: '/users', icon: 'UserCog', color: '#6366f1',
    group: 'finance', orderInGroup: 2,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'full', laboratory: 'full' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'hidden', field_officer: 'hidden', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'view', buyer: 'hidden', viewer: 'hidden' },
  },

  // SYSTEM & INTEGRATIONS
  {
    slug: 'iot-sensors', label: 'IoT Sensors', labelVi: 'Cảm biến IoT', href: '/iot-sensors', icon: 'Radio', color: '#0891b2',
    group: 'system', orderInGroup: 1,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'hidden', importer: 'hidden', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'full', field_officer: 'view', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'view' },
  },
  {
    slug: 'blockchain', label: 'Blockchain', labelVi: 'Blockchain', href: '/blockchain', icon: 'Link', color: '#7c3aed',
    group: 'system', orderInGroup: 2,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'view', field_officer: 'hidden', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'view', viewer: 'view' },
  },
  {
    slug: 'api-settings', label: 'API & Webhooks', labelVi: 'API & Webhooks', href: '/api-settings', icon: 'Webhook', color: '#6366f1',
    group: 'system', orderInGroup: 3,
    entityTypeAccess: { producer: 'full', aggregator: 'full', exporter: 'full', importer: 'full', certification_body: 'hidden', laboratory: 'hidden' },
    roleAccess: { tenant_admin: 'full', operations_manager: 'hidden', field_officer: 'hidden', quality_controller: 'hidden', trader: 'hidden', finance_manager: 'hidden', buyer: 'hidden', viewer: 'hidden' },
  },
]

/**
 * Get filtered navigation items for a given entity type and role.
 * Returns only modules where access is not 'hidden'.
 */
export function getFilteredModules(entityType: EntityType, role: TenantRole): ModuleDef[] {
  return MODULES.filter(mod => {
    const entityAccess = mod.entityTypeAccess[entityType]
    if (entityAccess === 'hidden') return false
    const roleAccess = mod.roleAccess[role]
    if (roleAccess === 'hidden') return false
    return true
  })
}

/**
 * Get navigation items grouped for sidebar rendering.
 * Filters by entity type and role, groups by NAV_GROUPS.
 */
export function getGroupedNavigation(entityType: EntityType, role: TenantRole) {
  const filtered = getFilteredModules(entityType, role)
  const grouped = NAV_GROUPS
    .map(group => ({
      ...group,
      items: filtered
        .filter(mod => mod.group === group.id)
        .sort((a, b) => a.orderInGroup - b.orderInGroup),
    }))
    .filter(group => group.items.length > 0)
    .sort((a, b) => a.order - b.order)
  return grouped
}

/**
 * Get the display label for an entity type in the given language.
 */
export function getEntityTypeLabel(entityType: string, lang: 'vi' | 'en' | 'pt' | 'am' | 'sw' = 'en'): string {
  const labels = ENTITY_TYPE_LABELS[entityType as EntityType]
  if (!labels) return entityType
  return (labels as any)[lang] || labels.en
}

/**
 * Get the icon emoji for an entity type.
 * Returns emoji from ENTITY_TYPE_LABELS, falling back to '🏢'.
 */
export function getEntityTypeIcon(entityType: string): string {
  const labels = ENTITY_TYPE_LABELS[entityType as EntityType]
  return labels?.icon || '🏢'
}

/**
 * Map icon string name to Lucide React component.
 * Used in the sidebar to dynamically render icons.
 */
export const ICON_MAP: Record<string, string> = {
  LayoutDashboard: 'LayoutDashboard',
  BarChart3: 'BarChart3',
  Users: 'Users',
  MapPin: 'MapPin',
  Sprout: 'Sprout',
  TreePine: 'TreePine',
  Tractor: 'Tractor',
  Activity: 'Activity',
  FlaskConical: 'FlaskConical',
  Shield: 'Shield',
  Wheat: 'Wheat',
  Truck: 'Truck',
  Factory: 'Factory',
  ClipboardCheck: 'ClipboardCheck',
  CheckCircle: 'CheckCircle',
  Award: 'Award',
  Store: 'Store',
  FileQuestion: 'FileQuestion',
  FileText: 'FileText',
  TrendingUp: 'TrendingUp',
  Ship: 'Ship',
  Container: 'Container',
  FileOutput: 'FileOutput',
  UserCheck: 'UserCheck',
  Route: 'Route',
  CreditCard: 'CreditCard',
  UserCog: 'UserCog',
  Radio: 'Radio',
  Link: 'Link',
  Webhook: 'Webhook',
}

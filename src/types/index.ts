/**
 * TypeScript type definitions for the entire platform.
 * Strict typing — no `any` types allowed.
 */

// ════════════════════════════════════════════════════════════════
// AUTH & ROLES
// ════════════════════════════════════════════════════════════════

export type PlatformRole = 'super_admin' | 'support'
export type TenantRole = 'tenant_admin' | 'operations_manager' | 'field_officer' | 'quality_controller' | 'trader' | 'finance_manager' | 'buyer' | 'viewer' | 'inspector' | 'operator' | 'manager' | 'farmer' | 'aggregator' | 'processor' | 'exporter'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: PlatformRole | TenantRole
  tenantId?: string
  tenantSlug?: string
  tenantName?: string
  entityType?: string
  currency?: string
  currencySymbol?: string
  language?: string
  isPlatformAdmin?: boolean
}

// ════════════════════════════════════════════════════════════════
// TENANT & PLATFORM
// ════════════════════════════════════════════════════════════════

export interface TenantConfig {
  id: string
  slug: string
  name: string
  legalName?: string
  currency: string
  currencySymbol: string
  language: string
  timezone: string
  dateFormat: string
  enabledModules: Record<string, boolean>
  plan: string
  isActive: boolean
}

export interface ModuleConfig {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  color?: string
  category: 'core' | 'premium' | 'compliance'
  version: string
  isActive: boolean
}

// ════════════════════════════════════════════════════════════════
// RBAC PERMISSIONS
// ════════════════════════════════════════════════════════════════

export type Action = 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve'
export type ModuleSlug =
  | 'farmers' | 'farmlands' | 'cultivations'
  | 'nurseries' | 'land-preparations' | 'crop-monitorings'
  | 'fertilizer-apps' | 'pest-disease-mgmts'
  | 'harvest-traceabilities' | 'procurement' | 'processing'
  | 'cert-assessments' | 'coffee-inspections'
  | 'smart-contracts' | 'marketplace'
  | 'dashboard' | 'reports' | 'settings' | 'users'
  | 'eudr-compliance' | 'export-docs' | 'shipments' | 'buyers' | 'trading-desk' | 'api-access' | 'deforestation' | 'iot-tracking' | 'qc-verification' | 'compliance-marketplace' | 'analytics' | 'logistics' | 'product-monitoring' | 'traces'

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise'
export type PaymentProvider = 'stripe' | 'paypal'
export type EudrStatus = 'pending' | 'in_review' | 'compliant' | 'non_compliant' | 'expired'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ShipmentStatus = 'planned' | 'booked' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled'
export type DocStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired'
export type ContractType = 'spot' | 'forward' | 'term'
export type BuyerType = 'roaster' | 'importer' | 'trader' | 'distributor'
export type SensorType = 'temperature' | 'humidity' | 'gps' | 'shock' | 'light' | 'co2'
export type VerificationType = 'eudr' | 'organic' | 'fairtrade' | 'rainforest' | 'utz' | '4c'

export type PermissionMap = Record<ModuleSlug, Action[]>

// ════════════════════════════════════════════════════════════════
// DATA MASKING
// ════════════════════════════════════════════════════════════════

export interface MaskingRule {
  field: string
  maskFor: TenantRole[]  // Roles that see masked data
  maskFunction: 'full' | 'partial' | 'email' | 'phone'
}

// ════════════════════════════════════════════════════════════════
// MULTI-CURRENCY
// ════════════════════════════════════════════════════════════════

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  decimals: number
  locale: string
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0, locale: 'vi-VN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, locale: 'de-DE' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, locale: 'ja-JP' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0, locale: 'ko-KR' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, locale: 'zh-CN' },
]

export function formatCurrency(amount: number, currencyCode: string): string {
  const config = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) ?? SUPPORTED_CURRENCIES[0]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount)
}

// ════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════

export interface DashboardStats {
  totalFarmers: number
  totalFarmLands: number
  totalCultivations: number
  totalHarvestRecords: number
  activeCertifications: number
  totalProcurementRecords: number
  totalMarketplaceListings: number
  completedProcessingStages: number
  totalNurseries: number
  totalCropMonitorings: number
  totalLandPreps: number
  totalFertilizerApps: number
  totalPestMgmts: number
  totalSmartContracts: number
  totalInspections: number
  totalCollectionCentres: number
  certifiedFarmersCount: number
  avgCreditScore: number
  avgCupScore: number
  totalCherryWeight: number
  totalPurchaseAmount: number
  avgPricePerKg: number
  totalNetWeight: number
  totalLandArea: number
  procurementPaidCount: number
  procurementPendingCount: number
  harvestTrends: Array<{ month: string; name: string; harvests: number; weight: number; avgCupScore: number }>
  procurementTrends: Array<{ month: string; name: string; procurements: number; weight: number; amount: number }>
  farmersPerProvince: Array<{ province: string | null; _count: { province: number } }>
  cultivationsByCrop: Array<{ cultivatedCrop: string | null; _count: { cultivatedCrop: number } }>
  processingByStage: Array<{ stageType: string; _count: { stageType: number } }>
  qualityDistribution: Array<{ name: string; value: number }>
  certByType: Array<{ certificationStandard: string | null; _count: { certificationStandard: number } }>
  recentProcurements: any[]
  recentMarketplace: any[]
  cropAlerts: any[]
  recentInspections: any[]
  recentActivity: Array<{
    id: string
    type: string
    action: string
    entity: string
    time: string
  }>
}

// ════════════════════════════════════════════════════════════════
// BLOCKCHAIN HASH CHAIN
// ════════════════════════════════════════════════════════════════

export interface HashChainBlock {
  id: string
  tenantId: string
  batchId: string
  blockIndex: number
  stage: string
  data: string
  dataHash: string
  previousHash: string
  blockHash: string
  timestamp: Date
  recordedBy: string | null
}

export interface ChainVerificationResult {
  valid: boolean
  totalBlocks: number
  brokenAt?: number
  message: string
}

/**
 * TypeScript type definitions for the Terra Brew mobile app.
 * Mirrors the backend types from the web platform.
 */

// ════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════

export type TenantRole = 'tenant_admin' | 'manager' | 'inspector' | 'field_officer' | 'farmer' | 'viewer'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: TenantRole
  tenantId: string
  tenantSlug: string
  tenantName: string
  currency: string
  currencySymbol: string
  language: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  tenantSlug: string
}

// ════════════════════════════════════════════════════════════════
// API RESPONSE
// ════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ════════════════════════════════════════════════════════════════
// ENTITY TYPES (mirrors Prisma schema)
// ════════════════════════════════════════════════════════════════

export interface Farmer {
  id: string
  tenantId: string
  farmerCode: string | null
  fullName: string
  firstName: string | null
  lastName: string | null
  contactNumber: string
  gender: string | null
  dob: string | null
  province: string | null
  district: string | null
  commune: string | null
  village: string | null
  latitude: number | null
  longitude: number | null
  isCertified: boolean
  certificationType: string | null
  cooperative: string | null
  yearsOfFarmingExperience: number | null
  gapTrainingAttended: boolean
  smartphoneOwnership: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmLands?: FarmLand[]
}

export interface FarmLand {
  id: string
  tenantId: string
  farmerId: string
  farmName: string
  plotBlockId: string | null
  totalLandHolding: number | null
  altitude: number | null
  latitude: number | null
  longitude: number | null
  landOwnership: string | null
  soilType: string | null
  noOfTrees: number | null
  estYield: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer?: Farmer
}

export interface Cultivation {
  id: string
  tenantId: string
  farmerId: string
  farmLandId: string
  farmPlotName: string
  cultivatedCrop: string | null
  cropVariety: string | null
  coffeeSpecies: string | null
  cultivationArea: number | null
  sowingDate: string | null
  estYield: string | null
  seedSource: string | null
  seedType: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HarvestTraceability {
  id: string
  tenantId: string
  cultivationId: string | null
  farmerId: string
  farmLandId: string
  coffeeVariety: string | null
  actualHarvestDate: string | null
  harvestMethod: string | null
  cherryRipeness: number | null
  cupScore: number | null
  processingMethod: string | null
  moistureContent: number | null
  batchId: string | null
  batchNotes: string | null
  processingStage: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer?: Farmer
  farmLand?: FarmLand
}

export interface ProcurementRecord {
  id: string
  tenantId: string
  collectionCentreId: string | null
  farmerId: string
  farmLandId: string | null
  procurementDate: string | null
  batchId: string | null
  coffeeType: string | null
  coffeeVariety: string | null
  netWeight: number | null
  moistureContentAtGate: number | null
  purchasePricePerKg: number | null
  totalPurchaseAmount: number | null
  paymentStatus: string | null
  vehicleNumber: string | null
  driverName: string | null
  destination: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  farmer?: Farmer
  collectionCentre?: CollectionCentre
}

export interface ProcessingJobOrder {
  id: string
  tenantId: string
  jobOrderId: string | null
  processingDate: string | null
  batchIdInput: string | null
  coffeeTypeInput: string | null
  coffeeVarietyInput: string | null
  inputQuantityKg: number | null
  processingMethod: string | null
  finalOutputWeightKg: number | null
  overallOutturn: number | null
  finalMoistureContent: number | null
  cupScore: number | null
  cuppingNotes: string | null
  qcApprovedBy: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  processingStages?: ProcessingStageRecord[]
}

export interface ProcessingStageRecord {
  id: string
  tenantId: string
  jobOrderId: string
  stageType: string | null
  stageDate: string | null
  inputWeight: number | null
  outputWeight: number | null
  durationMinutes: number | null
  temperature: number | null
  machineUsed: string | null
  operatorName: string | null
  qualityCheckPassed: boolean
  notes: string | null
  isActive: boolean
  createdAt: string
}

export interface CollectionCentre {
  id: string
  tenantId: string
  centreId: string | null
  centreName: string
  centreGpsLat: number | null
  centreGpsLng: number | null
  province: string | null
  address: string | null
  managerName: string | null
  contactNumber: string | null
  storageCapacityKg: number | null
  isActive: boolean
}

export interface CoffeeInspection {
  id: string
  tenantId: string
  batchId: string | null
  inspectionDate: string | null
  inspectorName: string | null
  inspectionType: string | null
  moistureContent: number | null
  defectCount: number | null
  cupScore: number | null
  overallGrade: string | null
  passFail: string | null
  isActive: boolean
  createdAt: string
}

export interface SmartContract {
  id: string
  tenantId: string
  farmerId: string | null
  contractId: string | null
  contractType: string | null
  title: string | null
  partyA: string | null
  partyB: string | null
  quantityKg: number | null
  pricePerKg: number | null
  totalValue: number | null
  currency: string | null
  status: string | null
  signedByA: boolean
  signedByB: boolean
  effectiveDate: string | null
  expiryDate: string | null
  isActive: boolean
  createdAt: string
}

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
  timestamp: string
  recordedBy: string | null
}

export interface QRVerificationResult {
  qrCode: string
  entityType: string
  entityId: string
  signatureValid: boolean
  chainIntegrity: {
    valid: boolean
    totalBlocks: number
  }
  traceSteps: TraceStep[]
  entityDetails: Record<string, unknown>
  scanCount: number
  lastScannedAt: string | null
}

export interface TraceStep {
  stage: string
  timestamp: string
  data: string
  blockHash: string
  verified: boolean
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════

export interface DashboardStats {
  totalFarmers: number
  totalFarmLands: number
  totalHarvestRecords: number
  totalProcurementRecords: number
  activeCertifications: number
  totalSmartContracts: number
  totalInspections: number
  avgCupScore: number
  totalCherryWeight: number
  totalPurchaseAmount: number
  avgPricePerKg: number
}

// ════════════════════════════════════════════════════════════════
// OFFLINE SYNC
// ════════════════════════════════════════════════════════════════

export type SyncEntityType = 
  | 'farmers' | 'farmlands' | 'cultivations'
  | 'harvest-traceabilities' | 'procurement' | 'processing'
  | 'coffee-inspections' | 'cert-assessments' | 'smart-contracts'
  | 'nurseries' | 'land-preparations' | 'crop-monitorings'
  | 'fertilizer-apps' | 'pest-disease-mgmts' | 'marketplace'

export type SyncAction = 'create' | 'update' | 'delete'

export interface PendingChange {
  id: string
  entity: SyncEntityType
  action: SyncAction
  data: Record<string, unknown>
  clientTimestamp: string
  clientId: string
  retries: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'failed' | 'conflicted'
  error?: string
  createdAt: string
}

export interface SyncConflict {
  entity: SyncEntityType
  entityId: string
  clientData: Record<string, unknown>
  serverData: Record<string, unknown>
  clientTimestamp: string
  serverTimestamp: string
}

export interface SyncResult {
  applied: number
  conflicts: SyncConflict[]
  serverTimestamp: string
}

export interface SyncPullResult {
  farmers: Farmer[]
  farmlands: FarmLand[]
  harvests: HarvestTraceability[]
  procurements: ProcurementRecord[]
  processing: ProcessingJobOrder[]
  inspections: CoffeeInspection[]
  serverTimestamp: string
}

// ════════════════════════════════════════════════════════════════
// NFC
// ════════════════════════════════════════════════════════════════

export interface NFCTag {
  id: string
  nfcTagId: string
  qrCode: string
  entityType: string
  entityId: string
  hmacSignature: string
  scanCount: number
  lastScannedAt: string | null
  createdAt: string
}

export interface NFCScanResult {
  type: 'nfc' | 'qr'
  code: string
  tagId?: string
}

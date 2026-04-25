/**
 * Zod validation schemas for all API endpoints.
 * Every API route MUST validate input with these schemas.
 */
import { z } from 'zod'

// ════════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ════════════════════════════════════════════════════════════════

export const tenantLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantSlug: z.string().min(1, 'Tenant slug required'),
})

export const platformLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['tenant_admin', 'manager', 'inspector', 'field_officer', 'farmer', 'viewer']),
})

// ════════════════════════════════════════════════════════════════
// SUPER ADMIN SCHEMAS
// ════════════════════════════════════════════════════════════════

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name required'),
  slug: z.string().min(2, 'Slug required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  currency: z.string().default('VND'),
  currencySymbol: z.string().default('₫'),
  language: z.string().default('vi'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  country: z.string().default('VN'),
  plan: z.enum(['starter', 'professional', 'enterprise']).default('starter'),
  maxUsers: z.number().int().positive().default(10),
  maxFarmers: z.number().int().positive().default(500),
  enabledModules: z.record(z.boolean()).default({}),
})

export const updateTenantSchema = createTenantSchema.partial()

export const updateModuleConfigSchema = z.object({
  enabledModules: z.record(z.boolean()),
})

// ════════════════════════════════════════════════════════════════
// FARMER SCHEMAS
// ════════════════════════════════════════════════════════════════

export const createFarmerSchema = z.object({
  farmerCode: z.string().optional(),
  enrollmentPlace: z.string().optional(),
  isCertified: z.boolean().default(false),
  certificationType: z.string().optional(),
  yearOfICS: z.string().optional(),
  cooperative: z.string().optional(),
  fullName: z.string().min(2, 'Full name required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  contactNumber: z.string().min(1, 'Contact number required'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z.string().optional(),
  age: z.number().int().positive().optional(),
  education: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationalIdType: z.string().optional(),
  nationalIdNo: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  country: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  commune: z.string().optional(),
  village: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  yearsOfFarmingExperience: z.number().int().min(0).optional(),
  creditScore: z.number().min(0).max(100).optional(),
  loanTaken: z.boolean().default(false),
  loanAmount: z.number().nonnegative().optional(),
  smartphoneOwnership: z.boolean().default(false),
  gapTrainingAttended: z.boolean().default(false),
  ekycConsent: z.boolean().default(false),
})

export const updateFarmerSchema = createFarmerSchema.partial()

// ════════════════════════════════════════════════════════════════
// FARM LAND SCHEMAS
// ════════════════════════════════════════════════════════════════

export const createFarmLandSchema = z.object({
  farmerId: z.string().min(1, 'Farmer ID required'),
  farmName: z.string().min(1, 'Farm name required'),
  plotBlockId: z.string().optional(),
  totalLandHolding: z.number().positive().optional(),
  altitude: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  landOwnership: z.string().optional(),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  noOfTrees: z.number().int().positive().optional(),
  estYield: z.number().positive().optional(),
  childLabourPolicy: z.boolean().default(false),
  minimumWageCompliance: z.boolean().default(false),
  ppeAvailable: z.boolean().default(false),
})

export const updateFarmLandSchema = createFarmLandSchema.partial()

// ════════════════════════════════════════════════════════════════
// CULTIVATION SCHEMAS
// ════════════════════════════════════════════════════════════════

export const createCultivationSchema = z.object({
  farmerId: z.string().min(1, 'Farmer ID required'),
  farmLandId: z.string().min(1, 'Farm land ID required'),
  farmPlotName: z.string().min(1, 'Plot name required'),
  cultivatedCrop: z.string().optional(),
  cropVariety: z.string().optional(),
  cultivationArea: z.number().positive().optional(),
  sowingDate: z.string().optional(),
  estYield: z.string().optional(),
  seedSource: z.string().optional(),
  seedType: z.string().optional(),
  seedQuantity: z.number().nonnegative().optional(),
  seedCost: z.number().nonnegative().optional(),
})

export const updateCultivationSchema = createCultivationSchema.partial()

// ════════════════════════════════════════════════════════════════
// HARVEST TRACEABILITY SCHEMAS
// ════════════════════════════════════════════════════════════════

export const createHarvestTraceSchema = z.object({
  cultivationId: z.string().min(1, 'Cultivation ID required'),
  farmerId: z.string().min(1, 'Farmer ID required'),
  farmLandId: z.string().min(1, 'Farm land ID required'),
  coffeeVariety: z.string().optional(),
  actualHarvestDate: z.string().optional(),
  harvestMethod: z.string().default('Selective Picking'),
  cherryRipeness: z.number().min(0).max(100).optional(),
  cupScore: z.number().min(0).max(100).optional(),
  processingMethod: z.string().optional(),
  moistureContent: z.number().min(0).max(100).optional(),
  batchNotes: z.string().optional(),
})

export const updateHarvestTraceSchema = createHarvestTraceSchema.partial()

// ════════════════════════════════════════════════════════════════
// GENERIC PAGINATION
// ════════════════════════════════════════════════════════════════

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>

import { z } from 'zod'

// Farmer validation
export const farmerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['Nam', 'Nữ', 'Male', 'Female', 'Other']).optional(),
  dob: z.string().optional(),
  age: z.number().int().positive().optional().nullable(),
  nationalIdType: z.string().optional(),
  nationalIdNo: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  commune: z.string().optional(),
  village: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  yearsOfFarmingExperience: z.number().int().min(0).optional().nullable(),
  creditScore: z.number().min(0).max(100).optional().nullable(),
  farmerCode: z.string().optional(),
  cooperative: z.string().optional(),
})

// FarmLand validation
export const farmLandSchema = z.object({
  farmName: z.string().min(1, 'Farm name is required'),
  farmerId: z.string().min(1, 'Farmer is required'),
  totalLandHolding: z.number().positive().optional().nullable(),
  altitude: z.number().positive().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  soilType: z.string().optional(),
  irrigationSource: z.string().optional(),
  noOfTrees: z.number().int().positive().optional().nullable(),
  polygonGeoJson: z.string().optional(),
  boundaryArea: z.number().positive().optional().nullable(),
  geoCenterLat: z.number().min(-90).max(90).optional().nullable(),
  geoCenterLng: z.number().min(-180).max(180).optional().nullable(),
})

// EUDR Compliance validation
export const eudrComplianceSchema = z.object({
  complianceId: z.string().optional(),
  batchId: z.string().optional(),
  farmerId: z.string().optional(),
  farmLandId: z.string().optional(),
  status: z.enum(['pending', 'in_review', 'compliant', 'non_compliant', 'expired']).default('pending'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  deforestationRiskScore: z.number().min(0).max(100).optional().nullable(),
  geolocationLat: z.number().min(-90).max(90).optional().nullable(),
  geolocationLng: z.number().min(-180).max(180).optional().nullable(),
  landUseType: z.string().optional(),
  satelliteImageryRef: z.string().optional(),
  verificationDate: z.string().optional(),
  verifiedBy: z.string().optional(),
  dueDiligenceStatement: z.string().optional(),
  tracesCertificateRef: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.string().optional(),
})

// Cultivation validation
export const cultivationSchema = z.object({
  farmPlotName: z.string().min(1, 'Plot name is required'),
  farmerId: z.string().min(1, 'Farmer is required'),
  farmLandId: z.string().min(1, 'Farm land is required'),
  cultivatedCrop: z.string().optional(),
  cropVariety: z.string().optional(),
  coffeeSpecies: z.string().optional(),
  cultivationArea: z.number().positive().optional().nullable(),
  plantingSpacing: z.number().positive().optional().nullable(),
  treeDensity: z.number().int().positive().optional().nullable(),
  sowingDate: z.string().optional(),
  harvestSeason: z.string().optional(),
  intercroppingEnabled: z.boolean().optional(),
  intercroppingPartner: z.string().optional(),
  intercroppingRatio: z.string().optional(),
})

// PriceTicker validation
export const priceTickerSchema = z.object({
  commodity: z.string().min(1, 'Commodity name is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
  change: z.number().optional().default(0),
  changePercent: z.number().optional().default(0),
  unit: z.string().default('per lb'),
  source: z.string().optional(),
  high52w: z.number().optional().nullable(),
  low52w: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
})

// Helper function to validate with Zod
export function validateData<T>(schema: z.ZodType<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const parsed = schema.parse(data)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

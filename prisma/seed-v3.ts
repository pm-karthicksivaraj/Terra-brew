import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const db = new PrismaClient({ log: ['warn', 'error'] })

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function computeDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function computeBlockHash(dataHash: string, previousHash: string, timestamp: string): string {
  return crypto.createHash('sha256').update(dataHash + previousHash + timestamp).digest('hex')
}

function makePolygonGeoJson(centerLat: number, centerLng: number): string {
  const dLat = 0.0009
  const dLng = 0.0011
  const coords = [
    [centerLng - dLng, centerLat - dLat],
    [centerLng + dLng, centerLat - dLat],
    [centerLng + dLng, centerLat + dLat],
    [centerLng - dLng, centerLat + dLat],
    [centerLng - dLng, centerLat - dLat],
  ]
  return JSON.stringify({ type: 'Polygon', coordinates: [coords] })
}

const GENESIS_HASH = '0'.repeat(64)

// ════════════════════════════════════════════════════════════════
// MODULE DEFINITIONS (all slugs from module-config.ts)
// ════════════════════════════════════════════════════════════════

const MODULE_DEFS = [
  { slug: 'dashboard', name: 'Dashboard', category: 'core', icon: 'LayoutDashboard', color: '#059669' },
  { slug: 'analytics', name: 'Analytics & Reports', category: 'core', icon: 'BarChart3', color: '#2563eb' },
  { slug: 'farmers', name: 'Farmer Management', category: 'core', icon: 'Users', color: '#059669' },
  { slug: 'farmlands', name: 'Farm Land Management', category: 'core', icon: 'MapPin', color: '#d97706' },
  { slug: 'cultivations', name: 'Cultivation Management', category: 'core', icon: 'Sprout', color: '#2563eb' },
  { slug: 'nurseries', name: 'Nursery Management', category: 'core', icon: 'TreePine', color: '#7c3aed' },
  { slug: 'land-preparations', name: 'Land Preparation', category: 'core', icon: 'Tractor', color: '#0891b2' },
  { slug: 'crop-monitorings', name: 'Crop Monitoring', category: 'core', icon: 'Activity', color: '#db2777' },
  { slug: 'fertilizer-apps', name: 'Fertilizer Management', category: 'core', icon: 'FlaskConical', color: '#65a30d' },
  { slug: 'pest-disease-mgmts', name: 'Pest & Disease Management', category: 'core', icon: 'Shield', color: '#dc2626' },
  { slug: 'harvest-traceabilities', name: 'Harvest Traceability', category: 'core', icon: 'Wheat', color: '#b45309' },
  { slug: 'procurement', name: 'Procurement', category: 'processing', icon: 'Truck', color: '#4f46e5' },
  { slug: 'processing', name: 'Processing Pipeline', category: 'processing', icon: 'Factory', color: '#0d9488' },
  { slug: 'coffee-inspections', name: 'Coffee Inspection', category: 'processing', icon: 'ClipboardCheck', color: '#9333ea' },
  { slug: 'qc-verifications', name: 'QC Verifications', category: 'processing', icon: 'CheckCircle', color: '#059669' },
  { slug: 'eudr-compliance', name: 'EUDR Records', category: 'compliance', icon: 'Shield', color: '#dc2626' },
  { slug: 'cert-assessments', name: 'Certification Assessment', category: 'compliance', icon: 'Award', color: '#be185d' },
  { slug: 'deforestation', name: 'Deforestation Monitoring', category: 'compliance', icon: 'TreePine', color: '#059669' },
  { slug: 'trace-journey', name: 'EUDR Compliance Journey', category: 'compliance', icon: 'Route', color: '#7c3aed' },
  { slug: 'carbon-tracking', name: 'Carbon Tracking', category: 'compliance', icon: 'Activity', color: '#059669' },
  { slug: 'trust-score', name: 'Trust Score™', category: 'compliance', icon: 'Shield', color: '#ffc627' },
  { slug: 'esg-reporting', name: 'ESG Reporting', category: 'compliance', icon: 'BarChart3', color: '#6366f1' },
  { slug: 'marketplace', name: 'Marketplace', category: 'trade', icon: 'Store', color: '#ea580c' },
  { slug: 'rfq', name: 'RFQ Management', category: 'trade', icon: 'FileQuestion', color: '#7c3aed' },
  { slug: 'inspections', name: 'Inspection Service', category: 'trade', icon: 'ClipboardCheck', color: '#9333ea' },
  { slug: 'product-monitoring', name: 'Product Monitoring', category: 'trade', icon: 'Activity', color: '#0d9488' },
  { slug: 'smart-contracts', name: 'Smart Contracts', category: 'trade', icon: 'FileText', color: '#0369a1' },
  { slug: 'trading-desk', name: 'Trading Desk', category: 'trade', icon: 'TrendingUp', color: '#0d9488' },
  { slug: 'shipments', name: 'Shipments', category: 'trade', icon: 'Ship', color: '#2563eb' },
  { slug: 'logistics', name: 'Logistics Booking', category: 'trade', icon: 'Container', color: '#4f46e5' },
  { slug: 'export-docs', name: 'Export Documents', category: 'trade', icon: 'FileOutput', color: '#0891b2' },
  { slug: 'buyers', name: 'Buyers', category: 'trade', icon: 'UserCheck', color: '#65a30d' },
  { slug: 'buyer-portal', name: 'Buyer Portal', category: 'trade', icon: 'UserCheck', color: '#00a3e0' },
  { slug: 'billing', name: 'Billing', category: 'finance', icon: 'CreditCard', color: '#be185d' },
  { slug: 'users', name: 'Users', category: 'finance', icon: 'UserCog', color: '#6366f1' },
  { slug: 'iot-sensors', name: 'IoT Sensors', category: 'system', icon: 'Radio', color: '#0891b2' },
  { slug: 'blockchain', name: 'Blockchain', category: 'system', icon: 'Link', color: '#7c3aed' },
  { slug: 'api-settings', name: 'API & Webhooks', category: 'system', icon: 'Webhook', color: '#6366f1' },
  { slug: 'climate-intelligence', name: 'Climate Intelligence', category: 'farm', icon: 'Activity', color: '#00a3e0' },
] as const

// ════════════════════════════════════════════════════════════════
// TENANT DEFINITIONS
// ════════════════════════════════════════════════════════════════

interface TenantDef {
  slug: string
  name: string
  legalName: string
  entityType: string
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
  language: string
  timezone: string
  region: string
  locale: string
  supportedLanguages: string
}

const TENANT_DEFS: TenantDef[] = [
  {
    slug: 'metrang-coffee',
    name: 'Metrang Coffee',
    legalName: 'Công ty TNHH Metrang Coffee',
    entityType: 'producer',
    country: 'VN',
    countryCode: 'VN',
    currency: 'VND',
    currencySymbol: '₫',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    region: 'Southeast Asia',
    locale: 'vi-VN',
    supportedLanguages: '["vi","en"]',
  },
  {
    slug: 'cooxupe',
    name: 'Cooxupé',
    legalName: 'Cooperativa Regional de Cafeicultores em Guaxupé',
    entityType: 'aggregator',
    country: 'BR',
    countryCode: 'BR',
    currency: 'BRL',
    currencySymbol: 'R$',
    language: 'pt',
    timezone: 'America/Sao_Paulo',
    region: 'South America',
    locale: 'pt-BR',
    supportedLanguages: '["pt","en"]',
  },
  {
    slug: 'yirgacheffe-union',
    name: 'Yirgacheffe Union',
    legalName: 'Yirgacheffe Coffee Farmers Cooperative Union',
    entityType: 'producer',
    country: 'ET',
    countryCode: 'ET',
    currency: 'ETB',
    currencySymbol: 'Br',
    language: 'am',
    timezone: 'Africa/Addis_Ababa',
    region: 'East Africa',
    locale: 'am-ET',
    supportedLanguages: '["am","en"]',
  },
  {
    slug: 'othaya-cooperative',
    name: 'Othaya Cooperative',
    legalName: 'Othaya Farmers Cooperative Society Ltd',
    entityType: 'producer',
    country: 'KE',
    countryCode: 'KE',
    currency: 'KES',
    currencySymbol: 'KSh',
    language: 'sw',
    timezone: 'Africa/Nairobi',
    region: 'East Africa',
    locale: 'sw-KE',
    supportedLanguages: '["sw","en"]',
  },
  {
    slug: 'asunafo-export',
    name: 'Asunafo Export',
    legalName: 'Asunafo Cocoa & Coffee Export Ltd',
    entityType: 'exporter',
    country: 'GH',
    countryCode: 'GH',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    language: 'en',
    timezone: 'Africa/Accra',
    region: 'West Africa',
    locale: 'en-GH',
    supportedLanguages: '["en"]',
  },
  {
    slug: 'nkusi-coffee',
    name: 'Nkusi Coffee Cooperative',
    legalName: 'Nkusi Coffee Cooperative Society Ltd',
    entityType: 'aggregator',
    country: 'UG',
    countryCode: 'UG',
    currency: 'UGX',
    currencySymbol: 'USh',
    language: 'en',
    timezone: 'Africa/Kampala',
    region: 'East Africa',
    locale: 'en-UG',
    supportedLanguages: '["en"]',
  },
  {
    slug: 'nordic-coffee-import',
    name: 'Nordic Coffee Import',
    legalName: 'Nordic Coffee Import AB',
    entityType: 'importer',
    country: 'SE',
    countryCode: 'SE',
    currency: 'SEK',
    currencySymbol: 'kr',
    language: 'en',
    timezone: 'Europe/Stockholm',
    region: 'Europe',
    locale: 'en-SE',
    supportedLanguages: '["en","sv"]',
  },
  {
    slug: 'rainforest-cert',
    name: 'Rainforest Alliance Cert',
    legalName: 'Rainforest Alliance Certification Services',
    entityType: 'certification_body',
    country: 'DE',
    countryCode: 'DE',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'en',
    timezone: 'Europe/Berlin',
    region: 'Europe',
    locale: 'en-DE',
    supportedLanguages: '["en","de"]',
  },
  {
    slug: 'cup-science-lab',
    name: 'Cup Science Laboratory',
    legalName: 'Cup Science Quality Lab Ltd',
    entityType: 'laboratory',
    country: 'GB',
    countryCode: 'GB',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'en',
    timezone: 'Europe/London',
    region: 'Europe',
    locale: 'en-GB',
    supportedLanguages: '["en"]',
  },
]

// ════════════════════════════════════════════════════════════════
// MODULE VISIBILITY BY ENTITY TYPE
// ════════════════════════════════════════════════════════════════

const MODULES_BY_ENTITY_TYPE: Record<string, string[]> = {
  producer: [
    'dashboard', 'analytics', 'farmers', 'farmlands', 'cultivations', 'nurseries',
    'land-preparations', 'crop-monitorings', 'fertilizer-apps', 'pest-disease-mgmts',
    'harvest-traceabilities', 'procurement', 'eudr-compliance', 'cert-assessments',
    'deforestation', 'trace-journey', 'carbon-tracking', 'trust-score', 'esg-reporting',
    'marketplace', 'climate-intelligence', 'billing', 'users',
  ],
  aggregator: [
    'dashboard', 'analytics', 'harvest-traceabilities', 'procurement', 'processing',
    'coffee-inspections', 'qc-verifications', 'eudr-compliance', 'cert-assessments',
    'deforestation', 'marketplace', 'rfq', 'inspections', 'product-monitoring',
    'smart-contracts', 'trading-desk', 'shipments', 'logistics', 'buyers',
    'trace-journey', 'carbon-tracking', 'trust-score', 'esg-reporting',
    'iot-sensors', 'blockchain', 'billing', 'users',
  ],
  exporter: [
    'dashboard', 'analytics', 'eudr-compliance', 'deforestation', 'marketplace',
    'rfq', 'inspections', 'product-monitoring', 'smart-contracts', 'trading-desk',
    'shipments', 'logistics', 'export-docs', 'buyers', 'trace-journey',
    'carbon-tracking', 'trust-score', 'esg-reporting', 'blockchain', 'billing', 'users',
  ],
  importer: [
    'dashboard', 'analytics', 'eudr-compliance', 'marketplace', 'rfq', 'inspections',
    'product-monitoring', 'smart-contracts', 'trading-desk', 'shipments', 'logistics',
    'buyers', 'buyer-portal', 'trace-journey', 'carbon-tracking', 'trust-score',
    'esg-reporting', 'blockchain', 'billing', 'users',
  ],
  certification_body: [
    'dashboard', 'analytics', 'coffee-inspections', 'cert-assessments',
    'eudr-compliance', 'deforestation', 'inspections', 'trace-journey',
    'esg-reporting', 'billing', 'users',
  ],
  laboratory: [
    'dashboard', 'analytics', 'coffee-inspections', 'qc-verifications',
    'inspections', 'billing', 'users',
  ],
}

// ════════════════════════════════════════════════════════════════
// USER ROLES BY ENTITY TYPE
// ════════════════════════════════════════════════════════════════

interface UserRoleDef {
  prefix: string
  role: string
  name: string
  entityTypes: string[]
}

const USER_ROLE_DEFS: UserRoleDef[] = [
  { prefix: 'admin', role: 'tenant_admin', name: 'Administrator', entityTypes: ['producer', 'aggregator', 'exporter', 'importer', 'certification_body', 'laboratory'] },
  { prefix: 'ops', role: 'operations_manager', name: 'Operations Manager', entityTypes: ['producer', 'aggregator'] },
  { prefix: 'field', role: 'field_officer', name: 'Field Officer', entityTypes: ['producer'] },
  { prefix: 'qc', role: 'quality_controller', name: 'Quality Controller', entityTypes: ['producer', 'aggregator'] },
  { prefix: 'trader', role: 'trader', name: 'Trader', entityTypes: ['aggregator', 'exporter', 'importer'] },
  { prefix: 'finance', role: 'finance_manager', name: 'Finance Manager', entityTypes: ['producer', 'aggregator', 'exporter', 'importer', 'certification_body'] },
  { prefix: 'inspector', role: 'inspector', name: 'Inspector', entityTypes: ['certification_body', 'laboratory'] },
  { prefix: 'viewer', role: 'viewer', name: 'Viewer', entityTypes: ['producer', 'aggregator', 'exporter', 'importer', 'certification_body', 'laboratory'] },
]

// ════════════════════════════════════════════════════════════════
// COUNTRY PIPELINE DATA
// ════════════════════════════════════════════════════════════════

interface FarmerDef {
  code: string
  fullName: string
  firstName: string
  lastName: string
  contactNumber: string
  gender: string
  dob: Date
  nationalIdType: string
  nationalIdNo: string
  province: string
  district: string
  commune?: string
  village?: string
  latitude: number
  longitude: number
  yearsOfFarmingExperience: number
  cooperative: string
  isCertified: boolean
  certificationType?: string
  education: string
  maritalStatus: string
  noOfFamilyMembers: number
  smartphoneOwnership: boolean
  gapTrainingAttended: boolean
  creditScore: number
  loanTaken: boolean
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string
  bankName: string
  bankBranch: string
  accountNumber: string
  accountHolderName: string
  sortCodeSwift?: string
  paymentPreference: string
  cropInsurance: boolean
  healthInsurance: boolean
  lifeInsurance: boolean
  housingOwnership: string
  houseType: string
  variety: string
  batchId: string
  processingMethod: string
  soilType: string
  altitude: number
}

interface CountryPipeline {
  tenantSlug: string
  countryCode: string
  province: string
  district: string
  centerLat: number
  centerLng: number
  farmers: FarmerDef[]
}

const COUNTRY_PIPELINES: CountryPipeline[] = [
  // ─── Vietnam ─────────────────────────────────────────────
  {
    tenantSlug: 'metrang-coffee',
    countryCode: 'VN',
    province: 'Đắk Lắk',
    district: 'Cư Mgar',
    centerLat: 12.66,
    centerLng: 108.04,
    farmers: [
      {
        code: 'FRM-VN-001', fullName: 'Nguyễn Văn Thanh', firstName: 'Thanh', lastName: 'Nguyễn',
        contactNumber: '+84-901-234-567', gender: 'male', dob: new Date('1975-03-15'),
        nationalIdType: 'CMND', nationalIdNo: '275123456',
        province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tul', village: 'Buôn Ko Tu',
        latitude: 12.665, longitude: 108.042,
        yearsOfFarmingExperience: 25, cooperative: 'Metrang Coffee',
        isCertified: true, certificationType: '4C',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 5,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 85,
        loanTaken: true, bankName: 'Vietcombank', bankBranch: 'Buôn Ma Thuột',
        accountNumber: '0491000123456', accountHolderName: 'Nguyễn Văn Thanh',
        sortCodeSwift: 'BFTVVNVX', paymentPreference: 'bank_transfer',
        cropInsurance: true, healthInsurance: true, lifeInsurance: true,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'Robusta', batchId: 'TB-2024-VN-001',
        processingMethod: 'Wet processing', soilType: 'Basalt red soil', altitude: 520,
      },
      {
        code: 'FRM-VN-002', fullName: 'Trần Thị Hoa', firstName: 'Hoa', lastName: 'Trần',
        contactNumber: '+84-902-345-678', gender: 'female', dob: new Date('1980-07-22'),
        nationalIdType: 'CMND', nationalIdNo: '280234567',
        province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tul', village: 'Buôn Đôn',
        latitude: 12.655, longitude: 108.038,
        yearsOfFarmingExperience: 18, cooperative: 'Metrang Coffee',
        isCertified: true, certificationType: 'UTZ',
        education: 'primary', maritalStatus: 'married', noOfFamilyMembers: 4,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 78,
        loanTaken: false, bankName: 'Agribank', bankBranch: 'Cư Mgar',
        accountNumber: '1501200678901', accountHolderName: 'Trần Thị Hoa',
        sortCodeSwift: 'VBAAVNVX', paymentPreference: 'bank_transfer',
        cropInsurance: true, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'Catimor', batchId: 'TB-2024-VN-002',
        processingMethod: 'Honey process', soilType: 'Basalt red soil', altitude: 580,
      },
      {
        code: 'FRM-VN-003', fullName: 'Lê Hoàng Nam', firstName: 'Nam', lastName: 'Lê',
        contactNumber: '+84-903-456-789', gender: 'male', dob: new Date('1985-11-08'),
        nationalIdType: 'CCCD', nationalIdNo: '001085003456',
        province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Drơng', village: 'Thôn 3',
        latitude: 12.670, longitude: 108.050,
        yearsOfFarmingExperience: 12, cooperative: 'Metrang Coffee',
        isCertified: false, education: 'secondary', maritalStatus: 'married',
        noOfFamilyMembers: 3, smartphoneOwnership: true, gapTrainingAttended: true,
        creditScore: 72, loanTaken: true, bankName: 'BIDV', bankBranch: 'Buôn Ma Thuột',
        accountNumber: '5611000234567', accountHolderName: 'Lê Hoàng Nam',
        sortCodeSwift: 'BIDVVNVX', paymentPreference: 'bank_transfer',
        cropInsurance: false, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'semi-permanent',
        variety: 'Arabica', batchId: 'TB-2024-VN-003',
        processingMethod: 'Wet processing', soilType: 'Red yellow soil', altitude: 950,
      },
    ],
  },
  // ─── Brazil ──────────────────────────────────────────────
  {
    tenantSlug: 'cooxupe',
    countryCode: 'BR',
    province: 'Minas Gerais',
    district: 'Guaxupé',
    centerLat: -21.30,
    centerLng: -46.72,
    farmers: [
      {
        code: 'FRM-BR-001', fullName: 'Carlos Silva', firstName: 'Carlos', lastName: 'Silva',
        contactNumber: '+55-35-99111-2222', gender: 'male', dob: new Date('1970-05-10'),
        nationalIdType: 'CPF', nationalIdNo: '123.456.789-00',
        province: 'Minas Gerais', district: 'Guaxupé',
        latitude: -21.295, longitude: -46.718,
        yearsOfFarmingExperience: 30, cooperative: 'Cooxupé',
        isCertified: true, certificationType: 'Rainforest Alliance',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 6,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 90,
        loanTaken: false, bankName: 'Banco do Brasil', bankBranch: 'Guaxupé',
        accountNumber: '0001-12345-6', accountHolderName: 'Carlos Silva',
        paymentPreference: 'bank_transfer',
        cropInsurance: true, healthInsurance: true, lifeInsurance: true,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'Bourbon', batchId: 'TB-2024-BR-001',
        processingMethod: 'Natural/Dry', soilType: 'Red Latosol', altitude: 850,
      },
      {
        code: 'FRM-BR-002', fullName: 'Ana Oliveira', firstName: 'Ana', lastName: 'Oliveira',
        contactNumber: '+55-35-99222-3333', gender: 'female', dob: new Date('1978-09-18'),
        nationalIdType: 'CPF', nationalIdNo: '234.567.890-11',
        province: 'Minas Gerais', district: 'Guaxupé',
        latitude: -21.305, longitude: -46.725,
        yearsOfFarmingExperience: 22, cooperative: 'Cooxupé',
        isCertified: true, certificationType: 'Fairtrade',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 4,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 88,
        loanTaken: true, bankName: 'Itaú', bankBranch: 'Guaxupé',
        accountNumber: '0002-67890-1', accountHolderName: 'Ana Oliveira',
        paymentPreference: 'bank_transfer',
        cropInsurance: true, healthInsurance: true, lifeInsurance: true,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'Catuaí', batchId: 'TB-2024-BR-002',
        processingMethod: 'Pulped Natural', soilType: 'Red Yellow Latosol', altitude: 920,
      },
      {
        code: 'FRM-BR-003', fullName: 'João Santos', firstName: 'João', lastName: 'Santos',
        contactNumber: '+55-35-99333-4444', gender: 'male', dob: new Date('1982-01-25'),
        nationalIdType: 'CPF', nationalIdNo: '345.678.901-22',
        province: 'Minas Gerais', district: 'Guaxupé',
        latitude: -21.310, longitude: -46.710,
        yearsOfFarmingExperience: 15, cooperative: 'Cooxupé',
        isCertified: false, education: 'primary', maritalStatus: 'single',
        noOfFamilyMembers: 2, smartphoneOwnership: true, gapTrainingAttended: false,
        creditScore: 75, loanTaken: true, bankName: 'Bradesco', bankBranch: 'Guaxupé',
        accountNumber: '0003-11111-2', accountHolderName: 'João Santos',
        paymentPreference: 'bank_transfer',
        cropInsurance: false, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'semi-permanent',
        variety: 'Mundo Novo', batchId: 'TB-2024-BR-003',
        processingMethod: 'Natural/Dry', soilType: 'Dystrophic Red Latosol', altitude: 780,
      },
    ],
  },
  // ─── Ethiopia ────────────────────────────────────────────
  {
    tenantSlug: 'yirgacheffe-union',
    countryCode: 'ET',
    province: 'Gedeo',
    district: 'Yirgacheffe',
    centerLat: 6.16,
    centerLng: 38.20,
    farmers: [
      {
        code: 'FRM-ET-001', fullName: 'Abebe Tadesse', firstName: 'Abebe', lastName: 'Tadesse',
        contactNumber: '+251-91-234-5678', gender: 'male', dob: new Date('1968-02-14'),
        nationalIdType: 'Kebele ID', nationalIdNo: 'ET-GD-001234',
        province: 'Gedeo', district: 'Yirgacheffe', village: 'Konga',
        latitude: 6.165, longitude: 38.205,
        yearsOfFarmingExperience: 35, cooperative: 'Yirgacheffe Union',
        isCertified: true, certificationType: 'Organic',
        education: 'primary', maritalStatus: 'married', noOfFamilyMembers: 7,
        smartphoneOwnership: false, gapTrainingAttended: true, creditScore: 82,
        loanTaken: true, mobileMoneyProvider: 'telebirr', mobileMoneyNumber: '+251-91-234-5678',
        bankName: 'Commercial Bank of Ethiopia', bankBranch: 'Yirgacheffe',
        accountNumber: 'ET0123456789', accountHolderName: 'Abebe Tadesse',
        paymentPreference: 'mobile_money',
        cropInsurance: false, healthInsurance: false, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'traditional',
        variety: 'Heirloom Yirgacheffe', batchId: 'TB-2024-ET-001',
        processingMethod: 'Washed', soilType: 'Nitosol', altitude: 1850,
      },
      {
        code: 'FRM-ET-002', fullName: 'Tigist Worku', firstName: 'Tigist', lastName: 'Worku',
        contactNumber: '+251-92-345-6789', gender: 'female', dob: new Date('1975-08-30'),
        nationalIdType: 'Kebele ID', nationalIdNo: 'ET-GD-002345',
        province: 'Gedeo', district: 'Yirgacheffe', village: 'Biloya',
        latitude: 6.155, longitude: 38.195,
        yearsOfFarmingExperience: 20, cooperative: 'Yirgacheffe Union',
        isCertified: true, certificationType: 'Fairtrade',
        education: 'primary', maritalStatus: 'married', noOfFamilyMembers: 5,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 80,
        loanTaken: false, mobileMoneyProvider: 'telebirr', mobileMoneyNumber: '+251-92-345-6789',
        bankName: 'Awash Bank', bankBranch: 'Dilla',
        accountNumber: 'ET0234567890', accountHolderName: 'Tigist Worku',
        paymentPreference: 'mobile_money',
        cropInsurance: false, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'semi-permanent',
        variety: 'Kurume', batchId: 'TB-2024-ET-002',
        processingMethod: 'Natural', soilType: 'Nitosol', altitude: 1920,
      },
      {
        code: 'FRM-ET-003', fullName: 'Dawit Haile', firstName: 'Dawit', lastName: 'Haile',
        contactNumber: '+251-93-456-7890', gender: 'male', dob: new Date('1990-12-05'),
        nationalIdType: 'Kebele ID', nationalIdNo: 'ET-GD-003456',
        province: 'Gedeo', district: 'Yirgacheffe', village: 'Worka',
        latitude: 6.170, longitude: 38.210,
        yearsOfFarmingExperience: 10, cooperative: 'Yirgacheffe Union',
        isCertified: false, education: 'secondary', maritalStatus: 'single',
        noOfFamilyMembers: 3, smartphoneOwnership: true, gapTrainingAttended: true,
        creditScore: 68, loanTaken: false, bankName: 'Dashen Bank', bankBranch: 'Yirgacheffe',
        accountNumber: 'ET0345678901', accountHolderName: 'Dawit Haile',
        paymentPreference: 'bank_transfer',
        cropInsurance: false, healthInsurance: false, lifeInsurance: false,
        housingOwnership: 'family', houseType: 'traditional',
        variety: 'Wolisho', batchId: 'TB-2024-ET-003',
        processingMethod: 'Washed', soilType: 'Andosol', altitude: 1780,
      },
    ],
  },
  // ─── Kenya ───────────────────────────────────────────────
  {
    tenantSlug: 'othaya-cooperative',
    countryCode: 'KE',
    province: 'Nyeri',
    district: 'Othaya',
    centerLat: -0.54,
    centerLng: 36.94,
    farmers: [
      {
        code: 'FRM-KE-001', fullName: 'James Mwangi', firstName: 'James', lastName: 'Mwangi',
        contactNumber: '+254-712-345-678', gender: 'male', dob: new Date('1972-04-20'),
        nationalIdType: 'National ID', nationalIdNo: 'KE-28345678',
        province: 'Nyeri', district: 'Othaya', village: 'Gatuyaini',
        latitude: -0.535, longitude: 36.942,
        yearsOfFarmingExperience: 28, cooperative: 'Othaya FCS',
        isCertified: true, certificationType: 'Rainforest Alliance',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 6,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 87,
        loanTaken: true, mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254-712-345-678',
        bankName: 'Equity Bank', bankBranch: 'Othaya',
        accountNumber: 'KE1234567890', accountHolderName: 'James Mwangi',
        paymentPreference: 'mobile_money',
        cropInsurance: true, healthInsurance: true, lifeInsurance: true,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'SL28', batchId: 'TB-2024-KE-001',
        processingMethod: 'Fully Washed', soilType: 'Humic Nitosol', altitude: 1650,
      },
      {
        code: 'FRM-KE-002', fullName: 'Wanjiku Njoroge', firstName: 'Wanjiku', lastName: 'Njoroge',
        contactNumber: '+254-723-456-789', gender: 'female', dob: new Date('1980-06-12'),
        nationalIdType: 'National ID', nationalIdNo: 'KE-29456789',
        province: 'Nyeri', district: 'Othaya', village: 'Mahiga',
        latitude: -0.545, longitude: 36.935,
        yearsOfFarmingExperience: 15, cooperative: 'Othaya FCS',
        isCertified: true, certificationType: 'Fairtrade',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 4,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 83,
        loanTaken: false, mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254-723-456-789',
        bankName: 'Co-operative Bank', bankBranch: 'Othaya',
        accountNumber: 'KE2345678901', accountHolderName: 'Wanjiku Njoroge',
        paymentPreference: 'mobile_money',
        cropInsurance: true, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'SL34', batchId: 'TB-2024-KE-002',
        processingMethod: 'Washed', soilType: 'Nitosol', altitude: 1720,
      },
      {
        code: 'FRM-KE-003', fullName: 'Peter Kamau', firstName: 'Peter', lastName: 'Kamau',
        contactNumber: '+254-734-567-890', gender: 'male', dob: new Date('1988-09-03'),
        nationalIdType: 'National ID', nationalIdNo: 'KE-30567890',
        province: 'Nyeri', district: 'Othaya', village: 'Chinga',
        latitude: -0.550, longitude: 36.948,
        yearsOfFarmingExperience: 8, cooperative: 'Othaya FCS',
        isCertified: false, education: 'secondary', maritalStatus: 'married',
        noOfFamilyMembers: 3, smartphoneOwnership: true, gapTrainingAttended: false,
        creditScore: 65, loanTaken: true, mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254-734-567-890',
        bankName: 'KCB Bank', bankBranch: 'Othaya',
        accountNumber: 'KE3456789012', accountHolderName: 'Peter Kamau',
        paymentPreference: 'mobile_money',
        cropInsurance: false, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'family', houseType: 'semi-permanent',
        variety: 'Ruiru 11', batchId: 'TB-2024-KE-003',
        processingMethod: 'Fully Washed', soilType: 'Ferralsol', altitude: 1580,
      },
    ],
  },
  // ─── Ghana ───────────────────────────────────────────────
  {
    tenantSlug: 'asunafo-export',
    countryCode: 'GH',
    province: 'Ahafo',
    district: 'Asunafo North',
    centerLat: 6.95,
    centerLng: -2.36,
    farmers: [
      {
        code: 'FRM-GH-001', fullName: 'Kwame Asante', firstName: 'Kwame', lastName: 'Asante',
        contactNumber: '+233-24-123-4567', gender: 'male', dob: new Date('1975-03-08'),
        nationalIdType: 'Ghana Card', nationalIdNo: 'GHA-000123-1',
        province: 'Ahafo', district: 'Asunafo North', village: 'Kwabre',
        latitude: 6.955, longitude: -2.355,
        yearsOfFarmingExperience: 22, cooperative: 'Asunafo Cooperative',
        isCertified: true, certificationType: 'UTZ',
        education: 'primary', maritalStatus: 'married', noOfFamilyMembers: 5,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 79,
        loanTaken: true, mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+233-24-123-4567',
        bankName: 'GCB Bank', bankBranch: 'Goaso',
        accountNumber: 'GH1234567890', accountHolderName: 'Kwame Asante',
        paymentPreference: 'mobile_money',
        cropInsurance: true, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'semi-permanent',
        variety: 'Robusta', batchId: 'TB-2024-GH-001',
        processingMethod: 'Natural', soilType: 'Forest Ochrosol', altitude: 320,
      },
      {
        code: 'FRM-GH-002', fullName: 'Abena Boateng', firstName: 'Abena', lastName: 'Boateng',
        contactNumber: '+233-25-234-5678', gender: 'female', dob: new Date('1982-07-15'),
        nationalIdType: 'Ghana Card', nationalIdNo: 'GHA-000234-2',
        province: 'Ahafo', district: 'Asunafo North', village: 'Atronie',
        latitude: 6.945, longitude: -2.365,
        yearsOfFarmingExperience: 14, cooperative: 'Asunafo Cooperative',
        isCertified: true, certificationType: 'Fairtrade',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 4,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 81,
        loanTaken: false, mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+233-25-234-5678',
        bankName: 'Agricultural Development Bank', bankBranch: 'Goaso',
        accountNumber: 'GH2345678901', accountHolderName: 'Abena Boateng',
        paymentPreference: 'mobile_money',
        cropInsurance: true, healthInsurance: true, lifeInsurance: true,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'Arabica', batchId: 'TB-2024-GH-002',
        processingMethod: 'Semi-washed', soilType: 'Forest Oxysol', altitude: 450,
      },
      {
        code: 'FRM-GH-003', fullName: 'Kofi Mensah', firstName: 'Kofi', lastName: 'Mensah',
        contactNumber: '+233-26-345-6789', gender: 'male', dob: new Date('1990-11-22'),
        nationalIdType: 'Ghana Card', nationalIdNo: 'GHA-000345-3',
        province: 'Ahafo', district: 'Asunafo North', village: 'Dormaa',
        latitude: 6.960, longitude: -2.370,
        yearsOfFarmingExperience: 8, cooperative: 'Asunafo Cooperative',
        isCertified: false, education: 'secondary', maritalStatus: 'single',
        noOfFamilyMembers: 2, smartphoneOwnership: true, gapTrainingAttended: false,
        creditScore: 62, loanTaken: false, mobileMoneyProvider: 'Vodafone Cash', mobileMoneyNumber: '+233-26-345-6789',
        bankName: 'Ecobank', bankBranch: 'Sunyani',
        accountNumber: 'GH3456789012', accountHolderName: 'Kofi Mensah',
        paymentPreference: 'mobile_money',
        cropInsurance: false, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'family', houseType: 'semi-permanent',
        variety: 'Fantee', batchId: 'TB-2024-GH-003',
        processingMethod: 'Natural', soilType: 'Forest Ochrosol', altitude: 280,
      },
    ],
  },
  // ─── Uganda ──────────────────────────────────────────────
  {
    tenantSlug: 'nkusi-coffee',
    countryCode: 'UG',
    province: 'Eastern',
    district: 'Mbale',
    centerLat: 1.08,
    centerLng: 34.18,
    farmers: [
      {
        code: 'FRM-UG-001', fullName: 'Emmanuel Mukasa', firstName: 'Emmanuel', lastName: 'Mukasa',
        contactNumber: '+256-771-234-567', gender: 'male', dob: new Date('1978-06-10'),
        nationalIdType: 'National ID', nationalIdNo: 'UG-CA-123456',
        province: 'Eastern', district: 'Mbale', village: 'Bumasobo',
        latitude: 1.085, longitude: 34.185,
        yearsOfFarmingExperience: 20, cooperative: 'Nkusi Coffee Cooperative',
        isCertified: true, certificationType: 'Organic',
        education: 'primary', maritalStatus: 'married', noOfFamilyMembers: 6,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 76,
        loanTaken: true, mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+256-771-234-567',
        bankName: 'Centenary Bank', bankBranch: 'Mbale',
        accountNumber: 'UG1234567890', accountHolderName: 'Emmanuel Mukasa',
        paymentPreference: 'mobile_money',
        cropInsurance: false, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'semi-permanent',
        variety: 'Arabica SL28', batchId: 'TB-2024-UG-001',
        processingMethod: 'Washed', soilType: 'Nitosol', altitude: 1600,
      },
      {
        code: 'FRM-UG-002', fullName: 'Grace Nalubega', firstName: 'Grace', lastName: 'Nalubega',
        contactNumber: '+256-782-345-678', gender: 'female', dob: new Date('1985-09-25'),
        nationalIdType: 'National ID', nationalIdNo: 'UG-CA-234567',
        province: 'Eastern', district: 'Kapchorwa', village: 'Tulel',
        latitude: 1.075, longitude: 34.175,
        yearsOfFarmingExperience: 12, cooperative: 'Nkusi Coffee Cooperative',
        isCertified: true, certificationType: 'Fairtrade',
        education: 'secondary', maritalStatus: 'married', noOfFamilyMembers: 4,
        smartphoneOwnership: true, gapTrainingAttended: true, creditScore: 80,
        loanTaken: false, mobileMoneyProvider: 'Airtel Money', mobileMoneyNumber: '+256-782-345-678',
        bankName: 'Stanbic Bank', bankBranch: 'Mbale',
        accountNumber: 'UG2345678901', accountHolderName: 'Grace Nalubega',
        paymentPreference: 'mobile_money',
        cropInsurance: true, healthInsurance: true, lifeInsurance: false,
        housingOwnership: 'owned', houseType: 'permanent',
        variety: 'Bugisu', batchId: 'TB-2024-UG-002',
        processingMethod: 'Natural', soilType: 'Andosol', altitude: 1750,
      },
      {
        code: 'FRM-UG-003', fullName: 'James Ochieng', firstName: 'James', lastName: 'Ochieng',
        contactNumber: '+256-793-456-789', gender: 'male', dob: new Date('1992-01-18'),
        nationalIdType: 'National ID', nationalIdNo: 'UG-CA-345678',
        province: 'Eastern', district: 'Mbale', village: 'Budadiri',
        latitude: 1.090, longitude: 34.190,
        yearsOfFarmingExperience: 7, cooperative: 'Nkusi Coffee Cooperative',
        isCertified: false, education: 'primary', maritalStatus: 'single',
        noOfFamilyMembers: 2, smartphoneOwnership: true, gapTrainingAttended: false,
        creditScore: 58, loanTaken: false, mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+256-793-456-789',
        bankName: 'DFCU Bank', bankBranch: 'Mbale',
        accountNumber: 'UG3456789012', accountHolderName: 'James Ochieng',
        paymentPreference: 'mobile_money',
        cropInsurance: false, healthInsurance: false, lifeInsurance: false,
        housingOwnership: 'family', houseType: 'traditional',
        variety: 'Robusta', batchId: 'TB-2024-UG-003',
        processingMethod: 'Washed', soilType: 'Ferrallitic', altitude: 1200,
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════
// CREDENTIAL TABLE TRACKING
// ════════════════════════════════════════════════════════════════

interface CredentialEntry {
  email: string
  password: string
  role: string
  tenantSlug: string
  entityType: string
}

const credentials: CredentialEntry[] = []

// ════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n🌱 Seeding TerraBrew Coffee Platform (v3 — Comprehensive)...\n')

  const PWD = await bcrypt.hash('Admin@2024', 12)

  // ═══════════════════════════════════════════════════════
  // 1. PLATFORM ADMIN
  // ═══════════════════════════════════════════════════════
  console.log('📋 1. Creating Platform Admin...')

  await db.platformUser.upsert({
    where: { email: 'admin@terrabrew.platform' },
    update: { passwordHash: PWD, name: 'Platform Admin', role: 'super_admin', isActive: true },
    create: { email: 'admin@terrabrew.platform', passwordHash: PWD, name: 'Platform Admin', role: 'super_admin' },
  })

  credentials.push({
    email: 'admin@terrabrew.platform',
    password: 'Admin@2024',
    role: 'super_admin',
    tenantSlug: '—',
    entityType: 'platform',
  })

  console.log('  ✅ Platform admin upserted')

  // ═══════════════════════════════════════════════════════
  // 2. MODULES (upsert all)
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 2. Upserting Modules...')

  for (const mod of MODULE_DEFS) {
    await db.module.upsert({
      where: { slug: mod.slug },
      update: { name: mod.name, category: mod.category, icon: mod.icon, color: mod.color },
      create: { slug: mod.slug, name: mod.name, category: mod.category, icon: mod.icon, color: mod.color },
    })
  }

  console.log(`  ✅ ${MODULE_DEFS.length} modules upserted`)

  // ═══════════════════════════════════════════════════════
  // 3. TENANTS (9 tenants with BOTH country AND countryCode)
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 3. Upserting Tenants...')

  const tenantMap: Record<string, string> = {} // slug → id

  for (const t of TENANT_DEFS) {
    const tenant = await db.tenant.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        legalName: t.legalName,
        entityType: t.entityType,
        country: t.country,
        countryCode: t.countryCode,
        currency: t.currency,
        currencySymbol: t.currencySymbol,
        language: t.language,
        timezone: t.timezone,
        region: t.region,
        locale: t.locale,
        supportedLanguages: t.supportedLanguages,
        isActive: true,
      },
      create: {
        slug: t.slug,
        name: t.name,
        legalName: t.legalName,
        entityType: t.entityType,
        country: t.country,
        countryCode: t.countryCode,
        currency: t.currency,
        currencySymbol: t.currencySymbol,
        language: t.language,
        timezone: t.timezone,
        region: t.region,
        locale: t.locale,
        supportedLanguages: t.supportedLanguages,
        eudrCompliant: t.entityType === 'producer' || t.entityType === 'aggregator' || t.entityType === 'exporter',
        plan: 'professional',
        maxUsers: 50,
        maxFarmers: 2000,
        isActive: true,
      },
    })
    tenantMap[t.slug] = tenant.id
    console.log(`  ✅ ${t.slug} (${t.entityType}) — country: ${t.country}, countryCode: ${t.countryCode}`)
  }

  // ═══════════════════════════════════════════════════════
  // 4. TENANT MODULES
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 4. Assigning Tenant Modules...')

  for (const t of TENANT_DEFS) {
    const tenantId = tenantMap[t.slug]
    const moduleSlugs = MODULES_BY_ENTITY_TYPE[t.entityType] || []

    for (const modSlug of moduleSlugs) {
      await db.tenantModule.upsert({
        where: { tenantId_moduleSlug: { tenantId, moduleSlug: modSlug } },
        update: { isEnabled: true },
        create: { tenantId, moduleSlug: modSlug, isEnabled: true },
      })
    }

    console.log(`  ✅ ${t.slug}: ${moduleSlugs.length} modules enabled`)
  }

  // ═══════════════════════════════════════════════════════
  // 5. USERS PER TENANT
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 5. Creating Users per Tenant...')

  for (const t of TENANT_DEFS) {
    const tenantId = tenantMap[t.slug]
    const applicableRoles = USER_ROLE_DEFS.filter(r => r.entityTypes.includes(t.entityType))

    for (const roleDef of applicableRoles) {
      const email = `${roleDef.prefix}@${t.slug}.terrabrew.com`
      const name = `${roleDef.name} — ${t.name}`

      await db.user.upsert({
        where: { email_tenantId: { email, tenantId } },
        update: { passwordHash: PWD, name, role: roleDef.role, isActive: true },
        create: { email, passwordHash: PWD, name, role: roleDef.role, tenantId, isActive: true },
      })

      credentials.push({
        email,
        password: 'Admin@2024',
        role: roleDef.role,
        tenantSlug: t.slug,
        entityType: t.entityType,
      })
    }

    console.log(`  ✅ ${t.slug}: ${applicableRoles.length} users created`)
  }

  // ═══════════════════════════════════════════════════════
  // 6. FULL TRACEABILITY PIPELINE DATA
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 6. Creating Traceability Pipeline Data...')

  for (const pipeline of COUNTRY_PIPELINES) {
    const tenantId = tenantMap[pipeline.tenantSlug]
    if (!tenantId) {
      console.log(`  ⚠️  Tenant ${pipeline.tenantSlug} not found, skipping pipeline`)
      continue
    }

    console.log(`\n  🌍 ${pipeline.countryCode} — ${pipeline.tenantSlug}`)

    for (const f of pipeline.farmers) {
      console.log(`    🧑‍🌾 ${f.fullName} (${f.code})`)

      // ─── Farmer ──────────────────────────────────────
      const farmer = await db.farmer.upsert({
        where: { farmerCode_tenantId: { farmerCode: f.code, tenantId } },
        update: {
          fullName: f.fullName,
          firstName: f.firstName,
          lastName: f.lastName,
          contactNumber: f.contactNumber,
          gender: f.gender,
          dob: f.dob,
          country: pipeline.countryCode,
          province: f.province,
          district: f.district,
          commune: f.commune,
          village: f.village,
          latitude: f.latitude,
          longitude: f.longitude,
          nationalIdType: f.nationalIdType,
          nationalIdNo: f.nationalIdNo,
          isCertified: f.isCertified,
          certificationType: f.certificationType,
          cooperative: f.cooperative,
          yearsOfFarmingExperience: f.yearsOfFarmingExperience,
          creditScore: f.creditScore,
          loanTaken: f.loanTaken,
          mobileMoneyProvider: f.mobileMoneyProvider,
          mobileMoneyNumber: f.mobileMoneyNumber,
          bankName: f.bankName,
          bankBranch: f.bankBranch,
          accountNumber: f.accountNumber,
          accountHolderName: f.accountHolderName,
          sortCodeSwift: f.sortCodeSwift,
          paymentPreference: f.paymentPreference,
          loanAmount: f.loanTaken ? 2000 : null,
          loanPurpose: f.loanTaken ? 'Farm expansion' : null,
          loanInterest: f.loanTaken ? 8.5 : null,
          loanSecurity: f.loanTaken,
          cropInsurance: f.cropInsurance,
          healthInsurance: f.healthInsurance,
          lifeInsurance: f.lifeInsurance,
          housingOwnership: f.housingOwnership,
          houseType: f.houseType,
          smartphoneOwnership: f.smartphoneOwnership,
          noOfFamilyMembers: f.noOfFamilyMembers,
          education: f.education,
          maritalStatus: f.maritalStatus,
          spouseName: f.maritalStatus === 'married' ? 'Spouse' : null,
          gapTrainingAttended: f.gapTrainingAttended,
          enrollmentDate: new Date('2023-01-15'),
          enrollmentPlace: f.district,
          isActive: true,
        },
        create: {
          tenantId,
          farmerCode: f.code,
          fullName: f.fullName,
          firstName: f.firstName,
          lastName: f.lastName,
          contactNumber: f.contactNumber,
          gender: f.gender,
          dob: f.dob,
          country: pipeline.countryCode,
          province: f.province,
          district: f.district,
          commune: f.commune,
          village: f.village,
          latitude: f.latitude,
          longitude: f.longitude,
          nationalIdType: f.nationalIdType,
          nationalIdNo: f.nationalIdNo,
          isCertified: f.isCertified,
          certificationType: f.certificationType,
          cooperative: f.cooperative,
          yearsOfFarmingExperience: f.yearsOfFarmingExperience,
          creditScore: f.creditScore,
          loanTaken: f.loanTaken,
          loanTakenFrom: f.loanTaken ? 'Local Microfinance' : null,
          loanAmount: f.loanTaken ? 2000 : null,
          loanPurpose: f.loanTaken ? 'Farm expansion' : null,
          loanInterest: f.loanTaken ? 8.5 : null,
          loanSecurity: f.loanTaken,
          cropInsurance: f.cropInsurance,
          healthInsurance: f.healthInsurance,
          lifeInsurance: f.lifeInsurance,
          housingOwnership: f.housingOwnership,
          houseType: f.houseType,
          smartphoneOwnership: f.smartphoneOwnership,
          noOfFamilyMembers: f.noOfFamilyMembers,
          education: f.education,
          maritalStatus: f.maritalStatus,
          spouseName: f.maritalStatus === 'married' ? 'Spouse' : null,
          gapTrainingAttended: f.gapTrainingAttended,
          bankName: f.bankName,
          bankBranch: f.bankBranch,
          accountNumber: f.accountNumber,
          accountHolderName: f.accountHolderName,
          sortCodeSwift: f.sortCodeSwift,
          mobileMoneyProvider: f.mobileMoneyProvider,
          mobileMoneyNumber: f.mobileMoneyNumber,
          paymentPreference: f.paymentPreference,
          enrollmentDate: new Date('2023-01-15'),
          enrollmentPlace: f.district,
          isActive: true,
        },
      })

      // ─── FarmLand ────────────────────────────────────
      const farmLand = await db.farmLand.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmName: `${f.lastName} Farm — ${f.district}`,
          plotBlockId: `${f.code}-PLT-01`,
          totalLandHolding: pipeline.countryCode === 'BR' ? 12.0 : pipeline.countryCode === 'ET' ? 1.2 : 2.5,
          altitude: f.altitude,
          soilType: f.soilType,
          latitude: f.latitude,
          longitude: f.longitude,
          noOfTrees: pipeline.countryCode === 'BR' ? 18000 : pipeline.countryCode === 'ET' ? 1800 : 3600,
          estYield: pipeline.countryCode === 'BR' ? 4500 : pipeline.countryCode === 'ET' ? 450 : 900,
          boundaryArea: pipeline.countryCode === 'BR' ? 12.0 : 2.5,
          polygonGeoJson: makePolygonGeoJson(f.latitude, f.longitude),
          geoCenterLat: f.latitude,
          geoCenterLng: f.longitude,
          fertilityStatus: 'good',
          shadeTreeSpecies: 'Inga, Grevillea',
          shadeTreeDensity: 40,
          fullTimeWorkers: pipeline.countryCode === 'BR' ? 5 : 0,
          familyWorkers: pipeline.countryCode === 'BR' ? 0 : 4,
          childLabourPolicy: true,
          minimumWageCompliance: true,
          ppeAvailable: f.isCertified,
          isActive: true,
        },
      })

      // ─── Cultivation ─────────────────────────────────
      const cultivation = await db.cultivation.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          farmPlotName: `${f.variety} Plot — ${f.code}`,
          plotBlockId: `${f.code}-PLT-01`,
          cultivatedCrop: 'coffee',
          cropVariety: f.variety,
          coffeeSpecies: f.variety.includes('Robusta') ? 'Canephora' : 'Arabica',
          cultivationArea: pipeline.countryCode === 'BR' ? 10.0 : pipeline.countryCode === 'ET' ? 1.0 : 2.0,
          sowingDate: new Date('2020-03-15'),
          intendedProcessingMethod: f.processingMethod,
          irrigationMethod: pipeline.countryCode === 'VN' ? 'drip' : 'rain_fed',
          shadeCover: 30,
          latitude: f.latitude,
          longitude: f.longitude,
          seedSource: 'Certified nursery',
          isSeedTreated: true,
          seedType: 'certified',
          treeDensity: pipeline.countryCode === 'BR' ? 1500 : 1800,
          isPrimaryCrop: true,
          isActive: true,
        },
      })

      // ─── Nursery ─────────────────────────────────────
      await db.nursery.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          nurseryName: `${f.variety} Nursery — ${f.code}`,
          nurseryCode: `NUR-${f.code}`,
          location: `${f.district}, ${f.province}`,
          province: f.province,
          district: f.district,
          latitude: f.latitude + 0.001,
          longitude: f.longitude + 0.001,
          nurseryType: 'seedling',
          capacity: 5000,
          currentStock: 1200,
          species: 'coffee',
          variety: f.variety,
          seedSource: 'Certified mother plants',
          plantingDate: new Date('2024-01-10'),
          expectedReadyDate: new Date('2024-07-10'),
          germinationRate: 92.5,
          survivalRate: 88.0,
          healthStatus: 'healthy',
          notes: 'Regular watering schedule; shade cloth at 50%',
          isActive: true,
        },
      })

      // ─── LandPreparation ─────────────────────────────
      await db.landPreparation.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          preparationDate: new Date('2024-02-01'),
          preparationType: 'pre_planting',
          method: 'mechanical_tillage',
          equipmentUsed: 'Tractor, disc plow',
          laborCount: 4,
          laborCost: 150,
          materialsUsed: 'Compost 2t/ha, lime 200kg/ha',
          materialCost: 300,
          totalCost: 450,
          soilPhBefore: 5.2,
          soilPhAfter: 5.8,
          organicMatterPct: 3.8,
          notes: 'Good soil structure, adequate organic matter',
          isActive: true,
        },
      })

      // ─── CropMonitoring ──────────────────────────────
      await db.cropMonitoring.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          cultivationId: cultivation.id,
          monitoringDate: new Date('2024-06-15'),
          monitoringType: 'routine',
          growthStage: 'fruit_development',
          plantHeight: 1.8,
          canopyDiameter: 1.2,
          leafColor: 'dark_green',
          healthScore: 85,
          pestPressure: 'low',
          diseaseSymptoms: 'none',
          weatherCondition: 'partly_cloudy',
          temperature: 24.5,
          rainfall: 120,
          humidity: 72,
          soilMoisture: 65,
          alertTriggered: false,
          notes: 'Healthy growth, good cherry formation',
          isActive: true,
        },
      })

      // ─── FertilizerApplication ───────────────────────
      await db.fertilizerApplication.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          cultivationId: cultivation.id,
          applicationDate: new Date('2024-04-10'),
          fertilizerType: f.isCertified ? 'organic' : 'npk',
          fertilizerName: f.isCertified ? 'Vermicompost' : 'NPK 16-16-16',
          nutrientContent: f.isCertified ? 'N 2%, P 1.5%, K 1.5%' : 'N 16%, P 16%, K 16%',
          applicationRate: f.isCertified ? 2.0 : 0.3,
          unit: 'kg/tree',
          totalQuantity: f.isCertified ? 3600 : 540,
          applicationMethod: 'basal',
          costPerUnit: f.isCertified ? 0.5 : 1.2,
          totalCost: f.isCertified ? 1800 : 648,
          weatherAtApplication: 'cloudy',
          appliedBy: f.fullName,
          isOrganic: f.isCertified,
          notes: 'Applied before main rainy season',
          isActive: true,
        },
      })

      // ─── PestDiseaseManagement ───────────────────────
      await db.pestDiseaseManagement.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          cultivationId: cultivation.id,
          detectionDate: new Date('2024-05-20'),
          pestOrDisease: pipeline.countryCode === 'VN' ? 'Coffee Berry Borer' : 'Coffee Leaf Rust',
          type: pipeline.countryCode === 'VN' ? 'pest' : 'disease',
          severity: 'low',
          affectedArea: 0.3,
          affectedTrees: 45,
          symptoms: pipeline.countryCode === 'VN' ? 'Small holes in berries' : 'Yellow-orange spots on leaves',
          treatmentMethod: 'biological_control',
          treatmentProduct: pipeline.countryCode === 'VN' ? 'Beauveria bassiana' : 'Copper hydroxide',
          dosage: '3g/L',
          applicationDate: new Date('2024-05-25'),
          followUpDate: new Date('2024-06-25'),
          outcome: 'controlled',
          cost: 120,
          preventionMeasures: 'Regular monitoring, shade management, proper spacing',
          notes: 'Early detection, good response to treatment',
          isActive: true,
        },
      })

      // ─── HarvestTraceability ─────────────────────────
      const harvest = await db.harvestTraceability.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          cultivationId: cultivation.id,
          plannedHarvestDate: new Date('2024-10-01'),
          plotBlockId: `${f.code}-PLT-01`,
          coffeeVariety: f.variety,
          estimatedYield: pipeline.countryCode === 'BR' ? '4500' : '900',
          actualHarvestDate: new Date('2024-10-15'),
          harvestMethod: 'selective_picking',
          cherryRipeness: 92,
          harvestLabourCost: 350,
          sampleWeight: 5,
          sampleArea: 0.01,
          sampleYield: 4.8,
          estimatedYieldPerHa: pipeline.countryCode === 'BR' ? 375 : 450,
          processingMethod: f.processingMethod,
          dryingMethod: f.processingMethod.includes('Natural') || f.processingMethod.includes('Dry') ? 'sun_drying' : 'mechanical',
          dryingDurationDays: f.processingMethod.includes('Natural') ? 14 : 7,
          targetMoisture: 12,
          moistureContent: 11.5,
          defectiveBeans: 3.2,
          foreignMatter: 0.5,
          cupScore: pipeline.countryCode === 'ET' ? 87.5 : pipeline.countryCode === 'KE' ? 85.0 : 82.0,
          batchId: f.batchId,
          coffeeVarietyAtBatch: f.variety,
          processingStage: 'drying',
          batchTimestamp: new Date('2024-10-16T08:00:00Z'),
          location: `${f.district}, ${f.province}`,
          actor: f.fullName,
          batchNotes: `${f.variety} coffee, ${f.processingMethod}, harvest 2024`,
          isActive: true,
        },
      })

      // ─── ProcurementRecord (aggregator/exporter tenants) ──
      const tenantDef = TENANT_DEFS.find(td => td.slug === pipeline.tenantSlug)!
      if (tenantDef.entityType === 'aggregator' || tenantDef.entityType === 'exporter') {
        await db.procurementRecord.create({
          data: {
            tenantId,
            farmerId: farmer.id,
            farmLandId: farmLand.id,
            cultivationId: cultivation.id,
            procurementId: `PROC-${f.batchId}`,
            procurementDate: new Date('2024-10-20'),
            batchId: f.batchId,
            coffeeType: 'coffee',
            coffeeVariety: f.variety,
            grossWeight: pipeline.countryCode === 'BR' ? 4500 : 900,
            tareWeight: 50,
            netWeight: pipeline.countryCode === 'BR' ? 4450 : 850,
            moistureContentAtGate: 11.5,
            adjustedNetWeight: pipeline.countryCode === 'BR' ? 4350 : 830,
            cherryRipenessGrade: 'A',
            defects: 3.2,
            purchasePricePerKg: tenantDef.currency === 'BRL' ? 35.0 : tenantDef.currency === 'UGX' ? 8500 : 4.5,
            totalPurchaseAmount: pipeline.countryCode === 'BR' ? 152250 : pipeline.countryCode === 'UG' ? 7225000 : 3735,
            paymentMethod: 'bank_transfer',
            paymentStatus: 'paid',
            paymentDate: new Date('2024-10-25'),
            destination: `${tenantDef.name} Processing Facility`,
            isActive: true,
          },
        })
      }

      // ─── ProcessingJobOrder + ProcessingStageRecords (aggregator tenants) ──
      if (tenantDef.entityType === 'aggregator') {
        const jobOrder = await db.processingJobOrder.create({
          data: {
            tenantId,
            jobOrderId: `PJO-${f.batchId}`,
            processingDate: new Date('2024-10-22'),
            batchIdInput: f.batchId,
            coffeeTypeInput: 'coffee',
            coffeeVarietyInput: f.variety,
            inputQuantityKg: pipeline.countryCode === 'BR' ? 4350 : 830,
            processingMethod: f.processingMethod,
            targetOutputProduct: 'green_beans',
            operatorName: 'Processing Team Lead',
            plantFacilityName: `${tenantDef.name} Main Facility`,
            inputWeightKg: pipeline.countryCode === 'BR' ? 4350 : 830,
            finalOutputWeightKg: pipeline.countryCode === 'BR' ? 3650 : 695,
            overallOutturn: pipeline.countryCode === 'BR' ? 83.9 : 83.7,
            totalProcessingCost: pipeline.countryCode === 'BR' ? 8700 : 1660,
            costPerKg: 2.0,
            finalMoistureContent: 11.8,
            cupScore: pipeline.countryCode === 'ET' ? 87.5 : pipeline.countryCode === 'KE' ? 85.0 : 82.0,
            cuppingNotes: 'Clean cup, bright acidity, floral notes',
            qcApprovedBy: 'QC Manager',
            qcApprovalDate: new Date('2024-10-25'),
            isActive: true,
          },
        })

        // ProcessingStageRecords
        const stages = [
          {
            stageType: 'pulping',
            stageDate: new Date('2024-10-22'),
            inputWeight: pipeline.countryCode === 'BR' ? 4350 : 830,
            outputWeight: pipeline.countryCode === 'BR' ? 3900 : 745,
            durationMinutes: 240,
            temperature: 22,
            humidity: 65,
            machineUsed: 'Demucilager AG-600',
            operatorName: 'Processing Team Lead',
            qualityCheckPassed: true,
            notes: 'Clean pulping, minimal damage to beans',
          },
          {
            stageType: 'fermentation',
            stageDate: new Date('2024-10-23'),
            inputWeight: pipeline.countryCode === 'BR' ? 3900 : 745,
            outputWeight: pipeline.countryCode === 'BR' ? 3850 : 735,
            durationMinutes: 1080,
            temperature: 25,
            humidity: 70,
            machineUsed: 'Fermentation tank',
            operatorName: 'Fermentation Specialist',
            qualityCheckPassed: true,
            notes: '12-hour dry fermentation, complete mucilage removal',
          },
          {
            stageType: 'drying',
            stageDate: new Date('2024-10-24'),
            inputWeight: pipeline.countryCode === 'BR' ? 3850 : 735,
            outputWeight: pipeline.countryCode === 'BR' ? 3650 : 695,
            durationMinutes: 7200,
            temperature: 30,
            humidity: 55,
            machineUsed: f.processingMethod.includes('Natural') ? 'Raised beds' : 'Mechanical dryer',
            operatorName: 'Drying Specialist',
            qualityCheckPassed: true,
            notes: `Target moisture 12% achieved, final: 11.8%. Method: ${f.processingMethod.includes('Natural') ? 'sun drying on raised beds' : 'mechanical drying'}`,
          },
        ]

        for (const stage of stages) {
          await db.processingStageRecord.create({
            data: {
              tenantId,
              jobOrderId: jobOrder.id,
              stageType: stage.stageType,
              stageDate: stage.stageDate,
              inputWeight: stage.inputWeight,
              outputWeight: stage.outputWeight,
              durationMinutes: stage.durationMinutes,
              temperature: stage.temperature,
              humidity: stage.humidity,
              machineUsed: stage.machineUsed,
              operatorName: stage.operatorName,
              qualityCheckPassed: stage.qualityCheckPassed,
              notes: stage.notes,
              isActive: true,
            },
          })
        }
      }

      // ─── CertAssessment ──────────────────────────────
      await db.certAssessment.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          assessmentId: `CERT-${f.code}-2024`,
          assessmentDate: new Date('2024-08-15'),
          certificationStandard: f.isCertified ? (f.certificationType || '4C') : '4C',
          certifyingBody: 'Rainforest Alliance',
          assessmentType: 'annual_audit',
          scope: 'Coffee production and processing',
          status: f.isCertified ? 'certified' : 'pending',
          score: f.isCertified ? 88 : null,
          maxScore: 100,
          findings: f.isCertified ? 'Compliant with all standards' : 'Assessment pending',
          nonConformities: f.isCertified ? 'None' : 'Pending review',
          correctiveActions: f.isCertified ? 'N/A' : 'To be determined',
          validFrom: f.isCertified ? new Date('2024-01-01') : null,
          validUntil: f.isCertified ? new Date('2025-12-31') : null,
          certificateNumber: f.isCertified ? `RA-${f.code}-2024` : null,
          notes: 'Annual certification assessment',
          isActive: true,
        },
      })

      // ─── CoffeeInspection ────────────────────────────
      await db.coffeeInspection.create({
        data: {
          tenantId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          batchId: f.batchId,
          inspectionId: `INS-${f.batchId}`,
          inspectionDate: new Date('2024-10-28'),
          inspectorName: 'Dr. Quality Inspector',
          inspectorCertNo: 'QCI-2024-001',
          inspectionType: 'pre_export',
          inspectionStandard: 'SCA Grading',
          sampleSize: 350,
          moistureContent: 11.5,
          defectCount: 8,
          foreignMatter: 0.2,
          screenSize: pipeline.countryCode === 'BR' ? '17/18' : '15/16',
          color: 'bluish_green',
          aroma: 'clean',
          taste: 'sweet, balanced',
          body: 'medium',
          acidity: pipeline.countryCode === 'ET' ? 'bright, complex' : 'moderate',
          aftertaste: 'pleasant',
          cupScore: pipeline.countryCode === 'ET' ? 87.5 : pipeline.countryCode === 'KE' ? 85.0 : 82.0,
          overallGrade: pipeline.countryCode === 'ET' ? 'Specialty' : pipeline.countryCode === 'KE' ? 'Premium' : 'Grade 1',
          passFail: 'pass',
          remarks: 'High quality beans, well-processed',
          isActive: true,
        },
      })

      // ─── HashChainBlocks (3-4 per batch) ─────────────
      const hashChainStages = [
        {
          stage: 'harvest',
          data: JSON.stringify({
            batchId: f.batchId,
            farmerCode: f.code,
            variety: f.variety,
            harvestDate: '2024-10-15',
            netWeight: pipeline.countryCode === 'BR' ? 4450 : 850,
            method: f.processingMethod,
          }),
          timestamp: new Date('2024-10-15T10:00:00Z'),
        },
        {
          stage: 'processing',
          data: JSON.stringify({
            batchId: f.batchId,
            processDate: '2024-10-22',
            method: f.processingMethod,
            inputKg: pipeline.countryCode === 'BR' ? 4350 : 830,
            outputKg: pipeline.countryCode === 'BR' ? 3650 : 695,
            moistureContent: 11.8,
          }),
          timestamp: new Date('2024-10-22T14:00:00Z'),
        },
        {
          stage: 'inspection',
          data: JSON.stringify({
            batchId: f.batchId,
            inspectionDate: '2024-10-28',
            cupScore: pipeline.countryCode === 'ET' ? 87.5 : pipeline.countryCode === 'KE' ? 85.0 : 82.0,
            grade: pipeline.countryCode === 'ET' ? 'Specialty' : 'Grade 1',
            passFail: 'pass',
          }),
          timestamp: new Date('2024-10-28T16:00:00Z'),
        },
        {
          stage: 'eudr_compliance',
          data: JSON.stringify({
            batchId: f.batchId,
            complianceId: `EUDR-${f.batchId}`,
            status: 'compliant',
            riskLevel: 'low',
            deforestationFree: true,
          }),
          timestamp: new Date('2024-11-01T09:00:00Z'),
        },
      ]

      let previousHash = GENESIS_HASH
      for (let i = 0; i < hashChainStages.length; i++) {
        const block = hashChainStages[i]
        const dataHash = computeDataHash(block.data)
        const ts = block.timestamp.toISOString()
        const blockHash = computeBlockHash(dataHash, previousHash, ts)

        await db.hashChainBlock.upsert({
          where: { tenantId_batchId_blockIndex: { tenantId, batchId: f.batchId, blockIndex: i } },
          update: {
            stage: block.stage,
            data: block.data,
            dataHash,
            previousHash,
            blockHash,
            timestamp: block.timestamp,
          },
          create: {
            tenantId,
            batchId: f.batchId,
            blockIndex: i,
            stage: block.stage,
            data: block.data,
            dataHash,
            previousHash,
            blockHash,
            timestamp: block.timestamp,
            recordedBy: 'system',
            isActive: true,
          },
        })

        previousHash = blockHash
      }

      // ─── QRVerification ──────────────────────────────
      const qrCode = `TB-${f.batchId}-${pipeline.countryCode}`
      await db.qRVerification.upsert({
        where: { qrCode },
        update: { entityType: 'harvest_traceability', entityId: harvest.id },
        create: {
          tenantId,
          entityType: 'harvest_traceability',
          entityId: harvest.id,
          qrCode,
          hmacSignature: crypto.createHmac('sha256', 'terrabrew-seed-key').update(qrCode).digest('hex'),
          isActive: true,
        },
      })

      // ─── EudrCompliance ──────────────────────────────
      const eudrComplianceId = `EUDR-${f.batchId}`
      await db.eudrCompliance.upsert({
        where: { tenantId_complianceId: { tenantId, complianceId: eudrComplianceId } },
        update: {
          batchId: f.batchId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          status: 'compliant',
          riskLevel: 'low',
          deforestationRiskScore: 5.2,
          satelliteImageryRef: `SAT-${pipeline.countryCode}-2024-${f.code}`,
          geolocationLat: f.latitude,
          geolocationLng: f.longitude,
          landUseType: 'agriculture_coffee',
          verificationDate: new Date('2024-11-01'),
          verifiedBy: 'TerraBrew EUDR System',
          dueDiligenceStatement: `https://terrabrew.com/eudr/dds/${f.batchId}`,
          tracesCertificateRef: `TRACES-${f.batchId}`,
          validFrom: new Date('2024-11-01'),
          validUntil: new Date('2025-10-31'),
          notes: 'No deforestation detected in reference period (Dec 2020 onward). Low risk assessment based on satellite analysis.',
          metadata: JSON.stringify({
            referencePeriod: { start: '2020-12-31', end: '2024-11-01' },
            forestBaseline: 85.3,
            currentForestCover: 84.8,
            methodology: 'EU Regulation 2023/1115',
          }),
          isActive: true,
        },
        create: {
          tenantId,
          complianceId: eudrComplianceId,
          batchId: f.batchId,
          farmerId: farmer.id,
          farmLandId: farmLand.id,
          status: 'compliant',
          riskLevel: 'low',
          deforestationRiskScore: 5.2,
          satelliteImageryRef: `SAT-${pipeline.countryCode}-2024-${f.code}`,
          geolocationLat: f.latitude,
          geolocationLng: f.longitude,
          landUseType: 'agriculture_coffee',
          verificationDate: new Date('2024-11-01'),
          verifiedBy: 'TerraBrew EUDR System',
          dueDiligenceStatement: `https://terrabrew.com/eudr/dds/${f.batchId}`,
          tracesCertificateRef: `TRACES-${f.batchId}`,
          validFrom: new Date('2024-11-01'),
          validUntil: new Date('2025-10-31'),
          notes: 'No deforestation detected in reference period (Dec 2020 onward). Low risk assessment based on satellite analysis.',
          metadata: JSON.stringify({
            referencePeriod: { start: '2020-12-31', end: '2024-11-01' },
            forestBaseline: 85.3,
            currentForestCover: 84.8,
            methodology: 'EU Regulation 2023/1115',
          }),
          isActive: true,
        },
      })
    }
  }

  // ═══════════════════════════════════════════════════════
  // 7. B2B DATA (metrang-coffee tenant)
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 7. Creating B2B Data for metrang-coffee...')

  const metrangId = tenantMap['metrang-coffee']

  // ─── Buyers ──────────────────────────────────────────
  const buyerDefs = [
    {
      buyerCode: 'BYR-DE-001',
      companyName: 'Kaffee Rösterei Berlin GmbH',
      contactPerson: 'Hans Müller',
      email: 'hans@kaffee-berlin.de',
      phone: '+49-30-1234-5678',
      address: 'Friedrichstraße 123, 10117 Berlin',
      city: 'Berlin',
      country: 'DE',
      taxId: 'DE123456789',
      euRegistration: true,
      eoriNumber: 'DE123456789012',
      tracesRegistration: 'TRACES-DE-001',
      buyerType: 'roaster',
      preferredCurrency: 'EUR',
      paymentTerms: 'Net 30',
      qualityRequirements: 'Specialty grade, cup score 80+, moisture 11-12.5%',
    },
    {
      buyerCode: 'BYR-NL-001',
      companyName: 'Dutch Coffee Traders B.V.',
      contactPerson: 'Pieter van der Berg',
      email: 'pieter@dutchcoffee.nl',
      phone: '+31-20-987-6543',
      address: 'Keizersgracht 456, 1016 DP Amsterdam',
      city: 'Amsterdam',
      country: 'NL',
      taxId: 'NL987654321',
      euRegistration: true,
      eoriNumber: 'NL987654321098',
      tracesRegistration: 'TRACES-NL-001',
      buyerType: 'trader',
      preferredCurrency: 'EUR',
      paymentTerms: 'Net 45',
      qualityRequirements: 'Green beans, Grade 1, screen size 16+',
    },
    {
      buyerCode: 'BYR-JP-001',
      companyName: 'Tokyo Roast Co., Ltd.',
      contactPerson: 'Taro Yamada',
      email: 'taro@tokyoroast.co.jp',
      phone: '+81-3-5678-1234',
      address: '渋谷区神宮前3-12-8, 東京都 150-0001',
      city: 'Tokyo',
      country: 'JP',
      taxId: 'JP1234567890',
      euRegistration: false,
      buyerType: 'roaster',
      preferredCurrency: 'USD',
      paymentTerms: 'L/C at sight',
      qualityRequirements: 'Premium Arabica, cup score 85+, strict defect tolerance',
    },
  ]

  const buyerIds: string[] = []
  for (const b of buyerDefs) {
    const buyer = await db.buyer.upsert({
      where: { tenantId_buyerCode: { tenantId: metrangId, buyerCode: b.buyerCode } },
      update: {
        companyName: b.companyName,
        contactPerson: b.contactPerson,
        email: b.email,
        phone: b.phone,
        address: b.address,
        city: b.city,
        country: b.country,
        taxId: b.taxId,
        euRegistration: b.euRegistration,
        eoriNumber: b.eoriNumber,
        tracesRegistration: b.tracesRegistration,
        buyerType: b.buyerType,
        preferredCurrency: b.preferredCurrency,
        paymentTerms: b.paymentTerms,
        qualityRequirements: b.qualityRequirements,
        isActive: true,
      },
      create: {
        tenantId: metrangId,
        buyerCode: b.buyerCode,
        companyName: b.companyName,
        contactPerson: b.contactPerson,
        email: b.email,
        phone: b.phone,
        address: b.address,
        city: b.city,
        country: b.country,
        taxId: b.taxId,
        euRegistration: b.euRegistration,
        eoriNumber: b.eoriNumber,
        tracesRegistration: b.tracesRegistration,
        buyerType: b.buyerType,
        preferredCurrency: b.preferredCurrency,
        paymentTerms: b.paymentTerms,
        qualityRequirements: b.qualityRequirements,
        isActive: true,
      },
    })
    buyerIds.push(buyer.id)
  }
  console.log(`  ✅ ${buyerDefs.length} buyers created`)

  // ─── Shipments ───────────────────────────────────────
  const shipmentDefs = [
    {
      shipmentId: 'SHP-2024-VN-DE-001',
      status: 'delivered',
      buyerId: buyerIds[0],
      originCountry: 'VN',
      destinationCountry: 'DE',
      portOfLoading: 'Cat Lai, Ho Chi Minh City',
      portOfDischarge: 'Hamburg',
      vesselName: 'MSC Aurora',
      vesselImo: 'IMO9294521',
      containerNumber: 'MSCU7894561',
      bookingNumber: 'BK-2024-001',
      billOfLadingNumber: 'BL-2024-VN-DE-001',
      estimatedDeparture: new Date('2024-11-01'),
      actualDeparture: new Date('2024-11-02'),
      estimatedArrival: new Date('2024-11-28'),
      actualArrival: new Date('2024-11-29'),
      totalWeightKg: 18500,
      totalBags: 370,
      grade: 'Grade 1 Robusta',
      contractReference: 'TC-2024-DE-001',
      freightForwarder: 'Maersk Logistics',
      shippingLine: 'MSC',
    },
    {
      shipmentId: 'SHP-2024-VN-NL-001',
      status: 'in_transit',
      buyerId: buyerIds[1],
      originCountry: 'VN',
      destinationCountry: 'NL',
      portOfLoading: 'Cat Lai, Ho Chi Minh City',
      portOfDischarge: 'Rotterdam',
      vesselName: 'CMA CGM Marco Polo',
      vesselImo: 'IMO9454456',
      containerNumber: 'CMAU4561237',
      bookingNumber: 'BK-2024-002',
      billOfLadingNumber: 'BL-2024-VN-NL-001',
      estimatedDeparture: new Date('2024-12-01'),
      actualDeparture: new Date('2024-12-02'),
      estimatedArrival: new Date('2024-12-30'),
      totalWeightKg: 12000,
      totalBags: 240,
      grade: 'Premium Arabica Catimor',
      contractReference: 'TC-2024-NL-001',
      freightForwarder: 'CMA CGM Logistics',
      shippingLine: 'CMA CGM',
    },
    {
      shipmentId: 'SHP-2024-VN-JP-001',
      status: 'booked',
      buyerId: buyerIds[2],
      originCountry: 'VN',
      destinationCountry: 'JP',
      portOfLoading: 'Cat Lai, Ho Chi Minh City',
      portOfDischarge: 'Yokohama',
      vesselName: 'ONE Columbia',
      vesselImo: 'IMO9786543',
      containerNumber: 'ONEU1234567',
      bookingNumber: 'BK-2024-003',
      estimatedDeparture: new Date('2025-01-15'),
      estimatedArrival: new Date('2025-02-05'),
      totalWeightKg: 8000,
      totalBags: 160,
      grade: 'Specialty Arabica',
      contractReference: 'TC-2024-JP-001',
      freightForwarder: 'ONE Logistics',
      shippingLine: 'ONE',
    },
  ]

  const shipmentIds: string[] = []
  for (const s of shipmentDefs) {
    const shipment = await db.shipment.upsert({
      where: { tenantId_shipmentId: { tenantId: metrangId, shipmentId: s.shipmentId } },
      update: {
        status: s.status,
        buyerId: s.buyerId,
        originCountry: s.originCountry,
        destinationCountry: s.destinationCountry,
        portOfLoading: s.portOfLoading,
        portOfDischarge: s.portOfDischarge,
        vesselName: s.vesselName,
        vesselImo: s.vesselImo,
        containerNumber: s.containerNumber,
        bookingNumber: s.bookingNumber,
        billOfLadingNumber: s.billOfLadingNumber,
        estimatedDeparture: s.estimatedDeparture,
        actualDeparture: s.actualDeparture,
        estimatedArrival: s.estimatedArrival,
        actualArrival: s.actualArrival,
        totalWeightKg: s.totalWeightKg,
        totalBags: s.totalBags,
        grade: s.grade,
        contractReference: s.contractReference,
        freightForwarder: s.freightForwarder,
        shippingLine: s.shippingLine,
        isActive: true,
      },
      create: {
        tenantId: metrangId,
        shipmentId: s.shipmentId,
        status: s.status,
        buyerId: s.buyerId,
        originCountry: s.originCountry,
        destinationCountry: s.destinationCountry,
        portOfLoading: s.portOfLoading,
        portOfDischarge: s.portOfDischarge,
        vesselName: s.vesselName,
        vesselImo: s.vesselImo,
        containerNumber: s.containerNumber,
        bookingNumber: s.bookingNumber,
        billOfLadingNumber: s.billOfLadingNumber,
        estimatedDeparture: s.estimatedDeparture,
        actualDeparture: s.actualDeparture,
        estimatedArrival: s.estimatedArrival,
        actualArrival: s.actualArrival,
        totalWeightKg: s.totalWeightKg,
        totalBags: s.totalBags,
        grade: s.grade,
        contractReference: s.contractReference,
        freightForwarder: s.freightForwarder,
        shippingLine: s.shippingLine,
        isActive: true,
      },
    })
    shipmentIds.push(shipment.id)
  }
  console.log(`  ✅ ${shipmentDefs.length} shipments created`)

  // ─── ExportDocuments ─────────────────────────────────
  const exportDocDefs = [
    {
      documentType: 'phytosanitary',
      documentNumber: 'PHYTO-VN-2024-001',
      issuingAuthority: 'Plant Quarantine Division, MARD Vietnam',
      issueDate: new Date('2024-10-28'),
      expiryDate: new Date('2025-10-27'),
      status: 'approved',
      shipmentId: shipmentIds[0],
    },
    {
      documentType: 'certificate_of_origin',
      documentNumber: 'COO-VN-2024-001',
      issuingAuthority: 'Vietnam Chamber of Commerce and Industry',
      issueDate: new Date('2024-10-25'),
      expiryDate: new Date('2025-10-24'),
      status: 'approved',
      shipmentId: shipmentIds[0],
    },
    {
      documentType: 'bill_of_lading',
      documentNumber: 'BL-2024-VN-DE-001',
      issuingAuthority: 'MSC Mediterranean Shipping Company',
      issueDate: new Date('2024-11-02'),
      status: 'approved',
      shipmentId: shipmentIds[0],
    },
  ]

  for (const doc of exportDocDefs) {
    await db.exportDocument.create({
      data: {
        tenantId: metrangId,
        shipmentId: doc.shipmentId,
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        status: doc.status,
        verifiedBy: 'Export Documentation Team',
        verifiedDate: doc.issueDate,
        notes: `Official ${doc.documentType} for shipment to Germany`,
        isActive: true,
      },
    })
  }
  console.log(`  ✅ ${exportDocDefs.length} export documents created`)

  // ─── Marketplace Listings ────────────────────────────
  console.log('\n📋 7b. Creating Marketplace Listings...')

  for (const pipeline of COUNTRY_PIPELINES) {
    const tenantId = tenantMap[pipeline.tenantSlug]
    const tenantDef = TENANT_DEFS.find(td => td.slug === pipeline.tenantSlug)!
    const isAggOrExp = tenantDef.entityType === 'aggregator' || tenantDef.entityType === 'exporter' || tenantDef.entityType === 'producer'

    if (!isAggOrExp) continue

    for (const f of pipeline.farmers) {
      await db.marketplaceListing.create({
        data: {
          tenantId,
          listingId: `ML-${f.batchId}`,
          title: `${f.variety} Green Coffee — ${pipeline.countryCode} Origin`,
          description: `Premium ${f.variety} coffee from ${f.district}, ${f.province}. ${f.processingMethod} process. Cup score: ${pipeline.countryCode === 'ET' ? 87.5 : pipeline.countryCode === 'KE' ? 85.0 : 82.0}. Certified: ${f.isCertified ? f.certificationType : 'N/A'}.`,
          coffeeType: 'coffee',
          coffeeVariety: f.variety,
          grade: pipeline.countryCode === 'ET' ? 'Specialty' : 'Grade 1',
          quantityKg: pipeline.countryCode === 'BR' ? 3650 : 695,
          pricePerKg: tenantDef.currency === 'BRL' ? 55 : tenantDef.currency === 'VND' ? 55000 : tenantDef.currency === 'ETB' ? 350 : tenantDef.currency === 'KES' ? 650 : tenantDef.currency === 'GHS' ? 28 : 12000,
          totalValue: pipeline.countryCode === 'BR' ? 200750 : pipeline.countryCode === 'UG' ? 8340000 : pipeline.countryCode === 'VN' ? 38225000 : pipeline.countryCode === 'ET' ? 243250 : pipeline.countryCode === 'KE' ? 451750 : 19460,
          currency: tenantDef.currency,
          origin: pipeline.countryCode,
          processingMethod: f.processingMethod,
          cupScore: pipeline.countryCode === 'ET' ? 87.5 : pipeline.countryCode === 'KE' ? 85.0 : 82.0,
          certifications: f.certificationType || 'None',
          harvestYear: '2024',
          availability: 'available',
          listingStatus: 'active',
          listingDate: new Date('2024-11-01'),
          expiryDate: new Date('2025-03-31'),
          isActive: true,
        },
      })
    }

    console.log(`  ✅ ${pipeline.tenantSlug}: ${pipeline.farmers.length} marketplace listings`)
  }

  // ═══════════════════════════════════════════════════════
  // 8. ENTITY RELATIONSHIPS
  // ═══════════════════════════════════════════════════════
  console.log('\n📋 8. Creating Entity Relationships...')

  const relationships = [
    { from: 'nkusi-coffee', to: 'asunafo-export', type: 'export', metadata: JSON.stringify({ commodity: 'coffee', terms: 'FOB Mombasa' }) },
    { from: 'metrang-coffee', to: 'nordic-coffee-import', type: 'export', metadata: JSON.stringify({ commodity: 'coffee', terms: 'CIF Hamburg' }) },
    { from: 'asunafo-export', to: 'nordic-coffee-import', type: 'export', metadata: JSON.stringify({ commodity: 'coffee', terms: 'CIF Rotterdam' }) },
    { from: 'rainforest-cert', to: 'nkusi-coffee', type: 'certify', metadata: JSON.stringify({ standard: 'Rainforest Alliance 2020', scope: 'coffee_production' }) },
    { from: 'cup-science-lab', to: 'metrang-coffee', type: 'inspect', metadata: JSON.stringify({ service: 'quality_testing', scope: 'cupping_analysis' }) },
  ]

  for (const rel of relationships) {
    const fromId = tenantMap[rel.from]
    const toId = tenantMap[rel.to]
    if (!fromId || !toId) continue

    await db.entityRelationship.upsert({
      where: { fromEntityId_toEntityId_relationshipType: { fromEntityId: fromId, toEntityId: toId, relationshipType: rel.type } },
      update: {
        status: 'active',
        metadata: rel.metadata,
        startDate: new Date('2024-01-01'),
      },
      create: {
        fromEntityId: fromId,
        toEntityId: toId,
        relationshipType: rel.type,
        status: 'active',
        metadata: rel.metadata,
        startDate: new Date('2024-01-01'),
        isActive: true,
      },
    })

    console.log(`  ✅ ${rel.from} → ${rel.to} (${rel.type})`)
  }

  // ═══════════════════════════════════════════════════════
  // PRINT LOGIN CREDENTIALS TABLE
  // ═══════════════════════════════════════════════════════
  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗')
  console.log('║                                                   TERRABREW LOGIN CREDENTIALS                                                      ║')
  console.log('╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣')
  console.log('║ Email                                          │ Password    │ Role                │ Tenant              │ Entity Type         ║')
  console.log('╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣')

  for (const c of credentials) {
    const email = c.email.padEnd(45)
    const password = c.password.padEnd(11)
    const role = c.role.padEnd(19)
    const tenant = c.tenantSlug.padEnd(20)
    const entityType = c.entityType.padEnd(19)
    console.log(`║ ${email} │ ${password} │ ${role} │ ${tenant} │ ${entityType} ║`)
  }

  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝')
  console.log(`\n✅ Total credentials: ${credentials.length}`)
  console.log(`✅ Total tenants: ${TENANT_DEFS.length}`)
  console.log(`✅ Total modules: ${MODULE_DEFS.length}`)
  console.log(`✅ Total country pipelines: ${COUNTRY_PIPELINES.length}`)
  console.log(`✅ Total farmers: ${COUNTRY_PIPELINES.reduce((sum, p) => sum + p.farmers.length, 0)}`)
  console.log('\n🌱 Seed v3 completed successfully!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

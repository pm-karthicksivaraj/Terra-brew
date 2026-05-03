import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'

export const maxDuration = 60

function makePolygonGeoJson(lat: number, lng: number): string {
  const d = 0.0009
  return JSON.stringify({ type: 'Polygon', coordinates: [[[lng-d,lat-d],[lng+d,lat-d],[lng+d,lat+d],[lng-d,lat+d],[lng-d,lat-d]]] })
}

export async function POST() {
  try {
    const PWD = await hashPassword('Admin@2024')

    // ═══ 1. Clear existing data (reverse dependency order) ═══
    const delModels = [
      'crossBorderTransaction', 'logisticBooking', 'productMonitoring', 'inspectionRequest',
      'escrowTransaction', 'rfqResponse', 'rfq', 'trackingUpdate', 'tradingContract',
      'buyer', 'shipment', 'exportDocument', 'eudrCompliance', 'deforestationAssessment',
      'apiKey', 'webhookEndpoint', 'complianceBooking', 'iotSensor', 'qcVerification',
      'analyticsReport', 'auditLog', 'qrVerification', 'hashChainBlock',
      'soilAnalysis', 'saleTransaction', 'marketplaceListing', 'smartContract',
      'coffeeInspection', 'certAssessment', 'processingStageRecord', 'processingJobOrder',
      'procurementRecord', 'collectionCentre', 'harvestTraceability',
      'pestDiseaseManagement', 'fertilizerApplication', 'cropMonitoring',
      'landPreparation', 'nursery', 'cultivation', 'farmLand', 'farmer',
      'tenantModule', 'entityRelationship', 'subscription',
      'user', 'tenant',
    ]
    for (const model of delModels) {
      try { await (db as any)[model].deleteMany() } catch {}
    }
    // Platform users & modules stay
    console.log('[Seed v2] Cleared existing data')

    // ═══ 2. Platform Admin ═══
    const pEmail = 'admin@terrabrew.platform'
    const existingP = await db.platformUser.findUnique({ where: { email: pEmail } })
    if (!existingP) {
      await db.platformUser.create({ data: { email: pEmail, passwordHash: PWD, name: 'Platform Admin', role: 'super_admin' } })
    }

    // ═══ 3. Modules ═══
    const moduleDefs = [
      { slug: 'dashboard', name: 'Dashboard', category: 'core', icon: 'LayoutDashboard', color: '#059669' },
      { slug: 'analytics', name: 'Analytics & Reports', category: 'core', icon: 'BarChart3', color: '#2563eb' },
      { slug: 'farmers', name: 'Farmer Management', category: 'core', icon: 'Users', color: '#059669' },
      { slug: 'farmlands', name: 'Farm Land Management', category: 'core', icon: 'MapPin', color: '#d97706' },
      { slug: 'cultivations', name: 'Cultivation Management', category: 'core', icon: 'Sprout', color: '#2563eb' },
      { slug: 'nurseries', name: 'Nursery Management', category: 'core', icon: 'TreePine', color: '#7c3aed' },
      { slug: 'land-preparations', name: 'Land Preparation', category: 'core', icon: 'Tractor', color: '#0891b2' },
      { slug: 'crop-monitorings', name: 'Crop Monitoring', category: 'core', icon: 'Activity', color: '#db2777' },
      { slug: 'fertilizer-apps', name: 'Fertilizer Management', category: 'core', icon: 'FlaskConical', color: '#65a30d' },
      { slug: 'pest-disease-mgmts', name: 'Pest & Disease', category: 'core', icon: 'Shield', color: '#dc2626' },
      { slug: 'harvest-traceabilities', name: 'Harvest Traceability', category: 'core', icon: 'Wheat', color: '#b45309' },
      { slug: 'procurement', name: 'Procurement', category: 'premium', icon: 'Truck', color: '#4f46e5' },
      { slug: 'processing', name: 'Processing Pipeline', category: 'premium', icon: 'Factory', color: '#0d9488' },
      { slug: 'cert-assessments', name: 'Certification Assessment', category: 'compliance', icon: 'Award', color: '#be185d' },
      { slug: 'coffee-inspections', name: 'Coffee Inspection', category: 'compliance', icon: 'ClipboardCheck', color: '#9333ea' },
      { slug: 'qc-verifications', name: 'QC Verifications', category: 'compliance', icon: 'CheckCircle', color: '#059669' },
      { slug: 'eudr-compliance', name: 'EUDR Compliance', category: 'compliance', icon: 'Shield', color: '#dc2626' },
      { slug: 'deforestation', name: 'Deforestation Monitoring', category: 'compliance', icon: 'TreePine', color: '#059669' },
      { slug: 'marketplace', name: 'Marketplace', category: 'premium', icon: 'Store', color: '#ea580c' },
      { slug: 'rfq', name: 'RFQ Management', category: 'trade', icon: 'FileQuestion', color: '#7c3aed' },
      { slug: 'inspections', name: 'Inspection Service', category: 'trade', icon: 'ClipboardCheck', color: '#9333ea' },
      { slug: 'product-monitoring', name: 'Product Monitoring', category: 'trade', icon: 'Activity', color: '#0d9488' },
      { slug: 'smart-contracts', name: 'Smart Contracts', category: 'trade', icon: 'FileText', color: '#0369a1' },
      { slug: 'trading-desk', name: 'Trading Desk', category: 'trade', icon: 'TrendingUp', color: '#0d9488' },
      { slug: 'shipments', name: 'Shipments', category: 'trade', icon: 'Ship', color: '#2563eb' },
      { slug: 'logistics', name: 'Logistics Booking', category: 'trade', icon: 'Container', color: '#4f46e5' },
      { slug: 'export-docs', name: 'Export Documents', category: 'trade', icon: 'FileOutput', color: '#0891b2' },
      { slug: 'buyers', name: 'Buyers', category: 'trade', icon: 'UserCheck', color: '#65a30d' },
      { slug: 'trace-journey', name: 'Trace Journey', category: 'core', icon: 'Route', color: '#7c3aed' },
      { slug: 'billing', name: 'Billing', category: 'finance', icon: 'CreditCard', color: '#be185d' },
      { slug: 'users', name: 'Users', category: 'admin', icon: 'UserCog', color: '#6366f1' },
      { slug: 'iot-sensors', name: 'IoT Sensors', category: 'system', icon: 'Radio', color: '#0891b2' },
      { slug: 'blockchain', name: 'Blockchain', category: 'system', icon: 'Link', color: '#7c3aed' },
      { slug: 'api-settings', name: 'API & Webhooks', category: 'system', icon: 'Webhook', color: '#6366f1' },
    ]
    for (const m of moduleDefs) { await db.module.upsert({ where: { slug: m.slug }, update: m, create: m }) }

    // ═══ 4. Tenants ═══
    const tenantDefs = [
      { slug: 'metrang-coffee', name: 'Metrang Coffee', legalName: 'Công ty TNHH Metrang Coffee', entityType: 'producer', country: 'VN', currency: 'VND', currencySymbol: '₫', language: 'vi', timezone: 'Asia/Ho_Chi_Minh', locale: 'vi-VN', dateFormat: 'DD/MM/YYYY', region: 'Southeast Asia', supportedLanguages: '["vi","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Organic","Fair Trade","UTZ"]', plan: 'professional', maxUsers: 25, maxFarmers: 1000, commodityTypes: '["coffee"]' },
      { slug: 'cooxupe', name: 'Cooxupé', legalName: 'Cooperativa Regional de Cafeicultores em Guaxupé', entityType: 'aggregator', country: 'BR', currency: 'BRL', currencySymbol: 'R$', language: 'pt', timezone: 'America/Sao_Paulo', locale: 'pt-BR', dateFormat: 'DD/MM/YYYY', region: 'South America', supportedLanguages: '["pt","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Rainforest Alliance","UTZ","Fair Trade"]', plan: 'professional', maxUsers: 50, maxFarmers: 5000, commodityTypes: '["coffee"]' },
      { slug: 'yirgacheffe-union', name: 'Yirgacheffe Union', legalName: 'Yirgacheffe Coffee Farmers Cooperative Union', entityType: 'producer', country: 'ET', currency: 'ETB', currencySymbol: 'Br', language: 'am', timezone: 'Africa/Addis_Ababa', locale: 'am-ET', dateFormat: 'DD/MM/YYYY', region: 'East Africa', supportedLanguages: '["am","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Organic","Fair Trade"]', plan: 'starter', maxUsers: 15, maxFarmers: 2000, commodityTypes: '["coffee"]' },
      { slug: 'othaya-cooperative', name: 'Othaya Cooperative', legalName: 'Othaya Farmers Cooperative Society Ltd', entityType: 'producer', country: 'KE', currency: 'KES', currencySymbol: 'KSh', language: 'sw', timezone: 'Africa/Nairobi', locale: 'sw-KE', dateFormat: 'DD/MM/YYYY', region: 'East Africa', supportedLanguages: '["sw","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Fair Trade","Rainforest Alliance"]', plan: 'starter', maxUsers: 10, maxFarmers: 1500, commodityTypes: '["coffee"]' },
      { slug: 'euro-coffee-imports', name: 'Euro Coffee Imports', legalName: 'Euro Coffee Imports B.V.', entityType: 'exporter', country: 'NL', currency: 'EUR', currencySymbol: '€', language: 'en', timezone: 'Europe/Amsterdam', locale: 'en-IE', dateFormat: 'DD/MM/YYYY', region: 'Europe', supportedLanguages: '["en","nl"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '[]', plan: 'professional', maxUsers: 20, maxFarmers: 0, commodityTypes: '["coffee"]' },
      { slug: 'sgs-inspection', name: 'SGS Inspection', legalName: 'SGS Société Générale de Surveillance SA', entityType: 'certification_body', country: 'CH', currency: 'CHF', currencySymbol: 'CHF', language: 'en', timezone: 'Europe/Zurich', locale: 'de-CH', dateFormat: 'DD.MM.YYYY', region: 'Europe', supportedLanguages: '["en","de","fr"]', measurementUnit: 'metric', eudrCompliant: false, certifications: '[]', plan: 'starter', maxUsers: 10, maxFarmers: 0, commodityTypes: '["coffee","cocoa","soy"]' },
    ]
    const tenants: Record<string, any> = {}
    for (const td of tenantDefs) {
      tenants[td.slug] = await db.tenant.create({ data: td as any })
    }

    // ═══ 5. TenantModules ═══
    const moduleByEntity: Record<string, string[]> = {
      producer: ['dashboard','analytics','farmers','farmlands','cultivations','nurseries','land-preparations','crop-monitorings','fertilizer-apps','pest-disease-mgmts','harvest-traceabilities','procurement','eudr-compliance','cert-assessments','deforestation','marketplace','trace-journey','billing','users'],
      aggregator: ['dashboard','analytics','harvest-traceabilities','procurement','processing','coffee-inspections','qc-verifications','eudr-compliance','cert-assessments','marketplace','rfq','inspections','product-monitoring','smart-contracts','trading-desk','shipments','logistics','buyers','trace-journey','iot-sensors','blockchain','billing','users'],
      exporter: ['dashboard','analytics','eudr-compliance','marketplace','rfq','inspections','product-monitoring','smart-contracts','trading-desk','shipments','logistics','export-docs','buyers','trace-journey','blockchain','billing','users'],
      importer: ['dashboard','analytics','eudr-compliance','marketplace','rfq','smart-contracts','trading-desk','shipments','logistics','buyers','trace-journey','blockchain','billing','users'],
      certification_body: ['dashboard','analytics','coffee-inspections','inspections','cert-assessments','eudr-compliance','deforestation','billing','users'],
      laboratory: ['dashboard','analytics','coffee-inspections','qc-verifications','billing','users'],
    }
    for (const [slug, tenant] of Object.entries(tenants)) {
      const mods = moduleByEntity[tenant.entityType] || []
      for (const modSlug of mods) {
        await db.tenantModule.create({ data: { tenantId: tenant.id, moduleSlug: modSlug, isEnabled: true } })
      }
    }

    // ═══ 6. Users ═══
    const userDefs = [
      { email: 'admin@metrang-coffee.terrabrew.com', name: 'Metrang Admin', role: 'tenant_admin', tenantSlug: 'metrang-coffee' },
      { email: 'field_officer@metrang-coffee.terrabrew.com', name: 'Cán bộ hiện trường', role: 'field_officer', tenantSlug: 'metrang-coffee' },
      { email: 'viewer@metrang-coffee.terrabrew.com', name: 'Viewer', role: 'viewer', tenantSlug: 'metrang-coffee' },
      { email: 'admin@cooxupe.terrabrew.com', name: 'Administrador Cooxupé', role: 'tenant_admin', tenantSlug: 'cooxupe' },
      { email: 'operations@cooxupe.terrabrew.com', name: 'Gerente de Operações', role: 'operations_manager', tenantSlug: 'cooxupe' },
      { email: 'trader@cooxupe.terrabrew.com', name: 'Trader Cooxupé', role: 'trader', tenantSlug: 'cooxupe' },
      { email: 'admin@yirgacheffe-union.terrabrew.com', name: 'Union Admin', role: 'tenant_admin', tenantSlug: 'yirgacheffe-union' },
      { email: 'field_officer@yirgacheffe-union.terrabrew.com', name: 'Field Officer', role: 'field_officer', tenantSlug: 'yirgacheffe-union' },
      { email: 'admin@othaya-cooperative.terrabrew.com', name: 'Othaya Admin', role: 'tenant_admin', tenantSlug: 'othaya-cooperative' },
      { email: 'field_officer@othaya-cooperative.terrabrew.com', name: 'Othaya Field Officer', role: 'field_officer', tenantSlug: 'othaya-cooperative' },
      { email: 'admin@euro-coffee-imports.terrabrew.com', name: 'Euro Coffee Admin', role: 'tenant_admin', tenantSlug: 'euro-coffee-imports' },
      { email: 'trader@euro-coffee-imports.terrabrew.com', name: 'Euro Coffee Trader', role: 'trader', tenantSlug: 'euro-coffee-imports' },
      { email: 'operations@euro-coffee-imports.terrabrew.com', name: 'Euro Coffee Ops', role: 'operations_manager', tenantSlug: 'euro-coffee-imports' },
      { email: 'admin@sgs-inspection.terrabrew.com', name: 'SGS Admin', role: 'tenant_admin', tenantSlug: 'sgs-inspection' },
      { email: 'inspector@sgs-inspection.terrabrew.com', name: 'SGS Inspector', role: 'quality_controller', tenantSlug: 'sgs-inspection' },
    ]
    const users: Record<string, any> = {}
    for (const ud of userDefs) {
      const tid = tenants[ud.tenantSlug].id
      users[ud.email] = await db.user.create({ data: { email: ud.email, passwordHash: PWD, name: ud.name, role: ud.role, tenantId: tid } })
    }

    // ═══ 7. Farmers (per tenant, country-specific) ═══
    const vnTid = tenants['metrang-coffee'].id
    const brTid = tenants['cooxupe'].id
    const etTid = tenants['yirgacheffe-union'].id
    const keTid = tenants['othaya-cooperative'].id
    const nlTid = tenants['euro-coffee-imports'].id
    const vnAdmin = users['admin@metrang-coffee.terrabrew.com']
    const brAdmin = users['admin@cooxupe.terrabrew.com']
    const etAdmin = users['admin@yirgacheffe-union.terrabrew.com']
    const keAdmin = users['admin@othaya-cooperative.terrabrew.com']
    const nlAdmin = users['admin@euro-coffee-imports.terrabrew.com']

    // Vietnam farmers
    const vnFarmers = [
      { farmerCode: 'FRM-VN-001', fullName: 'Nguyễn Văn Thanh', firstName: 'Thanh', lastName: 'Nguyễn', contactNumber: '0912345678', gender: 'Nam', country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tam', village: "Buôn K'Mang", latitude: 12.668, longitude: 108.038, nationalIdType: 'CCCD', nationalIdNo: '795284610382', isCertified: true, certificationType: 'Cá nhân', cooperative: 'Hợp tác xã Cà phê Ea Tam', yearsOfFarmingExperience: 12, creditScore: 82, bankName: 'Vietcombank', bankBranch: 'Cư Mgar', accountNumber: '0912345678901', accountHolderName: 'Nguyễn Văn Thanh', sortCodeSwift: 'BFTVVNVX', paymentPreference: 'bank_transfer' },
      { farmerCode: 'FRM-VN-002', fullName: 'Trần Thị Hoa', firstName: 'Hoa', lastName: 'Trần', contactNumber: '0923456789', gender: 'Nữ', country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Drăng', village: 'Ea Pok', latitude: 12.692, longitude: 108.055, nationalIdType: 'CCCD', nationalIdNo: '794827364518', isCertified: true, certificationType: 'Tập thể', cooperative: 'Nông trại Hữu cơ Ea Drăng', yearsOfFarmingExperience: 8, creditScore: 76, bankName: 'Agribank', bankBranch: 'Ea Drăng', accountNumber: '1209234567890', accountHolderName: 'Trần Thị Hoa', sortCodeSwift: 'VBAZVNVX', paymentPreference: 'bank_transfer' },
      { farmerCode: 'FRM-VN-003', fullName: 'Lê Văn Minh', firstName: 'Minh', lastName: 'Lê', contactNumber: '0934567890', gender: 'Nam', country: 'Việt Nam', province: 'Đắk Lắk', district: "M'Drak", commune: "M'Drak", village: 'Buôn Jol', latitude: 12.695, longitude: 108.050, nationalIdType: 'CCCD', nationalIdNo: '796135820497', isCertified: true, certificationType: 'Cá nhân', cooperative: "Hợp tác xã Cà phê M'Drak", yearsOfFarmingExperience: 18, creditScore: 90, bankName: 'BIDV', bankBranch: "M'Drak", accountNumber: '2340934567890', accountHolderName: 'Lê Văn Minh', sortCodeSwift: 'BIDVVNVX', paymentPreference: 'bank_transfer' },
    ]
    // Brazil farmers
    const brFarmers = [
      { farmerCode: 'FRM-BR-001', fullName: 'João Silva', firstName: 'João', lastName: 'Silva', contactNumber: '+5535991234567', gender: 'Masculino', country: 'Brasil', province: 'Minas Gerais', district: 'Guaxupé', commune: 'Guaxupé', village: 'Fazenda São José', latitude: -21.307, longitude: -46.718, nationalIdType: 'CPF', nationalIdNo: '123.456.789-00', isCertified: true, certificationType: 'Coletiva', cooperative: 'Cooxupé', yearsOfFarmingExperience: 22, creditScore: 88, bankName: 'Banco do Brasil', bankBranch: 'Guaxupé', accountNumber: '0012345678', accountHolderName: 'João Silva', sortCodeSwift: 'BRASBRRJ', paymentPreference: 'bank_transfer' },
      { farmerCode: 'FRM-BR-002', fullName: 'Maria Oliveira', firstName: 'Maria', lastName: 'Oliveira', contactNumber: '+5535992345678', gender: 'Feminino', country: 'Brasil', province: 'Minas Gerais', district: 'São Sebastião do Paraíso', commune: 'Paraíso', village: 'Sítio Boa Vista', latitude: -20.916, longitude: -47.124, nationalIdType: 'CPF', nationalIdNo: '234.567.890-11', isCertified: true, certificationType: 'Individual', cooperative: 'Cooxupé', yearsOfFarmingExperience: 15, creditScore: 82, bankName: 'Itaú', bankBranch: 'São Sebastião do Paraíso', accountNumber: '0023456789', accountHolderName: 'Maria Oliveira', sortCodeSwift: 'ITAUUBR', paymentPreference: 'bank_transfer' },
    ]
    // Ethiopia farmers
    const etFarmers = [
      { farmerCode: 'FRM-ET-001', fullName: 'Abebe Tadesse', firstName: 'Abebe', lastName: 'Tadesse', contactNumber: '+251912345678', gender: 'Male', country: 'Ethiopia', province: 'Gedeo', district: 'Yirgacheffe', commune: 'Kochere', village: 'Biloya', latitude: 6.162, longitude: 38.202, nationalIdType: 'Kebele ID', nationalIdNo: 'ET-YG-4582', isCertified: true, certificationType: 'Cooperative', cooperative: 'Yirgacheffe Union', yearsOfFarmingExperience: 15, creditScore: 78, bankName: 'Commercial Bank of Ethiopia', bankBranch: 'Yirgacheffe', accountNumber: '0123456789', accountHolderName: 'Abebe Tadesse', sortCodeSwift: 'CBETETAA', paymentPreference: 'bank_transfer' },
      { farmerCode: 'FRM-ET-002', fullName: 'Tigist Haile', firstName: 'Tigist', lastName: 'Haile', contactNumber: '+251923456789', gender: 'Female', country: 'Ethiopia', province: 'Gedeo', district: 'Yirgacheffe', commune: 'Wenago', village: 'Chelbesa', latitude: 6.185, longitude: 38.215, nationalIdType: 'Kebele ID', nationalIdNo: 'ET-YG-6734', isCertified: true, certificationType: 'Cooperative', cooperative: 'Yirgacheffe Union', yearsOfFarmingExperience: 10, creditScore: 72, mobileMoneyProvider: 'telebirr', mobileMoneyNumber: '+251923456789', paymentPreference: 'mobile_money' },
    ]
    // Kenya farmers
    const keFarmers = [
      { farmerCode: 'FRM-KE-001', fullName: 'Kamau Ndirangu', firstName: 'Kamau', lastName: 'Ndirangu', contactNumber: '+254723456789', gender: 'Male', country: 'Kenya', province: 'Central', district: 'Nyeri', commune: 'Othaya', village: 'Gathaithi', latitude: -0.420, longitude: 36.951, nationalIdType: 'National ID', nationalIdNo: 'KE-28473950', isCertified: true, certificationType: 'Cooperative', cooperative: 'Othaya Farmers Cooperative Society', yearsOfFarmingExperience: 10, creditScore: 85, bankName: 'Kenya Commercial Bank', bankBranch: 'Othaya', accountNumber: '0345678901', accountHolderName: 'Kamau Ndirangu', sortCodeSwift: 'KCABKENX', paymentPreference: 'bank_transfer', mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254723456789' },
      { farmerCode: 'FRM-KE-002', fullName: 'Wanjiku Kamau', firstName: 'Wanjiku', lastName: 'Kamau', contactNumber: '+254734567890', gender: 'Female', country: 'Kenya', province: 'Central', district: 'Nyeri', commune: 'Othaya', village: 'Kamoko', latitude: -0.430, longitude: 36.940, nationalIdType: 'National ID', nationalIdNo: 'KE-39584061', isCertified: true, certificationType: 'Cooperative', cooperative: 'Othaya Farmers Cooperative Society', yearsOfFarmingExperience: 12, creditScore: 79, mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254734567890', paymentPreference: 'mobile_money' },
    ]

    const allFarmerDefs = [
      ...vnFarmers.map(f => ({ ...f, tenantId: vnTid, createdBy: vnAdmin.id, isActive: true, enrollmentDate: new Date(), smartphoneOwnership: true, healthInsurance: true })),
      ...brFarmers.map(f => ({ ...f, tenantId: brTid, createdBy: brAdmin.id, isActive: true, enrollmentDate: new Date(), smartphoneOwnership: true, healthInsurance: true })),
      ...etFarmers.map(f => ({ ...f, tenantId: etTid, createdBy: etAdmin.id, isActive: true, enrollmentDate: new Date(), smartphoneOwnership: true, healthInsurance: true })),
      ...keFarmers.map(f => ({ ...f, tenantId: keTid, createdBy: keAdmin.id, isActive: true, enrollmentDate: new Date(), smartphoneOwnership: true, healthInsurance: true })),
    ]
    const farmerRecords: Record<string, any> = {}
    for (const fd of allFarmerDefs) {
      farmerRecords[fd.farmerCode!] = await db.farmer.create({ data: fd as any })
    }

    // ═══ 8. FarmLands ═══
    const farmLandDefs = [
      { key: 'VN-PLT-001', tenantId: vnTid, farmerCode: 'FRM-VN-001', farmName: "Nông trại Tây Nguyên Thanh", plotBlockId: 'TB-VN-PLT-001', totalLandHolding: 2.5, altitude: 850, soilType: 'Ferralitic', latitude: 12.668, longitude: 108.038, noOfTrees: 2800, estYield: 3500 },
      { key: 'VN-PLT-002', tenantId: vnTid, farmerCode: 'FRM-VN-002', farmName: "Vườn Hữu cơ Hoa", plotBlockId: 'TB-VN-PLT-002', totalLandHolding: 1.8, altitude: 920, soilType: 'Núi lửa', latitude: 12.692, longitude: 108.055, noOfTrees: 2000, estYield: 2800 },
      { key: 'BR-PLT-001', tenantId: brTid, farmerCode: 'FRM-BR-001', farmName: 'Fazenda São José', plotBlockId: 'TB-BR-PLT-001', totalLandHolding: 8.0, altitude: 950, soilType: 'Latossolo Vermelho', latitude: -21.307, longitude: -46.718, noOfTrees: 24000, estYield: 12000 },
      { key: 'ET-PLT-001', tenantId: etTid, farmerCode: 'FRM-ET-001', farmName: 'Yirgacheffe Biloya Garden', plotBlockId: 'TB-ET-PLT-001', totalLandHolding: 1.5, altitude: 1850, soilType: 'Nitisol', latitude: 6.162, longitude: 38.202, noOfTrees: 1800, estYield: 2200 },
      { key: 'KE-PLT-001', tenantId: keTid, farmerCode: 'FRM-KE-001', farmName: 'Gathaithi Estate', plotBlockId: 'TB-KE-PLT-001', totalLandHolding: 2.0, altitude: 1680, soilType: 'Volcanic Loam', latitude: -0.420, longitude: 36.951, noOfTrees: 2200, estYield: 2600 },
    ]
    const flRecords: Record<string, any> = {}
    for (const fld of farmLandDefs) {
      const flKey = fld.key
      const flFarmerCode = fld.farmerCode
      const adminId = fld.tenantId === vnTid ? vnAdmin.id : fld.tenantId === brTid ? brAdmin.id : fld.tenantId === etTid ? etAdmin.id : keAdmin.id
      flRecords[flKey] = await db.farmLand.create({ data: {
        tenantId: fld.tenantId,
        farmName: fld.farmName,
        plotBlockId: fld.plotBlockId,
        totalLandHolding: fld.totalLandHolding,
        altitude: fld.altitude,
        soilType: fld.soilType,
        latitude: fld.latitude,
        longitude: fld.longitude,
        noOfTrees: fld.noOfTrees,
        estYield: fld.estYield,
        farmerId: farmerRecords[flFarmerCode].id,
        createdBy: adminId,
        landOwnership: 'Owned',
        childLabourPolicy: true,
        minimumWageCompliance: true,
        ppeAvailable: true,
        isActive: true,
        polygonGeoJson: makePolygonGeoJson(fld.latitude, fld.longitude),
        boundaryArea: fld.totalLandHolding,
        geoCenterLat: fld.latitude,
        geoCenterLng: fld.longitude,
      } as any })
    }

    // ═══ 9. Entity Relationships ═══
    const relDefs = [
      { from: 'metrang-coffee', to: 'euro-coffee-imports', type: 'export' },
      { from: 'cooxupe', to: 'euro-coffee-imports', type: 'export' },
      { from: 'yirgacheffe-union', to: 'euro-coffee-imports', type: 'export' },
      { from: 'othaya-cooperative', to: 'euro-coffee-imports', type: 'export' },
      { from: 'sgs-inspection', to: 'metrang-coffee', type: 'certify' },
      { from: 'sgs-inspection', to: 'cooxupe', type: 'inspect' },
    ]
    for (const rd of relDefs) {
      await db.entityRelationship.create({ data: { fromEntityId: tenants[rd.from].id, toEntityId: tenants[rd.to].id, relationshipType: rd.type, status: 'active', startDate: new Date() } })
    }

    // ═══ 10. Buyers for Euro Coffee ═══
    await db.buyer.create({ data: { companyName: 'Kaffeerösterei Berlin GmbH', contactPerson: 'Hans Müller', email: 'hans@kaffeerosterei.de', country: 'Germany', city: 'Berlin', taxId: 'DE123456789', euRegistration: true, tenantId: nlTid, createdBy: nlAdmin.id, isActive: true } })
    await db.buyer.create({ data: { companyName: 'Cafés Spécialisés Paris SAS', contactPerson: 'Pierre Dupont', email: 'pierre@cafes-specialises.fr', country: 'France', city: 'Paris', taxId: 'FR987654321', euRegistration: true, tenantId: nlTid, createdBy: nlAdmin.id, isActive: true } })

    // ═══ 11. EUDR Compliance ═══
    const eudrDefs = [
      { tenantId: vnTid, complianceId: 'EUDR-VN-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-VN-001', flKey: 'VN-PLT-001' },
      { tenantId: vnTid, complianceId: 'EUDR-VN-2024-002', status: 'in_review', riskLevel: 'medium', farmerCode: 'FRM-VN-002', flKey: 'VN-PLT-002' },
      { tenantId: brTid, complianceId: 'EUDR-BR-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-BR-001', flKey: 'BR-PLT-001' },
      { tenantId: etTid, complianceId: 'EUDR-ET-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-ET-001', flKey: 'ET-PLT-001' },
      { tenantId: keTid, complianceId: 'EUDR-KE-2024-001', status: 'pending', riskLevel: 'medium', farmerCode: 'FRM-KE-001', flKey: 'KE-PLT-001' },
    ]
    for (const ed of eudrDefs) {
      if (farmerRecords[ed.farmerCode] && flRecords[ed.flKey]) {
        const adminId = ed.tenantId === vnTid ? vnAdmin.id : ed.tenantId === brTid ? brAdmin.id : ed.tenantId === etTid ? etAdmin.id : keAdmin.id
        await db.eudrCompliance.create({ data: { tenantId: ed.tenantId, complianceId: ed.complianceId, status: ed.status, riskLevel: ed.riskLevel, farmerId: farmerRecords[ed.farmerCode].id, farmLandId: flRecords[ed.flKey].id, createdBy: adminId, geolocationLat: farmerRecords[ed.farmerCode].latitude, geolocationLng: farmerRecords[ed.farmerCode].longitude, validFrom: new Date('2024-01-01'), validUntil: new Date('2025-12-31'), isActive: true } as any })
      }
    }

    // ═══ Return credentials ═══
    return NextResponse.json({
      success: true,
      message: 'Multi-tenant seed complete! 6 tenants, 15 users, 9 farmers across 4 countries.',
      tenants: tenantDefs.map(t => ({ slug: t.slug, name: t.name, entityType: t.entityType, country: t.country, currency: t.currency, language: t.language })),
      credentials: userDefs.map(u => ({
        email: u.email,
        role: u.role,
        entityType: tenants[u.tenantSlug].entityType,
        tenant: tenants[u.tenantSlug].name,
      })),
      password: 'Admin@2024',
    })
  } catch (e: any) {
    console.error('[Seed v2] Error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

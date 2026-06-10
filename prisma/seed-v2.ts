import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient({ log: ['warn', 'error'] })

function makePolygonGeoJson(lat: number, lng: number): string {
  const d = 0.0009
  return JSON.stringify({ type: 'Polygon', coordinates: [[[lng-d,lat-d],[lng+d,lat-d],[lng+d,lat+d],[lng-d,lat+d],[lng-d,lat-d]]] })
}

async function main() {
  console.log('\n🌱 Seeding Terra Brew (Multi-Tenant v2)...\n')
  const PWD = await bcrypt.hash('Admin@2024', 12)

  // ═══ 1. Platform Admin ═══
  const pEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@terrabrew.platform'
  if (!await db.platformUser.findUnique({ where: { email: pEmail } })) {
    await db.platformUser.create({ data: { email: pEmail, passwordHash: PWD, name: 'Platform Admin', role: 'super_admin' } })
    console.log('  ✅ Platform admin')
  }

  // ═══ 2. Modules ═══
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
  console.log('  ✅ Modules')

  // ═══ 3. Tenants ═══
  const tenantDefs = [
    { slug: 'metrang-coffee', name: 'Metrang Coffee', legalName: 'Công ty TNHH Metrang Coffee', entityType: 'producer', country: 'VN', currency: 'VND', currencySymbol: '₫', language: 'vi', timezone: 'Asia/Ho_Chi_Minh', locale: 'vi-VN', dateFormat: 'DD/MM/YYYY', region: 'Southeast Asia', supportedLanguages: '["vi","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Organic","Fair Trade","UTZ"]', plan: 'professional', maxUsers: 25, maxFarmers: 1000, commodityTypes: '["coffee"]' },
    { slug: 'cooxupe', name: 'Cooxupé', legalName: 'Cooperativa Regional de Cafeicultores em Guaxupé', entityType: 'aggregator', country: 'BR', currency: 'BRL', currencySymbol: 'R$', language: 'pt', timezone: 'America/Sao_Paulo', locale: 'pt-BR', dateFormat: 'DD/MM/YYYY', region: 'South America', supportedLanguages: '["pt","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Rainforest Alliance","UTZ","Fair Trade"]', plan: 'professional', maxUsers: 50, maxFarmers: 5000, commodityTypes: '["coffee"]' },
    { slug: 'yirgacheffe-union', name: 'Yirgacheffe Union', legalName: 'Yirgacheffe Coffee Farmers Cooperative Union', entityType: 'producer', country: 'ET', currency: 'ETB', currencySymbol: 'Br', language: 'am', timezone: 'Africa/Addis_Ababa', locale: 'am-ET', dateFormat: 'DD/MM/YYYY', region: 'East Africa', supportedLanguages: '["am","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Organic","Fair Trade"]', plan: 'starter', maxUsers: 15, maxFarmers: 2000, commodityTypes: '["coffee"]' },
    { slug: 'othaya-cooperative', name: 'Othaya Cooperative', legalName: 'Othaya Farmers Cooperative Society Ltd', entityType: 'producer', country: 'KE', currency: 'KES', currencySymbol: 'KSh', language: 'sw', timezone: 'Africa/Nairobi', locale: 'sw-KE', dateFormat: 'DD/MM/YYYY', region: 'East Africa', supportedLanguages: '["sw","en"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Fair Trade","Rainforest Alliance"]', plan: 'starter', maxUsers: 10, maxFarmers: 1500, commodityTypes: '["coffee"]' },
    { slug: 'asunafo-export', name: 'Asunafo Cocoa & Coffee Export', legalName: 'Asunafo Cocoa & Coffee Export Ltd', entityType: 'exporter', country: 'GH', currency: 'GHS', currencySymbol: 'GH₵', language: 'en', timezone: 'Africa/Accra', locale: 'en-GH', dateFormat: 'DD/MM/YYYY', region: 'West Africa', supportedLanguages: '["en","ak"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Fair Trade","Rainforest Alliance","UTZ"]', plan: 'professional', maxUsers: 20, maxFarmers: 800, commodityTypes: '["coffee","cocoa"]' },
    { slug: 'nkusi-coffee', name: 'Nkusi Coffee Cooperative', legalName: 'Nkusi Coffee Cooperative Society Ltd', entityType: 'aggregator', country: 'UG', currency: 'UGX', currencySymbol: 'USh', language: 'en', timezone: 'Africa/Kampala', locale: 'en-UG', dateFormat: 'DD/MM/YYYY', region: 'East Africa', supportedLanguages: '["en","lg","sw"]', measurementUnit: 'metric', eudrCompliant: true, certifications: '["Fair Trade","Organic"]', plan: 'professional', maxUsers: 25, maxFarmers: 2000, commodityTypes: '["coffee"]' },
  ]
  const tenants: Record<string, any> = {}
  for (const td of tenantDefs) {
    tenants[td.slug] = await db.tenant.upsert({
      where: { slug: td.slug },
      update: { name: td.name, legalName: td.legalName, entityType: td.entityType, country: td.country, currency: td.currency, currencySymbol: td.currencySymbol, language: td.language, timezone: td.timezone, locale: td.locale },
      create: td as any,
    })
  }
  console.log(`  ✅ ${Object.keys(tenants).length} Tenants`)

  // ═══ 4. TenantModules ═══
  const moduleByEntity: Record<string, string[]> = {
    producer: ['dashboard','analytics','farmers','farmlands','cultivations','nurseries','land-preparations','crop-monitorings','fertilizer-apps','pest-disease-mgmts','harvest-traceabilities','procurement','eudr-compliance','cert-assessments','deforestation','marketplace','trace-journey','billing','users'],
    aggregator: ['dashboard','analytics','harvest-traceabilities','procurement','processing','coffee-inspections','qc-verifications','eudr-compliance','cert-assessments','marketplace','rfq','smart-contracts','trading-desk','shipments','logistics','buyers','trace-journey','iot-sensors','blockchain','billing','users'],
    exporter: ['dashboard','analytics','eudr-compliance','marketplace','rfq','smart-contracts','trading-desk','shipments','logistics','export-docs','buyers','trace-journey','blockchain','billing','users'],
    importer: ['dashboard','analytics','eudr-compliance','marketplace','rfq','smart-contracts','trading-desk','shipments','logistics','buyers','trace-journey','blockchain','billing','users'],
    certification_body: ['dashboard','analytics','coffee-inspections','cert-assessments','eudr-compliance','deforestation','billing','users'],
    laboratory: ['dashboard','analytics','coffee-inspections','qc-verifications','billing','users'],
  }
  for (const [slug, tenant] of Object.entries(tenants)) {
    const mods = moduleByEntity[tenant.entityType] || []
    for (const modSlug of mods) {
      await db.tenantModule.upsert({
        where: { tenantId_moduleSlug: { tenantId: tenant.id, moduleSlug: modSlug } },
        update: { isEnabled: true },
        create: { tenantId: tenant.id, moduleSlug: modSlug, isEnabled: true },
      })
    }
  }
  console.log('  ✅ TenantModules')

  // ═══ 5. Users ═══
  const userDefs = [
    // Metrang Coffee (Vietnam)
    { email: 'admin@metrang-coffee.terrabrew.com', name: 'Quản trị viên Metrang', role: 'tenant_admin', tenantSlug: 'metrang-coffee' },
    { email: 'field_officer@metrang-coffee.terrabrew.com', name: 'Cán bộ hiện trường', role: 'field_officer', tenantSlug: 'metrang-coffee' },
    { email: 'viewer@metrang-coffee.terrabrew.com', name: 'Người xem', role: 'viewer', tenantSlug: 'metrang-coffee' },
    // Cooxupé (Brazil)
    { email: 'admin@cooxupe.terrabrew.com', name: 'Administrador Cooxupé', role: 'tenant_admin', tenantSlug: 'cooxupe' },
    { email: 'operations@cooxupe.terrabrew.com', name: 'Gerente de Operações', role: 'operations_manager', tenantSlug: 'cooxupe' },
    { email: 'trader@cooxupe.terrabrew.com', name: 'Trader Cooxupé', role: 'trader', tenantSlug: 'cooxupe' },
    // Yirgacheffe Union (Ethiopia)
    { email: 'admin@yirgacheffe-union.terrabrew.com', name: 'Union Admin', role: 'tenant_admin', tenantSlug: 'yirgacheffe-union' },
    { email: 'field_officer@yirgacheffe-union.terrabrew.com', name: 'Field Officer', role: 'field_officer', tenantSlug: 'yirgacheffe-union' },
    // Othaya Cooperative (Kenya)
    { email: 'admin@othaya-cooperative.terrabrew.com', name: 'Othaya Admin', role: 'tenant_admin', tenantSlug: 'othaya-cooperative' },
    { email: 'field_officer@othaya-cooperative.terrabrew.com', name: 'Othaya Field Officer', role: 'field_officer', tenantSlug: 'othaya-cooperative' },
    // Asunafo Cocoa & Coffee Export (Ghana)
    { email: 'admin@asunafo-export.terrabrew.com', name: 'Asunafo Admin', role: 'tenant_admin', tenantSlug: 'asunafo-export' },
    { email: 'trader@asunafo-export.terrabrew.com', name: 'Asunafo Trader', role: 'trader', tenantSlug: 'asunafo-export' },
    // Nkusi Coffee Cooperative (Uganda)
    { email: 'admin@nkusi-coffee.terrabrew.com', name: 'Nkusi Admin', role: 'tenant_admin', tenantSlug: 'nkusi-coffee' },
    { email: 'field_officer@nkusi-coffee.terrabrew.com', name: 'Nkusi Field Officer', role: 'field_officer', tenantSlug: 'nkusi-coffee' },
  ]
  const users: Record<string, any> = {}
  for (const ud of userDefs) {
    const tid = tenants[ud.tenantSlug].id
    const existing = await db.user.findUnique({ where: { email_tenantId: { email: ud.email, tenantId: tid } } })
    if (!existing) {
      users[ud.email] = await db.user.create({ data: { email: ud.email, passwordHash: PWD, name: ud.name, role: ud.role, tenantId: tid } })
      console.log(`  ✅ User ${ud.email}`)
    } else {
      users[ud.email] = existing
    }
  }
  console.log('  ✅ Users')

  // ═══ 6. Farmers (per tenant, country-specific) ═══
  // Vietnam farmers
  const vnAdmin = users['admin@metrang-coffee.terrabrew.com']
  const vnTid = tenants['metrang-coffee'].id
  const vnFarmers = [
    { farmerCode: 'FRM-VN-001', fullName: 'Nguyễn Văn Thanh', firstName: 'Thanh', lastName: 'Nguyễn', contactNumber: '0912345678', gender: 'Nam', country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tam', village: "Buôn K'Mang", latitude: 12.668, longitude: 108.038, nationalIdType: 'CCCD', nationalIdNo: '795284610382', isCertified: true, certificationType: 'Cá nhân', cooperative: 'Hợp tác xã Cà phê Ea Tam', yearsOfFarmingExperience: 12, creditScore: 82, bankName: 'Vietcombank', bankBranch: 'Cư Mgar', accountNumber: '0912345678901', accountHolderName: 'Nguyễn Văn Thanh', sortCodeSwift: 'BFTVVNVX', paymentPreference: 'bank_transfer' },
    { farmerCode: 'FRM-VN-002', fullName: 'Trần Thị Hoa', firstName: 'Hoa', lastName: 'Trần', contactNumber: '0923456789', gender: 'Nữ', country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Drăng', village: 'Ea Pok', latitude: 12.692, longitude: 108.055, nationalIdType: 'CCCD', nationalIdNo: '794827364518', isCertified: true, certificationType: 'Tập thể', cooperative: 'Nông trại Hữu cơ Ea Drăng', yearsOfFarmingExperience: 8, creditScore: 76, loanTaken: true, loanTakenFrom: 'Vietcombank', loanAmount: 30000000, bankName: 'Agribank', bankBranch: 'Ea Drăng', accountNumber: '1209234567890', accountHolderName: 'Trần Thị Hoa', sortCodeSwift: 'VBAZVNVX', paymentPreference: 'bank_transfer' },
    { farmerCode: 'FRM-VN-003', fullName: 'Lê Văn Minh', firstName: 'Minh', lastName: 'Lê', contactNumber: '0934567890', gender: 'Nam', country: 'Việt Nam', province: 'Đắk Lắk', district: "M'Drak", commune: "M'Drak", village: 'Buôn Jol', latitude: 12.695, longitude: 108.050, nationalIdType: 'CCCD', nationalIdNo: '796135820497', isCertified: true, certificationType: 'Cá nhân', cooperative: "Hợp tác xã Cà phê M'Drak", yearsOfFarmingExperience: 18, creditScore: 90, bankName: 'BIDV', bankBranch: "M'Drak", accountNumber: '2340934567890', accountHolderName: 'Lê Văn Minh', sortCodeSwift: 'BIDVVNVX', paymentPreference: 'bank_transfer' },
  ]
  // Brazil farmers
  const brAdmin = users['admin@cooxupe.terrabrew.com']
  const brTid = tenants['cooxupe'].id
  const brFarmers = [
    { farmerCode: 'FRM-BR-001', fullName: 'João Silva', firstName: 'João', lastName: 'Silva', contactNumber: '+5535991234567', gender: 'Masculino', country: 'Brasil', province: 'Minas Gerais', district: 'Guaxupé', commune: 'Guaxupé', village: 'Fazenda São José', latitude: -21.307, longitude: -46.718, nationalIdType: 'CPF', nationalIdNo: '123.456.789-00', isCertified: true, certificationType: 'Coletiva', cooperative: 'Cooxupé', yearsOfFarmingExperience: 22, creditScore: 88, bankName: 'Banco do Brasil', bankBranch: 'Guaxupé', accountNumber: '0012345678', accountHolderName: 'João Silva', sortCodeSwift: 'BRASBRRJ', paymentPreference: 'bank_transfer' },
    { farmerCode: 'FRM-BR-002', fullName: 'Maria Oliveira', firstName: 'Maria', lastName: 'Oliveira', contactNumber: '+5535992345678', gender: 'Feminino', country: 'Brasil', province: 'Minas Gerais', district: 'São Sebastião do Paraíso', commune: 'Paraíso', village: 'Sítio Boa Vista', latitude: -20.916, longitude: -47.124, nationalIdType: 'CPF', nationalIdNo: '234.567.890-11', isCertified: true, certificationType: 'Individual', cooperative: 'Cooxupé', yearsOfFarmingExperience: 15, creditScore: 82, bankName: 'Itaú', bankBranch: 'São Sebastião do Paraíso', accountNumber: '0023456789', accountHolderName: 'Maria Oliveira', sortCodeSwift: 'ITAUUBR', paymentPreference: 'bank_transfer' },
    { farmerCode: 'FRM-BR-003', fullName: 'Carlos Santos', firstName: 'Carlos', lastName: 'Santos', contactNumber: '+5535993456789', gender: 'Masculino', country: 'Brasil', province: 'Minas Gerais', district: 'Varginha', commune: 'Varginha', village: 'Fazenda Esperança', latitude: -21.552, longitude: -45.435, nationalIdType: 'CPF', nationalIdNo: '345.678.901-22', isCertified: true, certificationType: 'Coletiva', cooperative: 'Cooxupé', yearsOfFarmingExperience: 30, creditScore: 94, bankName: 'Santander', bankBranch: 'Varginha', accountNumber: '0034567890', accountHolderName: 'Carlos Santos', sortCodeSwift: 'ABNABRSP', paymentPreference: 'bank_transfer' },
  ]
  // Ethiopia farmers
  const etAdmin = users['admin@yirgacheffe-union.terrabrew.com']
  const etTid = tenants['yirgacheffe-union'].id
  const etFarmers = [
    { farmerCode: 'FRM-ET-001', fullName: 'Abebe Tadesse', firstName: 'Abebe', lastName: 'Tadesse', contactNumber: '+251912345678', gender: 'Male', country: 'Ethiopia', province: 'Gedeo', district: 'Yirgacheffe', commune: 'Kochere', village: 'Biloya', latitude: 6.162, longitude: 38.202, nationalIdType: 'Kebele ID', nationalIdNo: 'ET-YG-4582', isCertified: true, certificationType: 'Cooperative', cooperative: 'Yirgacheffe Union', yearsOfFarmingExperience: 15, creditScore: 78, bankName: 'Commercial Bank of Ethiopia', bankBranch: 'Yirgacheffe', accountNumber: '0123456789', accountHolderName: 'Abebe Tadesse', sortCodeSwift: 'CBETETAA', paymentPreference: 'bank_transfer' },
    { farmerCode: 'FRM-ET-002', fullName: 'Tigist Haile', firstName: 'Tigist', lastName: 'Haile', contactNumber: '+251923456789', gender: 'Female', country: 'Ethiopia', province: 'Gedeo', district: 'Yirgacheffe', commune: 'Wenago', village: 'Chelbesa', latitude: 6.185, longitude: 38.215, nationalIdType: 'Kebele ID', nationalIdNo: 'ET-YG-6734', isCertified: true, certificationType: 'Cooperative', cooperative: 'Yirgacheffe Union', yearsOfFarmingExperience: 10, creditScore: 72, mobileMoneyProvider: 'telebirr', mobileMoneyNumber: '+251923456789', paymentPreference: 'mobile_money' },
    { farmerCode: 'FRM-ET-003', fullName: 'Dawit Mekonnen', firstName: 'Dawit', lastName: 'Mekonnen', contactNumber: '+251934567890', gender: 'Male', country: 'Ethiopia', province: 'Gedeo', district: 'Kochere', commune: 'Kochere', village: 'Biloya', latitude: 6.150, longitude: 38.190, nationalIdType: 'Kebele ID', nationalIdNo: 'ET-KC-8921', isCertified: true, certificationType: 'Cooperative', cooperative: 'Yirgacheffe Union', yearsOfFarmingExperience: 20, creditScore: 85, bankName: 'Awash Bank', bankBranch: 'Dilla', accountNumber: '0234567890', accountHolderName: 'Dawit Mekonnen', sortCodeSwift: 'AWBKETAA', paymentPreference: 'bank_transfer' },
  ]
  // Kenya farmers
  const keAdmin = users['admin@othaya-cooperative.terrabrew.com']
  const keTid = tenants['othaya-cooperative'].id
  const keFarmers = [
    { farmerCode: 'FRM-KE-001', fullName: 'Kamau Ndirangu', firstName: 'Kamau', lastName: 'Ndirangu', contactNumber: '+254723456789', gender: 'Male', country: 'Kenya', province: 'Central', district: 'Nyeri', commune: 'Othaya', village: 'Gathaithi', latitude: -0.420, longitude: 36.951, nationalIdType: 'National ID', nationalIdNo: 'KE-28473950', isCertified: true, certificationType: 'Cooperative', cooperative: 'Othaya Farmers Cooperative Society', yearsOfFarmingExperience: 10, creditScore: 85, loanTaken: true, loanTakenFrom: 'Kenya Commercial Bank', loanAmount: 500000, bankName: 'Kenya Commercial Bank', bankBranch: 'Othaya', accountNumber: '0345678901', accountHolderName: 'Kamau Ndirangu', sortCodeSwift: 'KCABKENX', paymentPreference: 'bank_transfer', mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254723456789' },
    { farmerCode: 'FRM-KE-002', fullName: 'Wanjiku Kamau', firstName: 'Wanjiku', lastName: 'Kamau', contactNumber: '+254734567890', gender: 'Female', country: 'Kenya', province: 'Central', district: 'Nyeri', commune: 'Othaya', village: 'Kamoko', latitude: -0.430, longitude: 36.940, nationalIdType: 'National ID', nationalIdNo: 'KE-39584061', isCertified: true, certificationType: 'Cooperative', cooperative: 'Othaya Farmers Cooperative Society', yearsOfFarmingExperience: 12, creditScore: 79, mobileMoneyProvider: 'M-Pesa', mobileMoneyNumber: '+254734567890', paymentPreference: 'mobile_money' },
    { farmerCode: 'FRM-KE-003', fullName: 'Omondi Otieno', firstName: 'Omondi', lastName: 'Otieno', contactNumber: '+254745678901', gender: 'Male', country: 'Kenya', province: 'Central', district: 'Nyeri', commune: 'Mahiga', village: 'Mahiga', latitude: -0.380, longitude: 36.970, nationalIdType: 'National ID', nationalIdNo: 'KE-40695172', isCertified: true, certificationType: 'Individual', cooperative: 'Othaya Farmers Cooperative Society', yearsOfFarmingExperience: 25, creditScore: 91, bankName: 'Equity Bank', bankBranch: 'Othaya', accountNumber: '0456789012', accountHolderName: 'Omondi Otieno', sortCodeSwift: 'EQBLKENA', paymentPreference: 'bank_transfer' },
  ]

  // Ghana farmers
  const ghAdmin = users['admin@asunafo-export.terrabrew.com']
  const ghTid = tenants['asunafo-export'].id
  const ghFarmers = [
    { farmerCode: 'FRM-GH-001', fullName: 'Kwame Asante', firstName: 'Kwame', lastName: 'Asante', contactNumber: '+233241234567', gender: 'Male', country: 'Ghana', province: 'Ahafo', district: 'Asunafo North', commune: 'Goaso', village: 'Acherensua', latitude: 6.892, longitude: -2.498, nationalIdType: 'Ghana Card', nationalIdNo: 'GHA-000123456-1', isCertified: true, certificationType: 'Cooperative', cooperative: 'Asunafo Cocoa & Coffee Export', yearsOfFarmingExperience: 14, creditScore: 80, mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+233241234567', paymentPreference: 'mobile_money' },
    { farmerCode: 'FRM-GH-002', fullName: 'Abena Mensah', firstName: 'Abena', lastName: 'Mensah', contactNumber: '+233242345678', gender: 'Female', country: 'Ghana', province: 'Ahafo', district: 'Sunyani', commune: 'Sunyani', village: 'Nkrankrom', latitude: 7.334, longitude: -2.327, nationalIdType: 'Ghana Card', nationalIdNo: 'GHA-000234567-2', isCertified: true, certificationType: 'Cooperative', cooperative: 'Asunafo Cocoa & Coffee Export', yearsOfFarmingExperience: 9, creditScore: 74, bankName: 'GCB Bank', bankBranch: 'Sunyani', accountNumber: '4012345678', accountHolderName: 'Abena Mensah', sortCodeSwift: 'GHCBGHAC', paymentPreference: 'bank_transfer', mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+233242345678' },
    { farmerCode: 'FRM-GH-003', fullName: 'Kofi Boateng', firstName: 'Kofi', lastName: 'Boateng', contactNumber: '+233243456789', gender: 'Male', country: 'Ghana', province: 'Ahafo', district: 'Dormaa East', commune: 'Wamfie', village: 'Kwakuanya', latitude: 7.152, longitude: -2.875, nationalIdType: 'Ghana Card', nationalIdNo: 'GHA-000345678-3', isCertified: true, certificationType: 'Individual', cooperative: 'Asunafo Cocoa & Coffee Export', yearsOfFarmingExperience: 20, creditScore: 88, bankName: 'Agricultural Development Bank', bankBranch: 'Dormaa Ahenkro', accountNumber: '5023456789', accountHolderName: 'Kofi Boateng', sortCodeSwift: 'ADBKGHAC', paymentPreference: 'bank_transfer' },
  ]
  // Uganda farmers
  const ugAdmin = users['admin@nkusi-coffee.terrabrew.com']
  const ugTid = tenants['nkusi-coffee'].id
  const ugFarmers = [
    { farmerCode: 'FRM-UG-001', fullName: 'Emmanuel Mukasa', firstName: 'Emmanuel', lastName: 'Mukasa', contactNumber: '+256771234567', gender: 'Male', country: 'Uganda', province: 'Eastern', district: 'Mbale', commune: 'Mbale', village: 'Bumasobo', latitude: 1.083, longitude: 34.175, nationalIdType: 'National ID', nationalIdNo: 'UG-89012345', isCertified: true, certificationType: 'Cooperative', cooperative: 'Nkusi Coffee Cooperative', yearsOfFarmingExperience: 16, creditScore: 82, mobileMoneyProvider: 'MTN MoMo', mobileMoneyNumber: '+256771234567', paymentPreference: 'mobile_money' },
    { farmerCode: 'FRM-UG-002', fullName: 'Grace Nalubega', firstName: 'Grace', lastName: 'Nalubega', contactNumber: '+256772345678', gender: 'Female', country: 'Uganda', province: 'Eastern', district: 'Kapchorwa', commune: 'Kapchorwa', village: 'Tulel', latitude: 1.397, longitude: 34.455, nationalIdType: 'National ID', nationalIdNo: 'UG-90123456', isCertified: true, certificationType: 'Cooperative', cooperative: 'Nkusi Coffee Cooperative', yearsOfFarmingExperience: 11, creditScore: 76, bankName: 'Centenary Bank', bankBranch: 'Kapchorwa', accountNumber: '1023456789', accountHolderName: 'Grace Nalubega', sortCodeSwift: 'CERBUGKA', paymentPreference: 'bank_transfer', mobileMoneyProvider: 'Airtel Money', mobileMoneyNumber: '+256772345678' },
    { farmerCode: 'FRM-UG-003', fullName: 'James Ochieng', firstName: 'James', lastName: 'Ochieng', contactNumber: '+256773456789', gender: 'Male', country: 'Uganda', province: 'Eastern', district: 'Mbale', commune: 'Budadiri', village: 'Mount Elgon', latitude: 1.250, longitude: 34.350, nationalIdType: 'National ID', nationalIdNo: 'UG-91234567', isCertified: true, certificationType: 'Individual', cooperative: 'Nkusi Coffee Cooperative', yearsOfFarmingExperience: 22, creditScore: 90, bankName: 'Stanbic Bank', bankBranch: 'Mbale', accountNumber: '2034567890', accountHolderName: 'James Ochieng', sortCodeSwift: 'STANUGMB', paymentPreference: 'bank_transfer' },
  ]

  const allFarmerDefs = [
    ...vnFarmers.map(f => ({ ...f, tenantId: vnTid, createdBy: vnAdmin.id, isActive: true, enrollmentDate: new Date(), housingOwnership: 'Sở hữu', houseType: 'Permanent', smartphoneOwnership: true, healthInsurance: true })),
    ...brFarmers.map(f => ({ ...f, tenantId: brTid, createdBy: brAdmin.id, isActive: true, enrollmentDate: new Date(), housingOwnership: 'Própria', houseType: 'Permanente', smartphoneOwnership: true, healthInsurance: true })),
    ...etFarmers.map(f => ({ ...f, tenantId: etTid, createdBy: etAdmin.id, isActive: true, enrollmentDate: new Date(), housingOwnership: 'Owned', houseType: 'Traditional', smartphoneOwnership: true, healthInsurance: true })),
    ...keFarmers.map(f => ({ ...f, tenantId: keTid, createdBy: keAdmin.id, isActive: true, enrollmentDate: new Date(), housingOwnership: 'Owned', houseType: 'Stone', smartphoneOwnership: true, healthInsurance: true })),
    ...ghFarmers.map(f => ({ ...f, tenantId: ghTid, createdBy: ghAdmin.id, isActive: true, enrollmentDate: new Date(), housingOwnership: 'Owned', houseType: 'Compound', smartphoneOwnership: true, healthInsurance: true })),
    ...ugFarmers.map(f => ({ ...f, tenantId: ugTid, createdBy: ugAdmin.id, isActive: true, enrollmentDate: new Date(), housingOwnership: 'Owned', houseType: 'Permanent', smartphoneOwnership: true, healthInsurance: true })),
  ]
  const farmerRecords: Record<string, any> = {}
  for (const fd of allFarmerDefs) {
    const key = fd.farmerCode!
    const existing = await db.farmer.findUnique({ where: { farmerCode_tenantId: { farmerCode: key, tenantId: fd.tenantId } } })
    if (!existing) {
      farmerRecords[key] = await db.farmer.create({ data: fd as any })
      console.log(`  ✅ Farmer ${key}: ${fd.fullName}`)
    } else {
      farmerRecords[key] = existing
      console.log(`  ℹ️  Farmer ${key} exists`)
    }
  }

  // ═══ 7. FarmLands (per tenant) ═══
  const farmLandDefs = [
    { key: 'VN-PLT-001', tenantId: vnTid, farmerCode: 'FRM-VN-001', farmName: "Nông trại Tây Nguyên Thanh", plotBlockId: 'TB-VN-PLT-001', totalLandHolding: 2.5, altitude: 850, soilType: 'Ferralitic', latitude: 12.668, longitude: 108.038, noOfTrees: 2800, estYield: 3500 },
    { key: 'VN-PLT-002', tenantId: vnTid, farmerCode: 'FRM-VN-002', farmName: "Vườn Hữu cơ Hoa", plotBlockId: 'TB-VN-PLT-002', totalLandHolding: 1.8, altitude: 920, soilType: 'Núi lửa', latitude: 12.692, longitude: 108.055, noOfTrees: 2000, estYield: 2800 },
    { key: 'VN-PLT-003', tenantId: vnTid, farmerCode: 'FRM-VN-003', farmName: "Nông trại M'Drak Minh", plotBlockId: 'TB-VN-PLT-003', totalLandHolding: 3.2, altitude: 780, soilType: 'Đất đỏ Bazan', latitude: 12.695, longitude: 108.050, noOfTrees: 3500, estYield: 4200 },
    { key: 'BR-PLT-001', tenantId: brTid, farmerCode: 'FRM-BR-001', farmName: 'Fazenda São José', plotBlockId: 'TB-BR-PLT-001', totalLandHolding: 8.0, altitude: 950, soilType: 'Latossolo Vermelho', latitude: -21.307, longitude: -46.718, noOfTrees: 24000, estYield: 12000 },
    { key: 'BR-PLT-002', tenantId: brTid, farmerCode: 'FRM-BR-002', farmName: 'Sítio Boa Vista', plotBlockId: 'TB-BR-PLT-002', totalLandHolding: 4.5, altitude: 1020, soilType: 'Latossolo', latitude: -20.916, longitude: -47.124, noOfTrees: 13500, estYield: 6700 },
    { key: 'BR-PLT-003', tenantId: brTid, farmerCode: 'FRM-BR-003', farmName: 'Fazenda Esperança', plotBlockId: 'TB-BR-PLT-003', totalLandHolding: 12.0, altitude: 880, soilType: 'Terra Roxa', latitude: -21.552, longitude: -45.435, noOfTrees: 36000, estYield: 18000 },
    { key: 'ET-PLT-001', tenantId: etTid, farmerCode: 'FRM-ET-001', farmName: 'Yirgacheffe Biloya Garden', plotBlockId: 'TB-ET-PLT-001', totalLandHolding: 1.5, altitude: 1850, soilType: 'Nitisol', latitude: 6.162, longitude: 38.202, noOfTrees: 1800, estYield: 2200 },
    { key: 'ET-PLT-002', tenantId: etTid, farmerCode: 'FRM-ET-002', farmName: 'Chelbesa Garden', plotBlockId: 'TB-ET-PLT-002', totalLandHolding: 1.2, altitude: 1900, soilType: 'Nitisol', latitude: 6.185, longitude: 38.215, noOfTrees: 1400, estYield: 1800 },
    { key: 'ET-PLT-003', tenantId: etTid, farmerCode: 'FRM-ET-003', farmName: 'Kochere Hillside Farm', plotBlockId: 'TB-ET-PLT-003', totalLandHolding: 2.0, altitude: 1800, soilType: 'Andisol', latitude: 6.150, longitude: 38.190, noOfTrees: 2400, estYield: 3000 },
    { key: 'KE-PLT-001', tenantId: keTid, farmerCode: 'FRM-KE-001', farmName: 'Gathaithi Estate', plotBlockId: 'TB-KE-PLT-001', totalLandHolding: 2.0, altitude: 1680, soilType: 'Volcanic Loam', latitude: -0.420, longitude: 36.951, noOfTrees: 2200, estYield: 2600 },
    { key: 'KE-PLT-002', tenantId: keTid, farmerCode: 'FRM-KE-002', farmName: 'Kamoko Farm', plotBlockId: 'TB-KE-PLT-002', totalLandHolding: 1.5, altitude: 1720, soilType: 'Volcanic Loam', latitude: -0.430, longitude: 36.940, noOfTrees: 1600, estYield: 2000 },
    { key: 'KE-PLT-003', tenantId: keTid, farmerCode: 'FRM-KE-003', farmName: 'Mahiga Highlands', plotBlockId: 'TB-KE-PLT-003', totalLandHolding: 3.0, altitude: 1650, soilType: 'Humic Nitosol', latitude: -0.380, longitude: 36.970, noOfTrees: 3500, estYield: 4200 },
    // Ghana farm lands
    { key: 'GH-PLT-001', tenantId: ghTid, farmerCode: 'FRM-GH-001', farmName: 'Asante Cocoa & Coffee Farm', plotBlockId: 'TB-GH-PLT-001', totalLandHolding: 3.5, altitude: 320, soilType: 'Ferric Acrisol', latitude: 6.892, longitude: -2.498, noOfTrees: 2800, estYield: 3200 },
    { key: 'GH-PLT-002', tenantId: ghTid, farmerCode: 'FRM-GH-002', farmName: 'Mensah Sunyani Garden', plotBlockId: 'TB-GH-PLT-002', totalLandHolding: 2.0, altitude: 290, soilType: 'Haplic Lixisol', latitude: 7.334, longitude: -2.327, noOfTrees: 1600, estYield: 1900 },
    { key: 'GH-PLT-003', tenantId: ghTid, farmerCode: 'FRM-GH-003', farmName: 'Boateng Dormaa Plantation', plotBlockId: 'TB-GH-PLT-003', totalLandHolding: 5.0, altitude: 350, soilType: 'Plinthic Acrisol', latitude: 7.152, longitude: -2.875, noOfTrees: 4200, estYield: 4800 },
    // Uganda farm lands
    { key: 'UG-PLT-001', tenantId: ugTid, farmerCode: 'FRM-UG-001', farmName: 'Mukasa Mbale Farm', plotBlockId: 'TB-UG-PLT-001', totalLandHolding: 2.5, altitude: 1450, soilType: 'Nitisol', latitude: 1.083, longitude: 34.175, noOfTrees: 2200, estYield: 2600 },
    { key: 'UG-PLT-002', tenantId: ugTid, farmerCode: 'FRM-UG-002', farmName: 'Nalubega Kapchorwa Garden', plotBlockId: 'TB-UG-PLT-002', totalLandHolding: 1.8, altitude: 1800, soilType: 'Andisol', latitude: 1.397, longitude: 34.455, noOfTrees: 1500, estYield: 1800 },
    { key: 'UG-PLT-003', tenantId: ugTid, farmerCode: 'FRM-UG-003', farmName: 'Ochieng Mount Elgon Farm', plotBlockId: 'TB-UG-PLT-003', totalLandHolding: 4.0, altitude: 1650, soilType: 'Volcanic Loam', latitude: 1.250, longitude: 34.350, noOfTrees: 3800, estYield: 4400 },
  ]
  const flRecords: Record<string, any> = {}
  for (const fld of farmLandDefs) {
    const existing = await db.farmLand.findFirst({ where: { tenantId: fld.tenantId, plotBlockId: fld.plotBlockId } })
    if (!existing) {
      const { key, farmerCode, ...flData } = fld
      const adminId = fld.tenantId === vnTid ? vnAdmin.id : fld.tenantId === brTid ? brAdmin.id : fld.tenantId === etTid ? etAdmin.id : fld.tenantId === keTid ? keAdmin.id : fld.tenantId === ghTid ? ghAdmin.id : ugAdmin.id
      flRecords[key] = await db.farmLand.create({ data: { ...flData, farmerId: farmerRecords[farmerCode].id, createdBy: adminId, landOwnership: 'Owned', childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true, isActive: true, polygonGeoJson: makePolygonGeoJson(flData.latitude, flData.longitude), boundaryArea: flData.totalLandHolding, geoCenterLat: flData.latitude, geoCenterLng: flData.longitude } as any })
      console.log(`  ✅ FarmLand ${key}`)
    } else {
      flRecords[fld.key] = existing
    }
  }

  // ═══ 8. Entity Relationships ═══
  const relDefs = [
    { from: 'metrang-coffee', to: 'cooxupe', type: 'export' },
    { from: 'yirgacheffe-union', to: 'cooxupe', type: 'export' },
    { from: 'othaya-cooperative', to: 'cooxupe', type: 'export' },
    { from: 'asunafo-export', to: 'cooxupe', type: 'export' },
    { from: 'nkusi-coffee', to: 'cooxupe', type: 'export' },
  ]
  for (const rd of relDefs) {
    const fromId = tenants[rd.from].id
    const toId = tenants[rd.to].id
    await db.entityRelationship.upsert({
      where: { fromEntityId_toEntityId_relationshipType: { fromEntityId: fromId, toEntityId: toId, relationshipType: rd.type } },
      update: { status: 'active' },
      create: { fromEntityId: fromId, toEntityId: toId, relationshipType: rd.type, status: 'active', startDate: new Date() },
    })
  }
  console.log('  ✅ EntityRelationships')

  // ═══ 9. EUDR Compliance for each producer ═══
  const eudrDefs = [
    { tenantId: vnTid, complianceId: 'EUDR-VN-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-VN-001', flKey: 'VN-PLT-001' },
    { tenantId: vnTid, complianceId: 'EUDR-VN-2024-002', status: 'in_review', riskLevel: 'medium', farmerCode: 'FRM-VN-002', flKey: 'VN-PLT-002' },
    { tenantId: brTid, complianceId: 'EUDR-BR-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-BR-001', flKey: 'BR-PLT-001' },
    { tenantId: etTid, complianceId: 'EUDR-ET-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-ET-001', flKey: 'ET-PLT-001' },
    { tenantId: keTid, complianceId: 'EUDR-KE-2024-001', status: 'pending', riskLevel: 'medium', farmerCode: 'FRM-KE-001', flKey: 'KE-PLT-001' },
    // Ghana EUDR records
    { tenantId: ghTid, complianceId: 'EUDR-GH-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-GH-001', flKey: 'GH-PLT-001' },
    { tenantId: ghTid, complianceId: 'EUDR-GH-2024-002', status: 'in_review', riskLevel: 'medium', farmerCode: 'FRM-GH-002', flKey: 'GH-PLT-002' },
    // Uganda EUDR records
    { tenantId: ugTid, complianceId: 'EUDR-UG-2024-001', status: 'compliant', riskLevel: 'low', farmerCode: 'FRM-UG-001', flKey: 'UG-PLT-001' },
    { tenantId: ugTid, complianceId: 'EUDR-UG-2024-002', status: 'pending', riskLevel: 'medium', farmerCode: 'FRM-UG-002', flKey: 'UG-PLT-002' },
  ]
  for (const ed of eudrDefs) {
    const existing = await db.eudrCompliance.findUnique({ where: { tenantId_complianceId: { tenantId: ed.tenantId, complianceId: ed.complianceId } } })
    if (!existing && farmerRecords[ed.farmerCode] && flRecords[ed.flKey]) {
      const eudrAdminId = ed.tenantId === vnTid ? vnAdmin.id : ed.tenantId === brTid ? brAdmin.id : ed.tenantId === etTid ? etAdmin.id : ed.tenantId === keTid ? keAdmin.id : ed.tenantId === ghTid ? ghAdmin.id : ugAdmin.id
      await db.eudrCompliance.create({ data: { tenantId: ed.tenantId, complianceId: ed.complianceId, status: ed.status, riskLevel: ed.riskLevel, farmerId: farmerRecords[ed.farmerCode].id, farmLandId: flRecords[ed.flKey].id, createdBy: eudrAdminId, geolocationLat: farmerRecords[ed.farmerCode].latitude, geolocationLng: farmerRecords[ed.farmerCode].longitude, validFrom: new Date('2024-01-01'), validUntil: new Date('2025-12-31'), isActive: true } as any })
    }
  }
  console.log('  ✅ EUDR Compliance')

  // ═══ 10. Price Tickers (platform-level, managed by super admin) ═══
  const tickerDefs = [
    { commodity: 'Robusta Coffee', price: 4.28, currency: 'USD', change: 0.12, changePercent: 2.88, unit: 'per lb', source: 'ICE Futures Europe', high52w: 5.14, low52w: 3.42, isActive: true },
    { commodity: 'Arabica Coffee', price: 7.82, currency: 'USD', change: -0.15, changePercent: -1.88, unit: 'per lb', source: 'ICE Futures US', high52w: 9.45, low52w: 5.90, isActive: true },
    { commodity: 'C-Price ICE', price: 392.50, currency: 'USc', change: 3.20, changePercent: 0.82, unit: 'per lb', source: 'ICE Futures', high52w: 445.00, low52w: 310.00, isActive: true },
    { commodity: 'Vietnam Robusta (Liffe)', price: 3845, currency: 'USD', change: 28, changePercent: 0.73, unit: 'per tonne', source: 'LIFFE/Euronext', high52w: 4250, low52w: 2980, isActive: true },
    { commodity: 'Brazil Natural (NY)', price: 410.25, currency: 'USc', change: -2.50, changePercent: -0.61, unit: 'per lb', source: 'ICE Futures US', high52w: 460.00, low52w: 325.00, isActive: true },
    { commodity: 'Colombian Milds', price: 435.80, currency: 'USc', change: 1.40, changePercent: 0.32, unit: 'per lb', source: 'ICE Futures US', high52w: 490.00, low52w: 355.00, isActive: false },
  ]
  for (const td of tickerDefs) {
    const existing = await db.priceTicker.findFirst({ where: { commodity: td.commodity } })
    if (!existing) {
      await db.priceTicker.create({ data: td })
      console.log(`  ✅ Ticker: ${td.commodity}`)
    } else {
      console.log(`  ℹ️  Ticker ${td.commodity} exists`)
    }
  }
  console.log('  ✅ Price Tickers')

  // ═══ DONE ═══
  console.log('\n🌱 Seed complete! Summary:')
  console.log(`  Tenants: ${Object.keys(tenants).length}`)
  console.log(`  Users: ${Object.keys(users).length}`)
  console.log(`  Farmers: ${Object.keys(farmerRecords).length}`)
  console.log(`  FarmLands: ${Object.keys(flRecords).length}`)
  console.log(`  Price Tickers: ${tickerDefs.length}`)
  console.log('\n  Login credentials: <email>@<tenant-slug>.terrabrew.com / Admin@2024\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())

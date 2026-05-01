import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const db = new PrismaClient({
  log: ['warn', 'error'],
})

function computeDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}
function computeBlockHash(dataHash: string, previousHash: string, timestamp: string): string {
  return crypto.createHash('sha256').update(dataHash + previousHash + timestamp).digest('hex')
}
function uid(): string { return Math.random().toString(36).substring(2, 8).toUpperCase() }

// Helper: create a polygon GeoJSON around a center point (roughly ~200m x 200m farm)
function makePolygonGeoJson(centerLat: number, centerLng: number): string {
  const dLat = 0.0009  // ~100m
  const dLng = 0.0011  // ~120m
  const coords = [
    [centerLng - dLng, centerLat - dLat],
    [centerLng + dLng, centerLat - dLat],
    [centerLng + dLng, centerLat + dLat],
    [centerLng - dLng, centerLat + dLat],
    [centerLng - dLng, centerLat - dLat], // close the polygon
  ]
  return JSON.stringify({ type: 'Polygon', coordinates: [coords] })
}

async function main() {
  console.log('\n🌱 Seeding Terra Brew database (Enhanced E2E Pipeline)...\n')

  try {
    // ═══════════════════════════════════════════════════
    // 1. Platform Super Admin
    // ═══════════════════════════════════════════════════
    const platformEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@terrabrew.platform'
    const existingPlatform = await db.platformUser.findUnique({ where: { email: platformEmail } })
    if (!existingPlatform) {
      const hash = await bcrypt.hash('Admin@2024', 12)
      await db.platformUser.create({ data: { email: platformEmail, passwordHash: hash, name: 'Platform Admin', role: 'super_admin' } })
      console.log('  ✅ Platform super admin created')
    } else {
      console.log('  ℹ️  Platform super admin already exists')
    }

    // ═══════════════════════════════════════════════════
    // 2. Modules
    // ═══════════════════════════════════════════════════
    const moduleDefs = [
      { slug: 'farmers', name: 'Farmer Management', category: 'core', icon: 'Users', color: '#059669' },
      { slug: 'farmlands', name: 'Farm Land Management', category: 'core', icon: 'MapPin', color: '#d97706' },
      { slug: 'cultivations', name: 'Cultivation Management', category: 'core', icon: 'Sprout', color: '#2563eb' },
      { slug: 'nurseries', name: 'Nursery Management', category: 'core', icon: 'TreePine', color: '#7c3aed' },
      { slug: 'land-preparations', name: 'Land Preparation', category: 'core', icon: 'Tractor', color: '#0891b2' },
      { slug: 'crop-monitorings', name: 'Crop Monitoring & Alerts', category: 'core', icon: 'Activity', color: '#db2777' },
      { slug: 'fertilizer-apps', name: 'Fertilizer Management', category: 'core', icon: 'FlaskConical', color: '#65a30d' },
      { slug: 'pest-disease-mgmts', name: 'Pest & Disease Management', category: 'core', icon: 'Shield', color: '#dc2626' },
      { slug: 'harvest-traceabilities', name: 'Harvest Traceability', category: 'core', icon: 'Wheat', color: '#b45309' },
      { slug: 'procurement', name: 'Procurement & Collection', category: 'premium', icon: 'Truck', color: '#4f46e5' },
      { slug: 'processing', name: 'Processing Pipeline', category: 'premium', icon: 'Factory', color: '#0d9488' },
      { slug: 'cert-assessments', name: 'Certification Assessment', category: 'compliance', icon: 'Award', color: '#be185d' },
      { slug: 'coffee-inspections', name: 'Coffee Inspection & Audit', category: 'compliance', icon: 'ClipboardCheck', color: '#9333ea' },
      { slug: 'smart-contracts', name: 'Smart Contracts', category: 'premium', icon: 'FileText', color: '#0369a1' },
      { slug: 'marketplace', name: 'Marketplace & Sales', category: 'premium', icon: 'Store', color: '#ea580c' },
    ]
    for (const mod of moduleDefs) {
      await db.module.upsert({ where: { slug: mod.slug }, update: mod, create: mod })
    }
    console.log('  ✅ Modules created/updated')

    // ═══════════════════════════════════════════════════
    // 3. Tenant
    // ═══════════════════════════════════════════════════
    const tenantSlug = 'metrang-coffee'
    let tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } })

    if (!tenant) {
      tenant = await db.tenant.create({
        data: {
          slug: tenantSlug, name: 'Metrang Coffee', legalName: 'Công ty TNHH Metrang Coffee',
          currency: 'VND', currencySymbol: '₫', language: 'vi', timezone: 'Asia/Ho_Chi_Minh',
          dateFormat: 'DD/MM/YYYY', country: 'VN', eudrCompliant: true,
          certifications: JSON.stringify(['Organic', 'Fair Trade', 'UTZ']),
          plan: 'professional', maxUsers: 25, maxFarmers: 1000,
          enabledModules: JSON.stringify(Object.fromEntries(moduleDefs.map(m => [m.slug, true]))),
        },
      })
      console.log('  ✅ Tenant created')
    } else {
      console.log('  ℹ️  Tenant already exists')
    }

    // ═══════════════════════════════════════════════════
    // 4. Tenant Admin
    // ═══════════════════════════════════════════════════
    const adminEmail = `admin@${tenantSlug}.terrabrew.com`
    let adminUser = await db.user.findUnique({ where: { email_tenantId: { email: adminEmail, tenantId: tenant.id } } })
    if (!adminUser) {
      const adminHash = await bcrypt.hash('Admin@2024', 12)
      adminUser = await db.user.create({
        data: { email: adminEmail, passwordHash: adminHash, name: 'Quản trị viên Metrang', role: 'tenant_admin', tenantId: tenant.id },
      })
      console.log('  ✅ Tenant admin created')
    } else {
      console.log('  ℹ️  Tenant admin already exists')
    }

    const BATCH_PREFIX = 'TB'
    const batchId1 = `${BATCH_PREFIX}-BATCH-2024-001`
    const batchId2 = `${BATCH_PREFIX}-BATCH-2024-002`

    // ═══════════════════════════════════════════════════
    // 5. Farmers (5 total: 3 Vietnam, 1 Ethiopia, 1 Kenya)
    // ═══════════════════════════════════════════════════
    const farmerData = [
      {
        lookup: { farmerCode: 'FRM-VN-001' },
        data: {
          tenantId: tenant.id, createdBy: adminUser.id,
          farmerCode: 'FRM-VN-001', enrollmentPlace: 'Tại nhà nông dân',
          isCertified: true, certificationType: 'Cá nhân', yearOfICS: '2022', cooperative: 'Hợp tác xã Cà phê Ea Tam',
          fullName: 'Nguyễn Văn Thanh', firstName: 'Thanh', lastName: 'Nguyễn',
          contactNumber: '0912345678', gender: 'Nam', dob: new Date('1985-03-15'),
          education: 'Trung học', maritalStatus: 'Đã kết hôn', spouseName: 'Trần Thị Mai',
          noOfFamilyMembers: 4, country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar',
          commune: 'Ea Tam', village: "Buôn K'Mang", zipCode: '630000',
          latitude: 12.668, longitude: 108.038, housingOwnership: 'Sở hữu', houseType: 'Nhà gạch',
          smartphoneOwnership: true, loanTaken: false, nationalIdType: 'CCCD', nationalIdNo: '795284610382',
          lifeInsurance: true, healthInsurance: true, creditScore: 82, yearsOfFarmingExperience: 12, isActive: true,
        },
      },
      {
        lookup: { farmerCode: 'FRM-VN-002' },
        data: {
          tenantId: tenant.id, createdBy: adminUser.id,
          farmerCode: 'FRM-VN-002', enrollmentPlace: 'Văn phòng HTX',
          isCertified: true, certificationType: 'Tập thể', yearOfICS: '2023', cooperative: 'Nông trại Hữu cơ Ea Drăng',
          fullName: 'Trần Thị Hoa', firstName: 'Hoa', lastName: 'Trần',
          contactNumber: '0923456789', gender: 'Nữ', dob: new Date('1990-07-22'),
          education: 'Tiểu học', maritalStatus: 'Đã kết hôn', spouseName: 'Lê Văn Đức',
          noOfFamilyMembers: 5, country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar',
          commune: 'Ea Drăng', village: 'Ea Pok', zipCode: '630000',
          latitude: 12.692, longitude: 108.055, housingOwnership: 'Thuê', houseType: 'Nhà gỗ',
          smartphoneOwnership: true, loanTaken: true, loanTakenFrom: 'Vietcombank', loanAmount: 30000000,
          loanPurpose: 'Mở rộng nông trại', loanInterest: 7.5, loanSecurity: true, nationalIdType: 'CCCD',
          nationalIdNo: '794827364518', cropInsurance: true, healthInsurance: true, creditScore: 76,
          yearsOfFarmingExperience: 8, gapTrainingAttended: true, isActive: true,
        },
      },
      {
        lookup: { farmerCode: 'FRM-VN-003' },
        data: {
          tenantId: tenant.id, createdBy: adminUser.id,
          farmerCode: 'FRM-VN-003', enrollmentPlace: 'Trạm khuyến nông',
          isCertified: true, certificationType: 'Cá nhân', yearOfICS: '2021', cooperative: 'Hợp tác xã Cà phê M\'Drak',
          fullName: 'Lê Văn Minh', firstName: 'Minh', lastName: 'Lê',
          contactNumber: '0934567890', gender: 'Nam', dob: new Date('1978-11-08'),
          education: 'Đại học', maritalStatus: 'Đã kết hôn', spouseName: 'Phạm Thị Ngọc',
          noOfFamilyMembers: 3, country: 'Việt Nam', province: 'Đắk Lắk', district: 'M\'Drak',
          commune: 'M\'Drak', village: 'Buôn Jol', zipCode: '630000',
          latitude: 12.695, longitude: 108.050, housingOwnership: 'Sở hữu', houseType: 'Nhà gạch 2 tầng',
          smartphoneOwnership: true, loanTaken: false, nationalIdType: 'CCCD', nationalIdNo: '796135820497',
          lifeInsurance: true, healthInsurance: true, creditScore: 90, yearsOfFarmingExperience: 18, isActive: true,
        },
      },
      {
        lookup: { farmerCode: 'FRM-ET-001' },
        data: {
          tenantId: tenant.id, createdBy: adminUser.id,
          farmerCode: 'FRM-ET-001', enrollmentPlace: 'Yirgacheffe Cooperative Union',
          isCertified: true, certificationType: 'Tập thể', yearOfICS: '2020', cooperative: 'Yirgacheffe Cooperative Union',
          fullName: 'Abebe Tadesse', firstName: 'Abebe', lastName: 'Tadesse',
          contactNumber: '+251912345678', gender: 'Nam', dob: new Date('1982-05-20'),
          education: 'Trung học', maritalStatus: 'Đã kết hôn', spouseName: 'Mekdes Abebe',
          noOfFamilyMembers: 6, country: 'Ethiopia', province: 'Gedeo', district: 'Yirgacheffe',
          commune: 'Kochere', village: 'Biloya', zipCode: '1000',
          latitude: 6.162, longitude: 38.202, housingOwnership: 'Sở hữu', houseType: 'Nhà đất',
          smartphoneOwnership: true, loanTaken: false, nationalIdType: 'Kebele ID', nationalIdNo: 'ET-YG-4582',
          lifeInsurance: false, healthInsurance: true, creditScore: 78, yearsOfFarmingExperience: 15, gapTrainingAttended: true, isActive: true,
        },
      },
      {
        lookup: { farmerCode: 'FRM-KE-001' },
        data: {
          tenantId: tenant.id, createdBy: adminUser.id,
          farmerCode: 'FRM-KE-001', enrollmentPlace: 'Nyeri County Agriculture Office',
          isCertified: true, certificationType: 'Cá nhân', yearOfICS: '2022', cooperative: 'Othaya Farmers Cooperative Society',
          fullName: 'Kamau Ndirangu', firstName: 'Kamau', lastName: 'Ndirangu',
          contactNumber: '+254723456789', gender: 'Nam', dob: new Date('1988-09-12'),
          education: 'Đại học', maritalStatus: 'Đã kết hôn', spouseName: 'Wanjiku Kamau',
          noOfFamilyMembers: 4, country: 'Kenya', province: 'Central', district: 'Nyeri',
          commune: 'Othaya', village: 'Gathaithi', zipCode: '10100',
          latitude: -0.420, longitude: 36.951, housingOwnership: 'Sở hữu', houseType: 'Nhà đá',
          smartphoneOwnership: true, loanTaken: true, loanTakenFrom: 'Kenya Commercial Bank', loanAmount: 500000,
          loanPurpose: 'Expand processing facility', loanInterest: 12.0, loanSecurity: true, nationalIdType: 'National ID',
          nationalIdNo: 'KE-28473950', cropInsurance: true, healthInsurance: true, creditScore: 85,
          yearsOfFarmingExperience: 10, gapTrainingAttended: true, isActive: true,
        },
      },
    ]

    const farmers: Record<string, any> = {}
    for (const fd of farmerData) {
      const existing = await db.farmer.findUnique({ where: { farmerCode_tenantId: { farmerCode: fd.lookup.farmerCode, tenantId: tenant.id } } })
      if (!existing) {
        const created = await db.farmer.create({ data: fd.data as any })
        farmers[fd.lookup.farmerCode] = created
        console.log(`  ✅ Farmer ${fd.lookup.farmerCode}: ${fd.data.fullName} created`)
      } else {
        farmers[fd.lookup.farmerCode] = existing
        console.log(`  ℹ️  Farmer ${fd.lookup.farmerCode}: ${existing.fullName} already exists`)
      }
    }

    const farmer1 = farmers['FRM-VN-001'] // Nguyễn Văn Thanh
    const farmer2 = farmers['FRM-VN-002'] // Trần Thị Hoa
    const farmer3 = farmers['FRM-VN-003'] // Lê Văn Minh
    const farmer4 = farmers['FRM-ET-001'] // Abebe Tadesse
    const farmer5 = farmers['FRM-KE-001'] // Kamau Ndirangu

    // ═══════════════════════════════════════════════════
    // 6. Farm Lands (with polygon GeoJSON)
    // ═══════════════════════════════════════════════════
    const farmLandData = [
      {
        lookup: { plotBlockId: 'TB-PLT-001' },
        data: {
          tenantId: tenant.id, farmerId: farmer1.id, createdBy: adminUser.id,
          farmName: "Nông trại Tây Nguyên Thanh", plotBlockId: 'TB-PLT-001',
          totalLandHolding: 2.5, altitude: 850, agroEcologicalZone: 'Tây Nguyên',
          latitude: 12.668, longitude: 108.038, landOwnership: 'Sở hữu', soilType: 'Ferralitic',
          irrigationSource: 'Tưới tiêu', irrigationType: 'Nhỏ giọt', noOfTrees: 2800,
          shadeTreeSpecies: 'Đậu cô nong, Keo dậu', shadeTreeDensity: 400,
          fullTimeWorkers: 2, partTimeWorkers: 1, seasonalWorkers: 3, familyWorkers: 2,
          childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
          estYield: 3500, conversionCertType: 'Hữu cơ', currentConversionStatus: 'Đã chứng nhận',
          fertilityStatus: 'Tốt', waterSource: 'Giếng khoan', powerSource: 'Điện lưới',
          polygonGeoJson: makePolygonGeoJson(12.668, 108.038),
          boundaryArea: 2.5, geoCenterLat: 12.668, geoCenterLng: 108.038,
          isActive: true,
        },
      },
      {
        lookup: { plotBlockId: 'TB-PLT-002' },
        data: {
          tenantId: tenant.id, farmerId: farmer2.id, createdBy: adminUser.id,
          farmName: "Vườn Hữu cơ Hoa", plotBlockId: 'TB-PLT-002',
          totalLandHolding: 1.8, altitude: 920, agroEcologicalZone: 'Tây Nguyên',
          latitude: 12.692, longitude: 108.055, landOwnership: 'Thuê', soilType: 'Núi lửa',
          irrigationSource: 'Tự nhiên', irrigationType: 'Phun mưa', noOfTrees: 2000,
          shadeTreeSpecies: 'Gliricidia, Inga', shadeTreeDensity: 350,
          fullTimeWorkers: 1, partTimeWorkers: 2, seasonalWorkers: 4, familyWorkers: 3,
          childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
          estYield: 2800, conversionCertType: 'Hữu cơ + Thương mại Công bằng',
          currentConversionStatus: 'Đã chứng nhận', fertilityStatus: 'Rất tốt', waterSource: 'Sông',
          powerSource: 'Điện mặt trời + Lưới',
          polygonGeoJson: makePolygonGeoJson(12.692, 108.055),
          boundaryArea: 1.8, geoCenterLat: 12.692, geoCenterLng: 108.055,
          isActive: true,
        },
      },
      {
        lookup: { plotBlockId: 'TB-PLT-003' },
        data: {
          tenantId: tenant.id, farmerId: farmer3.id, createdBy: adminUser.id,
          farmName: "Nông trại M'Drak Minh", plotBlockId: 'TB-PLT-003',
          totalLandHolding: 3.2, altitude: 780, agroEcologicalZone: 'Tây Nguyên',
          latitude: 12.695, longitude: 108.050, landOwnership: 'Sở hữu', soilType: 'Đất đỏ Bazan',
          irrigationSource: 'Tưới tiêu', irrigationType: 'Nhỏ giọt', noOfTrees: 3500,
          shadeTreeSpecies: 'Tràm, Keo lá tròn', shadeTreeDensity: 300,
          fullTimeWorkers: 3, partTimeWorkers: 1, seasonalWorkers: 5, familyWorkers: 1,
          childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
          estYield: 4200, conversionCertType: 'UTZ', currentConversionStatus: 'Đã chứng nhận',
          fertilityStatus: 'Tốt', waterSource: 'Hồ chứa', powerSource: 'Điện lưới',
          polygonGeoJson: makePolygonGeoJson(12.695, 108.050),
          boundaryArea: 3.2, geoCenterLat: 12.695, geoCenterLng: 108.050,
          isActive: true,
        },
      },
      {
        lookup: { plotBlockId: 'TB-PLT-004' },
        data: {
          tenantId: tenant.id, farmerId: farmer4.id, createdBy: adminUser.id,
          farmName: "Yirgacheffe Biloya Garden", plotBlockId: 'TB-PLT-004',
          totalLandHolding: 1.5, altitude: 1850, agroEcologicalZone: 'Ethiopian Highlands',
          latitude: 6.162, longitude: 38.202, landOwnership: 'Sở hữu', soilType: 'Nitisol',
          irrigationSource: 'Tự nhiên', irrigationType: 'Mưa', noOfTrees: 1800,
          shadeTreeSpecies: 'Ficus, Cordia africana', shadeTreeDensity: 500,
          fullTimeWorkers: 2, partTimeWorkers: 0, seasonalWorkers: 6, familyWorkers: 4,
          childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
          estYield: 2200, conversionCertType: 'Hữu cơ + Fair Trade', currentConversionStatus: 'Đã chứng nhận',
          fertilityStatus: 'Tốt', waterSource: 'Mưa', powerSource: 'Mặt trời',
          polygonGeoJson: makePolygonGeoJson(6.162, 38.202),
          boundaryArea: 1.5, geoCenterLat: 6.162, geoCenterLng: 38.202,
          isActive: true,
        },
      },
      {
        lookup: { plotBlockId: 'TB-PLT-005' },
        data: {
          tenantId: tenant.id, farmerId: farmer5.id, createdBy: adminUser.id,
          farmName: "Gathaithi Estate Nyeri", plotBlockId: 'TB-PLT-005',
          totalLandHolding: 2.0, altitude: 1680, agroEcologicalZone: 'Kenya Highlands',
          latitude: -0.420, longitude: 36.951, landOwnership: 'Sở hữu', soilType: 'Volcanic Loam',
          irrigationSource: 'Tưới tiêu', irrigationType: 'Nhỏ giọt', noOfTrees: 2200,
          shadeTreeSpecies: 'Gravelia, Croton', shadeTreeDensity: 350,
          fullTimeWorkers: 2, partTimeWorkers: 1, seasonalWorkers: 4, familyWorkers: 2,
          childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
          estYield: 2600, conversionCertType: 'Fair Trade + Rainforest Alliance', currentConversionStatus: 'Đã chứng nhận',
          fertilityStatus: 'Rất tốt', waterSource: 'Sông Chania', powerSource: 'Điện lưới + Mặt trời',
          polygonGeoJson: makePolygonGeoJson(-0.420, 36.951),
          boundaryArea: 2.0, geoCenterLat: -0.420, geoCenterLng: 36.951,
          isActive: true,
        },
      },
    ]

    const farmLands: Record<string, any> = {}
    for (const fld of farmLandData) {
      const existing = await db.farmLand.findFirst({ where: { tenantId: tenant.id, plotBlockId: fld.lookup.plotBlockId } })
      if (!existing) {
        const created = await db.farmLand.create({ data: fld.data as any })
        farmLands[fld.lookup.plotBlockId] = created
        console.log(`  ✅ FarmLand ${fld.lookup.plotBlockId}: ${fld.data.farmName} created`)
      } else {
        farmLands[fld.lookup.plotBlockId] = existing
        // Update polygon data if missing
        if (!existing.polygonGeoJson) {
          await db.farmLand.update({ where: { id: existing.id }, data: { polygonGeoJson: fld.data.polygonGeoJson, boundaryArea: fld.data.boundaryArea, geoCenterLat: fld.data.geoCenterLat, geoCenterLng: fld.data.geoCenterLng } })
          console.log(`  ✅ FarmLand ${fld.lookup.plotBlockId}: Updated polygon GeoJSON`)
        } else {
          console.log(`  ℹ️  FarmLand ${fld.lookup.plotBlockId}: ${existing.farmName} already exists`)
        }
      }
    }

    const farmLand1 = farmLands['TB-PLT-001']
    const farmLand2 = farmLands['TB-PLT-002']
    const farmLand3 = farmLands['TB-PLT-003']
    const farmLand4 = farmLands['TB-PLT-004']
    const farmLand5 = farmLands['TB-PLT-005']

    // ═══════════════════════════════════════════════════
    // 7. Cultivations (with intercropping data)
    // ═══════════════════════════════════════════════════
    const cultivationRecords: Record<string, any> = {}

    // Cultivation 1: Farmer 1 - Robusta with Pepper intercropping
    let cultivation1 = await db.cultivation.findFirst({ where: { tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, farmPlotName: 'Lô Robusta A1' } })
    if (!cultivation1) {
      cultivation1 = await db.cultivation.create({ data: {
        tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id,
        farmPlotName: 'Lô Robusta A1', plotBlockId: 'TB-PLT-001-A1', cropCategory: 'Vụ chính',
        intercroppingSpecies: 'Tiêu, Bơ', harvestSeason: 'Tháng 11/2024 - Tháng 1/2025',
        cultivatedCrop: 'Cà phê Robusta', cropVariety: 'Chari', coffeeSpecies: 'Coffea canephora',
        cultivationArea: 2.0, plantingSpacing: 3.0, treeDensity: 1400, sowingDate: new Date('2020-06-15'),
        estYield: '3500 kg/ha', intendedProcessingMethod: 'Rửa', irrigationMethod: 'Nhỏ giọt', shadeCover: 25,
        latitude: 12.668, longitude: 108.038, seedSource: 'Tự giữ (cây giống chứng nhận)',
        isSeedTreated: true, treatmentDetails: 'Phủ Trichoderma', seedType: 'Chứng nhận 1',
        seedQuantity: 3000, seedPrice: 5000, seedCost: 15000000,
        intercroppingEnabled: true, intercroppingPartner: 'Tiêu (Pepper)', intercroppingRatio: '3:1',
        intercroppingScheme: 'row-planting', isPrimaryCrop: true,
        isActive: true,
      }})
      console.log('  ✅ Cultivation 1 (Robusta + Pepper intercropping) created')
    } else {
      // Update with intercropping if missing
      if (!cultivation1.intercroppingEnabled) {
        cultivation1 = await db.cultivation.update({ where: { id: cultivation1.id }, data: { intercroppingEnabled: true, intercroppingPartner: 'Tiêu (Pepper)', intercroppingRatio: '3:1', intercroppingScheme: 'row-planting', isPrimaryCrop: true } })
        console.log('  ✅ Cultivation 1: Updated intercropping data')
      } else {
        console.log('  ℹ️  Cultivation 1 already exists')
      }
    }
    cultivationRecords['c1'] = cultivation1

    // Cultivation 2: Farmer 2 - Arabica with Durian intercropping
    let cultivation2 = await db.cultivation.findFirst({ where: { tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, farmPlotName: 'Lô Arabica B1' } })
    if (!cultivation2) {
      cultivation2 = await db.cultivation.create({ data: {
        tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id,
        farmPlotName: 'Lô Arabica B1', plotBlockId: 'TB-PLT-002-B1', cropCategory: 'Vụ chính',
        intercroppingSpecies: 'Chuối, Macadamia', harvestSeason: 'Tháng 10/2024 - Tháng 12/2024',
        cultivatedCrop: 'Cà phê Arabica', cropVariety: 'Catimor', coffeeSpecies: 'Coffea arabica',
        cultivationArea: 1.5, plantingSpacing: 2.5, treeDensity: 1600, sowingDate: new Date('2019-09-10'),
        estYield: '2800 kg/ha', intendedProcessingMethod: 'Tự nhiên', irrigationMethod: 'Phun mưa', shadeCover: 30,
        latitude: 12.692, longitude: 108.055, seedSource: 'Vườn ươm - Trung tâm giống Ea Drăng',
        isSeedTreated: true, seedType: 'Cải tiến', seedQuantity: 2400, seedPrice: 8000, seedCost: 19200000,
        intercroppingEnabled: true, intercroppingPartner: 'Sầu riêng (Durian)', intercroppingRatio: '5:1',
        intercroppingScheme: 'mixed-planting', isPrimaryCrop: true,
        isActive: true,
      }})
      console.log('  ✅ Cultivation 2 (Arabica + Durian intercropping) created')
    } else {
      if (!cultivation2.intercroppingEnabled) {
        cultivation2 = await db.cultivation.update({ where: { id: cultivation2.id }, data: { intercroppingEnabled: true, intercroppingPartner: 'Sầu riêng (Durian)', intercroppingRatio: '5:1', intercroppingScheme: 'mixed-planting', isPrimaryCrop: true } })
        console.log('  ✅ Cultivation 2: Updated intercropping data')
      } else {
        console.log('  ℹ️  Cultivation 2 already exists')
      }
    }
    cultivationRecords['c2'] = cultivation2

    // Cultivation 3: Farmer 3 - Robusta (monoculture, high density)
    let cultivation3 = await db.cultivation.findFirst({ where: { tenantId: tenant.id, farmerId: farmer3.id, farmLandId: farmLand3.id, farmPlotName: 'Lô Robusta C1' } })
    if (!cultivation3) {
      cultivation3 = await db.cultivation.create({ data: {
        tenantId: tenant.id, farmerId: farmer3.id, farmLandId: farmLand3.id, createdBy: adminUser.id,
        farmPlotName: 'Lô Robusta C1', plotBlockId: 'TB-PLT-003-C1', cropCategory: 'Vụ chính',
        intercroppingSpecies: null, harvestSeason: 'Tháng 11/2024 - Tháng 2/2025',
        cultivatedCrop: 'Cà phê Robusta', cropVariety: 'TR4', coffeeSpecies: 'Coffea canephora',
        cultivationArea: 3.0, plantingSpacing: 3.0, treeDensity: 1200, sowingDate: new Date('2018-03-20'),
        estYield: '4200 kg/ha', intendedProcessingMethod: 'Tự nhiên', irrigationMethod: 'Nhỏ giọt', shadeCover: 20,
        latitude: 12.695, longitude: 108.050, seedSource: 'Viện Khoa học Tây Nguyên',
        isSeedTreated: true, treatmentDetails: 'Xử lý nấm bằng Carbendazim', seedType: 'Chứng nhận 1',
        seedQuantity: 3600, seedPrice: 4500, seedCost: 16200000,
        intercroppingEnabled: false, isPrimaryCrop: true,
        isActive: true,
      }})
      console.log('  ✅ Cultivation 3 (Robusta monoculture) created')
    } else {
      console.log('  ℹ️  Cultivation 3 already exists')
    }
    cultivationRecords['c3'] = cultivation3

    // Cultivation 4: Farmer 4 (Ethiopia) - Heirloom Arabica (garden coffee)
    let cultivation4 = await db.cultivation.findFirst({ where: { tenantId: tenant.id, farmerId: farmer4.id, farmLandId: farmLand4.id, farmPlotName: 'Yirgacheffe Heirloom Plot' } })
    if (!cultivation4) {
      cultivation4 = await db.cultivation.create({ data: {
        tenantId: tenant.id, farmerId: farmer4.id, farmLandId: farmLand4.id, createdBy: adminUser.id,
        farmPlotName: 'Yirgacheffe Heirloom Plot', plotBlockId: 'TB-PLT-004-D1', cropCategory: 'Main Crop',
        intercroppingSpecies: 'Enset, Chat', harvestSeason: 'October 2024 - January 2025',
        cultivatedCrop: 'Ethiopian Heirloom', cropVariety: 'Heirloom', coffeeSpecies: 'Coffea arabica',
        cultivationArea: 1.2, plantingSpacing: 2.0, treeDensity: 1500, sowingDate: new Date('2015-04-01'),
        estYield: '1800 kg/ha', intendedProcessingMethod: 'Washed', irrigationMethod: 'Rain-fed', shadeCover: 45,
        latitude: 6.162, longitude: 38.202, seedSource: 'Local heirloom seed selection',
        isSeedTreated: false, seedType: 'Heirloom',
        seedQuantity: 1800, seedPrice: 0, seedCost: 0,
        intercroppingEnabled: true, intercroppingPartner: 'Enset (Ethiopian banana)', intercroppingRatio: '4:1',
        intercroppingScheme: 'mixed-planting', isPrimaryCrop: true,
        isActive: true,
      }})
      console.log('  ✅ Cultivation 4 (Ethiopian Heirloom + Enset) created')
    } else {
      console.log('  ℹ️  Cultivation 4 already exists')
    }
    cultivationRecords['c4'] = cultivation4

    // Cultivation 5: Farmer 5 (Kenya) - SL28 Arabica
    let cultivation5 = await db.cultivation.findFirst({ where: { tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, farmPlotName: 'Nyeri SL28 Plot' } })
    if (!cultivation5) {
      cultivation5 = await db.cultivation.create({ data: {
        tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, createdBy: adminUser.id,
        farmPlotName: 'Nyeri SL28 Plot', plotBlockId: 'TB-PLT-005-E1', cropCategory: 'Main Crop',
        intercroppingSpecies: 'Macadamia', harvestSeason: 'October 2024 - December 2024',
        cultivatedCrop: 'Kenya Arabica', cropVariety: 'SL28', coffeeSpecies: 'Coffea arabica',
        cultivationArea: 1.8, plantingSpacing: 2.5, treeDensity: 1200, sowingDate: new Date('2016-10-15'),
        estYield: '2400 kg/ha', intendedProcessingMethod: 'Washed', irrigationMethod: 'Drip', shadeCover: 35,
        latitude: -0.420, longitude: 36.951, seedSource: 'Scott Laboratories, Kenya',
        isSeedTreated: true, treatmentDetails: 'Copper-based fungicide treatment', seedType: 'Certified',
        seedQuantity: 2160, seedPrice: 1200, seedCost: 2592000,
        intercroppingEnabled: true, intercroppingPartner: 'Macadamia', intercroppingRatio: '6:1',
        intercroppingScheme: 'row-planting', isPrimaryCrop: true,
        isActive: true,
      }})
      console.log('  ✅ Cultivation 5 (Kenya SL28 + Macadamia) created')
    } else {
      console.log('  ℹ️  Cultivation 5 already exists')
    }
    cultivationRecords['c5'] = cultivation5

    console.log('  ✅ All cultivations ready')

    // ═══════════════════════════════════════════════════
    // 8. Nurseries
    // ═══════════════════════════════════════════════════
    const nurseryDefs = [
      { code: 'NS-EATAM-001', data: { tenantId: tenant.id, farmerId: farmer1.id, createdBy: adminUser.id, nurseryName: 'Vườn ươm Ea Tam', nurseryCode: 'NS-EATAM-001', location: 'Ea Tam, Cư Mgar, Đắk Lắk', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tam', latitude: 12.670, longitude: 108.040, nurseryType: 'Hạt giống', capacity: 50000, currentStock: 35000, species: 'Coffea canephora', variety: 'Chari', seedSource: 'Vườn giống chứng nhận Ea Drăng', plantingDate: new Date('2024-06-01'), expectedReadyDate: new Date('2024-12-01'), germinationRate: 92.5, survivalRate: 88.0, healthStatus: 'Tốt', notes: 'Cây giống Robusta Chari thế hệ F1', isActive: true } },
      { code: 'NS-EADRANG-001', data: { tenantId: tenant.id, farmerId: farmer2.id, createdBy: adminUser.id, nurseryName: 'Vườn ươm Hữu cơ Ea Drăng', nurseryCode: 'NS-EADRANG-001', location: 'Ea Drăng, Cư Mgar, Đắk Lắk', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Drăng', latitude: 12.694, longitude: 108.057, nurseryType: 'Cây giống', capacity: 30000, currentStock: 18000, species: 'Coffea arabica', variety: 'Catimor', seedSource: 'Viện Khoa học Kỹ thuật Nông lâm nghiệp Tây Nguyên', plantingDate: new Date('2024-07-15'), expectedReadyDate: new Date('2025-01-15'), germinationRate: 89.0, survivalRate: 85.5, healthStatus: 'Khá', notes: 'Cây giống Arabica Catimor', isActive: true } },
      { code: 'NS-MDRAK-001', data: { tenantId: tenant.id, farmerId: farmer3.id, createdBy: adminUser.id, nurseryName: "Vườn ươm M'Drak", nurseryCode: 'NS-MDRAK-001', location: "M'Drak, Đắk Lắk", province: 'Đắk Lắk', district: "M'Drak", commune: "M'Drak", latitude: 12.697, longitude: 108.053, nurseryType: 'Cây giống', capacity: 40000, currentStock: 28000, species: 'Coffea canephora', variety: 'TR4', seedSource: 'Viện Khoa học Tây Nguyên', plantingDate: new Date('2024-05-10'), expectedReadyDate: new Date('2024-11-10'), germinationRate: 94.0, survivalRate: 90.0, healthStatus: 'Rất tốt', notes: 'Cây giống TR4 năng suất cao', isActive: true } },
      { code: 'NS-YIRGA-001', data: { tenantId: tenant.id, farmerId: farmer4.id, createdBy: adminUser.id, nurseryName: 'Yirgacheffe Seedling Nursery', nurseryCode: 'NS-YIRGA-001', location: 'Kochere, Yirgacheffe, Gedeo', province: 'Gedeo', district: 'Yirgacheffe', commune: 'Kochere', latitude: 6.165, longitude: 38.205, nurseryType: 'Seedling', capacity: 25000, currentStock: 15000, species: 'Coffea arabica', variety: 'Heirloom', seedSource: 'Local forest coffee selection', plantingDate: new Date('2024-04-20'), expectedReadyDate: new Date('2024-12-20'), germinationRate: 86.0, survivalRate: 82.0, healthStatus: 'Good', notes: 'Heirloom seedlings from forest coffee', isActive: true } },
      { code: 'NS-NYERI-001', data: { tenantId: tenant.id, farmerId: farmer5.id, createdBy: adminUser.id, nurseryName: 'Othaya Seedling Center', nurseryCode: 'NS-NYERI-001', location: 'Othaya, Nyeri, Central Kenya', province: 'Central', district: 'Nyeri', commune: 'Othaya', latitude: -0.418, longitude: 36.954, nurseryType: 'Seedling', capacity: 35000, currentStock: 22000, species: 'Coffea arabica', variety: 'SL28', seedSource: 'Scott Laboratories, Kenya', plantingDate: new Date('2024-03-15'), expectedReadyDate: new Date('2024-11-15'), germinationRate: 91.0, survivalRate: 87.0, healthStatus: 'Very Good', notes: 'Ruiru 11 & SL28 grafted seedlings', isActive: true } },
    ]
    for (const nd of nurseryDefs) {
      const existing = await db.nursery.findFirst({ where: { tenantId: tenant.id, nurseryCode: nd.code } })
      if (!existing) {
        await db.nursery.create({ data: nd.data as any })
        console.log(`  ✅ Nursery ${nd.code} created`)
      } else {
        console.log(`  ℹ️  Nursery ${nd.code} already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 9. Land Preparations
    // ═══════════════════════════════════════════════════
    const landPrepDefs = [
      { farmerId: farmer1.id, farmLandId: farmLand1.id, prepDate: new Date('2024-04-10'), data: { tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id, preparationDate: new Date('2024-04-10'), preparationType: 'Làm đất vụ mới', method: 'Cày xới thủ công + hữu cơ', equipmentUsed: 'Cuốc, xẻng, máy cày mini', laborCount: 4, laborCost: 2400000, materialsUsed: 'Phân chuồng 2 tấn, vôi bột 50kg', materialCost: 3500000, totalCost: 5900000, soilPhBefore: 5.2, soilPhAfter: 5.8, organicMatterPct: 3.8, notes: 'Đã bón lót phân chuồng ủ hoai mục', isActive: true } },
      { farmerId: farmer2.id, farmLandId: farmLand2.id, prepDate: new Date('2024-03-25'), data: { tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id, preparationDate: new Date('2024-03-25'), preparationType: 'Bổ sung dinh dưỡng', method: 'Bón hữu cơ + che phủ', equipmentUsed: 'Xe cút kút, cuốc', laborCount: 3, laborCost: 1800000, materialsUsed: 'Phân gà ủ 1.5 tấn, mùn cọ 500kg', materialCost: 2800000, totalCost: 4600000, soilPhBefore: 5.5, soilPhAfter: 6.0, organicMatterPct: 4.2, notes: 'Bổ sung hữu cơ theo tiêu chuẩn UTZ', isActive: true } },
      { farmerId: farmer3.id, farmLandId: farmLand3.id, prepDate: new Date('2024-04-05'), data: { tenantId: tenant.id, farmerId: farmer3.id, farmLandId: farmLand3.id, createdBy: adminUser.id, preparationDate: new Date('2024-04-05'), preparationType: 'Làm đất vụ mới', method: 'Cày sâu + vôi + hữu cơ', equipmentUsed: 'Máy cày lớn, xe tải', laborCount: 6, laborCost: 4200000, materialsUsed: 'Phân chuồng 3 tấn, vôi nông nghiệp 100kg', materialCost: 5200000, totalCost: 9400000, soilPhBefore: 4.8, soilPhAfter: 5.5, organicMatterPct: 3.2, notes: 'Cày sâu 40cm, cải tạo đất lâu năm', isActive: true } },
      { farmerId: farmer4.id, farmLandId: farmLand4.id, prepDate: new Date('2024-03-10'), data: { tenantId: tenant.id, farmerId: farmer4.id, farmLandId: farmLand4.id, createdBy: adminUser.id, preparationDate: new Date('2024-03-10'), preparationType: 'Soil preparation', method: 'Traditional pit digging + compost', equipmentUsed: 'Hand tools', laborCount: 5, laborCost: 150000, materialsUsed: 'Compost 1 ton, coffee pulp mulch', materialCost: 200000, totalCost: 350000, soilPhBefore: 5.8, soilPhAfter: 6.2, organicMatterPct: 5.5, notes: 'Traditional Ethiopian pit planting with compost', isActive: true } },
      { farmerId: farmer5.id, farmLandId: farmLand5.id, prepDate: new Date('2024-02-20'), data: { tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, createdBy: adminUser.id, preparationDate: new Date('2024-02-20'), preparationType: 'Field preparation', method: 'Terracing + organic amendment', equipmentUsed: 'Tractor, hand tools', laborCount: 4, laborCost: 80000, materialsUsed: 'Cow manure 2 tons, rock phosphate 200kg', materialCost: 120000, totalCost: 200000, soilPhBefore: 5.4, soilPhAfter: 5.9, organicMatterPct: 4.8, notes: 'Terrace maintenance and organic amendment for SL28', isActive: true } },
    ]
    for (const lpd of landPrepDefs) {
      const existing = await db.landPreparation.findFirst({ where: { tenantId: tenant.id, farmerId: lpd.farmerId, farmLandId: lpd.farmLandId, preparationDate: lpd.prepDate } })
      if (!existing) {
        await db.landPreparation.create({ data: lpd.data as any })
        console.log(`  ✅ LandPreparation for farmer ${lpd.farmerId.substring(0, 8)}... created`)
      } else {
        console.log(`  ℹ️  LandPreparation already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 10. Crop Monitorings
    // ═══════════════════════════════════════════════════
    const cropMonDefs = [
      { farmerId: farmer1.id, farmLandId: farmLand1.id, date: new Date('2024-09-15'), data: { tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, cultivationId: cultivationRecords['c1'].id, createdBy: adminUser.id, monitoringDate: new Date('2024-09-15'), monitoringType: 'Kiểm tra định kỳ', growthStage: 'Phát triển trái', plantHeight: 2.1, canopyDiameter: 1.5, leafColor: 'Xanh đậm', healthScore: 88.0, pestPressure: 'Thấp', diseaseSymptoms: 'Không phát hiện', weatherCondition: 'Nắng xen mưa', temperature: 26.5, rainfall: 180, humidity: 78.0, soilMoisture: 42.0, alertTriggered: false, notes: 'Cây phát triển tốt', isActive: true } },
      { farmerId: farmer2.id, farmLandId: farmLand2.id, date: new Date('2024-09-20'), data: { tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, cultivationId: cultivationRecords['c2'].id, createdBy: adminUser.id, monitoringDate: new Date('2024-09-20'), monitoringType: 'Kiểm tra sau mưa', growthStage: 'Chín trái', plantHeight: 1.8, canopyDiameter: 1.3, leafColor: 'Xanh vàng nhẹ', healthScore: 72.0, pestPressure: 'Trung bình', diseaseSymptoms: 'Gỉ sắt nhẹ', weatherCondition: 'Mưa liên tục', temperature: 23.0, rainfall: 350, humidity: 88.0, soilMoisture: 65.0, alertTriggered: true, alertType: 'Bệnh nấm', alertSeverity: 'Trung bình', remedialAction: 'Phun thuốc BIO-FOX', notes: 'Gỉ sắt phát triển do ẩm độ cao', isActive: true } },
      { farmerId: farmer3.id, farmLandId: farmLand3.id, date: new Date('2024-09-18'), data: { tenantId: tenant.id, farmerId: farmer3.id, farmLandId: farmLand3.id, cultivationId: cultivationRecords['c3'].id, createdBy: adminUser.id, monitoringDate: new Date('2024-09-18'), monitoringType: 'Kiểm tra định kỳ', growthStage: 'Phát triển trái', plantHeight: 2.3, canopyDiameter: 1.7, leafColor: 'Xanh đậm', healthScore: 92.0, pestPressure: 'Rất thấp', diseaseSymptoms: 'Không phát hiện', weatherCondition: 'Nắng đẹp', temperature: 27.0, rainfall: 120, humidity: 72.0, soilMoisture: 38.0, alertTriggered: false, notes: 'Cây phát triển rất tốt, năng suất kỳ vọng cao', isActive: true } },
      { farmerId: farmer4.id, farmLandId: farmLand4.id, date: new Date('2024-08-25'), data: { tenantId: tenant.id, farmerId: farmer4.id, farmLandId: farmLand4.id, cultivationId: cultivationRecords['c4'].id, createdBy: adminUser.id, monitoringDate: new Date('2024-08-25'), monitoringType: 'Routine check', growthStage: 'Fruit development', plantHeight: 3.5, canopyDiameter: 2.0, leafColor: 'Dark green', healthScore: 85.0, pestPressure: 'Low', diseaseSymptoms: 'None detected', weatherCondition: 'Light rain', temperature: 22.0, rainfall: 250, humidity: 82.0, soilMoisture: 55.0, alertTriggered: false, notes: 'Healthy heirloom trees, good shade management', isActive: true } },
      { farmerId: farmer5.id, farmLandId: farmLand5.id, date: new Date('2024-08-30'), data: { tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, cultivationId: cultivationRecords['c5'].id, createdBy: adminUser.id, monitoringDate: new Date('2024-08-30'), monitoringType: 'Seasonal check', growthStage: 'Ripening', plantHeight: 2.8, canopyDiameter: 1.8, leafColor: 'Green', healthScore: 80.0, pestPressure: 'Low', diseaseSymptoms: 'Minor CBD spots', weatherCondition: 'Sunny intervals', temperature: 20.0, rainfall: 200, humidity: 75.0, soilMoisture: 48.0, alertTriggered: true, alertType: 'Coffee Berry Disease', alertSeverity: 'Low', remedialAction: 'Copper spray application', notes: 'SL28 showing minor CBD, preventive spray recommended', isActive: true } },
    ]
    for (const cmd of cropMonDefs) {
      const existing = await db.cropMonitoring.findFirst({ where: { tenantId: tenant.id, farmerId: cmd.farmerId, farmLandId: cmd.farmLandId, monitoringDate: cmd.date } })
      if (!existing) {
        await db.cropMonitoring.create({ data: cmd.data as any })
        console.log(`  ✅ CropMonitoring created`)
      } else {
        console.log(`  ℹ️  CropMonitoring already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 11. Fertilizer Applications
    // ═══════════════════════════════════════════════════
    const fertDefs = [
      { farmerId: farmer1.id, farmLandId: farmLand1.id, date: new Date('2024-08-05'), data: { tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, cultivationId: cultivationRecords['c1'].id, createdBy: adminUser.id, applicationDate: new Date('2024-08-05'), fertilizerType: 'Hữu cơ', fertilizerName: 'Phân chuồng ủ hoai', nutrientContent: 'NPK 2-1-2', applicationRate: 2.0, unit: 'tấn/ha', totalQuantity: 4.0, applicationMethod: 'Bón gốc', costPerUnit: 800000, totalCost: 3200000, weatherAtApplication: 'Nắng nhẹ', appliedBy: 'Nguyễn Văn Thanh', isOrganic: true, certificationNumber: 'ORG-DL-2024-0456', notes: 'Bón thúc trái', isActive: true } },
      { farmerId: farmer2.id, farmLandId: farmLand2.id, date: new Date('2024-07-20'), data: { tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, cultivationId: cultivationRecords['c2'].id, createdBy: adminUser.id, applicationDate: new Date('2024-07-20'), fertilizerType: 'Hữu cơ sinh học', fertilizerName: 'Trichoderma + Phân gà ủ', nutrientContent: 'NPK 3-2-3', applicationRate: 1.5, unit: 'tấn/ha', totalQuantity: 2.25, applicationMethod: 'Bón gốc + xịt lá', costPerUnit: 1200000, totalCost: 2700000, weatherAtApplication: 'Trời mát', appliedBy: 'Trần Thị Hoa', isOrganic: true, certificationNumber: 'ORG-DL-2024-0457', notes: 'Phun Trichoderma phòng bệnh', isActive: true } },
      { farmerId: farmer3.id, farmLandId: farmLand3.id, date: new Date('2024-07-15'), data: { tenantId: tenant.id, farmerId: farmer3.id, farmLandId: farmLand3.id, cultivationId: cultivationRecords['c3'].id, createdBy: adminUser.id, applicationDate: new Date('2024-07-15'), fertilizerType: 'Hữu cơ + Khoáng', fertilizerName: 'Phân chuồng ủ + NPK 16-16-8', nutrientContent: 'NPK 5-4-4', applicationRate: 2.5, unit: 'tấn/ha', totalQuantity: 7.5, applicationMethod: 'Bón gốc', costPerUnit: 950000, totalCost: 7125000, weatherAtApplication: 'Nắng nhẹ', appliedBy: 'Lê Văn Minh', isOrganic: false, notes: 'Bón thúc trái kết hợp hữu cơ và khoáng', isActive: true } },
      { farmerId: farmer4.id, farmLandId: farmLand4.id, date: new Date('2024-06-10'), data: { tenantId: tenant.id, farmerId: farmer4.id, farmLandId: farmLand4.id, cultivationId: cultivationRecords['c4'].id, createdBy: adminUser.id, applicationDate: new Date('2024-06-10'), fertilizerType: 'Organic', fertilizerName: 'Coffee pulp compost', nutrientContent: 'NPK 2-1-3', applicationRate: 1.5, unit: 'tons/ha', totalQuantity: 1.8, applicationMethod: 'Basal application', costPerUnit: 50000, totalCost: 90000, weatherAtApplication: 'Cloudy', appliedBy: 'Abebe Tadesse', isOrganic: true, certificationNumber: 'ORG-ET-2024-0112', notes: 'Traditional coffee pulp composting', isActive: true } },
      { farmerId: farmer5.id, farmLandId: farmLand5.id, date: new Date('2024-06-05'), data: { tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, cultivationId: cultivationRecords['c5'].id, createdBy: adminUser.id, applicationDate: new Date('2024-06-05'), fertilizerType: 'Organic + Mineral', fertilizerName: 'CAN + Cow manure', nutrientContent: 'NPK 4-3-4', applicationRate: 2.0, unit: 'tons/ha', totalQuantity: 3.6, applicationMethod: 'Basal + foliar', costPerUnit: 60000, totalCost: 216000, weatherAtApplication: 'Sunny', appliedBy: 'Kamau Ndirangu', isOrganic: false, notes: 'Combined application of CAN and organic manure', isActive: true } },
    ]
    for (const fd of fertDefs) {
      const existing = await db.fertilizerApplication.findFirst({ where: { tenantId: tenant.id, farmerId: fd.farmerId, farmLandId: fd.farmLandId, applicationDate: fd.date } })
      if (!existing) {
        await db.fertilizerApplication.create({ data: fd.data as any })
        console.log(`  ✅ FertilizerApplication created`)
      } else {
        console.log(`  ℹ️  FertilizerApplication already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 12. Pest & Disease Management
    // ═══════════════════════════════════════════════════
    const pestDefs = [
      { farmerId: farmer2.id, farmLandId: farmLand2.id, detectionDate: new Date('2024-09-22'), data: { tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, cultivationId: cultivationRecords['c2'].id, createdBy: adminUser.id, detectionDate: new Date('2024-09-22'), pestOrDisease: 'Gỉ sắt (Coffee Leaf Rust)', type: 'Bệnh nấm', severity: 'Trung bình', affectedArea: 0.6, affectedTrees: 180, symptoms: 'Đốm vàng cam dưới lá', treatmentMethod: 'Sinh học', treatmentProduct: 'BIO-FOX', dosage: '5g/lít', applicationDate: new Date('2024-09-24'), followUpDate: new Date('2024-10-08'), outcome: 'Đang theo dõi', cost: 850000, preventionMeasures: 'Tỉa cành thông thoáng', notes: 'Phun lần 1 ngày 24/9', isActive: true } },
      { farmerId: farmer1.id, farmLandId: farmLand1.id, detectionDate: new Date('2024-08-15'), data: { tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, cultivationId: cultivationRecords['c1'].id, createdBy: adminUser.id, detectionDate: new Date('2024-08-15'), pestOrDisease: 'Rệp sáp bột hồng', type: 'Sâu bệnh', severity: 'Thấp', affectedArea: 0.2, affectedTrees: 35, symptoms: 'Túi sáp trắng ở kẽ cành', treatmentMethod: 'Sinh học', treatmentProduct: 'Cryptolaemus montrouzieri', dosage: '50 bọ rệp/100 cây', applicationDate: new Date('2024-08-18'), followUpDate: new Date('2024-09-01'), outcome: 'Kiểm soát tốt', cost: 450000, preventionMeasures: 'Bảo tồn kiến vàng', notes: 'Bọ rệp đối kháng hiệu quả tốt', isActive: true } },
      { farmerId: farmer5.id, farmLandId: farmLand5.id, detectionDate: new Date('2024-09-01'), data: { tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, cultivationId: cultivationRecords['c5'].id, createdBy: adminUser.id, detectionDate: new Date('2024-09-01'), pestOrDisease: 'Coffee Berry Disease (CBD)', type: 'Fungal', severity: 'Low', affectedArea: 0.3, affectedTrees: 45, symptoms: 'Dark lesions on green berries', treatmentMethod: 'Chemical + Cultural', treatmentProduct: 'Copper oxychloride', dosage: '3g/liter', applicationDate: new Date('2024-09-03'), followUpDate: new Date('2024-09-17'), outcome: 'Under control', cost: 35000, preventionMeasures: 'Pruning for air circulation, resistant variety selection', notes: 'Preventive copper spray applied', isActive: true } },
    ]
    for (const pd of pestDefs) {
      const existing = await db.pestDiseaseManagement.findFirst({ where: { tenantId: tenant.id, farmerId: pd.farmerId, farmLandId: pd.farmLandId, detectionDate: pd.detectionDate } })
      if (!existing) {
        await db.pestDiseaseManagement.create({ data: pd.data as any })
        console.log(`  ✅ PestDiseaseManagement created`)
      } else {
        console.log(`  ℹ️  PestDiseaseManagement already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 13. Harvest Traceability (2 complete batches)
    // ═══════════════════════════════════════════════════
    let harvest1 = await db.harvestTraceability.findFirst({ where: { tenantId: tenant.id, batchId: batchId1 } })
    if (!harvest1) {
      harvest1 = await db.harvestTraceability.create({ data: {
        tenantId: tenant.id, cultivationId: cultivationRecords['c1'].id, farmerId: farmer1.id, farmLandId: farmLand1.id,
        plannedHarvestDate: new Date('2024-11-01'), plotBlockId: 'TB-PLT-001-A1',
        coffeeVariety: 'Chari (Robusta)', estimatedYield: '3500 kg',
        actualHarvestDate: new Date('2024-11-10'), harvestMethod: 'Chọn hái', cherryRipeness: 92.0,
        harvestLabourCost: 3500000, sampleWeight: 5.0, sampleArea: 0.01, sampleYield: 500,
        estimatedYieldPerHa: 3500, processingMethod: 'Rửa', dryingMethod: 'Giường nâng (African)',
        dryingDurationDays: 14, targetMoisture: 11.0, moistureContent: 10.8, defectiveBeans: 2.1,
        foreignMatter: 0.05, cupScore: 82.5, batchId: batchId1, coffeeVarietyAtBatch: 'Chari (Robusta)',
        processingStage: 'Đã thu hoạch', batchTimestamp: new Date('2024-11-10T07:30:00'),
        location: "Nông trại Thanh, Ea Tam, Cư Mgar", actor: 'Nguyễn Văn Thanh', isActive: true,
      }})
      console.log('  ✅ Harvest1 (batchId1) created')
    } else {
      console.log('  ℹ️  Harvest1 (batchId1) already exists')
    }

    let harvest2 = await db.harvestTraceability.findFirst({ where: { tenantId: tenant.id, batchId: batchId2 } })
    if (!harvest2) {
      harvest2 = await db.harvestTraceability.create({ data: {
        tenantId: tenant.id, cultivationId: cultivationRecords['c2'].id, farmerId: farmer2.id, farmLandId: farmLand2.id,
        plannedHarvestDate: new Date('2024-10-15'), plotBlockId: 'TB-PLT-002-B1',
        coffeeVariety: 'Catimor (Arabica)', estimatedYield: '2800 kg',
        actualHarvestDate: new Date('2024-10-20'), harvestMethod: 'Chọn hái', cherryRipeness: 95.0,
        harvestLabourCost: 2800000, sampleWeight: 4.5, sampleArea: 0.01, sampleYield: 450,
        estimatedYieldPerHa: 2800, processingMethod: 'Tự nhiên', dryingMethod: 'Giường nâng (nhà kính)',
        dryingDurationDays: 21, targetMoisture: 11.5, moistureContent: 11.2, defectiveBeans: 1.5,
        foreignMatter: 0.02, cupScore: 85.0, batchId: batchId2, coffeeVarietyAtBatch: 'Catimor (Arabica)',
        processingStage: 'Đã thu hoạch', batchTimestamp: new Date('2024-10-20T06:45:00'),
        location: "Vườn Hoa, Ea Drang, Cư Mgar", actor: 'Trần Thị Hoa', isActive: true,
      }})
      console.log('  ✅ Harvest2 (batchId2) created')
    } else {
      console.log('  ℹ️  Harvest2 (batchId2) already exists')
    }

    // ═══════════════════════════════════════════════════
    // 14. Collection Centre
    // ═══════════════════════════════════════════════════
    let cc1 = await db.collectionCentre.findFirst({ where: { tenantId: tenant.id, centreId: 'CC-EATAM-001' } })
    if (!cc1) {
      cc1 = await db.collectionCentre.create({ data: {
        tenantId: tenant.id, centreId: 'CC-EATAM-001', centreName: 'Trạm thu mua Ea Tam',
        centreGpsLat: 12.670, centreGpsLng: 108.042, province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tam',
        managerName: 'Võ Văn Em', contactNumber: '0977112233', storageCapacityKg: 15000, scaleType: 'Cân kỹ thuật số (500kg)', isActive: true,
      }})
      console.log('  ✅ CollectionCentre CC-EATAM-001 created')
    } else {
      console.log('  ℹ️  CollectionCentre CC-EATAM-001 already exists')
    }

    let cc2 = await db.collectionCentre.findFirst({ where: { tenantId: tenant.id, centreId: 'CC-EADRANG-001' } })
    if (!cc2) {
      cc2 = await db.collectionCentre.create({ data: {
        tenantId: tenant.id, centreId: 'CC-EADRANG-001', centreName: 'Trạm thu mua Ea Drăng',
        centreGpsLat: 12.694, centreGpsLng: 108.058, province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Drăng',
        managerName: 'Nguyễn Văn Bền', contactNumber: '0977445566', storageCapacityKg: 12000, scaleType: 'Cân kỹ thuật số (300kg)', isActive: true,
      }})
      console.log('  ✅ CollectionCentre CC-EADRANG-001 created')
    } else {
      console.log('  ℹ️  CollectionCentre CC-EADRANG-001 already exists')
    }

    // ═══════════════════════════════════════════════════
    // 15. Procurement Records (for BOTH batch IDs)
    // ═══════════════════════════════════════════════════
    let proc1 = await db.procurementRecord.findFirst({ where: { tenantId: tenant.id, batchId: batchId1 } })
    if (!proc1) {
      proc1 = await db.procurementRecord.create({ data: {
        tenantId: tenant.id, collectionCentreId: cc1.id, cultivationId: cultivationRecords['c1'].id,
        farmerId: farmer1.id, farmLandId: farmLand1.id, procurementId: `PROC-${uid()}`,
        procurementDate: new Date('2024-11-11'), batchId: batchId1, coffeeType: 'Cherry',
        coffeeVariety: 'Chari (Robusta)', grossWeight: 3350, tareWeight: 150, netWeight: 3200,
        moistureContentAtGate: 52.0, adjustedNetWeight: 3200, cherryRipenessGrade: 'A (92% đỏ)',
        defects: 2.1, purchasePricePerKg: 8500, totalPurchaseAmount: 27200000,
        priceBasis: 'Cherry, trọng lượng ướt', certPremiumApplied: 500, paymentMethod: 'Chuyển khoản',
        paymentStatus: 'Completed', paymentDate: new Date('2024-11-13'), isActive: true,
      }})
      console.log('  ✅ ProcurementRecord (batchId1) created')
    } else {
      console.log('  ℹ️  ProcurementRecord (batchId1) already exists')
    }

    let proc2 = await db.procurementRecord.findFirst({ where: { tenantId: tenant.id, batchId: batchId2 } })
    if (!proc2) {
      proc2 = await db.procurementRecord.create({ data: {
        tenantId: tenant.id, collectionCentreId: cc2.id, cultivationId: cultivationRecords['c2'].id,
        farmerId: farmer2.id, farmLandId: farmLand2.id, procurementId: `PROC-${uid()}`,
        procurementDate: new Date('2024-10-21'), batchId: batchId2, coffeeType: 'Cherry',
        coffeeVariety: 'Catimor (Arabica)', grossWeight: 2650, tareWeight: 120, netWeight: 2530,
        moistureContentAtGate: 55.0, adjustedNetWeight: 2530, cherryRipenessGrade: 'A+ (95% đỏ)',
        defects: 1.5, purchasePricePerKg: 18000, totalPurchaseAmount: 45540000,
        priceBasis: 'Cherry Arabica, trọng lượng ướt', certPremiumApplied: 1200, paymentMethod: 'Chuyển khoản',
        paymentStatus: 'Completed', paymentDate: new Date('2024-10-23'), isActive: true,
      }})
      console.log('  ✅ ProcurementRecord (batchId2) created')
    } else {
      console.log('  ℹ️  ProcurementRecord (batchId2) already exists')
    }

    // ═══════════════════════════════════════════════════
    // 16. Processing Job Orders (for BOTH batch IDs)
    // ═══════════════════════════════════════════════════
    let jobOrder1 = await db.processingJobOrder.findFirst({ where: { tenantId: tenant.id, batchIdInput: batchId1 } })
    if (!jobOrder1) {
      jobOrder1 = await db.processingJobOrder.create({ data: {
        tenantId: tenant.id, jobOrderId: `JOB-${BATCH_PREFIX}-001`, processingDate: new Date('2024-11-13'),
        batchIdInput: batchId1, coffeeTypeInput: 'Cherry', coffeeVarietyInput: 'Chari (Robusta)',
        inputQuantityKg: 3185, processingMethod: 'Rửa', targetOutputProduct: 'Hạt xanh (Robusta)',
        operatorName: 'Võ Minh Trí', plantFacilityName: 'Nhà máy chế biến Terra Brew',
        inputWeightKg: 3185, finalOutputWeightKg: 640, overallOutturn: 20.1,
        totalProcessingCost: 35000000, costPerKg: 54687, finalMoistureContent: 10.8, cupScore: 82.5,
        cuppingNotes: 'Vị sạch, body trung bình, ghi chú sô cô la và hạt', qcApprovedBy: 'Nguyễn Thị Lan (Quản lý QC)',
        qcApprovalDate: new Date('2024-12-07'), isActive: true,
      }})
      console.log('  ✅ ProcessingJobOrder (batchId1) created')
    } else {
      console.log('  ℹ️  ProcessingJobOrder (batchId1) already exists')
    }

    let jobOrder2 = await db.processingJobOrder.findFirst({ where: { tenantId: tenant.id, batchIdInput: batchId2 } })
    if (!jobOrder2) {
      jobOrder2 = await db.processingJobOrder.create({ data: {
        tenantId: tenant.id, jobOrderId: `JOB-${BATCH_PREFIX}-002`, processingDate: new Date('2024-10-23'),
        batchIdInput: batchId2, coffeeTypeInput: 'Cherry', coffeeVarietyInput: 'Catimor (Arabica)',
        inputQuantityKg: 2515, processingMethod: 'Tự nhiên', targetOutputProduct: 'Hạt xanh Arabica (Natural)',
        operatorName: 'Lê Quang Vinh', plantFacilityName: 'Nhà máy chế biến Terra Brew',
        inputWeightKg: 2515, finalOutputWeightKg: 505, overallOutturn: 20.1,
        totalProcessingCost: 28000000, costPerKg: 55445, finalMoistureContent: 11.2, cupScore: 85.0,
        cuppingNotes: 'Hương hoa, vị trái cây nhiệt đới, chua thanh, body nhẹ', qcApprovedBy: 'Nguyễn Thị Lan (Quản lý QC)',
        qcApprovalDate: new Date('2024-11-18'), isActive: true,
      }})
      console.log('  ✅ ProcessingJobOrder (batchId2) created')
    } else {
      console.log('  ℹ️  ProcessingJobOrder (batchId2) already exists')
    }

    // ═══════════════════════════════════════════════════
    // 17. Processing Stage Records (for BOTH batches)
    // ═══════════════════════════════════════════════════
    // Batch 1 stages
    const stageRecords1 = [
      { stageType: 'Phân loại & Làm sạch', stageDate: new Date('2024-11-13'), inputWeight: 3200, outputWeight: 3185, durationMinutes: 120, temperature: 25.0, humidity: 72.0, machineUsed: 'Máy phân loại quang học', operatorName: 'Võ Minh Trí', qualityCheckPassed: true, notes: 'Loại bỏ quả đen, quả xanh' },
      { stageType: 'Bóc vỏ & Lên men', stageDate: new Date('2024-11-14'), inputWeight: 3185, outputWeight: 850, durationMinutes: 1440, temperature: 28.0, humidity: 80.0, machineUsed: 'Máy bóc vỏ Penagos 2500', operatorName: 'Võ Minh Trí', qualityCheckPassed: true, notes: 'Lên men ướt 24 giờ' },
      { stageType: 'Sấy', stageDate: new Date('2024-11-15'), inputWeight: 850, outputWeight: 660, durationMinutes: 20160, temperature: 35.0, humidity: 45.0, machineUsed: 'African bed + nhà kính', operatorName: 'Lê Văn Hùng', qualityCheckPassed: true, notes: 'Sấy 14 ngày, ẩm 10.8%' },
      { stageType: 'Bóc lụa & Phân loại cuối', stageDate: new Date('2024-11-29'), inputWeight: 660, outputWeight: 640, durationMinutes: 240, temperature: 22.0, humidity: 55.0, machineUsed: 'Máy bóc lụa CCI', operatorName: 'Võ Minh Trí', qualityCheckPassed: true, notes: 'Green bean Grade 1, Screen 16+' },
    ]
    for (const sr of stageRecords1) {
      const existing = await db.processingStageRecord.findFirst({ where: { tenantId: tenant.id, jobOrderId: jobOrder1.id, stageType: sr.stageType, stageDate: sr.stageDate } })
      if (!existing) {
        await db.processingStageRecord.create({ data: { tenantId: tenant.id, jobOrderId: jobOrder1.id, ...sr, isActive: true } })
        console.log(`  ✅ ProcessingStageRecord (batch1: ${sr.stageType}) created`)
      }
    }

    // Batch 2 stages
    const stageRecords2 = [
      { stageType: 'Phân loại & Làm sạch', stageDate: new Date('2024-10-23'), inputWeight: 2530, outputWeight: 2515, durationMinutes: 100, temperature: 24.0, humidity: 70.0, machineUsed: 'Máy phân loại quang học', operatorName: 'Lê Quang Vinh', qualityCheckPassed: true, notes: 'Loại bỏ quả lỗi, tạp chất' },
      { stageType: 'Sấy tự nhiên', stageDate: new Date('2024-10-24'), inputWeight: 2515, outputWeight: 620, durationMinutes: 30240, temperature: 32.0, humidity: 40.0, machineUsed: 'African raised bed (nhà kính)', operatorName: 'Lê Quang Vinh', qualityCheckPassed: true, notes: 'Sấy tự nhiên 21 ngày, ẩm 11.2%' },
      { stageType: 'Bóc vỏ & Phân loại', stageDate: new Date('2024-11-14'), inputWeight: 620, outputWeight: 505, durationMinutes: 180, temperature: 22.0, humidity: 50.0, machineUsed: 'Máy bóc vỏ trơn CCI', operatorName: 'Lê Quang Vinh', qualityCheckPassed: true, notes: 'Natural process, green bean Specialty grade' },
      { stageType: 'Nghiền & Đóng gói', stageDate: new Date('2024-11-15'), inputWeight: 505, outputWeight: 500, durationMinutes: 60, temperature: 21.0, humidity: 48.0, machineUsed: 'Máy đóng gói GrainPro', operatorName: 'Nguyễn Thị Lan', qualityCheckPassed: true, notes: 'Đóng gói GrainPro + bao jute, dán nhãn Specialty' },
    ]
    for (const sr of stageRecords2) {
      const existing = await db.processingStageRecord.findFirst({ where: { tenantId: tenant.id, jobOrderId: jobOrder2.id, stageType: sr.stageType, stageDate: sr.stageDate } })
      if (!existing) {
        await db.processingStageRecord.create({ data: { tenantId: tenant.id, jobOrderId: jobOrder2.id, ...sr, isActive: true } })
        console.log(`  ✅ ProcessingStageRecord (batch2: ${sr.stageType}) created`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 18. Cert Assessments
    // ═══════════════════════════════════════════════════
    const certDefs = [
      { assessmentId: 'CERT-2024-ORG-001', data: { tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id, assessmentId: 'CERT-2024-ORG-001', assessmentDate: new Date('2024-06-15'), certificationStandard: 'Organic', certifyingBody: 'Control Union Việt Nam', assessmentType: 'Tái chứng nhận', scope: 'Sản xuất hữu cơ 2.5 ha', status: 'Đạt', score: 92.0, maxScore: 100.0, findings: 'Tuân thủ tốt quy chuẩn hữu cơ', validFrom: new Date('2024-07-01'), validUntil: new Date('2025-06-30'), certificateNumber: 'ORG-VN-2024-CU0583', isActive: true } },
      { assessmentId: 'CERT-2024-FT-002', data: { tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id, assessmentId: 'CERT-2024-FT-002', assessmentDate: new Date('2024-05-20'), certificationStandard: 'Fair Trade', certifyingBody: 'FLO-CERT GmbH', assessmentType: 'Chứng nhận mới', scope: 'Thương mại công bằng 1.8 ha', status: 'Đạt', score: 87.5, maxScore: 100.0, findings: 'Đáp ứng tiêu chuẩn thương mại công bằng', validFrom: new Date('2024-06-01'), validUntil: new Date('2025-05-31'), certificateNumber: 'FT-VN-2024-ED0217', isActive: true } },
      { assessmentId: 'CERT-2024-UTZ-003', data: { tenantId: tenant.id, farmerId: farmer3.id, farmLandId: farmLand3.id, createdBy: adminUser.id, assessmentId: 'CERT-2024-UTZ-003', assessmentDate: new Date('2024-04-10'), certificationStandard: 'UTZ', certifyingBody: 'Rainforest Alliance', assessmentType: 'Tái chứng nhận', scope: 'Sản xuất bền vững 3.2 ha', status: 'Đạt', score: 90.5, maxScore: 100.0, findings: 'Tuân thủ tốt quy chuẩn UTZ/Rainforest Alliance', validFrom: new Date('2024-05-01'), validUntil: new Date('2025-04-30'), certificateNumber: 'UTZ-VN-2024-RA3847', isActive: true } },
      { assessmentId: 'CERT-2024-ORG-ET-001', data: { tenantId: tenant.id, farmerId: farmer4.id, farmLandId: farmLand4.id, createdBy: adminUser.id, assessmentId: 'CERT-2024-ORG-ET-001', assessmentDate: new Date('2024-03-15'), certificationStandard: 'Organic', certifyingBody: 'ECOCERT Ethiopia', assessmentType: 'Renewal', scope: 'Organic production 1.5 ha', status: 'Đạt', score: 88.0, maxScore: 100.0, findings: 'Good organic practices, traditional farming methods', validFrom: new Date('2024-04-01'), validUntil: new Date('2025-03-31'), certificateNumber: 'ORG-ET-2024-EC0782', isActive: true } },
      { assessmentId: 'CERT-2024-FT-KE-001', data: { tenantId: tenant.id, farmerId: farmer5.id, farmLandId: farmLand5.id, createdBy: adminUser.id, assessmentId: 'CERT-2024-FT-KE-001', assessmentDate: new Date('2024-02-20'), certificationStandard: 'Fair Trade', certifyingBody: 'FLO-CERT Kenya', assessmentType: 'Renewal', scope: 'Fair Trade production 2.0 ha', status: 'Đạt', score: 91.0, maxScore: 100.0, findings: 'Excellent fair trade compliance, community development fund active', validFrom: new Date('2024-03-01'), validUntil: new Date('2025-02-28'), certificateNumber: 'FT-KE-2024-OC0452', isActive: true } },
    ]
    for (const cd of certDefs) {
      const existing = await db.certAssessment.findFirst({ where: { tenantId: tenant.id, assessmentId: cd.assessmentId } })
      if (!existing) {
        await db.certAssessment.create({ data: cd.data as any })
        console.log(`  ✅ CertAssessment ${cd.assessmentId} created`)
      } else {
        console.log(`  ℹ️  CertAssessment ${cd.assessmentId} already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 19. Coffee Inspections (for BOTH batch IDs)
    // ═══════════════════════════════════════════════════
    let insp1 = await db.coffeeInspection.findFirst({ where: { tenantId: tenant.id, batchId: batchId1 } })
    if (!insp1) {
      insp1 = await db.coffeeInspection.create({ data: {
        tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, batchId: batchId1, createdBy: adminUser.id,
        inspectionId: 'INSP-2024-RB-001', inspectionDate: new Date('2024-11-15'), inspectorName: 'Nguyễn Thị Lan',
        inspectorCertNo: 'QC-VN-2024-0142', inspectionType: 'Kiểm định chất lượng đầu vào',
        inspectionStandard: 'TCVN 4193:2014', sampleSize: 0.3, moistureContent: 10.8, defectCount: 8.0,
        foreignMatter: 0.05, screenSize: 'Screen 16+', cupScore: 82.5, overallGrade: 'Grade 1 - Xuất khẩu',
        passFail: 'Pass', isActive: true,
      }})
      console.log('  ✅ CoffeeInspection (batchId1) created')
    } else {
      console.log('  ℹ️  CoffeeInspection (batchId1) already exists')
    }

    let insp2 = await db.coffeeInspection.findFirst({ where: { tenantId: tenant.id, batchId: batchId2 } })
    if (!insp2) {
      insp2 = await db.coffeeInspection.create({ data: {
        tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, batchId: batchId2, createdBy: adminUser.id,
        inspectionId: 'INSP-2024-AR-001', inspectionDate: new Date('2024-10-25'), inspectorName: 'Nguyễn Thị Lan',
        inspectorCertNo: 'QC-VN-2024-0142', inspectionType: 'Kiểm định chất lượng đặc sản',
        inspectionStandard: 'SCA Protocol', sampleSize: 0.35, moistureContent: 11.2, defectCount: 3.0,
        foreignMatter: 0.02, screenSize: 'Screen 15+', cupScore: 85.0, overallGrade: 'Specialty Grade',
        passFail: 'Pass', isActive: true,
      }})
      console.log('  ✅ CoffeeInspection (batchId2) created')
    } else {
      console.log('  ℹ️  CoffeeInspection (batchId2) already exists')
    }

    // ═══════════════════════════════════════════════════
    // 20. Smart Contracts
    // ═══════════════════════════════════════════════════
    const contractDefs = [
      { contractId: 'SC-2024-VN-RB-001', data: { tenantId: tenant.id, farmerId: farmer1.id, buyerId: 'BUYER-INT-001', createdBy: adminUser.id, contractId: 'SC-2024-VN-RB-001', contractType: 'Hợp đồng mua bán', title: 'Hợp đồng cung ứng Robusta 2024-2025', partyA: 'HTX Ea Tam', partyB: 'Tokyo Coffee Trading', quantityKg: 5000, pricePerKg: 55000, totalValue: 275000000, currency: 'VND', deliveryDate: new Date('2025-01-15'), status: 'Đang thực hiện', signedByA: true, signedByB: true, signedDateA: new Date('2024-10-01'), signedDateB: new Date('2024-10-05'), effectiveDate: new Date('2024-10-10'), expiryDate: new Date('2025-03-31'), isActive: true } },
      { contractId: 'SC-2024-VN-AR-002', data: { tenantId: tenant.id, farmerId: farmer2.id, buyerId: 'BUYER-INT-002', createdBy: adminUser.id, contractId: 'SC-2024-VN-AR-002', contractType: 'Hợp đồng đặc sản', title: 'Hợp đồng cung ứng Arabica đặc sản 2024', partyA: 'Nông trại Ea Drăng', partyB: 'Seoul Specialty Roasters', quantityKg: 2000, pricePerKg: 120000, totalValue: 240000000, currency: 'VND', deliveryDate: new Date('2024-12-20'), status: 'Chờ ký bên A', signedByA: false, signedByB: true, signedDateB: new Date('2024-11-01'), effectiveDate: new Date('2024-11-15'), expiryDate: new Date('2025-02-28'), isActive: true } },
      { contractId: 'SC-2024-VN-RB-003', data: { tenantId: tenant.id, farmerId: farmer3.id, buyerId: 'BUYER-INT-003', createdBy: adminUser.id, contractId: 'SC-2024-VN-RB-003', contractType: 'Hợp đồng cung ứng', title: 'Hợp đồng cung ứng Robusta TR4 2024-2025', partyA: "HTX M'Drak", partyB: 'Hamburg Coffee Exchange', quantityKg: 8000, pricePerKg: 48000, totalValue: 384000000, currency: 'VND', deliveryDate: new Date('2025-02-01'), status: 'Đang thực hiện', signedByA: true, signedByB: true, signedDateA: new Date('2024-09-15'), signedDateB: new Date('2024-09-20'), effectiveDate: new Date('2024-10-01'), expiryDate: new Date('2025-06-30'), isActive: true } },
      { contractId: 'SC-2024-ET-HEIR-001', data: { tenantId: tenant.id, farmerId: farmer4.id, buyerId: 'BUYER-INT-004', createdBy: adminUser.id, contractId: 'SC-2024-ET-HEIR-001', contractType: 'Specialty contract', title: 'Yirgacheffe Heirloom Supply 2024', partyA: 'Yirgacheffe Cooperative Union', partyB: 'Blue Bottle Coffee (USA)', quantityKg: 3000, pricePerKg: 28, totalValue: 84000, currency: 'USD', deliveryDate: new Date('2025-01-30'), status: 'Active', signedByA: true, signedByB: true, signedDateA: new Date('2024-08-20'), signedDateB: new Date('2024-08-25'), effectiveDate: new Date('2024-09-01'), expiryDate: new Date('2025-04-30'), isActive: true } },
      { contractId: 'SC-2024-KE-SL28-001', data: { tenantId: tenant.id, farmerId: farmer5.id, buyerId: 'BUYER-INT-005', createdBy: adminUser.id, contractId: 'SC-2024-KE-SL28-001', contractType: 'Specialty contract', title: 'Kenya AA SL28 Supply 2024-2025', partyA: 'Othaya Farmers Cooperative', partyB: 'Square Mile Coffee (UK)', quantityKg: 2500, pricePerKg: 22, totalValue: 55000, currency: 'USD', deliveryDate: new Date('2025-01-15'), status: 'Active', signedByA: true, signedByB: true, signedDateA: new Date('2024-09-05'), signedDateB: new Date('2024-09-10'), effectiveDate: new Date('2024-09-15'), expiryDate: new Date('2025-03-31'), isActive: true } },
    ]
    for (const cd of contractDefs) {
      const existing = await db.smartContract.findFirst({ where: { tenantId: tenant.id, contractId: cd.contractId } })
      if (!existing) {
        await db.smartContract.create({ data: cd.data as any })
        console.log(`  ✅ SmartContract ${cd.contractId} created`)
      } else {
        console.log(`  ℹ️  SmartContract ${cd.contractId} already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 21. Marketplace Listings
    // ═══════════════════════════════════════════════════
    const mktDefs = [
      { listingId: 'MKT-2024-RB-001', data: { tenantId: tenant.id, farmerId: farmer1.id, createdBy: adminUser.id, listingId: 'MKT-2024-RB-001', title: 'Cà phê Robusta Chari Grade 1 - Hữu cơ', description: 'Robusta Chari Grade 1 hữu cơ vụ 2024', coffeeType: 'Robusta', coffeeVariety: 'Chari', grade: 'Grade 1', quantityKg: 3000, pricePerKg: 55000, totalValue: 165000000, currency: 'VND', origin: 'Ea Tam, Đắk Lắk', processingMethod: 'Rửa', cupScore: 82.5, certifications: 'Organic, UTZ', harvestYear: '2024', listingStatus: 'Đang bán', listingDate: new Date('2024-11-20'), isActive: true } },
      { listingId: 'MKT-2024-AR-001', data: { tenantId: tenant.id, farmerId: farmer2.id, createdBy: adminUser.id, listingId: 'MKT-2024-AR-001', title: 'Arabica Catimor Natural Specialty', description: 'Arabica Catimor đặc sản, cup score 85', coffeeType: 'Arabica', coffeeVariety: 'Catimor', grade: 'Specialty', quantityKg: 1500, pricePerKg: 120000, totalValue: 180000000, currency: 'VND', origin: 'Ea Drăng, Đắk Lắk', processingMethod: 'Tự nhiên', cupScore: 85.0, certifications: 'Organic, Fair Trade', harvestYear: '2024', listingStatus: 'Đang bán', listingDate: new Date('2024-10-28'), isActive: true } },
      { listingId: 'MKT-2024-RB-002', data: { tenantId: tenant.id, farmerId: farmer3.id, createdBy: adminUser.id, listingId: 'MKT-2024-RB-002', title: 'Robusta TR4 UTZ Grade 1', description: 'Robusta TR4 năng suất cao, UTZ chứng nhận', coffeeType: 'Robusta', coffeeVariety: 'TR4', grade: 'Grade 1', quantityKg: 5000, pricePerKg: 48000, totalValue: 240000000, currency: 'VND', origin: "M'Drak, Đắk Lắk", processingMethod: 'Tự nhiên', cupScore: 80.0, certifications: 'UTZ, Rainforest Alliance', harvestYear: '2024', listingStatus: 'Đang bán', listingDate: new Date('2024-12-01'), isActive: true } },
      { listingId: 'MKT-2024-ET-001', data: { tenantId: tenant.id, farmerId: farmer4.id, createdBy: adminUser.id, listingId: 'MKT-2024-ET-001', title: 'Ethiopian Yirgacheffe Heirloom Washed', description: 'Premium Yirgacheffe Heirloom, floral and citrus notes', coffeeType: 'Arabica', coffeeVariety: 'Heirloom', grade: 'Specialty Grade 1', quantityKg: 2000, pricePerKg: 28, totalValue: 56000, currency: 'USD', origin: 'Kochere, Yirgacheffe, Ethiopia', processingMethod: 'Washed', cupScore: 88.0, certifications: 'Organic, Fair Trade', harvestYear: '2024', listingStatus: 'Available', listingDate: new Date('2024-12-05'), isActive: true } },
      { listingId: 'MKT-2024-KE-001', data: { tenantId: tenant.id, farmerId: farmer5.id, createdBy: adminUser.id, listingId: 'MKT-2024-KE-001', title: 'Kenya AA SL28 Washed', description: 'Classic Kenya AA, blackcurrant and bright acidity', coffeeType: 'Arabica', coffeeVariety: 'SL28', grade: 'AA', quantityKg: 1800, pricePerKg: 22, totalValue: 39600, currency: 'USD', origin: 'Othaya, Nyeri, Kenya', processingMethod: 'Washed', cupScore: 86.5, certifications: 'Fair Trade, Rainforest Alliance', harvestYear: '2024', listingStatus: 'Available', listingDate: new Date('2024-12-10'), isActive: true } },
    ]
    for (const md of mktDefs) {
      const existing = await db.marketplaceListing.findFirst({ where: { tenantId: tenant.id, listingId: md.listingId } })
      if (!existing) {
        await db.marketplaceListing.create({ data: md.data as any })
        console.log(`  ✅ MarketplaceListing ${md.listingId} created`)
      } else {
        console.log(`  ℹ️  MarketplaceListing ${md.listingId} already exists`)
      }
    }

    // ═══════════════════════════════════════════════════
    // 22. Hash Chain Blocks (all 14 stages for BOTH batches)
    // ═══════════════════════════════════════════════════
    const chainStages1 = [
      { stage: 'FARMER_REGISTRATION', data: { farmer: farmer1.fullName, code: farmer1.farmerCode, province: farmer1.province, country: farmer1.country }, timestamp: '2024-01-15T08:00:00.000Z' },
      { stage: 'FARMLAND_REGISTRATION', data: { farm: farmLand1.farmName, area: farmLand1.totalLandHolding, altitude: farmLand1.altitude, soilType: farmLand1.soilType }, timestamp: '2024-01-20T09:00:00.000Z' },
      { stage: 'CULTIVATION', data: { plot: cultivationRecords['c1'].farmPlotName, crop: cultivationRecords['c1'].cultivatedCrop, variety: cultivationRecords['c1'].cropVariety, intercropping: 'Pepper 3:1' }, timestamp: '2024-02-01T10:00:00.000Z' },
      { stage: 'NURSERY', data: { name: 'Vườn ươm Ea Tam', species: 'Coffea canephora', variety: 'Chari', germinationRate: 92.5 }, timestamp: '2024-03-01T07:00:00.000Z' },
      { stage: 'LAND_PREPARATION', data: { type: 'Làm đất vụ mới', method: 'Cày xới thủ công + hữu cơ', soilPhBefore: 5.2, soilPhAfter: 5.8 }, timestamp: '2024-04-10T06:00:00.000Z' },
      { stage: 'CROP_MONITORING', data: { growthStage: 'Phát triển trái', healthScore: 88.0, pestPressure: 'Thấp', alert: false }, timestamp: '2024-09-15T14:00:00.000Z' },
      { stage: 'FERTILIZER_APPLICATION', data: { type: 'Hữu cơ', name: 'Phân chuồng ủ hoai', isOrganic: true, quantity: 4.0 }, timestamp: '2024-08-05T07:30:00.000Z' },
      { stage: 'PEST_DISEASE', data: { pest: 'Rệp sáp bột hồng', severity: 'Thấp', treatment: 'Sinh học', outcome: 'Kiểm soát tốt' }, timestamp: '2024-08-15T11:00:00.000Z' },
      { stage: 'HARVEST', data: { farmer: farmer1.fullName, date: '2024-11-10', method: 'Selective Picking', weight: 3200 }, timestamp: '2024-11-10T07:30:00.000Z' },
      { stage: 'PROCUREMENT', data: { centre: 'Trạm thu mua Ea Tam', netWeight: 3200, pricePerKg: 8500, payment: 'Completed' }, timestamp: '2024-11-11T08:00:00.000Z' },
      { stage: 'PROCESSING', data: { method: 'Rửa', inputWeight: 3185, outputWeight: 640, outturn: 20.1, cupScore: 82.5 }, timestamp: '2024-11-13T06:00:00.000Z' },
      { stage: 'CERTIFICATION', data: { standard: 'Organic', status: 'Đạt', score: 92.0, certBody: 'Control Union Việt Nam' }, timestamp: '2024-06-15T09:00:00.000Z' },
      { stage: 'INSPECTION', data: { inspector: 'Nguyễn Thị Lan', grade: 'Grade 1 - Xuất khẩu', cupScore: 82.5, passFail: 'Pass' }, timestamp: '2024-11-15T10:00:00.000Z' },
      { stage: 'MARKETPLACE', data: { title: 'Cà phê Robusta Chari Grade 1', quantity: 3000, pricePerKg: 55000, status: 'Đang bán' }, timestamp: '2024-11-20T12:00:00.000Z' },
    ]

    const chainStages2 = [
      { stage: 'FARMER_REGISTRATION', data: { farmer: farmer2.fullName, code: farmer2.farmerCode, province: farmer2.province, country: farmer2.country }, timestamp: '2024-01-10T08:00:00.000Z' },
      { stage: 'FARMLAND_REGISTRATION', data: { farm: farmLand2.farmName, area: farmLand2.totalLandHolding, altitude: farmLand2.altitude, soilType: farmLand2.soilType }, timestamp: '2024-01-18T09:00:00.000Z' },
      { stage: 'CULTIVATION', data: { plot: cultivationRecords['c2'].farmPlotName, crop: cultivationRecords['c2'].cultivatedCrop, variety: cultivationRecords['c2'].cropVariety, intercropping: 'Durian 5:1' }, timestamp: '2024-02-05T10:00:00.000Z' },
      { stage: 'NURSERY', data: { name: 'Vườn ươm Hữu cơ Ea Drăng', species: 'Coffea arabica', variety: 'Catimor', germinationRate: 89.0 }, timestamp: '2024-03-05T07:00:00.000Z' },
      { stage: 'LAND_PREPARATION', data: { type: 'Bổ sung dinh dưỡng', method: 'Bón hữu cơ + che phủ', soilPhBefore: 5.5, soilPhAfter: 6.0 }, timestamp: '2024-03-25T06:00:00.000Z' },
      { stage: 'CROP_MONITORING', data: { growthStage: 'Chín trái', healthScore: 72.0, pestPressure: 'Trung bình', alert: true }, timestamp: '2024-09-20T14:00:00.000Z' },
      { stage: 'FERTILIZER_APPLICATION', data: { type: 'Hữu cơ sinh học', name: 'Trichoderma + Phân gà ủ', isOrganic: true, quantity: 2.25 }, timestamp: '2024-07-20T07:30:00.000Z' },
      { stage: 'PEST_DISEASE', data: { pest: 'Gỉ sắt (Coffee Leaf Rust)', severity: 'Trung bình', treatment: 'Sinh học', outcome: 'Đang theo dõi' }, timestamp: '2024-09-22T11:00:00.000Z' },
      { stage: 'HARVEST', data: { farmer: farmer2.fullName, date: '2024-10-20', method: 'Selective Picking', weight: 2500 }, timestamp: '2024-10-20T06:45:00.000Z' },
      { stage: 'PROCUREMENT', data: { centre: 'Trạm thu mua Ea Drăng', netWeight: 2530, pricePerKg: 18000, payment: 'Completed' }, timestamp: '2024-10-21T08:00:00.000Z' },
      { stage: 'PROCESSING', data: { method: 'Tự nhiên', inputWeight: 2515, outputWeight: 505, outturn: 20.1, cupScore: 85.0 }, timestamp: '2024-10-23T06:00:00.000Z' },
      { stage: 'CERTIFICATION', data: { standard: 'Fair Trade', status: 'Đạt', score: 87.5, certBody: 'FLO-CERT GmbH' }, timestamp: '2024-05-20T09:00:00.000Z' },
      { stage: 'INSPECTION', data: { inspector: 'Nguyễn Thị Lan', grade: 'Specialty Grade', cupScore: 85.0, passFail: 'Pass' }, timestamp: '2024-10-25T10:00:00.000Z' },
      { stage: 'MARKETPLACE', data: { title: 'Arabica Catimor Natural Specialty', quantity: 1500, pricePerKg: 120000, status: 'Đang bán' }, timestamp: '2024-10-28T12:00:00.000Z' },
    ]

    for (const [batchIdx, { batchId, stages }] of [
      [0, { batchId: batchId1, stages: chainStages1 }],
      [1, { batchId: batchId2, stages: chainStages2 }],
    ] as const) {
      let previousHash = '0'.repeat(64)
      for (let i = 0; i < stages.length; i++) {
        const s = stages[i]
        // Check if block already exists
        const existing = await db.hashChainBlock.findUnique({ where: { tenantId_batchId_blockIndex: { tenantId: tenant.id, batchId, blockIndex: i } } })
        if (!existing) {
          const dataStr = JSON.stringify(s.data)
          const dataHash = computeDataHash(dataStr)
          const timestamp = s.timestamp
          const blockHash = computeBlockHash(dataHash, previousHash, timestamp)
          await db.hashChainBlock.create({
            data: { tenantId: tenant.id, batchId, blockIndex: i, stage: s.stage, data: dataStr, dataHash, previousHash, blockHash, timestamp: new Date(timestamp) },
          })
          previousHash = blockHash
          console.log(`  ✅ HashChainBlock ${batchId} [${i}] ${s.stage} created`)
        } else {
          previousHash = existing.blockHash
        }
      }
    }
    console.log('  ✅ Hash chain blocks complete')

    // ═══════════════════════════════════════════════════
    // 23. Audit Log
    // ═══════════════════════════════════════════════════
    const existingAudit = await db.auditLog.findFirst({ where: { tenantId: tenant.id, entity: 'Tenant', action: 'SEED_ENHANCED' } })
    if (!existingAudit) {
      await db.auditLog.create({ data: { tenantId: tenant.id, userId: adminUser.id, action: 'SEED_ENHANCED', entity: 'Tenant', entityId: tenant.id, details: JSON.stringify({ message: 'Enhanced seed: 5 farmers (3 VN + 1 ET + 1 KE), 5 farmlands with GeoJSON, intercropping, complete E2E pipeline for 2 batches, 14-stage hash chains' }) } })
    }

    console.log('\n  ✅ All enhanced demo data created')
    console.log('\n  ══════════════════════════════════════════')
    console.log('  🔑 Login Credentials:')
    console.log('  ──────────────────────────────────────────')
    console.log('  Super Admin: admin@terrabrew.platform / Admin@2024')
    console.log('  Tenant Admin: admin@metrang-coffee.terrabrew.com / Admin@2024')
    console.log('  Tenant Slug: metrang-coffee')
    console.log('  ──────────────────────────────────────────')
    console.log('  📦 Traceability Batch IDs:')
    console.log(`  • ${batchId1} (Nguyễn Văn Thanh - Robusta Chari)`)
    console.log(`  • ${batchId2} (Trần Thị Hoa - Arabica Catimor)`)
    console.log('  ──────────────────────────────────────────')
    console.log('  🌍 Multi-Region Farmers:')
    console.log('  • FRM-VN-001..003: Vietnam (Đắk Lắk)')
    console.log('  • FRM-ET-001: Ethiopia (Yirgacheffe)')
    console.log('  • FRM-KE-001: Kenya (Nyeri)')
    console.log('  ══════════════════════════════════════════\n')

    // ═══════════════════════════════════════════════════
    // 15. Multi-Country Tenants (NEW)
    // ═══════════════════════════════════════════════════
    await seedMultiCountryTenants(moduleDefs)

    // Seed platform settings
    await seedPlatformSettings()

    console.log('🎉 Enhanced seeding complete!\n')

  } catch (e: any) {
    console.error('\n❌ Seed error:', e.message)
    if (e.meta) console.error('  Meta:', JSON.stringify(e.meta))
    throw e
  } finally {
    await db.$disconnect()
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

// ─── Multi-Country Tenants ────────────────────────────────
async function seedMultiCountryTenants(moduleDefs: { slug: string }[]) {
  console.log('\n  🌍 Seeding Multi-Country Tenants...\n')

  const tenantDefs = [
    {
      slug: 'yirgacheffe-union',
      name: 'Yirga Cheffe Union',
      country: 'ET',
      countryCode: 'ET',
      currency: 'ETB',
      currencySymbol: 'Br',
      language: 'en',
      locale: 'en-ET',
      timezone: 'Africa/Addis_Ababa',
      dateFormat: 'DD/MM/YYYY',
      region: 'Africa',
      legalName: 'Yirga Cheffe Farmers Cooperative Union',
      certifications: JSON.stringify(['Organic', 'Fair Trade']),
      adminName: 'Yirga Cheffe Admin',
      farmers: [
        {
          farmerCode: 'FRM-YC-001',
          fullName: 'Dinknesh Gebremeskel',
          firstName: 'Dinknesh',
          lastName: 'Gebremeskel',
          contactNumber: '+251911234567',
          gender: 'Female',
          dob: new Date('1985-04-12'),
          education: 'Secondary',
          province: 'Gedeo',
          district: 'Yirgacheffe',
          commune: 'Wote',
          village: 'Konga',
          latitude: 6.155,
          longitude: 38.195,
          nationalIdType: 'Kebele ID',
          nationalIdNo: 'ET-YC-7821',
          cooperative: 'Yirga Cheffe Union',
          creditScore: 80,
          yearsOfFarmingExperience: 14,
          farmName: 'Konga Heirloom Garden',
          plotBlockId: 'YC-PLT-001',
          totalLandHolding: 1.8,
          altitude: 1920,
          soilType: 'Nitisol',
          estYield: 2200,
          cropName: 'Yirgacheffe Heirloom Plot',
          cropVariety: 'Heirloom',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 1.5,
        },
        {
          farmerCode: 'FRM-YC-002',
          fullName: 'Tadesse Alemu',
          firstName: 'Tadesse',
          lastName: 'Alemu',
          contactNumber: '+251922345678',
          gender: 'Male',
          dob: new Date('1979-08-25'),
          education: 'Primary',
          province: 'Gedeo',
          district: 'Yirgacheffe',
          commune: 'Biloya',
          village: 'Biloya Zuria',
          latitude: 6.170,
          longitude: 38.210,
          nationalIdType: 'Kebele ID',
          nationalIdNo: 'ET-YC-3456',
          cooperative: 'Yirga Cheffe Union',
          creditScore: 75,
          yearsOfFarmingExperience: 18,
          farmName: 'Biloya Washed Station Farm',
          plotBlockId: 'YC-PLT-002',
          totalLandHolding: 2.2,
          altitude: 1880,
          soilType: 'Red Brown Soil',
          estYield: 2600,
          cropName: 'Biloya Washed Lot',
          cropVariety: 'Kurume',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 2.0,
        },
      ],
    },
    {
      slug: 'nyeri-highlands',
      name: 'Nyeri Highlands Coop',
      country: 'KE',
      countryCode: 'KE',
      currency: 'KES',
      currencySymbol: 'KSh',
      language: 'en',
      locale: 'en-KE',
      timezone: 'Africa/Nairobi',
      dateFormat: 'DD/MM/YYYY',
      region: 'Africa',
      legalName: 'Nyeri Highlands Farmers Cooperative Society',
      certifications: JSON.stringify(['Fair Trade', 'Rainforest Alliance']),
      adminName: 'Nyeri Highlands Admin',
      farmers: [
        {
          farmerCode: 'FRM-NH-001',
          fullName: 'Wanjiku Mwangi',
          firstName: 'Wanjiku',
          lastName: 'Mwangi',
          contactNumber: '+254723456789',
          gender: 'Female',
          dob: new Date('1990-02-14'),
          education: 'College',
          province: 'Central',
          district: 'Nyeri',
          commune: 'Othaya',
          village: 'Gathaithi',
          latitude: -0.425,
          longitude: 36.945,
          nationalIdType: 'National ID',
          nationalIdNo: 'KE-29837465',
          cooperative: 'Nyeri Highlands Coop',
          creditScore: 88,
          yearsOfFarmingExperience: 8,
          farmName: 'Gathaithi SL28 Estate',
          plotBlockId: 'NH-PLT-001',
          totalLandHolding: 1.6,
          altitude: 1720,
          soilType: 'Volcanic Loam',
          estYield: 2400,
          cropName: 'Gathaithi SL28 Plot',
          cropVariety: 'SL28',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 1.4,
        },
        {
          farmerCode: 'FRM-NH-002',
          fullName: 'Maina Karanja',
          firstName: 'Maina',
          lastName: 'Karanja',
          contactNumber: '+254734567890',
          gender: 'Male',
          dob: new Date('1983-11-03'),
          education: 'Secondary',
          province: 'Central',
          district: 'Nyeri',
          commune: 'Mukurwe-ini',
          village: 'Gatango',
          latitude: -0.450,
          longitude: 36.980,
          nationalIdType: 'National ID',
          nationalIdNo: 'KE-31284957',
          cooperative: 'Nyeri Highlands Coop',
          creditScore: 82,
          yearsOfFarmingExperience: 12,
          farmName: 'Gatango Ruiru 11 Farm',
          plotBlockId: 'NH-PLT-002',
          totalLandHolding: 2.5,
          altitude: 1650,
          soilType: 'Nitisol',
          estYield: 3000,
          cropName: 'Gatango Ruiru Plot',
          cropVariety: 'Ruiru 11',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 2.2,
        },
      ],
    },
    {
      slug: 'png-highland-coffee',
      name: 'PNG Highland Coffee',
      country: 'PG',
      countryCode: 'PG',
      currency: 'PGK',
      currencySymbol: 'K',
      language: 'en',
      locale: 'en-PG',
      timezone: 'Pacific/Port_Moresby',
      dateFormat: 'DD/MM/YYYY',
      region: 'Oceania',
      legalName: 'PNG Highland Coffee Growers Ltd',
      certifications: JSON.stringify(['Organic']),
      adminName: 'PNG Highland Admin',
      farmers: [
        {
          farmerCode: 'FRM-PG-001',
          fullName: 'Kua Aroma',
          firstName: 'Kua',
          lastName: 'Aroma',
          contactNumber: '+67571234567',
          gender: 'Male',
          dob: new Date('1975-06-20'),
          education: 'Primary',
          province: 'Eastern Highlands',
          district: 'Goroka',
          commune: 'Bena',
          village: 'Sigmiri',
          latitude: -6.080,
          longitude: 145.390,
          nationalIdType: 'Village ID',
          nationalIdNo: 'PG-EH-4521',
          cooperative: 'PNG Highland Coffee',
          creditScore: 70,
          yearsOfFarmingExperience: 20,
          farmName: 'Sigmiri Mountain Garden',
          plotBlockId: 'PG-PLT-001',
          totalLandHolding: 3.0,
          altitude: 1550,
          soilType: 'Volcanic',
          estYield: 2800,
          cropName: 'Sigmiri Arabica Plot',
          cropVariety: 'Arusha',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 2.5,
        },
        {
          farmerCode: 'FRM-PG-002',
          fullName: 'Ruth Kepo',
          firstName: 'Ruth',
          lastName: 'Kepo',
          contactNumber: '+67572345678',
          gender: 'Female',
          dob: new Date('1988-01-08'),
          education: 'Secondary',
          province: 'Western Highlands',
          district: 'Mount Hagen',
          commune: 'Baiyer',
          village: 'Kwip',
          latitude: -5.850,
          longitude: 144.250,
          nationalIdType: 'Village ID',
          nationalIdNo: 'PG-WH-6789',
          cooperative: 'PNG Highland Coffee',
          creditScore: 73,
          yearsOfFarmingExperience: 10,
          farmName: 'Kwip Valley Garden',
          plotBlockId: 'PG-PLT-002',
          totalLandHolding: 2.0,
          altitude: 1400,
          soilType: 'Loam',
          estYield: 2100,
          cropName: 'Kwip Blue Mountain Plot',
          cropVariety: 'Blue Mountain',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 1.8,
        },
      ],
    },
    {
      slug: 'cerrado-mineiro',
      name: 'Cerrado Mineiro Farm',
      country: 'BR',
      countryCode: 'BR',
      currency: 'BRL',
      currencySymbol: 'R$',
      language: 'pt',
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      region: 'South America',
      legalName: 'Fazenda Cerrado Mineiro Ltda',
      certifications: JSON.stringify(['Cerrado Mineiro DOC', 'Rainforest Alliance', 'UTZ']),
      adminName: 'Cerrado Mineiro Admin',
      farmers: [
        {
          farmerCode: 'FRM-CM-001',
          fullName: 'Carlos Eduardo Silva',
          firstName: 'Carlos Eduardo',
          lastName: 'Silva',
          contactNumber: '+553499123456',
          gender: 'Male',
          dob: new Date('1982-09-30'),
          education: 'University',
          province: 'Minas Gerais',
          district: 'Patrocinio',
          commune: 'Cerrado',
          village: 'Fazenda Santa Lucia',
          latitude: -18.950,
          longitude: -46.990,
          nationalIdType: 'CPF',
          nationalIdNo: 'BR-12345678901',
          cooperative: 'Cerrado Mineiro Farm',
          creditScore: 92,
          yearsOfFarmingExperience: 15,
          farmName: 'Fazenda Santa Lucia',
          plotBlockId: 'CM-PLT-001',
          totalLandHolding: 25.0,
          altitude: 950,
          soilType: 'Latossolo Vermelho',
          estYield: 45000,
          cropName: 'Santa Lucia Cerrado Plot',
          cropVariety: 'Catuai',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 20.0,
        },
        {
          farmerCode: 'FRM-CM-002',
          fullName: 'Ana Beatriz Santos',
          firstName: 'Ana Beatriz',
          lastName: 'Santos',
          contactNumber: '+553499234567',
          gender: 'Female',
          dob: new Date('1990-05-15'),
          education: 'University',
          province: 'Minas Gerais',
          district: 'Patrocinio',
          commune: 'Cerrado',
          village: 'Fazenda Boa Vista',
          latitude: -18.980,
          longitude: -47.020,
          nationalIdType: 'CPF',
          nationalIdNo: 'BR-98765432100',
          cooperative: 'Cerrado Mineiro Farm',
          creditScore: 89,
          yearsOfFarmingExperience: 7,
          farmName: 'Fazenda Boa Vista',
          plotBlockId: 'CM-PLT-002',
          totalLandHolding: 18.0,
          altitude: 1020,
          soilType: 'Latossolo',
          estYield: 32000,
          cropName: 'Boa Vista Specialty Plot',
          cropVariety: 'Mundo Novo',
          coffeeSpecies: 'Coffea arabica',
          cultivationArea: 15.0,
        },
      ],
    },
  ]

  for (const td of tenantDefs) {
    // Check if tenant already exists
    let newTenant = await db.tenant.findUnique({ where: { slug: td.slug } })
    if (newTenant) {
      console.log(`  ℹ️  Tenant ${td.slug} already exists, skipping`)
      continue
    }

    // Create tenant
    newTenant = await db.tenant.create({
      data: {
        slug: td.slug,
        name: td.name,
        legalName: td.legalName,
        country: td.country,
        countryCode: td.countryCode,
        currency: td.currency,
        currencySymbol: td.currencySymbol,
        language: td.language,
        locale: td.locale,
        timezone: td.timezone,
        dateFormat: td.dateFormat,
        region: td.region,
        eudrCompliant: true,
        certifications: td.certifications,
        plan: 'professional',
        maxUsers: 15,
        maxFarmers: 500,
        enabledModules: JSON.stringify(Object.fromEntries(moduleDefs.map(m => [m.slug, true]))),
        isActive: true,
      },
    })
    console.log(`  ✅ Tenant ${td.slug} created`)

    // Create tenant admin
    const adminEmail = `admin@${td.slug}.terrabrew.com`
    const adminHash = await bcrypt.hash('Admin@2024', 12)
    const newAdmin = await db.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminHash,
        name: td.adminName,
        role: 'tenant_admin',
        tenantId: newTenant.id,
      },
    })
    console.log(`  ✅ Admin ${adminEmail} created`)

    // Create farmers, farmlands, and cultivations
    for (const farmer of td.farmers) {
      const existingFarmer = await db.farmer.findUnique({
        where: { farmerCode_tenantId: { farmerCode: farmer.farmerCode, tenantId: newTenant.id } },
      })
      if (existingFarmer) {
        console.log(`  ℹ️  Farmer ${farmer.farmerCode} already exists`)
        continue
      }

      const newFarmer = await db.farmer.create({
        data: {
          tenantId: newTenant.id,
          createdBy: newAdmin.id,
          farmerCode: farmer.farmerCode,
          enrollmentPlace: `${td.name} Office`,
          isCertified: true,
          certificationType: 'Cooperative',
          yearOfICS: '2023',
          cooperative: farmer.cooperative,
          fullName: farmer.fullName,
          firstName: farmer.firstName,
          lastName: farmer.lastName,
          contactNumber: farmer.contactNumber,
          gender: farmer.gender,
          dob: farmer.dob,
          education: farmer.education,
          maritalStatus: 'Married',
          noOfFamilyMembers: 4,
          country: td.country,
          province: farmer.province,
          district: farmer.district,
          commune: farmer.commune,
          village: farmer.village,
          latitude: farmer.latitude,
          longitude: farmer.longitude,
          housingOwnership: 'Owned',
          houseType: 'Traditional',
          smartphoneOwnership: true,
          loanTaken: false,
          nationalIdType: farmer.nationalIdType,
          nationalIdNo: farmer.nationalIdNo,
          healthInsurance: true,
          creditScore: farmer.creditScore,
          yearsOfFarmingExperience: farmer.yearsOfFarmingExperience,
          isActive: true,
        },
      })
      console.log(`  ✅ Farmer ${farmer.farmerCode}: ${farmer.fullName} created`)

      // Create farmland
      const newFarmLand = await db.farmLand.create({
        data: {
          tenantId: newTenant.id,
          farmerId: newFarmer.id,
          createdBy: newAdmin.id,
          farmName: farmer.farmName,
          plotBlockId: farmer.plotBlockId,
          totalLandHolding: farmer.totalLandHolding,
          altitude: farmer.altitude,
          agroEcologicalZone: td.region,
          latitude: farmer.latitude,
          longitude: farmer.longitude,
          landOwnership: 'Owned',
          soilType: farmer.soilType,
          irrigationSource: 'Rainfed',
          irrigationType: 'Rain',
          noOfTrees: Math.round(farmer.totalLandHolding * 1200),
          shadeTreeSpecies: 'Native trees',
          shadeTreeDensity: 300,
          fullTimeWorkers: 2,
          partTimeWorkers: 1,
          seasonalWorkers: 4,
          familyWorkers: 2,
          childLabourPolicy: true,
          minimumWageCompliance: true,
          ppeAvailable: true,
          estYield: farmer.estYield,
          conversionCertType: 'Organic',
          currentConversionStatus: 'Certified',
          fertilityStatus: 'Good',
          waterSource: 'Rain',
          powerSource: 'Solar',
          polygonGeoJson: makePolygonGeoJson(farmer.latitude, farmer.longitude),
          boundaryArea: farmer.totalLandHolding,
          geoCenterLat: farmer.latitude,
          geoCenterLng: farmer.longitude,
          isActive: true,
        },
      })
      console.log(`  ✅ FarmLand ${farmer.plotBlockId}: ${farmer.farmName} created`)

      // Create cultivation record
      await db.cultivation.create({
        data: {
          tenantId: newTenant.id,
          farmerId: newFarmer.id,
          farmLandId: newFarmLand.id,
          createdBy: newAdmin.id,
          farmPlotName: farmer.cropName,
          plotBlockId: `${farmer.plotBlockId}-C1`,
          cropCategory: 'Main Crop',
          cultivatedCrop: `${td.name} ${farmer.cropVariety}`,
          cropVariety: farmer.cropVariety,
          coffeeSpecies: farmer.coffeeSpecies,
          cultivationArea: farmer.cultivationArea,
          plantingSpacing: 2.5,
          treeDensity: 1200,
          sowingDate: new Date('2020-03-15'),
          estYield: `${farmer.estYield} kg/ha`,
          intendedProcessingMethod: 'Washed',
          irrigationMethod: 'Rain-fed',
          shadeCover: 30,
          latitude: farmer.latitude,
          longitude: farmer.longitude,
          seedSource: 'Local certified nursery',
          isSeedTreated: true,
          seedType: 'Certified',
          isPrimaryCrop: true,
          isActive: true,
        },
      })
      console.log(`  ✅ Cultivation for ${farmer.farmerCode} created`)
    }
  }

  console.log('\n  🌍 Multi-Country Tenants seeding complete!\n')
}

// ─── Default Platform Settings ────────────────────────────────
async function seedPlatformSettings() {
  const settings = [
    { category: 'platform', key: 'name', value: 'Terra Brew', valueType: 'string', description: 'Platform display name', isPublic: true },
    { category: 'platform', key: 'defaultLanguage', value: 'vi', valueType: 'string', description: 'Default language for new tenants', isPublic: true },
    { category: 'platform', key: 'defaultCurrency', value: 'VND', valueType: 'string', description: 'Default currency for new tenants', isPublic: true },
    { category: 'platform', key: 'supportEmail', value: 'support@terrabrew.platform', valueType: 'string', description: 'Platform support email', isPublic: true },
    { category: 'platform', key: 'defaultTimezone', value: 'Asia/Ho_Chi_Minh', valueType: 'string', description: 'Default timezone', isPublic: true },
    { category: 'api', key: 'rateLimitPerMinute', value: '100', valueType: 'number', description: 'API rate limit per minute per tenant', isPublic: false },
    { category: 'api', key: 'webhookUrl', value: '', valueType: 'string', description: 'Global webhook URL for platform events', isPublic: false },
    { category: 'api', key: 'maxBatchSize', value: '50', valueType: 'number', description: 'Max items per API batch request', isPublic: true },
    { category: 'email', key: 'smtpHost', value: '', valueType: 'string', description: 'SMTP server host', isPublic: false },
    { category: 'email', key: 'smtpPort', value: '587', valueType: 'number', description: 'SMTP server port', isPublic: false },
    { category: 'email', key: 'smtpUser', value: '', valueType: 'string', description: 'SMTP username', isPublic: false },
    { category: 'email', key: 'fromEmail', value: 'noreply@terrabrew.platform', valueType: 'string', description: 'Default from email address', isPublic: true },
    { category: 'theme', key: 'primaryColor', value: '#8b5a1e', valueType: 'string', description: 'Platform primary color', isPublic: true },
    { category: 'theme', key: 'logoUrl', value: '/logo.svg', valueType: 'string', description: 'Platform logo URL', isPublic: true },
    { category: 'theme', key: 'faviconUrl', value: '/logo.svg', valueType: 'string', description: 'Platform favicon URL', isPublic: true },
    { category: 'security', key: 'sessionTimeout', value: '86400', valueType: 'number', description: 'Session timeout in seconds', isPublic: false },
    { category: 'security', key: 'maxLoginAttempts', value: '5', valueType: 'number', description: 'Max login attempts before lockout', isPublic: true },
    { category: 'security', key: 'passwordMinLength', value: '8', valueType: 'number', description: 'Minimum password length', isPublic: true },
    { category: 'notification', key: 'enableEmailNotifications', value: 'true', valueType: 'boolean', description: 'Enable email notifications', isPublic: true },
    { category: 'notification', key: 'enablePushNotifications', value: 'false', valueType: 'boolean', description: 'Enable push notifications', isPublic: true },
  ]

  for (const s of settings) {
    await db.platformSetting.upsert({
      where: { category_key: { category: s.category, key: s.key } },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('  ✅ Platform settings seeded')
}

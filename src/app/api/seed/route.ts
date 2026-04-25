import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, computeDataHash, computeBlockHash } from '@/lib/crypto'

export async function POST(req: Request) {
  try {
    // 1. Create Platform Super Admin
    const platformEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@terrabrew.platform'
    const existingPlatform = await db.platformUser.findUnique({ where: { email: platformEmail } })
    if (!existingPlatform) {
      const hash = await hashPassword(process.env.PLATFORM_ADMIN_PASSWORD || 'Admin@2024')
      await db.platformUser.create({ data: { email: platformEmail, passwordHash: hash, name: 'Platform Admin', role: 'super_admin' } })
    }

    // 2. Ensure modules exist
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

    // 3. Create Metrang Coffee Tenant
    const tenantSlug = 'metrang-coffee'
    let tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } })

    if (!tenant) {
      tenant = await db.tenant.create({
        data: {
          slug: tenantSlug,
          name: 'Metrang Coffee',
          legalName: 'Công ty TNHH Metrang Coffee',
          currency: 'VND',
          currencySymbol: '₫',
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
          dateFormat: 'DD/MM/YYYY',
          country: 'VN',
          eudrCompliant: true,
          certifications: JSON.stringify(['Organic', 'Fair Trade', 'UTZ']),
          plan: 'professional',
          maxUsers: 25,
          maxFarmers: 1000,
          enabledModules: Object.fromEntries(moduleDefs.map(m => [m.slug, true])),
        },
      })
    }

    // Check if data already seeded
    const existingFarmers = await db.farmer.count({ where: { tenantId: tenant.id } })
    if (existingFarmers > 0) {
      return NextResponse.json({
        success: true,
        message: 'Metrang Coffee tenant already seeded',
        tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
        adminEmail: `admin@${tenantSlug}.terrabrew.com`,
        adminPassword: 'Admin@2024',
      })
    }

    // 4. Create Tenant Admin
    const adminEmail = `admin@${tenantSlug}.terrabrew.com`
    const adminHash = await hashPassword('Admin@2024')
    const adminUser = await db.user.create({
      data: { email: adminEmail, passwordHash: adminHash, name: 'Quản trị viên Metrang', role: 'tenant_admin', tenantId: tenant.id },
    })

    const BATCH_PREFIX = 'TB'
    const uid = () => Math.random().toString(36).substring(2, 8).toUpperCase()

    // 5. Create Farmers
    const farmer1 = await db.farmer.create({ data: {
      tenantId: tenant.id, createdBy: adminUser.id,
      farmerCode: `FRM-${uid()}`, enrollmentPlace: 'Tại nhà nông dân',
      isCertified: true, certificationType: 'Cá nhân', yearOfICS: '2022', cooperative: 'Hợp tác xã Cà phê Ea Tam',
      fullName: 'Nguyễn Văn Thanh', firstName: 'Thanh', lastName: 'Nguyễn',
      contactNumber: '0912345678', gender: 'Nam', dob: new Date('1985-03-15'),
      education: 'Trung học', maritalStatus: 'Đã kết hôn', spouseName: 'Trần Thị Mai',
      noOfFamilyMembers: 4, country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar',
      commune: 'Ea Tam', village: "Buôn K'Mang", zipCode: '630000',
      latitude: 12.668, longitude: 108.038,
      housingOwnership: 'Sở hữu', houseType: 'Nhà gạch', smartphoneOwnership: true,
      loanTaken: false, nationalIdType: 'CCCD', nationalIdNo: '795284610382',
      lifeInsurance: true, healthInsurance: true, creditScore: 82,
      yearsOfFarmingExperience: 12, isActive: true,
    }})

    const farmer2 = await db.farmer.create({ data: {
      tenantId: tenant.id, createdBy: adminUser.id,
      farmerCode: `FRM-${uid()}`, enrollmentPlace: 'Văn phòng HTX',
      isCertified: true, certificationType: 'Tập thể', yearOfICS: '2023', cooperative: 'Nông trại Hữu cơ Ea Drăng',
      fullName: 'Trần Thị Hoa', firstName: 'Hoa', lastName: 'Trần',
      contactNumber: '0923456789', gender: 'Nữ', dob: new Date('1990-07-22'),
      education: 'Tiểu học', maritalStatus: 'Đã kết hôn', spouseName: 'Lê Văn Đức',
      noOfFamilyMembers: 5, country: 'Việt Nam', province: 'Đắk Lắk', district: 'Cư Mgar',
      commune: 'Ea Drăng', village: 'Ea Pok', zipCode: '630000',
      latitude: 12.692, longitude: 108.055,
      housingOwnership: 'Thuê', houseType: 'Nhà gỗ', smartphoneOwnership: true,
      loanTaken: true, loanTakenFrom: 'Vietcombank', loanAmount: 30000000, loanPurpose: 'Mở rộng nông trại',
      loanInterest: 7.5, loanSecurity: true, nationalIdType: 'CCCD', nationalIdNo: '794827364518',
      cropInsurance: true, healthInsurance: true, creditScore: 76,
      yearsOfFarmingExperience: 8, gapTrainingAttended: true, isActive: true,
    }})

    // 6. Farm Lands
    const farmLand1 = await db.farmLand.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, createdBy: adminUser.id,
      farmName: "Nông trại Tây Nguyên Thanh", plotBlockId: 'TB-PLT-001',
      totalLandHolding: 2.5, altitude: 850, agroEcologicalZone: 'Tây Nguyên',
      latitude: 12.668, longitude: 108.038, landOwnership: 'Sở hữu',
      soilType: 'Ferralitic', irrigationSource: 'Tưới tiêu', irrigationType: 'Nhỏ giọt',
      noOfTrees: 2800, shadeTreeSpecies: 'Đậu cô nong, Keo dậu', shadeTreeDensity: 400,
      fullTimeWorkers: 2, partTimeWorkers: 1, seasonalWorkers: 3, familyWorkers: 2,
      childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
      estYield: 3500, conversionCertType: 'Hữu cơ', currentConversionStatus: 'Đã chứng nhận',
      fertilityStatus: 'Tốt', waterSource: 'Giếng khoan', powerSource: 'Điện lưới',
      isActive: true,
    }})

    const farmLand2 = await db.farmLand.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, createdBy: adminUser.id,
      farmName: "Vườn Hữu cơ Hoa", plotBlockId: 'TB-PLT-002',
      totalLandHolding: 1.8, altitude: 920, agroEcologicalZone: 'Tây Nguyên',
      latitude: 12.692, longitude: 108.055, landOwnership: 'Thuê',
      soilType: 'Núi lửa', irrigationSource: 'Tự nhiên', irrigationType: 'Phun mưa',
      noOfTrees: 2000, shadeTreeSpecies: 'Gliricidia, Inga', shadeTreeDensity: 350,
      fullTimeWorkers: 1, partTimeWorkers: 2, seasonalWorkers: 4, familyWorkers: 3,
      childLabourPolicy: true, minimumWageCompliance: true, ppeAvailable: true,
      estYield: 2800, conversionCertType: 'Hữu cơ + Thương mại Công bằng',
      currentConversionStatus: 'Đã chứng nhận',
      fertilityStatus: 'Rất tốt', waterSource: 'Sông', powerSource: 'Điện mặt trời + Lưới',
      isActive: true,
    }})

    // 7. Cultivations
    const cultivation1 = await db.cultivation.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id,
      farmPlotName: 'Lô Robusta A1', plotBlockId: 'TB-PLT-001-A1',
      cropCategory: 'Vụ chính', intercroppingSpecies: 'Tiêu, Bơ',
      harvestSeason: 'Tháng 11/2024 - Tháng 1/2025',
      cultivatedCrop: 'Cà phê Robusta', cropVariety: 'Chari', coffeeSpecies: 'Coffea canephora',
      cultivationArea: 2.0, plantingSpacing: 3.0, treeDensity: 1400,
      sowingDate: new Date('2020-06-15'), estYield: '3500 kg/ha',
      intendedProcessingMethod: 'Rửa', irrigationMethod: 'Nhỏ giọt', shadeCover: 25,
      latitude: 12.668, longitude: 108.038,
      seedSource: 'Tự giữ (cây giống chứng nhận)', isSeedTreated: true,
      treatmentDetails: 'Phủ Trichoderma', seedType: 'Chứng nhận 1',
      seedQuantity: 3000, seedPrice: 5000, seedCost: 15000000,
      isActive: true,
    }})

    const cultivation2 = await db.cultivation.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id,
      farmPlotName: 'Lô Arabica B1', plotBlockId: 'TB-PLT-002-B1',
      cropCategory: 'Vụ chính', intercroppingSpecies: 'Chuối, Macadamia',
      harvestSeason: 'Tháng 10/2024 - Tháng 12/2024',
      cultivatedCrop: 'Cà phê Arabica', cropVariety: 'Catimor', coffeeSpecies: 'Coffea arabica',
      cultivationArea: 1.5, plantingSpacing: 2.5, treeDensity: 1600,
      sowingDate: new Date('2019-09-10'), estYield: '2800 kg/ha',
      intendedProcessingMethod: 'Tự nhiên', irrigationMethod: 'Phun mưa', shadeCover: 30,
      latitude: 12.692, longitude: 108.055,
      seedSource: 'Vườn ươm - Trung tâm giống Ea Drăng', isSeedTreated: true,
      seedType: 'Cải tiến', seedQuantity: 2400, seedPrice: 8000, seedCost: 19200000,
      isActive: true,
    }})

    // 8. Harvest Traceability
    const batchId1 = `${BATCH_PREFIX}-BATCH-2024-001`
    const batchId2 = `${BATCH_PREFIX}-BATCH-2024-002`

    await db.harvestTraceability.create({ data: {
      tenantId: tenant.id, cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
      plannedHarvestDate: new Date('2024-11-01'), plotBlockId: 'TB-PLT-001-A1',
      coffeeVariety: 'Chari (Robusta)', estimatedYield: '3500 kg',
      actualHarvestDate: new Date('2024-11-10'), harvestMethod: 'Chọn hái',
      cherryRipeness: 92.0, harvestLabourCost: 3500000,
      sampleWeight: 5.0, sampleArea: 0.01, sampleYield: 500, estimatedYieldPerHa: 3500,
      processingMethod: 'Rửa', dryingMethod: 'Giường nâng (African)', dryingDurationDays: 14,
      targetMoisture: 11.0, moistureContent: 10.8, defectiveBeans: 2.1, foreignMatter: 0.05,
      cupScore: 82.5, batchId: batchId1, coffeeVarietyAtBatch: 'Chari (Robusta)',
      processingStage: 'Đã thu hoạch', batchTimestamp: new Date('2024-11-10T07:30:00'),
      location: "Nông trại Thanh, Ea Tam, Cư Mgar", actor: 'Nguyễn Văn Thanh',
      batchNotes: 'Chất lượng hái chọn tốt, độ chín xuất sắc', isActive: true,
    }})

    await db.harvestTraceability.create({ data: {
      tenantId: tenant.id, cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
      plannedHarvestDate: new Date('2024-10-15'), plotBlockId: 'TB-PLT-002-B1',
      coffeeVariety: 'Catimor (Arabica)', estimatedYield: '2800 kg',
      actualHarvestDate: new Date('2024-10-20'), harvestMethod: 'Chọn hái',
      cherryRipeness: 95.0, harvestLabourCost: 2800000,
      sampleWeight: 4.5, sampleArea: 0.01, sampleYield: 450, estimatedYieldPerHa: 2800,
      processingMethod: 'Tự nhiên', dryingMethod: 'Giường nâng (nhà kính)', dryingDurationDays: 21,
      targetMoisture: 11.5, moistureContent: 11.2, defectiveBeans: 1.5, foreignMatter: 0.02,
      cupScore: 85.0, batchId: batchId2, coffeeVarietyAtBatch: 'Catimor (Arabica)',
      processingStage: 'Đã thu hoạch', batchTimestamp: new Date('2024-10-20T06:45:00'),
      location: "Vườn Hoa, Ea Drang, Cư Mgar", actor: 'Trần Thị Hoa',
      batchNotes: 'Hạt Arabica chất lượng cao, chế biến tự nhiên', isActive: true,
    }})

    // 9. Blockchain Hash Chain blocks (stored in PostgreSQL)
    for (const { batchId, stage, data } of [
      { batchId: batchId1, stage: 'HARVEST', data: { farmer: farmer1.fullName, date: '2024-11-10', method: 'Selective Picking', weight: 3200 } },
      { batchId: batchId2, stage: 'HARVEST', data: { farmer: farmer2.fullName, date: '2024-10-20', method: 'Selective Picking', weight: 2500 } },
    ]) {
      const dataStr = JSON.stringify(data)
      const dataHash = computeDataHash(dataStr)
      const previousHash = '0'.repeat(64)
      const timestamp = new Date().toISOString()
      const blockHash = computeBlockHash(dataHash, previousHash, timestamp)
      await db.hashChainBlock.create({
        data: { tenantId: tenant.id, batchId, blockIndex: 0, stage, data: dataStr, dataHash, previousHash, blockHash, timestamp: new Date(timestamp) },
      })
    }

    // 10. Collection Centres
    const cc1 = await db.collectionCentre.create({ data: {
      tenantId: tenant.id, centreId: 'CC-EATAM-001', centreName: 'Trạm thu mua Ea Tam',
      centreGpsLat: 12.670, centreGpsLng: 108.042,
      province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tam',
      managerName: 'Võ Văn Em', contactNumber: '0977112233',
      storageCapacityKg: 15000, scaleType: 'Cân kỹ thuật số (500kg)', isActive: true,
    }})

    // 11. Procurement Records
    await db.procurementRecord.create({ data: {
      tenantId: tenant.id, collectionCentreId: cc1.id,
      cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
      procurementId: `PROC-${uid()}`, procurementDate: new Date('2024-11-11'),
      batchId: batchId1, coffeeType: 'Cherry', coffeeVariety: 'Chari (Robusta)',
      grossWeight: 3350, tareWeight: 150, netWeight: 3200,
      moistureContentAtGate: 52.0, adjustedNetWeight: 3200,
      cherryRipenessGrade: 'A (92% đỏ)', defects: 2.1,
      purchasePricePerKg: 8500, totalPurchaseAmount: 27200000,
      priceBasis: 'Cherry, trọng lượng ướt', certPremiumApplied: 500,
      paymentMethod: 'Chuyển khoản', paymentStatus: 'Completed',
      paymentDate: new Date('2024-11-13'), isActive: true,
    }})

    // 12. Processing Job Order
    await db.processingJobOrder.create({ data: {
      tenantId: tenant.id, jobOrderId: `JOB-${BATCH_PREFIX}-001`,
      processingDate: new Date('2024-11-13'), batchIdInput: batchId1,
      coffeeTypeInput: 'Cherry', coffeeVarietyInput: 'Chari (Robusta)',
      inputQuantityKg: 3185, processingMethod: 'Rửa',
      targetOutputProduct: 'Hạt xanh (Robusta)', operatorName: 'Võ Minh Trí',
      plantFacilityName: 'Nhà máy chế biến Terra Brew',
      inputWeightKg: 3185, finalOutputWeightKg: 640, overallOutturn: 20.1,
      totalProcessingCost: 35000000, costPerKg: 54687,
      finalMoistureContent: 10.8, cupScore: 82.5,
      cuppingNotes: 'Vị sạch, body trung bình, ghi chú sô cô la và hạt, độ chua thấp',
      qcApprovedBy: 'Nguyễn Thị Lan (Quản lý QC)', qcApprovalDate: new Date('2024-12-07'),
      isActive: true,
    }})

    // 13. Audit log
    await db.auditLog.create({ data: {
      tenantId: tenant.id, userId: adminUser.id, action: 'CREATE',
      entity: 'Tenant', entityId: tenant.id,
      details: JSON.stringify({ message: 'Seeded Metrang Coffee tenant with full demo data' }),
    }})

    return NextResponse.json({
      success: true,
      message: 'Metrang Coffee tenant seeded successfully with full Vietnamese demo data',
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name, currency: 'VND', language: 'vi' },
      adminEmail,
      adminPassword: 'Admin@2024',
      stats: { farmers: 2, farmLands: 2, cultivations: 2, harvestRecords: 2, procurementRecords: 1, processingOrders: 1 },
    })
  } catch (e: any) {
    console.error('[Seed] Error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, computeDataHash, computeBlockHash } from '@/lib/crypto'

export const maxDuration = 60 // Allow up to 60 seconds for seed

export async function POST(req: Request) {
  try {
    // 1. Create Platform Super Admin (idempotent)
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

    // 3. Create Metrang Coffee Tenant (idempotent)
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
          enabledModules: JSON.stringify(Object.fromEntries(moduleDefs.map(m => [m.slug, true]))),
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

    // 9. Blockchain Hash Chain blocks
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
    const jobOrder1 = await db.processingJobOrder.create({ data: {
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

    // 13-22: Create remaining records (nurseries, land prep, crop monitoring, fertilizer, pest, cert, inspection, smart contracts, marketplace, processing stages)
    // These are less critical but add demo value

    await db.nursery.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, createdBy: adminUser.id,
      nurseryName: 'Vườn ươm Ea Tam', nurseryCode: 'NS-EATAM-001',
      location: 'Ea Tam, Cư Mgar, Đắk Lắk', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Tam',
      latitude: 12.670, longitude: 108.040, nurseryType: 'Hạt giống', capacity: 50000, currentStock: 35000,
      species: 'Coffea canephora', variety: 'Chari', seedSource: 'Vườn giống chứng nhận Ea Drăng',
      plantingDate: new Date('2024-06-01'), expectedReadyDate: new Date('2024-12-01'),
      germinationRate: 92.5, survivalRate: 88.0, healthStatus: 'Tốt - không dấu hiệu bệnh',
      notes: 'Cây giống Robusta Chari thế hệ F1, đã xử lý Trichoderma', isActive: true,
    }})
    await db.nursery.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, createdBy: adminUser.id,
      nurseryName: 'Vườn ươm Hữu cơ Ea Drăng', nurseryCode: 'NS-EADRANG-001',
      location: 'Ea Drăng, Cư Mgar, Đắk Lắk', province: 'Đắk Lắk', district: 'Cư Mgar', commune: 'Ea Drăng',
      latitude: 12.694, longitude: 108.057, nurseryType: 'Cây giống', capacity: 30000, currentStock: 18000,
      species: 'Coffea arabica', variety: 'Catimor', seedSource: 'Viện Khoa học Kỹ thuật Nông lâm nghiệp Tây Nguyên',
      plantingDate: new Date('2024-07-15'), expectedReadyDate: new Date('2025-01-15'),
      germinationRate: 89.0, survivalRate: 85.5, healthStatus: 'Khá - một số cây bị rệp sáp nhẹ',
      notes: 'Cây giống Arabica Catimor, tiêu chuẩn hữu cơ', isActive: true,
    }})

    await db.landPreparation.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id,
      preparationDate: new Date('2024-04-10'), preparationType: 'Làm đất vụ mới',
      method: 'Cày xới thủ công + hữu cơ', equipmentUsed: 'Cuốc, xẻng, máy cày mini',
      laborCount: 4, laborCost: 2400000, materialsUsed: 'Phân chuồng 2 tấn, vôi bột 50kg, Trichoderma 5kg',
      materialCost: 3500000, totalCost: 5900000, soilPhBefore: 5.2, soilPhAfter: 5.8, organicMatterPct: 3.8,
      notes: 'Đã bón lót phân chuồng ủ hoai mục, điều chỉnh pH bằng vôi', isActive: true,
    }})
    await db.landPreparation.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id,
      preparationDate: new Date('2024-03-25'), preparationType: 'Bổ sung dinh dưỡng',
      method: 'Bón hữu cơ + che phủ', equipmentUsed: 'Xe cút kút, cuốc',
      laborCount: 3, laborCost: 1800000, materialsUsed: 'Phân gà ủ 1.5 tấn, mùn cọ 500kg, nấm đối kháng 3kg',
      materialCost: 2800000, totalCost: 4600000, soilPhBefore: 5.5, soilPhAfter: 6.0, organicMatterPct: 4.2,
      notes: 'Bổ sung hữu cơ theo tiêu chuẩn UTZ, che phủ bằng mùn cọ giữ ẩm', isActive: true,
    }})

    await db.cropMonitoring.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
      cultivationId: cultivation1.id, createdBy: adminUser.id,
      monitoringDate: new Date('2024-09-15'), monitoringType: 'Kiểm tra định kỳ',
      growthStage: 'Phát triển trái', plantHeight: 2.1, canopyDiameter: 1.5,
      leafColor: 'Xanh đậm', healthScore: 88.0, pestPressure: 'Thấp', diseaseSymptoms: 'Không phát hiện',
      weatherCondition: 'Nắng xen mưa', temperature: 26.5, rainfall: 180, humidity: 78.0, soilMoisture: 42.0,
      alertTriggered: false, notes: 'Cây phát triển tốt, trái đang chuyển màu, dự kiến thu hoạch đầu tháng 11', isActive: true,
    }})
    await db.cropMonitoring.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
      cultivationId: cultivation2.id, createdBy: adminUser.id,
      monitoringDate: new Date('2024-09-20'), monitoringType: 'Kiểm tra sau mưa',
      growthStage: 'Chín trái', plantHeight: 1.8, canopyDiameter: 1.3,
      leafColor: 'Xanh vàng nhẹ', healthScore: 72.0, pestPressure: 'Trung bình', diseaseSymptoms: 'Gỉ sắt nhẹ trên lá già',
      weatherCondition: 'Mưa liên tục', temperature: 23.0, rainfall: 350, humidity: 88.0, soilMoisture: 65.0,
      alertTriggered: true, alertType: 'Bệnh nấm', alertSeverity: 'Trung bình',
      remedialAction: 'Phun thuốc BIO-FOX (nấm đối kháng), cắt tỉa lá bệnh',
      notes: 'Gỉ sắt phát triển do ẩm độ cao sau mưa dài, cần theo dõi thêm', isActive: true,
    }})

    await db.fertilizerApplication.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
      cultivationId: cultivation1.id, createdBy: adminUser.id,
      applicationDate: new Date('2024-08-05'), fertilizerType: 'Hữu cơ', fertilizerName: 'Phân chuồng ủ hoai',
      nutrientContent: 'NPK 2-1-2 + vi sinh vật', applicationRate: 2.0, unit: 'tấn/ha', totalQuantity: 4.0,
      applicationMethod: 'Bón gốc - rải vòng tán cây', costPerUnit: 800000, totalCost: 3200000,
      weatherAtApplication: 'Nắng nhẹ, đất ẩm vừa', appliedBy: 'Nguyễn Văn Thanh',
      isOrganic: true, certificationNumber: 'ORG-DL-2024-0456',
      notes: 'Bón thúc trái giai đoạn phát triển, kết hợp tưới nhỏ giọt', isActive: true,
    }})
    await db.fertilizerApplication.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
      cultivationId: cultivation2.id, createdBy: adminUser.id,
      applicationDate: new Date('2024-07-20'), fertilizerType: 'Hữu cơ sinh học', fertilizerName: 'Nấm Trichoderma + Phân gà ủ',
      nutrientContent: 'NPK 3-2-3 + nấm đối kháng', applicationRate: 1.5, unit: 'tấn/ha', totalQuantity: 2.25,
      applicationMethod: 'Bón gốc + xịt lá', costPerUnit: 1200000, totalCost: 2700000,
      weatherAtApplication: 'Trời mát, sau mưa', appliedBy: 'Trần Thị Hoa',
      isOrganic: true, certificationNumber: 'ORG-DL-2024-0457',
      notes: 'Phun Trichoderma phòng bệnh gỉ sắt, bón gốc phân gà ủ kết hợp mùn cọ', isActive: true,
    }})

    await db.pestDiseaseManagement.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
      cultivationId: cultivation2.id, createdBy: adminUser.id,
      detectionDate: new Date('2024-09-22'), pestOrDisease: 'Gỉ sắt (Coffee Leaf Rust)',
      type: 'Bệnh nấm', severity: 'Trung bình', affectedArea: 0.6, affectedTrees: 180,
      symptoms: 'Đốm vàng cam dưới lá, lá rụng sớm, trái nhỏ',
      treatmentMethod: 'Sinh học + cơ học', treatmentProduct: 'BIO-FOX (Trichoderma harzianum)',
      dosage: '5g/lít nước, phun ướt đều 2 mặt lá', applicationDate: new Date('2024-09-24'),
      followUpDate: new Date('2024-10-08'), outcome: 'Đang theo dõi - giảm 40% triệu chứng sau 2 tuần',
      cost: 850000, preventionMeasures: 'Tỉa cành thông thoáng, bón Kali tăng sức kháng, che phủ giữ ẩm ổn định',
      notes: 'Phun lần 1 ngày 24/9, lịch phun lại sau 14 ngày. Tránh phun khi mưa', isActive: true,
    }})
    await db.pestDiseaseManagement.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
      cultivationId: cultivation1.id, createdBy: adminUser.id,
      detectionDate: new Date('2024-08-15'), pestOrDisease: 'Rệp sáp bột hồng (Pink Mealybug)',
      type: 'Sâu bệnh', severity: 'Thấp', affectedArea: 0.2, affectedTrees: 35,
      symptoms: 'Túi sáp trắng ở kẽ cành, chồi non cong queo',
      treatmentMethod: 'Sinh học', treatmentProduct: 'Rệp đối kháng Cryptolaemus montrouzieri + rửa bằng áp lực nước',
      dosage: '50 bọ rệp/100 cây, xịt nước áp lực 1 lần/tuần', applicationDate: new Date('2024-08-18'),
      followUpDate: new Date('2024-09-01'), outcome: 'Kiểm soát tốt - giảm 85% quần thể rệp sau 2 tuần',
      cost: 450000, preventionMeasures: 'Bảo tồn kiến vàng tự nhiên, cắt tỉa cành rụng, kiểm tra định kỳ',
      notes: 'Bọ rệp đối kháng phát huy hiệu quả tốt trong điều kiện Tây Nguyên', isActive: true,
    }})

    await db.certAssessment.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id,
      assessmentId: 'CERT-2024-ORG-001', assessmentDate: new Date('2024-06-15'),
      certificationStandard: 'Organic (Hữu cơ)', certifyingBody: 'Control Union Certifications Việt Nam',
      assessmentType: 'Đánh giá tái chứng nhận', scope: 'Sản xuất cà phê hữu cơ - 2.5 ha tại Ea Tam',
      status: 'Đạt', score: 92.0, maxScore: 100.0,
      findings: 'Tuân thủ tốt quy chuẩn hữu cơ. Tài liệu ghi chép đầy đủ. Khoảng cách an toàn với vùng lân cận đạt yêu cầu.',
      nonConformities: 'Nhà kho phụ tùng cần tách riêng khu vực hóa sinh',
      correctiveActions: 'Xây vách ngăn nhà kho trước 30/07/2024',
      validFrom: new Date('2024-07-01'), validUntil: new Date('2025-06-30'),
      certificateNumber: 'ORG-VN-2024-CU0583', notes: 'Chứng nhận hữu cơ năm thứ 3 liên tục', isActive: true,
    }})
    await db.certAssessment.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id,
      assessmentId: 'CERT-2024-FT-002', assessmentDate: new Date('2024-05-20'),
      certificationStandard: 'Fair Trade (Thương mại Công bằng)', certifyingBody: 'FLO-CERT GmbH',
      assessmentType: 'Đánh giá chứng nhận mới', scope: 'Thương mại công bằng - 1.8 ha tại Ea Drăng',
      status: 'Đạt', score: 87.5, maxScore: 100.0,
      findings: 'Đáp ứng tiêu chuẩn thương mại công bằng. Quy trình giao dịch minh bạch.',
      nonConformities: 'Cần bổ sung bảng tuyên truyền quyền lao động bằng tiếng dân tộc',
      correctiveActions: 'In ấn và treo bảng tuyên truyền trước 15/06/2024',
      validFrom: new Date('2024-06-01'), validUntil: new Date('2025-05-31'),
      certificateNumber: 'FT-VN-2024-ED0217', notes: 'Chứng nhận Fair Trade lần đầu', isActive: true,
    }})

    await db.coffeeInspection.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
      batchId: batchId1, createdBy: adminUser.id,
      inspectionId: 'INSP-2024-RB-001', inspectionDate: new Date('2024-11-15'),
      inspectorName: 'Nguyễn Thị Lan', inspectorCertNo: 'QC-VN-2024-0142',
      inspectionType: 'Kiểm định chất lượng đầu vào', inspectionStandard: 'TCVN 4193:2014',
      sampleSize: 0.3, moistureContent: 10.8, defectCount: 8.0, foreignMatter: 0.05,
      screenSize: 'Screen 16+', color: 'Xanh lam tinh khiết', aroma: 'Thơm nhẹ, sô cô la',
      taste: 'Đắng nhẹ, body trung bình', body: 'Trung bình', acidity: 'Thấp', aftertaste: 'Hạt dẻ, caramel',
      cupScore: 82.5, overallGrade: 'Grade 1 - Xuất khẩu', passFail: 'Pass', isActive: true,
    }})
    await db.coffeeInspection.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
      batchId: batchId2, createdBy: adminUser.id,
      inspectionId: 'INSP-2024-AR-001', inspectionDate: new Date('2024-10-25'),
      inspectorName: 'Nguyễn Thị Lan', inspectorCertNo: 'QC-VN-2024-0142',
      inspectionType: 'Kiểm định chất lượng đặc sản', inspectionStandard: 'SCA Protocol',
      sampleSize: 0.35, moistureContent: 11.2, defectCount: 3.0, foreignMatter: 0.02,
      screenSize: 'Screen 15+', color: 'Xanh lục đều', aroma: 'Hoa nhài, trái cây nhiệt đới',
      taste: 'Chua thanh, ngọt hậu', body: 'Nhẹ đến trung bình', acidity: 'Cao, tinh tế', aftertaste: 'Trái cây, mật ong',
      cupScore: 85.0, overallGrade: 'Specialty Grade', passFail: 'Pass', isActive: true,
    }})

    await db.smartContract.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, buyerId: 'BUYER-INT-001', createdBy: adminUser.id,
      contractId: 'SC-2024-VN-RB-001', contractType: 'Hợp đồng mua bán',
      title: 'Hợp đồng cung ứng cà phê Robusta xanh 2024-2025',
      description: 'Hợp đồng mua bán cà phê Robusta Chari xanh Grade 1 cho thị trường Nhật Bản',
      partyA: 'Hợp tác xã Cà phê Ea Tam', partyB: 'Tokyo Coffee Trading Co., Ltd.',
      quantityKg: 5000, pricePerKg: 55000, totalValue: 275000000, currency: 'VND',
      deliveryDate: new Date('2025-01-15'), deliveryLocation: 'Cảng Cát Lái, TP. Hồ Chí Minh',
      qualityGrade: 'Grade 1 - Xuất khẩu', terms: 'Thanh toán 30% trước, 70% sau khi nhận hàng. Giao FOB Cát Lái.',
      status: 'Đang thực hiện', signedByA: true, signedByB: true,
      signedDateA: new Date('2024-10-01'), signedDateB: new Date('2024-10-05'),
      effectiveDate: new Date('2024-10-10'), expiryDate: new Date('2025-03-31'),
      notes: 'Hợp đồng có điều khoản bảo vệ giá - giá sàn 48,000 VND/kg.', isActive: true,
    }})
    await db.smartContract.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, buyerId: 'BUYER-INT-002', createdBy: adminUser.id,
      contractId: 'SC-2024-VN-AR-002', contractType: 'Hợp đồng đặc sản',
      title: 'Hợp đồng cung ứng cà phê Arabica đặc sản 2024',
      description: 'Hợp đồng mua bán cà phê Arabica Catimor đặc sản cho thị trường Hàn Quốc',
      partyA: 'Nông trại Hữu cơ Ea Drăng', partyB: 'Seoul Specialty Roasters Inc.',
      quantityKg: 2000, pricePerKg: 120000, totalValue: 240000000, currency: 'VND',
      deliveryDate: new Date('2024-12-20'), deliveryLocation: 'Cảng Cát Lái, TP. Hồ Chí Minh',
      qualityGrade: 'Specialty Grade, cup score >= 84', terms: 'Thanh toán 100% bằng LC không hủy ngang.',
      status: 'Chờ ký bên A', signedByA: false, signedByB: true, signedDateB: new Date('2024-11-01'),
      effectiveDate: new Date('2024-11-15'), expiryDate: new Date('2025-02-28'),
      notes: 'Hợp đồng đặc sản giá cao, yêu cầu cup score tối thiểu 84.', isActive: true,
    }})

    await db.marketplaceListing.create({ data: {
      tenantId: tenant.id, farmerId: farmer1.id, createdBy: adminUser.id,
      listingId: 'MKT-2024-RB-001', title: 'Cà phê Robusta Chari xanh Grade 1 - Hữu cơ',
      description: 'Cà phê Robusta Chari xanh Grade 1 chứng nhận hữu cơ, vụ 2024.',
      coffeeType: 'Robusta', coffeeVariety: 'Chari', grade: 'Grade 1',
      quantityKg: 3000, pricePerKg: 55000, totalValue: 165000000, currency: 'VND',
      origin: 'Ea Tam, Cư Mgar, Đắk Lắk', processingMethod: 'Rửa (Washed)', cupScore: 82.5,
      certifications: 'Organic, UTZ', harvestYear: '2024', availability: 'Có sẵn',
      listingStatus: 'Đang bán', listingDate: new Date('2024-11-20'), expiryDate: new Date('2025-05-31'), isActive: true,
    }})
    await db.marketplaceListing.create({ data: {
      tenantId: tenant.id, farmerId: farmer2.id, createdBy: adminUser.id,
      listingId: 'MKT-2024-AR-001', title: 'Cà phê Arabica Catimor Natural Specialty',
      description: 'Cà phê Arabica Catimor chế biến tự nhiên đặc sản, cup score 85.',
      coffeeType: 'Arabica', coffeeVariety: 'Catimor', grade: 'Specialty',
      quantityKg: 1500, pricePerKg: 120000, totalValue: 180000000, currency: 'VND',
      origin: 'Ea Drăng, Cư Mgar, Đắk Lắk', processingMethod: 'Tự nhiên (Natural)', cupScore: 85.0,
      certifications: 'Organic, Fair Trade', harvestYear: '2024', availability: 'Đặt trước',
      listingStatus: 'Đang bán', listingDate: new Date('2024-10-28'), expiryDate: new Date('2025-04-30'), isActive: true,
    }})

    // Processing Stage Records
    await db.processingStageRecord.create({ data: {
      tenantId: tenant.id, jobOrderId: jobOrder1.id, stageType: 'Phân loại & Làm sạch',
      stageDate: new Date('2024-11-13'), inputWeight: 3200, outputWeight: 3185,
      durationMinutes: 120, temperature: 25.0, humidity: 72.0,
      machineUsed: 'Máy phân loại quang học + sàng rung', operatorName: 'Võ Minh Trí',
      qualityCheckPassed: true, notes: 'Loại bỏ quả đen, quả xanh, cành lá.', isActive: true,
    }})
    await db.processingStageRecord.create({ data: {
      tenantId: tenant.id, jobOrderId: jobOrder1.id, stageType: 'Bóc vỏ & Lên men',
      stageDate: new Date('2024-11-14'), inputWeight: 3185, outputWeight: 850,
      durationMinutes: 1440, temperature: 28.0, humidity: 80.0,
      machineUsed: 'Máy bóc vỏ cà phê Penagos 2500 + bể lên men', operatorName: 'Võ Minh Trí',
      qualityCheckPassed: true, notes: 'Lên men ướt 24 giờ, rửa sạch nhớt.', isActive: true,
    }})
    await db.processingStageRecord.create({ data: {
      tenantId: tenant.id, jobOrderId: jobOrder1.id, stageType: 'Sấy',
      stageDate: new Date('2024-11-15'), inputWeight: 850, outputWeight: 660,
      durationMinutes: 20160, temperature: 35.0, humidity: 45.0,
      machineUsed: 'Giường nâng African bed + nhà kính', operatorName: 'Lê Văn Hùng',
      qualityCheckPassed: true, notes: 'Sấy tự nhiên 14 ngày, đạt độ ẩm mục tiêu 10.8%.', isActive: true,
    }})
    await db.processingStageRecord.create({ data: {
      tenantId: tenant.id, jobOrderId: jobOrder1.id, stageType: 'Bóc lụa & Phân loại cuối',
      stageDate: new Date('2024-11-29'), inputWeight: 660, outputWeight: 640,
      durationMinutes: 240, temperature: 22.0, humidity: 55.0,
      machineUsed: 'Máy bóc lụa CCI + máy phân loại kích thước', operatorName: 'Võ Minh Trí',
      qualityCheckPassed: true, notes: 'Green bean Grade 1, Screen 16+.', isActive: true,
    }})

    // Audit log
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
      stats: {
        farmers: 2, farmLands: 2, cultivations: 2, harvestRecords: 2,
        procurementRecords: 1, processingOrders: 1,
        nurseries: 2, landPreparations: 2, cropMonitorings: 2,
        fertilizerApplications: 2, pestDiseaseManagements: 2,
        certAssessments: 2, coffeeInspections: 2, smartContracts: 2,
        marketplaceListings: 2, processingStageRecords: 4,
      },
    })
  } catch (e: any) {
    console.error('[Seed] Error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

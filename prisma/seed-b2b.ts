import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient({ log: ['warn', 'error'] })

async function main() {
  console.log('\n🌱 Seeding B2B Commercial Data...\n')

  // ═══════════════════════════════════════════════════
  // 1. Subscription Plans
  // ═══════════════════════════════════════════════════
  const plans = [
    {
      slug: 'starter',
      name: 'Starter',
      description: 'For small exporters getting started with EUDR compliance',
      priceMonthly: 99,
      priceYearly: 990,
      currency: 'USD',
      maxUsers: 5,
      maxFarmers: 100,
      maxFarmLands: 500,
      maxShipments: 10,
      maxExportDocs: 5,
      maxEudrStatements: 2,
      storageLimitMb: 500,
      apiCallsLimit: 1000,
      features: JSON.stringify({ eudr: true, api: false, whiteLabel: false, multiOrigin: false, tradingDesk: false }),
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: 'professional',
      name: 'Professional',
      description: 'For mid-size exporters with full EUDR compliance and export management',
      priceMonthly: 299,
      priceYearly: 2990,
      currency: 'USD',
      maxUsers: 25,
      maxFarmers: 1000,
      maxFarmLands: 5000,
      maxShipments: 50,
      maxExportDocs: 25,
      maxEudrStatements: 10,
      storageLimitMb: 5000,
      apiCallsLimit: 10000,
      features: JSON.stringify({ eudr: true, api: true, whiteLabel: false, multiOrigin: true, tradingDesk: true }),
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: 'enterprise',
      name: 'Enterprise',
      description: 'For large exporters and trading companies with unlimited access',
      priceMonthly: 799,
      priceYearly: 7990,
      currency: 'USD',
      maxUsers: 100,
      maxFarmers: 10000,
      maxFarmLands: 50000,
      maxShipments: 999,
      maxExportDocs: 999,
      maxEudrStatements: 999,
      storageLimitMb: 50000,
      apiCallsLimit: 100000,
      features: JSON.stringify({ eudr: true, api: true, whiteLabel: true, multiOrigin: true, tradingDesk: true }),
      isActive: true,
      sortOrder: 3,
    },
  ]

  for (const plan of plans) {
    await db.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
    console.log(`  ✅ Subscription Plan "${plan.name}" created/updated`)
  }

  // ═══════════════════════════════════════════════════
  // 2. B2B Modules
  // ═══════════════════════════════════════════════════
  const b2bModules = [
    { slug: 'eudr-compliance', name: 'EUDR Compliance Hub', category: 'compliance', icon: 'ShieldCheck', color: '#059669' },
    { slug: 'export-docs', name: 'Export Documentation', category: 'premium', icon: 'FileOutput', color: '#7c3aed' },
    { slug: 'shipments', name: 'Shipment Tracking', category: 'premium', icon: 'Ship', color: '#2563eb' },
    { slug: 'buyers', name: 'Buyer Management', category: 'premium', icon: 'Handshake', color: '#d97706' },
  ]
  for (const mod of b2bModules) {
    await db.module.upsert({ where: { slug: mod.slug }, update: mod, create: mod })
  }
  console.log('  ✅ B2B Modules created/updated')

  // ═══════════════════════════════════════════════════
  // 3. B2B Users (aggregator, processor, exporter roles)
  // ═══════════════════════════════════════════════════
  const tenant = await db.tenant.findUnique({ where: { slug: 'metrang-coffee' } })
  if (!tenant) {
    console.log('  ⚠️  Tenant not found. Run main seed first.')
    return
  }

  const b2bUsers = [
    { email: 'aggregator@metrang-coffee.terrabrew.com', name: 'Nguyễn Thu Mua', role: 'aggregator' },
    { email: 'processor@metrang-coffee.terrabrew.com', name: 'Trần Chế Biến', role: 'processor' },
    { email: 'exporter@metrang-coffee.terrabrew.com', name: 'Lê Xuất Khẩu', role: 'exporter' },
  ]

  for (const userData of b2bUsers) {
    const existing = await db.user.findUnique({
      where: { email_tenantId: { email: userData.email, tenantId: tenant.id } },
    })
    if (!existing) {
      const hash = await bcrypt.hash('Admin@2024', 12)
      await db.user.create({
        data: {
          email: userData.email,
          passwordHash: hash,
          name: userData.name,
          role: userData.role,
          tenantId: tenant.id,
          isActive: true,
        },
      })
      console.log(`  ✅ B2B User ${userData.role}: ${userData.name} created`)
    } else {
      console.log(`  ℹ️  B2B User ${userData.role} already exists`)
    }
  }

  // ═══════════════════════════════════════════════════
  // 4. Buyers
  // ═══════════════════════════════════════════════════
  const buyers = [
    {
      buyerCode: 'BUY-DE-001',
      companyName: 'Berlin Kaffee Rösterei GmbH',
      contactPerson: 'Hans Müller',
      email: 'hans@berlinkaffee.de',
      phone: '+4930123456789',
      website: 'https://berlinkaffee.de',
      address: 'Friedrichstraße 123',
      city: 'Berlin',
      state: 'Berlin',
      country: 'DE',
      postalCode: '10117',
      buyerType: 'roaster',
      taxId: 'DE123456789',
      preferredIncoterms: 'CIF',
      preferredCurrency: 'EUR',
      paymentTerms: 'Net 30',
      eudrRequired: true,
      certificationRequirements: JSON.stringify(['Organic', 'Fair Trade']),
      qualityRequirements: JSON.stringify({ minCupScore: 82, maxDefectRate: 5 }),
      status: 'active',
      totalOrdersCount: 12,
      totalPurchaseValue: 245000,
    },
    {
      buyerCode: 'BUY-NL-001',
      companyName: 'Amsterdam Coffee Traders B.V.',
      contactPerson: 'Jan van der Berg',
      email: 'jan@amsterdamcoffee.nl',
      phone: '+31201234567',
      address: 'Keizersgracht 456',
      city: 'Amsterdam',
      state: 'North Holland',
      country: 'NL',
      postalCode: '1016 DP',
      buyerType: 'trader',
      taxId: 'NL987654321',
      preferredIncoterms: 'FOB',
      preferredCurrency: 'USD',
      paymentTerms: 'LC at sight',
      eudrRequired: true,
      certificationRequirements: JSON.stringify(['Rainforest Alliance', 'UTZ']),
      qualityRequirements: JSON.stringify({ minCupScore: 80, maxDefectRate: 8 }),
      status: 'active',
      totalOrdersCount: 8,
      totalPurchaseValue: 180000,
    },
    {
      buyerCode: 'BUY-JP-001',
      companyName: 'Tokyo Specialty Coffee Inc.',
      contactPerson: 'Tanaka Yuki',
      email: 'tanaka@tokyospecialty.jp',
      phone: '+81312345678',
      address: 'Shibuya-ku 2-15-1',
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'JP',
      postalCode: '150-0002',
      buyerType: 'roaster',
      taxId: 'JP1122334455',
      preferredIncoterms: 'CIF',
      preferredCurrency: 'JPY',
      paymentTerms: 'Net 60',
      eudrRequired: true,
      certificationRequirements: JSON.stringify(['Organic']),
      qualityRequirements: JSON.stringify({ minCupScore: 85, maxDefectRate: 3 }),
      status: 'active',
      totalOrdersCount: 5,
      totalPurchaseValue: 120000,
    },
  ]

  for (const buyerData of buyers) {
    const existing = await db.buyer.findUnique({
      where: { tenantId_buyerCode: { tenantId: tenant.id, buyerCode: buyerData.buyerCode } },
    })
    if (!existing) {
      await db.buyer.create({
        data: {
          tenantId: tenant.id,
          ...buyerData,
          isActive: true,
        } as any,
      })
      console.log(`  ✅ Buyer ${buyerData.buyerCode}: ${buyerData.companyName} created`)
    } else {
      console.log(`  ℹ️  Buyer ${buyerData.buyerCode} already exists`)
    }
  }

  // ═══════════════════════════════════════════════════
  // 5. EUDR Compliance Records
  // ═══════════════════════════════════════════════════
  const eudrRecords = [
    {
      referenceNumber: 'EUDR-VN-2024-001',
      status: 'approved',
      gpsVerificationStatus: 'verified',
      gpsVerificationDate: new Date('2024-11-15'),
      gpsVerifiedBy: 'Nguyễn Thu Mua',
      totalPlotCount: 5,
      verifiedPlotCount: 5,
      riskAssessmentStatus: 'low_risk',
      riskAssessmentDate: new Date('2024-11-16'),
      riskAssessmentSource: 'satellite',
      riskScore: 12,
      deforestationCheckDate: new Date('2024-11-14'),
      deforestationCheckResult: 'clear',
      ddsGeneratedAt: new Date('2024-11-17'),
      ddsSubmittedAt: new Date('2024-11-18'),
      ddsApprovedAt: new Date('2024-11-20'),
      ddsExpiryDate: new Date('2025-11-20'),
      totalFarmers: 5,
      totalWeightKg: 15300,
      totalAreaHa: 11.0,
      harvestSeasonStart: new Date('2024-10-01'),
      harvestSeasonEnd: new Date('2025-02-28'),
    },
    {
      referenceNumber: 'EUDR-VN-2024-002',
      status: 'submitted',
      gpsVerificationStatus: 'verified',
      gpsVerificationDate: new Date('2025-01-10'),
      gpsVerifiedBy: 'Nguyễn Thu Mua',
      totalPlotCount: 3,
      verifiedPlotCount: 3,
      riskAssessmentStatus: 'low_risk',
      riskAssessmentDate: new Date('2025-01-11'),
      riskAssessmentSource: 'manual',
      riskScore: 18,
      deforestationCheckDate: new Date('2025-01-09'),
      deforestationCheckResult: 'clear',
      ddsGeneratedAt: new Date('2025-01-12'),
      ddsSubmittedAt: new Date('2025-01-13'),
      totalFarmers: 3,
      totalWeightKg: 9500,
      totalAreaHa: 7.5,
      harvestSeasonStart: new Date('2024-11-01'),
      harvestSeasonEnd: new Date('2025-01-31'),
    },
    {
      referenceNumber: 'EUDR-VN-2025-001',
      status: 'draft',
      gpsVerificationStatus: 'pending',
      totalPlotCount: 5,
      verifiedPlotCount: 3,
      riskAssessmentStatus: 'pending',
      totalFarmers: 5,
      totalWeightKg: 0,
      totalAreaHa: 11.0,
    },
  ]

  for (const eudrData of eudrRecords) {
    const existing = await db.eudrCompliance.findUnique({
      where: { tenantId_referenceNumber: { tenantId: tenant.id, referenceNumber: eudrData.referenceNumber } },
    })
    if (!existing) {
      await db.eudrCompliance.create({
        data: {
          tenantId: tenant.id,
          ...eudrData,
          isActive: true,
        } as any,
      })
      console.log(`  ✅ EUDR Compliance ${eudrData.referenceNumber} (${eudrData.status}) created`)
    } else {
      console.log(`  ℹ️  EUDR Compliance ${eudrData.referenceNumber} already exists`)
    }
  }

  // ═══════════════════════════════════════════════════
  // 6. Export Documents
  // ═══════════════════════════════════════════════════
  const exportDocs = [
    {
      documentType: 'phytosanitary',
      documentNumber: 'PYTO-VN-2024-001',
      title: 'Phytosanitary Certificate - Lot TB-LOT-2024-001',
      status: 'verified',
      issuingAuthority: 'Plant Protection Department - MARD Vietnam',
      issuingDate: new Date('2024-12-01'),
      expiryDate: new Date('2025-06-01'),
      issuingCountry: 'VN',
      destinationCountry: 'DE',
      netWeight: 18500,
      hsCode: '0901.11',
      coffeeGrade: 'Grade 2',
      coffeeVariety: 'Robusta',
      processingMethod: 'Washed',
      totalValue: 92500,
      currency: 'USD',
      incoterms: 'CIF Hamburg',
    },
    {
      documentType: 'certificate_of_origin',
      documentNumber: 'CO-VN-2024-001',
      title: 'Certificate of Origin - Vietnam Robusta',
      status: 'issued',
      issuingAuthority: 'Vietnam Chamber of Commerce and Industry',
      issuingDate: new Date('2024-11-28'),
      expiryDate: new Date('2025-11-28'),
      issuingCountry: 'VN',
      destinationCountry: 'DE',
      netWeight: 18500,
      hsCode: '0901.11',
      coffeeGrade: 'Grade 2',
      totalValue: 92500,
      currency: 'USD',
    },
    {
      documentType: 'bill_of_lading',
      documentNumber: 'BL-VN-2024-001',
      title: 'Bill of Lading - MSKU-1234567',
      status: 'issued',
      vesselName: 'MSC Ingy',
      vesselVoyage: 'VNDE-2448W',
      portOfLoading: 'Cat Lai, Ho Chi Minh City',
      portOfDischarge: 'Hamburg',
      containerNumber: 'MSKU-1234567',
      sealNumber: 'SN-9876543',
      shippingLine: 'MSC',
      grossWeight: 19200,
      netWeight: 18500,
      numberOfPackages: 740,
      marksAndNumbers: 'METRANG/HAMBURG/2024',
    },
    {
      documentType: 'eudr_dds',
      documentNumber: 'DDS-VN-2024-001',
      title: 'EUDR Due Diligence Statement - EUDR-VN-2024-001',
      status: 'verified',
      issuingAuthority: 'European Commission - TRACES',
      issuingDate: new Date('2024-11-20'),
      expiryDate: new Date('2025-11-20'),
      issuingCountry: 'VN',
      destinationCountry: 'DE',
    },
  ]

  for (const docData of exportDocs) {
    const existing = await db.exportDocument.findFirst({
      where: { tenantId: tenant.id, documentNumber: docData.documentNumber },
    })
    if (!existing) {
      await db.exportDocument.create({
        data: {
          tenantId: tenant.id,
          ...docData,
          isActive: true,
        } as any,
      })
      console.log(`  ✅ Export Document ${docData.documentType}: ${docData.documentNumber} created`)
    } else {
      console.log(`  ℹ️  Export Document ${docData.documentNumber} already exists`)
    }
  }

  // ═══════════════════════════════════════════════════
  // 7. Shipments
  // ═══════════════════════════════════════════════════
  const shipments = [
    {
      shipmentId: 'SHP-VN-DE-2024-001',
      status: 'delivered',
      shipmentType: 'fcl',
      originWarehouse: 'Metrang Warehouse - Cat Lai',
      originCity: 'Ho Chi Minh City',
      originCountry: 'VN',
      loadingDate: new Date('2024-12-05'),
      destinationAddress: 'Friedrichstraße 123',
      destinationCity: 'Hamburg',
      destinationCountry: 'DE',
      destinationPort: 'Hamburg',
      estimatedArrival: new Date('2025-01-15'),
      actualArrival: new Date('2025-01-12'),
      carrier: 'MSC',
      vesselName: 'MSC Ingy',
      vesselVoyage: 'VNDE-2448W',
      containerNumber: 'MSKU-1234567',
      sealNumber: 'SN-9876543',
      bookingNumber: 'BK-MSC-2024-5567',
      blNumber: 'BL-VN-2024-001',
      grossWeight: 19200,
      netWeight: 18500,
      numberOfBags: 740,
      volume: 28.5,
      moistureContent: 11.5,
      defectRate: 4.2,
      cupScore: 82,
      qcPassed: true,
      customsCleared: true,
      customsClearanceDate: new Date('2025-01-13'),
      currentLocation: 'Delivered - Berlin Kaffee Rösterei GmbH',
      lastTrackingUpdate: new Date('2025-01-14'),
    },
    {
      shipmentId: 'SHP-VN-NL-2025-001',
      status: 'in_transit',
      shipmentType: 'fcl',
      originWarehouse: 'Metrang Warehouse - Cat Lai',
      originCity: 'Ho Chi Minh City',
      originCountry: 'VN',
      loadingDate: new Date('2025-04-20'),
      destinationAddress: 'Keizersgracht 456',
      destinationCity: 'Rotterdam',
      destinationCountry: 'NL',
      destinationPort: 'Rotterdam',
      estimatedArrival: new Date('2025-05-25'),
      carrier: 'Maersk',
      vesselName: 'Maersk Elba',
      vesselVoyage: 'VNRT-2551E',
      containerNumber: 'MRKU-7654321',
      sealNumber: 'SN-1122334',
      bookingNumber: 'BK-MAE-2025-1234',
      grossWeight: 20500,
      netWeight: 19800,
      numberOfBags: 792,
      volume: 30.2,
      moistureContent: 11.8,
      defectRate: 3.5,
      cupScore: 84,
      qcPassed: true,
      customsCleared: false,
      currentLocation: 'Indian Ocean - en route to Suez Canal',
      lastTrackingUpdate: new Date('2025-04-28'),
    },
    {
      shipmentId: 'SHP-VN-JP-2025-001',
      status: 'booked',
      shipmentType: 'lcl',
      originWarehouse: 'Metrang Warehouse - Cat Lai',
      originCity: 'Ho Chi Minh City',
      originCountry: 'VN',
      loadingDate: new Date('2025-05-15'),
      destinationCity: 'Tokyo',
      destinationCountry: 'JP',
      destinationPort: 'Yokohama',
      estimatedArrival: new Date('2025-06-10'),
      carrier: 'ONE',
      grossWeight: 5200,
      netWeight: 5000,
      numberOfBags: 200,
    },
  ]

  for (const shipData of shipments) {
    const existing = await db.shipment.findUnique({
      where: { tenantId_shipmentId: { tenantId: tenant.id, shipmentId: shipData.shipmentId } },
    })
    if (!existing) {
      await db.shipment.create({
        data: {
          tenantId: tenant.id,
          ...shipData,
          isActive: true,
        } as any,
      })
      console.log(`  ✅ Shipment ${shipData.shipmentId} (${shipData.status}) created`)
    } else {
      console.log(`  ℹ️  Shipment ${shipData.shipmentId} already exists`)
    }
  }

  console.log('\n✅ B2B Commercial Data seeded successfully!\n')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())

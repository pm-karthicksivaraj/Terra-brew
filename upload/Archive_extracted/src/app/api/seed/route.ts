import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { moduleId } = await req.json()
    if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

    const mod = await db.module.findUnique({ where: { id: moduleId } })
    if (!mod) return NextResponse.json({ message: 'Module not found' }, { status: 404 })

    // ─── Check if seed already exists ───
    const existingFarmers = await db.farmer.count({ where: { moduleId } })
    if (existingFarmers > 0) {
      return NextResponse.json({
        success: true,
        message: `Seed data already exists (${existingFarmers} farmers). Skipping.`,
        loginHint: `Seed data was already loaded previously.`
      })
    }

    // ─── 0. Create admin user ───
    const adminEmail = `admin@${mod.slug}.test`
    let adminUser = await db.user.findUnique({ where: { email_moduleId: { email: adminEmail, moduleId } } })
    if (!adminUser) {
      adminUser = await db.user.create({
        data: { email: adminEmail, password: 'admin123', name: 'Admin User', role: 'admin', moduleId }
      })
    }

    const BATCH_PREFIX = 'TB'
    const now = new Date()
    const uid = () => Math.random().toString(36).substring(2, 8).toUpperCase()
    const fid = () => `FRM-${Date.now().toString(36).toUpperCase()}-${uid()}`

    // ════════════════════════════════════════════════════════════════
    // FLOW: Farmer Registration → Farm Land → Cultivation → Pre-Harvest
    //       → Harvest → Procurement → Processing → Marketplace
    // ════════════════════════════════════════════════════════════════

    // ─── 1. FARMER REGISTRATION (2 primary farmers for full traceability) ───
    const farmer1Data = {
      moduleId,
      tenantId: null,
      createdBy: adminUser.id,
      farmerCode: fid(),
      enrollmentDate: new Date('2024-01-10'),
      enrollmentPlace: 'At Farmer Place',
      isCertified: true,
      certificationType: 'Individual',
      yearOfICS: '2022',
      cooperative: 'Ea Tam Coffee Cooperative',
      fullName: 'Nguyen Van Thanh',
      firstName: 'Thanh',
      lastName: 'Nguyen',
      contactNumber: '0912345678',
      gender: 'Male',
      dob: new Date('1985-03-15'),
      education: 'Secondary',
      maritalStatus: 'Married',
      spouseName: 'Tran Thi Mai',
      noOfFamilyMembers: 4,
      childrenBelow18Male: 1,
      childrenBelow18Female: 0,
      schoolGoingMale: 1,
      schoolGoingFemale: 0,
      country: 'Vietnam',
      province: 'Dak Lak',
      district: 'Cu Mgar',
      commune: 'Ea Tam',
      village: "Bon K'Mang",
      zipCode: '630000',
      latitude: 12.668,
      longitude: 108.038,
      housingOwnership: 'Owned',
      houseType: 'Brick house',
      consumerElectronics: 'TV, Refrigerator',
      vehicles: 'Motorcycle',
      smartphoneOwnership: true,
      solarPanelInstalled: false,
      loanTaken: false,
      nationalIdType: 'National ID',
      nationalIdNo: '795284610382',
      lifeInsurance: true,
      lifeInsProvider: 'Bao Viet',
      lifeInsAmount: 50000000,
      lifeInsStartDate: new Date('2023-01-01'),
      lifeInsEndDate: new Date('2026-01-01'),
      healthInsurance: true,
      healthInsProvider: 'Bao Hai',
      creditScore: 82,
      yearsOfFarmingExperience: 12,
      isActive: true,
    }

    const farmer2Data = {
      moduleId,
      tenantId: null,
      createdBy: adminUser.id,
      farmerCode: fid(),
      enrollmentDate: new Date('2024-02-05'),
      enrollmentPlace: 'Cooperative Office',
      isCertified: true,
      certificationType: 'Group',
      yearOfICS: '2023',
      cooperative: 'Ea Drang Organic Farm',
      fullName: 'Tran Thi Hoa',
      firstName: 'Hoa',
      lastName: 'Tran',
      contactNumber: '0923456789',
      gender: 'Female',
      dob: new Date('1990-07-22'),
      education: 'Primary',
      maritalStatus: 'Married',
      spouseName: 'Le Van Duc',
      noOfFamilyMembers: 5,
      childrenBelow18Male: 1,
      childrenBelow18Female: 1,
      schoolGoingMale: 1,
      schoolGoingFemale: 1,
      country: 'Vietnam',
      province: 'Dak Lak',
      district: 'Cu Mgar',
      commune: 'Ea Drang',
      village: 'Ea Pok',
      zipCode: '630000',
      latitude: 12.692,
      longitude: 108.055,
      housingOwnership: 'Rented',
      houseType: 'Wooden house',
      consumerElectronics: 'TV',
      vehicles: 'None',
      smartphoneOwnership: true,
      solarPanelInstalled: false,
      loanTaken: true,
      loanTakenFrom: 'Vietcombank',
      loanAmount: 30000000,
      loanPurpose: 'Farm Expansion',
      loanInterest: 7.5,
      loanInterestPeriod: 'Yearly',
      loanSecurity: true,
      loanRepaymentAmt: 32000000,
      loanRepaymentDate: new Date('2026-06-30'),
      repaymentTrackRecord: 'On-time',
      nationalIdType: 'National ID',
      nationalIdNo: '794827364518',
      cropInsurance: true,
      cropInsProvider: 'PVI',
      cropInsCrops: 'Coffee, Pepper',
      cropInsAreaHa: 2.5,
      cropInsStartDate: new Date('2024-01-01'),
      cropInsEndDate: new Date('2025-01-01'),
      healthInsurance: true,
      healthInsProvider: 'Bao Viet',
      creditScore: 76,
      yearsOfFarmingExperience: 8,
      gapTrainingAttended: true,
      trainingDate: new Date('2024-03-15'),
      trainingProvider: 'SNV Netherlands',
      trainingCertificate: 'CERT-GAP-2024-0315',
      isActive: true,
    }

    const farmer1 = await db.farmer.create({ data: farmer1Data })
    const farmer2 = await db.farmer.create({ data: farmer2Data })

    // 3 extra farmers for variety
    const extraFarmers = [
      { fullName: 'Le Van Minh', lastName: 'Le', contactNumber: '0934567890', commune: 'Cu Ne' },
      { fullName: 'Pham Thi Lan', lastName: 'Pham', contactNumber: '0945678901', commune: "Ea M'Doan" },
      { fullName: 'Hoang Van Dat', lastName: 'Hoang', contactNumber: '0956789012', commune: 'Ea Kao' },
    ]
    for (const ef of extraFarmers) {
      await db.farmer.create({
        data: {
          moduleId, tenantId: null, createdBy: adminUser.id,
          farmerCode: fid(), enrollmentPlace: 'At Farmer Place',
          fullName: ef.fullName, lastName: ef.lastName,
          contactNumber: ef.contactNumber,
          gender: ef.fullName.includes('Thi') ? 'Female' : 'Male',
          education: 'Secondary', province: 'Dak Lak', district: 'Cu Mgar',
          commune: ef.commune, country: 'Vietnam',
          creditScore: +(Math.random() * 20 + 70).toFixed(0),
          isCertified: Math.random() > 0.5, isActive: true,
        },
      })
    }

    const allFarmers = await db.farmer.findMany({ where: { moduleId } })

    // ─── 2. FARM LAND CREATION ───
    const farmLand1 = await db.farmLand.create({
      data: {
        moduleId, tenantId: null, farmerId: farmer1.id, createdBy: adminUser.id,
        farmName: "Thanh's Highland Farm",
        plotBlockId: 'TB-PLT-001',
        totalLandHolding: 2.5,
        altitude: 850,
        agroEcologicalZone: 'Central Highlands',
        latitude: 12.668, longitude: 108.038,
        landOwnership: 'Owned',
        landSurveyNo: 'DL-2024-001',
        redBookLandTitle: 'RB-2024-001',
        landTopology: 'Sloping',
        landGradient: '10-20%',
        waterSource: 'Bore Well',
        powerSource: 'Electricity',
        fertilityStatus: 'Good',
        soilType: 'Ferralitic',
        irrigationSource: 'Irrigated',
        irrigationType: 'Drip',
        noOfTrees: 2800,
        shadeTreeSpecies: 'Cajanus cajan, Leucaena',
        shadeTreeDensity: 400,
        shadeTreeCover: 25,
        fullTimeWorkers: 2,
        partTimeWorkers: 1,
        seasonalWorkers: 3,
        familyWorkers: 2,
        childLabourPolicy: true,
        minimumWageCompliance: true,
        ppeAvailable: true,
        estYield: 3500,
        conversionCertType: 'Organic',
        currentConversionStatus: 'Certified',
        conversionDate: new Date('2023-06-01'),
        inspectorName: 'Nguyen Thi Bich',
        qualified: true,
        conversionRemarks: 'Full organic compliance achieved',
        previousCropHistory: 'Rice, Cassava',
        conventionalCrops: 'None',
      },
    })

    const farmLand2 = await db.farmLand.create({
      data: {
        moduleId, tenantId: null, farmerId: farmer2.id, createdBy: adminUser.id,
        farmName: "Hoa's Organic Garden",
        plotBlockId: 'TB-PLT-002',
        totalLandHolding: 1.8,
        altitude: 920,
        agroEcologicalZone: 'Central Highlands',
        latitude: 12.692, longitude: 108.055,
        landOwnership: 'Leased',
        landTopology: 'Flat to gently sloping',
        landGradient: '5-10%',
        waterSource: 'River',
        powerSource: 'Solar + Grid',
        fertilityStatus: 'Very Good',
        soilType: 'Volcanic',
        irrigationSource: 'Rainfed',
        irrigationType: 'Sprinkler',
        noOfTrees: 2000,
        shadeTreeSpecies: 'Gliricidia, Inga',
        shadeTreeDensity: 350,
        shadeTreeCover: 30,
        fullTimeWorkers: 1,
        partTimeWorkers: 2,
        seasonalWorkers: 4,
        familyWorkers: 3,
        childLabourPolicy: true,
        minimumWageCompliance: true,
        ppeAvailable: true,
        estYield: 2800,
        conversionCertType: 'Organic + Fair Trade',
        currentConversionStatus: 'Certified',
        conversionDate: new Date('2022-12-01'),
        inspectorName: 'Tran Van Quang',
        qualified: true,
        conversionRemarks: 'Dual certification maintained',
        previousCropHistory: 'Black Pepper, Avocado',
        conventionalCrops: 'None',
      },
    })

    // ─── 3. CULTIVATION CREATION ───
    const cultivation1 = await db.cultivation.create({
      data: {
        moduleId, tenantId: null,
        farmerId: farmer1.id, farmLandId: farmLand1.id, createdBy: adminUser.id,
        farmPlotName: 'Robusta Main Plot A1',
        plotBlockId: 'TB-PLT-001-A1',
        cropCategory: 'Main Crop',
        intercroppingSpecies: 'Pepper, Avocado',
        harvestSeason: 'Nov 2024 - Jan 2025',
        cultivatedCrop: 'Robusta Coffee',
        cropVariety: 'Chari',
        coffeeSpecies: 'Coffea canephora',
        cultivationArea: 2.0,
        plantingSpacing: 3.0,
        treeDensity: 1400,
        sowingDate: new Date('2020-06-15'),
        cropCalendar: 'Jun Planting → Oct Flowering → Nov-Apr Harvest',
        estYield: '3500 kg/ha',
        intendedProcessingMethod: 'Washed',
        irrigationMethod: 'Drip Irrigation',
        shadeCover: 25,
        latitude: 12.668, longitude: 108.038,
        seedSource: 'Self-save (certified seedling)',
        isSeedTreated: true,
        treatmentDetails: 'Trichoderma seed coating',
        seedType: 'Certified 1',
        seedQuantity: 3000,
        seedPrice: 5000,
        seedCost: 15000000,
        sowingType: 'Row sowing',
        sowingChargeBy: 'Self',
        sowingCharges: 0,
        sowingCost: 0,
        isActive: true,
      },
    })

    const cultivation2 = await db.cultivation.create({
      data: {
        moduleId, tenantId: null,
        farmerId: farmer2.id, farmLandId: farmLand2.id, createdBy: adminUser.id,
        farmPlotName: 'Arabica Shade Plot B1',
        plotBlockId: 'TB-PLT-002-B1',
        cropCategory: 'Main Crop',
        intercroppingSpecies: 'Banana, Macadamia',
        harvestSeason: 'Oct 2024 - Dec 2024',
        cultivatedCrop: 'Arabica Coffee',
        cropVariety: 'Catimor',
        coffeeSpecies: 'Coffea arabica',
        cultivationArea: 1.5,
        plantingSpacing: 2.5,
        treeDensity: 1600,
        sowingDate: new Date('2019-09-10'),
        cropCalendar: 'Sep Planting → Nov Flowering → Oct-Dec Harvest',
        estYield: '2800 kg/ha',
        intendedProcessingMethod: 'Natural',
        irrigationMethod: 'Sprinkler',
        shadeCover: 30,
        latitude: 12.692, longitude: 108.055,
        seedSource: 'Nursery - Ea Drang Seed Center',
        isSeedTreated: true,
        treatmentDetails: 'Fungicide + bio-fertilizer dip',
        seedType: 'Improved',
        seedQuantity: 2400,
        seedPrice: 8000,
        seedCost: 19200000,
        sowingType: 'Pit sowing',
        sowingChargeBy: 'Hired Labour',
        sowingCharges: 2000000,
        sowingCost: 2000000,
        isActive: true,
      },
    })

    // ─── 4. NURSERY MANAGEMENT ───
    await db.nursery.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
        nurseryId: 'NRS-TB-001',
        nurseryCapacity: 5000,
        coffeeVariety: 'Chari',
        coffeeSpecies: 'Coffea canephora',
        rootstockType: 'Own root',
        shadingConditions: 60,
        sowingDate: new Date('2020-01-15'),
        germinationRate: 85.0,
        seedlingHealth: 'Good',
        transplantDate: new Date('2020-06-15'),
        nurseryGpsLat: 12.670, nurseryGpsLng: 108.040,
        shadingMethod: 'Saran net 60%',
        nurseryLossCount: 150,
        survivalRate: 95.0,
        wateringSchedule: 'Twice daily (morning & evening)',
        fertilizerApp: 'Organic compost + vermicompost monthly',
        pestDiseaseChecks: 'Weekly scouting with IPM approach',
        photoDoc: 'nursery_001.jpg',
        isActive: true,
      },
    })

    await db.nursery.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
        nurseryId: 'NRS-TB-002',
        nurseryCapacity: 3000,
        coffeeVariety: 'Catimor',
        coffeeSpecies: 'Coffea arabica',
        rootstockType: 'Grafted',
        shadingConditions: 70,
        sowingDate: new Date('2019-03-01'),
        germinationRate: 78.0,
        seedlingHealth: 'Good',
        transplantDate: new Date('2019-09-10'),
        nurseryGpsLat: 12.694, nurseryGpsLng: 108.058,
        shadingMethod: 'Natural shade trees + net',
        nurseryLossCount: 220,
        survivalRate: 91.0,
        wateringSchedule: 'Morning mist irrigation',
        fertilizerApp: 'Bio-fertilizer (mycorrhizae) bi-weekly',
        pestDiseaseChecks: 'Bi-weekly visual inspection',
        isActive: true,
      },
    })

    // ─── 5. LAND PREPARATION ───
    await db.landPreparation.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
        eventDate: new Date('2020-05-20'),
        plotBlockId: 'TB-PLT-001-A1',
        activity: 'Plowing',
        implementsUsed: 'Tractor + Disc plow',
        compostApplied: true,
        compostType: 'Vermicompost',
        compostQuantity: 5000,
        labourCost: 1500000,
        photoCapture: 'landprep_001.jpg',
        plantingDate: new Date('2020-06-15'),
        plantingPlotBlockId: 'TB-PLT-001-A1',
        gpsPlotLat: 12.668, gpsPlotLng: 108.038,
        plantingMethod: 'Hole Planting',
        seedlingAge: 5,
        plantsPerHa: 1400,
        spacing: '3m x 2.5m',
        shadeTreePlanted: true,
        shadeTreeSpecies: 'Cajanus cajan, Leucaena leucocephala',
        shadeTreesPerHa: 200,
        soilTypeAtPlanting: 'Ferralitic, well-drained',
        isActive: true,
      },
    })

    await db.landPreparation.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
        eventDate: new Date('2019-08-25'),
        plotBlockId: 'TB-PLT-002-B1',
        activity: 'Pit digging + Composting',
        implementsUsed: 'Manual (spade + hoe)',
        compostApplied: true,
        compostType: 'Farmyard manure + biochar',
        compostQuantity: 4000,
        labourCost: 2000000,
        plantingDate: new Date('2019-09-10'),
        plantingPlotBlockId: 'TB-PLT-002-B1',
        gpsPlotLat: 12.692, gpsPlotLng: 108.055,
        plantingMethod: 'Contour Planting',
        seedlingAge: 6,
        plantsPerHa: 1600,
        spacing: '2.5m x 2.5m',
        shadeTreePlanted: true,
        shadeTreeSpecies: 'Gliricidia sepium, Inga edulis',
        shadeTreesPerHa: 250,
        soilTypeAtPlanting: 'Volcanic loam, high organic matter',
        isActive: true,
      },
    })

    // ─── 6. CROP MONITORING ───
    const cropMonitorDates = [
      new Date('2024-06-15'), new Date('2024-08-10'), new Date('2024-10-05'),
    ]
    for (let i = 0; i < 3; i++) {
      await db.cropMonitoring.create({
        data: {
          moduleId, tenantId: null,
          cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
          visitDate: cropMonitorDates[i],
          plotBlockId: 'TB-PLT-001-A1',
          coffeeTreeAge: i === 0 ? 3 : 4,
          growthStage: ['Vegetative', 'Flowering', 'Cherry Development'][i],
          plantHeight: [1.8, 2.1, 2.3][i],
          canopyCover: [55, 65, 72][i],
          leafColorIndex: 'Green',
          soilMoisture: ['Adequate', 'Good', 'Adequate'][i],
          irrigationStatus: 'Active',
          ndviIndex: [0.65, 0.72, 0.78][i],
          observationGpsLat: 12.668, observationGpsLng: 108.038,
          weatherConditions: ['Sunny, 28°C', 'Rainy, 24°C', 'Partly cloudy, 26°C'][i],
          pestInfestation: i === 1,
          pestType: i === 1 ? 'Coffee Berry Borer' : null,
          diseaseSymptoms: false,
          recommendation: i === 1 ? 'Apply pheromone traps for CBB control' : 'Continue regular monitoring',
          alertTriggered: i === 1,
          isActive: true,
        },
      })
    }

    for (let i = 0; i < 3; i++) {
      await db.cropMonitoring.create({
        data: {
          moduleId, tenantId: null,
          cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
          visitDate: cropMonitorDates[i],
          plotBlockId: 'TB-PLT-002-B1',
          coffeeTreeAge: [4, 5, 5][i],
          growthStage: ['Vegetative', 'Flowering', 'Ripening'][i],
          plantHeight: [2.0, 2.4, 2.5][i],
          canopyCover: [60, 70, 78][i],
          leafColorIndex: 'Dark Green',
          soilMoisture: 'Good',
          irrigationStatus: 'Active',
          ndviIndex: [0.68, 0.75, 0.82][i],
          observationGpsLat: 12.692, observationGpsLng: 108.055,
          weatherConditions: ['Sunny, 22°C', 'Light rain, 20°C', 'Clear, 21°C'][i],
          pestInfestation: false,
          diseaseSymptoms: i === 2,
          diseaseType: i === 2 ? 'Coffee Leaf Rust (minor)' : null,
          recommendation: i === 2 ? 'Apply copper-based fungicide preventively' : 'Good health status',
          alertTriggered: false,
          isActive: true,
        },
      })
    }

    // ─── 7. FERTILIZER APPLICATION ───
    await db.fertilizerApplication.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
        soilTestDate: new Date('2024-03-01'),
        ph: '5.8',
        nitrogen: 'Medium',
        phosphorus: 'Low',
        potassium: 'Medium',
        organicMatter: 3.2,
        applicationDate: new Date('2024-04-15'),
        plotBlockId: 'TB-PLT-001-A1',
        fertilizerType: 'Organic',
        organicCertFlag: true,
        product: 'Composted manure + Rock phosphate',
        dosePerHa: '5 tons/ha',
        appliedQty: '10 tons (2 ha)',
        costPerUnit: 800000,
        totalCost: 8000000,
        labourCost: 1000000,
        applicationMethod: 'Basal dressing',
        weatherAtApp: 'Overcast, no rain',
        isActive: true,
      },
    })

    await db.fertilizerApplication.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
        soilTestDate: new Date('2024-02-20'),
        ph: '6.1',
        nitrogen: 'High',
        phosphorus: 'Medium',
        potassium: 'High',
        organicMatter: 4.5,
        applicationDate: new Date('2024-04-01'),
        plotBlockId: 'TB-PLT-002-B1',
        fertilizerType: 'Organic',
        organicCertFlag: true,
        product: 'Vermicompost + Bone meal',
        dosePerHa: '4 tons/ha',
        appliedQty: '6 tons (1.5 ha)',
        costPerUnit: 1200000,
        totalCost: 7200000,
        labourCost: 800000,
        applicationMethod: 'Ring application',
        weatherAtApp: 'Clear, mild',
        isActive: true,
      },
    })

    // ─── 8. PEST & DISEASE MANAGEMENT ───
    await db.pestDiseaseManagement.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
        scoutingDate: new Date('2024-08-15'),
        plotBlockId: 'TB-PLT-001-A1',
        pestIdentified: true,
        pestType: 'Coffee Berry Borer (Hypothenemus hampei)',
        pestDensity: '5-10 per tree',
        diseaseIdentified: false,
        severityLevel: 'Moderate',
        weatherConditions: 'Warm, humid',
        treatmentDate: new Date('2024-08-20'),
        treatmentType: 'Biological',
        product: 'Beauveria bassiana (Bio-Catch)',
        dose: '2g/L water',
        phiDays: 0,
        reiHours: 4,
        windSpeed: 'Low (<5 km/h)',
        rainForecast24h: false,
        bufferZoneRespected: true,
        equipmentUsed: 'Knapsack sprayer',
        laborCost: 500000,
        totalCost: 1500000,
        isActive: true,
      },
    })

    await db.pestDiseaseManagement.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
        scoutingDate: new Date('2024-09-10'),
        plotBlockId: 'TB-PLT-002-B1',
        pestIdentified: false,
        diseaseIdentified: true,
        diseaseType: 'Coffee Leaf Rust (Hemileia vastatrix)',
        severityLevel: 'Low',
        weatherConditions: 'Rainy season onset',
        treatmentDate: new Date('2024-09-15'),
        treatmentType: 'Biological',
        product: 'Bordeaux mixture (copper sulfate)',
        dose: '1% solution',
        phiDays: 7,
        reiHours: 12,
        windSpeed: 'Calm',
        rainForecast24h: true,
        bufferZoneRespected: true,
        equipmentUsed: 'Mist blower',
        laborCost: 600000,
        totalCost: 1200000,
        isActive: true,
      },
    })

    // ─── 9. HARVEST & POST-HARVEST TRACEABILITY ───
    const batchId1 = `${BATCH_PREFIX}-BATCH-2024-001`
    const batchId2 = `${BATCH_PREFIX}-BATCH-2024-002`

    // Harvest Traceability records
    const ht1 = await db.harvestTraceability.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation1.id, farmerId: farmer1.id, farmLandId: farmLand1.id,
        plannedHarvestDate: new Date('2024-11-01'),
        plotBlockId: 'TB-PLT-001-A1',
        coffeeVariety: 'Chari (Robusta)',
        estimatedYield: '3500 kg',
        actualHarvestDate: new Date('2024-11-10'),
        harvestMethod: 'Selective Picking',
        harvestEquipment: 'Hand picking, plastic baskets',
        fieldMoisture: 'Moderate',
        cherryRipeness: 92.0,
        harvestLabourCost: 3500000,
        sampleWeight: 5.0,
        sampleArea: 0.01,
        sampleYield: 500,
        estimatedYieldPerHa: 3500,
        processingMethod: 'Washed',
        dryingMethod: 'Raised beds (African)',
        dryingDurationDays: 14,
        targetMoisture: 11.0,
        moistureContent: 10.8,
        defectiveBeans: 2.1,
        foreignMatter: 0.05,
        cupScore: 82.5,
        batchId: batchId1,
        coffeeVarietyAtBatch: 'Chari (Robusta)',
        processingStage: 'Harvested',
        batchTimestamp: new Date('2024-11-10T07:30:00'),
        location: "Thanh's Farm, Ea Tam, Cu Mgar",
        actor: 'Nguyen Van Thanh',
        batchNotes: 'Excellent ripeness, selective picking quality',
        batchPhotos: 'harvest_thanh_001.jpg,harvest_thanh_002.jpg',
        isActive: true,
      },
    })

    const ht2 = await db.harvestTraceability.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation2.id, farmerId: farmer2.id, farmLandId: farmLand2.id,
        plannedHarvestDate: new Date('2024-10-15'),
        plotBlockId: 'TB-PLT-002-B1',
        coffeeVariety: 'Catimor (Arabica)',
        estimatedYield: '2800 kg',
        actualHarvestDate: new Date('2024-10-20'),
        harvestMethod: 'Selective Picking',
        harvestEquipment: 'Hand picking, woven baskets',
        fieldMoisture: 'Low',
        cherryRipeness: 95.0,
        harvestLabourCost: 2800000,
        sampleWeight: 4.5,
        sampleArea: 0.01,
        sampleYield: 450,
        estimatedYieldPerHa: 2800,
        processingMethod: 'Natural',
        dryingMethod: 'Raised beds (parabolic)',
        dryingDurationDays: 21,
        targetMoisture: 11.5,
        moistureContent: 11.2,
        defectiveBeans: 1.5,
        foreignMatter: 0.02,
        cupScore: 85.0,
        batchId: batchId2,
        coffeeVarietyAtBatch: 'Catimor (Arabica)',
        processingStage: 'Harvested',
        batchTimestamp: new Date('2024-10-20T06:45:00'),
        location: "Hoa's Garden, Ea Drang, Cu Mgar",
        actor: 'Tran Thi Hoa',
        batchNotes: 'High quality natural processed cherries',
        batchPhotos: 'harvest_hoa_001.jpg',
        isActive: true,
      },
    })

    // Also create simple Harvest+Lot records for the lot traceability chain
    const harvest1 = await db.harvest.create({
      data: {
        cultivationId: cultivation1.id,
        harvestDate: new Date('2024-11-10'),
        harvestQty: 3200,
        unit: 'kg',
        quality: 'A',
        processingMethod: 'Washed',
      },
    })

    await db.lot.create({
      data: {
        harvestId: harvest1.id,
        lotCode: `LOT-${batchId1}`,
        processingDate: new Date('2024-11-15'),
        millName: 'Central Highlands Mill',
        status: 'processing',
      },
    })

    const harvest2 = await db.harvest.create({
      data: {
        cultivationId: cultivation2.id,
        harvestDate: new Date('2024-10-20'),
        harvestQty: 2500,
        unit: 'kg',
        quality: 'A',
        processingMethod: 'Natural',
      },
    })

    await db.lot.create({
      data: {
        harvestId: harvest2.id,
        lotCode: `LOT-${batchId2}`,
        processingDate: new Date('2024-10-25'),
        millName: 'Central Highlands Mill',
        status: 'processing',
      },
    })

    // ─── 10. COLLECTION CENTRE ───
    const cc1 = await db.collectionCentre.create({
      data: {
        moduleId, tenantId: null,
        centreId: 'CC-EATAM-001',
        centreName: 'Ea Tam Collection Centre',
        centreGpsLat: 12.670, centreGpsLng: 108.042,
        province: 'Dak Lak', district: 'Cu Mgar', commune: 'Ea Tam',
        managerName: 'Vo Van Em',
        contactNumber: '0977112233',
        storageCapacityKg: 15000,
        scaleType: 'Digital platform scale (500kg)',
        scaleLastCalibrationDate: new Date('2024-06-01'),
        isActive: true,
      },
    })

    const cc2 = await db.collectionCentre.create({
      data: {
        moduleId, tenantId: null,
        centreId: 'CC-EADRG-001',
        centreName: 'Ea Drang Organic Collection Hub',
        centreGpsLat: 12.695, centreGpsLng: 108.060,
        province: 'Dak Lak', district: 'Cu Mgar', commune: 'Ea Drang',
        managerName: 'Nguyen Thanh Son',
        contactNumber: '0988334455',
        storageCapacityKg: 10000,
        scaleType: 'Digital platform scale (200kg)',
        scaleLastCalibrationDate: new Date('2024-07-15'),
        isActive: true,
      },
    })

    // ─── 11. PROCUREMENT RECORDS ───
    const proc1 = await db.procurementRecord.create({
      data: {
        moduleId, tenantId: null,
        collectionCentreId: cc1.id,
        cultivationId: cultivation1.id,
        farmerId: farmer1.id,
        farmLandId: farmLand1.id,
        procurementId: `PROC-${uid()}`,
        procurementDate: new Date('2024-11-11'),
        batchId: batchId1,
        coffeeType: 'Cherry',
        coffeeVariety: 'Chari (Robusta)',
        grossWeight: 3350,
        tareWeight: 150,
        netWeight: 3200,
        moistureContentAtGate: 52.0,
        moistureDeduction: 0,
        adjustedNetWeight: 3200,
        cherryRipenessGrade: 'A (92% red)',
        defects: 2.1,
        purchasePricePerKg: 8500,
        totalPurchaseAmount: 27200000,
        priceBasis: 'Cherry, wet weight',
        certPremiumApplied: 500,
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Completed',
        paymentDate: new Date('2024-11-13'),
        receiptVoucherNo: 'RCP-2024-11-11-001',
        weighingPhoto: 'weigh_thanh_001.jpg',
        samplePhoto: 'sample_thanh_001.jpg',
        notes: 'First batch of the season, excellent quality',
        isActive: true,
      },
    })

    const proc2 = await db.procurementRecord.create({
      data: {
        moduleId, tenantId: null,
        collectionCentreId: cc2.id,
        cultivationId: cultivation2.id,
        farmerId: farmer2.id,
        farmLandId: farmLand2.id,
        procurementId: `PROC-${uid()}`,
        procurementDate: new Date('2024-10-21'),
        batchId: batchId2,
        coffeeType: 'Cherry',
        coffeeVariety: 'Catimor (Arabica)',
        grossWeight: 2620,
        tareWeight: 120,
        netWeight: 2500,
        moistureContentAtGate: 48.0,
        moistureDeduction: 0,
        adjustedNetWeight: 2500,
        cherryRipenessGrade: 'A+ (95% red)',
        defects: 1.5,
        purchasePricePerKg: 12000,
        totalPurchaseAmount: 30000000,
        priceBasis: 'Cherry, wet weight',
        certPremiumApplied: 1500,
        paymentMethod: 'Cash',
        paymentStatus: 'Completed',
        paymentDate: new Date('2024-10-22'),
        receiptVoucherNo: 'RCP-2024-10-21-001',
        weighingPhoto: 'weigh_hoa_001.jpg',
        samplePhoto: 'sample_hoa_001.jpg',
        notes: 'Organic + Fair Trade premium applied',
        isActive: true,
      },
    })

    // ─── 12. PROCUREMENT TRANSPORT ───
    await db.procurementTransport.create({
      data: {
        moduleId, tenantId: null,
        procurementRecordId: proc1.id,
        transportId: `TRN-${uid()}`,
        departureDateTime: new Date('2024-11-12T06:00:00'),
        arrivalDateTime: new Date('2024-11-12T09:30:00'),
        vehiclePlateNo: '81C-12345',
        driverName: 'Pham Van Tuan',
        transportRoute: 'Ea Tam → Cu Mgar Town → Processing Plant, Buon Ma Thuot',
        transportCost: 2500000,
        temperatureDuringTransport: 28,
        receivedAtPlantKg: 3185,
        weightVariance: -15,
        deliveryReceiptUpload: 'delivery_receipt_001.pdf',
        isActive: true,
      },
    })

    await db.procurementTransport.create({
      data: {
        moduleId, tenantId: null,
        procurementRecordId: proc2.id,
        transportId: `TRN-${uid()}`,
        departureDateTime: new Date('2024-10-22T05:30:00'),
        arrivalDateTime: new Date('2024-10-22T08:45:00'),
        vehiclePlateNo: '81C-67890',
        driverName: 'Le Quang Huy',
        transportRoute: 'Ea Drang → Cu Mgar → Organic Processing Facility, Buon Ma Thuot',
        transportCost: 2200000,
        temperatureDuringTransport: 25,
        receivedAtPlantKg: 2495,
        weightVariance: -5,
        deliveryReceiptUpload: 'delivery_receipt_002.pdf',
        isActive: true,
      },
    })

    // ─── 13. PROCESSING JOB ORDER ───
    await db.processingJobOrder.create({
      data: {
        moduleId, tenantId: null,
        jobOrderId: `JOB-${BATCH_PREFIX}-001`,
        processingDate: new Date('2024-11-13'),
        batchIdInput: batchId1,
        coffeeTypeInput: 'Cherry',
        coffeeVarietyInput: 'Chari (Robusta)',
        inputQuantityKg: 3185,
        processingMethod: 'Washed',
        targetOutputProduct: 'Green Bean (Robusta)',
        operatorName: 'Vo Minh Tri',
        plantFacilityName: 'Terra Brew Central Processing Plant',
        stage1Cleaning: JSON.stringify({ date: '2024-11-13', weightIn: 3185, weightOut: 3150, debrisRemoved: 35, method: 'Pre-grading screen + water float', operator: 'Team A' }),
        stage2Depulping: JSON.stringify({ date: '2024-11-13', weightIn: 3150, weightOut: 2800, method: 'Disk pulper (3-disc)', fermentationStart: '2024-11-13T14:00', operator: 'Team A' }),
        stage3Fermentation: JSON.stringify({ startDate: '2024-11-13', endDate: '2024-11-14', durationHours: 24, phStart: 5.2, phEnd: 4.1, temperature: 22, turningFrequency: 'Every 6 hours', operator: 'Team B' }),
        stage4Washing: JSON.stringify({ date: '2024-11-14', weightIn: 2750, weightOut: 2720, waterUsedLiters: 5000, method: 'Channel washing (3 channels)', operator: 'Team B' }),
        stage5Drying: JSON.stringify({ startDate: '2024-11-14', endDate: '2024-11-28', durationDays: 14, method: 'Raised African beds', initialMoisture: 55, finalMoisture: 11.2, targetMoisture: 11.0, turningFrequency: 'Every 2 hours', operator: 'Team C' }),
        stage6Hulling: JSON.stringify({ date: '2024-11-29', weightIn: 1200, weightOut: 680, method: 'Huller machine (2-pass)', parchmentRemoved: 520, operator: 'Team D' }),
        stage7Grading: JSON.stringify({ date: '2024-11-30', weightIn: 680, gradeA: 510, gradeB: 130, gradeC: 25, reject: 15, method: 'Screen sizing (14/16/18)', operator: 'QC Team' }),
        stage8Blending: JSON.stringify({ date: '2024-12-01', note: 'No blending - single origin lot', finalWeight: 640, operator: 'Master Blender' }),
        stage9Roasting: JSON.stringify({ date: '2024-12-05', weightIn: 100, roastLevel: 'Medium', chargeTemp: 200, firstCrack: 196, developmentTime: 90, finalTemp: 218, colorScore: 65, operator: 'Roast Master' }),
        stage10Grinding: JSON.stringify({ date: '2024-12-05', weightIn: 95, grindSize: 'Medium-Coarse', method: 'Burr grinder', outputWeight: 94, operator: 'Packaging Team' }),
        stage11Packaging: JSON.stringify({ date: '2024-12-06', weightIn: 640, packageType: 'Triple-layer foil bag (1kg)', packagesProduced: 640, nitrogenFlush: true, labelBatch: `LBL-${batchId1}`, operator: 'Packaging Team' }),
        inputWeightKg: 3185,
        finalOutputWeightKg: 640,
        overallOutturn: 20.1,
        totalProcessingCost: 35000000,
        costPerKg: 54687,
        finalMoistureContent: 10.8,
        cupScore: 82.5,
        cuppingNotes: 'Clean cup, medium body, chocolate and nut notes, low acidity',
        qcApprovedBy: 'Nguyen Thi Lan (QC Manager)',
        qcApprovalDate: new Date('2024-12-07'),
        qcReportUpload: 'qc_report_batch001.pdf',
        isActive: true,
      },
    })

    await db.processingJobOrder.create({
      data: {
        moduleId, tenantId: null,
        jobOrderId: `JOB-${BATCH_PREFIX}-002`,
        processingDate: new Date('2024-10-23'),
        batchIdInput: batchId2,
        coffeeTypeInput: 'Cherry',
        coffeeVarietyInput: 'Catimor (Arabica)',
        inputQuantityKg: 2495,
        processingMethod: 'Natural',
        targetOutputProduct: 'Green Bean (Arabica Natural)',
        operatorName: 'Le Hoang Nam',
        plantFacilityName: 'Terra Brew Organic Processing Facility',
        stage1Cleaning: JSON.stringify({ date: '2024-10-23', weightIn: 2495, weightOut: 2470, debrisRemoved: 25, method: 'Hand sorting + air classification', operator: 'Team A' }),
        stage2Depulping: JSON.stringify({ date: '2024-10-23', note: 'SKIPPED - Natural process', weightIn: 2470, weightOut: 2470 }),
        stage3Fermentation: JSON.stringify({ date: '2024-10-23', note: 'SKIPPED - Natural dry fermentation in cherry', weightIn: 2470, weightOut: 2470 }),
        stage4Washing: JSON.stringify({ date: '2024-10-23', note: 'SKIPPED - Natural process', weightIn: 2470, weightOut: 2470 }),
        stage5Drying: JSON.stringify({ startDate: '2024-10-23', endDate: '2024-11-13', durationDays: 21, method: 'Raised beds (parabolic greenhouse)', initialMoisture: 62, finalMoisture: 11.5, targetMoisture: 11.5, turningFrequency: 'Every hour (daytime)', operator: 'Team C' }),
        stage6Hulling: JSON.stringify({ date: '2024-11-14', weightIn: 1050, weightOut: 580, method: 'Huller (1-pass, low friction)', parchmentRemoved: 470, operator: 'Team D' }),
        stage7Grading: JSON.stringify({ date: '2024-11-15', weightIn: 580, gradeA: 464, gradeB: 87, gradeC: 20, reject: 9, method: 'Density table + screen sizing', operator: 'QC Team' }),
        stage8Blending: JSON.stringify({ date: '2024-11-16', note: 'No blending - single origin lot', finalWeight: 551, operator: 'Master Blender' }),
        stage9Roasting: JSON.stringify({ date: '2024-11-20', weightIn: 80, roastLevel: 'Medium-Light', chargeTemp: 195, firstCrack: 193, developmentTime: 75, finalTemp: 208, colorScore: 58, operator: 'Roast Master' }),
        stage10Grinding: JSON.stringify({ date: '2024-11-20', weightIn: 76, grindSize: 'Medium', method: 'Burr grinder', outputWeight: 75, operator: 'Packaging Team' }),
        stage11Packaging: JSON.stringify({ date: '2024-11-21', weightIn: 551, packageType: 'Kraft bag + inner foil (250g)', packagesProduced: 2204, nitrogenFlush: true, labelBatch: `LBL-${batchId2}`, operator: 'Packaging Team' }),
        inputWeightKg: 2495,
        finalOutputWeightKg: 551,
        overallOutturn: 22.1,
        totalProcessingCost: 42000000,
        costPerKg: 76225,
        finalMoistureContent: 11.2,
        cupScore: 85.0,
        cuppingNotes: 'Bright acidity, floral and berry notes, silky body, sweet finish',
        qcApprovedBy: 'Nguyen Thi Lan (QC Manager)',
        qcApprovalDate: new Date('2024-11-22'),
        qcReportUpload: 'qc_report_batch002.pdf',
        isActive: true,
      },
    })

    // ─── 14. PROCESSING STAGE RECORDS (individual CRUD for each stage) ───
    // Stage type enum matches the processing-stages.tsx views
    const stageTypes = [
      'INITIAL_CLEANING',
      'DEPULPING',
      'FERMENTATION',
      'WASHING',
      'DRYING',
      'HULLING',
      'GRADING_SORTING',
      'BLENDING',
      'ROASTING',
      'GRINDING',
      'PACKAGING',
    ]

    // Batch 1 stage records (Washed Robusta)
    const batch1StageData: Record<string, object> = {
      INITIAL_CLEANING: { date: '2024-11-13T08:00', weightInKg: 3185, weightOutKg: 3150, debrisRemovedKg: 35, method: 'Pre-grading screen + water floatation', rejectedCherryKg: 20, notes: 'Clean lot, minimal foreign matter' },
      DEPULPING: { date: '2024-11-13T10:00', weightInKg: 3150, weightOutKg: 2800, method: '3-disc pulper', parchmentMoisturePercent: 55, fermentationInitiated: true, notes: 'Smooth depulping, low parchment damage' },
      FERMENTATION: { startDate: '2024-11-13T14:00', endDate: '2024-11-14T14:00', durationHours: 24, phStart: 5.2, phEnd: 4.1, temperatureC: 22, turningFrequency: 'Every 6 hours', notes: 'Clean fermentation, no off-odors' },
      WASHING: { date: '2024-11-14T15:00', weightInKg: 2750, weightOutKg: 2720, waterUsedLiters: 5000, method: 'Channel washing (3 channels)', notes: 'Clear water discharge achieved' },
      DRYING: { startDate: '2024-11-14', endDate: '2024-11-28', durationDays: 14, method: 'Raised African beds', bedRows: 20, initialMoisturePercent: 55, finalMoisturePercent: 11.2, targetMoisturePercent: 11.0, turningFrequency: 'Every 2 hours daytime', avgTemperatureC: 28, notes: 'Excellent drying conditions, no rain' },
      HULLING: { date: '2024-11-29T09:00', weightInKg: 1200, weightOutKg: 680, method: 'Huller (2-pass)', parchmentRemovedKg: 520, greenOutputPercent: 56.7, notes: 'Good outturn ratio' },
      GRADING_SORTING: { date: '2024-11-30T08:00', weightInKg: 680, gradeA_Kg: 510, gradeB_Kg: 130, gradeC_Kg: 25, rejectKg: 15, method: 'Screen sizing (14/16/18)', notes: '75% Grade A - excellent quality' },
      BLENDING: { date: '2024-12-01T10:00', weightInKg: 640, blendingRequired: false, finalWeightKg: 640, notes: 'Single origin, no blending needed' },
      ROASTING: { date: '2024-12-05T06:00', batchWeightKg: 100, roastLevel: 'Medium', chargeTempC: 200, firstCrackTempC: 196, developmentTimeSec: 90, dropTempC: 218, agtronColorScore: 65, notes: 'Sample roast for quality check' },
      GRINDING: { date: '2024-12-05T14:00', weightInKg: 95, grindSize: 'Medium-Coarse', grinderType: 'Burr grinder', outputWeightKg: 94, notes: 'Consistent grind profile' },
      PACKAGING: { date: '2024-12-06T08:00', weightInKg: 640, packageType: 'Triple-layer foil bag (1kg)', packagesCount: 640, nitrogenFlush: true, labelBatchNo: `LBL-${batchId1}`, bestBeforeDate: '2026-12-06', notes: 'All packages nitrogen-flushed and sealed' },
    }

    for (const st of stageTypes) {
      await db.processingStageRecord.create({
        data: {
          moduleId,
          batchId: batchId1,
          stageType: st,
          stageData: JSON.stringify(batch1StageData[st]),
          notes: `Stage: ${st} for batch ${batchId1}`,
          recordedBy: adminUser.id,
          isActive: true,
        },
      })
    }

    // Batch 2 stage records (Natural Arabica)
    const batch2StageData: Record<string, object> = {
      INITIAL_CLEANING: { date: '2024-10-23T08:00', weightInKg: 2495, weightOutKg: 2470, debrisRemovedKg: 25, method: 'Hand sorting + air classification', rejectedCherryKg: 12, notes: 'High quality cherry, very clean' },
      DEPULPING: { date: '2024-10-23', skipped: true, reason: 'Natural process - no depulping', weightInKg: 2470, weightOutKg: 2470, notes: 'N/A for natural process' },
      FERMENTATION: { date: '2024-10-23', skipped: true, reason: 'Natural process - dry fermentation in cherry', weightInKg: 2470, weightOutKg: 2470, notes: 'N/A for natural process' },
      WASHING: { date: '2024-10-23', skipped: true, reason: 'Natural process - no washing', weightInKg: 2470, weightOutKg: 2470, notes: 'N/A for natural process' },
      DRYING: { startDate: '2024-10-23', endDate: '2024-11-13', durationDays: 21, method: 'Raised beds (parabolic greenhouse)', bedRows: 15, initialMoisturePercent: 62, finalMoisturePercent: 11.5, targetMoisturePercent: 11.5, turningFrequency: 'Every hour (daytime)', avgTemperatureC: 26, notes: 'Longer drying for natural, excellent sweetness development' },
      HULLING: { date: '2024-11-14T09:00', weightInKg: 1050, weightOutKg: 580, method: 'Huller (1-pass, low friction)', parchmentRemovedKg: 470, greenOutputPercent: 55.2, notes: 'Careful hulling to preserve natural flavor' },
      GRADING_SORTING: { date: '2024-11-15T08:00', weightInKg: 580, gradeA_Kg: 464, gradeB_Kg: 87, gradeC_Kg: 20, rejectKg: 9, method: 'Density table + screen sizing (12/14/16)', notes: '80% Grade A - premium quality natural' },
      BLENDING: { date: '2024-11-16T10:00', weightInKg: 551, blendingRequired: false, finalWeightKg: 551, notes: 'Single origin Arabica, no blending' },
      ROASTING: { date: '2024-11-20T06:00', batchWeightKg: 80, roastLevel: 'Medium-Light', chargeTempC: 195, firstCrackTempC: 193, developmentTimeSec: 75, dropTempC: 208, agtronColorScore: 58, notes: 'Light roast to preserve floral notes' },
      GRINDING: { date: '2024-11-20T14:00', weightInKg: 76, grindSize: 'Medium', grinderType: 'Burr grinder', outputWeightKg: 75, notes: 'Precision grind for cupping samples' },
      PACKAGING: { date: '2024-11-21T08:00', weightInKg: 551, packageType: 'Kraft bag + inner foil (250g)', packagesCount: 2204, nitrogenFlush: true, labelBatchNo: `LBL-${batchId2}`, bestBeforeDate: '2026-11-21', notes: 'Premium packaging with origin story' },
    }

    for (const st of stageTypes) {
      await db.processingStageRecord.create({
        data: {
          moduleId,
          batchId: batchId2,
          stageType: st,
          stageData: JSON.stringify(batch2StageData[st]),
          notes: `Stage: ${st} for batch ${batchId2}`,
          recordedBy: adminUser.id,
          isActive: true,
        },
      })
    }

    // ─── 15. SMART CONTRACTS ───
    await db.smartContract.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation1.id,
        contractId: `SC-${BATCH_PREFIX}-001`,
        farmerId: farmer1.id,
        batchId: batchId1,
        quantity: 640,
        pricePerKg: 85000,
        paymentTerms: 'Net 30 days after delivery',
        paymentTriggerCondition: 'QC approval + delivery confirmation',
        contractDate: new Date('2024-11-01'),
        buyer: 'Global Coffee Traders GmbH',
        status: 'Fulfilled',
      },
    })

    await db.smartContract.create({
      data: {
        moduleId, tenantId: null,
        cultivationId: cultivation2.id,
        contractId: `SC-${BATCH_PREFIX}-002`,
        farmerId: farmer2.id,
        batchId: batchId2,
        quantity: 551,
        pricePerKg: 120000,
        paymentTerms: 'Prepaid 50% + 50% on delivery',
        paymentTriggerCondition: 'Prepaid at harvest, final on QC pass',
        contractDate: new Date('2024-09-15'),
        buyer: 'Specialty Roasters Japan Co.',
        status: 'Fulfilled',
      },
    })

    // ─── 16. MARKETPLACE LISTINGS ───
    const listing1 = await db.marketplaceListing.create({
      data: {
        moduleId, tenantId: null,
        listingId: `MKT-${BATCH_PREFIX}-001`,
        batchId: batchId1,
        coffeeVariety: 'Chari (Robusta)',
        processingMethod: 'Washed',
        cupScore: 82.5,
        certificationLabels: 'Organic',
        listingDate: new Date('2024-12-08'),
        availableQty: 640,
        pricePerKg: 85000,
        priceValidUntil: new Date('2025-03-08'),
        buyerRequests: '3 inquiries (Japan, Korea, EU)',
      },
    })

    const listing2 = await db.marketplaceListing.create({
      data: {
        moduleId, tenantId: null,
        listingId: `MKT-${BATCH_PREFIX}-002`,
        batchId: batchId2,
        coffeeVariety: 'Catimor (Arabica)',
        processingMethod: 'Natural',
        cupScore: 85.0,
        certificationLabels: 'Organic, Fair Trade',
        listingDate: new Date('2024-11-23'),
        availableQty: 551,
        pricePerKg: 120000,
        priceValidUntil: new Date('2025-02-23'),
        buyerRequests: '7 inquiries (Japan, US, Germany, Australia, Norway)',
      },
    })

    // ─── 17. SALE TRANSACTIONS ───
    await db.saleTransaction.create({
      data: {
        moduleId, tenantId: null,
        listingId: listing1.id,
        transactionId: `TXN-${BATCH_PREFIX}-001`,
        dateOfSale: new Date('2024-12-20'),
        quantitySold: 500,
        totalAmount: 42500000,
        paymentStatus: 'Completed',
        costOfProduction: 35000000,
        grossMargin: 17.6,
      },
    })

    await db.saleTransaction.create({
      data: {
        moduleId, tenantId: null,
        listingId: listing2.id,
        transactionId: `TXN-${BATCH_PREFIX}-002`,
        dateOfSale: new Date('2024-12-01'),
        quantitySold: 400,
        totalAmount: 48000000,
        paymentStatus: 'Completed',
        costOfProduction: 42000000,
        grossMargin: 12.5,
      },
    })

    // ─── 18. COFFEE INSPECTION ───
    await db.coffeeInspection.create({
      data: {
        moduleId, tenantId: null,
        farmerId: farmer1.id, cultivationId: cultivation1.id,
        inspectionId: `INS-${BATCH_PREFIX}-001`,
        certificationType: 'Organic',
        certifyingBody: 'Control Union',
        certificateNo: `CERT-CU-2024-${uid()}`,
        certStatus: 'Compliant',
        auditDate: new Date('2024-06-15'),
        certIssueDate: new Date('2024-08-01'),
        certExpiryDate: new Date('2025-07-31'),
        auditorName: 'Nguyen Thi Bich',
        complianceStatus: 'Compliant',
        auditReport: 'Full compliance with EU Organic Regulation (EC) 834/2007',
        inspectionType: 'Field',
        inspectionDate: new Date('2024-06-15'),
        inspectorName: 'Nguyen Thi Bich',
        inspectorOrganisation: 'Control Union Certifications',
        inspectionScope: 'Annual surveillance audit - full scope',
        inspectionGpsLat: 12.668, inspectionGpsLng: 108.038,
        observations: 'Excellent farm management practices. All buffer zones maintained. No prohibited inputs detected.',
        inspectionStatus: 'Closed',
        nonConformanceIdentified: false,
        photos: 'audit_thanh_001.jpg,audit_thanh_002.jpg',
        isActive: true,
      },
    })

    await db.coffeeInspection.create({
      data: {
        moduleId, tenantId: null,
        farmerId: farmer2.id, cultivationId: cultivation2.id,
        inspectionId: `INS-${BATCH_PREFIX}-002`,
        certificationType: 'Organic',
        certifyingBody: 'ECOCERT',
        certificateNo: `CERT-ECO-2024-${uid()}`,
        certStatus: 'Compliant',
        auditDate: new Date('2024-05-20'),
        certIssueDate: new Date('2024-07-15'),
        certExpiryDate: new Date('2025-07-14'),
        auditorName: 'Tran Van Quang',
        complianceStatus: 'Compliant',
        auditReport: 'Dual certification (Organic + Fair Trade) maintained. All requirements met.',
        inspectionType: 'Field',
        inspectionDate: new Date('2024-05-20'),
        inspectorName: 'Tran Van Quang',
        inspectorOrganisation: 'ECOCERT Vietnam',
        inspectionScope: 'Combined organic + Fair Trade audit',
        inspectionGpsLat: 12.692, inspectionGpsLng: 108.055,
        observations: 'Strong community engagement. Fair Trade premium properly managed. Organic standards fully met.',
        inspectionStatus: 'Closed',
        nonConformanceIdentified: false,
        isActive: true,
      },
    })

    // ─── 19. CERTIFICATION ASSESSMENT ───
    await db.certAssessment.create({
      data: {
        moduleId, tenantId: null,
        farmerId: farmer1.id, cultivationId: cultivation1.id, farmLandId: farmLand1.id,
        assessmentId: `CA-${BATCH_PREFIX}-001`,
        certificationStandard: 'EU Organic (EC 834/2007)',
        assessmentDate: new Date('2024-06-15'),
        assessorName: 'Nguyen Thi Bich',
        gpsAtAssessmentLat: 12.668, gpsAtAssessmentLng: 108.038,
        farmManagementPlanDoc: 'fmp_thanh_2024.pdf',
        cat1FarmManagement: JSON.stringify([{ question: 'Farm management plan', score: 9, maxScore: 10, status: 'pass' }]),
        cat2EnvironmentalProtection: JSON.stringify([{ question: 'Buffer zones maintained', score: 10, maxScore: 10, status: 'pass' }]),
        cat3SoilManagement: JSON.stringify([{ question: 'Soil conservation', score: 8, maxScore: 10, status: 'pass' }]),
        cat4PestDisease: JSON.stringify([{ question: 'IPM practices', score: 8, maxScore: 10, status: 'pass' }]),
        cat5FertilizerUse: JSON.stringify([{ question: 'Organic inputs only', score: 10, maxScore: 10, status: 'pass' }]),
        cat6HarvestPostHarvest: JSON.stringify([{ question: 'Post-harvest handling', score: 9, maxScore: 10, status: 'pass' }]),
        cat7WorkerWelfare: JSON.stringify([{ question: 'Worker safety', score: 9, maxScore: 10, status: 'pass' }]),
        cat8CommunityRelations: JSON.stringify([{ question: 'Community engagement', score: 8, maxScore: 10, status: 'pass' }]),
        cat9Training: JSON.stringify([{ question: 'Farmer training', score: 7, maxScore: 10, status: 'pass' }]),
        cat10UsdaOrganic: JSON.stringify([{ question: 'USDA equivalence', score: 8, maxScore: 10, status: 'pass' }]),
        cat11ClimateCarbon: JSON.stringify([{ question: 'Carbon footprint', score: 7, maxScore: 10, status: 'pass' }]),
        certificationOutcome: 'Certified - Organic',
        totalScorePercentage: 85.0,
        scoreBreakdown: JSON.stringify({ total: 93, max: 110, percentage: 85 }),
        isActive: true,
      },
    })

    await db.certAssessment.create({
      data: {
        moduleId, tenantId: null,
        farmerId: farmer2.id, cultivationId: cultivation2.id, farmLandId: farmLand2.id,
        assessmentId: `CA-${BATCH_PREFIX}-002`,
        certificationStandard: 'EU Organic + Fair Trade (FLO)',
        assessmentDate: new Date('2024-05-20'),
        assessorName: 'Tran Van Quang',
        gpsAtAssessmentLat: 12.692, gpsAtAssessmentLng: 108.055,
        cat1FarmManagement: JSON.stringify([{ question: 'Farm management plan', score: 10, maxScore: 10, status: 'pass' }]),
        cat2EnvironmentalProtection: JSON.stringify([{ question: 'Buffer zones', score: 9, maxScore: 10, status: 'pass' }]),
        cat3SoilManagement: JSON.stringify([{ question: 'Soil conservation', score: 9, maxScore: 10, status: 'pass' }]),
        cat4PestDisease: JSON.stringify([{ question: 'IPM', score: 9, maxScore: 10, status: 'pass' }]),
        cat5FertilizerUse: JSON.stringify([{ question: 'Organic inputs', score: 10, maxScore: 10, status: 'pass' }]),
        cat6HarvestPostHarvest: JSON.stringify([{ question: 'Post-harvest', score: 10, maxScore: 10, status: 'pass' }]),
        cat7WorkerWelfare: JSON.stringify([{ question: 'Worker safety + Fair Trade', score: 10, maxScore: 10, status: 'pass' }]),
        cat8CommunityRelations: JSON.stringify([{ question: 'Community + Fair Trade premium', score: 10, maxScore: 10, status: 'pass' }]),
        cat9Training: JSON.stringify([{ question: 'Training records', score: 9, maxScore: 10, status: 'pass' }]),
        cat10UsdaOrganic: JSON.stringify([{ question: 'USDA', score: 9, maxScore: 10, status: 'pass' }]),
        cat11ClimateCarbon: JSON.stringify([{ question: 'Carbon', score: 8, maxScore: 10, status: 'pass' }]),
        certificationOutcome: 'Certified - Organic + Fair Trade',
        totalScorePercentage: 90.5,
        scoreBreakdown: JSON.stringify({ total: 103, max: 110, percentage: 94 }),
        isActive: true,
      },
    })

    // ════════════════════════════════════════════════════════════════
    // SUMMARY
    // ════════════════════════════════════════════════════════════════
    return NextResponse.json({
      success: true,
      message: `End-to-end seed data created for ${mod.name}!`,
      loginHint: `Email: ${adminEmail}, Password: admin123`,
      summary: {
        farmers: allFarmers.length,
        farmLands: 2,
        cultivations: 2,
        nurseries: 2,
        landPreparations: 2,
        cropMonitorings: 6,
        fertilizerApplications: 2,
        pestDiseaseManagements: 2,
        harvestTraceabilities: 2,
        collectionCentres: 2,
        procurementRecords: 2,
        procurementTransports: 2,
        processingJobOrders: 2,
        processingStageRecords: 22, // 11 stages × 2 batches
        smartContracts: 2,
        marketplaceListings: 2,
        saleTransactions: 2,
        coffeeInspections: 2,
        certAssessments: 2,
      },
      traceabilityBatches: {
        [batchId1]: {
          farmer: farmer1.fullName,
          crop: 'Chari (Robusta) - Washed',
          path: 'Farm → Ea Tam CC → Central Plant → Marketplace',
          cupScore: 82.5,
          totalKg: 640,
        },
        [batchId2]: {
          farmer: farmer2.fullName,
          crop: 'Catimor (Arabica) - Natural',
          path: 'Farm → Ea Drang CC → Organic Facility → Marketplace',
          cupScore: 85.0,
          totalKg: 551,
        },
      },
    })
  } catch (e: any) {
    console.error('Seed error:', e)
    return NextResponse.json({ message: e.message, stack: e.stack?.substring(0, 500) }, { status: 500 })
  }
}

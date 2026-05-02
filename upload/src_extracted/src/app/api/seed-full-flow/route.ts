import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createBlock } from '@/lib/hash-chain'

export async function POST(req: Request) {
  try {
    const { moduleId } = await req.json()
    if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

    let mod = await db.module.findUnique({ where: { id: moduleId } })
    if (!mod) {
      const slug = moduleId
      const moduleNames: Record<string, string> = {
        'metrang-coffee': 'Terra Brew', 'terra-nexus': 'Terra Nexus',
        'terra-spices': 'Terra Spices', 'terra-bean': 'Terra Bean',
        'terra-blue': 'Terra Blue', 'terra-veggies': 'Terra Veggies',
        'terra-graze': 'Terra Graze', 'terra-orchard': 'Terra Orchard',
        'terra-flora': 'Terra Flora', 'terra-forest': 'Terra Forest',
        'terra-silvi': 'Terra Silvi', 'terra-mangrove': 'Terra Mangrove',
      }
      const name = moduleNames[slug] || slug
      mod = await db.module.create({
        data: { id: moduleId, name, slug, description: `${name} Module`, icon: name, color: '#059669', isActive: true }
      })
    }

    // Clean existing seed data for a fresh flow (optional — keeps module & users)
    // We'll use upsert/check patterns to avoid duplicates

    // =============================================
    // 1. CREATE ADMIN USER
    // =============================================
    const adminEmail = `admin@${mod.slug}.test`
    let adminUser = await db.user.findUnique({ where: { email_moduleId: { email: adminEmail, moduleId } } })
    if (!adminUser) {
      adminUser = await db.user.create({ data: { email: adminEmail, password: 'admin123', name: 'Admin User', role: 'admin', moduleId } })
    }

    // =============================================
    // 2. FARMER REGISTRATION (S1)
    // =============================================
    const FARMER_1 = {
      fullName: 'Nguyen Van Thanh',
      lastName: 'Nguyen',
      contactNumber: '0912345678',
      gender: 'Male',
      dob: new Date('1985-03-15'),
      education: 'Secondary',
      province: 'Dak Lak',
      district: 'Cu Mgar',
      commune: 'Ea Tam',
      country: 'Vietnam',
      village: "Bon K'Mang",
      zipCode: '630000',
      latitude: 12.6680,
      longitude: 108.0380,
      isCertified: true,
      certificationType: 'Individual',
      yearOfICS: '2022',
      cooperative: 'Ea Tam Coffee Cooperative',
      enrollmentPlace: 'At Farmer Place',
      maritalStatus: 'Married',
      spouseName: 'Tran Thi Mai',
      noOfFamilyMembers: 4,
      childrenBelow18Male: 1,
      schoolGoingMale: 1,
      schoolGoingFemale: 0,
      housingOwnership: 'Owned',
      houseType: 'Brick house',
      loanTaken: false,
      nationalIdType: 'National ID',
      nationalIdNo: '795284610382',
      lifeInsurance: true,
      lifeInsProvider: 'Bao Viet',
      creditScore: 82,
    }

    let farmer1 = await db.farmer.findFirst({ where: { moduleId, contactNumber: FARMER_1.contactNumber } })
    if (!farmer1) {
      const farmerCode = `FRM-${Date.now().toString(36).toUpperCase()}-NX01`
      farmer1 = await db.farmer.create({
        data: { ...FARMER_1, moduleId, createdBy: adminUser.id, farmerCode },
      })
    }

    // =============================================
    // 3. FARM LAND (S2)
    // =============================================
    let farmLand = await db.farmLand.findFirst({ where: { moduleId, farmerId: farmer1.id } })
    if (!farmLand) {
      farmLand = await db.farmLand.create({
        data: {
          moduleId,
          farmerId: farmer1.id,
          createdBy: adminUser.id,
          farmName: "Thanh's Highland Coffee Farm",
          plotBlockId: 'EA-TAM-001',
          totalLandHolding: 2.5,
          altitude: 850,
          agroEcologicalZone: 'Central Highlands',
          latitude: 12.6680,
          longitude: 108.0380,
          farmBoundaryPlot: 'POLYGON((108.037 12.667, 108.039 12.667, 108.039 12.669, 108.037 12.669, 108.037 12.667))',
          eudrGeojson: '{"type":"Polygon","coordinates":[[[108.037,12.667],[108.039,12.667],[108.039,12.669],[108.037,12.669],[108.037,12.667]]]}',
          landOwnership: 'Owned',
          redBookLandTitle: 'SR-2024-00123',
          landSurveyNo: 'LS-085-2024',
          landTopology: 'Sloping',
          landGradient: '10-15%',
          waterSource: 'Bore Well',
          powerSource: 'Electricity',
          soilType: 'Ferralitic',
          fertilityStatus: 'Good',
          irrigationSource: 'Irrigated',
          irrigationType: 'Drip',
          noOfTrees: 1200,
          shadeTreeSpecies: 'Congo Peanut (Congo)',
          shadeTreeDensity: 200,
          shadeTreeCover: 35,
          fullTimeWorkers: 2,
          seasonalWorkers: 5,
          childLabourPolicy: true,
          minimumWageCompliance: true,
          bufferZoneDistanceToWater: 50,
        },
      })
    }

    // =============================================
    // 4. CULTIVATION (S2a)
    // =============================================
    let cultivation = await db.cultivation.findFirst({ where: { moduleId, farmerId: farmer1.id } })
    if (!cultivation) {
      cultivation = await db.cultivation.create({
        data: {
          moduleId,
          farmerId: farmer1.id,
          farmLandId: farmLand.id,
          createdBy: adminUser.id,
          farmPlotName: 'Robusta Main Plot A',
          plotBlockId: 'EA-TAM-001-A',
          cropCategory: 'Coffee',
          harvestSeason: '2024-2025 Main Crop',
          cultivatedCrop: 'Robusta Coffee',
          cropVariety: 'Chari (VN)',
          coffeeSpecies: 'Coffea canephora',
          cultivationArea: 2.0,
          plantingSpacing: 3.0,
          treeDensity: 1333,
          sowingDate: new Date('2018-06-15'),
          seedSource: 'Dak Lak Seed Center',
          isSeedTreated: true,
          treatmentDetails: 'Fungicide seed treatment',
          seedType: 'Certified 1',
          seedQuantity: 2.5,
          seedPrice: 120000,
          intendedProcessingMethod: 'Washed',
          irrigationMethod: 'Drip Irrigation',
          shadeCover: 35,
          latitude: 12.6680,
          longitude: 108.0380,
        },
      })
    }

    // =============================================
    // 5. BATCH ID — the golden thread for traceability
    // =============================================
    const BATCH_ID = `BATCH-${Date.now().toString(36).toUpperCase()}-DK-2025`
    const HARVEST_DATE = new Date('2025-01-15')

    // =============================================
    // 6. NURSERY (S3)
    // =============================================
    const existingNursery = await db.nursery.findFirst({ where: { moduleId, cultivationId: cultivation.id } })
    if (!existingNursery) {
      await db.nursery.create({
        data: {
          moduleId,
          cultivationId: cultivation.id,
          farmerId: farmer1.id,
          farmLandId: farmLand.id,
          nurseryId: `NUR-${Date.now().toString(36).toUpperCase()}-001`,
          nurseryCapacity: 5000,
          coffeeVariety: 'Chari (VN)',
          coffeeSpecies: 'Coffea canephora',
          rootstockType: 'Own-rooted',
          shadingConditions: 60,
          sowingDate: new Date('2018-03-01'),
          germinationRate: 85,
          seedlingHealth: 'Good',
          transplantDate: new Date('2018-06-15'),
          nurseryGpsLat: 12.6675,
          nurseryGpsLng: 108.0375,
          shadingMethod: 'Shade net (50%)',
          nurseryLossCount: 150,
          survivalRate: 97,
          wateringSchedule: 'Twice daily (morning & evening)',
        },
      })
    }

    // =============================================
    // 7. LAND PREPARATION (S4)
    // =============================================
    const existingLandPrep = await db.landPreparation.findFirst({ where: { moduleId, cultivationId: cultivation.id } })
    if (!existingLandPrep) {
      await db.landPreparation.create({
        data: {
          moduleId,
          cultivationId: cultivation.id,
          farmerId: farmer1.id,
          farmLandId: farmLand.id,
          eventDate: new Date('2018-05-20'),
          plotBlockId: 'EA-TAM-001-A',
          activity: 'Plowing + Pitting',
          implementsUsed: 'Hand tractor + manual digging',
          compostApplied: true,
          compostType: 'Vermicompost',
          compostQuantity: 5000,
          labourCost: 2500000,
          plantingDate: new Date('2018-06-15'),
          plantingMethod: 'Hole Planting',
          seedlingAge: 4,
          plantsPerHa: 1333,
          spacing: '3m x 2.5m',
          shadeTreePlanted: true,
          shadeTreeSpecies: 'Congo Peanut (Congo)',
          shadeTreesPerHa: 200,
          soilTypeAtPlanting: 'Ferralitic loam',
        },
      })
    }

    // =============================================
    // 8. CROP MONITORING (S5) — 3 visits
    // =============================================
    const monitoringVisits = [
      { visitDate: new Date('2024-06-15T08:00:00Z'), coffeeTreeAge: 6, growthStage: 'Flowering', plantHeight: 2.8, canopyCover: 75, ndviIndex: 0.72, observationGpsLat: 12.6681, observationGpsLng: 108.0381, weatherConditions: 'Sunny, 28°C', pestInfestation: false, diseaseSymptoms: false },
      { visitDate: new Date('2024-09-15T08:00:00Z'), coffeeTreeAge: 6, growthStage: 'Berry Development', plantHeight: 3.0, canopyCover: 80, ndviIndex: 0.78, soilMoisture: 'Adequate', observationGpsLat: 12.6682, observationGpsLng: 108.0382, weatherConditions: 'Cloudy, 25°C', pestInfestation: true, pestType: 'Coffee Berry Borer (CBB)', recommendation: 'Set pheromone traps' },
      { visitDate: new Date('2024-12-15T08:00:00Z'), coffeeTreeAge: 6, growthStage: 'Ripening', plantHeight: 3.0, canopyCover: 80, ndviIndex: 0.75, observationGpsLat: 12.6680, observationGpsLng: 108.0380, weatherConditions: 'Dry, 22°C', pestInfestation: false, diseaseSymptoms: false, alertTriggered: false },
    ]

    for (const visit of monitoringVisits) {
      const exists = await db.cropMonitoring.findFirst({ where: { moduleId, cultivationId: cultivation.id, visitDate: visit.visitDate } })
      if (!exists) {
        await db.cropMonitoring.create({
          data: {
            moduleId,
            cultivationId: cultivation.id,
            farmerId: farmer1.id,
            farmLandId: farmLand.id,
            ...visit,
          },
        })
      }
    }

    // =============================================
    // 9. FERTILIZER APPLICATIONS (S6) — 3 applications
    // =============================================
    const fertilizerApps = [
      { soilTestDate: new Date('2024-04-01T08:00:00Z'), ph: '5.2', nitrogen: 'Medium', phosphorus: 'Low', potassium: 'Medium', organicMatter: 3.8, applicationDate: new Date('2024-04-15T08:00:00Z'), plotBlockId: 'EA-TAM-001-A', fertilizerType: 'Organic', organicCertFlag: true, product: 'NPK 15-5-20 (Compost+', dosePerHa: '300 kg/ha', appliedQty: '600 kg', costPerUnit: 25000, totalCost: 15000000, applicationMethod: 'Basal dressing', weatherAtApp: 'Overcast, 26°C' },
      { applicationDate: new Date('2024-07-10T08:00:00Z'), plotBlockId: 'EA-TAM-001-A', fertilizerType: 'Organic', organicCertFlag: true, product: 'Vermicompost (humus)', dosePerHa: '5 tons/ha', appliedQty: '10 tons', costPerUnit: 2000000, totalCost: 20000000, labourCost: 3000000, applicationMethod: 'Ring application', weatherAtApp: 'Rain (before rain)' },
      { applicationDate: new Date('2024-10-20T08:00:00Z'), plotBlockId: 'EA-TAM-001-A', fertilizerType: 'Organic', organicCertFlag: true, product: 'Potassium Sulphate (SOP)', dosePerHa: '100 kg/ha', appliedQty: '200 kg', costPerUnit: 35000, totalCost: 7000000, applicationMethod: 'Top dressing', weatherAtApp: 'Sunny, 27°C' },
    ]

    for (const fert of fertilizerApps) {
      const exists = await db.fertilizerApplication.findFirst({ where: { moduleId, cultivationId: cultivation.id, applicationDate: fert.applicationDate } })
      if (!exists) {
        await db.fertilizerApplication.create({
          data: {
            moduleId,
            cultivationId: cultivation.id,
            farmerId: farmer1.id,
            farmLandId: farmLand.id,
            ...fert,
          },
        })
      }
    }

    // =============================================
    // 10. PEST & DISEASE MANAGEMENT (S7)
    // =============================================
    const existingPest = await db.pestDiseaseManagement.findFirst({ where: { moduleId, cultivationId: cultivation.id } })
    if (!existingPest) {
      await db.pestDiseaseManagement.create({
        data: {
          moduleId,
          cultivationId: cultivation.id,
          farmerId: farmer1.id,
          farmLandId: farmLand.id,
          scoutingDate: new Date('2024-09-20'),
          plotBlockId: 'EA-TAM-001-A',
          pestIdentified: true,
          pestType: 'Coffee Berry Borer (Hypothenemus hampei)',
          pestDensity: 'Low (<5% berries affected)',
          diseaseIdentified: false,
          severityLevel: 'Low',
          weatherConditions: 'Humid, 24°C',
          treatmentDate: new Date('2024-09-25'),
          treatmentType: 'Biological',
          product: 'Beauveria bassiana (Bio-Care)',
          dose: '5g/L water',
          phiDays: 0,
          reiHours: 4,
          windSpeed: 'Low (<5 km/h)',
          bufferZoneRespected: true,
          equipmentUsed: 'Knapsack sprayer',
          laborCost: 500000,
          totalCost: 1500000,
        },
      })
    }

    // =============================================
    // 11. HARVEST TRACEABILITY (S8) — with batchId
    // =============================================
    let harvest = await db.harvestTraceability.findFirst({ where: { moduleId, cultivationId: cultivation.id, batchId: BATCH_ID } })
    if (!harvest) {
      harvest = await db.harvestTraceability.create({
        data: {
          moduleId,
          cultivationId: cultivation.id,
          farmerId: farmer1.id,
          farmLandId: farmLand.id,
          plannedHarvestDate: new Date('2025-01-10'),
          plotBlockId: 'EA-TAM-001-A',
          coffeeVariety: 'Chari (VN) Robusta',
          estimatedYield: '2500 kg cherry',
          actualHarvestDate: HARVEST_DATE,
          harvestMethod: 'Selective Picking',
          harvestEquipment: 'Hand picking + collection baskets',
          fieldMoisture: '65%',
          cherryRipeness: 92,
          harvestLabourCost: 7500000,
          sampleWeight: 5,
          sampleArea: 0.01,
          sampleYield: 2.5,
          estimatedYieldPerHa: 2500,
          processingMethod: 'Washed',
          dryingMethod: 'Raised beds (sun-dried)',
          dryingDurationDays: 14,
          targetMoisture: 12,
          moistureContent: 11.5,
          defectiveBeans: 2.3,
          foreignMatter: 0.1,
          cupScore: 82,
          batchId: BATCH_ID,
          coffeeVarietyAtBatch: 'Chari (VN) Robusta',
          processingStage: 'Harvested',
          batchTimestamp: HARVEST_DATE,
          location: 'Ea Tam, Cu Mgar, Dak Lak',
          actor: farmer1.fullName,
          batchNotes: 'Main crop harvest 2024-2025. Excellent quality cherries.',
          batchPhotos: '',
        },
      })

      // Create hash chain block for harvest
      createBlock(BATCH_ID, 'Harvest', { farmer: farmer1.fullName, farm: farmLand.farmName, weight: 2500, date: HARVEST_DATE })
    }

    // =============================================
    // 12. INSPECTION & CERTIFICATION (S12)
    // =============================================
    const existingInspection = await db.coffeeInspection.findFirst({ where: { moduleId, farmerId: farmer1.id } })
    if (!existingInspection) {
      await db.coffeeInspection.create({
        data: {
          moduleId,
          farmerId: farmer1.id,
          cultivationId: cultivation.id,
          inspectionId: `INS-${Date.now().toString(36).toUpperCase()}-001`,
          certificationType: 'Organic (EU & NOP)',
          certifyingBody: 'Control Union Certifications',
          certificateNo: `CU-ORG-VN-${Date.now().toString(36).toUpperCase()}`,
          certStatus: 'Approved',
          complianceStatus: 'Compliant',
          auditDate: new Date('2024-11-10'),
          certIssueDate: new Date('2024-12-01'),
          certExpiryDate: new Date('2025-11-30'),
          auditorName: 'Nguyen Thi Bich Loan',
          inspectorOrganisation: 'Control Union Vietnam',
          inspectionType: 'Annual Surveillance Audit',
          inspectionScope: 'Farm + Processing',
          inspectionDate: new Date('2024-11-10'),
          inspectionGpsLat: 12.6680,
          inspectionGpsLng: 108.0380,
          inspectionStatus: 'Closed',
          observations: 'Farm complies with organic standards. Good buffer zones. Proper record keeping. No prohibited substances detected.',
          nonConformanceIdentified: false,
          photos: '',
        },
      })
    }

    // =============================================
    // 13. CERT ASSESSMENT (S11)
    // =============================================
    const existingAssessment = await db.certAssessment.findFirst({ where: { moduleId, farmerId: farmer1.id } })
    if (!existingAssessment) {
      await db.certAssessment.create({
        data: {
          moduleId,
          farmerId: farmer1.id,
          cultivationId: cultivation.id,
          farmLandId: farmLand.id,
          assessmentId: `CA-${Date.now().toString(36).toUpperCase()}-001`,
          certificationStandard: 'Organic (EU Regulation 2018/848)',
          assessmentDate: new Date('2024-11-10'),
          assessorName: 'Nguyen Thi Bich Loan',
          gpsAtAssessmentLat: 12.6680,
          gpsAtAssessmentLng: 108.0380,
          cat1FarmManagement: JSON.stringify([{ q: 'Farm management plan exists', score: 9, max: 10 }, { q: 'Record keeping system', score: 8, max: 10 }]),
          cat2EnvironmentalProtection: JSON.stringify([{ q: 'Buffer zones maintained', score: 10, max: 10 }, { q: 'Water body protection', score: 9, max: 10 }]),
          cat3SoilManagement: JSON.stringify([{ q: 'Soil erosion control', score: 8, max: 10 }, { q: 'Organic matter maintenance', score: 9, max: 10 }]),
          cat4PestDisease: JSON.stringify([{ q: 'IPM plan implemented', score: 8, max: 10 }, { q: 'Prohibited substance check', score: 10, max: 10 }]),
          cat5FertilizerUse: JSON.stringify([{ q: 'Only permitted fertilizers', score: 10, max: 10 }, { q: 'Fertilizer application records', score: 9, max: 10 }]),
          cat6HarvestPostHarvest: JSON.stringify([{ q: 'Harvest contamination prevention', score: 9, max: 10 }, { q: 'Post-harvest handling', score: 8, max: 10 }]),
          cat7WorkerWelfare: JSON.stringify([{ q: 'Worker health & safety', score: 8, max: 10 }, { q: 'Child labor policy', score: 10, max: 10 }]),
          cat8CommunityRelations: JSON.stringify([{ q: 'Community engagement', score: 7, max: 10 }]),
          cat9Training: JSON.stringify([{ q: 'Farmer training records', score: 8, max: 10 }]),
          cat10UsdaOrganic: JSON.stringify([{ q: 'USDA NOP compliance', score: 8, max: 10 }]),
          cat11ClimateCarbon: JSON.stringify([{ q: 'Carbon footprint assessment', score: 7, max: 10 }]),
          certificationOutcome: 'Recommended for Certification',
          totalScorePercentage: 86.5,
          scoreBreakdown: 'Total: 173/200 (86.5%). Strong performance in environmental protection and prohibited substance compliance. Improvement needed in community engagement and carbon assessment.',
        },
      })
    }

    // =============================================
    // 14. COLLECTION CENTRE (S13)
    // =============================================
    const CC_ID = `CC-${Date.now().toString(36).toUpperCase()}-001`
    let collectionCentre = await db.collectionCentre.findFirst({ where: { moduleId, centreId: CC_ID } })
    if (!collectionCentre) {
      collectionCentre = await db.collectionCentre.create({
        data: {
          moduleId,
          centreId: CC_ID,
          centreName: 'Ea Tam Primary Collection Centre',
          centreGpsLat: 12.6720,
          centreGpsLng: 108.0420,
          province: 'Dak Lak',
          district: 'Cu Mgar',
          commune: 'Ea Tam',
          managerName: 'Pham Van Duc',
          contactNumber: '0901234567',
          storageCapacityKg: 20000,
          scaleType: 'Electronic (0.1kg precision)',
          scaleLastCalibrationDate: new Date('2024-10-01'),
        },
      })
    }

    // =============================================
    // 15. PROCUREMENT RECORD (S13) — linked to batchId
    // =============================================
    let procurement = await db.procurementRecord.findFirst({ where: { moduleId, batchId: BATCH_ID } })
    if (!procurement) {
      procurement = await db.procurementRecord.create({
        data: {
          moduleId,
          procurementId: `PROC-${Date.now().toString(36).toUpperCase()}-001`,
          collectionCentreId: collectionCentre.id,
          cultivationId: cultivation.id,
          farmerId: farmer1.id,
          farmLandId: farmLand.id,
          batchId: BATCH_ID,
          procurementDate: new Date('2025-01-16'),
          coffeeType: 'Cherry',
          coffeeVariety: 'Chari (VN) Robusta',
          grossWeight: 2580,
          tareWeight: 30,
          netWeight: 2550,
          moistureContentAtGate: 65.2,
          moistureDeduction: 0,
          adjustedNetWeight: 2550,
          cherryRipenessGrade: 'A (90%+ red)',
          defects: 1.8,
          purchasePricePerKg: 8500,
          totalPurchaseAmount: 21675000,
          priceBasis: 'Fresh cherry weight',
          certPremiumApplied: 2000,
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'Completed',
          paymentDate: new Date('2025-01-18'),
          receiptVoucherNo: `RCP-${Date.now().toString(36).toUpperCase()}`,
          notes: 'Organic certified cherries. Premium applied.',
        },
      })

      createBlock(BATCH_ID, 'Procurement', { centre: collectionCentre.centreName, weight: 2550, price: 8500, date: '2025-01-16' })
    }

    // =============================================
    // 16. PROCUREMENT TRANSPORT (S13)
    // =============================================
    const existingTransport = await db.procurementTransport.findFirst({ where: { moduleId, procurementRecordId: procurement.id } })
    if (!existingTransport) {
      await db.procurementTransport.create({
        data: {
          moduleId,
          procurementRecordId: procurement.id,
          transportId: `TRN-${Date.now().toString(36).toUpperCase()}-001`,
          departureDateTime: new Date('2025-01-16T08:00:00'),
          arrivalDateTime: new Date('2025-01-16T11:30:00'),
          vehiclePlateNo: '47C-12345',
          driverName: 'Vo Van An',
          transportRoute: 'Ea Tam → Cu Mgar Town → Buon Ma Thuot',
          transportCost: 3500000,
          temperatureDuringTransport: 28,
          receivedAtPlantKg: 2545,
          weightVariance: -5,
        },
      })

      createBlock(BATCH_ID, 'Transport', { vehicle: '47C-12345', route: 'Ea Tam → BMT', receivedKg: 2545 })
    }

    // =============================================
    // 17. PROCESSING STAGES (S14) — all 11 + QC
    // =============================================
    const stageDate = (days: number) => {
      const d = new Date('2025-01-17')
      d.setDate(d.getDate() + days)
      return d
    }

    const stages = [
      {
        stageType: 'CLEANING_WASHING',
        stageData: JSON.stringify({
          cleaningDate: stageDate(0).toISOString(),
          equipmentUsed: 'Rotary sieve cleaner + washing channel',
          contaminantsRemoved: 'Twigs, stones, leaves, floaters',
          floatTestResult: '3.2% floaters removed',
          weightAfterCleaning: 2460,
          washingPasses: 3,
          totalWaterUsed: 5700,
          waterPhAfterWash: 6.8,
          effluentDisposalMethod: 'Settling tanks + biofilter',
          weightAfterWashing: 2400,
        }),
        notes: 'Combined cleaning and washing stage.',
      },
      {
        stageType: 'DEPULPING_FERMENTATION',
        stageData: JSON.stringify({
          depulpingDate: stageDate(1).toISOString(),
          depulperMachineId: 'DP-001 (Pinhalense)',
          pulpDischargeMethod: 'Dry pulp discharge',
          weightAfterDepulping: 1890,
          fermentationStart: stageDate(1).toISOString(),
          fermentationEnd: stageDate(2).toISOString(),
          fermentationDuration: 18,
          fermentationType: 'Underwater (submerged)',
          tankId: 'FV-TANK-001',
          waterVolumeUsed: 3800,
          mucilageRemovalConfirmed: true,
        }),
        notes: 'Combined depulping and underwater fermentation.',
      },
      {
        stageType: 'DRYING_HULLING',
        stageData: JSON.stringify({
          dryingStartDate: stageDate(3).toISOString(),
          dryingMethod: 'Raised beds (African beds)',
          dryingTemperature: 30,
          turningFrequency: 'Every 2 hours',
          dryingDuration: 12,
          targetMoisture: 12,
          finalMoisture: 11.8,
          dryingEndDate: stageDate(15).toISOString(),
          hullingDate: stageDate(18).toISOString(),
          hullerMachineId: 'HULL-002 (Pinhalense)',
          weightAfterHulling: 1180,
          hullingLoss: 80,
        }),
        notes: 'Combined sun-drying and hulling stage.',
      },
      {
        stageType: 'GRADING_SORTING',
        stageData: JSON.stringify({
          gradingDate: stageDate(20).toISOString(),
          screenSizeUsed: 'Screen 16 (16/64")',
          gradeAchieved: 'Grade 1 (Specialty)',
          defectCountPer300g: 3,
          colorSortingUsed: true,
          densitySortingUsed: true,
          weightAfterGrading: 1150,
          rejectsOffGrade: 30,
          overallOutturn: 45.1,
        }),
        notes: 'Grading and sorting with color/density sorters.',
      },
      {
        stageType: 'ROASTING_BLENDING',
        stageData: JSON.stringify({
          blendingDate: stageDate(22).toISOString(),
          blendRecipeId: 'BLD-ROB-001',
          componentBatch1Id: BATCH_ID,
          component1Ratio: 70,
          component2Ratio: 30,
          blendOutputWeight: 1800,
          roastingDate: stageDate(25).toISOString(),
          roasterMachineId: 'PROBAT-001 (Probat UG22)',
          roastLevel: 'Medium',
          chargeTemp: 200,
          firstCrackTime: 8.5,
          dropTemp: 218,
          totalRoastDuration: 12,
          roastLoss: 14.2,
          outputWeightAfterRoast: 1030,
        }),
        notes: 'Blending followed by medium roast profile.',
      },
      {
        stageType: 'GRINDING_PACKAGING',
        stageData: JSON.stringify({
          grindingDate: stageDate(28).toISOString(),
          grinderMachineId: 'DITTING-001 (Ditting KR804)',
          grindSizeSetting: 'Medium-coarse (filter grind)',
          outputWeightAfterGrinding: 1025,
          co2DegassingTime: 72,
          packagingDate: stageDate(31).toISOString(),
          finalProductType: 'Roasted & Ground Coffee',
          packagingMaterial: 'Tri-layer foil (PET/AL/PE)',
          packSize: 250,
          unitsPacked: 4000,
          totalPackagedWeight: 1000,
          nitrogenFlushApplied: true,
          bestBeforeDate: stageDate(365).toISOString(),
          finalBatchId: BATCH_ID,
        }),
        notes: 'Grinding and nitrogen-flushed packaging.',
      },
      {
        stageType: 'QUALITY_CONTROL',
        stageData: JSON.stringify({
          inputWeight: 2550,
          finalOutputWeight: 1000,
          overallOutturn: 39.2,
          totalProcessingCost: 45000000,
          costPerKg: 45000,
          finalMoisture: 11.8,
          cupScore: 82,
          cuppingNotes: 'Clean cup, medium body, notes of chocolate and nuts, balanced acidity, sweet finish.',
          qcApprovedBy: 'Tran Van Quang (QC Manager)',
          qcApprovalDate: stageDate(32).toISOString(),
        }),
        notes: 'Full QC passed. Batch approved for marketplace.',
      },
    ]

    for (const stage of stages) {
      const exists = await db.processingStageRecord.findFirst({ where: { moduleId, batchId: BATCH_ID, stageType: stage.stageType } })
      if (!exists) {
        const record = await db.processingStageRecord.create({
          data: {
            moduleId,
            batchId: BATCH_ID,
            stageType: stage.stageType,
            stageData: stage.stageData,
            notes: stage.notes,
            recordedBy: 'System Seed',
          },
        })
        // Add hash chain block for each processing stage
        createBlock(BATCH_ID, stage.stageType, JSON.parse(stage.stageData))
      }
    }

    // =============================================
    // 18. SMART CONTRACT (S9)
    // =============================================
    const existingContract = await db.smartContract.findFirst({ where: { moduleId, batchId: BATCH_ID } })
    if (!existingContract) {
      await db.smartContract.create({
        data: {
          moduleId,
          cultivationId: cultivation.id,
          contractId: `SC-${Date.now().toString(36).toUpperCase()}-001`,
          buyer: 'Terra Brew Roastery (Vietnam)',
          farmerId: farmer1.id,
          batchId: BATCH_ID,
          quantity: 1000,
          pricePerKg: 120000,
          paymentTerms: 'Net 30 after delivery',
          paymentTriggerCondition: 'On QC approval + delivery confirmation',
          contractDate: new Date('2025-01-05'),
          status: 'Fulfilled',
        },
      })
    }

    // =============================================
    // 19. MARKETPLACE LISTING (S10)
    // =============================================
    const existingListing = await db.marketplaceListing.findFirst({ where: { moduleId, batchId: BATCH_ID } })
    if (!existingListing) {
      await db.marketplaceListing.create({
        data: {
          moduleId,
          listingId: `LST-${Date.now().toString(36).toUpperCase()}-001`,
          batchId: BATCH_ID,
          coffeeVariety: 'Chari (VN) Robusta',
          processingMethod: 'Washed + Medium Roast',
          cupScore: 82,
          certificationLabels: 'Organic (EU), Fair Trade',
          listingDate: new Date('2025-02-20'),
          availableQty: 800,
          pricePerKg: 185000,
          priceValidUntil: new Date('2025-06-30'),
          buyerRequests: '3 inquiries received. 1 sample request from Japan.',
        },
      })

      createBlock(BATCH_ID, 'Marketplace', { price: 185000, qty: 800, listed: '2025-02-20' })
    }

    // =============================================
    // 20. PROCESSING JOB ORDER
    // =============================================
    const existingJobOrder = await db.processingJobOrder.findFirst({ where: { moduleId, batchIdInput: BATCH_ID } })
    if (!existingJobOrder) {
      await db.processingJobOrder.create({
        data: {
          moduleId,
          jobOrderId: `PJO-${Date.now().toString(36).toUpperCase()}-001`,
          processingDate: new Date('2025-01-17'),
          batchIdInput: BATCH_ID,
          coffeeTypeInput: 'Cherry',
          coffeeVarietyInput: 'Chari (VN) Robusta',
          inputQuantityKg: 2550,
          processingMethod: 'Full Washed → Medium Roast → Ground',
          targetOutputProduct: 'Roasted & Ground Coffee (250g retail)',
          operatorName: 'Le Van Hoang',
          plantFacilityName: 'Central Highlands Processing Plant',
          inputWeightKg: 2550,
          finalOutputWeightKg: 1000,
          overallOutturn: 39.2,
          totalProcessingCost: 45000000,
          costPerKg: 45000,
          finalMoistureContent: 11.8,
          cupScore: 82,
          cuppingNotes: 'Clean cup, chocolate & nuts, balanced acidity, sweet finish.',
          qcApprovedBy: 'Tran Van Quang',
          qcApprovalDate: new Date('2025-02-18'),
        },
      })
    }

    // =============================================
    // DONE!
    // =============================================
    return NextResponse.json({
      success: true,
      message: 'Full traceability pipeline seeded!',
      batchId: BATCH_ID,
      pipeline: {
        farmer: farmer1.fullName,
        farmerCode: farmer1.farmerCode,
        farm: farmLand.farmName,
        cultivation: cultivation.farmPlotName,
        crop: cultivation.cultivatedCrop,
        variety: cultivation.cropVariety,
        batchId: BATCH_ID,
        harvestDate: '2025-01-15',
        harvestWeight: '2,550 kg cherry',
        processingStages: 7,
        finalProduct: 'Roasted & Ground Coffee (250g retail packs)',
        finalOutput: '1,000 kg',
        cupScore: 82,
        certification: 'Organic (EU & NOP)',
        marketplacePrice: '185,000 VND/kg',
      },
      loginHint: `Email: ${adminEmail}, Password: admin123`,
      traceTip: `Use Batch ID "${BATCH_ID}" in Track & Trace to see the full journey.`,
    })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}

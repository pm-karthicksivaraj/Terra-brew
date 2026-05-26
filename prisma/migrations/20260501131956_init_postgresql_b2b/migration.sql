-- CreateTable
CREATE TABLE "PlatformUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'super_admin',
    "roleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "logoUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "currencySymbol" TEXT NOT NULL DEFAULT '₫',
    "language" TEXT NOT NULL DEFAULT 'vi',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "locale" TEXT NOT NULL DEFAULT 'vi-VN',
    "countryCode" TEXT NOT NULL DEFAULT 'VN',
    "region" TEXT,
    "supportedLanguages" TEXT NOT NULL DEFAULT '["vi","en"]',
    "dateFormatShort" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "dateFormatLong" TEXT NOT NULL DEFAULT 'DD MMMM YYYY',
    "numberFormat" TEXT NOT NULL DEFAULT 'vi-VN',
    "measurementUnit" TEXT NOT NULL DEFAULT 'metric',
    "enabledModules" TEXT NOT NULL DEFAULT '{}',
    "country" TEXT NOT NULL DEFAULT 'VN',
    "eudrCompliant" BOOLEAN NOT NULL DEFAULT false,
    "eudrRegistrationDate" TIMESTAMP(3),
    "eudrOperatorId" TEXT,
    "businessType" TEXT NOT NULL DEFAULT 'exporter',
    "certifications" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "maxFarmers" INTEGER NOT NULL DEFAULT 500,
    "stripeCustomerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "maxFarmers" INTEGER NOT NULL DEFAULT 500,
    "maxFarmLands" INTEGER NOT NULL DEFAULT 1000,
    "storageLimitMb" INTEGER NOT NULL DEFAULT 500,
    "apiCallsLimit" INTEGER NOT NULL DEFAULT 10000,
    "features" TEXT NOT NULL DEFAULT '{}',
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "billingCycle" TEXT,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "lastPaymentDate" TIMESTAMP(3),
    "nextPaymentDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeStatus" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '{}',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "category" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'farmer',
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrollmentPlace" TEXT,
    "farmerCode" TEXT,
    "isCertified" BOOLEAN NOT NULL DEFAULT false,
    "certificationType" TEXT,
    "yearOfICS" TEXT,
    "cooperative" TEXT,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "contactNumber" TEXT NOT NULL,
    "farmerPhoto" TEXT,
    "nationalIdType" TEXT,
    "nationalIdNo" TEXT,
    "idProofPhoto" TEXT,
    "ekycConsent" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "age" INTEGER,
    "education" TEXT,
    "maritalStatus" TEXT,
    "spouseName" TEXT,
    "noOfFamilyMembers" INTEGER,
    "housingOwnership" TEXT,
    "houseType" TEXT,
    "yearsOfFarmingExperience" INTEGER,
    "email" TEXT,
    "country" TEXT,
    "province" TEXT,
    "district" TEXT,
    "commune" TEXT,
    "village" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "creditScore" DOUBLE PRECISION,
    "loanTaken" BOOLEAN NOT NULL DEFAULT false,
    "loanTakenFrom" TEXT,
    "loanAmount" DOUBLE PRECISION,
    "loanPurpose" TEXT,
    "loanInterest" DOUBLE PRECISION,
    "loanSecurity" BOOLEAN NOT NULL DEFAULT false,
    "cropInsurance" BOOLEAN NOT NULL DEFAULT false,
    "lifeInsurance" BOOLEAN NOT NULL DEFAULT false,
    "healthInsurance" BOOLEAN NOT NULL DEFAULT false,
    "smartphoneOwnership" BOOLEAN NOT NULL DEFAULT false,
    "gapTrainingAttended" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmLand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "createdBy" TEXT,
    "farmName" TEXT NOT NULL,
    "plotBlockId" TEXT,
    "totalLandHolding" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "agroEcologicalZone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "landOwnership" TEXT,
    "soilType" TEXT,
    "irrigationSource" TEXT,
    "irrigationType" TEXT,
    "waterSource" TEXT,
    "powerSource" TEXT,
    "noOfTrees" INTEGER,
    "shadeTreeSpecies" TEXT,
    "shadeTreeDensity" INTEGER,
    "fullTimeWorkers" INTEGER,
    "partTimeWorkers" INTEGER,
    "seasonalWorkers" INTEGER,
    "familyWorkers" INTEGER,
    "estYield" DOUBLE PRECISION,
    "conversionCertType" TEXT,
    "currentConversionStatus" TEXT,
    "fertilityStatus" TEXT,
    "childLabourPolicy" BOOLEAN NOT NULL DEFAULT false,
    "minimumWageCompliance" BOOLEAN NOT NULL DEFAULT false,
    "ppeAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "polygonGeoJson" TEXT,
    "boundaryArea" DOUBLE PRECISION,
    "geoCenterLat" DOUBLE PRECISION,
    "geoCenterLng" DOUBLE PRECISION,

    CONSTRAINT "FarmLand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cultivation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "createdBy" TEXT,
    "farmPlotName" TEXT NOT NULL,
    "plotBlockId" TEXT,
    "cropCategory" TEXT,
    "intercroppingSpecies" TEXT,
    "harvestSeason" TEXT,
    "cultivatedCrop" TEXT,
    "cropVariety" TEXT,
    "coffeeSpecies" TEXT,
    "cultivationArea" DOUBLE PRECISION,
    "plantingSpacing" DOUBLE PRECISION,
    "treeDensity" INTEGER,
    "sowingDate" TIMESTAMP(3),
    "estYield" TEXT,
    "intendedProcessingMethod" TEXT,
    "irrigationMethod" TEXT,
    "shadeCover" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "seedSource" TEXT,
    "isSeedTreated" BOOLEAN NOT NULL DEFAULT false,
    "treatmentDetails" TEXT,
    "seedType" TEXT,
    "seedQuantity" DOUBLE PRECISION,
    "seedPrice" DOUBLE PRECISION,
    "seedCost" DOUBLE PRECISION,
    "intercroppingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "intercroppingPartner" TEXT,
    "intercroppingRatio" TEXT,
    "intercroppingScheme" TEXT,
    "isPrimaryCrop" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cultivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nursery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT,
    "createdBy" TEXT,
    "nurseryName" TEXT NOT NULL,
    "nurseryCode" TEXT,
    "location" TEXT,
    "province" TEXT,
    "district" TEXT,
    "commune" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "nurseryType" TEXT,
    "capacity" INTEGER,
    "currentStock" INTEGER,
    "species" TEXT,
    "variety" TEXT,
    "seedSource" TEXT,
    "plantingDate" TIMESTAMP(3),
    "expectedReadyDate" TIMESTAMP(3),
    "germinationRate" DOUBLE PRECISION,
    "survivalRate" DOUBLE PRECISION,
    "healthStatus" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nursery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandPreparation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "createdBy" TEXT,
    "preparationDate" TIMESTAMP(3),
    "preparationType" TEXT,
    "method" TEXT,
    "equipmentUsed" TEXT,
    "laborCount" INTEGER,
    "laborCost" DOUBLE PRECISION,
    "materialsUsed" TEXT,
    "materialCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "soilPhBefore" DOUBLE PRECISION,
    "soilPhAfter" DOUBLE PRECISION,
    "organicMatterPct" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandPreparation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropMonitoring" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "cultivationId" TEXT,
    "createdBy" TEXT,
    "monitoringDate" TIMESTAMP(3),
    "monitoringType" TEXT,
    "growthStage" TEXT,
    "plantHeight" DOUBLE PRECISION,
    "canopyDiameter" DOUBLE PRECISION,
    "leafColor" TEXT,
    "healthScore" DOUBLE PRECISION,
    "pestPressure" TEXT,
    "diseaseSymptoms" TEXT,
    "weatherCondition" TEXT,
    "temperature" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "soilMoisture" DOUBLE PRECISION,
    "alertTriggered" BOOLEAN NOT NULL DEFAULT false,
    "alertType" TEXT,
    "alertSeverity" TEXT,
    "remedialAction" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerApplication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "cultivationId" TEXT,
    "createdBy" TEXT,
    "applicationDate" TIMESTAMP(3),
    "fertilizerType" TEXT,
    "fertilizerName" TEXT,
    "nutrientContent" TEXT,
    "applicationRate" DOUBLE PRECISION,
    "unit" TEXT,
    "totalQuantity" DOUBLE PRECISION,
    "applicationMethod" TEXT,
    "costPerUnit" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "weatherAtApplication" TEXT,
    "appliedBy" TEXT,
    "isOrganic" BOOLEAN NOT NULL DEFAULT false,
    "certificationNumber" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FertilizerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PestDiseaseManagement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "cultivationId" TEXT,
    "createdBy" TEXT,
    "detectionDate" TIMESTAMP(3),
    "pestOrDisease" TEXT,
    "type" TEXT,
    "severity" TEXT,
    "affectedArea" DOUBLE PRECISION,
    "affectedTrees" INTEGER,
    "symptoms" TEXT,
    "treatmentMethod" TEXT,
    "treatmentProduct" TEXT,
    "dosage" TEXT,
    "applicationDate" TIMESTAMP(3),
    "followUpDate" TIMESTAMP(3),
    "outcome" TEXT,
    "cost" DOUBLE PRECISION,
    "preventionMeasures" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PestDiseaseManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestTraceability" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cultivationId" TEXT,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "createdBy" TEXT,
    "plannedHarvestDate" TIMESTAMP(3),
    "plotBlockId" TEXT,
    "coffeeVariety" TEXT,
    "estimatedYield" TEXT,
    "actualHarvestDate" TIMESTAMP(3),
    "harvestMethod" TEXT,
    "cherryRipeness" DOUBLE PRECISION,
    "harvestLabourCost" DOUBLE PRECISION,
    "sampleWeight" DOUBLE PRECISION,
    "sampleArea" DOUBLE PRECISION,
    "sampleYield" DOUBLE PRECISION,
    "estimatedYieldPerHa" DOUBLE PRECISION,
    "processingMethod" TEXT,
    "dryingMethod" TEXT,
    "dryingDurationDays" INTEGER,
    "targetMoisture" DOUBLE PRECISION,
    "moistureContent" DOUBLE PRECISION,
    "defectiveBeans" DOUBLE PRECISION,
    "foreignMatter" DOUBLE PRECISION,
    "cupScore" DOUBLE PRECISION,
    "batchId" TEXT,
    "coffeeVarietyAtBatch" TEXT,
    "processingStage" TEXT,
    "batchTimestamp" TIMESTAMP(3),
    "location" TEXT,
    "actor" TEXT,
    "batchNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HarvestTraceability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionCentre" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "centreId" TEXT,
    "centreName" TEXT NOT NULL,
    "centreGpsLat" DOUBLE PRECISION,
    "centreGpsLng" DOUBLE PRECISION,
    "province" TEXT,
    "district" TEXT,
    "commune" TEXT,
    "address" TEXT,
    "managerName" TEXT,
    "contactNumber" TEXT,
    "storageCapacityKg" DOUBLE PRECISION,
    "scaleType" TEXT,
    "operatingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionCentre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "collectionCentreId" TEXT,
    "cultivationId" TEXT,
    "farmerId" TEXT NOT NULL,
    "farmLandId" TEXT,
    "createdBy" TEXT,
    "procurementId" TEXT,
    "procurementDate" TIMESTAMP(3),
    "batchId" TEXT,
    "coffeeType" TEXT,
    "coffeeVariety" TEXT,
    "grossWeight" DOUBLE PRECISION,
    "tareWeight" DOUBLE PRECISION,
    "netWeight" DOUBLE PRECISION,
    "moistureContentAtGate" DOUBLE PRECISION,
    "adjustedNetWeight" DOUBLE PRECISION,
    "cherryRipenessGrade" TEXT,
    "defects" DOUBLE PRECISION,
    "purchasePricePerKg" DOUBLE PRECISION,
    "totalPurchaseAmount" DOUBLE PRECISION,
    "priceBasis" TEXT,
    "certPremiumApplied" DOUBLE PRECISION,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT,
    "paymentDate" TIMESTAMP(3),
    "transportId" TEXT,
    "vehicleNumber" TEXT,
    "driverName" TEXT,
    "departureTime" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "destination" TEXT,
    "transportCost" DOUBLE PRECISION,
    "transportNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingJobOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "jobOrderId" TEXT,
    "processingDate" TIMESTAMP(3),
    "batchIdInput" TEXT,
    "coffeeTypeInput" TEXT,
    "coffeeVarietyInput" TEXT,
    "inputQuantityKg" DOUBLE PRECISION,
    "processingMethod" TEXT,
    "targetOutputProduct" TEXT,
    "operatorName" TEXT,
    "plantFacilityName" TEXT,
    "inputWeightKg" DOUBLE PRECISION,
    "finalOutputWeightKg" DOUBLE PRECISION,
    "overallOutturn" DOUBLE PRECISION,
    "totalProcessingCost" DOUBLE PRECISION,
    "costPerKg" DOUBLE PRECISION,
    "finalMoistureContent" DOUBLE PRECISION,
    "cupScore" DOUBLE PRECISION,
    "cuppingNotes" TEXT,
    "qcApprovedBy" TEXT,
    "qcApprovalDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessingJobOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingStageRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jobOrderId" TEXT NOT NULL,
    "stageType" TEXT,
    "stageDate" TIMESTAMP(3),
    "inputWeight" DOUBLE PRECISION,
    "outputWeight" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "machineUsed" TEXT,
    "operatorName" TEXT,
    "qualityCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessingStageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertAssessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT,
    "farmLandId" TEXT,
    "createdBy" TEXT,
    "assessmentId" TEXT,
    "assessmentDate" TIMESTAMP(3),
    "certificationStandard" TEXT,
    "certifyingBody" TEXT,
    "assessmentType" TEXT,
    "scope" TEXT,
    "status" TEXT,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "findings" TEXT,
    "nonConformities" TEXT,
    "correctiveActions" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "certificateNumber" TEXT,
    "certificateDocumentUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeInspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT,
    "farmLandId" TEXT,
    "batchId" TEXT,
    "createdBy" TEXT,
    "inspectionId" TEXT,
    "inspectionDate" TIMESTAMP(3),
    "inspectorName" TEXT,
    "inspectorCertNo" TEXT,
    "inspectionType" TEXT,
    "inspectionStandard" TEXT,
    "sampleSize" DOUBLE PRECISION,
    "moistureContent" DOUBLE PRECISION,
    "defectCount" DOUBLE PRECISION,
    "foreignMatter" DOUBLE PRECISION,
    "screenSize" TEXT,
    "color" TEXT,
    "aroma" TEXT,
    "taste" TEXT,
    "body" TEXT,
    "acidity" TEXT,
    "aftertaste" TEXT,
    "cupScore" DOUBLE PRECISION,
    "overallGrade" TEXT,
    "passFail" TEXT,
    "remarks" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT,
    "buyerId" TEXT,
    "createdBy" TEXT,
    "contractId" TEXT,
    "contractType" TEXT,
    "title" TEXT,
    "description" TEXT,
    "partyA" TEXT,
    "partyB" TEXT,
    "quantityKg" DOUBLE PRECISION,
    "pricePerKg" DOUBLE PRECISION,
    "totalValue" DOUBLE PRECISION,
    "currency" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "deliveryLocation" TEXT,
    "qualityGrade" TEXT,
    "terms" TEXT,
    "status" TEXT,
    "signedByA" BOOLEAN NOT NULL DEFAULT false,
    "signedByB" BOOLEAN NOT NULL DEFAULT false,
    "signedDateA" TIMESTAMP(3),
    "signedDateB" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmerId" TEXT,
    "createdBy" TEXT,
    "listingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coffeeType" TEXT,
    "coffeeVariety" TEXT,
    "grade" TEXT,
    "quantityKg" DOUBLE PRECISION,
    "pricePerKg" DOUBLE PRECISION,
    "totalValue" DOUBLE PRECISION,
    "currency" TEXT,
    "origin" TEXT,
    "processingMethod" TEXT,
    "cupScore" DOUBLE PRECISION,
    "certifications" TEXT,
    "harvestYear" TEXT,
    "availability" TEXT,
    "listingStatus" TEXT,
    "listingDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "buyerId" TEXT,
    "saleDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleTransaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "listingId" TEXT,
    "buyerId" TEXT,
    "sellerId" TEXT,
    "createdBy" TEXT,
    "transactionId" TEXT,
    "quantityKg" DOUBLE PRECISION,
    "pricePerKg" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION,
    "currency" TEXT,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT,
    "paymentDate" TIMESTAMP(3),
    "deliveryStatus" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "deliveryAddress" TEXT,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "lotId" TEXT,
    "batchIds" TEXT,
    "totalWeightKg" DOUBLE PRECISION,
    "coffeeType" TEXT,
    "grade" TEXT,
    "cupScore" DOUBLE PRECISION,
    "processingMethod" TEXT,
    "warehouseLocation" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilAnalysis" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "farmLandId" TEXT NOT NULL,
    "createdBy" TEXT,
    "analysisDate" TIMESTAMP(3),
    "labName" TEXT,
    "phLevel" DOUBLE PRECISION,
    "organicCarbon" DOUBLE PRECISION,
    "nitrogen" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "magnesium" DOUBLE PRECISION,
    "cec" DOUBLE PRECISION,
    "ec" DOUBLE PRECISION,
    "zinc" DOUBLE PRECISION,
    "boron" DOUBLE PRECISION,
    "recommendations" TEXT,
    "reportUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoilAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HashChainBlock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "blockIndex" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "dataHash" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HashChainBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRVerification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "hmacSignature" TEXT NOT NULL,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScannedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EudrCompliance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "referenceNumber" TEXT,
    "lotId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "commodity" TEXT NOT NULL DEFAULT 'coffee',
    "countryOfProduction" TEXT NOT NULL DEFAULT 'VN',
    "regionOfProduction" TEXT,
    "gpsVerificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "gpsVerificationDate" TIMESTAMP(3),
    "gpsVerifiedBy" TEXT,
    "totalPlotCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedPlotCount" INTEGER NOT NULL DEFAULT 0,
    "geojsonExportUrl" TEXT,
    "riskAssessmentStatus" TEXT NOT NULL DEFAULT 'pending',
    "riskAssessmentDate" TIMESTAMP(3),
    "riskAssessmentSource" TEXT,
    "riskScore" DOUBLE PRECISION,
    "riskNotes" TEXT,
    "deforestationCheckDate" TIMESTAMP(3),
    "deforestationCheckResult" TEXT,
    "ddsDocumentUrl" TEXT,
    "ddsGeneratedAt" TIMESTAMP(3),
    "ddsSubmittedAt" TIMESTAMP(3),
    "ddsApprovedAt" TIMESTAMP(3),
    "ddsExpiryDate" TIMESTAMP(3),
    "totalFarmers" INTEGER NOT NULL DEFAULT 0,
    "totalWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAreaHa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "harvestSeasonStart" TIMESTAMP(3),
    "harvestSeasonEnd" TIMESTAMP(3),
    "lastAuditDate" TIMESTAMP(3),
    "nextAuditDate" TIMESTAMP(3),
    "auditFindings" TEXT,
    "correctiveActions" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EudrCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "lotId" TEXT,
    "shipmentId" TEXT,
    "buyerId" TEXT,
    "eudrComplianceId" TEXT,
    "issuingAuthority" TEXT,
    "issuingDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "issuingCountry" TEXT NOT NULL DEFAULT 'VN',
    "destinationCountry" TEXT,
    "vesselName" TEXT,
    "vesselVoyage" TEXT,
    "portOfLoading" TEXT,
    "portOfDischarge" TEXT,
    "containerNumber" TEXT,
    "sealNumber" TEXT,
    "shippingLine" TEXT,
    "grossWeight" DOUBLE PRECISION,
    "netWeight" DOUBLE PRECISION,
    "numberOfPackages" INTEGER,
    "marksAndNumbers" TEXT,
    "hsCode" TEXT,
    "coffeeGrade" TEXT,
    "coffeeVariety" TEXT,
    "processingMethod" TEXT,
    "totalValue" DOUBLE PRECISION,
    "currency" TEXT,
    "incoterms" TEXT,
    "paymentTerms" TEXT,
    "documentFileUrl" TEXT,
    "templateUsed" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "shipmentId" TEXT,
    "lotId" TEXT,
    "buyerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'preparing',
    "shipmentType" TEXT,
    "originWarehouse" TEXT,
    "originAddress" TEXT,
    "originCity" TEXT,
    "originCountry" TEXT NOT NULL DEFAULT 'VN',
    "loadingDate" TIMESTAMP(3),
    "destinationAddress" TEXT,
    "destinationCity" TEXT,
    "destinationCountry" TEXT,
    "destinationPort" TEXT,
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "carrier" TEXT,
    "vesselName" TEXT,
    "vesselVoyage" TEXT,
    "containerNumber" TEXT,
    "sealNumber" TEXT,
    "bookingNumber" TEXT,
    "blNumber" TEXT,
    "grossWeight" DOUBLE PRECISION,
    "netWeight" DOUBLE PRECISION,
    "numberOfBags" INTEGER,
    "volume" DOUBLE PRECISION,
    "moistureContent" DOUBLE PRECISION,
    "defectRate" DOUBLE PRECISION,
    "cupScore" DOUBLE PRECISION,
    "qcPassed" BOOLEAN NOT NULL DEFAULT false,
    "qcCertificateUrl" TEXT,
    "customsCleared" BOOLEAN NOT NULL DEFAULT false,
    "customsClearanceDate" TIMESTAMP(3),
    "eudrComplianceId" TEXT,
    "currentLocation" TEXT,
    "lastTrackingUpdate" TIMESTAMP(3),
    "trackingUrl" TEXT,
    "trackingNotes" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT,
    "buyerCode" TEXT,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "buyerType" TEXT NOT NULL DEFAULT 'importer',
    "taxId" TEXT,
    "registrationNumber" TEXT,
    "preferredIncoterms" TEXT,
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "paymentTerms" TEXT,
    "eudrRequired" BOOLEAN NOT NULL DEFAULT true,
    "certificationRequirements" TEXT,
    "qualityRequirements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "firstOrderDate" TIMESTAMP(3),
    "lastOrderDate" TIMESTAMP(3),
    "totalOrdersCount" INTEGER NOT NULL DEFAULT 0,
    "totalPurchaseValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditLimit" DOUBLE PRECISION,
    "outstandingBalance" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceYearly" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxFarmers" INTEGER NOT NULL DEFAULT 100,
    "maxFarmLands" INTEGER NOT NULL DEFAULT 500,
    "maxShipments" INTEGER NOT NULL DEFAULT 10,
    "maxExportDocs" INTEGER NOT NULL DEFAULT 5,
    "maxEudrStatements" INTEGER NOT NULL DEFAULT 2,
    "storageLimitMb" INTEGER NOT NULL DEFAULT 500,
    "apiCallsLimit" INTEGER NOT NULL DEFAULT 1000,
    "features" TEXT NOT NULL DEFAULT '{}',
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformUser_email_key" ON "PlatformUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSetting_category_key_key" ON "PlatformSetting"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "Subscription"("tenantId");

-- CreateIndex
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRole_name_key" ON "PlatformRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Module_slug_key" ON "Module"("slug");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_tenantId_key" ON "User"("email", "tenantId");

-- CreateIndex
CREATE INDEX "Farmer_tenantId_idx" ON "Farmer"("tenantId");

-- CreateIndex
CREATE INDEX "Farmer_tenantId_province_idx" ON "Farmer"("tenantId", "province");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_farmerCode_tenantId_key" ON "Farmer"("farmerCode", "tenantId");

-- CreateIndex
CREATE INDEX "FarmLand_tenantId_idx" ON "FarmLand"("tenantId");

-- CreateIndex
CREATE INDEX "FarmLand_tenantId_farmerId_idx" ON "FarmLand"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "Cultivation_tenantId_idx" ON "Cultivation"("tenantId");

-- CreateIndex
CREATE INDEX "Cultivation_tenantId_farmerId_idx" ON "Cultivation"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "Cultivation_tenantId_farmLandId_idx" ON "Cultivation"("tenantId", "farmLandId");

-- CreateIndex
CREATE INDEX "Nursery_tenantId_idx" ON "Nursery"("tenantId");

-- CreateIndex
CREATE INDEX "Nursery_tenantId_farmerId_idx" ON "Nursery"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "LandPreparation_tenantId_idx" ON "LandPreparation"("tenantId");

-- CreateIndex
CREATE INDEX "LandPreparation_tenantId_farmerId_idx" ON "LandPreparation"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "CropMonitoring_tenantId_idx" ON "CropMonitoring"("tenantId");

-- CreateIndex
CREATE INDEX "CropMonitoring_tenantId_farmerId_idx" ON "CropMonitoring"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "CropMonitoring_tenantId_alertTriggered_idx" ON "CropMonitoring"("tenantId", "alertTriggered");

-- CreateIndex
CREATE INDEX "FertilizerApplication_tenantId_idx" ON "FertilizerApplication"("tenantId");

-- CreateIndex
CREATE INDEX "FertilizerApplication_tenantId_farmerId_idx" ON "FertilizerApplication"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "PestDiseaseManagement_tenantId_idx" ON "PestDiseaseManagement"("tenantId");

-- CreateIndex
CREATE INDEX "PestDiseaseManagement_tenantId_farmerId_idx" ON "PestDiseaseManagement"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "HarvestTraceability_tenantId_idx" ON "HarvestTraceability"("tenantId");

-- CreateIndex
CREATE INDEX "HarvestTraceability_tenantId_farmerId_idx" ON "HarvestTraceability"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "HarvestTraceability_tenantId_batchId_idx" ON "HarvestTraceability"("tenantId", "batchId");

-- CreateIndex
CREATE INDEX "CollectionCentre_tenantId_idx" ON "CollectionCentre"("tenantId");

-- CreateIndex
CREATE INDEX "ProcurementRecord_tenantId_idx" ON "ProcurementRecord"("tenantId");

-- CreateIndex
CREATE INDEX "ProcurementRecord_tenantId_farmerId_idx" ON "ProcurementRecord"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "ProcurementRecord_tenantId_batchId_idx" ON "ProcurementRecord"("tenantId", "batchId");

-- CreateIndex
CREATE INDEX "ProcessingJobOrder_tenantId_idx" ON "ProcessingJobOrder"("tenantId");

-- CreateIndex
CREATE INDEX "ProcessingJobOrder_tenantId_batchIdInput_idx" ON "ProcessingJobOrder"("tenantId", "batchIdInput");

-- CreateIndex
CREATE INDEX "ProcessingStageRecord_tenantId_idx" ON "ProcessingStageRecord"("tenantId");

-- CreateIndex
CREATE INDEX "ProcessingStageRecord_tenantId_jobOrderId_idx" ON "ProcessingStageRecord"("tenantId", "jobOrderId");

-- CreateIndex
CREATE INDEX "CertAssessment_tenantId_idx" ON "CertAssessment"("tenantId");

-- CreateIndex
CREATE INDEX "CertAssessment_tenantId_farmerId_idx" ON "CertAssessment"("tenantId", "farmerId");

-- CreateIndex
CREATE INDEX "CoffeeInspection_tenantId_idx" ON "CoffeeInspection"("tenantId");

-- CreateIndex
CREATE INDEX "CoffeeInspection_tenantId_batchId_idx" ON "CoffeeInspection"("tenantId", "batchId");

-- CreateIndex
CREATE INDEX "SmartContract_tenantId_idx" ON "SmartContract"("tenantId");

-- CreateIndex
CREATE INDEX "SmartContract_tenantId_status_idx" ON "SmartContract"("tenantId", "status");

-- CreateIndex
CREATE INDEX "MarketplaceListing_tenantId_idx" ON "MarketplaceListing"("tenantId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_tenantId_listingStatus_idx" ON "MarketplaceListing"("tenantId", "listingStatus");

-- CreateIndex
CREATE INDEX "SaleTransaction_tenantId_idx" ON "SaleTransaction"("tenantId");

-- CreateIndex
CREATE INDEX "Lot_tenantId_idx" ON "Lot"("tenantId");

-- CreateIndex
CREATE INDEX "SoilAnalysis_tenantId_idx" ON "SoilAnalysis"("tenantId");

-- CreateIndex
CREATE INDEX "SoilAnalysis_tenantId_farmLandId_idx" ON "SoilAnalysis"("tenantId", "farmLandId");

-- CreateIndex
CREATE INDEX "HashChainBlock_tenantId_idx" ON "HashChainBlock"("tenantId");

-- CreateIndex
CREATE INDEX "HashChainBlock_tenantId_batchId_idx" ON "HashChainBlock"("tenantId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "HashChainBlock_tenantId_batchId_blockIndex_key" ON "HashChainBlock"("tenantId", "batchId", "blockIndex");

-- CreateIndex
CREATE INDEX "QRVerification_tenantId_idx" ON "QRVerification"("tenantId");

-- CreateIndex
CREATE INDEX "QRVerification_entityType_entityId_idx" ON "QRVerification"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "QRVerification_qrCode_key" ON "QRVerification"("qrCode");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entity_idx" ON "AuditLog"("tenantId", "entity");

-- CreateIndex
CREATE INDEX "EudrCompliance_tenantId_idx" ON "EudrCompliance"("tenantId");

-- CreateIndex
CREATE INDEX "EudrCompliance_tenantId_status_idx" ON "EudrCompliance"("tenantId", "status");

-- CreateIndex
CREATE INDEX "EudrCompliance_tenantId_gpsVerificationStatus_idx" ON "EudrCompliance"("tenantId", "gpsVerificationStatus");

-- CreateIndex
CREATE INDEX "EudrCompliance_tenantId_riskAssessmentStatus_idx" ON "EudrCompliance"("tenantId", "riskAssessmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "EudrCompliance_tenantId_referenceNumber_key" ON "EudrCompliance"("tenantId", "referenceNumber");

-- CreateIndex
CREATE INDEX "ExportDocument_tenantId_idx" ON "ExportDocument"("tenantId");

-- CreateIndex
CREATE INDEX "ExportDocument_tenantId_documentType_idx" ON "ExportDocument"("tenantId", "documentType");

-- CreateIndex
CREATE INDEX "ExportDocument_tenantId_status_idx" ON "ExportDocument"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ExportDocument_tenantId_lotId_idx" ON "ExportDocument"("tenantId", "lotId");

-- CreateIndex
CREATE INDEX "ExportDocument_tenantId_shipmentId_idx" ON "ExportDocument"("tenantId", "shipmentId");

-- CreateIndex
CREATE INDEX "Shipment_tenantId_idx" ON "Shipment"("tenantId");

-- CreateIndex
CREATE INDEX "Shipment_tenantId_status_idx" ON "Shipment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Shipment_tenantId_buyerId_idx" ON "Shipment"("tenantId", "buyerId");

-- CreateIndex
CREATE INDEX "Shipment_tenantId_lotId_idx" ON "Shipment"("tenantId", "lotId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_tenantId_shipmentId_key" ON "Shipment"("tenantId", "shipmentId");

-- CreateIndex
CREATE INDEX "Buyer_tenantId_idx" ON "Buyer"("tenantId");

-- CreateIndex
CREATE INDEX "Buyer_tenantId_country_idx" ON "Buyer"("tenantId", "country");

-- CreateIndex
CREATE INDEX "Buyer_tenantId_buyerType_idx" ON "Buyer"("tenantId", "buyerType");

-- CreateIndex
CREATE INDEX "Buyer_tenantId_status_idx" ON "Buyer"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_tenantId_buyerCode_key" ON "Buyer"("tenantId", "buyerCode");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_slug_key" ON "SubscriptionPlan"("slug");

-- AddForeignKey
ALTER TABLE "PlatformUser" ADD CONSTRAINT "PlatformUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "PlatformRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farmer" ADD CONSTRAINT "Farmer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmLand" ADD CONSTRAINT "FarmLand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmLand" ADD CONSTRAINT "FarmLand_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivation" ADD CONSTRAINT "Cultivation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivation" ADD CONSTRAINT "Cultivation_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivation" ADD CONSTRAINT "Cultivation_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nursery" ADD CONSTRAINT "Nursery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nursery" ADD CONSTRAINT "Nursery_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandPreparation" ADD CONSTRAINT "LandPreparation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandPreparation" ADD CONSTRAINT "LandPreparation_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandPreparation" ADD CONSTRAINT "LandPreparation_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropMonitoring" ADD CONSTRAINT "CropMonitoring_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropMonitoring" ADD CONSTRAINT "CropMonitoring_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropMonitoring" ADD CONSTRAINT "CropMonitoring_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerApplication" ADD CONSTRAINT "FertilizerApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerApplication" ADD CONSTRAINT "FertilizerApplication_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerApplication" ADD CONSTRAINT "FertilizerApplication_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PestDiseaseManagement" ADD CONSTRAINT "PestDiseaseManagement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PestDiseaseManagement" ADD CONSTRAINT "PestDiseaseManagement_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PestDiseaseManagement" ADD CONSTRAINT "PestDiseaseManagement_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestTraceability" ADD CONSTRAINT "HarvestTraceability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestTraceability" ADD CONSTRAINT "HarvestTraceability_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestTraceability" ADD CONSTRAINT "HarvestTraceability_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionCentre" ADD CONSTRAINT "CollectionCentre_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementRecord" ADD CONSTRAINT "ProcurementRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementRecord" ADD CONSTRAINT "ProcurementRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementRecord" ADD CONSTRAINT "ProcurementRecord_collectionCentreId_fkey" FOREIGN KEY ("collectionCentreId") REFERENCES "CollectionCentre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingJobOrder" ADD CONSTRAINT "ProcessingJobOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingStageRecord" ADD CONSTRAINT "ProcessingStageRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingStageRecord" ADD CONSTRAINT "ProcessingStageRecord_jobOrderId_fkey" FOREIGN KEY ("jobOrderId") REFERENCES "ProcessingJobOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertAssessment" ADD CONSTRAINT "CertAssessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertAssessment" ADD CONSTRAINT "CertAssessment_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertAssessment" ADD CONSTRAINT "CertAssessment_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeInspection" ADD CONSTRAINT "CoffeeInspection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeInspection" ADD CONSTRAINT "CoffeeInspection_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeInspection" ADD CONSTRAINT "CoffeeInspection_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTransaction" ADD CONSTRAINT "SaleTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilAnalysis" ADD CONSTRAINT "SoilAnalysis_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilAnalysis" ADD CONSTRAINT "SoilAnalysis_farmLandId_fkey" FOREIGN KEY ("farmLandId") REFERENCES "FarmLand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HashChainBlock" ADD CONSTRAINT "HashChainBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRVerification" ADD CONSTRAINT "QRVerification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EudrCompliance" ADD CONSTRAINT "EudrCompliance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportDocument" ADD CONSTRAINT "ExportDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

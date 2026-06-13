// ════════════════════════════════════════════════════════════════
// COUNTRY-SPECIFIC TRACEABILITY MOCK DATA
// Each country has its own full traceability pipeline with
// proper naming, locations, coffee varieties, and processing steps.
// ════════════════════════════════════════════════════════════════

export interface TraceStageData {
  [key: string]: string | number | boolean | null | undefined
}

export interface CountryTraceBatch {
  batchId: string
  farmerName: string
  farmName: string
  coffeeType: string
  location: string
  country: string
  status: 'completed' | 'in_progress' | 'pending'
  progress: number
  totalStages: number
  completedStages: number
  stages: CountryTraceStage[]
  quickTraceIds: string[]
}

export interface CountryTraceStage {
  key: string
  icon: string
  nameEn: string
  status: 'completed' | 'in_progress' | 'pending'
  date: string | null
  operator: string
  location: string
  lat: number
  lng: number
  metrics: { label: string; value: string }[]
  details: TraceStageData
  hash: string
}

// ─── UGANDA ──────────────────────────────────────────────────
const UGANDA_BATCH: CountryTraceBatch = {
  batchId: 'TB-2026-UG-00312',
  farmerName: 'Emmanuel Mukasa',
  farmName: 'Mukasa Mbale Farm',
  coffeeType: 'Arabica SL28',
  location: 'Mbale, Eastern Uganda',
  country: 'Uganda',
  status: 'in_progress',
  progress: 57,
  totalStages: 14,
  completedStages: 8,
  quickTraceIds: ['TB-2026-UG-00312', 'TB-2026-UG-00478', 'TB-2025-UG-00156'],
  stages: [
    {
      key: 'farmer', icon: '\uD83D\uDC68\u200D\uD83C\uDF3E', nameEn: 'Farmer Registration',
      status: 'completed', date: '2025-09-05T08:00:00+03:00',
      operator: 'Emmanuel Mukasa', location: 'Mbale, Eastern Uganda',
      lat: 1.083, lng: 34.175,
      metrics: [
        { label: 'Farmer ID', value: 'FRM-UG-001' },
        { label: 'Co-op', value: 'Nkusi Coffee Cooperative' },
        { label: 'Years Exp.', value: '16' },
      ],
      details: { farmerCode: 'FRM-UG-001', fullName: 'Emmanuel Mukasa', province: 'Eastern', isCertified: true, nationalIdNo: 'UG-89****45' },
      hash: 'ug1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    },
    {
      key: 'farmland', icon: '\uD83C\uDFDE\uFE0F', nameEn: 'Farm Land',
      status: 'completed', date: '2025-09-07T09:00:00+03:00',
      operator: 'Emmanuel Mukasa', location: 'Bumasobo, Mbale',
      lat: 1.085, lng: 34.178,
      metrics: [
        { label: 'Area', value: '2.5 ha' },
        { label: 'Altitude', value: '1,450m' },
        { label: 'Soil pH', value: '5.9' },
      ],
      details: { farmName: 'Mukasa Mbale Farm', area: 2.5, altitude: 1450, soilType: 'Nitisol', soilPhBefore: 5.9, gpsLat: 1.083, gpsLng: 34.175 },
      hash: 'ug2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    },
    {
      key: 'cultivation', icon: '\uD83C\uDF31', nameEn: 'Cultivation',
      status: 'completed', date: '2025-09-15T07:00:00+03:00',
      operator: 'Emmanuel Mukasa', location: 'Bumasobo, Mbale',
      lat: 1.083, lng: 34.175,
      metrics: [
        { label: 'Variety', value: 'SL28' },
        { label: 'Trees', value: '2,200' },
        { label: 'Method', value: 'Shade-grown' },
      ],
      details: { crop: 'Arabica Coffee', variety: 'SL28', method: 'Shade-grown intercropping with banana', plantingYear: 2015, trees: 2200 },
      hash: 'ug3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    },
    {
      key: 'fertilizer', icon: '\uD83E\uDDEA', nameEn: 'Fertilization',
      status: 'completed', date: '2025-10-10T08:30:00+03:00',
      operator: 'Field Officer Nkusi', location: 'Bumasobo, Mbale',
      lat: 1.084, lng: 34.176,
      metrics: [
        { label: 'Type', value: 'Organic' },
        { label: 'NPK', value: '15-15-15' },
        { label: 'Qty/ha', value: '200 kg' },
      ],
      details: { isOrganic: true, type: 'Compost + NPK', quantity: 500, soilPhAfter: 6.2, applicationDate: '2025-10-10' },
      hash: 'ug4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    },
    {
      key: 'crop_monitoring', icon: '\uD83D\uDCE1', nameEn: 'Crop Monitoring',
      status: 'completed', date: '2025-11-15T10:00:00+03:00',
      operator: 'IoT System', location: 'Bumasobo, Mbale',
      lat: 1.083, lng: 34.175,
      metrics: [
        { label: 'Health', value: '88/100' },
        { label: 'Growth', value: 'Ripening' },
        { label: 'Temp', value: '21.3\u00B0C' },
      ],
      details: { growthStage: 'Ripening', healthScore: 88, alertTriggered: false, temperature: 21.3, humidity: 72 },
      hash: 'ug5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    },
    {
      key: 'pest_disease', icon: '\uD83D\uDC1B', nameEn: 'Pest & Disease',
      status: 'completed', date: '2025-11-20T11:00:00+03:00',
      operator: 'Field Officer Nkusi', location: 'Bumasobo, Mbale',
      lat: 1.082, lng: 34.174,
      metrics: [
        { label: 'Pest', value: 'CWD' },
        { label: 'Severity', value: 'Low' },
        { label: 'Treatment', value: 'Cultural' },
      ],
      details: { pestOrDisease: 'Coffee Wilt Disease', severity: 'Low', treatment: 'Resistant variety + pruning', outcome: 'Controlled' },
      hash: 'ug6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    },
    {
      key: 'harvest', icon: '\u2702\uFE0F', nameEn: 'Harvest',
      status: 'completed', date: '2025-12-05T06:00:00+03:00',
      operator: 'Emmanuel Mukasa', location: 'Bumasobo, Mbale',
      lat: 1.083, lng: 34.175,
      metrics: [
        { label: 'Cherry Wt', value: '5,200 kg' },
        { label: 'Cup Score', value: '85.2' },
        { label: 'Moisture', value: '60%' },
      ],
      details: { batchId: 'TB-2026-UG-00312', cupScore: 85.2, moisture: 60, netWeight: 5200, harvestMethod: 'Selective hand-picking', actualHarvestDate: '2025-12-05' },
      hash: 'ug7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    },
    {
      key: 'procurement', icon: '\uD83D\uDE9B', nameEn: 'Procurement',
      status: 'completed', date: '2025-12-06T09:00:00+03:00',
      operator: 'Nkusi Collection Officer', location: 'Nkusi Collection Centre, Mbale',
      lat: 1.080, lng: 34.170,
      metrics: [
        { label: 'Price/kg', value: 'USh 6,500' },
        { label: 'Net Wt', value: '5,180 kg' },
        { label: 'Payment', value: 'MTN MoMo' },
      ],
      details: { collectionCentre: 'Nkusi Mbale Hub', pricePerKg: 6500, totalAmount: 33670000, paymentStatus: 'Paid via MTN MoMo', inputWeight: 5200, outputWeight: 5180 },
      hash: 'ug8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    },
    {
      key: 'processing', icon: '\uD83C\uDFED', nameEn: 'Processing',
      status: 'in_progress', date: '2025-12-08T07:00:00+03:00',
      operator: 'Nkusi Processing Unit', location: 'Industrial Area, Mbale',
      lat: 1.090, lng: 34.180,
      metrics: [
        { label: 'Stage', value: 'Washing' },
        { label: 'Outturn', value: '16.8%' },
        { label: 'Moisture', value: '14.2%' },
      ],
      details: { processType: 'Washed (Fully washed)', currentStage: 'Washing & Fermentation', outturnRatio: 16.8, moistureContent: 14.2, grade: 'FAQ' },
      hash: 'ug9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    },
    {
      key: 'sorting', icon: '\uD83D\uDD2C', nameEn: 'Sorting & Grading',
      status: 'pending', date: null,
      operator: '-', location: 'Industrial Area, Mbale',
      lat: 1.090, lng: 34.180,
      metrics: [
        { label: 'Grade', value: '-' },
        { label: 'Screen', value: '-' },
        { label: 'Defects', value: '-' },
      ],
      details: { grade: 'Pending', screen: 'Pending', defectCount: null, sortedBy: null },
      hash: 'ug0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    },
    {
      key: 'export_prep', icon: '\uD83D\uDCE6', nameEn: 'Export Preparation',
      status: 'pending', date: null,
      operator: '-', location: 'Mbale Warehouse',
      lat: 1.095, lng: 34.185,
      metrics: [
        { label: 'Lot', value: '-' },
        { label: 'Bag Wt', value: '-' },
        { label: 'Ready', value: '-' },
      ],
      details: { lotNumber: null, bagsCount: null, warehouseLocation: 'Mbale Warehouse', eudrStatus: 'Pending' },
      hash: 'ug1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
    },
    {
      key: 'shipping', icon: '\uD83D\uDEA8', nameEn: 'Shipping',
      status: 'pending', date: null,
      operator: '-', location: 'Mombasa Port, Kenya',
      lat: -4.050, lng: 39.670,
      metrics: [
        { label: 'Vessel', value: '-' },
        { label: 'ETA', value: '-' },
        { label: 'Port', value: '-' },
      ],
      details: { vessel: null, containerNo: null, destination: null, blNumber: null },
      hash: 'ug2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    },
    {
      key: 'quality_check', icon: '\u2705', nameEn: 'Quality Check',
      status: 'pending', date: null,
      operator: '-', location: 'Destination Lab',
      lat: 51.507, lng: -0.128,
      metrics: [
        { label: 'Cup Score', value: '-' },
        { label: 'Defects', value: '-' },
        { label: 'Certified', value: '-' },
      ],
      details: { cupScore: null, defectCount: null, certifiedBy: null, certificationType: null },
      hash: 'ug3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    },
    {
      key: 'delivery', icon: '\uD83C\uDF89', nameEn: 'Final Delivery',
      status: 'pending', date: null,
      operator: '-', location: 'Roastery',
      lat: 51.507, lng: -0.128,
      metrics: [
        { label: 'Received', value: '-' },
        { label: 'Condition', value: '-' },
        { label: 'Verified', value: '-' },
      ],
      details: { receivedBy: null, condition: null, verified: false, deliveryDate: null },
      hash: 'ug4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    },
  ],
}

// ─── KENYA ──────────────────────────────────────────────────
const KENYA_BATCH: CountryTraceBatch = {
  batchId: 'TB-2026-KE-00521',
  farmerName: 'Kamau Ndirangu',
  farmName: 'Gathaithi Estate',
  coffeeType: 'Arabica SL28',
  location: 'Othaya, Nyeri, Kenya',
  country: 'Kenya',
  status: 'in_progress',
  progress: 64,
  totalStages: 14,
  completedStages: 9,
  quickTraceIds: ['TB-2026-KE-00521', 'TB-2026-KE-00698', 'TB-2025-KE-00234'],
  stages: [
    {
      key: 'farmer', icon: '\uD83D\uDC68\u200D\uD83C\uDF3E', nameEn: 'Farmer Registration',
      status: 'completed', date: '2025-08-20T07:00:00+03:00',
      operator: 'Kamau Ndirangu', location: 'Othaya, Nyeri',
      lat: -0.420, lng: 36.951,
      metrics: [
        { label: 'Farmer ID', value: 'FRM-KE-001' },
        { label: 'Co-op', value: 'Othaya Farmers Cooperative' },
        { label: 'Years Exp.', value: '10' },
      ],
      details: { farmerCode: 'FRM-KE-001', fullName: 'Kamau Ndirangu', province: 'Central', isCertified: true, nationalIdNo: 'KE-28****50' },
      hash: 'ke1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    },
    {
      key: 'farmland', icon: '\uD83C\uDFDE\uFE0F', nameEn: 'Farm Land',
      status: 'completed', date: '2025-08-22T08:00:00+03:00',
      operator: 'Kamau Ndirangu', location: 'Gathaithi, Othaya',
      lat: -0.418, lng: 36.948,
      metrics: [
        { label: 'Area', value: '2.0 ha' },
        { label: 'Altitude', value: '1,680m' },
        { label: 'Soil pH', value: '6.0' },
      ],
      details: { farmName: 'Gathaithi Estate', area: 2.0, altitude: 1680, soilType: 'Volcanic Loam', soilPhBefore: 6.0, gpsLat: -0.420, gpsLng: 36.951 },
      hash: 'ke2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    },
    {
      key: 'cultivation', icon: '\uD83C\uDF31', nameEn: 'Cultivation',
      status: 'completed', date: '2025-09-01T07:30:00+03:00',
      operator: 'Kamau Ndirangu', location: 'Gathaithi, Othaya',
      lat: -0.420, lng: 36.951,
      metrics: [
        { label: 'Variety', value: 'SL28' },
        { label: 'Trees', value: '2,200' },
        { label: 'Method', value: 'Shade-grown' },
      ],
      details: { crop: 'Arabica Coffee', variety: 'SL28', method: 'Shade-grown with Grevillea', plantingYear: 2012, trees: 2200 },
      hash: 'ke3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    },
    {
      key: 'fertilizer', icon: '\uD83E\uDDEA', nameEn: 'Fertilization',
      status: 'completed', date: '2025-10-05T09:00:00+03:00',
      operator: 'Othaya Field Officer', location: 'Gathaithi, Othaya',
      lat: -0.421, lng: 36.950,
      metrics: [
        { label: 'Type', value: 'Organic' },
        { label: 'NPK', value: '17-17-17' },
        { label: 'Qty/ha', value: '180 kg' },
      ],
      details: { isOrganic: true, type: 'Compost + NPK', quantity: 360, soilPhAfter: 6.3, applicationDate: '2025-10-05' },
      hash: 'ke4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    },
    {
      key: 'crop_monitoring', icon: '\uD83D\uDCE1', nameEn: 'Crop Monitoring',
      status: 'completed', date: '2025-11-10T10:00:00+03:00',
      operator: 'IoT System', location: 'Gathaithi, Othaya',
      lat: -0.420, lng: 36.951,
      metrics: [
        { label: 'Health', value: '91/100' },
        { label: 'Growth', value: 'Ripening' },
        { label: 'Temp', value: '19.8\u00B0C' },
      ],
      details: { growthStage: 'Ripening', healthScore: 91, alertTriggered: false, temperature: 19.8, humidity: 68 },
      hash: 'ke5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    },
    {
      key: 'pest_disease', icon: '\uD83D\uDC1B', nameEn: 'Pest & Disease',
      status: 'completed', date: '2025-11-15T11:00:00+03:00',
      operator: 'Othaya Field Officer', location: 'Gathaithi, Othaya',
      lat: -0.419, lng: 36.950,
      metrics: [
        { label: 'Pest', value: 'Leaf Rust' },
        { label: 'Severity', value: 'Low' },
        { label: 'Treatment', value: 'Copper spray' },
      ],
      details: { pestOrDisease: 'Coffee Leaf Rust (CLR)', severity: 'Low', treatment: 'Copper-based fungicide', outcome: 'Controlled' },
      hash: 'ke6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    },
    {
      key: 'harvest', icon: '\u2702\uFE0F', nameEn: 'Harvest',
      status: 'completed', date: '2025-11-25T06:00:00+03:00',
      operator: 'Kamau Ndirangu', location: 'Gathaithi, Othaya',
      lat: -0.420, lng: 36.951,
      metrics: [
        { label: 'Cherry Wt', value: '4,800 kg' },
        { label: 'Cup Score', value: '86.5' },
        { label: 'Moisture', value: '58%' },
      ],
      details: { batchId: 'TB-2026-KE-00521', cupScore: 86.5, moisture: 58, netWeight: 4800, harvestMethod: 'Selective hand-picking', actualHarvestDate: '2025-11-25' },
      hash: 'ke7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    },
    {
      key: 'procurement', icon: '\uD83D\uDE9B', nameEn: 'Procurement',
      status: 'completed', date: '2025-11-26T08:00:00+03:00',
      operator: 'Othaya Collection Officer', location: 'Othaya Factory',
      lat: -0.415, lng: 36.945,
      metrics: [
        { label: 'Price/kg', value: 'KSh 120' },
        { label: 'Net Wt', value: '4,780 kg' },
        { label: 'Payment', value: 'M-Pesa' },
      ],
      details: { collectionCentre: 'Othaya Coffee Factory', pricePerKg: 120, totalAmount: 573600, paymentStatus: 'Paid via M-Pesa', inputWeight: 4800, outputWeight: 4780 },
      hash: 'ke8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    },
    {
      key: 'processing', icon: '\uD83C\uDFED', nameEn: 'Processing',
      status: 'completed', date: '2025-11-28T07:00:00+03:00',
      operator: 'Othaya Coffee Factory', location: 'Othaya Factory, Nyeri',
      lat: -0.415, lng: 36.945,
      metrics: [
        { label: 'Method', value: 'Washed' },
        { label: 'Outturn', value: '17.2%' },
        { label: 'Moisture', value: '11.8%' },
      ],
      details: { processType: 'Fully Washed', currentStage: 'Complete - Drying on raised beds', outturnRatio: 17.2, moistureContent: 11.8, grade: 'AA' },
      hash: 'ke9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    },
    {
      key: 'sorting', icon: '\uD83D\uDD2C', nameEn: 'Sorting & Grading',
      status: 'in_progress', date: '2025-12-02T09:00:00+03:00',
      operator: 'Othaya QC Team', location: 'Othaya Factory, Nyeri',
      lat: -0.415, lng: 36.945,
      metrics: [
        { label: 'Grade', value: 'AA' },
        { label: 'Screen', value: '18+' },
        { label: 'Defects', value: '3/300g' },
      ],
      details: { grade: 'AA', screen: '18+', defectCount: 3, sortedBy: 'Othaya QC Team' },
      hash: 'ke0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    },
    {
      key: 'export_prep', icon: '\uD83D\uDCE6', nameEn: 'Export Preparation',
      status: 'pending', date: null,
      operator: '-', location: 'Nairobi Warehouse',
      lat: -1.292, lng: 36.822,
      metrics: [
        { label: 'Lot', value: '-' },
        { label: 'Bag Wt', value: '-' },
        { label: 'Ready', value: '-' },
      ],
      details: { lotNumber: null, bagsCount: null, warehouseLocation: 'Nairobi Coffee Exchange', eudrStatus: 'Compliant' },
      hash: 'ke1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
    },
    {
      key: 'shipping', icon: '\uD83D\uDEA8', nameEn: 'Shipping',
      status: 'pending', date: null,
      operator: '-', location: 'Mombasa Port',
      lat: -4.050, lng: 39.670,
      metrics: [
        { label: 'Vessel', value: '-' },
        { label: 'ETA', value: '-' },
        { label: 'Port', value: '-' },
      ],
      details: { vessel: null, containerNo: null, destination: null, blNumber: null },
      hash: 'ke2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    },
    {
      key: 'quality_check', icon: '\u2705', nameEn: 'Quality Check',
      status: 'pending', date: null,
      operator: '-', location: 'Destination Lab',
      lat: 51.507, lng: -0.128,
      metrics: [
        { label: 'Cup Score', value: '-' },
        { label: 'Defects', value: '-' },
        { label: 'Certified', value: '-' },
      ],
      details: { cupScore: null, defectCount: null, certifiedBy: null, certificationType: null },
      hash: 'ke3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    },
    {
      key: 'delivery', icon: '\uD83C\uDF89', nameEn: 'Final Delivery',
      status: 'pending', date: null,
      operator: '-', location: 'Roastery',
      lat: 51.507, lng: -0.128,
      metrics: [
        { label: 'Received', value: '-' },
        { label: 'Condition', value: '-' },
        { label: 'Verified', value: '-' },
      ],
      details: { receivedBy: null, condition: null, verified: false, deliveryDate: null },
      hash: 'ke4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    },
  ],
}

// ─── ETHIOPIA ──────────────────────────────────────────────────
const ETHIOPIA_BATCH: CountryTraceBatch = {
  batchId: 'TB-2026-ET-00178',
  farmerName: 'Abebe Tadesse',
  farmName: 'Yirgacheffe Biloya Garden',
  coffeeType: 'Arabica Heirloom',
  location: 'Kochere, Yirgacheffe, Ethiopia',
  country: 'Ethiopia',
  status: 'in_progress',
  progress: 50,
  totalStages: 14,
  completedStages: 7,
  quickTraceIds: ['TB-2026-ET-00178', 'TB-2026-ET-00295', 'TB-2025-ET-00089'],
  stages: [
    {
      key: 'farmer', icon: '\uD83D\uDC68\u200D\uD83C\uDF3E', nameEn: 'Farmer Registration',
      status: 'completed', date: '2025-08-15T07:00:00+03:00',
      operator: 'Abebe Tadesse', location: 'Kochere, Yirgacheffe',
      lat: 6.162, lng: 38.202,
      metrics: [
        { label: 'Farmer ID', value: 'FRM-ET-001' },
        { label: 'Co-op', value: 'Yirgacheffe Union' },
        { label: 'Years Exp.', value: '15' },
      ],
      details: { farmerCode: 'FRM-ET-001', fullName: 'Abebe Tadesse', province: 'Gedeo', isCertified: true, nationalIdNo: 'ET-YG-****82' },
      hash: 'et1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    },
    {
      key: 'farmland', icon: '\uD83C\uDFDE\uFE0F', nameEn: 'Farm Land',
      status: 'completed', date: '2025-08-18T08:00:00+03:00',
      operator: 'Abebe Tadesse', location: 'Biloya, Kochere',
      lat: 6.160, lng: 38.200,
      metrics: [
        { label: 'Area', value: '1.5 ha' },
        { label: 'Altitude', value: '1,850m' },
        { label: 'Soil pH', value: '5.7' },
      ],
      details: { farmName: 'Yirgacheffe Biloya Garden', area: 1.5, altitude: 1850, soilType: 'Nitisol', soilPhBefore: 5.7 },
      hash: 'et2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    },
    {
      key: 'cultivation', icon: '\uD83C\uDF31', nameEn: 'Cultivation',
      status: 'completed', date: '2025-08-25T07:00:00+03:00',
      operator: 'Abebe Tadesse', location: 'Biloya, Kochere',
      lat: 6.162, lng: 38.202,
      metrics: [
        { label: 'Variety', value: 'Heirloom' },
        { label: 'Trees', value: '1,800' },
        { label: 'Method', value: 'Forest garden' },
      ],
      details: { crop: 'Arabica Coffee', variety: 'Ethiopian Heirloom', method: 'Traditional forest garden', plantingYear: 2005, trees: 1800 },
      hash: 'et3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    },
    {
      key: 'fertilizer', icon: '\uD83E\uDDEA', nameEn: 'Fertilization',
      status: 'completed', date: '2025-09-15T08:30:00+03:00',
      operator: 'Union Agronomist', location: 'Biloya, Kochere',
      lat: 6.161, lng: 38.201,
      metrics: [
        { label: 'Type', value: 'Organic' },
        { label: 'Method', value: 'Compost' },
        { label: 'Qty/ha', value: '150 kg' },
      ],
      details: { isOrganic: true, type: 'Organic compost only', quantity: 225, soilPhAfter: 5.9, applicationDate: '2025-09-15' },
      hash: 'et4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    },
    {
      key: 'crop_monitoring', icon: '\uD83D\uDCE1', nameEn: 'Crop Monitoring',
      status: 'completed', date: '2025-10-20T10:00:00+03:00',
      operator: 'Union Field Team', location: 'Biloya, Kochere',
      lat: 6.162, lng: 38.202,
      metrics: [
        { label: 'Health', value: '94/100' },
        { label: 'Growth', value: 'Cherry' },
        { label: 'Temp', value: '20.5\u00B0C' },
      ],
      details: { growthStage: 'Cherry development', healthScore: 94, alertTriggered: false, temperature: 20.5, humidity: 75 },
      hash: 'et5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    },
    {
      key: 'harvest', icon: '\u2702\uFE0F', nameEn: 'Harvest',
      status: 'completed', date: '2025-11-15T06:00:00+03:00',
      operator: 'Abebe Tadesse', location: 'Biloya, Kochere',
      lat: 6.162, lng: 38.202,
      metrics: [
        { label: 'Cherry Wt', value: '3,200 kg' },
        { label: 'Cup Score', value: '88.5' },
        { label: 'Moisture', value: '55%' },
      ],
      details: { batchId: 'TB-2026-ET-00178', cupScore: 88.5, moisture: 55, netWeight: 3200, harvestMethod: 'Selective hand-picking', actualHarvestDate: '2025-11-15' },
      hash: 'et6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    },
    {
      key: 'procurement', icon: '\uD83D\uDE9B', nameEn: 'Procurement',
      status: 'completed', date: '2025-11-16T09:00:00+03:00',
      operator: 'Yirgacheffe Union', location: 'Dilla, Gedeo',
      lat: 6.250, lng: 38.300,
      metrics: [
        { label: 'Price/kg', value: 'ETB 180' },
        { label: 'Net Wt', value: '3,190 kg' },
        { label: 'Payment', value: 'telebirr' },
      ],
      details: { collectionCentre: 'Dilla Washing Station', pricePerKg: 180, totalAmount: 574200, paymentStatus: 'Paid via telebirr', inputWeight: 3200, outputWeight: 3190 },
      hash: 'et7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    },
    {
      key: 'processing', icon: '\uD83C\uDFED', nameEn: 'Processing',
      status: 'in_progress', date: '2025-11-18T07:00:00+03:00',
      operator: 'Biloya Washing Station', location: 'Biloya, Kochere',
      lat: 6.160, lng: 38.200,
      metrics: [
        { label: 'Method', value: 'Washed' },
        { label: 'Outturn', value: '15.5%' },
        { label: 'Moisture', value: '12.5%' },
      ],
      details: { processType: 'Fully Washed', currentStage: 'Drying on raised beds', outturnRatio: 15.5, moistureContent: 12.5, grade: 'Yirgacheffe Grade 1' },
      hash: 'et8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    },
    {
      key: 'sorting', icon: '\uD83D\uDD2C', nameEn: 'Sorting & Grading',
      status: 'pending', date: null, operator: '-', location: 'Biloya, Kochere', lat: 6.160, lng: 38.200,
      metrics: [{ label: 'Grade', value: '-' }, { label: 'Screen', value: '-' }, { label: 'Defects', value: '-' }],
      details: { grade: 'Pending', screen: 'Pending', defectCount: null, sortedBy: null }, hash: 'et9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    },
    {
      key: 'export_prep', icon: '\uD83D\uDCE6', nameEn: 'Export Preparation',
      status: 'pending', date: null, operator: '-', location: 'Addis Ababa', lat: 9.025, lng: 38.747,
      metrics: [{ label: 'Lot', value: '-' }, { label: 'Bag Wt', value: '-' }, { label: 'Ready', value: '-' }],
      details: { lotNumber: null, bagsCount: null, warehouseLocation: 'ECX Warehouse Addis', eudrStatus: 'Compliant' }, hash: 'et0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    },
    {
      key: 'shipping', icon: '\uD83D\uDEA8', nameEn: 'Shipping',
      status: 'pending', date: null, operator: '-', location: 'Djibouti Port', lat: 11.588, lng: 43.146,
      metrics: [{ label: 'Vessel', value: '-' }, { label: 'ETA', value: '-' }, { label: 'Port', value: '-' }],
      details: { vessel: null, containerNo: null, destination: null, blNumber: null }, hash: 'et1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
    },
    {
      key: 'quality_check', icon: '\u2705', nameEn: 'Quality Check',
      status: 'pending', date: null, operator: '-', location: 'Destination Lab', lat: 48.856, lng: 2.352,
      metrics: [{ label: 'Cup Score', value: '-' }, { label: 'Defects', value: '-' }, { label: 'Certified', value: '-' }],
      details: { cupScore: null, defectCount: null, certifiedBy: null, certificationType: null }, hash: 'et2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    },
    {
      key: 'delivery', icon: '\uD83C\uDF89', nameEn: 'Final Delivery',
      status: 'pending', date: null, operator: '-', location: 'Roastery', lat: 48.856, lng: 2.352,
      metrics: [{ label: 'Received', value: '-' }, { label: 'Condition', value: '-' }, { label: 'Verified', value: '-' }],
      details: { receivedBy: null, condition: null, verified: false, deliveryDate: null }, hash: 'et3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    },
  ],
}

// ─── BRAZIL ──────────────────────────────────────────────────
const BRAZIL_BATCH: CountryTraceBatch = {
  batchId: 'TB-2026-BR-00645',
  farmerName: 'João Silva',
  farmName: 'Fazenda São José',
  coffeeType: 'Arabica Catuai',
  location: 'Guaxupé, Minas Gerais, Brazil',
  country: 'Brazil',
  status: 'in_progress',
  progress: 71,
  totalStages: 14,
  completedStages: 10,
  quickTraceIds: ['TB-2026-BR-00645', 'TB-2026-BR-00812', 'TB-2025-BR-00301'],
  stages: [
    {
      key: 'farmer', icon: '\uD83D\uDC68\u200D\uD83C\uDF3E', nameEn: 'Farmer Registration',
      status: 'completed', date: '2025-07-20T07:00:00-03:00',
      operator: 'João Silva', location: 'Guaxupé, Minas Gerais',
      lat: -21.307, lng: -46.718,
      metrics: [
        { label: 'Farmer ID', value: 'FRM-BR-001' },
        { label: 'Co-op', value: 'Cooxupé' },
        { label: 'Years Exp.', value: '22' },
      ],
      details: { farmerCode: 'FRM-BR-001', fullName: 'João Silva', province: 'Minas Gerais', isCertified: true, nationalIdNo: '***.456.789-00' },
      hash: 'br1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    },
    {
      key: 'farmland', icon: '\uD83C\uDFDE\uFE0F', nameEn: 'Farm Land',
      status: 'completed', date: '2025-07-22T08:00:00-03:00',
      operator: 'João Silva', location: 'Fazenda São José, Guaxupé',
      lat: -21.305, lng: -46.715,
      metrics: [
        { label: 'Area', value: '8.0 ha' },
        { label: 'Altitude', value: '950m' },
        { label: 'Soil pH', value: '5.5' },
      ],
      details: { farmName: 'Fazenda São José', area: 8.0, altitude: 950, soilType: 'Latossolo Vermelho', soilPhBefore: 5.5 },
      hash: 'br2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    },
    {
      key: 'cultivation', icon: '\uD83C\uDF31', nameEn: 'Cultivation',
      status: 'completed', date: '2025-08-01T07:00:00-03:00',
      operator: 'João Silva', location: 'Fazenda São José, Guaxupé',
      lat: -21.307, lng: -46.718,
      metrics: [
        { label: 'Variety', value: 'Catuai Amarelo' },
        { label: 'Trees', value: '24,000' },
        { label: 'Method', value: 'Mechanized' },
      ],
      details: { crop: 'Arabica Coffee', variety: 'Catuai Amarelo', method: 'Semi-mechanized with drip irrigation', plantingYear: 2010, trees: 24000 },
      hash: 'br3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    },
    {
      key: 'fertilizer', icon: '\uD83E\uDDEA', nameEn: 'Fertilization',
      status: 'completed', date: '2025-09-05T08:00:00-03:00',
      operator: 'Cooxupé Agronomist', location: 'Fazenda São José, Guaxupé',
      lat: -21.306, lng: -46.717,
      metrics: [
        { label: 'Type', value: 'Conventional' },
        { label: 'NPK', value: '20-05-20' },
        { label: 'Qty/ha', value: '350 kg' },
      ],
      details: { isOrganic: false, type: 'NPK 20-05-20 + Foliar', quantity: 2800, soilPhAfter: 5.8, applicationDate: '2025-09-05' },
      hash: 'br4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    },
    {
      key: 'crop_monitoring', icon: '\uD83D\uDCE1', nameEn: 'Crop Monitoring',
      status: 'completed', date: '2025-10-15T10:00:00-03:00',
      operator: 'Cooxupé Technical Team', location: 'Fazenda São José, Guaxupé',
      lat: -21.307, lng: -46.718,
      metrics: [
        { label: 'Health', value: '87/100' },
        { label: 'Growth', value: 'Maturation' },
        { label: 'Temp', value: '23.1\u00B0C' },
      ],
      details: { growthStage: 'Maturation', healthScore: 87, alertTriggered: false, temperature: 23.1, humidity: 65 },
      hash: 'br5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    },
    {
      key: 'pest_disease', icon: '\uD83D\uDC1B', nameEn: 'Pest & Disease',
      status: 'completed', date: '2025-10-20T09:00:00-03:00',
      operator: 'Cooxupé Agronomist', location: 'Fazenda São José, Guaxupé',
      lat: -21.306, lng: -46.716,
      metrics: [
        { label: 'Pest', value: 'Borer' },
        { label: 'Severity', value: 'Medium' },
        { label: 'Treatment', value: 'Insecticide' },
      ],
      details: { pestOrDisease: 'Coffee Berry Borer (Broca)', severity: 'Medium', treatment: 'Targeted insecticide + traps', outcome: 'Controlled' },
      hash: 'br6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    },
    {
      key: 'harvest', icon: '\u2702\uFE0F', nameEn: 'Harvest',
      status: 'completed', date: '2025-06-15T06:00:00-03:00',
      operator: 'João Silva', location: 'Fazenda São José, Guaxupé',
      lat: -21.307, lng: -46.718,
      metrics: [
        { label: 'Cherry Wt', value: '18,000 kg' },
        { label: 'Cup Score', value: '82.0' },
        { label: 'Moisture', value: '65%' },
      ],
      details: { batchId: 'TB-2026-BR-00645', cupScore: 82.0, moisture: 65, netWeight: 18000, harvestMethod: 'Mechanical stripping', actualHarvestDate: '2025-06-15' },
      hash: 'br7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    },
    {
      key: 'procurement', icon: '\uD83D\uDE9B', nameEn: 'Procurement',
      status: 'completed', date: '2025-06-16T07:00:00-03:00',
      operator: 'Cooxupé Receiving', location: 'Cooxupé Warehouse, Guaxupé',
      lat: -21.300, lng: -46.710,
      metrics: [
        { label: 'Price/sack', value: 'R$ 1,200' },
        { label: 'Net Wt', value: '17,950 kg' },
        { label: 'Payment', value: 'Bank transfer' },
      ],
      details: { collectionCentre: 'Cooxupé Guaxupé Receiving', pricePerSack: 1200, totalAmount: 748800, paymentStatus: 'Paid via Banco do Brasil', inputWeight: 18000, outputWeight: 17950 },
      hash: 'br8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    },
    {
      key: 'processing', icon: '\uD83C\uDFED', nameEn: 'Processing',
      status: 'completed', date: '2025-06-20T07:00:00-03:00',
      operator: 'Cooxupé Processing', location: 'Cooxupé Facility, Guaxupé',
      lat: -21.295, lng: -46.705,
      metrics: [
        { label: 'Method', value: 'Pulped Natural' },
        { label: 'Outturn', value: '18.5%' },
        { label: 'Moisture', value: '12.0%' },
      ],
      details: { processType: 'Pulped Natural (Cereja Descascado)', currentStage: 'Complete', outturnRatio: 18.5, moistureContent: 12.0, grade: 'Strictly Soft' },
      hash: 'br9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    },
    {
      key: 'sorting', icon: '\uD83D\uDD2C', nameEn: 'Sorting & Grading',
      status: 'completed', date: '2025-06-25T08:00:00-03:00',
      operator: 'Cooxupé QC', location: 'Cooxupé Facility, Guaxupé',
      lat: -21.295, lng: -46.705,
      metrics: [
        { label: 'Grade', value: 'Type 2' },
        { label: 'Screen', value: '16/17' },
        { label: 'Defects', value: '8/300g' },
      ],
      details: { grade: 'Type 2 (COB)', screen: '16/17', defectCount: 8, sortedBy: 'Cooxupé QC Team' },
      hash: 'br0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    },
    {
      key: 'export_prep', icon: '\uD83D\uDCE6', nameEn: 'Export Preparation',
      status: 'in_progress', date: '2025-07-01T09:00:00-03:00',
      operator: 'Cooxupé Export Team', location: 'Santos Port',
      lat: -23.935, lng: -46.310,
      metrics: [
        { label: 'Lot', value: 'BR-MG-2026-645' },
        { label: 'Bags', value: '332 (60kg)' },
        { label: 'Ready', value: '90%' },
      ],
      details: { lotNumber: 'BR-MG-2026-645', bagsCount: 332, warehouseLocation: 'Santos Coffee Terminal', eudrStatus: 'Compliant' },
      hash: 'br1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
    },
    {
      key: 'shipping', icon: '\uD83D\uDEA8', nameEn: 'Shipping',
      status: 'pending', date: null, operator: '-', location: 'Santos Port', lat: -23.935, lng: -46.310,
      metrics: [{ label: 'Vessel', value: '-' }, { label: 'ETA', value: '-' }, { label: 'Port', value: '-' }],
      details: { vessel: null, containerNo: null, destination: 'Hamburg', blNumber: null }, hash: 'br2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    },
    {
      key: 'quality_check', icon: '\u2705', nameEn: 'Quality Check',
      status: 'pending', date: null, operator: '-', location: 'Destination Lab', lat: 53.551, lng: 9.993,
      metrics: [{ label: 'Cup Score', value: '-' }, { label: 'Defects', value: '-' }, { label: 'Certified', value: '-' }],
      details: { cupScore: null, defectCount: null, certifiedBy: null, certificationType: null }, hash: 'br3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    },
    {
      key: 'delivery', icon: '\uD83C\uDF89', nameEn: 'Final Delivery',
      status: 'pending', date: null, operator: '-', location: 'Roastery', lat: 53.551, lng: 9.993,
      metrics: [{ label: 'Received', value: '-' }, { label: 'Condition', value: '-' }, { label: 'Verified', value: '-' }],
      details: { receivedBy: null, condition: null, verified: false, deliveryDate: null }, hash: 'br4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    },
  ],
}

// ─── GHANA ──────────────────────────────────────────────────
const GHANA_BATCH: CountryTraceBatch = {
  batchId: 'TB-2026-GH-00234',
  farmerName: 'Kwame Asante',
  farmName: 'Asante Cocoa & Coffee Farm',
  coffeeType: 'Robusta',
  location: 'Goaso, Ahafo, Ghana',
  country: 'Ghana',
  status: 'in_progress',
  progress: 43,
  totalStages: 14,
  completedStages: 6,
  quickTraceIds: ['TB-2026-GH-00234', 'TB-2026-GH-00389', 'TB-2025-GH-00067'],
  stages: [
    {
      key: 'farmer', icon: '\uD83D\uDC68\u200D\uD83C\uDF3E', nameEn: 'Farmer Registration',
      status: 'completed', date: '2025-09-10T08:00:00+00:00',
      operator: 'Kwame Asante', location: 'Goaso, Ahafo',
      lat: 6.892, lng: -2.498,
      metrics: [
        { label: 'Farmer ID', value: 'FRM-GH-001' },
        { label: 'Co-op', value: 'Asunafo Export' },
        { label: 'Years Exp.', value: '14' },
      ],
      details: { farmerCode: 'FRM-GH-001', fullName: 'Kwame Asante', province: 'Ahafo', isCertified: true, nationalIdNo: 'GHA-000***56-1' },
      hash: 'gh1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    },
    {
      key: 'farmland', icon: '\uD83C\uDFDE\uFE0F', nameEn: 'Farm Land',
      status: 'completed', date: '2025-09-12T09:00:00+00:00',
      operator: 'Kwame Asante', location: 'Acherensua, Goaso',
      lat: 6.890, lng: -2.495,
      metrics: [
        { label: 'Area', value: '3.5 ha' },
        { label: 'Altitude', value: '320m' },
        { label: 'Soil pH', value: '5.4' },
      ],
      details: { farmName: 'Asante Cocoa & Coffee Farm', area: 3.5, altitude: 320, soilType: 'Ferric Acrisol', soilPhBefore: 5.4 },
      hash: 'gh2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    },
    {
      key: 'cultivation', icon: '\uD83C\uDF31', nameEn: 'Cultivation',
      status: 'completed', date: '2025-09-20T07:00:00+00:00',
      operator: 'Kwame Asante', location: 'Acherensua, Goaso',
      lat: 6.892, lng: -2.498,
      metrics: [
        { label: 'Variety', value: 'Robusta' },
        { label: 'Trees', value: '2,800' },
        { label: 'Method', value: 'Intercrop' },
      ],
      details: { crop: 'Robusta Coffee', variety: 'Robusta', method: 'Intercropped with cocoa and plantain', plantingYear: 2013, trees: 2800 },
      hash: 'gh3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    },
    {
      key: 'fertilizer', icon: '\uD83E\uDDEA', nameEn: 'Fertilization',
      status: 'completed', date: '2025-10-10T08:00:00+00:00',
      operator: 'Extension Officer', location: 'Acherensua, Goaso',
      lat: 6.891, lng: -2.497,
      metrics: [
        { label: 'Type', value: 'Organic' },
        { label: 'NPK', value: '15-15-15' },
        { label: 'Qty/ha', value: '200 kg' },
      ],
      details: { isOrganic: true, type: 'Compost + NPK', quantity: 700, soilPhAfter: 5.7, applicationDate: '2025-10-10' },
      hash: 'gh4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    },
    {
      key: 'harvest', icon: '\u2702\uFE0F', nameEn: 'Harvest',
      status: 'completed', date: '2025-12-01T06:00:00+00:00',
      operator: 'Kwame Asante', location: 'Acherensua, Goaso',
      lat: 6.892, lng: -2.498,
      metrics: [
        { label: 'Cherry Wt', value: '6,200 kg' },
        { label: 'Cup Score', value: '79.5' },
        { label: 'Moisture', value: '68%' },
      ],
      details: { batchId: 'TB-2026-GH-00234', cupScore: 79.5, moisture: 68, netWeight: 6200, harvestMethod: 'Strip picking', actualHarvestDate: '2025-12-01' },
      hash: 'gh6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    },
    {
      key: 'procurement', icon: '\uD83D\uDE9B', nameEn: 'Procurement',
      status: 'completed', date: '2025-12-02T09:00:00+00:00',
      operator: 'Asunafo Purchasing Clerk', location: 'Goaso Collection Point',
      lat: 6.885, lng: -2.490,
      metrics: [
        { label: 'Price/kg', value: 'GH\u20B5 28' },
        { label: 'Net Wt', value: '6,180 kg' },
        { label: 'Payment', value: 'MTN MoMo' },
      ],
      details: { collectionCentre: 'Goaso Purchasing Centre', pricePerKg: 28, totalAmount: 173040, paymentStatus: 'Paid via MTN MoMo', inputWeight: 6200, outputWeight: 6180 },
      hash: 'gh7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    },
    {
      key: 'processing', icon: '\uD83C\uDFED', nameEn: 'Processing',
      status: 'in_progress', date: '2025-12-05T07:00:00+00:00',
      operator: 'Asunafo Processing Unit', location: 'Sunyani Processing',
      lat: 7.334, lng: -2.327,
      metrics: [
        { label: 'Method', value: 'Natural' },
        { label: 'Outturn', value: '19.2%' },
        { label: 'Moisture', value: '14.5%' },
      ],
      details: { processType: 'Natural / Dry process', currentStage: 'Sun-drying on patios', outturnRatio: 19.2, moistureContent: 14.5, grade: 'FAQ' },
      hash: 'gh8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    },
    {
      key: 'sorting', icon: '\uD83D\uDD2C', nameEn: 'Sorting & Grading',
      status: 'pending', date: null, operator: '-', location: 'Sunyani', lat: 7.334, lng: -2.327,
      metrics: [{ label: 'Grade', value: '-' }, { label: 'Screen', value: '-' }, { label: 'Defects', value: '-' }],
      details: { grade: 'Pending', screen: 'Pending', defectCount: null, sortedBy: null }, hash: 'gh9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    },
    { key: 'crop_monitoring', icon: '\uD83D\uDCE1', nameEn: 'Crop Monitoring', status: 'completed', date: '2025-11-10T10:00:00+00:00', operator: 'Extension Team', location: 'Acherensua, Goaso', lat: 6.892, lng: -2.498, metrics: [{ label: 'Health', value: '78/100' }, { label: 'Growth', value: 'Ripening' }, { label: 'Temp', value: '28.2\u00B0C' }], details: { growthStage: 'Ripening', healthScore: 78, alertTriggered: false, temperature: 28.2, humidity: 82 }, hash: 'gh5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a' },
    { key: 'pest_disease', icon: '\uD83D\uDC1B', nameEn: 'Pest & Disease', status: 'completed', date: '2025-11-15T11:00:00+00:00', operator: 'Extension Officer', location: 'Acherensua, Goaso', lat: 6.891, lng: -2.497, metrics: [{ label: 'Pest', value: 'CBB' }, { label: 'Severity', value: 'Low' }, { label: 'Treatment', value: 'Cultural' }], details: { pestOrDisease: 'Coffee Berry Borer', severity: 'Low', treatment: 'Farm hygiene + traps', outcome: 'Controlled' }, hash: 'gh6ef7a8b9c0d1e2f3a4b5c6d7e8f9a1' },
    { key: 'export_prep', icon: '\uD83D\uDCE6', nameEn: 'Export Preparation', status: 'pending', date: null, operator: '-', location: 'Tema Port', lat: 5.640, lng: -0.007, metrics: [{ label: 'Lot', value: '-' }, { label: 'Bag Wt', value: '-' }, { label: 'Ready', value: '-' }], details: { lotNumber: null, bagsCount: null, warehouseLocation: 'Tema Coffee Warehouse', eudrStatus: 'In Review' }, hash: 'gh1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a' },
    { key: 'shipping', icon: '\uD83D\uDEA8', nameEn: 'Shipping', status: 'pending', date: null, operator: '-', location: 'Tema Port', lat: 5.640, lng: -0.007, metrics: [{ label: 'Vessel', value: '-' }, { label: 'ETA', value: '-' }, { label: 'Port', value: '-' }], details: { vessel: null, containerNo: null, destination: null, blNumber: null }, hash: 'gh2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b' },
    { key: 'quality_check', icon: '\u2705', nameEn: 'Quality Check', status: 'pending', date: null, operator: '-', location: 'Destination Lab', lat: 51.507, lng: -0.128, metrics: [{ label: 'Cup Score', value: '-' }, { label: 'Defects', value: '-' }, { label: 'Certified', value: '-' }], details: { cupScore: null, defectCount: null, certifiedBy: null, certificationType: null }, hash: 'gh3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c' },
    { key: 'delivery', icon: '\uD83C\uDF89', nameEn: 'Final Delivery', status: 'pending', date: null, operator: '-', location: 'Roastery', lat: 51.507, lng: -0.128, metrics: [{ label: 'Received', value: '-' }, { label: 'Condition', value: '-' }, { label: 'Verified', value: '-' }], details: { receivedBy: null, condition: null, verified: false, deliveryDate: null }, hash: 'gh4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d' },
  ],
}

// ─── VIETNAM (existing data, kept for reference) ──────────────
const VIETNAM_BATCH: CountryTraceBatch = {
  batchId: 'TB-2026-DL-00847',
  farmerName: 'Nguyễn Văn Minh',
  farmName: 'Gia Lộc Farm',
  coffeeType: 'Robusta CH1',
  location: "Ea H'Leo, Đắk Lắk, Vietnam",
  country: 'Vietnam',
  status: 'in_progress',
  progress: 61,
  totalStages: 14,
  completedStages: 8,
  quickTraceIds: ['TB-2026-DL-00847', 'TB-2026-GI-01203', 'TB-2025-DN-00189'],
  stages: [
    { key: 'farmer', icon: '\uD83D\uDC68\u200D\uD83C\uDF3E', nameEn: 'Farmer Registration', status: 'completed', date: '2025-08-12T06:30:00+07:00', operator: 'Nguyễn Văn Minh', location: "Ea H'Leo, Đắk Lắk", lat: 12.857, lng: 108.162, metrics: [{ label: 'Farmer ID', value: 'F-DL-2019-0342' }, { label: 'Co-op', value: "Ea H'Leo Cooperative" }, { label: 'Years Exp.', value: '18' }], details: { farmerCode: 'F-DL-0342', fullName: 'Nguyễn Văn Minh', province: 'Đắk Lắk', isCertified: true, nationalIdNo: '****6789' }, hash: '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d' },
    { key: 'farmland', icon: '\uD83C\uDFDE\uFE0F', nameEn: 'Farm Land', status: 'completed', date: '2025-08-14T08:00:00+07:00', operator: 'Nguyễn Văn Minh', location: "Ea H'Leo, Đắk Lắk", lat: 12.862, lng: 108.168, metrics: [{ label: 'Area', value: '2.4 ha' }, { label: 'Altitude', value: '820m' }, { label: 'Soil pH', value: '5.8' }], details: { farmName: 'Gia Lộc Farm', area: 2.4, altitude: 820, soilType: 'Basaltic red', soilPhBefore: 5.8 }, hash: '1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e' },
    { key: 'cultivation', icon: '\uD83C\uDF31', nameEn: 'Cultivation', status: 'completed', date: '2025-09-01T07:00:00+07:00', operator: 'Nguyễn Văn Minh', location: "Ea H'Leo, Đắk Lắk", lat: 12.862, lng: 108.168, metrics: [{ label: 'Variety', value: 'Robusta CH1' }, { label: 'Trees', value: '3,600' }, { label: 'Method', value: 'Intercrop' }], details: { crop: 'Coffee Robusta', variety: 'CH1', method: 'Intercropping with pepper', plantingYear: 2017, trees: 3600 }, hash: '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f' },
    { key: 'fertilizer', icon: '\uD83E\uDDEA', nameEn: 'Fertilization', status: 'completed', date: '2025-10-15T09:00:00+07:00', operator: 'Lê Thị Hương', location: "Ea H'Leo, Đắk Lắk", lat: 12.863, lng: 108.169, metrics: [{ label: 'Type', value: 'Organic' }, { label: 'NPK', value: '16-16-8' }, { label: 'Qty/ha', value: '450 kg' }], details: { isOrganic: true, type: 'NPK + Compost', quantity: 1080, soilPhAfter: 6.1, applicationDate: '2025-10-15' }, hash: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a' },
    { key: 'crop_monitoring', icon: '\uD83D\uDCE1', nameEn: 'Crop Monitoring', status: 'completed', date: '2025-11-20T10:30:00+07:00', operator: 'IoT System', location: "Ea H'Leo, Đắk Lắk", lat: 12.862, lng: 108.168, metrics: [{ label: 'Health', value: '92/100' }, { label: 'Growth', value: 'Fruiting' }, { label: 'Temp', value: '24.5\u00B0C' }], details: { growthStage: 'Fruiting', healthScore: 92, alertTriggered: false, temperature: 24.5, humidity: 78 }, hash: '4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b' },
    { key: 'pest_disease', icon: '\uD83D\uDC1B', nameEn: 'Pest & Disease', status: 'completed', date: '2025-11-25T14:00:00+07:00', operator: 'Trần Đức Anh', location: "Ea H'Leo, Đắk Lắk", lat: 12.861, lng: 108.167, metrics: [{ label: 'Pest', value: 'CBB' }, { label: 'Severity', value: 'Low' }, { label: 'Treatment', value: 'Biological' }], details: { pestOrDisease: 'Coffee Berry Borer', severity: 'Low', treatment: 'Beauveria bassiana', outcome: 'Controlled' }, hash: '5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c' },
    { key: 'harvest', icon: '\u2702\uFE0F', nameEn: 'Harvest', status: 'completed', date: '2025-12-10T05:30:00+07:00', operator: 'Nguyễn Văn Minh', location: "Ea H'Leo, Đắk Lắk", lat: 12.862, lng: 108.168, metrics: [{ label: 'Cherry Wt', value: '8,450 kg' }, { label: 'Cup Score', value: '83.5' }, { label: 'Moisture', value: '62%' }], details: { batchId: 'TB-2026-DL-00847', cupScore: 83.5, moisture: 62, netWeight: 8450, harvestMethod: 'Selective picking', actualHarvestDate: '2025-12-10' }, hash: '6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d' },
    { key: 'procurement', icon: '\uD83D\uDE9B', nameEn: 'Procurement', status: 'completed', date: '2025-12-11T08:00:00+07:00', operator: 'Phạm Quốc Bảo', location: 'Buôn Ma Thuột, Đắk Lắk', lat: 12.668, lng: 108.038, metrics: [{ label: 'Price/kg', value: '42,000\u20AB' }, { label: 'Net Wt', value: '8,420 kg' }, { label: 'Payment', value: 'Paid' }], details: { collectionCentre: 'BMT Central Hub', pricePerKg: 42000, totalAmount: 353640000, paymentStatus: 'Paid', inputWeight: 8450, outputWeight: 8420 }, hash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e' },
    { key: 'processing', icon: '\uD83C\uDFED', nameEn: 'Processing', status: 'in_progress', date: '2025-12-14T07:00:00+07:00', operator: 'Cà Phê Đắk Lắk JSC', location: 'Industrial Zone, BMT', lat: 12.700, lng: 108.060, metrics: [{ label: 'Stage', value: 'Drying' }, { label: 'Outturn', value: '18.2%' }, { label: 'Moisture', value: '13.5%' }], details: { processType: 'Wet processing (Robusta)', currentStage: 'Drying', outturnRatio: 18.2, moistureContent: 13.5, grade: 'G2' }, hash: '8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f' },
    { key: 'sorting', icon: '\uD83D\uDD2C', nameEn: 'Sorting & Grading', status: 'pending', date: null, operator: '-', location: 'Industrial Zone, BMT', lat: 12.700, lng: 108.060, metrics: [{ label: 'Grade', value: '-' }, { label: 'Screen', value: '-' }, { label: 'Defects', value: '-' }], details: { grade: 'Pending', screen: 'Pending', defectCount: null, sortedBy: null }, hash: '9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a' },
    { key: 'export_prep', icon: '\uD83D\uDCE6', nameEn: 'Export Preparation', status: 'pending', date: null, operator: '-', location: 'HCMC Warehouse', lat: 10.823, lng: 106.630, metrics: [{ label: 'Lot', value: '-' }, { label: 'Bag Wt', value: '-' }, { label: 'Ready', value: '-' }], details: { lotNumber: null, bagsCount: null, warehouseLocation: 'Cat Lai Port Terminal', eudrStatus: 'Compliant' }, hash: '0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b' },
    { key: 'shipping', icon: '\uD83D\uDEA8', nameEn: 'Shipping', status: 'pending', date: null, operator: '-', location: 'Cat Lai Port', lat: 10.745, lng: 106.770, metrics: [{ label: 'Vessel', value: '-' }, { label: 'ETA', value: '-' }, { label: 'Port', value: '-' }], details: { vessel: null, containerNo: null, destination: null, blNumber: null }, hash: '1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c' },
    { key: 'quality_check', icon: '\u2705', nameEn: 'Quality Check', status: 'pending', date: null, operator: '-', location: 'Destination Lab', lat: 51.507, lng: -0.128, metrics: [{ label: 'Cup Score', value: '-' }, { label: 'Defects', value: '-' }, { label: 'Certified', value: '-' }], details: { cupScore: null, defectCount: null, certifiedBy: null, certificationType: null }, hash: '2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d' },
    { key: 'delivery', icon: '\uD83C\uDF89', nameEn: 'Final Delivery', status: 'pending', date: null, operator: '-', location: 'Roastery', lat: 51.507, lng: -0.128, metrics: [{ label: 'Received', value: '-' }, { label: 'Condition', value: '-' }, { label: 'Verified', value: '-' }], details: { receivedBy: null, condition: null, verified: false, deliveryDate: null }, hash: '3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e' },
  ],
}

// ─── Lookup: tenant country → batch data ────────────────────
const COUNTRY_BATCHES: Record<string, CountryTraceBatch> = {
  UG: UGANDA_BATCH,
  KE: KENYA_BATCH,
  ET: ETHIOPIA_BATCH,
  BR: BRAZIL_BATCH,
  GH: GHANA_BATCH,
  VN: VIETNAM_BATCH,
}

// Tenant slug → country code mapping (fallback when country code not available)
const TENANT_COUNTRY_MAP: Record<string, string> = {
  'metrang-coffee': 'VN',
  'cooxupe': 'BR',
  'yirgacheffe-union': 'ET',
  'othaya-cooperative': 'KE',
  'asunafo-export': 'GH',
  'nkusi-coffee': 'UG',
}

/**
 * Get traceability batch data for a tenant based on their country.
 * Falls back to Vietnam data if country not found.
 */
export function getTraceBatchForTenant(tenantSlug?: string, countryCode?: string): CountryTraceBatch {
  // Try country code first
  if (countryCode && COUNTRY_BATCHES[countryCode]) {
    return COUNTRY_BATCHES[countryCode]
  }
  // Try tenant slug
  if (tenantSlug) {
    const cc = TENANT_COUNTRY_MAP[tenantSlug]
    if (cc && COUNTRY_BATCHES[cc]) {
      return COUNTRY_BATCHES[cc]
    }
  }
  // Default to Vietnam
  return VIETNAM_BATCH
}



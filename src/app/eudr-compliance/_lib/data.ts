// ─── Types ───────────────────────────────────────────────────────

export interface EudrRecord {
  id: string; complianceId: string; batchId?: string; farmerId?: string; farmLandId?: string;
  status: string; riskLevel: string; deforestationRiskScore?: number;
  satelliteImageryRef?: string; geolocationLat?: number; geolocationLng?: number;
  landUseType?: string; landCoverChangeDate?: string;
  verificationDate?: string; verifiedBy?: string;
  dueDiligenceStatement?: string; tracesCertificateRef?: string;
  validFrom?: string; validUntil?: string;
  notes?: string; metadata?: any; createdAt: string;
  farmer?: { name: string }; farmLand?: { farmName: string };
}

export interface DeforestationAssessment {
  id: string; farmLandId: string; eudrComplianceId: string;
  assessmentDate: string; dataSource: string; provider: string;
  referencePeriodStart: string; referencePeriodEnd: string;
  forestCoverBaselinePct: number; currentForestCoverPct: number; forestLossPct: number;
  deforestationDetected: boolean; riskScore: number; riskCategory: string;
  imageryUrl: string; analysisReportUrl: string; methodology: string;
  confidenceLevel: number; validUntil: string;
}

export interface DDSRecord {
  id: string; complianceId: string; status: string;
  submittedDate: string; acceptedDate: string;
  tracesRef: string; documentUrl: string; notes: string;
}

// ─── Constants ───────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_review: 'bg-blue-100 text-blue-800 border-blue-200',
  compliant: 'bg-green-100 text-green-800 border-green-200',
  non_compliant: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
}

export const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

export const RISK_CHART_COLORS: Record<string, string> = {
  low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444',
}

export const STATUS_CHART_COLORS: Record<string, string> = {
  pending: '#eab308', in_review: '#3b82f6', compliant: '#22c55e',
  non_compliant: '#ef4444', expired: '#9ca3af',
}

export const DDS_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
}

// ─── Mock Data ───────────────────────────────────────────────────

export const MOCK_COMPLIANCE_RECORDS: EudrRecord[] = [
  {
    id: '1', complianceId: 'EUDR-2024-001', batchId: 'BATCH-LN-001', farmerId: 'F-001', farmLandId: 'FL-001',
    status: 'compliant', riskLevel: 'low', deforestationRiskScore: 12,
    satelliteImageryRef: 'SAT-GFW-2024-0401', geolocationLat: 11.9404, geolocationLng: 108.4584,
    landUseType: 'agroforestry', landCoverChangeDate: '2020-12-31',
    verificationDate: '2024-03-15', verifiedBy: 'Dr. Nguyen Van A',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-001.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00123',
    validFrom: '2024-03-15', validUntil: '2025-03-15',
    notes: 'Farm verified via satellite imagery. No deforestation detected since cutoff date.',
    metadata: { region: 'Lam Dong', elevation: 1200, farmSize: 2.5 },
    createdAt: '2024-02-01T10:00:00Z', farmer: { name: 'Nguyen Van Minh' }, farmLand: { farmName: 'Highland Plot A' },
  },
  {
    id: '2', complianceId: 'EUDR-2024-002', batchId: 'BATCH-LN-002', farmerId: 'F-002', farmLandId: 'FL-002',
    status: 'in_review', riskLevel: 'medium', deforestationRiskScore: 45,
    satelliteImageryRef: 'SAT-PLNT-2024-0412', geolocationLat: 11.9500, geolocationLng: 108.4700,
    landUseType: 'monoculture', landCoverChangeDate: '2021-03-15',
    verificationDate: '2024-04-01', verifiedBy: 'Dr. Le Thi B',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-002.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00124',
    validFrom: '2024-04-01', validUntil: '2025-04-01',
    notes: 'Minor land cover change detected near boundary. Under review for clarification.',
    metadata: { region: 'Dak Lak', elevation: 800, farmSize: 5.0 },
    createdAt: '2024-02-15T10:00:00Z', farmer: { name: 'Le Thi Hoa' }, farmLand: { farmName: 'Central Valley Plot' },
  },
  {
    id: '3', complianceId: 'EUDR-2024-003', batchId: 'BATCH-DK-001', farmerId: 'F-003', farmLandId: 'FL-003',
    status: 'non_compliant', riskLevel: 'critical', deforestationRiskScore: 88,
    satelliteImageryRef: 'SAT-SNTL-2024-0420', geolocationLat: 12.1000, geolocationLng: 108.5000,
    landUseType: 'cleared_land', landCoverChangeDate: '2022-06-10',
    verificationDate: '2024-04-10', verifiedBy: 'Dr. Tran Van C',
    dueDiligenceStatement: '',
    tracesCertificateRef: '',
    validFrom: '', validUntil: '',
    notes: 'Significant deforestation detected post cutoff. Non-compliant. Remediation plan required.',
    metadata: { region: 'Gia Lai', elevation: 600, farmSize: 8.0 },
    createdAt: '2024-03-01T10:00:00Z', farmer: { name: 'Tran Van Duc' }, farmLand: { farmName: 'Lowland Expansion' },
  },
  {
    id: '4', complianceId: 'EUDR-2024-004', batchId: 'BATCH-LN-003', farmerId: 'F-004', farmLandId: 'FL-004',
    status: 'compliant', riskLevel: 'low', deforestationRiskScore: 8,
    satelliteImageryRef: 'SAT-GFW-2024-0425', geolocationLat: 11.9300, geolocationLng: 108.4400,
    landUseType: 'shade_grown', landCoverChangeDate: '2019-01-01',
    verificationDate: '2024-04-20', verifiedBy: 'Dr. Pham Thi D',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-004.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00125',
    validFrom: '2024-04-20', validUntil: '2025-04-20',
    notes: 'Shade-grown coffee farm. Excellent forest cover. Fully compliant.',
    metadata: { region: 'Lam Dong', elevation: 1400, farmSize: 1.8 },
    createdAt: '2024-03-15T10:00:00Z', farmer: { name: 'Pham Thi Lan' }, farmLand: { farmName: 'Shade Garden B' },
  },
  {
    id: '5', complianceId: 'EUDR-2024-005', batchId: 'BATCH-DK-002', farmerId: 'F-005', farmLandId: 'FL-005',
    status: 'pending', riskLevel: 'high', deforestationRiskScore: 65,
    satelliteImageryRef: 'SAT-PLNT-2024-0430', geolocationLat: 12.0500, geolocationLng: 108.5200,
    landUseType: 'mixed_use', landCoverChangeDate: '2021-09-20',
    verificationDate: '', verifiedBy: '',
    dueDiligenceStatement: '',
    tracesCertificateRef: '',
    validFrom: '', validUntil: '',
    notes: 'Awaiting ground survey verification. Satellite data inconclusive.',
    metadata: { region: 'Dak Nong', elevation: 700, farmSize: 3.2 },
    createdAt: '2024-04-01T10:00:00Z', farmer: { name: 'Hoang Van Em' }, farmLand: { farmName: 'Mixed Plot C' },
  },
  {
    id: '6', complianceId: 'EUDR-2024-006', batchId: 'BATCH-LN-004', farmerId: 'F-006', farmLandId: 'FL-006',
    status: 'expired', riskLevel: 'medium', deforestationRiskScore: 35,
    satelliteImageryRef: 'SAT-GFW-2023-1201', geolocationLat: 11.9600, geolocationLng: 108.4600,
    landUseType: 'agroforestry', landCoverChangeDate: '2020-08-15',
    verificationDate: '2023-12-01', verifiedBy: 'Dr. Nguyen Van A',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-006.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2023/00098',
    validFrom: '2023-12-01', validUntil: '2024-12-01',
    notes: 'Compliance expired. Re-assessment scheduled for Q1 2025.',
    metadata: { region: 'Lam Dong', elevation: 1100, farmSize: 4.0 },
    createdAt: '2023-11-01T10:00:00Z', farmer: { name: 'Vo Thi Phuong' }, farmLand: { farmName: 'Hillside Plot D' },
  },
  {
    id: '7', complianceId: 'EUDR-2024-007', batchId: 'BATCH-GL-001', farmerId: 'F-007', farmLandId: 'FL-007',
    status: 'compliant', riskLevel: 'low', deforestationRiskScore: 5,
    satelliteImageryRef: 'SAT-SNTL-2024-0501', geolocationLat: 13.5000, geolocationLng: 109.0000,
    landUseType: 'shade_grown', landCoverChangeDate: '2018-06-01',
    verificationDate: '2024-05-01', verifiedBy: 'Dr. Pham Thi D',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-007.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00130',
    validFrom: '2024-05-01', validUntil: '2025-05-01',
    notes: 'Organic shade-grown farm. Zero deforestation risk.',
    metadata: { region: 'Gia Lai', elevation: 900, farmSize: 2.0 },
    createdAt: '2024-04-15T10:00:00Z', farmer: { name: 'Dinh Van Hao' }, farmLand: { farmName: 'Organic Plot E' },
  },
  {
    id: '8', complianceId: 'EUDR-2024-008', batchId: 'BATCH-DN-001', farmerId: 'F-008', farmLandId: 'FL-008',
    status: 'in_review', riskLevel: 'medium', deforestationRiskScore: 40,
    satelliteImageryRef: 'SAT-PLNT-2024-0510', geolocationLat: 12.2000, geolocationLng: 107.8000,
    landUseType: 'agroforestry', landCoverChangeDate: '2020-11-30',
    verificationDate: '2024-05-10', verifiedBy: 'Dr. Le Thi B',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-008.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00131',
    validFrom: '2024-05-10', validUntil: '2025-05-10',
    notes: 'Borderline risk score. Additional ground truth data being collected.',
    metadata: { region: 'Dak Nong', elevation: 750, farmSize: 3.5 },
    createdAt: '2024-04-20T10:00:00Z', farmer: { name: 'Bui Thi Mai' }, farmLand: { farmName: 'Borderline Plot F' },
  },
]

export const MOCK_DEFORESTATION_ASSESSMENTS: DeforestationAssessment[] = [
  {
    id: 'da1', farmLandId: 'FL-001', eudrComplianceId: '1',
    assessmentDate: '2024-03-10', dataSource: 'combined', provider: 'gfw',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-03-10',
    forestCoverBaselinePct: 78.5, currentForestCoverPct: 79.2, forestLossPct: -0.7,
    deforestationDetected: false, riskScore: 12, riskCategory: 'low',
    imageryUrl: 'https://sat.example.com/FL-001/2024', analysisReportUrl: '/reports/FL-001-2024.pdf',
    methodology: 'Hansen GFC + Planet NICFI', confidenceLevel: 0.95, validUntil: '2025-03-10',
  },
  {
    id: 'da2', farmLandId: 'FL-002', eudrComplianceId: '2',
    assessmentDate: '2024-03-25', dataSource: 'satellite', provider: 'planet',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-03-25',
    forestCoverBaselinePct: 65.0, currentForestCoverPct: 58.3, forestLossPct: 6.7,
    deforestationDetected: false, riskScore: 45, riskCategory: 'medium',
    imageryUrl: 'https://sat.example.com/FL-002/2024', analysisReportUrl: '/reports/FL-002-2024.pdf',
    methodology: 'Planet NICFI Basemap + Sentinel-2', confidenceLevel: 0.82, validUntil: '2025-03-25',
  },
  {
    id: 'da3', farmLandId: 'FL-003', eudrComplianceId: '3',
    assessmentDate: '2024-04-05', dataSource: 'combined', provider: 'sentinel',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-04-05',
    forestCoverBaselinePct: 72.0, currentForestCoverPct: 34.5, forestLossPct: 37.5,
    deforestationDetected: true, riskScore: 88, riskCategory: 'critical',
    imageryUrl: 'https://sat.example.com/FL-003/2024', analysisReportUrl: '/reports/FL-003-2024.pdf',
    methodology: 'Sentinel-2 + Ground Survey Verification', confidenceLevel: 0.98, validUntil: '2025-04-05',
  },
  {
    id: 'da4', farmLandId: 'FL-005', eudrComplianceId: '5',
    assessmentDate: '2024-04-15', dataSource: 'ground_survey', provider: 'gfw',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-04-15',
    forestCoverBaselinePct: 60.0, currentForestCoverPct: 48.2, forestLossPct: 11.8,
    deforestationDetected: true, riskScore: 65, riskCategory: 'high',
    imageryUrl: 'https://sat.example.com/FL-005/2024', analysisReportUrl: '/reports/FL-005-2024.pdf',
    methodology: 'GFW Alert + Field Verification', confidenceLevel: 0.88, validUntil: '2025-04-15',
  },
]

export const MOCK_DDS_RECORDS: DDSRecord[] = [
  { id: 'dds1', complianceId: 'EUDR-2024-001', status: 'accepted', submittedDate: '2024-03-16', acceptedDate: '2024-03-18', tracesRef: 'TRACES-NT/VN/2024/00123', documentUrl: '/docs/dds/EUDR-2024-001.pdf', notes: 'Auto-accepted via TRACES-NT. All checks passed.' },
  { id: 'dds2', complianceId: 'EUDR-2024-002', status: 'pending_review', submittedDate: '2024-04-02', acceptedDate: '', tracesRef: 'TRACES-NT/VN/2024/00124', documentUrl: '/docs/dds/EUDR-2024-002.pdf', notes: 'Under review by EU competent authority.' },
  { id: 'dds3', complianceId: 'EUDR-2024-003', status: 'rejected', submittedDate: '2024-04-11', acceptedDate: '', tracesRef: '', documentUrl: '', notes: 'Rejected: Non-compliant deforestation risk. Remediation required.' },
  { id: 'dds4', complianceId: 'EUDR-2024-004', status: 'accepted', submittedDate: '2024-04-21', acceptedDate: '2024-04-23', tracesRef: 'TRACES-NT/VN/2024/00125', documentUrl: '/docs/dds/EUDR-2024-004.pdf', notes: 'Accepted. Shade-grown farm with excellent compliance profile.' },
  { id: 'dds5', complianceId: 'EUDR-2024-005', status: 'draft', submittedDate: '', acceptedDate: '', tracesRef: '', documentUrl: '', notes: 'DDS in preparation. Awaiting assessment completion.' },
  { id: 'dds6', complianceId: 'EUDR-2024-007', status: 'accepted', submittedDate: '2024-05-02', acceptedDate: '2024-05-04', tracesRef: 'TRACES-NT/VN/2024/00130', documentUrl: '/docs/dds/EUDR-2024-007.pdf', notes: 'Organic farm. Fast-track acceptance.' },
  { id: 'dds7', complianceId: 'EUDR-2024-008', status: 'submitted', submittedDate: '2024-05-11', acceptedDate: '', tracesRef: 'TRACES-NT/VN/2024/00131', documentUrl: '/docs/dds/EUDR-2024-008.pdf', notes: 'Submitted to TRACES-NT. Awaiting review.' },
]

export const RISK_TREND_DATA = [
  { month: 'Sep 23', avgScore: 42, compliant: 55, total: 40 },
  { month: 'Oct 23', avgScore: 38, compliant: 60, total: 45 },
  { month: 'Nov 23', avgScore: 35, compliant: 65, total: 50 },
  { month: 'Dec 23', avgScore: 40, compliant: 58, total: 55 },
  { month: 'Jan 24', avgScore: 32, compliant: 68, total: 60 },
  { month: 'Feb 24', avgScore: 28, compliant: 72, total: 65 },
  { month: 'Mar 24', avgScore: 30, compliant: 70, total: 70 },
  { month: 'Apr 24', avgScore: 25, compliant: 75, total: 75 },
  { month: 'May 24', avgScore: 22, compliant: 78, total: 80 },
]

export const REGION_RISK_DATA = [
  { region: 'Lam Dong', avgRisk: 15, farms: 45, compliant: 42, color: '#22c55e' },
  { region: 'Dak Lak', avgRisk: 38, farms: 32, compliant: 22, color: '#eab308' },
  { region: 'Gia Lai', avgRisk: 52, farms: 28, compliant: 15, color: '#f97316' },
  { region: 'Dak Nong', avgRisk: 45, farms: 20, compliant: 12, color: '#f97316' },
  { region: 'Kon Tum', avgRisk: 22, farms: 15, compliant: 13, color: '#22c55e' },
]

// ─── Helper Functions ────────────────────────────────────────────

export function getRiskScoreColor(score?: number): string {
  if (!score) return 'text-gray-500'
  if (score > 70) return 'text-red-600'
  if (score > 40) return 'text-yellow-600'
  return 'text-green-600'
}

export function getRiskBarColor(score?: number): string {
  if (!score) return 'bg-gray-300'
  if (score > 70) return 'bg-red-500'
  if (score > 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

/** Look up a record by id from mock data */
export function getRecordById(id: string): EudrRecord | undefined {
  return MOCK_COMPLIANCE_RECORDS.find(r => r.id === id)
}

/** Get related assessments for a record */
export function getAssessmentsForRecord(id: string): DeforestationAssessment[] {
  return MOCK_DEFORESTATION_ASSESSMENTS.filter(a => a.eudrComplianceId === id)
}

/** Get related DDS records for a compliance ID */
export function getDDSForComplianceId(complianceId: string): DDSRecord[] {
  return MOCK_DDS_RECORDS.filter(d => d.complianceId === complianceId)
}

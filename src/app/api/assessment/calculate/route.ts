import { NextResponse } from 'next/server'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface AssessmentInput {
  entityType: 'producer' | 'aggregator' | 'exporter' | 'importer'
  countryCode: string
  exportsToEU: boolean
  annualVolumeTons: number
  hasGPSCoordinates: boolean
  hasDeforestationAssessment: boolean
  hasTraceabilityRecords: boolean
  hasCertifications: boolean
  hasDueDiligenceProcess: boolean
  supplierCount: number
}

interface CategoryScore {
  category: string
  label: string
  score: number
  maxScore: number
  status: 'excellent' | 'good' | 'moderate' | 'low' | 'critical'
  recommendation: string
}

interface AssessmentResult {
  totalScore: number
  maxScore: number
  readinessLevel: 'ready' | 'mostly_ready' | 'partially_ready' | 'needs_work' | 'not_ready'
  categories: CategoryScore[]
  overallRecommendation: string
  eudrImpactNote: string
  assessedAt: string
}

// ════════════════════════════════════════════════════════════════
// SCORE CALCULATIONS
// ════════════════════════════════════════════════════════════════

function getStatus(score: number, max: number): CategoryScore['status'] {
  const ratio = score / max
  if (ratio >= 0.9) return 'excellent'
  if (ratio >= 0.7) return 'good'
  if (ratio >= 0.5) return 'moderate'
  if (ratio >= 0.3) return 'low'
  return 'critical'
}

/**
 * Calculate EUDR Compliance Readiness (max 25 pts)
 *
 * Evaluates whether the entity has the fundamental requirements
 * for EUDR compliance: EU exports, due diligence process, and
 * deforestation risk assessment.
 */
function calcEudrReadiness(input: AssessmentInput): CategoryScore {
  let score = 0
  const maxScore = 25

  // Exporting to EU indicates direct EUDR applicability (5 pts)
  if (input.exportsToEU) {
    score += 5
  }

  // Having a due diligence statement process (10 pts)
  if (input.hasDueDiligenceProcess) {
    score += 10
  }

  // Having deforestation risk assessments (10 pts)
  if (input.hasDeforestationAssessment) {
    score += 10
  }

  return {
    category: 'eudr_readiness',
    label: 'EUDR Compliance Readiness',
    score,
    maxScore,
    status: getStatus(score, maxScore),
    recommendation: score >= 20
      ? 'Your EUDR compliance foundation is strong. Ensure your DDS process covers all required commodity types and is regularly updated.'
      : score >= 10
        ? 'You have some EUDR compliance elements in place. Prioritize establishing a formal due diligence statement process and deforestation risk assessment to avoid EU market access delays.'
        : input.exportsToEU
          ? 'CRITICAL: You export to the EU but lack key EUDR compliance capabilities. The EU Deforestation Regulation requires due diligence statements and deforestation risk assessments. Non-compliance risks market access denial and penalties.'
          : 'While you don\'t currently export to the EU, having these processes in place will prepare you for future market expansion and regulatory changes in other regions.',
  }
}

/**
 * Calculate Geospatial & Traceability Score (max 25 pts)
 *
 * GPS coordinates and traceability records are mandatory for
 * EUDR compliance — they prove the origin of coffee and
 * enable deforestation verification.
 */
function calcGeospatialTraceability(input: AssessmentInput): CategoryScore {
  let score = 0
  const maxScore = 25

  // GPS coordinates for farms (12 pts) — critical for EUDR
  if (input.hasGPSCoordinates) {
    score += 12
  }

  // Supply chain traceability records (13 pts)
  if (input.hasTraceabilityRecords) {
    score += 13
  }

  return {
    category: 'geospatial_traceability',
    label: 'Geospatial & Traceability',
    score,
    maxScore,
    status: getStatus(score, maxScore),
    recommendation: score >= 20
      ? 'Excellent geospatial and traceability coverage. Consider implementing polygon-level farm boundaries for even more precise deforestation monitoring.'
      : score >= 12
        ? 'You have some geospatial or traceability data. EUDR requires GPS coordinates for all production plots and full traceability from farm to export. Focus on closing the gaps.'
        : 'CRITICAL: EUDR mandates GPS coordinates for all coffee production locations and complete supply chain traceability. Without these, you cannot submit a valid due diligence statement. Start by mapping all farm plots with GPS.',
  }
}

/**
 * Calculate Certifications Score (max 15 pts)
 *
 * Certifications (organic, fairtrade, UTZ, Rainforest Alliance)
 * significantly strengthen EUDR compliance positions and buyer trust.
 */
function calcCertifications(input: AssessmentInput): CategoryScore {
  const maxScore = 15
  const score = input.hasCertifications ? 15 : 0

  return {
    category: 'certifications',
    label: 'Certifications & Standards',
    score,
    maxScore,
    status: getStatus(score, maxScore),
    recommendation: score === 15
      ? 'Your certifications strengthen your EUDR compliance position. Ensure all certifications remain active and consider adding Rainforest Alliance or UTZ if not already held.'
      : 'Certifications like Organic, Fair Trade, Rainforest Alliance, or UTZ significantly strengthen your EUDR compliance and buyer trust. Consider obtaining at least one major certification to improve market access.',
  }
}

/**
 * Calculate Supply Chain Complexity Score (max 15 pts)
 *
 * More suppliers increase compliance complexity. Organizations
 * with many suppliers need more robust traceability systems.
 */
function calcSupplyChainComplexity(input: AssessmentInput): CategoryScore {
  let score = 0
  const maxScore = 15

  // Scoring based on supplier count and entity type
  // Fewer suppliers = easier compliance = higher score
  // But having suppliers at all indicates operational scale
  if (input.supplierCount <= 10) {
    score += 10 // Small scale — easier to manage
  } else if (input.supplierCount <= 50) {
    score += 7 // Medium scale — manageable
  } else if (input.supplierCount <= 200) {
    score += 4 // Large scale — needs robust systems
  } else {
    score += 2 // Very large — significant compliance challenge
  }

  // Bonus for having traceability with many suppliers
  if (input.hasTraceabilityRecords && input.supplierCount > 50) {
    score += 5 // Traceability mitigates complexity risk
  } else if (input.hasTraceabilityRecords) {
    score += 3
  }

  // Bonus: entity type suitability
  if (input.entityType === 'producer' && input.supplierCount <= 10) {
    score += 2 // Producers with few suppliers are naturally compliant
  } else if (input.entityType === 'exporter' && input.hasTraceabilityRecords) {
    score += 2 // Exporters need traceability most
  }

  return {
    category: 'supply_chain_complexity',
    label: 'Supply Chain Management',
    score: Math.min(score, maxScore),
    maxScore,
    status: getStatus(Math.min(score, maxScore), maxScore),
    recommendation: input.supplierCount > 200
      ? 'With 200+ suppliers, you face significant EUDR compliance complexity. Invest in automated traceability systems and consider grouping suppliers into manageable clusters for due diligence reporting.'
      : input.supplierCount > 50
        ? 'Your supplier network requires systematic traceability management. Ensure each supplier\'s farm plot has GPS coordinates and deforestation-free verification.'
        : 'Your supply chain scale is manageable for EUDR compliance. Focus on ensuring complete GPS mapping and traceability records for all suppliers.',
  }
}

/**
 * Calculate Operational Scale Score (max 10 pts)
 *
 * Annual export volume and entity type indicate the scope
 * of compliance requirements.
 */
function calcOperationalScale(input: AssessmentInput): CategoryScore {
  let score = 0
  const maxScore = 10

  // Volume-based readiness
  if (input.annualVolumeTons > 0 && input.annualVolumeTons <= 100) {
    score += 6 // Small volume — less exposure
  } else if (input.annualVolumeTons <= 500) {
    score += 5 // Medium volume
  } else if (input.annualVolumeTons <= 2000) {
    score += 3 // Large volume — more scrutiny
  } else {
    score += 2 // Very large — highest scrutiny
  }

  // Entity type alignment with compliance
  if (input.entityType === 'exporter' && input.exportsToEU) {
    score += 4 // Direct EU exporter — knows requirements
  } else if (input.entityType === 'importer') {
    score += 4 // Importers drive compliance from EU side
  } else if (input.entityType === 'aggregator' && input.exportsToEU) {
    score += 3
  } else if (input.exportsToEU) {
    score += 2
  }

  return {
    category: 'operational_scale',
    label: 'Operational Scale & Alignment',
    score: Math.min(score, maxScore),
    maxScore,
    status: getStatus(Math.min(score, maxScore), maxScore),
    recommendation: input.annualVolumeTons > 2000
      ? 'Large-volume exporters face the highest EUDR scrutiny. Ensure every batch has complete traceability and deforestation-free verification documentation.'
      : input.annualVolumeTons > 500
        ? 'Your export volume places you in a moderate scrutiny category. Maintain comprehensive records for every shipment to the EU.'
        : 'Your operational scale is well-suited for streamlined EUDR compliance. Focus on quality of documentation over quantity.',
  }
}

/**
 * Calculate Data Readiness Score (max 10 pts)
 *
 * Overall data readiness — a meta-score based on how many
 * "yes" answers the entity provided.
 */
function calcDataReadiness(input: AssessmentInput): CategoryScore {
  const maxScore = 10
  const yesCount = [
    input.hasGPSCoordinates,
    input.hasDeforestationAssessment,
    input.hasTraceabilityRecords,
    input.hasCertifications,
    input.hasDueDiligenceProcess,
  ].filter(Boolean).length

  const score = Math.round((yesCount / 5) * maxScore)

  return {
    category: 'data_readiness',
    label: 'Data & Documentation Readiness',
    score,
    maxScore,
    status: getStatus(score, maxScore),
    recommendation: score >= 8
      ? 'Your data readiness is excellent. Maintain regular updates to all documentation and consider automating renewal tracking and compliance monitoring.'
      : score >= 4
        ? 'You have some data systems in place but gaps remain. Prioritize GPS mapping, deforestation assessments, and formalizing your due diligence process.'
        : 'Your data readiness needs significant improvement. Start by establishing GPS coordinates for all production locations, then build your traceability and due diligence documentation systematically.',
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN CALCULATION
// ════════════════════════════════════════════════════════════════

function calculateReadinessScore(input: AssessmentInput): AssessmentResult {
  const categories = [
    calcEudrReadiness(input),
    calcGeospatialTraceability(input),
    calcCertifications(input),
    calcSupplyChainComplexity(input),
    calcOperationalScale(input),
    calcDataReadiness(input),
  ]

  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0)
  const maxScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0)

  // Determine readiness level
  const ratio = totalScore / maxScore
  let readinessLevel: AssessmentResult['readinessLevel']
  if (ratio >= 0.8) readinessLevel = 'ready'
  else if (ratio >= 0.65) readinessLevel = 'mostly_ready'
  else if (ratio >= 0.45) readinessLevel = 'partially_ready'
  else if (ratio >= 0.25) readinessLevel = 'needs_work'
  else readinessLevel = 'not_ready'

  // Overall recommendation
  const criticalCategories = categories.filter(c => c.status === 'critical' || c.status === 'low')
  const strongCategories = categories.filter(c => c.status === 'excellent' || c.status === 'good')

  let overallRecommendation: string
  if (readinessLevel === 'ready') {
    overallRecommendation = 'Your organization is well-prepared for EUDR compliance. Focus on maintaining your current systems, ensuring documentation stays current, and preparing for potential audits. Consider implementing Terra Brew\'s automated compliance monitoring to maintain your readiness level.'
  } else if (readinessLevel === 'mostly_ready') {
    overallRecommendation = `You are close to EUDR readiness. Your strengths are in ${strongCategories.map(c => c.label.toLowerCase()).join(', ')}. Address the gaps in ${criticalCategories.length > 0 ? criticalCategories.map(c => c.label.toLowerCase()).join(', ') : 'the remaining categories'} to achieve full compliance. Terra Brew can help automate the missing pieces.`
  } else if (readinessLevel === 'partially_ready') {
    overallRecommendation = `You have significant compliance gaps that need attention before EUDR compliance can be achieved. Priority areas: ${criticalCategories.map(c => c.label.toLowerCase()).join(', ')}. We recommend starting with GPS mapping and due diligence process establishment. Terra Brew provides guided workflows for each step.`
  } else if (readinessLevel === 'needs_work') {
    overallRecommendation = `Your organization requires substantial preparation for EUDR compliance. Critical gaps exist in ${criticalCategories.map(c => c.label.toLowerCase()).join(', ')}. We strongly recommend a phased compliance program starting with fundamental traceability and due diligence processes. Terra Brew's onboarding wizard can guide you step by step.`
  } else {
    overallRecommendation = 'Your organization is not yet ready for EUDR compliance. Immediate action is required across all categories. We recommend starting with: (1) GPS mapping of all farm plots, (2) establishing a due diligence statement process, (3) conducting deforestation risk assessments, and (4) implementing supply chain traceability. Terra Brew provides a complete solution to address all these requirements.'
  }

  // EUDR impact note
  const eudrImpactNote = input.exportsToEU
    ? 'Your business exports to the EU, making EUDR compliance mandatory. The regulation requires due diligence statements, GPS-verified farm coordinates, and deforestation risk assessments for all coffee imports into the EU market. Non-compliance penalties include import refusal, fines up to 4% of EU turnover, and temporary exclusion from public procurement.'
    : 'While you don\'t currently export to the EU, many countries are adopting similar regulations. The UK Environment Act 2021, US Lacey Act amendments, and upcoming regulations in other markets follow similar principles. Preparing for EUDR compliance now positions you advantageously for these evolving requirements.'

  return {
    totalScore,
    maxScore,
    readinessLevel,
    categories,
    overallRecommendation,
    eudrImpactNote,
    assessedAt: new Date().toISOString(),
  }
}

// ════════════════════════════════════════════════════════════════
// API HANDLER
// ════════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    const body = await request.json() as AssessmentInput

    // Validate required fields
    const requiredFields: (keyof AssessmentInput)[] = [
      'entityType', 'countryCode', 'exportsToEU', 'annualVolumeTons',
      'hasGPSCoordinates', 'hasDeforestationAssessment', 'hasTraceabilityRecords',
      'hasCertifications', 'hasDueDiligenceProcess', 'supplierCount',
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        )
      }
    }

    // Validate entity type
    const validEntityTypes = ['producer', 'aggregator', 'exporter', 'importer']
    if (!validEntityTypes.includes(body.entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be one of: producer, aggregator, exporter, importer' },
        { status: 400 },
      )
    }

    // Validate numeric fields
    if (typeof body.annualVolumeTons !== 'number' || body.annualVolumeTons < 0) {
      return NextResponse.json(
        { error: 'Annual export volume must be a non-negative number' },
        { status: 400 },
      )
    }

    if (typeof body.supplierCount !== 'number' || body.supplierCount < 0 || !Number.isInteger(body.supplierCount)) {
      return NextResponse.json(
        { error: 'Supplier count must be a non-negative integer' },
        { status: 400 },
      )
    }

    const result = calculateReadinessScore(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Assessment calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate assessment. Please check your input data.' },
      { status: 500 },
    )
  }
}

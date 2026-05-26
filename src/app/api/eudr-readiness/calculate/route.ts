import { NextRequest, NextResponse } from 'next/server'

interface EudrReadinessAnswers {
  // Step 1: Company Info
  companyName: string
  role: string
  email: string
  country: string
  isEuImporter: boolean

  // Step 2: Supply Chain
  sourcesFromDeforestationRisk: 'yes' | 'no' | 'unsure'
  supplierCount: '1-10' | '11-50' | '50+'
  hasGpsCoordinates: 'yes' | 'no' | 'partial'
  hasDueDiligenceProcess: 'yes' | 'no'

  // Step 3: Current Compliance
  hasTracesNtRegistration: 'yes' | 'no'
  hasSatelliteMonitoring: 'yes' | 'no'
  farmLevelTraceability: 'yes' | 'no' | 'partial'
  certifications: string[]
}

interface Breakdown {
  traceability: number
  deforestation: number
  documentation: number
  certifications: number
}

interface CalculationResult {
  score: number
  breakdown: Breakdown
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

function calculateReadiness(answers: EudrReadinessAnswers): CalculationResult {
  // ─── Traceability (max 25) ───
  let traceability = 0
  // GPS coordinates: yes=15, partial=8, no=0
  if (answers.hasGpsCoordinates === 'yes') traceability += 15
  else if (answers.hasGpsCoordinates === 'partial') traceability += 8
  // Farm-level traceability: yes=10, partial=5, no=0
  if (answers.farmLevelTraceability === 'yes') traceability += 10
  else if (answers.farmLevelTraceability === 'partial') traceability += 5

  // ─── Deforestation Monitoring (max 25) ───
  let deforestation = 0
  // Satellite monitoring: yes=15, no=0
  if (answers.hasSatelliteMonitoring === 'yes') deforestation += 15
  // Deforestation risk awareness: yes=10, unsure=5, no=0
  if (answers.sourcesFromDeforestationRisk === 'yes') deforestation += 10
  else if (answers.sourcesFromDeforestationRisk === 'unsure') deforestation += 5

  // ─── Documentation (max 25) ───
  let documentation = 0
  // Due diligence process: yes=10, no=0
  if (answers.hasDueDiligenceProcess === 'yes') documentation += 10
  // TRACES-NT registration: yes=15, no=0
  if (answers.hasTracesNtRegistration === 'yes') documentation += 15

  // ─── Certifications (max 25) ───
  let certifications = 0
  const certs = answers.certifications || []
  // UTZ/Rainforest=10, Organic=8, Fair Trade=7 (capped at 25)
  if (certs.includes('utz_rainforest')) certifications += 10
  if (certs.includes('organic')) certifications += 8
  if (certs.includes('fair_trade')) certifications += 7
  certifications = Math.min(certifications, 25)

  const total = traceability + deforestation + documentation + certifications
  const score = Math.min(Math.max(total, 0), 100)

  // Risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (score >= 81) riskLevel = 'low'
  else if (score >= 61) riskLevel = 'medium'
  else if (score >= 41) riskLevel = 'high'
  else riskLevel = 'critical'

  // ─── Recommendations ───
  const recommendations: string[] = []

  if (traceability < 15) {
    if (answers.hasGpsCoordinates === 'no') {
      recommendations.push('Collect GPS coordinates for all supplier farms — this is mandatory under EUDR for geolocation verification of production plots.')
    } else if (answers.hasGpsCoordinates === 'partial') {
      recommendations.push('Complete GPS coordinate collection for all remaining suppliers. Even one missing plot can block compliance for an entire shipment.')
    }
    if (answers.farmLevelTraceability === 'no') {
      recommendations.push('Implement farm/plot-level traceability to track each coffee batch back to its exact origin. EUDR requires precise geolocation of production areas.')
    } else if (answers.farmLevelTraceability === 'partial') {
      recommendations.push('Extend farm-level traceability to cover your entire supply chain. Consider TerraBrew\'s traceability module for automated tracking.')
    }
  }

  if (deforestation < 15) {
    if (answers.hasSatelliteMonitoring === 'no') {
      recommendations.push('Deploy satellite deforestation monitoring to verify no forest clearance occurred after Dec 31, 2020 (EUDR cutoff date). This is a core compliance requirement.')
    }
    if (answers.sourcesFromDeforestationRisk === 'no') {
      recommendations.push('Assess your sourcing regions for deforestation risk. Countries like Brazil, Vietnam, Indonesia, and Ethiopia have designated high-risk zones under EUDR.')
    } else if (answers.sourcesFromDeforestationRisk === 'unsure') {
      recommendations.push('Conduct a deforestation risk assessment of your sourcing regions. The EU will classify countries/regions by risk level — knowing your exposure is critical.')
    }
  }

  if (documentation < 15) {
    if (answers.hasTracesNtRegistration === 'no') {
      recommendations.push('Register on TRACES-NT immediately. All EU importers must submit Due Diligence Statements through this platform before placing products on the EU market.')
    }
    if (answers.hasDueDiligenceProcess === 'no') {
      recommendations.push('Establish a formal Due Diligence process covering information collection, risk assessment, and risk mitigation — the three pillars required by EUDR Article 9.')
    }
  }

  if (certifications < 15) {
    const hasCerts = certs.length > 0 && !certs.includes('none')
    if (!hasCerts || certs.includes('none')) {
      recommendations.push('Encourage suppliers to obtain recognized certifications (UTZ/Rainforest Alliance, Organic, Fair Trade). Certified farms have higher baseline compliance and lower risk profiles.')
    } else {
      recommendations.push('Expand supplier certification coverage. While current certifications help, broader adoption strengthens your EUDR compliance position and reduces due diligence burden.')
    }
  }

  // Extra contextual recommendations
  if (answers.isEuImporter && answers.hasTracesNtRegistration === 'no') {
    recommendations.push('As an EU importer, TRACES-NT registration is not optional — it is legally required before placing any coffee on the EU market. Non-compliance can result in fines up to 4% of EU annual turnover.')
  }

  if (answers.supplierCount === '50+' && answers.hasGpsCoordinates !== 'yes') {
    recommendations.push('With 50+ suppliers, manual GPS collection is impractical. Consider TerraBrew\'s automated geolocation and supplier management tools to scale your compliance efforts.')
  }

  if (answers.sourcesFromDeforestationRisk === 'yes' && answers.hasSatelliteMonitoring === 'no') {
    recommendations.push('You source from deforestation-risk countries but lack satellite monitoring — this is a critical gap. EUDR requires evidence that sourced land was not deforested after Dec 31, 2020.')
  }

  // If score is high, add positive reinforcement
  if (score >= 81) {
    recommendations.push('Your supply chain shows strong EUDR readiness. Focus on maintaining documentation, monitoring for regulatory updates, and ensuring ongoing compliance across all suppliers.')
  }

  return {
    score,
    breakdown: { traceability, deforestation, documentation, certifications },
    recommendations,
    riskLevel,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EudrReadinessAnswers

    // Basic validation
    if (!body.companyName || !body.email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      )
    }

    const result = calculateReadiness(body)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

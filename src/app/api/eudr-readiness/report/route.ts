import { NextRequest, NextResponse } from 'next/server'

interface ReportRequest {
  companyName: string
  role: string
  email: string
  country: string
  isEuImporter: boolean
  sourcesFromDeforestationRisk: string
  supplierCount: string
  hasGpsCoordinates: string
  hasDueDiligenceProcess: string
  hasTracesNtRegistration: string
  hasSatelliteMonitoring: string
  farmLevelTraceability: string
  certifications: string[]
  score: number
  breakdown: {
    traceability: number
    deforestation: number
    documentation: number
    certifications: number
  }
  recommendations: string[]
  riskLevel: string
}

function getScoreColor(score: number): string {
  if (score <= 40) return '#dc2626'
  if (score <= 60) return '#d97706'
  if (score <= 80) return '#0d9488'
  return '#16a34a'
}

function getScoreLabel(score: number): string {
  if (score <= 40) return 'Not Ready'
  if (score <= 60) return 'Needs Work'
  if (score <= 80) return 'Mostly Ready'
  return 'Ready'
}

function getRiskLabel(risk: string): string {
  switch (risk) {
    case 'low': return 'Low Risk'
    case 'medium': return 'Medium Risk'
    case 'high': return 'High Risk'
    case 'critical': return 'Critical Risk'
    default: return 'Unknown'
  }
}

function formatAnswer(value: string | string[] | boolean): string {
  if (Array.isArray(value)) {
    if (value.length === 0 || (value.length === 1 && value[0] === 'none')) return 'None'
    return value.map(v => v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(', ')
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === 'yes') return 'Yes'
  if (value === 'no') return 'No'
  if (value === 'partial') return 'Partial'
  if (value === 'unsure') return 'Unsure'
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReportRequest

    if (!body.companyName || !body.score) {
      return NextResponse.json(
        { error: 'Company name and score are required' },
        { status: 400 }
      )
    }

    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const scoreColor = getScoreColor(body.score)
    const scoreLabel = getScoreLabel(body.score)

    const breakdownItems = [
      { name: 'Traceability', score: body.breakdown.traceability, max: 25, color: '#6D2932' },
      { name: 'Deforestation Monitoring', score: body.breakdown.deforestation, max: 25, color: '#0d9488' },
      { name: 'Documentation', score: body.breakdown.documentation, max: 25, color: '#d97706' },
      { name: 'Certifications', score: body.breakdown.certifications, max: 25, color: '#16a34a' },
    ]

    const supplyChainAnswers = [
      { q: 'Sources from deforestation-risk countries?', a: formatAnswer(body.sourcesFromDeforestationRisk) },
      { q: 'Number of suppliers', a: formatAnswer(body.supplierCount) },
      { q: 'GPS coordinates for supplier farms?', a: formatAnswer(body.hasGpsCoordinates) },
      { q: 'Due diligence process in place?', a: formatAnswer(body.hasDueDiligenceProcess) },
    ]

    const complianceAnswers = [
      { q: 'TRACES-NT registration?', a: formatAnswer(body.hasTracesNtRegistration) },
      { q: 'Satellite deforestation monitoring?', a: formatAnswer(body.hasSatelliteMonitoring) },
      { q: 'Farm/plot-level traceability?', a: formatAnswer(body.farmLevelTraceability) },
      { q: 'Supplier certifications', a: formatAnswer(body.certifications) },
    ]

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EUDR Readiness Assessment Report — ${body.companyName}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #2d1f1f;
      line-height: 1.6;
      background: #fff;
    }
    .report { max-width: 800px; margin: 0 auto; padding: 40px; }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #6D2932;
      padding-bottom: 20px;
      margin-bottom: 32px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon {
      width: 44px; height: 44px; background: #6D2932; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 20px; font-weight: bold;
    }
    .brand-name { font-size: 22px; font-weight: 700; color: #6D2932; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #8b7054; letter-spacing: 1px; text-transform: uppercase; }
    .report-date { text-align: right; font-size: 13px; color: #8b7054; }
    .report-date strong { color: #2d1f1f; }

    /* Title */
    .title-section { text-align: center; margin-bottom: 36px; }
    .title-section h1 { font-size: 28px; color: #6D2932; margin-bottom: 4px; }
    .title-section p { color: #8b7054; font-size: 14px; }

    /* Score Card */
    .score-card {
      background: linear-gradient(135deg, #f8f3ed 0%, #e8d8c4 100%);
      border-radius: 16px; padding: 36px; text-align: center;
      margin-bottom: 32px; border: 1px solid #e8d8c4;
    }
    .score-circle {
      width: 140px; height: 140px; border-radius: 50%; margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
      border: 6px solid ${scoreColor}; background: white;
      box-shadow: 0 0 0 6px ${scoreColor}22;
    }
    .score-number { font-size: 48px; font-weight: 800; color: ${scoreColor}; line-height: 1; }
    .score-of { font-size: 14px; color: #8b7054; }
    .score-label {
      font-size: 18px; font-weight: 700; color: ${scoreColor};
      margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;
    }
    .risk-badge {
      display: inline-block; margin-top: 8px; padding: 4px 16px;
      border-radius: 20px; font-size: 12px; font-weight: 600;
      background: ${scoreColor}18; color: ${scoreColor};
    }

    /* Company Info */
    .company-info {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      margin-bottom: 32px; padding: 20px; background: #f8f3ed;
      border-radius: 12px;
    }
    .company-info .label { font-size: 11px; color: #8b7054; text-transform: uppercase; letter-spacing: 0.5px; }
    .company-info .value { font-size: 14px; font-weight: 600; color: #2d1f1f; }

    /* Breakdown */
    .breakdown { margin-bottom: 32px; }
    .breakdown h2 { font-size: 18px; color: #6D2932; margin-bottom: 16px; }
    .breakdown-item {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 12px; padding: 12px 16px; background: #fafafa;
      border-radius: 10px; border-left: 4px solid;
    }
    .breakdown-item .name { flex: 1; font-weight: 600; font-size: 14px; }
    .breakdown-item .bar-track { width: 120px; height: 8px; background: #e8d8c4; border-radius: 4px; overflow: hidden; }
    .breakdown-item .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .breakdown-item .score-text { font-size: 14px; font-weight: 700; min-width: 50px; text-align: right; }

    /* Answers Tables */
    .answers-section { margin-bottom: 32px; }
    .answers-section h2 { font-size: 18px; color: #6D2932; margin-bottom: 12px; }
    .answers-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .answers-table td {
      padding: 10px 12px; border-bottom: 1px solid #e8d8c4;
    }
    .answers-table td:first-child { color: #8b7054; width: 60%; }
    .answers-table td:last-child { font-weight: 600; color: #2d1f1f; }

    /* Recommendations */
    .recommendations { margin-bottom: 36px; }
    .recommendations h2 { font-size: 18px; color: #6D2932; margin-bottom: 12px; }
    .rec-item {
      padding: 12px 16px; margin-bottom: 8px; background: #f8f3ed;
      border-radius: 10px; border-left: 4px solid #6D2932;
      font-size: 13px; line-height: 1.5;
    }

    /* Footer */
    .footer {
      border-top: 2px solid #e8d8c4; padding-top: 20px; margin-top: 40px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-size: 14px; font-weight: 700; color: #6D2932; }
    .footer-text { font-size: 11px; color: #8b7054; max-width: 400px; text-align: right; line-height: 1.4; }
    .footer-disclaimer {
      margin-top: 16px; padding: 12px; background: #faf5f0;
      border-radius: 8px; font-size: 11px; color: #8b7054; line-height: 1.5;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .report { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="report">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="brand-icon">TB</div>
        <div>
          <div class="brand-name">TerraBrew</div>
          <div class="brand-sub">Coffee Compliance Platform</div>
        </div>
      </div>
      <div class="report-date">
        <strong>Assessment Date</strong><br />${date}
      </div>
    </div>

    <!-- Title -->
    <div class="title-section">
      <h1>EUDR Readiness Assessment Report</h1>
      <p>EU Deforestation Regulation Compliance Evaluation</p>
    </div>

    <!-- Score Card -->
    <div class="score-card">
      <div class="score-circle">
        <div>
          <div class="score-number">${body.score}</div>
          <div class="score-of">/ 100</div>
        </div>
      </div>
      <div class="score-label">${scoreLabel}</div>
      <div class="risk-badge">${getRiskLabel(body.riskLevel)}</div>
    </div>

    <!-- Company Info -->
    <div class="company-info">
      <div><div class="label">Company</div><div class="value">${body.companyName}</div></div>
      <div><div class="label">Role</div><div class="value">${formatAnswer(body.role)}</div></div>
      <div><div class="label">Country</div><div class="value">${formatAnswer(body.country)}</div></div>
      <div><div class="label">EU Importer</div><div class="value">${body.isEuImporter ? 'Yes' : 'No'}</div></div>
    </div>

    <!-- Breakdown -->
    <div class="breakdown">
      <h2>Score Breakdown</h2>
      ${breakdownItems.map(item => `
      <div class="breakdown-item" style="border-left-color: ${item.color}">
        <span class="name">${item.name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(item.score / item.max) * 100}%; background: ${item.color};"></div>
        </div>
        <span class="score-text" style="color: ${item.color}">${item.score}/${item.max}</span>
      </div>`).join('')}
    </div>

    <!-- Supply Chain Answers -->
    <div class="answers-section">
      <h2>Supply Chain Assessment</h2>
      <table class="answers-table">
        ${supplyChainAnswers.map(a => `
        <tr><td>${a.q}</td><td>${a.a}</td></tr>`).join('')}
      </table>
    </div>

    <!-- Compliance Answers -->
    <div class="answers-section">
      <h2>Current Compliance Status</h2>
      <table class="answers-table">
        ${complianceAnswers.map(a => `
        <tr><td>${a.q}</td><td>${a.a}</td></tr>`).join('')}
      </table>
    </div>

    <!-- Recommendations -->
    <div class="recommendations">
      <h2>Recommendations</h2>
      ${body.recommendations.map((rec: string) => `<div class="rec-item">${rec}</div>`).join('')}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">TerraBrew Coffee Compliance Platform</div>
      <div class="footer-text">
        This assessment is for informational purposes only and does not constitute legal advice.
        Consult a compliance expert for binding guidance.
      </div>
    </div>
    <div class="footer-disclaimer">
      <strong>Disclaimer:</strong> This readiness assessment provides a preliminary evaluation based on your self-reported answers.
      It does not guarantee EUDR compliance. The EU Deforestation Regulation (Regulation 2023/1115) requires comprehensive
      due diligence, including geolocation data, risk assessment, and submission through TRACES-NT.
      TerraBrew recommends engaging qualified compliance professionals for formal assessment and implementation.
    </div>
  </div>
</body>
</html>`

    return NextResponse.json({ html })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

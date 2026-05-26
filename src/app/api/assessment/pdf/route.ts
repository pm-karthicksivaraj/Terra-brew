import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

// ════════════════════════════════════════════════════════════════
// TYPES (mirrors assessment/calculate/route.ts)
// ════════════════════════════════════════════════════════════════

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
// COLORS — TerraBrew palette
// ════════════════════════════════════════════════════════════════

const COLORS = {
  primary: '#561C24',
  secondary: '#6D2932',
  accent: '#C7B7A3',
  light: '#E8D8C4',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#666666',
  lightGray: '#F5F0EB',
  statusExcellent: '#16A34A',
  statusGood: '#65A30D',
  statusModerate: '#CA8A04',
  statusLow: '#EA580C',
  statusCritical: '#DC2626',
}

function getStatusColor(status: CategoryScore['status']): string {
  switch (status) {
    case 'excellent': return COLORS.statusExcellent
    case 'good': return COLORS.statusGood
    case 'moderate': return COLORS.statusModerate
    case 'low': return COLORS.statusLow
    case 'critical': return COLORS.statusCritical
  }
}

function getReadinessLabel(level: AssessmentResult['readinessLevel']): string {
  switch (level) {
    case 'ready': return 'Ready'
    case 'mostly_ready': return 'Mostly Ready'
    case 'partially_ready': return 'Partially Ready'
    case 'needs_work': return 'Needs Work'
    case 'not_ready': return 'Not Ready'
  }
}

// ════════════════════════════════════════════════════════════════
// PDF GENERATION
// ════════════════════════════════════════════════════════════════

function generatePDF(result: AssessmentResult): Readable {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 60, bottom: 60, left: 50, right: 50 },
    info: {
      Title: 'EUDR Readiness Assessment Report',
      Author: 'TerraBrew Coffee Traceability Platform',
      Subject: `EUDR Compliance Assessment - ${getReadinessLabel(result.readinessLevel)}`,
      CreationDate: new Date(result.assessedAt),
    },
  })

  const stream = new Readable({
    read() {},
  })

  // Pipe PDF output to our stream
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  doc.on('end', () => {
    stream.push(Buffer.concat(chunks))
    stream.push(null)
  })

  // Register fonts — DejaVu supports Latin + Vietnamese diacritics
  const fontRegular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
  const fontBold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

  doc.registerFont('Regular', fontRegular)
  doc.registerFont('Bold', fontBold)

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const leftMargin = doc.page.margins.left

  // ─── HEADER BAR ───────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 120).fill(COLORS.primary)

  doc.font('Bold').fontSize(24).fillColor(COLORS.white)
  doc.text('TerraBrew', leftMargin, 30, { width: pageWidth })

  doc.font('Regular').fontSize(11).fillColor(COLORS.accent)
  doc.text('Coffee Traceability Platform', leftMargin, 58, { width: pageWidth })

  doc.font('Bold').fontSize(16).fillColor(COLORS.light)
  doc.text('EUDR Readiness Assessment Report', leftMargin, 85, { width: pageWidth })

  // ─── SCORE SECTION ─────────────────────────────────────────────
  let y = 145

  // Score circle
  const scorePercent = Math.round((result.totalScore / result.maxScore) * 100)
  const scoreColor = getStatusColor(
    scorePercent >= 80 ? 'excellent' :
    scorePercent >= 65 ? 'good' :
    scorePercent >= 45 ? 'moderate' :
    scorePercent >= 25 ? 'low' : 'critical'
  )

  doc.font('Bold').fontSize(48).fillColor(scoreColor)
  doc.text(`${scorePercent}`, leftMargin, y, { width: 80, align: 'center' })

  doc.font('Regular').fontSize(10).fillColor(COLORS.gray)
  doc.text('out of 100', leftMargin, y + 50, { width: 80, align: 'center' })

  // Readiness level + date
  const readinessLabel = getReadinessLabel(result.readinessLevel)
  doc.font('Bold').fontSize(20).fillColor(scoreColor)
  doc.text(readinessLabel, leftMargin + 95, y + 5, { width: pageWidth - 95 })

  const assessedDate = new Date(result.assessedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  doc.font('Regular').fontSize(9).fillColor(COLORS.gray)
  doc.text(`Assessed: ${assessedDate}`, leftMargin + 95, y + 30, { width: pageWidth - 95 })

  // Score summary bar
  y += 75
  doc.rect(leftMargin, y, pageWidth, 8).fill(COLORS.lightGray)
  const barWidth = (result.totalScore / result.maxScore) * pageWidth
  doc.rect(leftMargin, y, barWidth, 8).fill(scoreColor)

  y += 30

  // ─── CATEGORY BREAKDOWN ────────────────────────────────────────
  doc.font('Bold').fontSize(14).fillColor(COLORS.primary)
  doc.text('Category Breakdown', leftMargin, y, { width: pageWidth })
  y += 25

  for (const cat of result.categories) {
    // Category header
    const catColor = getStatusColor(cat.status)
    const catPercent = Math.round((cat.score / cat.maxScore) * 100)

    // Category row background (alternating)
    doc.rect(leftMargin, y - 3, pageWidth, 50).fill(COLORS.lightGray).fillOpacity(0.3).fillOpacity(1)

    // Status dot
    doc.circle(leftMargin + 8, y + 8, 4).fill(catColor)

    // Category name
    doc.font('Bold').fontSize(10).fillColor(COLORS.black)
    doc.text(cat.label, leftMargin + 20, y, { width: pageWidth - 120 })

    // Score
    doc.font('Bold').fontSize(11).fillColor(catColor)
    doc.text(`${cat.score}/${cat.maxScore}`, leftMargin + pageWidth - 80, y, { width: 70, align: 'right' })

    // Progress bar
    y += 17
    doc.rect(leftMargin + 20, y, pageWidth - 110, 5).fill(COLORS.lightGray)
    const catBarWidth = (cat.score / cat.maxScore) * (pageWidth - 110)
    doc.rect(leftMargin + 20, y, catBarWidth, 5).fill(catColor)

    // Status label
    y += 10
    doc.font('Regular').fontSize(8).fillColor(COLORS.gray)
    doc.text(cat.status.charAt(0).toUpperCase() + cat.status.slice(1), leftMargin + 20, y)

    y += 20
  }

  // ─── EUDR IMPACT NOTE ─────────────────────────────────────────
  y += 10
  doc.rect(leftMargin, y, pageWidth, 2).fill(COLORS.accent)
  y += 15

  doc.font('Bold').fontSize(12).fillColor(COLORS.primary)
  doc.text('EUDR Impact', leftMargin, y, { width: pageWidth })
  y += 20

  doc.font('Regular').fontSize(9).fillColor(COLORS.black)
  y = doc.text(result.eudrImpactNote, leftMargin, y, { width: pageWidth, lineGap: 3 }) + 15

  // ─── OVERALL RECOMMENDATION ────────────────────────────────────
  y += 10
  doc.rect(leftMargin, y - 5, pageWidth, 2).fill(COLORS.accent)
  y += 10

  doc.font('Bold').fontSize(12).fillColor(COLORS.primary)
  doc.text('Recommendation', leftMargin, y, { width: pageWidth })
  y += 20

  doc.font('Regular').fontSize(9).fillColor(COLORS.black)
  y = doc.text(result.overallRecommendation, leftMargin, y, { width: pageWidth, lineGap: 3 }) + 15

  // ─── CATEGORY RECOMMENDATIONS ──────────────────────────────────
  if (y > 650) {
    doc.addPage()
    y = 60
  }

  doc.font('Bold').fontSize(12).fillColor(COLORS.primary)
  doc.text('Detailed Recommendations', leftMargin, y, { width: pageWidth })
  y += 20

  for (const cat of result.categories) {
    if (y > 720) {
      doc.addPage()
      y = 60
    }

    const catColor = getStatusColor(cat.status)

    doc.circle(leftMargin + 4, y + 5, 3).fill(catColor)

    doc.font('Bold').fontSize(9).fillColor(COLORS.black)
    doc.text(cat.label, leftMargin + 14, y, { width: pageWidth - 14 })
    y += 14

    doc.font('Regular').fontSize(8).fillColor(COLORS.gray)
    y = doc.text(cat.recommendation, leftMargin + 14, y, { width: pageWidth - 14, lineGap: 2 }) + 12
  }

  // ─── FOOTER ────────────────────────────────────────────────────
  const footerY = doc.page.height - 45
  doc.rect(0, footerY - 5, doc.page.width, 50).fill(COLORS.lightGray)

  doc.font('Regular').fontSize(7).fillColor(COLORS.gray)
  doc.text(
    'This assessment was generated by TerraBrew Coffee Traceability Platform. Results are based on self-reported data and should be validated with professional compliance advice.',
    leftMargin, footerY, { width: pageWidth, align: 'center' }
  )
  doc.text(
    `Report ID: EUDR-${Date.now().toString(36).toUpperCase()} | Generated: ${assessedDate}`,
    leftMargin, footerY + 12, { width: pageWidth, align: 'center' }
  )

  doc.end()
  return stream
}

// ════════════════════════════════════════════════════════════════
// API HANDLER
// ════════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    const body = await request.json() as AssessmentResult

    // Validate essential fields
    if (!body.totalScore || !body.maxScore || !body.categories || !body.readinessLevel) {
      return NextResponse.json(
        { error: 'Missing required assessment result fields' },
        { status: 400 },
      )
    }

    // Validate categories array
    if (!Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json(
        { error: 'Categories must be a non-empty array' },
        { status: 400 },
      )
    }

    const pdfStream = generatePDF(body)
    const chunks: Buffer[] = []

    return new Promise<Response>((resolve) => {
      pdfStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      pdfStream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(new Response(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="EUDR-Readiness-Assessment-${new Date().toISOString().split('T')[0]}.pdf"`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        }))
      })
      pdfStream.on('error', (err: Error) => {
        console.error('PDF generation error:', err)
        resolve(NextResponse.json(
          { error: 'Failed to generate PDF report' },
          { status: 500 },
        ))
      })
    })
  } catch (error) {
    console.error('PDF API error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment data' },
      { status: 500 },
    )
  }
}

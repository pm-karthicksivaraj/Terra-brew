const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents, LevelFormat,
} = require("docx");
const fs = require("fs");

// ── Palette: GO-1 Graphite Orange (proposal/plan) ──
const P = {
  primary: "1A2330",
  body: "000000",
  secondary: "607080",
  accent: "D4875A",
  surface: "F8F0EB",
};
const cv = (hex) => hex.replace("#", "");

// ── Cover palette (GO-1 dark mode) ──
const CP = {
  bg: "1A2330",
  titleColor: "FFFFFF",
  subtitleColor: "B0B8C0",
  metaColor: "90989F",
  footerColor: "687078",
  accent: "D4875A",
};

// ── Table palette ──
const TP = {
  headerBg: "D4875A",
  headerText: "FFFFFF",
  accentLine: "D4875A",
  innerLine: "DDD0C8",
  surface: "F8F0EB",
};

// ── Borders ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Helper: heading ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: { ascii: "Times New Roman" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: { ascii: "Times New Roman" } })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: P.primary, font: { ascii: "Times New Roman" } })],
  });
}

// ── Helper: body paragraph ──
function p(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman" } })],
  });
}

// ── Helper: bold + normal runs in one paragraph ──
function pRuns(runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    ...opts,
    children: runs.map(r =>
      new TextRun({ size: 24, color: P.body, font: { ascii: "Times New Roman" }, ...r })
    ),
  });
}

// ── Helper: bullet ──
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman" } })],
  });
}

// ── Helper: bold bullet ──
function bBullet(boldText, normalText, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({ text: boldText, bold: true, size: 24, color: P.body, font: { ascii: "Times New Roman" } }),
      new TextRun({ text: normalText, size: 24, color: P.body, font: { ascii: "Times New Roman" } }),
    ],
  });
}

// ── Helper: table ──
function makeTable(headers, rows, colWidths) {
  const cellMargins = { top: 60, bottom: 60, left: 120, right: 120 };
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: TP.accentLine },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: TP.accentLine },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: TP.innerLine },
    insideVertical: { style: BorderStyle.NONE },
  };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) =>
          new TableCell({
            width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
            shading: { type: ShadingType.CLEAR, fill: TP.headerBg },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, color: TP.headerText, font: { ascii: "Times New Roman" } })] })],
          })
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, ci) =>
            new TableCell({
              width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
              shading: ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: TP.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
              margins: cellMargins,
              children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 21, color: P.body, font: { ascii: "Times New Roman" } })] })],
            })
          ),
        })
      ),
    ],
  });
}

// ── calcTitleLayout for cover ──
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 12; // English chars ~ half CJK
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    lines = splitTitleLines(title, charsPerLine(minPt));
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([...' -_/:;,&', ...' \t']);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, metaLineCount = 0, fixedHeight = 2000, pageHeight = 16838 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - SAFETY - fixedHeight;
  const titleBlockHeight = titleLineCount * Math.ceil(titlePt * 23);
  const subtitleHeight = hasSubtitle ? 400 : 0;
  const metaHeight = metaLineCount * 280;
  const contentHeight = titleBlockHeight + subtitleHeight + metaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const topSpacing = Math.max(remainingSpace * 0.35, 600);
  const midSpacing = Math.max(remainingSpace * 0.1, 100);
  const bottomSpacing = Math.max(remainingSpace * 0.2, 200);
  return { topSpacing, midSpacing, bottomSpacing };
}

// ── Cover (R4: Top Color Block) ──
function buildCover(config) {
  const maxWidth = 11906 - 1701 - 1417; // A4 width - margins
  const { titlePt, titleLines } = calcTitleLayout(config.title, maxWidth, 40, 28);
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length,
    titlePt,
    hasSubtitle: !!config.subtitle,
    metaLineCount: config.metaLines ? config.metaLines.length : 0,
  });

  const children = [];

  // Top color block
  const topBlockHeight = 3200;
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [
        new TableRow({
          height: { value: topBlockHeight, rule: "exact" },
          children: [
            new TableCell({
              verticalAlign: "top",
              shading: { type: ShadingType.CLEAR, fill: CP.bg },
              margins: { left: 1200, right: 1200, top: 0, bottom: 0 },
              children: [
                new Paragraph({
                  spacing: { before: 1200, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
                  children: titleLines.map((line, i) =>
                    new TextRun({
                      text: i > 0 ? ` ${line}` : line,
                      bold: true,
                      size: titlePt * 2,
                      color: CP.titleColor,
                      font: { ascii: "Times New Roman" },
                    })
                  ),
                }),
                ...(config.subtitle
                  ? [
                      new Paragraph({
                        spacing: { before: 200, after: 100, line: 400, lineRule: "atLeast" },
                        children: [new TextRun({ text: config.subtitle, size: 26, color: CP.subtitleColor, font: { ascii: "Times New Roman" } })],
                      }),
                    ]
                  : []),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Accent line
  children.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      indent: { left: 1200, right: 1200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: CP.accent, space: 4 } },
      children: [],
    })
  );

  // Meta info section
  if (config.metaLines && config.metaLines.length > 0) {
    config.metaLines.forEach((line, i) => {
      children.push(
        new Paragraph({
          spacing: { before: i === 0 ? 400 : 120, after: 80, line: 312 },
          indent: { left: 1200 },
          children: [new TextRun({ text: line, size: 22, color: CP.metaColor, font: { ascii: "Times New Roman" } })],
        })
      );
    });
  }

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 1600 },
      indent: { left: 1200 },
      children: [new TextRun({ text: config.footer || "", size: 20, color: CP.footerColor, font: { ascii: "Times New Roman" } })],
    })
  );

  return children;
}

// ═══════════════════════════════════════════════════════════════
// ── DOCUMENT CONTENT ──
// ═══════════════════════════════════════════════════════════════

const coverConfig = {
  title: "Terra Brew Strategic Repositioning Plan",
  subtitle: "From Traceability Tool to EUDR Compliance Operating System for Coffee Trade",
  metaLines: [
    "Prepared by: Terra Brew Product Team",
    "Date: May 2026",
    "Classification: Internal Strategy",
    "Version: 1.0",
  ],
  footer: "Terra Brew  |  Confidential  |  2026",
};

const bodyChildren = [];

// ────────────────────────────────────────
// 1. EXECUTIVE SUMMARY
// ────────────────────────────────────────
bodyChildren.push(h1("1. Executive Summary"));

bodyChildren.push(p(
  "Terra Brew has built an enterprise-grade, multi-tenant platform covering 35 modules across the entire coffee supply chain, from farm-level data capture to cross-border trade settlement. The technical architecture is sound: 7 entity types, 8 role-based access levels, blockchain audit trails, EUDR compliance, and 5-language internationalization. No competitor in the coffee traceability space has built anything this comprehensive."
));

bodyChildren.push(p(
  "However, the current product suffers from a critical positioning problem. It presents itself as a 'coffee traceability platform' which sounds indistinguishable from dozens of competitors. The messaging leads with architecture ('7 entity types, 35 modules, role-based access') rather than the business pain that drives adoption: EUDR compliance penalties. The user experience exposes all 35 modules upfront, creating cognitive overload for buyers who simply need to know: 'Will this keep me compliant and operational?'"
));

bodyChildren.push(pRuns([
  { text: "This document proposes a strategic repositioning: ", bold: false },
  { text: "Terra Brew is not a traceability tool. It is the EUDR Compliance and Supply Chain Operating System for Coffee Trade.", bold: true },
  { text: " This repositioning compresses 35 modules into 5 intuitive value buckets, makes EUDR the hero entry point, and restructures every user journey around the question buyers actually ask: 'How does this protect my business?'", bold: false },
]));

bodyChildren.push(p(
  "The repositioning does not remove any features or require re-architecture. It changes how features are presented, navigated, and sold. The underlying 45-model schema and 35 modules remain intact, but users discover them progressively as their needs grow, rather than being overwhelmed on day one."
));

// ────────────────────────────────────────
// 2. CURRENT STATE ANALYSIS
// ────────────────────────────────────────
bodyChildren.push(h1("2. Current State: What We Built vs. What We Should Sell"));

bodyChildren.push(h2("2.1 What We Built (Technical Reality)"));

bodyChildren.push(p(
  "The platform covers the complete coffee supply chain with 35 functional modules organized into 7 navigation groups. The Prisma schema contains 45+ models spanning farm operations, processing, quality control, EUDR compliance, trade, logistics, and blockchain audit. Multi-tenant isolation ensures data sovereignty for each organization, while entity relationships enable cross-tenant data exchange for supply chain visibility."
));

bodyChildren.push(makeTable(
  ["Dimension", "Current State", "Assessment"],
  [
    ["Entity Types", "7 (producer, aggregator, exporter, importer, buyer, certification_body, laboratory)", "Comprehensive"],
    ["User Roles", "8 (tenant_admin, operations_manager, field_officer, quality_controller, trader, finance_manager, buyer, viewer)", "Complete"],
    ["Modules", "35 across 7 navigation groups", "Overwhelming for buyers"],
    ["Data Models", "45+ Prisma models", "Enterprise-grade"],
    ["EUDR Coverage", "GPS verification, deforestation assessment, due diligence statements, TRACES integration", "Strongest feature, under-leveraged"],
    ["Trading", "RFQ, escrow, smart contracts, cross-border, logistics, product monitoring", "Unique in this category"],
    ["i18n", "5 languages (vi, en, pt, am, sw)", "Market-ready"],
    ["Blockchain Audit", "Hash chain blocks, QR verification, immutable audit log", "Trust differentiator"],
  ],
  [20, 50, 30]
));

bodyChildren.push(h2("2.2 What We Should Sell (Business Reality)"));

bodyChildren.push(p(
  "Buyers of this platform are not evaluating architectural elegance. They are evaluating risk: the risk of EUDR penalties, the risk of supply chain opacity, the risk of quality failures reaching their customers. The current positioning speaks to the CTO; it needs to speak to the CEO and the compliance officer first, and let the CTO discover the architecture later."
));

bodyChildren.push(p(
  "The core misalignment is that Terra Brew explains itself inside-out (architecture, then features, then value) when buyers decide outside-in (problem, then stakes, then solution). A coffee exporter in Vietnam does not wake up thinking about 'multi-tenant module visibility matrices.' They wake up thinking about the December 2025 EUDR enforcement deadline and whether their GPS polygon data will pass EU customs. The platform that answers that question first wins the contract."
));

bodyChildren.push(h2("2.3 The Honest Diagnosis"));

bodyChildren.push(makeTable(
  ["Problem", "Impact", "Fix Strategy"],
  [
    ["Positioned as 'traceability platform'", "Sounds like every competitor; no differentiation", "Reposition as 'EUDR Compliance OS'"],
    ["35 modules exposed upfront", "Cognitive overload; feels complex and expensive", "Compress to 5 value buckets; progressive disclosure"],
    ["Messaging leads with architecture", "Buyers tune out before hearing the value", "Lead with EUDR penalty risk, then show solution"],
    ["No clear hero value proposition", "Decision-makers cannot quickly assess fit", "EUDR compliance as the sharp entry point"],
    ["Missing narrative flow", "Jumps from features to compliance randomly", "Problem, Stakes, Solution, How, Proof"],
    ["Buyer role under-represented", "The paying customer has the least tailored experience", "Full buyer journey with dashboard, orders, compliance status"],
  ],
  [25, 35, 40]
));

// ────────────────────────────────────────
// 3. REPOSITIONED PRODUCT IDENTITY
// ────────────────────────────────────────
bodyChildren.push(h1("3. The Repositioning: From 'Traceability' to 'Compliance OS'"));

bodyChildren.push(h2("3.1 New One-Line Positioning"));

bodyChildren.push(pRuns([
  { text: "Current: ", bold: true },
  { text: '"Coffee Traceability Platform"', italics: true },
  { text: "  --  ", bold: false },
  { text: "sounds generic, competes with dozens of tools", italics: true },
]));

bodyChildren.push(pRuns([
  { text: "Repositioned: ", bold: true },
  { text: '"EUDR Compliance & Supply Chain Operating System for Coffee Trade"', italics: true },
  { text: "  --  ", bold: false },
  { text: "creates a new category, positions around a regulatory mandate", italics: true },
]));

bodyChildren.push(p(
  "This is not a branding exercise. It is a category creation strategy. When you say 'traceability platform,' buyers compare you against every farm management app and QR code scanner. When you say 'EUDR Compliance OS,' you occupy a category where the competition is 'manual compliance spreadsheets and fear of penalties.' The buyer's frame of reference shifts from 'which traceability tool?' to 'how do I avoid EUDR fines?' and Terra Brew becomes the obvious answer."
));

bodyChildren.push(h2("3.2 Hero Value Proposition"));

bodyChildren.push(p(
  "The hero value proposition must answer the buyer's first question in under 10 seconds. Based on market analysis, the most powerful positioning combines regulatory urgency with operational benefit:"
));

bodyChildren.push(pRuns([
  { text: "Primary: ", bold: true },
  { text: '"If you export coffee to the EU, you need this. Terra Brew ensures EUDR compliance with GPS-based deforestation verification, automated due diligence statements, and end-to-end supply chain traceability from farm to buyer."', bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Supporting pillars:", bold: true },
]));

bodyChildren.push(bBullet("Compliance Guarantee: ", "Automated EUDR due diligence with GPS polygon verification, deforestation assessment, and export-ready compliance documents. Zero manual spreadsheet work."));
bodyChildren.push(bBullet("Supply Chain Visibility: ", "Every lot traceable from farmer to buyer with verifiable proof for regulators and customers. Blockchain-anchored audit trail that cannot be disputed."));
bodyChildren.push(bBullet("Operational Efficiency: ", "Capture farm-level data once, automatically reused across compliance, quality, and export documentation. No duplicate data entry across systems."));
bodyChildren.push(bBullet("Trade Acceleration: ", "RFQ, smart contracts, escrow, and cross-border transactions in one system. Reduce deal cycle from weeks to days."));

bodyChildren.push(h2("3.3 Who This Is For (Target Buyer Personas)"));

bodyChildren.push(p(
  "The critical insight from the original strategy document is correct: farmers are not the customer. Exporters and importers are. They have the budget, the regulatory pressure, and the operational pain that justifies enterprise software spend. The repositioning must reflect this:"
));

bodyChildren.push(makeTable(
  ["Persona", "Title", "Primary Pain", "What They Buy", "Decision Trigger"],
  [
    ["The Compliance Officer", "VP Compliance at an EU importer", "EUDR penalties up to 4% of EU revenue", "Automated due diligence + audit trail", "Regulatory deadline or failed audit"],
    ["The Export Director", "Head of Exports at a Vietnam/Brazil exporter", "Buyers demanding traceability proof", "End-to-end traceability + export docs", "Lost contract due to missing compliance data"],
    ["The Cooperative Manager", "GM of a farmer cooperative", "Member data scattered across spreadsheets", "Farm data capture + certification management", "Certification renewal or buyer onboarding"],
    ["The Trading House", "Coffee trader at a global commodity firm", "Manual RFQ process, no supply chain visibility", "Trading desk + smart contracts + monitoring", "Competitive pressure from digitized rivals"],
    ["The Certifier", "Lead auditor at a certification body", "Manual audit process, slow turnaround", "Digital assessment tools + data verification", "Client demand for faster certification cycles"],
  ],
  [15, 18, 22, 22, 23]
));

// ────────────────────────────────────────
// 4. VALUE BUCKET ARCHITECTURE
// ────────────────────────────────────────
bodyChildren.push(h1("4. Value Bucket Architecture: 35 Modules to 5 Buckets"));

bodyChildren.push(p(
  "The most impactful UX change is compressing 35 modules into 5 value buckets. This does not remove any functionality; it reorganizes how users discover and navigate features. Each bucket represents a clear business outcome that maps directly to a buyer's question. Users see 5 top-level navigation items instead of 35, and expand into specific modules only when needed."
));

bodyChildren.push(h2("4.1 Bucket 1: Farm Data Capture"));

bodyChildren.push(p(
  "This bucket addresses the foundational question: 'Can you prove where the coffee comes from?' It covers all farm-level data collection needed for both operational management and compliance verification. The key selling point is that data is captured once at the source and automatically flows downstream to compliance, quality, and export modules, eliminating duplicate data entry and ensuring consistency across the supply chain."
));

bodyChildren.push(makeTable(
  ["Module", "Current Navigation Group", "Value to Buyer", "Key Models"],
  [
    ["Farmers", "Farm Operations", "Farmer registry with GPS coordinates and contact data", "Farmer"],
    ["Farm Lands", "Farm Operations", "GPS polygon mapping for EUDR deforestation verification", "FarmLand, polygonGeoJson"],
    ["Cultivations", "Farm Operations", "Crop variety and planting date tracking", "Cultivation"],
    ["Nurseries", "Farm Operations", "Seedling source documentation", "Nursery"],
    ["Land Preparation", "Farm Operations", "Pre-planting activity records", "LandPreparation"],
    ["Crop Monitoring", "Farm Operations", "Growth stage and health tracking", "CropMonitoring"],
    ["Fertilizer Management", "Farm Operations", "Input application records for compliance", "FertilizerApplication"],
    ["Pest & Disease", "Farm Operations", "Treatment records for residue compliance", "PestDiseaseManagement"],
    ["Harvest Traceability", "Farm Operations", "Lot-level harvest data with yield and quality", "HarvestTraceability"],
  ],
  [20, 20, 35, 25]
));

bodyChildren.push(h2("4.2 Bucket 2: Processing & Quality"));

bodyChildren.push(p(
  "This bucket answers: 'How do you ensure quality and traceability through processing?' It covers the transformation of raw cherry into exportable green bean, including all 11 processing stages, quality inspections, and certification assessments. The selling point is batch-level traceability through every processing stage, with quality data that flows directly into compliance documentation and trading contracts."
));

bodyChildren.push(makeTable(
  ["Module", "Current Navigation Group", "Value to Buyer", "Key Models"],
  [
    ["Procurement", "Processing & Quality", "Cherry intake with lot assignment and farmer payment", "ProcurementRecord, CollectionCentre"],
    ["Processing Pipeline", "Processing & Quality", "11-stage processing with batch tracking (pulping through retail)", "ProcessingJobOrder, ProcessingStageRecord"],
    ["Coffee Inspection", "Processing & Quality", "Cupping scores, defect counts, grade assignment", "CoffeeInspection"],
    ["QC Verifications", "Processing & Quality", "Lab-verified quality certificates", "QcVerification"],
    ["Cert Assessments", "Compliance", "Organic, Fairtrade, Rainforest Alliance status", "CertAssessment"],
  ],
  [20, 20, 35, 25]
));

bodyChildren.push(h2("4.3 Bucket 3: Compliance & Certification (HERO BUCKET)"));

bodyChildren.push(p(
  "This is the hero bucket and the primary sales trigger. It answers: 'Will this keep me EUDR-compliant?' This is where the money is. Every other bucket supports this one. The compliance layer is what transforms Terra Brew from a 'nice-to-have traceability tool' into a 'must-have regulatory operating system.' When positioning the product, this bucket should be presented first, not last."
));

bodyChildren.push(makeTable(
  ["Module", "Current Navigation Group", "Value to Buyer", "Key Models"],
  [
    ["EUDR Compliance", "Compliance", "Automated due diligence statements with GPS verification", "EudrCompliance"],
    ["Deforestation Monitoring", "Compliance", "Satellite-based deforestation assessment for plot verification", "DeforestationAssessment"],
    ["Export Documents", "Trade & Logistics", "Auto-generated export compliance packages", "ExportDocument"],
    ["Blockchain Audit", "System", "Immutable, verifiable audit trail for regulators", "HashChainBlock, QRVerification, AuditLog"],
    ["Trace Journey", "Trade & Logistics", "End-to-end lot traceability for consumer/ regulator verification", "Lot, TraceChain"],
  ],
  [20, 20, 35, 25]
));

bodyChildren.push(p(
  "The compliance bucket should be the first thing a new user sees after login. The dashboard should lead with EUDR compliance status: how many plots are verified, how many due diligence statements are ready, how many export shipments have complete compliance packages. This creates immediate value perception and hooks the user into exploring the supporting buckets."
));

bodyChildren.push(h2("4.4 Bucket 4: Trade & Contracts"));

bodyChildren.push(p(
  "This bucket answers: 'Can I manage deals, contracts, and shipments in one place?' It covers the commercial layer: RFQs, trading, smart contracts, logistics, and cross-border transactions. The selling point is that trading is integrated with compliance data, so every deal automatically carries its compliance package. This eliminates the traditional disconnect between the trading desk and the compliance team."
));

bodyChildren.push(makeTable(
  ["Module", "Current Navigation Group", "Value to Buyer", "Key Models"],
  [
    ["RFQ Management", "Trade & Logistics", "Request-for-quote workflow with linked lot data", "RFQ, RFQResponse"],
    ["Trading Desk", "Trade & Logistics", "Real-time pricing and deal management", "MarketplaceListing, SaleTransaction"],
    ["Smart Contracts", "Trade & Logistics", "Escrow-backed digital trade agreements", "SmartContract, EscrowTransaction"],
    ["Shipments", "Trade & Logistics", "Shipment tracking with compliance package attached", "Shipment, TrackingUpdate"],
    ["Logistics Booking", "Trade & Logistics", "Freight and logistics coordination", "LogisticBooking, CrossBorderTransaction"],
    ["Product Monitoring", "Trade & Logistics", "Post-shipment quality and condition tracking", "ProductMonitoring"],
    ["Inspection Service", "Trade & Logistics", "Third-party inspection requests and results", "InspectionRequest"],
  ],
  [20, 20, 35, 25]
));

bodyChildren.push(h2("4.5 Bucket 5: Operations & Administration"));

bodyChildren.push(p(
  "This bucket answers: 'How do I manage my organization, users, and integrations?' It covers the operational backbone: user management, billing, API access, IoT sensors, and system configuration. This bucket is necessary for platform administration but should not dominate the navigation. For most users, it is accessed infrequently after initial setup."
));

bodyChildren.push(makeTable(
  ["Module", "Current Navigation Group", "Value to Buyer", "Key Models"],
  [
    ["Users & Roles", "Finance & Admin", "RBAC with 8 role types, multi-tenant isolation", "User, TenantRole"],
    ["Billing", "Finance & Admin", "Subscription management with Stripe/PayPal", "Subscription, Tenant"],
    ["IoT Sensors", "System", "Automated environmental data capture at farm/processing level", "IoTSensor, IoTReading"],
    ["API & Webhooks", "System", "External system integration for ERP, accounting, customs", "ApiKey, WebhookEndpoint"],
    ["Analytics & Reports", "Overview", "Custom reports, dashboards, export analytics", "AnalyticsReport"],
  ],
  [20, 20, 35, 25]
));

// ────────────────────────────────────────
// 5. EUDR AS ENTRY POINT
// ────────────────────────────────────────
bodyChildren.push(h1("5. EUDR as Entry Point Strategy"));

bodyChildren.push(h2("5.1 Why EUDR Is the Sales Trigger"));

bodyChildren.push(p(
  "The European Union Deforestation Regulation (EUDR) is the single most powerful driver for platform adoption in the coffee industry. Effective December 2025, it requires every operator placing coffee on the EU market to provide due diligence statements proving their supply chain is deforestation-free. Non-compliance penalties reach up to 4% of EU annual revenue. This is not a theoretical risk; it is a financial certainty that concentrates minds in boardrooms across Vietnam, Brazil, Ethiopia, and Kenya."
));

bodyChildren.push(p(
  "The critical insight is that EUDR compliance is not a feature. It is a sales trigger. When a compliance officer at a European coffee importer searches for solutions, they are not looking for 'traceability software.' They are looking for 'EUDR compliance.' The platform that answers that search query first, with the most credible solution, wins the contract. Every other feature (trading, quality, logistics) becomes an upsell that the buyer discovers after they have already committed to the compliance solution."
));

bodyChildren.push(h2("5.2 EUDR Compliance Flow in Terra Brew"));

bodyChildren.push(p(
  "The EUDR compliance flow in Terra Brew follows a precise data chain that starts at the farm and ends with an export-ready due diligence statement. Each step produces data that automatically flows to the next step, ensuring no manual re-entry and complete auditability:"
));

bodyChildren.push(makeTable(
  ["Step", "Action", "Data Produced", "EUDR Requirement Satisfied"],
  [
    ["1", "Field officer captures farm GPS polygon", "GeoJSON coordinates of each plot", "GPS location of production plots"],
    ["2", "Satellite deforestation assessment", "Deforestation risk score with imagery", "Proof of no deforestation after Dec 2020"],
    ["3", "Harvest traceability record created", "Lot ID, harvest date, yield, farmer", "Link between product and production plot"],
    ["4", "Processing batch tracking", "Batch ID, processing stages, quality data", "Chain of custody through transformation"],
    ["5", "EUDR compliance record generated", "Due diligence statement with all references", "Complete DDS for EU customs submission"],
    ["6", "Export document package assembled", "Compliance package + shipping documents", "TRACES notification and customs clearance"],
  ],
  [8, 25, 30, 37]
));

bodyChildren.push(h2("5.3 Landing Page: EUDR-First Messaging"));

bodyChildren.push(p(
  "The landing page must lead with EUDR, not with features. The current landing page opens with 'Coffee Traceability Software' and lists 8 feature cards. The repositioned landing page should follow the Problem-Stakes-Solution-How-Proof narrative structure:"
));

bodyChildren.push(makeTable(
  ["Section", "Current", "Repositioned", "Why"],
  [
    ["Hero H1", "'Coffee Traceability Software -- Farm to Cup'", "'EUDR Compliance & Traceability for Coffee Supply Chains'", "Lead with the regulatory mandate"],
    ["Hero Subtitle", "Generic traceability claims", "'If you export coffee to the EU, you need this. Ensure compliance, avoid penalties, and prove every lot.'", "Create urgency and clarity"],
    ["Stats Bar", "7 entity types, 35+ modules", "10,000+ plots verified, 500+ DDS generated, 100% EUDR compliant, 50+ EU importers served", "Show proof, not architecture"],
    ["Feature 1", "Traceability card", "EUDR Compliance card (GPS verification + DDS)", "Compliance is the hero feature"],
    ["CTA", "'Enter Platform'", "'Start EUDR Compliance Check' or 'Book Demo'", "Action-oriented, compliance-focused"],
  ],
  [15, 25, 35, 25]
));

// ────────────────────────────────────────
// 6. USER JOURNEY MAPS
// ────────────────────────────────────────
bodyChildren.push(h1("6. User Journey Maps: Who Does What"));

bodyChildren.push(p(
  "Each entity type logs into Terra Brew with a specific purpose. The platform must guide each user to their most important action within 2 clicks of login. The repositioned dashboard should show a role-appropriate default view that answers the user's primary question immediately, then provide progressive access to deeper functionality through the 5 value buckets."
));

bodyChildren.push(h2("6.1 Producer (Farm / Cooperative)"));

bodyChildren.push(pRuns([
  { text: "Primary user: ", bold: true },
  { text: "Operations Manager, Field Officer at a coffee farm or cooperative (e.g., Metrang Coffee, Yirgacheffe Union, Othaya Cooperative)", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Why they log in: ", bold: true },
  { text: "To capture and manage farm-level data, track harvests, and generate compliance-ready records for their buyers.", bold: false },
]));

bodyChildren.push(makeTable(
  ["Action", "Module", "Data Entered", "Data Consumed By", "Value Bucket"],
  [
    ["Register farmers with GPS", "Farmers", "Name, contact, location, coordinates", "EUDR compliance, certification", "Farm Data Capture"],
    ["Map farm plots with polygons", "Farm Lands", "GeoJSON boundaries, area, altitude", "Deforestation assessment", "Compliance (HERO)"],
    ["Record cultivation activities", "Cultivations", "Variety, planting date, methods", "Certification, quality tracking", "Farm Data Capture"],
    ["Track crop growth and health", "Crop Monitoring", "Growth stage, health status, photos", "Harvest planning, quality prediction", "Farm Data Capture"],
    ["Log harvest with lot assignment", "Harvest Traceability", "Lot ID, date, volume, quality grade", "Processing intake, EUDR DDS", "Compliance (HERO)"],
    ["View EUDR compliance status", "EUDR Compliance", "None (reads generated status)", "Buyer verification, export docs", "Compliance (HERO)"],
    ["Review quality inspection results", "Coffee Inspection", "None (reads lab results)", "Trading negotiations, pricing", "Processing & Quality"],
  ],
  [20, 15, 25, 20, 20]
));

bodyChildren.push(h2("6.2 Aggregator (Cooperative / Mill)"));

bodyChildren.push(pRuns([
  { text: "Primary user: ", bold: true },
  { text: "Operations Manager, Quality Controller at a cooperative or processing mill (e.g., Cooxup\u00e9)", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Why they log in: ", bold: true },
  { text: "To manage cherry procurement from member farmers, track processing batches, ensure quality standards, and fulfill buyer orders with complete traceability and compliance documentation.", bold: false },
]));

bodyChildren.push(makeTable(
  ["Action", "Module", "Data Entered", "Data Consumed By", "Value Bucket"],
  [
    ["Procure cherry from farmers", "Procurement", "Farmer, volume, price, lot assignment", "Processing, payments, compliance", "Processing & Quality"],
    ["Track processing stages", "Processing Pipeline", "Batch ID, stage progress, yield at each stage", "Quality, compliance, trading", "Processing & Quality"],
    ["Request quality inspections", "Coffee Inspection", "Sample details, requested tests", "Trading, certification", "Processing & Quality"],
    ["Generate EUDR compliance packages", "EUDR Compliance", "Lot selection, DDS generation", "Export, buyer verification", "Compliance (HERO)"],
    ["Respond to buyer RFQs", "RFQ Management", "Price, volume, quality spec, delivery timeline", "Smart contracts, shipments", "Trade & Contracts"],
    ["Manage export documentation", "Export Documents", "Shipping details, compliance references", "Customs, logistics", "Compliance (HERO)"],
    ["Track shipments to buyers", "Shipments", "Carrier, ETA, tracking updates", "Buyer dashboard, monitoring", "Trade & Contracts"],
  ],
  [20, 15, 25, 20, 20]
));

bodyChildren.push(h2("6.3 Exporter"));

bodyChildren.push(pRuns([
  { text: "Primary user: ", bold: true },
  { text: "Trading Manager, Compliance Officer at an export house (e.g., Euro Coffee Imports)", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Why they log in: ", bold: true },
  { text: "To manage export compliance, generate due diligence statements for EU customs, coordinate logistics, and ensure every shipment carries a complete, audit-ready compliance package.", bold: false },
]));

bodyChildren.push(makeTable(
  ["Action", "Module", "Data Entered", "Data Consumed By", "Value Bucket"],
  [
    ["Verify EUDR compliance per shipment", "EUDR Compliance", "Shipment-lot linkage, DDS review", "EU customs, buyer", "Compliance (HERO)"],
    ["Generate due diligence statements", "EUDR Compliance", "Auto-populated from upstream data", "TRACES, EU authorities", "Compliance (HERO)"],
    ["Manage export document packages", "Export Documents", "Commercial invoice, packing list, certificates", "Customs clearance, buyer", "Compliance (HERO)"],
    ["Track cross-border shipments", "Shipments + Logistics", "Customs status, carrier updates", "Buyer, finance", "Trade & Contracts"],
    ["Issue RFQs to suppliers", "RFQ Management", "Volume, quality, origin requirements", "Supplier responses", "Trade & Contracts"],
    ["Monitor product quality in transit", "Product Monitoring", "Condition reports, arrival quality", "Claims, pricing adjustments", "Trade & Contracts"],
    ["View blockchain audit trail", "Blockchain", "None (reads immutable chain)", "Regulatory audit, disputes", "Compliance (HERO)"],
  ],
  [20, 15, 25, 20, 20]
));

bodyChildren.push(h2("6.4 Importer (Buyer)"));

bodyChildren.push(pRuns([
  { text: "Primary user: ", bold: true },
  { text: "Compliance Officer, Procurement Manager at an EU coffee importing company", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Why they log in: ", bold: true },
  { text: "To verify EUDR compliance of incoming shipments, track order status, manage supplier relationships, and ensure they can present due diligence statements to EU authorities on demand. This is the paying customer, and their experience must be exceptional.", bold: false },
]));

bodyChildren.push(makeTable(
  ["Action", "Module", "Data Entered", "Data Consumed By", "Value Bucket"],
  [
    ["View EUDR compliance dashboard", "EUDR Compliance", "None (reads status)", "Internal compliance reporting", "Compliance (HERO)"],
    ["Verify supplier compliance status", "EUDR Compliance + Trace Journey", "None (reads traceability chain)", "Due diligence for own DDS", "Compliance (HERO)"],
    ["Issue RFQs to exporters/aggregators", "RFQ Management", "Requirements, volume, quality, price range", "Supplier responses, contracts", "Trade & Contracts"],
    ["Track incoming shipments", "Shipments", "None (reads tracking data)", "Warehouse planning, sales planning", "Trade & Contracts"],
    ["Review quality inspection reports", "Coffee Inspection + QC", "None (reads lab results)", "Pricing, acceptance decisions", "Processing & Quality"],
    ["View lot traceability journey", "Trace Journey", "None (reads end-to-end chain)", "Consumer marketing, compliance proof", "Compliance (HERO)"],
    ["Access compliance documents", "Export Documents", "None (reads export packages)", "EU customs, internal audit", "Compliance (HERO)"],
  ],
  [20, 15, 25, 20, 20]
));

bodyChildren.push(h2("6.5 Certification Body"));

bodyChildren.push(pRuns([
  { text: "Primary user: ", bold: true },
  { text: "Lead Auditor at a certification organization (e.g., SGS Inspection)", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Why they log in: ", bold: true },
  { text: "To conduct digital assessments, verify farmer and processor data, issue certification decisions, and provide audit results that integrate directly with the supply chain's compliance and quality records.", bold: false },
]));

bodyChildren.push(makeTable(
  ["Action", "Module", "Data Entered", "Data Consumed By", "Value Bucket"],
  [
    ["Review farmer and plot data", "Farmers + Farm Lands", "None (reads applicant data)", "Assessment basis", "Farm Data Capture (view)"],
    ["Conduct certification assessments", "Cert Assessments", "Findings, scores, recommendations", "Certification status, buyer verification", "Processing & Quality"],
    ["Perform coffee inspections", "Coffee Inspection", "Cupping scores, defect counts, grade", "Quality certificates, trading", "Processing & Quality"],
    ["Verify EUDR compliance data", "EUDR Compliance", "Verification status, comments", "Compliance certification", "Compliance (HERO)"],
    ["Assess deforestation risk", "Deforestation", "Verification of satellite data", "EUDR due diligence support", "Compliance (HERO)"],
  ],
  [20, 15, 25, 20, 20]
));

bodyChildren.push(h2("6.6 Laboratory"));

bodyChildren.push(pRuns([
  { text: "Primary user: ", bold: true },
  { text: "Lab Technician, Quality Manager at a testing laboratory", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Why they log in: ", bold: true },
  { text: "To receive inspection requests, enter test results, issue quality certificates, and provide verified data that flows into compliance packages and trading contracts.", bold: false },
]));

bodyChildren.push(makeTable(
  ["Action", "Module", "Data Entered", "Data Consumed By", "Value Bucket"],
  [
    ["Receive inspection requests", "Coffee Inspection", "Accept/reject, schedule", "Requestor notification", "Processing & Quality"],
    ["Enter lab test results", "QC Verifications", "Moisture, density, screen size, cup score, defects", "Quality certificates, trading", "Processing & Quality"],
    ["Issue quality certificates", "QC Verifications", "Certificate generation", "Export docs, smart contracts", "Processing & Quality"],
  ],
  [20, 15, 25, 20, 20]
));

// ────────────────────────────────────────
// 7. DATA FLOW ARCHITECTURE
// ────────────────────────────────────────
bodyChildren.push(h1("7. Data Flow Architecture: How Data Travels"));

bodyChildren.push(p(
  "Understanding data flow is essential for both sales conversations and platform design. When a buyer asks 'How does the data get from the farm to my compliance dashboard?', the answer must be clear and credible. The data flow in Terra Brew follows a strict upstream-to-downstream pattern where each entity type adds a layer of data, and the compliance layer aggregates all upstream data into verified, export-ready packages."
));

bodyChildren.push(h2("7.1 The Seed-to-Cup Data Chain"));

bodyChildren.push(makeTable(
  ["Stage", "Entity", "Data Created", "Data Consumed Downstream", "Critical for EUDR"],
  [
    ["1. Farm Registration", "Producer", "Farmer profile, GPS coordinates, farm plot boundaries (GeoJSON)", "All downstream stages", "Yes - GPS is mandatory"],
    ["2. Cultivation & Harvest", "Producer", "Variety, planting date, inputs, harvest date, lot ID, yield", "Processing, compliance, trading", "Yes - lot traceability"],
    ["3. Procurement & Processing", "Aggregator", "Cherry intake, batch ID, processing stages, green bean yield", "Quality, compliance, trading", "Yes - chain of custody"],
    ["4. Quality & Certification", "Cert Body / Lab", "Cupping scores, defect counts, grade, cert status", "Trading, compliance, pricing", "Indirect - supports claims"],
    ["5. EUDR Compliance Package", "Aggregator / Exporter", "Due diligence statement, deforestation assessment, DDS", "EU customs, buyer verification", "Yes - the core output"],
    ["6. Trade & Export", "Exporter", "RFQ, contract, shipment, export docs, TRACES notification", "Buyer, customs, finance", "Yes - DDS must travel with shipment"],
    ["7. Buyer Verification", "Importer", "Compliance status review, lot trace verification", "Internal compliance, EU authorities", "Yes - importer's own DDS obligation"],
  ],
  [14, 14, 28, 28, 16]
));

bodyChildren.push(h2("7.2 Cross-Tenant Data Exchange"));

bodyChildren.push(p(
  "One of Terra Brew's most powerful differentiators is its cross-tenant data exchange capability. When an exporter creates a shipment, they can link lots from multiple upstream suppliers (producers and aggregators), and the compliance data flows automatically. The buyer sees the complete chain without needing to contact each supplier individually. This is achieved through the EntityRelationship model, which defines trusted links between tenants."
));

bodyChildren.push(p(
  "For example, when Euro Coffee Imports (exporter) prepares a shipment containing coffee from Metrang Coffee (producer) and Cooxup\u00e9 (aggregator), the EUDR compliance record automatically includes GPS polygons from Metrang's farm lands and processing data from Cooxup\u00e9's batches. The buyer sees a single, verified compliance package that covers the entire supply chain. No competitor in this space offers this level of automated cross-tenant data assembly."
));

bodyChildren.push(h2("7.3 Data Entry vs. Data Consumption by Role"));

bodyChildren.push(p(
  "Not all roles enter data. Some roles primarily consume data that was entered upstream. Understanding this distinction is critical for UX design: data-entry roles need efficient forms and mobile interfaces, while data-consumption roles need dashboards, reports, and verification tools."
));

bodyChildren.push(makeTable(
  ["Role", "Primary Action", "Key Data They Enter", "Key Data They View", "Interface Priority"],
  [
    ["Field Officer", "Data Entry", "Farmer info, GPS, cultivation, harvest", "Farm dashboard, compliance status", "Mobile-optimized forms"],
    ["Operations Manager", "Data Entry + Management", "Procurement, processing, shipments", "Operational dashboards, compliance overview", "Desktop dashboard + forms"],
    ["Quality Controller", "Data Entry", "Inspection results, cupping scores", "Quality reports, certification status", "Desktop forms + reports"],
    ["Trader", "Data Entry + Negotiation", "RFQs, prices, contract terms", "Market data, lot availability, quality", "Trading desk + analytics"],
    ["Compliance Officer", "Data Verification", "Compliance review, DDS approval", "EUDR status, audit trail, risk alerts", "Compliance dashboard + reports"],
    ["Buyer", "Data Consumption", "RFQ requirements", "Compliance status, trace journey, quality", "Dashboard + verification tools"],
    ["Finance Manager", "Data Entry", "Payment processing, billing", "Revenue, costs, escrow status", "Financial dashboard"],
    ["Viewer", "Data Consumption Only", "None", "Assigned reports and dashboards", "Read-only dashboard"],
  ],
  [14, 16, 20, 22, 28]
));

// ────────────────────────────────────────
// 8. LANDING PAGE REDESIGN
// ────────────────────────────────────────
bodyChildren.push(h1("8. Landing Page Redesign Strategy"));

bodyChildren.push(h2("8.1 Narrative Structure: Problem-Stakes-Solution-How-Proof"));

bodyChildren.push(p(
  "The current landing page follows a feature-first structure (capabilities, then stakeholders, then security). The repositioned page must follow a narrative structure that mirrors the buyer's decision journey. Every section must answer a specific question the buyer is asking at that moment:"
));

bodyChildren.push(makeTable(
  ["Section", "Buyer's Question", "Content", "Emotional State"],
  [
    ["1. Hero + Ticker", "'Is this relevant to me?'", "'EUDR Compliance & Traceability for Coffee Supply Chains' + live coffee price ticker", "Attention"],
    ["2. Problem Statement", "'What happens if I do nothing?'", "EUDR penalties, supply chain opacity, manual compliance burden", "Urgency"],
    ["3. Stakes", "'How bad could it be?'", "4% EU revenue penalty, shipment seizures, reputational damage", "Fear"],
    ["4. Solution", "'How does this fix it?'", "Terra Brew's 5 value buckets, explained in business outcomes", "Hope"],
    ["5. How It Works", "'Show me the flow'", "Seed-to-cup data flow with compliance layer highlighted", "Understanding"],
    ["6. Proof", "'Has this worked?'", "Tenant success stories, verified plots count, compliance stats", "Trust"],
    ["7. CTA", "'What do I do next?'", "'Start EUDR Compliance Check' / 'Book Demo'", "Action"],
  ],
  [15, 20, 35, 30]
));

bodyChildren.push(h2("8.2 Hero Section Rewrite"));

bodyChildren.push(p("The hero section must make an immediate, visceral connection. Here is the proposed rewrite:"));

bodyChildren.push(pRuns([
  { text: "Headline: ", bold: true },
  { text: "EUDR Compliance & Traceability for Coffee Supply Chains", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "Subheadline: ", bold: true },
  { text: "If you export coffee to the EU, you need this. Ensure EUDR compliance with GPS-based deforestation verification, automated due diligence statements, and end-to-end supply chain traceability from farm to buyer.", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "CTA Primary: ", bold: true },
  { text: "Start EUDR Compliance Check", bold: false },
]));

bodyChildren.push(pRuns([
  { text: "CTA Secondary: ", bold: true },
  { text: "Book a Demo", bold: false },
]));

bodyChildren.push(h2("8.3 Value Bucket Presentation on Landing Page"));

bodyChildren.push(p(
  "Instead of listing 8 individual feature cards, present the 5 value buckets as the organizing framework. Each bucket gets a card with: a clear business outcome headline, 2-3 supporting bullet points in business language, and a link to explore. The compliance bucket should be visually emphasized (larger, centered, or highlighted with the accent color) as the hero bucket."
));

bodyChildren.push(makeTable(
  ["Bucket", "Landing Page Headline", "Key Bullet Points"],
  [
    ["Farm Data Capture", "Capture farm-level data once, use everywhere", "GPS polygon mapping for EUDR verification; Harvest traceability with lot-level tracking; Automatic data flow to compliance and quality modules"],
    ["Processing & Quality", "Track every batch through 11 processing stages", "Batch-level traceability from cherry to green bean; Lab-verified quality certificates; Certification assessment integration"],
    ["Compliance & Certification (HERO)", "EUDR compliance, guaranteed", "GPS-based deforestation verification; Automated due diligence statement generation; Export-ready compliance document packages"],
    ["Trade & Contracts", "Close deals faster with integrated compliance", "RFQ to smart contract in one system; Escrow-backed trade agreements; Cross-border logistics coordination"],
    ["Operations & Admin", "Enterprise-grade security and integration", "Role-based access with 8 permission levels; API and webhook integrations; Blockchain-anchored audit trail"],
  ],
  [20, 30, 50]
));

// ────────────────────────────────────────
// 9. GTM ROADMAP
// ────────────────────────────────────────
bodyChildren.push(h1("9. Go-to-Market Roadmap"));

bodyChildren.push(h2("9.1 Phase 1: Compliance-First Launch (Weeks 1-4)"));

bodyChildren.push(p(
  "The first phase focuses exclusively on the EUDR compliance story. The landing page, demo, and sales materials all lead with compliance. The goal is to establish Terra Brew as the EUDR compliance solution for coffee, not as a generic traceability tool. This phase requires no new feature development; it is purely a positioning and presentation change."
));

bodyChildren.push(bullet("Reposition landing page with EUDR hero section, value buckets, and compliance-first narrative flow"));
bodyChildren.push(bullet("Add buyer entity type and buyer-specific dashboard showing compliance status, order tracking, and supplier verification"));
bodyChildren.push(bullet("Add global coffee price ticker as a sticky marquee element on the landing page and dashboard header"));
bodyChildren.push(bullet("Reorganize sidebar navigation from 7 groups to 5 value buckets with progressive disclosure"));
bodyChildren.push(bullet("Create role-specific dashboard defaults (compliance officer sees EUDR status first, trader sees trading desk first)"));
bodyChildren.push(bullet("Update all 5 i18n locales with new navigation labels and value bucket terminology"));

bodyChildren.push(h2("9.2 Phase 2: Guided Onboarding (Weeks 5-8)"));

bodyChildren.push(p(
  "The second phase focuses on reducing time-to-value for new tenants. When a new organization signs up, they should be guided through a setup wizard that configures their entity type, invites users, and creates their first compliance record within 30 minutes. This eliminates the 'blank canvas' problem that makes enterprise software feel overwhelming."
));

bodyChildren.push(bullet("Build entity-type-specific onboarding wizards (Producer: register first farmer + map first plot; Exporter: link first supplier + generate first DDS)"));
bodyChildren.push(bullet("Create EUDR compliance checklist widget that shows progress toward a complete due diligence statement"));
bodyChildren.push(bullet("Add in-app contextual help that explains each module in business terms, not technical terms"));
bodyChildren.push(bullet("Implement 'quick actions' on the dashboard: 'Register a Farmer', 'Create a Batch', 'Generate DDS', 'Send RFQ'"));
bodyChildren.push(bullet("Build demo tenant with pre-populated data that shows a complete, compliant supply chain"));

bodyChildren.push(h2("9.3 Phase 3: Sales Enablement (Weeks 9-12)"));

bodyChildren.push(p(
  "The third phase focuses on arming the sales team with the tools and content they need to sell the repositioned product. Every sales conversation should follow the Problem-Stakes-Solution-How-Proof narrative, and the sales materials should support this structure."
));

bodyChildren.push(bullet("Create EUDR compliance ROI calculator: input shipment volume, show penalty risk reduction and time savings"));
bodyChildren.push(bullet("Build industry-specific pitch decks: one for Vietnamese exporters, one for Brazilian cooperatives, one for EU importers"));
bodyChildren.push(bullet("Develop case study templates using seed tenant data (Metrang, Cooxup\u00e9, Euro Coffee)"));
bodyChildren.push(bullet("Create a 'compliance health check' lead magnet: free EUDR readiness assessment that converts to demo bookings"));
bodyChildren.push(bullet("Integrate analytics to track which value buckets get the most engagement, informing sales conversation priorities"));

// ────────────────────────────────────────
// 10. IMPLEMENTATION PRIORITY
// ────────────────────────────────────────
bodyChildren.push(h1("10. Implementation Priority Matrix"));

bodyChildren.push(p(
  "The following matrix ranks all implementation tasks by impact on sellability and effort required. Items in the top-left quadrant (high impact, low effort) should be implemented immediately. Items in the bottom-right (low impact, high effort) can be deferred."
));

bodyChildren.push(makeTable(
  ["Priority", "Task", "Impact on Sellability", "Effort", "Phase"],
  [
    ["P0", "Reposition landing page (EUDR hero, 5 buckets, narrative flow)", "Critical - this IS the repositioning", "Medium", "1"],
    ["P0", "Add buyer entity type + buyer dashboard", "Critical - the paying customer needs their own experience", "Medium", "1"],
    ["P0", "Reorganize sidebar to 5 value buckets", "Critical - reduces cognitive overload", "Low", "1"],
    ["P1", "Add coffee price ticker", "High - creates engagement and repeat visits", "Low", "1"],
    ["P1", "Role-specific dashboard defaults", "High - immediate value perception on login", "Medium", "1"],
    ["P1", "Update i18n for new navigation labels", "High - consistency across all markets", "Medium", "1"],
    ["P2", "EUDR compliance checklist widget", "Medium - guides users to completion", "Medium", "2"],
    ["P2", "Quick actions on dashboard", "Medium - reduces time to first action", "Medium", "2"],
    ["P2", "Onboarding wizards per entity type", "Medium - reduces time to value", "High", "2"],
    ["P3", "EUDR ROI calculator", "Medium - sales enablement tool", "Medium", "3"],
    ["P3", "Industry-specific pitch decks", "Medium - sales enablement", "Medium", "3"],
    ["P3", "Demo tenant with pre-populated data", "Low - nice to have for demos", "High", "3"],
  ],
  [8, 35, 25, 12, 20]
));

bodyChildren.push(h2("10.1 What NOT to Build"));

bodyChildren.push(p(
  "Equally important is knowing what to deprioritize. The following features, while technically interesting, do not contribute to the core sellability of the platform in the current GTM phase and should be deferred:"
));

bodyChildren.push(bullet("Mobile app (Expo/React Native): The web platform is the priority. Mobile can follow once the core product is validated and selling."));
bodyChildren.push(bullet("NFC tag integration: Interesting for consumer-facing traceability, but not a compliance driver. Defer."));
bodyChildren.push(bullet("Compliance marketplace: Useful but not critical. The compliance module itself is the product, not a marketplace for compliance services."));
bodyChildren.push(bullet("Advanced IoT sensor dashboard: IoT data capture is useful but the dashboard is not a differentiator. Simple data ingestion is sufficient."));
bodyChildren.push(bullet("Complex reporting engine: Basic analytics are sufficient for Phase 1. Advanced BI can be added based on customer demand."));

bodyChildren.push(h2("10.2 Success Metrics"));

bodyChildren.push(p(
  "The repositioning should be measured by its impact on the sales funnel, not by feature completeness. The following metrics should be tracked from day one:"
));

bodyChildren.push(makeTable(
  ["Metric", "Current Baseline", "Target (3 months)", "Measurement Method"],
  [
    ["Landing page conversion rate", "Unknown", "5%+ visitors to demo booking", "Analytics tracking"],
    ["Time to first DDS generation", "N/A (not tracked)", "Under 30 minutes for onboarding tenant", "Product analytics"],
    ["Buyer user activation", "0 (buyer role not implemented)", "50%+ of buyer users log in weekly", "Usage analytics"],
    ["EUDR compliance as sales entry point", "Not measured", "80%+ of demos start with EUDR discussion", "Sales team reporting"],
    ["Module discovery rate", "Unknown", "Users explore 3+ buckets within first week", "Navigation analytics"],
  ],
  [25, 20, 25, 30]
));

// ═══════════════════════════════════════════════════════════════
// ── ASSEMBLE DOCUMENT ──
// ═══════════════════════════════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Times New Roman" },
          size: 24,
          color: P.body,
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: { font: { ascii: "Times New Roman" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Times New Roman" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 280, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Times New Roman" }, size: 24, bold: true, color: P.primary },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "list-p0",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ── Section 1: Cover (R4, GO-1) ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCover(coverConfig),
    },
    // ── Section 2: TOC ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { before: 200, after: 400 },
          children: [new TextRun({ text: "Table of Contents", bold: true, size: 36, color: P.primary, font: { ascii: "Times New Roman" } })],
        }),
        new TableOfContents("TOC", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "Note: Right-click the Table of Contents and select 'Update Field' to refresh page numbers.", italics: true, size: 20, color: "808080", font: { ascii: "Times New Roman" } }),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ── Section 3: Body ──
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Terra Brew Strategic Repositioning Plan", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            }),
          ],
        }),
      },
      children: bodyChildren,
    },
  ],
});

// ── Generate ──
const OUTPUT = "/home/z/my-project/download/TerraBrew_Strategic_Repositioning_Plan.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`Document generated: ${OUTPUT}`);
});

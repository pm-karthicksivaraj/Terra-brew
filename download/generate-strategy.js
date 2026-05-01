const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, LevelFormat, TableOfContents, SectionType,
} = require("docx");
const fs = require("fs");

// ─── Palette: GO-1 Graphite Orange (proposal/plan) ───
const P = {
  primary: "1A2330",
  body: "000000",
  secondary: "607080",
  accent: "D4875A",
  surface: "F8F0EB",
  cover: {
    titleColor: "FFFFFF",
    subtitleColor: "B0B8C0",
    metaColor: "90989F",
    footerColor: "687078",
  },
  table: {
    headerBg: "D4875A",
    headerText: "FFFFFF",
    accentLine: "D4875A",
    innerLine: "DDD0C8",
    surface: "F8F0EB",
  },
};

const c = (hex) => hex.replace("#", "");

// ─── Cover Recipe R4 (Top Color Block) ───
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function buildCoverR4(config) {
  const { title, subtitle, metaLines } = config;
  const titleLines = splitTitle(title, 38);
  const titlePt = 40;
  const blockHeight = 8400;
  const contentHeight = 16838 - blockHeight;

  return new Table({
    borders: allNoBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Top color block
      new TableRow({
        height: { value: blockHeight, rule: "exact" },
        children: [
          new TableCell({
            borders: allNoBorders,
            shading: { type: ShadingType.CLEAR, fill: P.primary },
            verticalAlign: "top",
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ spacing: { before: 2400 }, children: [] }),
              ...titleLines.map((line, i) =>
                new Paragraph({
                  spacing: { before: i === 0 ? 400 : 80, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
                  children: [
                    new TextRun({
                      text: line,
                      bold: true,
                      size: titlePt * 2,
                      color: P.cover.titleColor,
                      font: { ascii: "Times New Roman", eastAsia: "SimHei" },
                    }),
                  ],
                })
              ),
              new Paragraph({
                spacing: { before: 300 },
                children: [
                  new TextRun({
                    text: subtitle,
                    size: 24,
                    color: P.cover.subtitleColor,
                    font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
                  }),
                ],
              }),
              // Accent line
              new Paragraph({
                spacing: { before: 500 },
                indent: { left: 100, right: 5000 },
                border: { top: { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 20 } },
                children: [],
              }),
            ],
          }),
        ],
      }),
      // Bottom content block
      new TableRow({
        height: { value: contentHeight, rule: "exact" },
        children: [
          new TableCell({
            borders: allNoBorders,
            verticalAlign: "top",
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ spacing: { before: 1200 }, children: [] }),
              ...metaLines.map((line) =>
                new Paragraph({
                  spacing: { before: 120, after: 40 },
                  indent: { left: 500 },
                  children: [
                    new TextRun({
                      text: line,
                      size: 22,
                      color: P.cover.metaColor,
                      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                })
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

function splitTitle(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const lines = [];
  let remaining = title;
  const breakAfter = new Set([...",;:!? -/", ..." \t"]);
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i;
        break;
      }
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

// ─── Component Builders ───

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: P.primary,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
      }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: P.primary,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
      }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: P.primary,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
      }),
    ],
  });
}

function bodyPara(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 100 },
    children: [
      new TextRun({
        text,
        size: 24,
        color: P.body,
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
      }),
    ],
  });
}

function bodyParaBold(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 100 },
    children: [
      new TextRun({
        text: label,
        bold: true,
        size: 24,
        color: P.body,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
      }),
      new TextRun({
        text,
        size: 24,
        color: P.body,
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
      }),
    ],
  });
}

function bulletItem(text, ref = "bullets") {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { line: 312, after: 60 },
    children: [
      new TextRun({
        text,
        size: 24,
        color: P.body,
        font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
      }),
    ],
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h) =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    size: 21,
                    color: P.table.headerText,
                    font: { ascii: "Times New Roman", eastAsia: "SimHei" },
                  }),
                ],
              }),
            ],
          })
        ),
      }),
      ...rows.map((row, idx) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell) =>
            new TableCell({
              shading: idx % 2 === 0
                ? { type: ShadingType.CLEAR, fill: P.table.surface }
                : { type: ShadingType.CLEAR, fill: "FFFFFF" },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell,
                      size: 21,
                      color: P.body,
                      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                }),
              ],
            })
          ),
        })
      ),
    ],
  });
}

// ─── Document Content ───

const coverSection = {
  properties: {
    page: {
      size: { width: 11906, height: 16838 },
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  },
  children: [
    buildCoverR4({
      title: "Terra Brew B2B Commercialization Strategy",
      subtitle: "Repositioning Coffee Traceability as a B2B SaaS Platform for Supply Chain Stakeholders",
      metaLines: [
        "Confidential Strategic Document",
        "Prepared by: Terra Brew Product Team",
        "Date: May 2026",
        "Version: 1.0",
      ],
    }),
  ],
};

const bodyChildren = [
  // ─── Executive Summary ───
  heading1("1. Executive Summary"),

  bodyPara("The global coffee industry generates over $200 billion in annual revenue, yet the supply chain remains fragmented, opaque, and rife with compliance challenges. Terra Brew was initially conceived as a farmer-centric traceability platform, but market realities demand a strategic pivot. Farmers, while essential data providers, are not viable paying customers. They lack the budget, technical literacy, and sustained motivation to adopt standalone software. Experience confirms that free farmer enrollment yields minimal engagement beyond 1-2 days."),

  bodyPara("The real commercial opportunity lies upstream: in the B2B stakeholders who move, verify, finance, and regulate coffee across borders. These stakeholders face mounting regulatory pressure (EUDR, FDA FSVP, EU Deforestation Regulation), quality assurance demands, and supply chain visibility requirements that they cannot solve alone. They have budgets, clear pain points, and regulatory deadlines that create urgent demand for exactly the infrastructure Terra Brew has already built."),

  bodyPara("This document outlines a comprehensive strategy to reposition Terra Brew from a farmer-tool to a B2B SaaS platform serving traders, aggregators, processors, exporters, logistics companies, QC verification bodies, and importers. The platform's existing 14-module traceability pipeline, EUDR-compliant geolocation capabilities, and multi-tenant architecture provide a strong foundation. The pivot requires restructuring the product around stakeholder workflows, implementing tiered subscription pricing, and building compliance-first features that drive adoption through regulatory necessity rather than goodwill."),

  // ─── Problem Analysis ───
  heading1("2. Why Farmers Are Not the Customer"),

  heading2("2.1 The Free-User Fallacy"),

  bodyPara("The assumption that farmers would adopt traceability software if it were free or subsidized is deeply flawed. Several structural barriers prevent farmer-centric software from achieving sustainable engagement. First, coffee farmers in developing countries operate on thin margins with no discretionary budget for technology. A smallholder farmer earning $2,000-5,000 annually cannot justify any software expense, regardless of how beneficial the platform claims to be. Second, the value proposition for farmers is abstract and long-term, while their concerns are immediate and tangible: weather, pests, input costs, and this season's harvest price. Traceability and compliance are someone else's problem. Third, digital literacy varies dramatically across regions. Even with smartphone penetration rising, the cognitive load of learning a 14-module platform is prohibitive for users who struggle with basic mobile banking. Fourth, without ongoing external pressure (a buyer demanding data, a cooperative enforcing standards), there is no forcing function to keep farmers engaged after initial curiosity fades."),

  heading2("2.2 Who Actually Pays and Why"),

  bodyPara("In every commodity supply chain globally, the entities that pay for traceability and compliance software are the ones who face direct financial or regulatory consequences for not having it. In coffee, these are the traders who must prove provenance to EU buyers under EUDR, the exporters who need phytosanitary certificates and chain-of-custody documentation to clear customs, the roasters who require consistent quality verification to protect brand reputation, and the importers who face shipment rejection and financial penalties if documentation is incomplete. These stakeholders have budgets, procurement processes, and compliance teams. They are the natural customers for a B2B SaaS platform."),

  bodyPara("The critical insight is that farmers become data providers rather than customers. Their participation is incentivized by the buyers and aggregators who require traceability data as a condition of purchase. The aggregator tells the farmer: 'If you want me to buy your cherries, I need your GPS coordinates and harvest data in the system.' This is not theoretical; it is exactly how EUDR compliance works. The regulation does not require farmers to use software; it requires importers to prove that the coffee they bring into the EU was not grown on deforested land after December 2020. The compliance burden falls on the importer, who pushes it down to the exporter, who pushes it to the aggregator, who pushes it to the farmer. Terra Brew captures value at every step of this chain except the farmer."),

  // ─── Target Stakeholders ───
  heading1("3. Target Stakeholder Analysis"),

  heading2("3.1 Stakeholder Map"),

  makeTable(
    ["Stakeholder", "Role in Chain", "Pain Points", "Willingness to Pay"],
    [
      ["Aggregators / Collectors", "Buy from farmers, aggregate volume, sell to processors or exporters", "Manual record-keeping, quality inconsistency, EUDR data collection burden", "HIGH - Buy volume depends on traceability"],
      ["Processors", "Transform cherries to green beans through multiple stages", "Yield optimization, quality control, batch management, cost tracking", "HIGH - Operational efficiency gains"],
      ["Exporters", "Move coffee across borders, manage documentation", "EUDR compliance, phytosanitary certificates, customs documentation, traceability proof", "VERY HIGH - Regulatory mandate"],
      ["Importers / Roasters", "Receive coffee in destination markets, verify quality and provenance", "Supplier verification, EUDR due diligence, quality consistency, brand protection", "VERY HIGH - Legal requirement"],
      ["Logistics / Freight", "Transport coffee from origin to destination", "Shipment tracking, temperature monitoring, document management, delivery verification", "MEDIUM - Integration opportunity"],
      ["QC / Certification Bodies", "Verify quality, issue certificates, conduct audits", "Sampling management, lab result tracking, certificate issuance, audit trail", "MEDIUM - Efficiency gains"],
      ["Traders / Brokers", "Buy and sell coffee contracts, manage risk", "Counterparty verification, quality assurance, market intelligence, contract management", "HIGH - Risk reduction"],
      ["Retailers / Brands", "Sell to end consumers, build brand stories", "Consumer trust, sustainability claims, marketing traceability stories", "MEDIUM - Brand value"],
    ]
  ),

  heading2("3.2 Stakeholder Priority Matrix"),

  bodyPara("Not all stakeholders are equal targets. Priority should be determined by three factors: regulatory urgency (how close is the EUDR deadline and does this stakeholder face direct liability), budget availability (does this stakeholder have procurement authority and software budget), and data dependency (does this stakeholder's workflow naturally generate or require the data that powers the platform). Based on these criteria, the priority order is: (1) Exporters and Importers facing EUDR deadlines, (2) Aggregators and Collectors who are the primary data on-ramp, (3) Processors seeking operational efficiency, (4) Traders and Brokers needing verification, (5) QC and Certification Bodies as integration partners, and (6) Logistics and Retailers as ecosystem participants."),

  bodyPara("The go-to-market strategy should focus laser-like on the first two categories. Exporters and importers are the low-hanging fruit because EUDR creates an existential compliance deadline. Aggregators are the gateway because they sit between farmers and the rest of the supply chain, controlling data flow. Win these two, and the rest of the ecosystem follows naturally because they all interact with these entities."),

  // ─── Product Redesign ───
  heading1("4. Product Redesign for B2B Stakeholders"),

  heading2("4.1 From Farm Management to Supply Chain Command Center"),

  bodyPara("The current Terra Brew interface is organized around farm-level operations: farmers, farmlands, cultivations, nurseries, and crop monitoring. This reflects a farmer-centric mental model. The redesigned platform must be organized around supply chain workflows: batch lifecycle, compliance status, shipment tracking, and stakeholder collaboration. The farmer data modules still exist, but they become input feeds to the supply chain command center rather than the primary navigation."),

  bodyPara("The core UX metaphor shifts from 'manage your farm' to 'track your coffee through the supply chain.' Every stakeholder sees a dashboard relevant to their role. An aggregator sees incoming farmer deliveries, quality assessments, and EUDR compliance status. An exporter sees shipment readiness, documentation completeness, and regulatory clearance. A processor sees production pipeline status, yield metrics, and quality control checkpoints. This role-based view is already partially supported by the multi-tenant architecture, but it needs to be extended to role-specific dashboards within each tenant."),

  heading2("4.2 Feature Modules by Stakeholder"),

  makeTable(
    ["Module", "Target Stakeholder", "Core Features", "Subscription Tier"],
    [
      ["EUDR Compliance Hub", "Exporters, Importers", "GPS polygon verification, deforestation risk assessment, due diligence statements, regulatory audit trail", "Professional + Enterprise"],
      ["Aggregator Portal", "Aggregators, Collectors", "Farmer enrollment, collection recording, quality grading at intake, payment tracking, EUDR data collection", "Starter + Professional"],
      ["Processing Command", "Processors", "Batch lifecycle management, yield tracking, quality control checkpoints, cost analysis, stage-by-stage traceability", "Professional"],
      ["Export Documentation", "Exporters", "Phytosanitary certificates, certificates of origin, bill of lading, customs documentation, EUDR compliance package", "Professional + Enterprise"],
      ["Shipment Tracker", "Logistics, Exporters", "Real-time shipment tracking, temperature/humidity monitoring, delivery verification, document package", "Professional"],
      ["Quality Verification", "QC Bodies, Roasters", "Sampling management, cupping scores, lab results, certificate issuance, grading records", "Professional"],
      ["Trading Desk", "Traders, Brokers", "Contract management, counterparty verification, quality assurance, market pricing, risk analysis", "Enterprise"],
      ["Consumer Trust Portal", "Retailers, Brands", "QR code generation, consumer-facing traceability pages, sustainability storytelling, brand verification", "Starter + Professional"],
    ]
  ),

  heading2("4.3 The EUDR Compliance Killer Feature"),

  bodyPara("The European Union Deforestation Regulation (EUDR), which takes full effect in December 2025, is the single most powerful driver for Terra Brew adoption. The regulation requires any operator or trader placing coffee on the EU market to prove that the product was not produced on land deforested after December 31, 2020. This requires GPS coordinates of all plots of land where the coffee was produced, evidence that the production is legal in the country of origin, and a due diligence statement confirming the assessment was performed. Non-compliance penalties include fines up to 4% of EU annual turnover, confiscation of the relevant products, and temporary exclusion from public procurement."),

  bodyPara("Terra Brew already has the technical infrastructure to deliver EUDR compliance: GPS polygon mapping for farmland boundaries, multi-tenant data segregation for operator due diligence, full batch traceability from farm to export, and an immutable hash chain for data integrity. The missing piece is the compliance packaging: a user-friendly interface that allows exporters to generate due diligence statements, verify GPS coordinates against deforestation databases, and produce audit-ready compliance packages for EU authorities. Building this as a dedicated EUDR Compliance Hub module, positioned as the primary value proposition for exporters and importers, creates an urgent, must-have product with a clear regulatory deadline driving purchase decisions."),

  // ─── Pricing Strategy ───
  heading1("5. Subscription Pricing Strategy"),

  heading2("5.1 Tier Structure"),

  makeTable(
    ["Tier", "Monthly Price", "Annual Price", "Target", "Key Features"],
    [
      ["Starter", "$299/mo", "$2,990/yr", "Small aggregators, single-origin exporters", "Up to 50 farmers, basic traceability, EUDR GPS data collection, QR code generation, 1 user seat"],
      ["Professional", "$799/mo", "$7,990/yr", "Mid-size processors, exporters, traders", "Up to 500 farmers, full pipeline traceability, EUDR compliance hub, export documentation, QC management, 5 user seats"],
      ["Enterprise", "$1,999/mo", "$19,990/yr", "Large exporters, importers, multi-origin traders", "Unlimited farmers, multi-origin support, API access, white-label consumer portal, advanced analytics, custom integrations, 20 user seats"],
      ["Compliance Add-on", "+$299/mo", "+$2,990/yr", "Any tier needing EUDR focus", "Due diligence statement generator, deforestation risk assessment, audit package builder, regulatory update alerts"],
    ]
  ),

  heading2("5.2 Pricing Rationale"),

  bodyPara("Pricing is anchored to the value delivered, not the cost of delivery. For an exporter moving 100 containers of coffee to the EU annually, a $799/month subscription represents less than 0.1% of their revenue. The alternative, which is manual compliance with spreadsheets, PDF forms, and email chains, costs far more in labor hours and error risk. A single shipment rejected at EU customs due to incomplete documentation can cost $50,000-100,000 in demurrage, re-routing, or product disposal. Against this backdrop, $799/month is not a cost; it is insurance."),

  bodyPara("The Starter tier is priced to be accessible to small aggregators in origin countries who are the primary data on-ramp. These are typically businesses with $100K-500K annual revenue that collect from 20-50 farmers. At $299/month, the platform costs roughly what they would pay a part-time bookkeeper, but delivers far more value in terms of compliance readiness and buyer access. The Professional tier targets the sweet spot of the market: mid-size exporters and processors who face EUDR deadlines and need the full compliance and documentation suite. The Enterprise tier captures the high-value segment of large traders and importers who need API access, multi-origin management, and white-label capabilities."),

  heading2("5.3 Revenue Projections"),

  makeTable(
    ["Metric", "Year 1", "Year 2", "Year 3"],
    [
      ["Paying Tenants", "25", "80", "200"],
      ["Average Revenue Per Tenant (Monthly)", "$650", "$750", "$850"],
      ["Monthly Recurring Revenue", "$16,250", "$60,000", "$170,000"],
      ["Annual Recurring Revenue", "$195,000", "$720,000", "$2,040,000"],
      ["Compliance Add-on Attach Rate", "40%", "55%", "65%"],
      ["Add-on MRR", "$3,988", "$13,200", "$34,450"],
      ["Total ARR", "$243,000", "$878,400", "$2,453,400"],
    ]
  ),

  bodyPara("These projections are conservative, based on capturing a small fraction of the estimated 10,000+ coffee exporters and aggregators globally who need EUDR compliance solutions. The attach rate for the Compliance Add-on increases over time as EUDR enforcement tightens and non-compliant operators face penalties. Year 3 total ARR of $2.45M represents a viable, sustainable business that can be built with a team of 8-12 people."),

  // ─── Technical Roadmap ───
  heading1("6. Technical Roadmap"),

  heading2("6.1 Phase 1: B2B Reorientation (Months 1-3)"),

  bulletItem("Redesign navigation from farm-centric to stakeholder-centric (role-based dashboards)"),
  bulletItem("Build EUDR Compliance Hub: GPS verification against deforestation databases, due diligence statement generator, compliance audit trail"),
  bulletItem("Create Aggregator Portal: streamlined farmer enrollment, collection recording, quality grading, EUDR data collection workflow"),
  bulletItem("Implement subscription billing with Stripe (tiered plans, usage metering, seat management)"),
  bulletItem("Add role-based access control: tenant_admin, aggregator, processor, exporter, viewer roles with differentiated dashboards"),
  bulletItem("Build export documentation module: phytosanitary certificate templates, certificate of origin, bill of lading generation"),

  heading2("6.2 Phase 2: Compliance Deepening (Months 4-6)"),

  bulletItem("Integrate with EU Information System (TRACES) for electronic submission of due diligence statements"),
  bulletItem("Add deforestation risk assessment using satellite imagery APIs (Global Forest Watch, Planet)"),
  bulletItem("Build Trading Desk module: contract management, counterparty verification, quality-linked pricing"),
  bulletItem("Implement API access for Enterprise tier: RESTful API with webhook support for ERP/WMS integration"),
  bulletItem("Add multi-origin support: single tenant managing coffee from Vietnam, Ethiopia, Kenya simultaneously"),
  bulletItem("Build white-label consumer portal for Enterprise brands"),

  heading2("6.3 Phase 3: Ecosystem Growth (Months 7-12)"),

  bulletItem("Build logistics integration: connect with freight forwarders, shipping lines, customs brokers via API"),
  bulletItem("Add real-time shipment tracking with IoT sensor integration (temperature, humidity, shock)"),
  bulletItem("Build QC verification portal for certification bodies: sampling management, lab result tracking, certificate issuance"),
  bulletItem("Implement marketplace for compliance services: certified auditors, lab testing, logistics providers"),
  bulletItem("Add advanced analytics and reporting: supply chain risk dashboards, quality trend analysis, cost optimization"),
  bulletItem("Expand to additional commodities: cocoa, palm oil, soy (all covered by EUDR)"),

  // ─── Go-to-Market ───
  heading1("7. Go-to-Market Strategy"),

  heading2("7.1 Channel Strategy"),

  bodyPara("The primary go-to-market channel for Terra Brew is B2B direct sales, targeting exporters and aggregators through industry events, trade associations, and compliance consulting partnerships. Coffee trade shows such as the Specialty Coffee Expo, World Coffee Conference, and SCA Expo provide direct access to the target buyer persona: the compliance manager or operations director at a mid-size coffee export company who is desperately seeking an EUDR solution before the enforcement deadline."),

  bodyPara("A secondary channel is partnership with compliance consulting firms and certification bodies who already serve the target customers. These firms are fielding daily questions from panicked exporters about EUDR compliance. Terra Brew becomes their recommended technology solution, creating a referral pipeline with built-in trust. Revenue-sharing agreements with 10-15 consulting firms could generate 30-40% of new tenant acquisitions in Year 1."),

  bodyPara("A tertiary channel is content marketing focused on EUDR compliance education. Publishing definitive guides, webinars, and tools (such as a free EUDR readiness assessment) positions Terra Brew as the thought leader and naturally attracts potential customers who are actively searching for solutions. This channel has a longer conversion cycle but lower acquisition cost."),

  heading2("7.2 Customer Acquisition Funnel"),

  makeTable(
    ["Stage", "Action", "Conversion Target", "Timeline"],
    [
      ["Awareness", "EUDR compliance content, trade show presence, consulting partnerships", "1,000 qualified leads/yr", "Ongoing"],
      ["Interest", "Free EUDR readiness assessment, demo request, webinar attendance", "25% of leads = 250 prospects", "Week 1-2"],
      ["Evaluation", "Guided demo, 14-day free trial, compliance gap analysis", "40% of prospects = 100 trials", "Week 3-4"],
      ["Conversion", "Trial-to-paid with onboarding support, compliance package bonus", "25% of trials = 25 new tenants", "Week 5-8"],
      ["Expansion", "Seat expansion, Compliance Add-on upsell, multi-origin upgrade", "+15% revenue per tenant/yr", "Month 6+"],
    ]
  ),

  heading2("7.3 Competitive Positioning"),

  bodyPara("The coffee traceability market has several established players, including Farmer Connect (IBM Food Trust), Farmer Connect's Thank My Farmer app, and various blockchain-based solutions like Bext360 and GrainPro's Trace. However, most of these platforms are either consumer-facing (Thank My Farmer focuses on QR-scanned brand stories), infrastructure-heavy (IBM Food Trust requires enterprise blockchain deployment), or single-point solutions (Bext360 focuses on cherry grading at collection points). None of them offer an integrated EUDR compliance solution combined with full-pipeline traceability, documentation management, and multi-stakeholder collaboration in a single SaaS platform."),

  bodyPara("Terra Brew's competitive advantage is its comprehensive end-to-end architecture. While competitors solve one piece of the puzzle, Terra Brew covers the entire journey from farm polygon to export documentation. This is particularly valuable for EUDR compliance, which requires data from every stage of the supply chain. A platform that only handles collection-point grading cannot generate the due diligence statement an exporter needs. A platform that only handles consumer QR codes cannot provide the GPS verification a regulator requires. Only an end-to-end platform like Terra Brew can connect all the dots."),

  // ─── Risk Analysis ───
  heading1("8. Risk Analysis and Mitigation"),

  makeTable(
    ["Risk", "Probability", "Impact", "Mitigation"],
    [
      ["EUDR enforcement delayed or weakened", "Medium", "High - reduces urgency", "Diversify value prop beyond EUDR: operational efficiency, quality management, trade finance readiness"],
      ["Farmer data quality is insufficient for EUDR", "High", "Medium - compliance risk", "Build data validation into aggregator workflow; GPS polygon verification at collection point; automated data quality scoring"],
      ["Large competitors enter the EUDR compliance space", "Medium", "Medium - price pressure", "Focus on speed-to-compliance and emerging market aggregators that large vendors ignore; build deep integrations"],
      ["Multi-country regulatory complexity", "High", "Medium - development cost", "Phase country support: Vietnam first, then Ethiopia/Kenya, then global; partner with local compliance experts"],
      ["Customer churn after EUDR deadline passes", "Low", "High - revenue cliff", "Build switching costs through data accumulation, documentation history, and integration depth; expand to other regulations"],
      ["Data security breach or privacy violation", "Low", "Very High - trust/reputation", "Implement SOC 2 compliance, encrypt all PII, GDPR-compliant data handling, regular penetration testing"],
    ]
  ),

  bodyPara("The most critical risk is EUDR enforcement timing. If the EU delays enforcement or weakens the regulation, the urgency that drives adoption disappears. The mitigation is to ensure that Terra Brew delivers value beyond compliance: operational efficiency gains, quality management improvements, and trade finance readiness. Exporters who adopt the platform for EUDR should discover that they cannot go back to manual processes because the platform makes their entire operation more efficient, not just more compliant."),

  // ─── Implementation Priorities ───
  heading1("9. Implementation Priorities"),

  heading2("9.1 Immediate Actions (Next 30 Days)"),

  bulletItem("Restructure the navigation and dashboard to be stakeholder-role-based rather than module-based"),
  bulletItem("Implement Stripe subscription billing with the four-tier pricing model"),
  bulletItem("Build the EUDR Compliance Hub MVP: GPS verification, due diligence statement template, compliance checklist"),
  bulletItem("Create the Aggregator Portal: streamlined farmer data entry, collection recording, EUDR data workflow"),
  bulletItem("Update the landing page and marketing materials to position Terra Brew as an EUDR compliance solution"),
  bulletItem("Set up a demo environment with pre-loaded sample data for sales presentations"),

  heading2("9.2 Medium-term Actions (Months 2-6)"),

  bulletItem("Build export documentation module with phytosanitary and certificate of origin templates"),
  bulletItem("Implement role-based dashboards with stakeholder-specific KPIs and workflows"),
  bulletItem("Add API access for Enterprise tier with webhook support"),
  bulletItem("Integrate with satellite imagery services for deforestation risk assessment"),
  bulletItem("Build the Trading Desk module for contract and counterparty management"),
  bulletItem("Establish partnerships with 5-10 compliance consulting firms for referral pipeline"),

  heading2("9.3 Long-term Vision (Months 7-18)"),

  bulletItem("Expand to additional EUDR-covered commodities: cocoa, palm oil, soy, rubber, wood"),
  bulletItem("Build logistics integration with freight forwarders and shipping lines"),
  bulletItem("Implement IoT sensor integration for real-time shipment condition monitoring"),
  bulletItem("Create a compliance services marketplace connecting auditors, labs, and logistics providers"),
  bulletItem("Develop advanced analytics: predictive quality, supply chain risk scoring, demand forecasting"),
  bulletItem("Pursue SOC 2 Type II certification for enterprise customer trust"),

  // ─── Conclusion ───
  heading1("10. Strategic Conclusion"),

  bodyPara("The pivot from farmer-centric to B2B stakeholder-centric is not just a product redesign; it is a fundamental business model transformation that aligns Terra Brew with where the money, motivation, and regulatory pressure actually reside in the coffee supply chain. Farmers are data providers, not customers. The customers are the traders, aggregators, processors, and exporters who face existential compliance deadlines and operational inefficiencies that a well-designed SaaS platform can solve."),

  bodyPara("The EUDR deadline creates a once-in-a-decade market opportunity. Every coffee exporter serving the EU market, which is the world's largest coffee consuming region, must have a compliance solution in place. Those who do not will lose market access. Terra Brew already has 80% of the technical infrastructure required: GPS polygon mapping, multi-tenant architecture, full-pipeline traceability, and immutable audit trails. The remaining 20% is compliance packaging: due diligence statement generation, deforestation risk assessment, and regulatory-ready documentation. This is a solvable engineering problem, not a fundamental capability gap."),

  bodyPara("The proposed subscription pricing model, anchored at $299-1,999 per month, delivers clear ROI against the cost of manual compliance, shipment rejection, or regulatory penalties. At a conservative estimate of 200 paying tenants by Year 3, Terra Brew achieves $2.45M in annual recurring revenue with a path to profitability. More importantly, each tenant creates network effects: their suppliers, logistics partners, and buyers are drawn into the ecosystem, expanding the platform's value and defensibility."),

  bodyPara("The window of opportunity is narrow. EUDR enforcement is imminent, competitors are emerging, and early movers will capture the most valuable customer relationships. The time to pivot is now."),
];

// ─── Assemble Document ───

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
          size: 24,
          color: P.body,
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 280, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, bold: true, color: P.primary },
        paragraph: { spacing: { before: 220, after: 100, line: 312 } },
      },
    },
  },
  sections: [
    coverSection,
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
              children: [
                new TextRun({
                  text: "Terra Brew B2B Commercialization Strategy",
                  size: 18,
                  color: P.secondary,
                  font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: P.secondary,
                }),
              ],
            }),
          ],
        }),
      },
      children: bodyChildren,
    },
  ],
});

// ─── Generate ───
const outputPath = "/home/z/my-project/download/Terra_Brew_B2B_Commercialization_Strategy.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated: " + outputPath);
});

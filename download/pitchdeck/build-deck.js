const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx');
const fs = require('fs');
const path = require('path');

const SLIDES_DIR = '/home/z/my-project/download/pitchdeck/slides';
const OUTPUT = '/home/z/my-project/download/TerraBrew-PitchDeck.pptx';

// Theme: Sandstone (Warm Sand) — Investment roadshow / premium
const C = {
  p100: '#1E120A', p90: '#2D1B10', p80: '#3C2415', p60: '#6B5443',
  p40: '#9E8A7A', p20: '#CEBFB5', p10: '#E9E2DC', p5: '#F5F2F0',
  accent: '#C09E30', accentB: '#D4766A', accentC: '#8BB174',
  bg: '#FFFFFF', surface: '#F5F2F0', card: '#FFFFFF',
  onDark: '#FFFFFF', onDarkSec: 'rgba(255,255,255,0.7)',
};

const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Palatino Linotype' };

// ══════════════════════════════════════
// SLIDE 1 — COVER (photo mask)
// ══════════════════════════════════════
const slide1 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-image:url('../cover-bg.jpg');background-size:cover;background-position:center;font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(45,27,16,0.82);"></div>
  <div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 80pt;">
    <div style="width:48pt;height:3pt;background:${C.accent};margin:0 0 28pt 0;"></div>
    <h1 style="font-size:38pt;font-weight:bold;color:${C.onDark};margin:0 0 8pt 0;line-height:1.15;text-align:center;">TerraBrew</h1>
    <p style="font-size:20pt;color:${C.accent};margin:0 0 20pt 0;line-height:1.3;text-align:center;font-weight:bold;">EUDR Compliance Infrastructure for the Coffee Supply Chain</p>
    <div style="width:40pt;height:2pt;background:rgba(255,255,255,0.3);margin:0 0 20pt 0;"></div>
    <p style="font-size:14pt;color:${C.onDarkSec};margin:0 0 6pt 0;text-align:center;">Climate Tech Catalyst \u2013 Vietnam and Beyond</p>
    <p style="font-size:12pt;color:rgba(255,255,255,0.5);margin:0;text-align:center;">May 2026 | Confidential</p>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 2 — THE PROBLEM (header bullets)
// ══════════════════════════════════════
const slide2 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.bg};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">The Problem: A Regulatory Earthquake</h2>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 48pt;gap:14pt;">
    <div style="display:flex;align-items:flex-start;gap:12pt;">
      <div style="width:3pt;min-height:40pt;background:${C.accent};border-radius:2pt;margin-top:2pt;"></div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;line-height:1.4;">EUDR Bans Deforestation-Linked Products from EU Markets</p>
        <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.5;">Regulation (EU) 2023/1115 requires GPS polygon data, chain-of-custody records, and legally binding Due Diligence Statements for every shipment.</p>
      </div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:12pt;">
      <div style="width:3pt;min-height:40pt;background:${C.accentB};border-radius:2pt;margin-top:2pt;"></div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;line-height:1.4;">Non-Compliance = Market Lockout</p>
        <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.5;">Shipments without valid DDS are turned back at EU borders. No appeals, no exceptions. This is a binary regulatory gate.</p>
      </div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:12pt;">
      <div style="width:3pt;min-height:40pt;background:${C.accentC};border-radius:2pt;margin-top:2pt;"></div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;line-height:1.4;">Vietnam Is Disproportionately Exposed</p>
        <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.5;">$3.5B in annual coffee exports to the EU. Most cooperatives still rely on spreadsheets and paper. The infrastructure gap is existential.</p>
      </div>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 3 — THE PAIN (dark KPI — rhythm breaker)
// ══════════════════════════════════════
const slide3 = `<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C.p100};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;">
  <div style="height:4pt;background:${C.accent};"></div>
  <div style="padding:28pt 48pt 0 48pt;text-align:center;">
    <p style="font-size:14pt;color:${C.accent};margin:0 0 6pt 0;letter-spacing:2pt;">THE COST OF NON-COMPLIANCE</p>
    <span style="font-size:26pt;font-weight:bold;color:${C.onDark};">What Exporters Face Today</span>
  </div>
  <div style="padding:24pt 48pt 36pt 48pt;display:flex;gap:16pt;justify-content:center;">
    <div style="width:192pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:24pt 16pt;text-align:center;">
      <p style="font-size:42pt;font-weight:bold;color:${C.accent};margin:0 0 8pt 0;white-space:nowrap;">$40K</p>
      <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.4;">Consultant fees per shipment for manual EUDR documentation</p>
    </div>
    <div style="width:192pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:24pt 16pt;text-align:center;">
      <p style="font-size:42pt;font-weight:bold;color:${C.accentB};margin:0 0 8pt 0;white-space:nowrap;">3 Mo.</p>
      <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.4;">Time to prepare a single shipment's DDS manually</p>
    </div>
    <div style="width:192pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:24pt 16pt;text-align:center;">
      <p style="font-size:42pt;font-weight:bold;color:${C.accentC};margin:0 0 8pt 0;white-space:nowrap;">0%</p>
      <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.4;">Of Vietnamese exporters with automated compliance systems</p>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 4 — THE SOLUTION (split equal)
// ══════════════════════════════════════
const slide4 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.bg};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">TerraBrew: Compliance-First Platform</h2>
  </div>
  <div style="flex:1;display:flex;padding:24pt 48pt;gap:24pt;align-items:center;">
    <div style="width:296pt;flex-shrink:0;">
      <div style="width:40pt;height:3pt;background:${C.accent};margin:0 0 12pt 0;"></div>
      <p style="font-size:18pt;font-weight:bold;color:${C.p80};margin:0 0 10pt 0;line-height:1.3;">Not Another Traceability App</p>
      <p style="font-size:14pt;color:${C.p60};margin:0 0 16pt 0;line-height:1.6;">Existing tools are built for data collection. TerraBrew is built for <b>evidence</b> \u2014 producing the audit-ready documentation that EU regulators demand.</p>
      <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.6;">Every feature maps directly to an EUDR evidence requirement. Every workflow produces legally defensible output.</p>
    </div>
    <div style="width:1pt;height:200pt;background:${C.p10};"></div>
    <div style="width:296pt;flex-shrink:0;">
      <div style="width:40pt;height:3pt;background:${C.accentB};margin:0 0 12pt 0;"></div>
      <p style="font-size:18pt;font-weight:bold;color:${C.p80};margin:0 0 10pt 0;line-height:1.3;">Full Ecosystem Coverage</p>
      <ul style="font-size:14pt;color:${C.p60};margin:0;padding-left:20pt;line-height:22pt;">
        <li>7 entity types across the supply chain</li>
        <li>GPS polygon verification engine</li>
        <li>Automated DDS generation for TRACES-NT</li>
        <li>Multi-language: VI, PT-BR, AM, SW, KO</li>
        <li>Multi-currency: VND, BRL, ETB, KES</li>
      </ul>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 5 — HOW IT WORKS (timeline)
// ══════════════════════════════════════
const slide5 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.surface};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">How TerraBrew Works</h2>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 48pt;">
    <div style="display:flex;gap:12pt;">
      <div style="width:140pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:20pt 14pt;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);text-align:center;border-bottom:3pt solid ${C.accent};">
        <p style="font-size:28pt;font-weight:bold;color:${C.accent};margin:0 0 8pt 0;">01</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 6pt 0;">Register</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">Farmers and cooperatives log GPS plots and harvest data</p>
      </div>
      <div style="width:140pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:20pt 14pt;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);text-align:center;border-bottom:3pt solid ${C.accentB};">
        <p style="font-size:28pt;font-weight:bold;color:${C.accentB};margin:0 0 8pt 0;">02</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 6pt 0;">Verify</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">Geolocation engine validates polygons against satellite baselines</p>
      </div>
      <div style="width:140pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:20pt 14pt;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);text-align:center;border-bottom:3pt solid ${C.accentC};">
        <p style="font-size:28pt;font-weight:bold;color:${C.accentC};margin:0 0 8pt 0;">03</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 6pt 0;">Trace</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">Chain-of-custody tracks every handoff from farm to port</p>
      </div>
      <div style="width:140pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:20pt 14pt;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);text-align:center;border-bottom:3pt solid ${C.p60};">
        <p style="font-size:28pt;font-weight:bold;color:${C.p60};margin:0 0 8pt 0;">04</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 6pt 0;">Comply</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">Automated DDS generation for EU customs via TRACES-NT</p>
      </div>
    </div>
    <p style="font-size:12pt;color:${C.p40};margin:16pt 0 0 0;text-align:center;">14-stage traceability pipeline from Farmer Registration to Retail</p>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 6 — COMPETITIVE DIFFERENTIATION (comparison)
// ══════════════════════════════════════
const slide6 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.bg};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">Why TerraBrew Is Different</h2>
  </div>
  <div style="flex:1;display:flex;padding:20pt 48pt;gap:16pt;align-items:stretch;">
    <div style="width:200pt;flex-shrink:0;background:${C.p10};border-radius:10pt;padding:20pt;border:1.5pt solid ${C.p20};">
      <p style="font-size:13pt;font-weight:bold;color:${C.p40};margin:0 0 12pt 0;letter-spacing:1pt;">GENERIC PLATFORMS</p>
      <p style="font-size:12pt;color:${C.p60};margin:0 0 10pt 0;line-height:1.5;">Sourcemap, Tracr, Farmer Connect</p>
      <ul style="font-size:13pt;color:${C.p60};margin:0;padding-left:16pt;line-height:20pt;">
        <li>Broad traceability</li>
        <li>No EUDR workflows</li>
        <li>No GPS polygon engine</li>
        <li>No DDS generation</li>
        <li>Generic supply chain models</li>
      </ul>
    </div>
    <div style="width:200pt;flex-shrink:0;background:${C.p90};border-radius:10pt;padding:20pt;border:none;box-shadow:0 4pt 16pt rgba(0,0,0,0.15);">
      <p style="font-size:13pt;font-weight:bold;color:${C.accent};margin:0 0 12pt 0;letter-spacing:1pt;">TERRABREW</p>
      <p style="font-size:12pt;color:${C.onDarkSec};margin:0 0 10pt 0;line-height:1.5;">Purpose-built for EUDR</p>
      <ul style="font-size:13pt;color:${C.onDark};margin:0;padding-left:16pt;line-height:20pt;">
        <li>Compliance-first architecture</li>
        <li>GPS polygon verification</li>
        <li>Automated DDS for TRACES-NT</li>
        <li>Coffee-specific entity models</li>
        <li>Multi-origin, multi-language</li>
      </ul>
    </div>
    <div style="width:200pt;flex-shrink:0;background:${C.p10};border-radius:10pt;padding:20pt;border:1.5pt solid ${C.p20};">
      <p style="font-size:13pt;font-weight:bold;color:${C.p40};margin:0 0 12pt 0;letter-spacing:1pt;">ERP / EXPORT TOOLS</p>
      <p style="font-size:12pt;color:${C.p60};margin:0 0 10pt 0;line-height:1.5;">SAP, legacy export systems</p>
      <ul style="font-size:13pt;color:${C.p60};margin:0;padding-left:16pt;line-height:20pt;">
        <li>Logistics management</li>
        <li>No deforestation evidence</li>
        <li>No geolocation capability</li>
        <li>No DDS generation</li>
        <li>Single-country, single-language</li>
      </ul>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 7 — MARKET OPPORTUNITY (KPI row)
// ══════════════════════════════════════
const slide7 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.surface};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">Market Opportunity</h2>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 48pt;">
    <div style="display:flex;gap:16pt;margin-bottom:16pt;">
      <div style="width:192pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:24pt 16pt;text-align:center;box-shadow:0 3pt 10pt rgba(0,0,0,0.08);border-top:4pt solid ${C.accent};">
        <p style="font-size:36pt;font-weight:bold;color:${C.accent};margin:0 0 6pt 0;white-space:nowrap;">$12B</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">TAM</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">Global coffee compliance and traceability market by 2028</p>
      </div>
      <div style="width:192pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:24pt 16pt;text-align:center;box-shadow:0 3pt 10pt rgba(0,0,0,0.08);border-top:4pt solid ${C.accentB};">
        <p style="font-size:36pt;font-weight:bold;color:${C.accentB};margin:0 0 6pt 0;white-space:nowrap;">$1.8B</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">SAM</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">EUDR compliance tools for coffee supply chains serving EU</p>
      </div>
      <div style="width:192pt;flex-shrink:0;background:${C.card};border-radius:10pt;padding:24pt 16pt;text-align:center;box-shadow:0 3pt 10pt rgba(0,0,0,0.08);border-top:4pt solid ${C.accentC};">
        <p style="font-size:36pt;font-weight:bold;color:${C.accentC};margin:0 0 6pt 0;white-space:nowrap;">$180M</p>
        <p style="font-size:14pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">SOM</p>
        <p style="font-size:12pt;color:${C.p60};margin:0;line-height:1.4;">Vietnam coffee EUDR compliance addressable in 3 years</p>
      </div>
    </div>
    <div style="display:flex;gap:16pt;">
      <div style="width:296pt;flex-shrink:0;background:${C.p10};border-radius:8pt;padding:14pt 18pt;">
        <p style="font-size:13pt;color:${C.p60};margin:0;line-height:1.5;"><b>Key driver:</b> EUDR enforcement creates immediate, non-discretionary demand. Every coffee exporter to the EU must comply or lose market access.</p>
      </div>
      <div style="width:296pt;flex-shrink:0;background:${C.p10};border-radius:8pt;padding:14pt 18pt;">
        <p style="font-size:13pt;color:${C.p60};margin:0;line-height:1.5;"><b>Expansion:</b> Indonesia, Ethiopia, Kenya, Colombia face identical EUDR pressure. Korea and Japan developing similar regulations.</p>
      </div>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 8 — TRACTION & MILESTONES
// ══════════════════════════════════════
const slide8 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.bg};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">Traction and Milestones</h2>
  </div>
  <div style="flex:1;display:flex;padding:20pt 48pt;gap:20pt;align-items:stretch;">
    <div style="width:312pt;flex-shrink:0;display:flex;flex-direction:column;gap:12pt;">
      <div style="display:flex;align-items:center;gap:12pt;padding:14pt 18pt;background:${C.surface};border-radius:8pt;border-left:4pt solid ${C.accent};">
        <p style="font-size:24pt;font-weight:bold;color:${C.accent};margin:0;white-space:nowrap;">4</p>
        <p style="font-size:14pt;color:${C.p80};margin:0;line-height:1.4;">Countries with pilot tenants deployed (VN, BR, ET, KE)</p>
      </div>
      <div style="display:flex;align-items:center;gap:12pt;padding:14pt 18pt;background:${C.surface};border-radius:8pt;border-left:4pt solid ${C.accentB};">
        <p style="font-size:24pt;font-weight:bold;color:${C.accentB};margin:0;white-space:nowrap;">7</p>
        <p style="font-size:14pt;color:${C.p80};margin:0;line-height:1.4;">Entity types modeled (producer to laboratory)</p>
      </div>
      <div style="display:flex;align-items:center;gap:12pt;padding:14pt 18pt;background:${C.surface};border-radius:8pt;border-left:4pt solid ${C.accentC};">
        <p style="font-size:24pt;font-weight:bold;color:${C.accentC};margin:0;white-space:nowrap;">5</p>
        <p style="font-size:14pt;color:${C.p80};margin:0;line-height:1.4;">Languages supported natively</p>
      </div>
      <div style="display:flex;align-items:center;gap:12pt;padding:14pt 18pt;background:${C.surface};border-radius:8pt;border-left:4pt solid ${C.p60};">
        <p style="font-size:24pt;font-weight:bold;color:${C.p60};margin:0;white-space:nowrap;">14</p>
        <p style="font-size:14pt;color:${C.p80};margin:0;line-height:1.4;">Traceability pipeline stages implemented</p>
      </div>
    </div>
    <div style="width:312pt;flex-shrink:0;display:flex;flex-direction:column;gap:12pt;">
      <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">Key Milestones</p>
      <div style="display:flex;align-items:flex-start;gap:10pt;padding:8pt 0;">
        <div style="width:8pt;height:8pt;border-radius:50%;background:${C.accent};flex-shrink:0;margin-top:5pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13pt;font-weight:bold;color:${C.p80};margin:0;">Q1 2026 \u2014 Platform MVP Complete</p>
          <p style="font-size:12pt;color:${C.p60};margin:0;">Full EUDR workflow operational</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;padding:8pt 0;">
        <div style="width:8pt;height:8pt;border-radius:50%;background:${C.accentB};flex-shrink:0;margin-top:5pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13pt;font-weight:bold;color:${C.p80};margin:0;">Q2 2026 \u2014 Vietnam Anchor Partner Live</p>
          <p style="font-size:12pt;color:${C.p60};margin:0;">Metrang trading company onboarding</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;padding:8pt 0;">
        <div style="width:8pt;height:8pt;border-radius:50%;background:${C.accentC};flex-shrink:0;margin-top:5pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13pt;font-weight:bold;color:${C.p80};margin:0;">Q3 2026 \u2014 Pilot DDS Generation</p>
          <p style="font-size:12pt;color:${C.p60};margin:0;">First production Due Diligence Statements</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;padding:8pt 0;">
        <div style="width:8pt;height:8pt;border-radius:50%;background:${C.p20};flex-shrink:0;margin-top:5pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13pt;font-weight:bold;color:${C.p80};margin:0;">Q4 2026 \u2014 Commercial Launch</p>
          <p style="font-size:12pt;color:${C.p60};margin:0;">Paid subscriptions, B2G engagement</p>
        </div>
      </div>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 9 — CLIMATE IMPACT (dark split — rhythm breaker)
// ══════════════════════════════════════
const slide9 = `<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C.p100};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;">
  <div style="display:flex;height:405pt;">
    <div style="width:260pt;background:${C.accentC};padding:48pt 28pt;display:flex;flex-direction:column;justify-content:center;">
      <p style="font-size:48pt;font-weight:bold;color:#FFFFFF;line-height:1.1;margin:0;">180K</p>
      <p style="font-size:16pt;font-weight:bold;color:#FFFFFF;margin:8pt 0 0 0;">Tonnes CO2e</p>
      <p style="font-size:13pt;color:rgba(255,255,255,0.8);margin:4pt 0 0 0;">avoided per year from prevented deforestation</p>
      <div style="width:32pt;height:3pt;background:rgba(255,255,255,0.5);margin-top:20pt;"></div>
    </div>
    <div style="flex:1;padding:32pt 36pt;display:flex;flex-direction:column;justify-content:center;gap:16pt;">
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:44pt;background:${C.accent};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C.onDark};margin:0 0 4pt 0;">Deforestation Prevention</p>
          <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.5;">15,000+ hectares under verified geolocation monitoring. 45,000 ha screened including buffer zones.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:44pt;background:${C.accentB};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C.onDark};margin:0 0 4pt 0;">Compliance Reduces Evasion</p>
          <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.5;">When compliance costs $299/mo instead of $40K/shipment, adoption becomes the path of least resistance.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:44pt;background:${C.accentC};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C.onDark};margin:0 0 4pt 0;">Regulations Become Enforceable</p>
          <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.5;">Infrastructure converts EUDR from regulation on paper to regulation in practice. Every exporter onboarded = deforestation evidence as default.</p>
        </div>
      </div>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 10 — BUSINESS MODEL
// ══════════════════════════════════════
const slide10 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.bg};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="width:720pt;height:56pt;background:${C.p90};display:flex;align-items:center;padding:0 48pt;">
    <h2 style="font-size:22pt;font-weight:bold;color:${C.onDark};margin:0;line-height:1.25;">Business Model</h2>
  </div>
  <div style="flex:1;display:flex;padding:20pt 48pt;gap:20pt;align-items:stretch;">
    <div style="width:200pt;flex-shrink:0;background:${C.surface};border-radius:10pt;padding:20pt;border-top:4pt solid ${C.accent};">
      <p style="font-size:24pt;font-weight:bold;color:${C.accent};margin:0 0 4pt 0;">$299</p>
      <p style="font-size:13pt;color:${C.p60};margin:0 0 12pt 0;">/month Starter</p>
      <ul style="font-size:12pt;color:${C.p60};margin:0;padding-left:16pt;line-height:18pt;">
        <li>Cooperatives</li>
        <li>1 entity type</li>
        <li>Basic traceability</li>
        <li>VN / EN language</li>
      </ul>
    </div>
    <div style="width:200pt;flex-shrink:0;background:${C.surface};border-radius:10pt;padding:20pt;border-top:4pt solid ${C.accentB};box-shadow:0 4pt 16pt rgba(0,0,0,0.1);">
      <p style="font-size:24pt;font-weight:bold;color:${C.accentB};margin:0 0 4pt 0;">$999</p>
      <p style="font-size:13pt;color:${C.p60};margin:0 0 12pt 0;">/month Growth</p>
      <ul style="font-size:12pt;color:${C.p60};margin:0;padding-left:16pt;line-height:18pt;">
        <li>Exporters / Importers</li>
        <li>Multi-entity management</li>
        <li>DDS generation</li>
        <li>5 languages + API</li>
      </ul>
    </div>
    <div style="width:200pt;flex-shrink:0;background:${C.surface};border-radius:10pt;padding:20pt;border-top:4pt solid ${C.accentC};">
      <p style="font-size:24pt;font-weight:bold;color:${C.accentC};margin:0 0 4pt 0;">$1,999</p>
      <p style="font-size:13pt;color:${C.p60};margin:0 0 12pt 0;">/month Enterprise</p>
      <ul style="font-size:12pt;color:${C.p60};margin:0;padding-left:16pt;line-height:18pt;">
        <li>Multi-origin operators</li>
        <li>Full pipeline + analytics</li>
        <li>Custom integrations</li>
        <li>Dedicated support</li>
      </ul>
    </div>
  </div>
  <div style="padding:0 48pt 20pt 48pt;display:flex;gap:16pt;">
    <div style="background:${C.p10};border-radius:6pt;padding:10pt 16pt;">
      <p style="font-size:12pt;color:${C.p60};margin:0;"><b>Compliance Add-On:</b> EUDR module + per-DDS fees beyond plan</p>
    </div>
    <div style="background:${C.p10};border-radius:6pt;padding:10pt 16pt;">
      <p style="font-size:12pt;color:${C.p60};margin:0;"><b>B2G Channel:</b> National monitoring infrastructure for government agencies</p>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 11 — THE TEAM (sidebar stat)
// ══════════════════════════════════════
const slide11 = `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${C.bg};font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:row;">
  <div style="width:200pt;height:405pt;background:${C.p90};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 24pt;">
    <p style="font-size:40pt;font-weight:bold;color:${C.accent};margin:0 0 8pt 0;line-height:1;text-align:center;">13</p>
    <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.4;text-align:center;">Years in Agritech</p>
    <div style="width:32pt;height:1.5pt;background:${C.accent};margin:20pt 0;"></div>
    <p style="font-size:40pt;font-weight:bold;color:${C.accentB};margin:0 0 8pt 0;line-height:1;text-align:center;">4</p>
    <p style="font-size:13pt;color:${C.onDarkSec};margin:0;line-height:1.4;text-align:center;">Countries Deployed</p>
  </div>
  <div style="width:520pt;display:flex;flex-direction:column;">
    <div style="padding:36pt 48pt 12pt 40pt;">
      <h2 style="font-size:22pt;font-weight:bold;color:${C.p80};margin:0;line-height:1.25;">The Team</h2>
    </div>
    <div style="padding:0 48pt 0 40pt;flex:1;display:flex;flex-direction:column;justify-content:center;gap:14pt;">
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:3pt;min-height:48pt;background:${C.accent};border-radius:2pt;margin-top:2pt;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">Deep Domain Expertise</p>
          <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.5;">Founded by a serial agritech entrepreneur who has built and deployed coffee traceability platforms across Vietnam, Brazil, Ethiopia, and Kenya \u2014 working inside cooperatives, export warehouses, and certification bodies.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:3pt;min-height:48pt;background:${C.accentB};border-radius:2pt;margin-top:2pt;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">Lived the Problem</p>
          <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.5;">Not a team learning the industry \u2014 a team that has lived inside the problem for over a decade. Firsthand experience with EUDR's impact on Vietnamese exporters.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:3pt;min-height:48pt;background:${C.accentC};border-radius:2pt;margin-top:2pt;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C.p80};margin:0 0 4pt 0;">Full-Stack SaaS Engineering</p>
          <p style="font-size:14pt;color:${C.p60};margin:0;line-height:1.5;">End-to-end product development capability \u2014 from architecture and design to deployment and scaling. Cloud-native, multi-tenant, multi-language from day one.</p>
        </div>
      </div>
    </div>
  </div>
</body>`;

// ══════════════════════════════════════
// SLIDE 12 — THE ASK (closing — dark)
// ══════════════════════════════════════
const slide12 = `<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-image:url('../coffee-farm.jpg');background-size:cover;background-position:center;font-family:'Palatino Linotype','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(45,27,16,0.85);"></div>
  <div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 80pt;">
    <div style="width:48pt;height:3pt;background:${C.accent};margin:0 0 24pt 0;"></div>
    <h1 style="font-size:34pt;font-weight:bold;color:${C.onDark};margin:0 0 16pt 0;line-height:1.15;text-align:center;">The Ask</h1>
    <p style="font-size:18pt;color:${C.onDarkSec};margin:0 0 28pt 0;line-height:1.5;text-align:center;max-width:500pt;">Investment support, corporate pilot partnerships, and government access to scale TerraBrew across Vietnam and the region.</p>
    <div style="width:40pt;height:2pt;background:rgba(255,255,255,0.3);margin:0 0 20pt 0;"></div>
    <p style="font-size:16pt;font-weight:bold;color:${C.accent};margin:0 0 6pt 0;">hello@terrabrew.io</p>
    <p style="font-size:14pt;color:${C.onDarkSec};margin:0;">terrabrew.io</p>
  </div>
</body>`;

// ══════════════════════════════════════
// Write and convert all slides
// ══════════════════════════════════════
async function build() {
  const slides = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8, slide9, slide10, slide11, slide12];
  
  // Write HTML files
  for (let i = 0; i < slides.length; i++) {
    const filePath = path.join(SLIDES_DIR, `slide${i + 1}.html`);
    fs.writeFileSync(filePath, slides[i]);
  }
  console.log(`Wrote ${slides.length} HTML slide files`);

  // Convert to PPTX
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'TerraBrew';
  pptx.title = 'TerraBrew - EUDR Compliance Infrastructure for the Coffee Supply Chain';

  const allWarnings = [];
  for (let i = 0; i < slides.length; i++) {
    const filePath = path.join(SLIDES_DIR, `slide${i + 1}.html`);
    console.log(`Converting slide ${i + 1}...`);
    try {
      const { slide, warnings } = await html2pptx(filePath, pptx, { fontConfig });
      if (warnings && warnings.length > 0) {
        console.log(`  Slide ${i + 1} warnings:`, warnings);
        allWarnings.push({ slide: i + 1, warnings });
      }
    } catch (err) {
      console.error(`  Slide ${i + 1} error:`, err.message);
    }
  }

  await pptx.writeFile({ fileName: OUTPUT });
  console.log(`\nPPTX saved to: ${OUTPUT}`);
  
  if (allWarnings.length > 0) {
    console.log('\nAll warnings:', JSON.stringify(allWarnings, null, 2));
  }
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

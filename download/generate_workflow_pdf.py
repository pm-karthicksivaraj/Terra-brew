#!/usr/bin/env python3
"""
Terra Brew Coffee Traceability Platform — E2E Workflow & Data Flow PDF Generator
Complete System Architecture, Role Workflows, and Data Flow Guide
"""

import os, sys, hashlib, subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, CondPageBreak, KeepTogether, Frame, PageTemplate
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ─── Font Registration ───
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Calibri Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman Bold')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ─── Color Palette (Coffee Brown) ───
ACCENT       = colors.HexColor('#a84e30')
TEXT_PRIMARY  = colors.HexColor('#1c1b19')
TEXT_MUTED    = colors.HexColor('#7e7a72')
BG_SURFACE   = colors.HexColor('#e4e1dc')
BG_PAGE      = colors.HexColor('#f2f1ef')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ─── Page dimensions ───
PAGE_W, PAGE_H = A4
LEFT_MARGIN = RIGHT_MARGIN = TOP_MARGIN = BOTTOM_MARGIN = 72
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ─── Output paths ───
OUTPUT_DIR = '/home/z/my-project/download'
BODY_PDF = os.path.join(OUTPUT_DIR, '_body_workflow.pdf')
COVER_PDF = os.path.join(OUTPUT_DIR, '_cover_workflow.pdf')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'terra-brew-e2e-workflow-dataflow.pdf')
COVER_HTML = os.path.join(OUTPUT_DIR, '_cover_workflow.html')

# ─── Styles ───
styles = getSampleStyleSheet()

style_h1 = ParagraphStyle(
    name='H1', fontName='Times New Roman', fontSize=18, leading=24,
    textColor=ACCENT, spaceBefore=12, spaceAfter=10, alignment=TA_LEFT
)
style_h2 = ParagraphStyle(
    name='H2', fontName='Times New Roman', fontSize=14, leading=19,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=8, alignment=TA_LEFT
)
style_h3 = ParagraphStyle(
    name='H3', fontName='Times New Roman', fontSize=12, leading=16,
    textColor=TEXT_PRIMARY, spaceBefore=8, spaceAfter=6, alignment=TA_LEFT
)
style_body = ParagraphStyle(
    name='Body', fontName='Times New Roman', fontSize=11, leading=16.5,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, alignment=TA_JUSTIFY
)
style_body_indent = ParagraphStyle(
    name='BodyIndent', fontName='Times New Roman', fontSize=11, leading=16.5,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, alignment=TA_JUSTIFY,
    leftIndent=18
)
style_bullet = ParagraphStyle(
    name='Bullet', fontName='Times New Roman', fontSize=11, leading=16.5,
    textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=2, alignment=TA_LEFT,
    leftIndent=24, bulletIndent=12
)
style_table_header = ParagraphStyle(
    name='TableHeader', fontName='Times New Roman', fontSize=9, leading=12,
    textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER
)
style_table_cell = ParagraphStyle(
    name='TableCell', fontName='Times New Roman', fontSize=9, leading=12,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
style_table_cell_left = ParagraphStyle(
    name='TableCellLeft', fontName='Times New Roman', fontSize=9, leading=12,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
style_toc_h1 = ParagraphStyle(
    name='TOCH1', fontName='Times New Roman', fontSize=13, leftIndent=20, leading=22,
    spaceBefore=6, spaceAfter=2, textColor=TEXT_PRIMARY
)
style_toc_h2 = ParagraphStyle(
    name='TOCH2', fontName='Times New Roman', fontSize=11, leftIndent=40, leading=18,
    spaceBefore=2, spaceAfter=2, textColor=TEXT_PRIMARY
)
style_toc_h3 = ParagraphStyle(
    name='TOCH3', fontName='Times New Roman', fontSize=10, leftIndent=60, leading=16,
    spaceBefore=1, spaceAfter=1, textColor=TEXT_MUTED
)
style_caption = ParagraphStyle(
    name='Caption', fontName='Times New Roman', fontSize=9, leading=13,
    textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6, alignment=TA_CENTER
)

# ─── TocDocTemplate ───
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ─── Helper functions ───
H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def add_major_section(text):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading('<b>%s</b>' % text, style_h1, level=0),
    ]

def add_subsection(text):
    return [add_heading('<b>%s</b>' % text, style_h2, level=1)]

def add_subsubsection(text):
    return [add_heading('<b>%s</b>' % text, style_h3, level=2)]

def body(text):
    return Paragraph(text, style_body)

def bullet(text):
    return Paragraph('<bullet>&bull;</bullet> ' + text, style_bullet)

def make_table(headers, rows, col_widths=None, caption=None):
    """Create a styled table with all cells as Paragraph objects."""
    data = []
    header_row = [Paragraph('<b>%s</b>' % h, style_table_header) for h in headers]
    data.append(header_row)
    for row in rows:
        data.append([Paragraph(str(c), style_table_cell) for c in row])

    if col_widths is None:
        n = len(headers)
        col_widths = [AVAILABLE_W / n] * n
    else:
        total = sum(col_widths)
        if total < AVAILABLE_W * 0.85:
            scale = (AVAILABLE_W * 0.92) / total
            col_widths = [w * scale for w in col_widths]

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))

    elements = [Spacer(1, 18), t]
    if caption:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(caption, style_caption))
    elements.append(Spacer(1, 18))
    return elements

def make_table_left_first(headers, rows, col_widths=None, caption=None):
    """Table where first column is left-aligned, rest centered."""
    data = []
    header_row = [Paragraph('<b>%s</b>' % h, style_table_header) for h in headers]
    data.append(header_row)
    for row in rows:
        cells = []
        for i, c in enumerate(row):
            if i == 0:
                cells.append(Paragraph(str(c), style_table_cell_left))
            else:
                cells.append(Paragraph(str(c), style_table_cell))
        data.append(cells)

    if col_widths is None:
        n = len(headers)
        col_widths = [AVAILABLE_W / n] * n
    else:
        total = sum(col_widths)
        if total < AVAILABLE_W * 0.85:
            scale = (AVAILABLE_W * 0.92) / total
            col_widths = [w * scale for w in col_widths]

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))

    elements = [Spacer(1, 18), t]
    if caption:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(caption, style_caption))
    elements.append(Spacer(1, 18))
    return elements


# ═══════════════════════════════════════════════════════════
# BUILD DOCUMENT CONTENT
# ═══════════════════════════════════════════════════════════

story = []

# ─── Table of Contents ───
toc = TableOfContents()
toc.levelStyles = [style_toc_h1, style_toc_h2, style_toc_h3]
story.append(Paragraph('<b>Table of Contents</b>', ParagraphStyle(
    name='TOCTitle', fontName='Times New Roman', fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=12, spaceAfter=18, alignment=TA_LEFT
)))
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════
# CHAPTER 1: Platform Architecture Overview
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 1: Platform Architecture Overview'))

# 1.1 Multi-Entity Architecture
story.extend(add_subsection('1.1 Multi-Entity Architecture'))
story.append(body(
    'The Terra Brew Coffee Traceability Platform is built on a multi-entity architecture that mirrors the real-world coffee '
    'supply chain. Seven distinct entity types form the backbone of the system, each representing a critical node in the journey '
    'of coffee from seed to cup. These entity types are: <b>Producer</b>, <b>Aggregator</b>, <b>Exporter</b>, <b>Importer</b>, '
    '<b>Buyer</b>, <b>Certification Body</b>, and <b>Laboratory</b>. Each entity type has its own data model, workflow, '
    'permission scheme, and module visibility configuration, ensuring that organizations only see and interact with the parts '
    'of the platform relevant to their role in the supply chain.'
))
story.append(body(
    'The Producer entity represents coffee farmers and farming cooperatives who cultivate coffee plants, manage land, and '
    'harvest cherries. Aggregators, such as cooperatives and mill operators, collect raw cherries from multiple producers, '
    'process them through washing, drying, and milling, and create exportable lots. Exporters manage the commercial side of '
    'moving processed coffee across borders, handling RFQs, smart contracts, export documentation, and regulatory compliance '
    'including EUDR. Importers receive shipments at destination ports, manage customs clearance, and distribute to domestic buyers. '
    'Buyers browse the marketplace, submit RFQs, sign contracts, and track shipments to their final destinations. Certification '
    'Bodies perform farm audits, compliance assessments, and issue certificates for organic, fair trade, and other standards. '
    'Laboratories conduct quality inspections, cupping tests, and generate QC reports that validate the quality grade of each lot.'
))
story.append(body(
    'The interaction between these entities is not merely sequential; it forms a rich network of data exchanges. Producers send '
    'harvest data to Aggregators, who combine it into lots with quality data from Laboratories. Exporters aggregate lot data into '
    'shipment manifests with EUDR compliance documentation. Importers verify shipment data and pass traceability records to Buyers. '
    'Certification Bodies provide independent verification at multiple points in this chain. This architecture ensures that every '
    'piece of data has a clear provenance and every handoff is recorded immutably on the blockchain layer.'
))

# 1.2 Role-Based Access Control
story.extend(add_subsection('1.2 Role-Based Access Control'))
story.append(body(
    'The platform implements a fine-grained role-based access control (RBAC) system with eight distinct roles that can be '
    'assigned across all seven entity types. This matrix-based approach ensures that users only access features relevant to '
    'their organizational role, preventing data leaks and maintaining operational security. The eight roles are: '
    '<b>tenant_admin</b>, <b>operations_manager</b>, <b>field_officer</b>, <b>quality_controller</b>, <b>trader</b>, '
    '<b>finance_manager</b>, <b>buyer</b>, and <b>viewer</b>. Each role carries a specific set of permissions that determine '
    'which modules are accessible and what actions (create, read, update, delete, approve) can be performed within each module.'
))
story.append(body(
    'The following matrix illustrates which roles are applicable to each entity type. A checkmark indicates that the role '
    'is valid and commonly assigned within that entity type, while a dash indicates that the role is not applicable or '
    'extremely rare for that entity type. This matrix serves as the foundation for user provisioning and permission management.'
))

rbac_headers = ['Role', 'Producer', 'Aggregator', 'Exporter', 'Importer', 'Buyer', 'Cert Body', 'Lab']
rbac_rows = [
    ['tenant_admin',       'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
    ['operations_manager', 'No',  'Yes', 'Yes', 'Yes', 'No',  'No',  'No'],
    ['field_officer',      'Yes', 'No',  'No',  'No',  'No',  'No',  'No'],
    ['quality_controller', 'No',  'Yes', 'No',  'No',  'No',  'Yes', 'Yes'],
    ['trader',             'No',  'Yes', 'Yes', 'Yes', 'No',  'No',  'No'],
    ['finance_manager',    'Yes', 'Yes', 'Yes', 'Yes', 'No',  'No',  'No'],
    ['buyer',              'No',  'No',  'Yes', 'No',  'Yes', 'No',  'No'],
    ['viewer',             'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
]
cw = [0.16, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12]
col_widths_rbac = [r * AVAILABLE_W for r in cw]
story.extend(make_table(rbac_headers, rbac_rows, col_widths_rbac,
    caption='Table 1.2: Role-Entity Applicability Matrix'))

# 1.3 Multi-Tenant Data Isolation
story.extend(add_subsection('1.3 Multi-Tenant Data Isolation'))
story.append(body(
    'The Terra Brew platform is a multi-tenant SaaS application where each tenant represents a distinct organization within '
    'the coffee supply chain. Data isolation is enforced at the database level through tenant scoping, ensuring that no '
    'organization can access or modify data belonging to another tenant. The platform currently supports six tenants, each '
    'configured with a specific entity type, geographic region, local currency, and language preferences.'
))
story.append(body(
    'Metrang Coffee (Vietnam, VND) operates as a Producer, managing smallholder farmers in the Central Highlands region. '
    'Cooxupe (Brazil, BRL) is an Aggregator, one of the largest coffee cooperatives in the world, processing cherries from '
    'thousands of member farmers. Yirgacheffe Union (Ethiopia, ETB) is a Producer cooperative famous for its heirloom '
    'varieties. Othaya Cooperative (Kenya, KES) is another Producer entity in the Nyeri highlands. Euro Coffee Imports '
    '(Netherlands, EUR) operates as an Exporter, facilitating the movement of African and South American coffees into '
    'European markets. SGS Inspection (Switzerland, CHF) is a Certification Body providing independent third-party auditing.'
))
story.append(body(
    'Tenant isolation is implemented through a combination of row-level security policies and application-level filtering. '
    'Every API request includes a tenant identifier extracted from the authenticated user session, and all database queries '
    'automatically append tenant-scoped WHERE clauses. Cross-tenant data sharing occurs only through explicitly defined '
    'handoff points, such as when an Aggregator receives harvest data from a Producer tenant, or when an Exporter creates '
    'a shipment manifest that references lots from an Aggregator tenant. These handoffs use a separate integration layer '
    'with strict validation and audit logging. The platform supports five languages (Vietnamese, English, Portuguese, Amharic, '
    'and Swahili), with each tenant configured to display the UI in the preferred language of its user base.'
))

tenant_headers = ['Tenant', 'Entity Type', 'Country', 'Currency', 'Language']
tenant_rows = [
    ['Metrang Coffee', 'Producer', 'Vietnam', 'VND', 'vi / en'],
    ['Cooxupe', 'Aggregator', 'Brazil', 'BRL', 'pt / en'],
    ['Yirgacheffe Union', 'Producer', 'Ethiopia', 'ETB', 'am / en'],
    ['Othaya Cooperative', 'Producer', 'Kenya', 'KES', 'sw / en'],
    ['Euro Coffee Imports', 'Exporter', 'Netherlands', 'EUR', 'en'],
    ['SGS Inspection', 'Certification Body', 'Switzerland', 'CHF', 'en'],
]
cw2 = [0.25, 0.20, 0.18, 0.12, 0.15]
col_widths_tenant = [r * AVAILABLE_W for r in cw2]
story.extend(make_table(tenant_headers, tenant_rows, col_widths_tenant,
    caption='Table 1.3: Multi-Tenant Configuration'))

# 1.4 Module Visibility Matrix
story.extend(add_subsection('1.4 Module Visibility Matrix'))
story.append(body(
    'The platform comprises 35 modules organized into 7 functional groups. Each module has a visibility level for each '
    'entity type: <b>Full</b> (complete read-write access), <b>View</b> (read-only access), or <b>Hidden</b> (module is '
    'not visible in the sidebar). This matrix determines the navigation structure that each user sees after logging in, '
    'ensuring that organizations only interact with modules relevant to their business operations. The following table '
    'provides the complete module visibility mapping across all seven entity types.'
))

module_visibility = [
    ('Dashboard', 'F','F','F','F','F','F','F'),
    ('Analytics', 'F','F','F','F','V','V','V'),
    ('Farmers', 'F','H','H','H','H','V','H'),
    ('Farm Lands', 'F','H','H','H','H','V','H'),
    ('Cultivations', 'F','H','H','H','H','H','H'),
    ('Nurseries', 'F','H','H','H','H','H','H'),
    ('Land Prep', 'F','H','H','H','H','H','H'),
    ('Crop Monitor', 'F','H','H','H','H','H','H'),
    ('Fertilizer', 'F','H','H','H','H','H','H'),
    ('Pest Disease', 'F','H','H','H','H','H','H'),
    ('Harvest Trace', 'F','V','H','H','V','H','H'),
    ('Procurement', 'F','F','H','H','V','H','H'),
    ('Processing', 'H','F','H','H','V','H','H'),
    ('Coffee Insp', 'V','V','H','H','V','F','F'),
    ('QC Verify', 'H','F','V','F','V','H','F'),
    ('EUDR', 'F','F','F','F','V','F','H'),
    ('Cert Assess', 'F','F','V','V','V','F','H'),
    ('Deforestation', 'F','F','V','H','V','F','H'),
    ('Marketplace', 'F','F','F','F','F','H','H'),
    ('RFQ', 'V','F','F','F','F','H','H'),
    ('Inspections', 'V','F','F','F','V','F','F'),
    ('Product Monitor', 'V','F','F','F','V','H','H'),
    ('Smart Contracts', 'H','F','F','F','F','H','H'),
    ('Trading Desk', 'H','F','F','F','F','H','H'),
    ('Shipments', 'H','F','F','F','V','H','H'),
    ('Logistics', 'H','F','F','F','V','H','H'),
    ('Export Docs', 'H','H','F','H','V','H','H'),
    ('Buyers', 'H','F','F','F','F','H','H'),
    ('Trace Journey', 'F','F','F','F','F','V','H'),
    ('Billing', 'F','F','F','F','V','F','F'),
    ('Users', 'F','F','F','F','H','F','F'),
    ('IoT Sensors', 'F','F','H','H','H','H','H'),
    ('Blockchain', 'F','F','F','F','V','H','H'),
    ('API Settings', 'F','F','F','F','H','H','H'),
]

ent_types = ['Producer', 'Aggregator', 'Exporter', 'Importer', 'Buyer', 'Cert Body', 'Lab']
mod_headers = ['Module'] + ent_types
# Split into two pages: first 17 modules, then remaining 17
mid = 17
mod_rows_1 = [[m[0]] + [('Full' if v=='F' else 'View' if v=='V' else 'Hidden') for v in m[1:]] for m in module_visibility[:mid]]
mod_rows_2 = [[m[0]] + [('Full' if v=='F' else 'View' if v=='V' else 'Hidden') for v in m[1:]] for m in module_visibility[mid:]]

cw3 = [0.20] + [0.114] * 7
col_widths_mod = [r * AVAILABLE_W for r in cw3]
story.extend(make_table_left_first(mod_headers, mod_rows_1, col_widths_mod,
    caption='Table 1.4a: Module Visibility Matrix (Part 1 of 2)'))
story.extend(make_table_left_first(mod_headers, mod_rows_2, col_widths_mod,
    caption='Table 1.4b: Module Visibility Matrix (Part 2 of 2)'))


# ═══════════════════════════════════════════════════════════
# CHAPTER 2: E2E Coffee Supply Chain Data Flow
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 2: E2E Coffee Supply Chain Data Flow'))

# 2.1
story.extend(add_subsection('2.1 The Coffee Journey: Seed to Cup'))
story.append(body(
    'The journey of coffee from seed to cup traverses multiple organizations, geographies, and regulatory regimes. '
    'Understanding this journey is essential to grasping why the Terra Brew platform structures its data flows the way '
    'it does. The coffee supply chain begins at the nursery, where selected varietals are germinated and nurtured into '
    'seedlings. These seedlings are transplanted to prepared farm land, where they grow for three to five years before '
    'producing their first viable harvest. During the cultivation phase, farmers manage fertilization schedules, monitor '
    'for pest and disease outbreaks, and track environmental conditions that affect crop health.'
))
story.append(body(
    'When cherries reach optimal ripeness, they are selectively picked by hand (for specialty coffee) or strip-picked '
    '(for commodity grades). The harvest trace module records picking dates, quantities, varietal information, and the '
    'specific plot of land from which each batch originated. This data becomes the first link in the traceability chain. '
    'Cherries are then transported to a processing facility, typically operated by an Aggregator, where they undergo '
    'one of several processing methods: washed (wet), natural (dry), honey (semi-washed), or experimental anaerobic '
    'fermentation. Each processing method creates distinct flavor profiles and is recorded with precise parameters '
    'including fermentation times, temperatures, and drying durations.'
))
story.append(body(
    'After processing, the green coffee is milled to remove parchment, sorted by size and density, and graded by quality. '
    'Laboratories perform cupping tests following SCA protocols, assigning scores that determine market value. The graded '
    'lots are listed on the marketplace where Exporters and Importers negotiate prices through RFQs and smart contracts. '
    'Exporters prepare shipping documentation, including bills of lading, phytosanitary certificates, and EUDR Due '
    'Diligence Statements. The coffee travels by sea freight to the destination port, where the Importer clears customs '
    'and arranges inland transport. Finally, the coffee reaches the Buyer, who may be a roaster, retailer, or consumer '
    'brand, completing the journey from seed to cup with a complete digital traceability record accessible via QR code.'
))

# 2.2
story.extend(add_subsection('2.2 Data Entry Points'))
story.append(body(
    'Data entry in the Terra Brew platform is distributed across roles and entity types, with each user contributing '
    'specific data at defined stages of the supply chain. This distributed data entry model ensures that information '
    'is captured at the source by the person most qualified to provide it, reducing transcription errors and ensuring '
    'data freshness. The Field Officer is the primary data entry point for the Producer entity, enrolling farmers, '
    'mapping farm boundaries using GPS, recording cultivation activities, and logging harvest data. The Operations '
    'Manager at an Aggregator enters processing batch data, lot creation details, and inventory movements. Quality '
    'Controllers at Laboratories and Certification Bodies enter inspection results, cupping scores, and compliance '
    'assessment outcomes. Traders manage RFQs, negotiate prices, and execute smart contracts. Finance Managers handle '
    'billing, payment reconciliation, and cost tracking. Buyers submit RFQs and confirm receipt of shipments.'
))
story.append(body(
    'Each data entry point has built-in validation rules. For example, harvest quantities must fall within expected '
    'ranges based on the farm size and historical yields. Cupping scores must follow the 0-100 SCA scale. GPS coordinates '
    'must fall within recognized coffee-growing regions. Smart contract values must match the negotiated terms from the '
    'RFQ process. These validations prevent common data quality issues and ensure that downstream analytics and compliance '
    'reports are built on reliable data. The platform also supports IoT sensor integration, allowing automated data capture '
    'for temperature, humidity, and soil moisture readings, reducing the manual data entry burden on Field Officers.'
))

# Data entry points table
de_headers = ['Supply Chain Stage', 'Data Entered', 'Primary Role', 'Entity Type']
de_rows = [
    ['Nursery', 'Seedling batches, varietal, planting dates', 'Field Officer', 'Producer'],
    ['Land Preparation', 'Plot boundaries, soil analysis, altitude', 'Field Officer', 'Producer'],
    ['Cultivation', 'Fertilizer schedules, pest treatments, pruning', 'Field Officer', 'Producer'],
    ['Crop Monitoring', 'Growth stages, flowering, cherry development', 'Field Officer', 'Producer'],
    ['Harvest', 'Cherry quantities, picking dates, plot ID', 'Field Officer', 'Producer'],
    ['Procurement', 'Delivery weights, cherry prices, farmer payments', 'Ops Manager', 'Aggregator'],
    ['Processing', 'Method, fermentation time, drying duration', 'Ops Manager', 'Aggregator'],
    ['Quality Inspection', 'Cupping scores, defect counts, moisture %', 'QC Inspector', 'Lab / Cert Body'],
    ['Lot Creation', 'Lot composition, grade, warehouse location', 'Ops Manager', 'Aggregator'],
    ['Marketplace Listing', 'Lot details, price, minimum order qty', 'Trader', 'Aggregator / Exporter'],
    ['RFQ', 'Quantity, quality spec, delivery terms', 'Trader / Buyer', 'Exporter / Importer'],
    ['Smart Contract', 'Contract terms, price, shipment schedule', 'Trader', 'Exporter / Importer'],
    ['Export Documentation', 'B/L, phytosanitary cert, EUDR DDS', 'Ops Manager', 'Exporter'],
    ['Shipment Tracking', 'Vessel, ETA, container number', 'Trader', 'Exporter / Importer'],
    ['Customs Clearance', 'Duty paid, customs release date', 'Ops Manager', 'Importer'],
    ['Delivery Confirmation', 'Received qty, quality check at destination', 'Buyer', 'Buyer'],
]
cw4 = [0.18, 0.38, 0.18, 0.22]
col_widths_de = [r * AVAILABLE_W for r in cw4]
story.extend(make_table_left_first(de_headers, de_rows, col_widths_de,
    caption='Table 2.2: Data Entry Points by Supply Chain Stage'))

# 2.3
story.extend(add_subsection('2.3 Verification and Quality Gates'))
story.append(body(
    'Quality gates are critical control points in the data flow where information is verified, validated, and either '
    'approved or rejected. These gates prevent erroneous or fraudulent data from propagating through the supply chain, '
    'maintaining the integrity of the traceability record. The first quality gate occurs at procurement, where the '
    'Aggregator verifies that the delivered cherry weight matches the farmer-reported harvest quantity within an acceptable '
    'tolerance (typically plus or minus 5 percent). Significant discrepancies trigger an investigation workflow. The second '
    'quality gate is at processing, where the Aggregator confirms that the processing method and parameters align with the '
    'lot classification. The third and most stringent quality gate is the laboratory inspection, where certified Q-graders '
    'perform blind cupping tests and assign scores that determine the lot grade and market value.'
))
story.append(body(
    'EUDR compliance represents another critical quality gate. Before a shipment can be exported, the Deforestation Due '
    'Diligence Statement must be generated, requiring satellite imagery verification that the farm land was not deforested '
    'after December 31, 2020. The platform integrates with satellite monitoring services to automate this verification. '
    'Smart contract execution is also gated, requiring both parties to digitally sign the contract terms, which are then '
    'recorded on the blockchain for immutability. At the final delivery stage, the Buyer confirms receipt and can verify '
    'the complete traceability chain from the original farm to the delivered shipment, providing the ultimate quality '
    'gate in the consumer-facing traceability workflow.'
))

# 2.4
story.extend(add_subsection('2.4 Cross-Entity Data Flow'))
story.append(body(
    'Data flows between entities in the Terra Brew platform follow a structured handoff protocol that ensures data '
    'integrity and traceability across organizational boundaries. The primary data flow follows the physical supply '
    'chain: Producer to Aggregator to Exporter to Importer to Buyer. However, there are also lateral data flows to '
    'Certification Bodies and Laboratories that operate independently of the primary chain. When a Producer records '
    'harvest data, it is stored within the Producer tenant. When the Aggregator receives the cherries, a procurement '
    'record is created that references the original harvest data through a cross-tenant reference. This reference is '
    'not a direct database join but rather a secure API call that retrieves a hash-verified copy of the data, ensuring '
    'that the Aggregator sees the Producer data but cannot modify it.'
))
story.append(body(
    'The Exporter receives lot data from the Aggregator, including quality grades, lot compositions, and origin details. '
    'This data is used to create marketplace listings and respond to RFQs. When a smart contract is signed, the lot data, '
    'contract terms, and compliance documents are bundled into a shipment manifest. The Importer receives this manifest '
    'and uses it for customs clearance. The Buyer receives a subset of the shipment data through the Trace Journey module, '
    'which presents a consumer-friendly view of the coffee journey. Throughout this chain, the blockchain layer records '
    'hashes of each data handoff, creating an immutable audit trail. If any party disputes a data point, the blockchain '
    'record can be used to verify the original data at the time of handoff. This cross-entity data flow architecture '
    'ensures that the traceability chain remains unbroken from the first data entry point to the final consumer query.'
))


# ═══════════════════════════════════════════════════════════
# CHAPTER 3: Role-by-Role Workflow Maps
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 3: Role-by-Role Workflow Maps'))

# 3.1 Tenant Administrator
story.extend(add_subsection('3.1 Tenant Administrator'))
story.append(body(
    'The Tenant Administrator is the most privileged role in the Terra Brew platform, responsible for the complete '
    'configuration and management of the tenant environment. This role has unrestricted access to all modules available '
    'to the tenant entity type and can perform all CRUD operations. The primary responsibilities of a Tenant Administrator '
    'include user management (creating, modifying, and deactivating user accounts, assigning roles, and managing '
    'permissions), tenant configuration (setting currency, language, timezone, and branding preferences), module '
    'configuration (enabling or disabling specific modules and adjusting visibility settings), billing management '
    '(viewing invoices, managing payment methods, and tracking subscription usage), and API settings (configuring '
    'webhooks, managing API keys, and setting up third-party integrations).'
))
story.append(body(
    'Upon first login, the Tenant Administrator is greeted by the Dashboard, which provides an executive overview of '
    'key metrics, recent activity, and system health indicators. From here, the administrator navigates to the Users '
    'module to provision accounts for team members, assigning each user the appropriate role based on their job function. '
    'The Billing module displays the current subscription plan, usage statistics, and invoice history. The API Settings '
    'module allows the administrator to generate API keys for integration with ERP systems, accounting software, or '
    'custom applications. The Tenant Administrator also has the authority to configure data validation rules, set '
    'approval workflows for quality gates, and define notification preferences for the entire organization. This role '
    'is critical during the initial platform setup phase and ongoing system administration.'
))

# 3.2 Operations Manager
story.extend(add_subsection('3.2 Operations Manager'))
story.append(body(
    'The Operations Manager is the day-to-day orchestrator of supply chain activities within the Aggregator and Exporter '
    'entity types. This role focuses on the efficient flow of coffee from receipt to shipment, ensuring that processing '
    'schedules are met, quality standards are maintained, and inventory is accurately tracked. The Operations Manager '
    'oversees the procurement process, recording cherry deliveries from farmers, weighing and grading incoming lots, '
    'and initiating farmer payments through the Finance Manager. During processing, the Operations Manager monitors '
    'fermentation tanks, drying beds, and milling equipment, recording batch parameters and processing outcomes.'
))
story.append(body(
    'The Operations Manager creates lots from processed coffee, assigning quality grades based on laboratory results '
    'and preparing lots for marketplace listing. For Exporter entities, this role also manages export documentation, '
    'including phytosanitary certificates, certificates of origin, and EUDR Due Diligence Statements. The Operations '
    'Manager coordinates with the Trader role to ensure that lots are listed at competitive prices and that shipment '
    'schedules align with contract delivery terms. Key modules for this role include Procurement, Processing, QC Verify, '
    'Shipments, Logistics, and Export Docs. The Dashboard provides operational KPIs such as processing throughput, '
    'inventory levels, and pending shipment statuses, enabling data-driven decision-making for resource allocation '
    'and process optimization.'
))

# 3.3 Field Officer
story.extend(add_subsection('3.3 Field Officer'))
story.append(body(
    'The Field Officer is the frontline data collector for the Producer entity type, responsible for enrolling farmers, '
    'mapping farm boundaries, recording cultivation activities, and logging harvest data. This role is unique to the '
    'Producer entity and is critical for establishing the foundational data layer of the traceability chain. Field '
    'Officers typically operate in remote rural areas with limited internet connectivity, so the platform supports '
    'offline data capture with automatic synchronization when connectivity is restored. The primary modules for the '
    'Field Officer are Farmers, Farm Lands, Cultivations, Nurseries, Land Prep, Crop Monitor, Fertilizer, Pest '
    'Disease, and Harvest Trace.'
))
story.append(body(
    'The farmer enrollment workflow begins with the Field Officer visiting a farm, collecting the farmer personal '
    'details, and capturing GPS coordinates of the farm boundary using the mobile application. The farm land mapping '
    'feature uses polygon drawing tools to define the exact boundaries of each plot, which is essential for EUDR '
    'compliance verification. During the cultivation phase, the Field Officer records planting dates, varietal '
    'selection, fertilizer applications, and pest or disease treatments. As the crop matures, the Field Officer '
    'monitors growth stages, flowering periods, and cherry development. At harvest time, the Field Officer records '
    'the quantity of cherries picked from each plot, the picking method (selective or strip), and the date of harvest. '
    'All this data forms the provenance record that follows the coffee through the entire supply chain, providing the '
    'traceability foundation that end consumers can verify through QR codes on the final product packaging.'
))

# 3.4 Quality Controller
story.extend(add_subsection('3.4 Quality Controller'))
story.append(body(
    'The Quality Controller role is shared across three entity types: Aggregator, Certification Body, and Laboratory. '
    'At each entity, the focus differs but the core responsibility remains the same: ensuring that quality standards '
    'are met and documented. For Aggregators, the Quality Controller performs in-house inspections of processed coffee, '
    'checking moisture content, defect counts, bean size distribution, and conducting preliminary cupping assessments. '
    'For Certification Bodies, the Quality Controller conducts formal farm audits, assessing compliance with organic, '
    'fair trade, Rainforest Alliance, or other certification standards. For Laboratories, the Quality Controller '
    'performs definitive quality testing using standardized protocols, generating official QC reports.'
))
story.append(body(
    'The quality control workflow begins with sample receipt, where the Quality Controller logs the incoming sample, '
    'verifies its provenance through the lot reference number, and assigns it a unique sample identifier. Physical '
    'inspection follows, including visual assessment for defects, moisture measurement using calibrated instruments, '
    'and bean size grading using standard sieves. Cupping is performed following SCA (Specialty Coffee Association) '
    'protocols: the sample is roasted to a light profile, rested for 8-24 hours, ground, and evaluated for fragrance, '
    'aroma, flavor, aftertaste, acidity, body, balance, uniformity, clean cup, sweetness, and overall impression. '
    'Each attribute is scored on a 0-10 scale, with the total cupping score determining the quality grade. The '
    'Quality Controller records all findings in the platform, generating a QC report that becomes part of the '
    'permanent traceability record. For Certification Bodies, the workflow extends to scheduling and conducting farm '
    'audits, reviewing farmer documentation, and issuing or renewing certificates based on compliance scores.'
))

# 3.5 Trader
story.extend(add_subsection('3.5 Trader'))
story.append(body(
    'The Trader role is the commercial engine of the Terra Brew platform, responsible for managing the marketplace, '
    'responding to RFQs, negotiating prices, and executing smart contracts. This role is available in the Aggregator, '
    'Exporter, and Importer entity types. For Aggregators, the Trader lists processed lots on the marketplace, setting '
    'prices and minimum order quantities. For Exporters, the Trader responds to buyer RFQs, negotiates contract terms, '
    'and manages the smart contract lifecycle from creation through execution. For Importers, the Trader sources coffee '
    'from multiple origins, submitting RFQs to Exporters and managing the procurement pipeline.'
))
story.append(body(
    'The trading workflow begins when a Trader reviews available inventory in the Marketplace module and creates a '
    'listing with lot details, quality grade, price per unit, and available quantity. When a buyer submits an RFQ, '
    'the Trader receives a notification and can accept, counter-offer, or decline. Price negotiation occurs through '
    'the RFQ messaging system, with each counter-offer recorded for audit purposes. Once terms are agreed, the Trader '
    'initiates a Smart Contract, which captures the commercial terms (price, quantity, quality spec, delivery date, '
    'payment terms) and presents them for digital signature by both parties. After signing, the contract is recorded '
    'on the blockchain, and the Trader moves to the Trading Desk to manage active positions and track market prices. '
    'The Trader also coordinates with the Operations Manager to ensure that shipment schedules align with contract '
    'delivery commitments, using the Shipments and Logistics modules to track the physical movement of coffee.'
))

# 3.6 Finance Manager
story.extend(add_subsection('3.6 Finance Manager'))
story.append(body(
    'The Finance Manager role oversees all financial operations within the platform, including billing, payments, '
    'procurement costs, and financial reporting. This role is available across Producer, Aggregator, Exporter, and '
    'Importer entity types. The Finance Manager has access to the Billing module, which displays the platform '
    'subscription details, usage metrics, and invoice history. For Producers, the Finance Manager tracks farmer '
    'payment schedules, ensuring that cherry delivery payments are calculated correctly based on weight, quality '
    'grade, and the prevailing market price. For Aggregators, the Finance Manager oversees procurement costs, '
    'processing expenses, and margin calculations for lot sales.'
))
story.append(body(
    'For Exporters and Importers, the Finance Manager handles the more complex financial flows associated with '
    'international trade, including letter of credit management, currency exchange calculations, and duty payments. '
    'The Billing module provides a comprehensive view of all financial transactions, with filters for date range, '
    'entity, and transaction type. The Finance Manager can generate financial reports that aggregate data across '
    'all modules, providing insights into profitability by origin, margin by quality grade, and cost breakdowns by '
    'supply chain stage. Payment reconciliation features allow the Finance Manager to match incoming payments against '
    'outstanding invoices, flagging discrepancies for review. The Users module is also accessible to the Finance '
    'Manager for reviewing user activity logs related to financial transactions, supporting audit compliance requirements.'
))

# 3.7 Buyer
story.extend(add_subsection('3.7 Buyer'))
story.append(body(
    'The Buyer role represents the demand side of the coffee supply chain, encompassing roasters, consumer brands, '
    'and retail organizations that purchase green coffee. This role is available in the Exporter and Buyer entity types. '
    'For the Exporter entity, the Buyer role represents internal purchasing agents who source coffee from origin '
    'markets. For the Buyer entity type, this role represents external organizations that purchase coffee through '
    'the marketplace. The Buyer workflow begins with browsing the Marketplace, where available lots are displayed '
    'with origin details, quality grades, cupping notes, and pricing information. The Buyer can filter lots by '
    'country, region, varietal, processing method, quality score, and price range.'
))
story.append(body(
    'When a suitable lot is identified, the Buyer submits an RFQ specifying the desired quantity, quality parameters, '
    'delivery terms, and target price. The RFQ is routed to the relevant Trader, who may accept, counter-offer, or '
    'decline. Upon agreement, the Buyer reviews and digitally signs the Smart Contract, which legally binds both '
    'parties to the transaction terms. After contract execution, the Buyer uses the Shipments module to track the '
    'physical movement of coffee from origin to destination, receiving real-time updates on vessel location, estimated '
    'arrival time, and customs clearance status. Upon delivery, the Buyer confirms receipt in the platform, recording '
    'the actual delivered quantity and conducting a quality verification. The Trace Journey module provides the Buyer '
    'with a complete provenance record, from the farm where the coffee was grown to the laboratory where it was graded, '
    'offering full supply chain transparency that can be shared with end consumers through QR code verification.'
))

# 3.8 Viewer
story.extend(add_subsection('3.8 Viewer'))
story.append(body(
    'The Viewer role provides read-only access to the Terra Brew platform, designed for stakeholders who need visibility '
    'into supply chain data without the ability to create, modify, or delete records. This role is available across all '
    'seven entity types and is commonly assigned to executives, board members, investors, regulatory inspectors, and '
    'external auditors who require access to reports and dashboards but should not be able to alter operational data. '
    'The Viewer can access the Dashboard, which presents key performance indicators and summary metrics relevant to '
    'the entity type. Viewers at Producer organizations can see farm-level statistics and harvest reports. Viewers at '
    'Aggregator organizations can see processing throughput and inventory levels. Viewers at Exporter organizations can '
    'see shipment statuses and contract pipelines.'
))
story.append(body(
    'The Viewer role has access to the Analytics module, which provides advanced data visualization and reporting '
    'capabilities. Pre-built report templates include harvest yield analysis, quality trend reports, financial '
    'summaries, and compliance dashboards. Viewers can customize report parameters such as date range, geographic '
    'region, and quality grade, but cannot create or modify the underlying data. The Trace Journey module is also '
    'accessible in read-only mode, allowing Viewers to trace the complete provenance of any lot or shipment. The '
    'Viewer role is essential for maintaining organizational transparency and supporting data-driven governance '
    'without compromising data integrity. It also serves as a safe onboarding role for new users who need to '
    'familiarize themselves with the platform before being assigned operational permissions.'
))


# ═══════════════════════════════════════════════════════════
# CHAPTER 4: Entity-Specific Workflows
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 4: Entity-Specific Workflows'))

# 4.1 Producer
story.extend(add_subsection('4.1 Producer Workflow'))
story.append(body(
    'The Producer workflow encompasses the entire agricultural lifecycle of coffee, from nursery management through '
    'harvest delivery. It begins with farmer enrollment, where the Field Officer visits the farm, collects the farmer '
    'personal information (name, national ID, contact details, GPS location), and creates a farmer profile in the '
    'platform. Next, the Field Officer maps the farm land using the mobile application GPS tools, drawing polygons '
    'that define the exact boundaries of each plot. This mapping is critical for EUDR compliance, as it enables '
    'satellite-based deforestation monitoring. The system records the plot area, altitude, slope aspect, and soil type.'
))
story.append(body(
    'During the cultivation phase, the Field Officer records all agricultural activities: nursery seedling planting, '
    'land preparation (clearing, terracing, shade management), planting of seedlings in the field, fertilizer '
    'applications (type, quantity, date), pest and disease treatments (chemical or organic), pruning activities, '
    'and crop monitoring observations (growth stage, flowering status, cherry development). Each activity is '
    'timestamped and geolocated, creating a detailed agronomic record. When cherries reach peak ripeness, the '
    'harvest is recorded in the Harvest Trace module, capturing the date, plot, quantity, varietal, and picking '
    'method. The harvested cherries are then delivered to the Aggregator, creating a procurement record that links '
    'the harvest data to the Aggregator processing batch. The Producer can also access the EUDR and Deforestation '
    'modules to view their compliance status and deforestation risk assessment. The Billing module shows farmer '
    'payment records and the Blockchain module displays the immutable hash chain for all Producer data.'
))

# 4.2 Aggregator
story.extend(add_subsection('4.2 Aggregator Workflow'))
story.append(body(
    'The Aggregator workflow begins when cherries arrive at the processing facility. The Procurement module records '
    'each delivery, capturing the farmer ID, cherry weight, delivery date, and agreed price. A weighing ticket is '
    'generated and linked to the farmer profile. The Operations Manager oversees the processing workflow, which '
    'varies by processing method. For washed coffee, cherries are depulped, fermented in tanks for 12-72 hours, '
    'washed to remove mucilage, and dried on raised beds or in mechanical dryers. For natural coffee, cherries are '
    'dried whole on patios or raised beds. Each processing batch is recorded in the Processing module with parameters '
    'including method, fermentation time, drying temperature, humidity, and duration.'
))
story.append(body(
    'After processing and drying to the target moisture content (typically 10-12 percent), the coffee is milled to '
    'remove parchment and sorted by bean size using standard sieves. The Quality Controller performs preliminary '
    'inspections, and samples are sent to Laboratories for official cupping and grading. Based on the laboratory '
    'results, the Operations Manager creates lots in the platform, combining processed coffee from multiple batches '
    'into marketable lots with consistent quality profiles. Each lot is assigned a unique identifier, quality grade, '
    'and warehouse location. The Trader then lists the lots on the Marketplace, setting prices and availability. '
    'When an RFQ is received, the Trader negotiates and, upon agreement, initiates a Smart Contract. The Aggregator '
    'also manages the EUDR compliance workflow, generating Due Diligence Statements for lots destined for EU markets. '
    'The Trace Journey module enables full backward tracing from any lot to the original farms and forward tracing '
    'to the Exporter who purchased the lot.'
))

# 4.3 Exporter
story.extend(add_subsection('4.3 Exporter Workflow'))
story.append(body(
    'The Exporter workflow centers on the commercial and logistical aspects of moving coffee from origin countries to '
    'destination markets. It begins with the Trader responding to RFQs from Importers and Buyers. The Exporter '
    'reviews available inventory (either own stock or lots sourced from Aggregators), evaluates the buyer '
    'requirements, and prepares a quotation. If the buyer accepts, a Smart Contract is created that captures the '
    'commercial terms: price, quantity, quality specification, delivery schedule, and payment terms. Both parties '
    'digitally sign the contract, which is then recorded on the blockchain for immutability.'
))
story.append(body(
    'After contract execution, the Operations Manager takes over to prepare the shipment. The Export Docs module is '
    'used to generate all required documentation: bill of lading, phytosanitary certificate, certificate of origin, '
    'packing list, and the EUDR Due Diligence Statement. The EUDR module is particularly critical for Exporters, '
    'as they are legally responsible for ensuring that coffee exported to the EU meets deforestation-free requirements. '
    'The Deforestation module provides satellite-based risk assessments for each farm contributing to the shipment. '
    'The Shipments module tracks the physical movement of containers from the warehouse to the port, onto the vessel, '
    'and through transit to the destination port. The Logistics module manages the coordination of inland transport, '
    'container stuffing, and port logistics. The Buyer role within the Exporter entity can also browse the marketplace '
    'to source additional lots from Aggregators to fulfill contract commitments.'
))

# 4.4 Importer
story.extend(add_subsection('4.4 Importer Workflow'))
story.append(body(
    'The Importer workflow represents the receiving end of international coffee trade. The Trader at the Importer '
    'organization submits RFQs to Exporters, specifying the desired origin, quality, quantity, and delivery terms. '
    'Upon receiving quotations, the Trader evaluates options from multiple Exporters, considering price, quality, '
    'and reliability. After selecting a supplier, the Trader reviews and signs the Smart Contract. The contract '
    'execution triggers the shipment tracking workflow. The Shipments module provides real-time visibility into '
    'the vessel location, estimated time of arrival, and container status.'
))
story.append(body(
    'When the shipment arrives at the destination port, the Operations Manager uses the Logistics module to coordinate '
    'customs clearance, arranging for the payment of import duties and obtaining customs release. The QC Verify module '
    'is used to record the results of quality checks performed on the received coffee, comparing the actual quality '
    'against the contract specifications. Discrepancies are flagged for resolution through the smart contract '
    'dispute mechanism. After clearance, the Operations Manager arranges inland transport to the final delivery '
    'location. The Billing module tracks all costs associated with the import process, including the purchase price, '
    'shipping costs, insurance, duties, and handling fees, providing a complete landed cost calculation. The '
    'Trace Journey module enables the Importer to trace any received shipment back to its origin farms, supporting '
    'the due diligence requirements of EUDR and other regulatory frameworks.'
))

# 4.5 Buyer
story.extend(add_subsection('4.5 Buyer Workflow'))
story.append(body(
    'The Buyer workflow focuses on sourcing, procurement, and traceability verification. The Buyer begins by '
    'browsing the Marketplace, which displays available lots from Aggregators and Exporters. The marketplace '
    'supports filtering by origin country, region, varietal, processing method, quality score (SCA grade), '
    'certification type, and price. Each listing includes detailed lot information, cupping notes, and a '
    'traceability summary. When the Buyer identifies a suitable lot, they submit an RFQ through the platform, '
    'specifying the desired quantity, quality parameters, delivery destination, and target price.'
))
story.append(body(
    'The RFQ process supports multiple rounds of negotiation, with each counter-offer recorded for transparency. '
    'Once terms are agreed, the Buyer reviews the Smart Contract, verifying all commercial and quality terms before '
    'digitally signing. After contract execution, the Buyer uses the Shipments module to track the delivery progress. '
    'Real-time updates include vessel departure, transit milestones, port arrival, customs clearance, and inland '
    'transport. Upon receiving the shipment, the Buyer confirms delivery in the platform, recording the actual '
    'received quantity and conducting a quality verification. The Trace Journey module provides the Buyer with a '
    'complete provenance record, from the farm where the coffee was grown through every processing, quality, and '
    'logistics step. This record can be shared with end consumers through QR codes printed on the final product '
    'packaging, enabling consumer-facing traceability that builds brand trust and supports sustainability claims.'
))

# 4.6 Certification Body
story.extend(add_subsection('4.6 Certification Body Workflow'))
story.append(body(
    'The Certification Body workflow is centered on the assessment, auditing, and certification of farms, '
    'aggregators, and processing facilities against recognized standards such as organic, fair trade, Rainforest '
    'Alliance, UTZ, and 4C. The workflow begins with assessment scheduling, where the Certification Body assigns '
    'auditors to specific farms or facilities based on the certification program requirements and the client '
    'application timeline. The platform supports calendar management for auditor scheduling, with integration '
    'to the Inspections module for tracking upcoming and completed audits.'
))
story.append(body(
    'During a farm audit, the Quality Controller (auditor) uses the platform to record observations across '
    'multiple compliance criteria. For organic certification, this includes verification of no prohibited substance '
    'use, buffer zone maintenance, and soil management practices. For fair trade certification, the auditor assesses '
    'labor practices, minimum price compliance, and community development fund contributions. Each criterion is '
    'scored, and the aggregate compliance score determines whether the certificate is issued, conditionally issued '
    '(with corrective actions required), or denied. The Cert Assess module provides the framework for recording '
    'all assessment data, including photographic evidence, GPS-verified locations, and auditor notes. When a '
    'certificate is issued, it is recorded in the platform with a validity period, and the system automatically '
    'generates renewal reminders. The EUDR module enables the Certification Body to provide third-party '
    'verification of deforestation-free status for farms seeking EU market access.'
))

# 4.7 Laboratory
story.extend(add_subsection('4.7 Laboratory Workflow'))
story.append(body(
    'The Laboratory workflow follows a standardized quality testing protocol that produces authoritative quality '
    'reports used throughout the supply chain for pricing, classification, and regulatory compliance. The workflow '
    'begins with sample receipt, where the laboratory logs the incoming sample against a lot reference number, '
    'verifying the chain of custody and sample integrity. Each sample is assigned a unique identifier and stored '
    'under controlled conditions until testing begins. The Coffee Inspection module records the preliminary '
    'physical assessment, including visual defect count, moisture content measurement, water activity reading, '
    'and bean size distribution.'
))
story.append(body(
    'The QC Verify module captures the results of the formal quality testing process. Cupping is performed by '
    'certified Q-graders following SCA protocols, with each attribute scored individually on a 0-10 scale. '
    'The total cupping score determines the quality grade: Specialty (80+), Premium (75-79.99), Standard '
    '(70-74.99), or Below Standard (below 70). Additional tests may include chemical residue analysis for '
    'organic certification, mycotoxin screening for food safety compliance, and sensory analysis for flavor '
    'profiling. The laboratory generates a comprehensive QC report that is recorded in the platform and linked '
    'to the original lot. This report becomes part of the permanent traceability record and is referenced by '
    'Aggregators for lot grading, by Traders for pricing, and by Buyers for quality verification. The Billing '
    'module tracks laboratory service charges, and the Users module manages the certification credentials of '
    'Q-graders and laboratory technicians. The Inspections module is also used to manage the scheduling and '
    'tracking of on-site quality inspections at processing facilities.'
))


# ═══════════════════════════════════════════════════════════
# CHAPTER 5: Data Entry & Reporting Guide
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 5: Data Entry and Reporting Guide'))

# 5.1
story.extend(add_subsection('5.1 Data Entry Points by Module'))
story.append(body(
    'Understanding which modules require data entry and which roles are responsible for entering data is essential '
    'for efficient platform operation. The following table maps each module to the roles that perform data entry '
    'within it, along with the types of data entered. Modules that are view-only or hidden for a given entity type '
    'are excluded from the data entry requirements. This guide helps organizations plan user provisioning and training, '
    'ensuring that every data entry point has a designated responsible user.'
))

de_mod_headers = ['Module', 'Data Entry Role(s)', 'Primary Data Entered']
de_mod_rows = [
    ['Farmers', 'Field Officer', 'Farmer profile, contact, ID, location'],
    ['Farm Lands', 'Field Officer', 'Plot boundaries (GPS), area, altitude, soil'],
    ['Cultivations', 'Field Officer', 'Planting date, varietal, spacing, shade'],
    ['Nurseries', 'Field Officer', 'Seedling batches, germination rate, planting'],
    ['Land Prep', 'Field Officer', 'Clearing, terracing, shade management'],
    ['Crop Monitor', 'Field Officer', 'Growth stage, flowering, cherry development'],
    ['Fertilizer', 'Field Officer', 'Type, quantity, date, method of application'],
    ['Pest Disease', 'Field Officer', 'Pest type, severity, treatment, date'],
    ['Harvest Trace', 'Field Officer', 'Cherry weight, date, plot, picking method'],
    ['Procurement', 'Ops Manager', 'Delivery weight, price, farmer ID, date'],
    ['Processing', 'Ops Manager', 'Method, batch params, duration, output weight'],
    ['Coffee Insp', 'QC Inspector', 'Defects, moisture, bean size, visual grade'],
    ['QC Verify', 'QC Inspector', 'Cupping scores, quality grade, test results'],
    ['EUDR', 'Tenant Admin / Ops', 'Farm polygons, DDS data, risk assessment'],
    ['Cert Assess', 'QC Inspector', 'Compliance scores, audit findings, photos'],
    ['Deforestation', 'Tenant Admin', 'Satellite data, risk flags, verification status'],
    ['Marketplace', 'Trader', 'Lot listing, price, minimum order quantity'],
    ['RFQ', 'Trader / Buyer', 'Quantity, quality spec, price, delivery terms'],
    ['Smart Contracts', 'Trader', 'Contract terms, digital signature, status'],
    ['Trading Desk', 'Trader', 'Position management, price alerts, market data'],
    ['Shipments', 'Ops Manager / Trader', 'Container, vessel, ETA, tracking updates'],
    ['Logistics', 'Ops Manager', 'Transport arrangements, customs, handling'],
    ['Export Docs', 'Ops Manager', 'B/L, phytosanitary, cert of origin, DDS'],
    ['Billing', 'Finance Manager', 'Payment records, cost allocation, invoicing'],
    ['Users', 'Tenant Admin', 'User accounts, role assignments, permissions'],
    ['IoT Sensors', 'Ops Manager', 'Sensor config, data thresholds, alerts'],
    ['Blockchain', 'Tenant Admin', 'Chain verification, hash validation'],
    ['API Settings', 'Tenant Admin', 'API keys, webhooks, integration config'],
]
cw5 = [0.20, 0.28, 0.52]
col_widths_de5 = [r * AVAILABLE_W for r in cw5]
story.extend(make_table_left_first(de_mod_headers, de_mod_rows, col_widths_de5,
    caption='Table 5.1: Data Entry Points by Module'))

# 5.2
story.extend(add_subsection('5.2 Report Types by Role'))
story.append(body(
    'Each role in the Terra Brew platform has access to specific report types that support their operational and '
    'strategic decision-making needs. Reports are generated from the Analytics module and can be exported in PDF, '
    'Excel, or CSV format. The following table summarizes the key report types available to each role, along with '
    'their primary purpose and typical usage frequency. Understanding which reports are available to each role helps '
    'organizations ensure that decision-makers have access to the right data at the right time.'
))

rpt_headers = ['Role', 'Report Types', 'Purpose']
rpt_rows = [
    ['Tenant Admin', 'System health, user activity, audit log', 'Platform governance and compliance'],
    ['Ops Manager', 'Processing throughput, inventory, shipment status', 'Operational efficiency monitoring'],
    ['Field Officer', 'Farmer enrollment, harvest yields, farm health', 'Agricultural performance tracking'],
    ['QC Inspector', 'Inspection results, cupping trends, defect analysis', 'Quality assurance and grading'],
    ['Trader', 'Market prices, RFQ pipeline, contract status', 'Commercial performance analysis'],
    ['Finance Manager', 'Revenue, costs, payment reconciliation, margins', 'Financial control and planning'],
    ['Buyer', 'Shipment tracking, quality verification, spend analysis', 'Procurement optimization'],
    ['Viewer', 'Executive summary, KPI dashboard, compliance status', 'Strategic oversight and governance'],
]
cw6 = [0.18, 0.42, 0.40]
col_widths_rpt = [r * AVAILABLE_W for r in cw6]
story.extend(make_table_left_first(rpt_headers, rpt_rows, col_widths_rpt,
    caption='Table 5.2: Report Types by Role'))

# 5.3
story.extend(add_subsection('5.3 Dashboard KPIs'))
story.append(body(
    'Each entity type has a tailored Dashboard with KPIs relevant to its operational context. These KPIs provide '
    'at-a-glance performance indicators that help users quickly assess the health of their operations. The Dashboard '
    'is the first module users see after login, and its KPI cards are designed to surface the most actionable metrics. '
    'The following table lists the primary KPIs displayed on each entity type Dashboard, organized by the operational '
    'domain they represent.'
))

kpi_headers = ['Entity Type', 'Primary KPIs']
kpi_rows = [
    ['Producer', 'Total farmers, total farm area, harvest volume, avg yield/ha, EUDR compliance %'],
    ['Aggregator', 'Cherries received, lots processed, avg cupping score, inventory value, pending shipments'],
    ['Exporter', 'Active contracts, shipments in transit, revenue, EUDR DDS count, on-time delivery %'],
    ['Importer', 'RFQs submitted, shipments expected, customs clearance time, landed cost, quality match %'],
    ['Buyer', 'Orders placed, shipments tracked, avg quality score, total spend, traceability coverage %'],
    ['Certification Body', 'Assessments completed, certificates issued, avg compliance score, renewal rate'],
    ['Laboratory', 'Samples tested, avg turnaround time, specialty grade %, QC report count, revenue'],
]
cw7 = [0.22, 0.78]
col_widths_kpi = [r * AVAILABLE_W for r in cw7]
story.extend(make_table_left_first(kpi_headers, kpi_rows, col_widths_kpi,
    caption='Table 5.3: Dashboard KPIs by Entity Type'))

# 5.4
story.extend(add_subsection('5.4 Navigation Maps'))
story.append(body(
    'Navigation within the Terra Brew platform is driven by the sidebar menu, which dynamically adjusts based on '
    'the user role and entity type. Each user sees only the modules they have access to, organized into the seven '
    'functional groups. The sidebar is the primary navigation mechanism, with each module represented by an icon '
    'and label. Clicking a module opens its primary view, which typically contains a data table with search and '
    'filter capabilities, along with action buttons for creating new records.'
))
story.append(body(
    'The sidebar groups and their modules are: <b>Overview</b> (Dashboard, Analytics), <b>Farm Operations</b> '
    '(Farmers, Farm Lands, Cultivations, Nurseries, Land Prep, Crop Monitor, Fertilizer, Pest Disease, Harvest '
    'Trace), <b>Processing and Quality</b> (Procurement, Processing, Coffee Inspection, QC Verify), '
    '<b>Compliance and Certification</b> (EUDR, Cert Assess, Deforestation), <b>Trade and Logistics</b> '
    '(Marketplace, RFQ, Inspections, Product Monitor, Smart Contracts, Trading Desk, Shipments, Logistics, '
    'Export Docs, Buyers), <b>Finance and Admin</b> (Billing, Users), and <b>System and Integrations</b> '
    '(IoT Sensors, Blockchain, API Settings). For a Field Officer at a Producer, the sidebar shows Farm Operations '
    'as the dominant group. For a Trader at an Exporter, the Trade and Logistics group dominates. For a Tenant '
    'Administrator, all groups and modules within the entity type scope are visible. The breadcrumb trail at the '
    'top of each page shows the current navigation path, allowing users to quickly return to parent views.'
))


# ═══════════════════════════════════════════════════════════
# CHAPTER 6: EUDR Compliance Workflow
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 6: EUDR Compliance Workflow'))

# 6.1
story.extend(add_subsection('6.1 EUDR Data Requirements'))
story.append(body(
    'The European Union Deforestation Regulation (EUDR) mandates that all operators placing coffee on the EU market '
    'must demonstrate that the product was not produced on land deforested after December 31, 2020. Compliance '
    'requires the submission of a Due Diligence Statement (DDS) that includes specific mandatory data elements. '
    'The Terra Brew platform systematically collects, validates, and packages these data elements to support EUDR '
    'compliance. The mandatory data elements include: the geolocation of all plots of land where the coffee was '
    'produced (as GPS polygons, not just point coordinates), the country and region of production, the name and '
    'address of the operator, evidence that the product is deforestation-free (satellite imagery analysis), and '
    'the commodity, species, and production timeframe.'
))
story.append(body(
    'Additional supporting data includes the chain of custody records showing the path of the coffee from farm '
    'to EU border, certification documentation (organic, fair trade, etc.), and risk assessment results. The '
    'platform ensures that all mandatory fields are collected at the appropriate data entry points and validated '
    'for completeness and accuracy before a DDS can be generated. For example, farm land records must include '
    'GPS polygon boundaries (not just center points), and the deforestation assessment must return a low-risk '
    'or no-deforestation finding. The EUDR module enforces these requirements through mandatory field validation '
    'and pre-submission completeness checks. If any required data is missing, the system prevents DDS generation '
    'and provides a clear list of missing elements that must be addressed.'
))

eudr_headers = ['Data Element', 'Source Module', 'Responsible Role', 'Validation Rule']
eudr_rows = [
    ['Farm geolocation (polygon)', 'Farm Lands', 'Field Officer', 'Must be GPS polygon, min 3 vertices'],
    ['Production country/region', 'Farm Lands', 'Field Officer', 'Auto-derived from GPS coordinates'],
    ['Operator name and address', 'Tenant config', 'Tenant Admin', 'Non-empty, valid format'],
    ['Deforestation-free evidence', 'Deforestation', 'Tenant Admin', 'Satellite assessment: low risk'],
    ['Commodity and species', 'Cultivations', 'Field Officer', 'Must be Coffea Arabica/Canephora'],
    ['Production timeframe', 'Harvest Trace', 'Field Officer', 'Date within harvest season'],
    ['Chain of custody', 'Trace Journey', 'System-generated', 'Complete, unbroken chain'],
    ['Certification documentation', 'Cert Assess', 'QC Inspector', 'Valid certificate within period'],
]
cw8 = [0.22, 0.18, 0.18, 0.42]
col_widths_eudr = [r * AVAILABLE_W for r in cw8]
story.extend(make_table_left_first(eudr_headers, eudr_rows, col_widths_eudr,
    caption='Table 6.1: EUDR Mandatory Data Elements'))

# 6.2
story.extend(add_subsection('6.2 Deforestation Assessment Flow'))
story.append(body(
    'The deforestation assessment is a multi-step process that combines satellite imagery analysis with farm-level '
    'data verification to determine whether a given plot of land has been deforested since the EUDR cutoff date '
    'of December 31, 2020. The assessment begins when a farm land record with GPS polygon boundaries is created '
    'or updated in the platform. The system automatically submits the polygon coordinates to the integrated '
    'satellite monitoring service, which analyzes historical and current satellite imagery to detect land cover '
    'changes within the defined boundary.'
))
story.append(body(
    'The satellite analysis produces a risk score on a scale of 0 to 100, where lower scores indicate lower '
    'deforestation risk. Scores below 30 are classified as low risk, scores between 30 and 70 as medium risk, '
    'and scores above 70 as high risk. Low-risk assessments automatically pass and can be included in the DDS. '
    'Medium-risk assessments require additional verification, such as ground-truth photographs or third-party '
    'audit confirmation. High-risk assessments block DDS generation and trigger a remediation workflow that '
    'requires the Field Officer to visit the farm, document the current land use, and submit evidence that '
    'the land was not deforested. The Deforestation module provides a visual interface showing the farm polygon '
    'overlaid on satellite imagery, with color-coded risk indicators. For farms that pass the assessment, the '
    'system generates a deforestation-free certification record that is linked to the farm land record and '
    'automatically included in the DDS when the farm contributes to an EU-bound shipment.'
))

# 6.3
story.extend(add_subsection('6.3 Cross-Border Compliance'))
story.append(body(
    'EUDR compliance requires a seamless handoff of data between the Exporter and the Importer. The Exporter, '
    'as the operator placing coffee on the EU market, is legally responsible for submitting the DDS to the EU '
    'Information System. However, the data underpinning the DDS originates from multiple upstream entities, '
    'including Producers (farm geolocation), Aggregators (lot composition and traceability), and Certification '
    'Bodies (compliance verification). The Terra Brew platform facilitates this cross-border data handoff through '
    'a structured DDS generation workflow.'
))
story.append(body(
    'When an Exporter prepares a shipment for an EU destination, the EUDR module aggregates all required data '
    'from the contributing entities: farm polygons from the Producer, lot composition from the Aggregator, '
    'quality reports from the Laboratory, and certification records from the Certification Body. The module '
    'validates that all mandatory fields are present and that all deforestation assessments return low-risk '
    'or verified-medium-risk status. Once validated, the DDS is generated as a structured document that includes '
    'all mandatory data elements, supporting evidence, and digital signatures. The DDS is then submitted to the '
    'EU Information System on behalf of the Exporter. A copy of the DDS is shared with the Importer through the '
    'platform, enabling the Importer to verify compliance before accepting the shipment. This cross-border data '
    'handoff is recorded on the blockchain, providing an immutable audit trail that can be used to demonstrate '
    'compliance to regulatory authorities. The platform also supports periodic compliance audits, where the '
    'Certification Body can review the DDS records and verify that the underlying data is accurate and complete.'
))


# ═══════════════════════════════════════════════════════════
# CHAPTER 7: Blockchain & Traceability
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 7: Blockchain and Traceability'))

# 7.1
story.extend(add_subsection('7.1 Hash Chain Architecture'))
story.append(body(
    'The Terra Brew platform implements a hash chain architecture to ensure data immutability across the supply '
    'chain. Unlike traditional blockchain systems that require mining and consensus mechanisms, the platform uses '
    'a lightweight hash chain that links each data record to its predecessor through a cryptographic hash. When '
    'a new record is created (e.g., a harvest entry, a processing batch, a quality report), the system computes '
    'a SHA-256 hash of the record data concatenated with the hash of the previous record in the chain. This '
    'creates a tamper-evident sequence where any modification to a historical record would invalidate all '
    'subsequent hashes, making data manipulation immediately detectable.'
))
story.append(body(
    'The hash chain is stored in the Blockchain module, which provides a visual representation of the chain and '
    'tools for verifying data integrity. Users can select any record in the chain and verify that its hash is '
    'consistent with the recorded values, confirming that the data has not been altered since it was originally '
    'entered. The hash chain spans across entity boundaries, with cross-entity data handoffs creating additional '
    'chain links. For example, when an Aggregator creates a lot that includes coffee from multiple Producer '
    'harvests, the lot record includes the hashes of each contributing harvest record. This creates a Merkle-like '
    'structure that enables efficient verification of specific data points without requiring access to the entire '
    'chain. The Blockchain module also provides an API for third-party verification, allowing external auditors '
    'or regulatory bodies to verify the integrity of the traceability data without direct platform access.'
))

# 7.2
story.extend(add_subsection('7.2 QR Code Verification'))
story.append(body(
    'QR code verification is the consumer-facing component of the Terra Brew traceability system. Each lot that '
    'passes through the platform is assigned a unique QR code that can be printed on packaging, labels, or '
    'documentation. When a consumer or supply chain partner scans the QR code using a smartphone, they are '
    'directed to a publicly accessible traceability page that presents the complete journey of the coffee from '
    'farm to cup. The traceability page is designed to be visually engaging and easy to understand, using a '
    'timeline layout that shows each stage of the coffee journey with key data points.'
))
story.append(body(
    'The QR code verification page displays the following information: the farm of origin (country, region, farm '
    'name, altitude), the farmer who grew the coffee, the harvest date and method, the processing method and '
    'parameters, the quality grade and cupping score (with attribute breakdown), the certification status '
    '(organic, fair trade, etc.), the export and shipment dates, and the EUDR compliance status. The page also '
    'includes a verification badge that confirms the data has been validated against the blockchain hash chain, '
    'providing cryptographic proof of data integrity. This QR code verification system transforms the technical '
    'infrastructure of the platform into a consumer-facing trust signal, enabling brands to differentiate their '
    'products through verifiable transparency. The system also supports dynamic QR codes that can be updated '
    'with additional traceability data as the coffee moves through the supply chain, ensuring that the consumer '
    'always sees the most current information.'
))

# 7.3
story.extend(add_subsection('7.3 Trace Journey Module'))
story.append(body(
    'The Trace Journey module is the internal counterpart to the consumer-facing QR verification system, providing '
    'platform users with a comprehensive, interactive view of the complete traceability chain for any lot, shipment, '
    'or batch. The module is accessible to all entity types (with View access for Buyers and Certification Bodies) '
    'and serves as the primary tool for supply chain transparency and due diligence. The Trace Journey presents '
    'a step-by-step visual timeline of the coffee journey, with each step showing the entity involved, the data '
    'recorded, the timestamp, and the blockchain hash verification status.'
))
story.append(body(
    'Users can navigate the Trace Journey in two directions: backward tracing (from a finished product to its '
    'origin farms) and forward tracing (from a specific farm to all products that contain its coffee). Backward '
    'tracing is used by Buyers to verify provenance, by Certification Bodies to audit compliance, and by regulatory '
    'authorities to investigate food safety incidents. Forward tracing is used by Producers to track where their '
    'coffee ends up, by Exporters to manage recalls, and by Aggregators to understand market distribution. The '
    'Trace Journey module also supports batch-level tracking, where users can follow a specific batch of coffee '
    'through each processing and logistics step, seeing how it is combined with other batches, split into sub-lots, '
    'or regraded based on quality results. Each step in the journey is linked to its blockchain hash, providing '
    'instant verification of data integrity directly within the trace view.'
))


# ═══════════════════════════════════════════════════════════
# CHAPTER 8: Testing & Validation Checklist
# ═══════════════════════════════════════════════════════════
story.extend(add_major_section('Chapter 8: Testing and Validation Checklist'))

# 8.1
story.extend(add_subsection('8.1 Per-Role Login Credentials'))
story.append(body(
    'The following table provides the complete list of seed user accounts provisioned in the Terra Brew platform for '
    'testing and validation purposes. Each account is pre-configured with a specific role and entity type, and all '
    'accounts share the same default password: <b>Admin@2024</b>. These accounts should be used to validate that '
    'each role sees the correct modules, has the appropriate data access, and can perform the expected actions. '
    'After initial testing, it is recommended to change all default passwords and disable any accounts that are not '
    'needed for ongoing operations.'
))

cred_headers = ['Email', 'Role', 'Entity Type', 'Tenant']
cred_rows = [
    ['admin@metrang-coffee.terrabrew.com', 'tenant_admin', 'Producer', 'Metrang Coffee'],
    ['field_officer@metrang-coffee.terrabrew.com', 'field_officer', 'Producer', 'Metrang Coffee'],
    ['viewer@metrang-coffee.terrabrew.com', 'viewer', 'Producer', 'Metrang Coffee'],
    ['admin@cooxupe.terrabrew.com', 'tenant_admin', 'Aggregator', 'Cooxupe'],
    ['operations@cooxupe.terrabrew.com', 'operations_manager', 'Aggregator', 'Cooxupe'],
    ['trader@cooxupe.terrabrew.com', 'trader', 'Aggregator', 'Cooxupe'],
    ['admin@yirgacheffe-union.terrabrew.com', 'tenant_admin', 'Producer', 'Yirgacheffe Union'],
    ['field_officer@yirgacheffe-union.terrabrew.com', 'field_officer', 'Producer', 'Yirgacheffe Union'],
    ['admin@othaya-cooperative.terrabrew.com', 'tenant_admin', 'Producer', 'Othaya Cooperative'],
    ['field_officer@othaya-cooperative.terrabrew.com', 'field_officer', 'Producer', 'Othaya Cooperative'],
    ['admin@euro-coffee-imports.terrabrew.com', 'tenant_admin', 'Exporter', 'Euro Coffee Imports'],
    ['trader@euro-coffee-imports.terrabrew.com', 'trader', 'Exporter', 'Euro Coffee Imports'],
    ['operations@euro-coffee-imports.terrabrew.com', 'operations_manager', 'Exporter', 'Euro Coffee Imports'],
    ['buyer@euro-coffee-imports.terrabrew.com', 'buyer', 'Exporter', 'Euro Coffee Imports'],
    ['buyer2@euro-coffee-imports.terrabrew.com', 'buyer', 'Exporter', 'Euro Coffee Imports'],
    ['admin@sgs-inspection.terrabrew.com', 'tenant_admin', 'Cert Body', 'SGS Inspection'],
    ['inspector@sgs-inspection.terrabrew.com', 'quality_controller', 'Cert Body', 'SGS Inspection'],
]
cw9 = [0.38, 0.18, 0.14, 0.24]
col_widths_cred = [r * AVAILABLE_W for r in cw9]
story.extend(make_table_left_first(cred_headers, cred_rows, col_widths_cred,
    caption='Table 8.1: Seed User Credentials (Password: Admin@2024)'))

# 8.2
story.extend(add_subsection('8.2 First-Login Navigation Guide'))
story.append(body(
    'After logging in as each role, the following checks should be performed to verify that the platform is '
    'correctly configured and that the user experience matches the expected workflow. This guide provides a '
    'systematic approach to validating each role, ensuring that no critical functionality is overlooked during '
    'the testing phase. For each role, log in using the credentials from the previous table, then follow the '
    'verification steps listed below.'
))

fl_headers = ['Role', 'First Page', 'Key Verifications']
fl_rows = [
    ['tenant_admin', 'Dashboard', 'All modules visible, Users module accessible, Billing tab present, API Settings functional'],
    ['operations_manager', 'Dashboard', 'Procurement, Processing, Shipments visible; no Users or API Settings access'],
    ['field_officer', 'Dashboard', 'Farm Operations group fully visible; no Trade/Logistics modules; mobile layout works'],
    ['quality_controller', 'Dashboard', 'Coffee Insp, QC Verify, Inspections visible; no Marketplace or Trading access'],
    ['trader', 'Dashboard', 'Marketplace, RFQ, Smart Contracts, Trading Desk visible; no Farm Operations access'],
    ['finance_manager', 'Dashboard', 'Billing module visible with financial data; no Trade module write access'],
    ['buyer', 'Dashboard', 'Marketplace, RFQ, Shipments (view), Trace Journey visible; no Processing or Export Docs'],
    ['viewer', 'Dashboard', 'Dashboard and Analytics only; no create/edit buttons; all data read-only'],
]
cw10 = [0.18, 0.14, 0.68]
col_widths_fl = [r * AVAILABLE_W for r in cw10]
story.extend(make_table_left_first(fl_headers, fl_rows, col_widths_fl,
    caption='Table 8.2: First-Login Navigation Verification Checklist'))

# 8.3
story.extend(add_subsection('8.3 Critical Path Testing'))
story.append(body(
    'Critical path testing validates the end-to-end functionality of the Terra Brew platform by executing the '
    'primary workflows that must work correctly for the system to be considered production-ready. These test '
    'scenarios cover the most important data flows and user interactions, ensuring that data entered at one '
    'stage of the supply chain is correctly propagated through subsequent stages and that cross-entity data '
    'handoffs function as expected. Each test scenario should be executed with the specified roles and the '
    'results verified against the expected outcomes.'
))

test_headers = ['Scenario', 'Roles Involved', 'Steps', 'Expected Outcome']
test_rows = [
    ['Farmer Enrollment', 'Field Officer', '1. Log in 2. Navigate to Farmers 3. Add farmer 4. Map farm land', 'Farmer profile created with GPS polygon'],
    ['Harvest and Procurement', 'Field Officer, Ops Mgr', '1. Record harvest 2. Log procurement at Aggregator', 'Harvest data linked to procurement record'],
    ['Processing and QC', 'Ops Mgr, QC Inspector', '1. Create processing batch 2. Submit sample to lab 3. Record cupping scores', 'Lot created with quality grade from lab results'],
    ['Marketplace to Contract', 'Trader, Buyer', '1. List lot 2. Submit RFQ 3. Negotiate 4. Sign smart contract', 'Contract recorded on blockchain, both parties notified'],
    ['EUDR DDS Generation', 'Field Officer, Tenant Admin', '1. Map farm land 2. Run deforestation assessment 3. Generate DDS', 'DDS created with all mandatory fields and low-risk assessment'],
    ['Shipment Tracking', 'Trader, Buyer', '1. Create shipment 2. Update tracking 3. Confirm delivery', 'Buyer receives real-time tracking updates and delivery confirmation'],
    ['QR Code Verification', 'Buyer, Consumer', '1. Generate QR code 2. Scan with phone 3. View traceability page', 'Complete farm-to-cup journey displayed with hash verification'],
    ['Cross-Tenant Data Flow', 'Field Officer, Trader', '1. Producer records harvest 2. Aggregator creates lot 3. Exporter lists on marketplace', 'Data flows correctly across tenant boundaries with hash chain intact'],
]
cw11 = [0.16, 0.16, 0.40, 0.28]
col_widths_test = [r * AVAILABLE_W for r in cw11]
story.extend(make_table_left_first(test_headers, test_rows, col_widths_test,
    caption='Table 8.3: Critical Path Test Scenarios'))

story.append(body(
    'Each test scenario should be executed multiple times with different data variations to ensure robustness. '
    'Edge cases to test include: harvest quantities at the boundary of acceptable ranges, cupping scores at '
    'grade transition points (e.g., 79.9 vs 80.0 for Specialty), RFQ negotiations with multiple counter-offers, '
    'and EUDR assessments for farms with medium or high risk scores. All test results should be documented with '
    'screenshots and logged in the platform test management system. Any failures should be reported with the '
    'exact steps to reproduce, the expected result, and the actual result, enabling the engineering team to '
    'diagnose and resolve issues efficiently. The critical path testing phase should be completed before any '
    'user acceptance testing (UAT) or production deployment.'
))


# ═══════════════════════════════════════════════════════════
# BUILD THE DOCUMENT
# ═══════════════════════════════════════════════════════════

def add_page_number(canvas, doc):
    """Add page number and footer line to each page."""
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT_MARGIN, BOTTOM_MARGIN - 15, PAGE_W - RIGHT_MARGIN, BOTTOM_MARGIN - 15)
    canvas.setFont('Times New Roman', 9)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawCentredString(PAGE_W / 2, BOTTOM_MARGIN - 28,
        'Terra Brew Coffee Traceability Platform  |  Page %d' % doc.page)
    canvas.restoreState()

def add_page_number_first(canvas, doc):
    """First page (after cover) - no page number."""
    pass

doc = TocDocTemplate(
    BODY_PDF,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
)

# Page templates
frame = Frame(LEFT_MARGIN, BOTTOM_MARGIN, AVAILABLE_W, PAGE_H - TOP_MARGIN - BOTTOM_MARGIN, id='normal')
doc.addPageTemplates([
    PageTemplate(id='First', frames=frame, onPage=add_page_number_first),
    PageTemplate(id='Later', frames=frame, onPage=add_page_number),
])

# Insert template switch after TOC page break
# Find the PageBreak after TOC and insert NextPageTemplate before it
from reportlab.platypus import NextPageTemplate

# Rebuild story with template switching
final_story = []
final_story.append(NextPageTemplate('First'))
# Add everything up to and including the TOC PageBreak
toc_pb_found = False
for item in story:
    final_story.append(item)
    if isinstance(item, PageBreak) and not toc_pb_found:
        final_story.append(NextPageTemplate('Later'))
        toc_pb_found = True

print("Building body PDF...")
doc.multiBuild(final_story)
print(f"Body PDF created: {BODY_PDF}")
print(f"Body PDF size: {os.path.getsize(BODY_PDF) / 1024:.1f} KB")

# ═══════════════════════════════════════════════════════════
# GENERATE COVER HTML
# ═══════════════════════════════════════════════════════════

cover_html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=794, height=1123">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 794px; height: 1123px; overflow: hidden; background: #faf8f5; font-family: 'Inter', sans-serif; }

  /* Layer 0: Background */
  .bg-layer { position: absolute; inset: 0; z-index: 0; }

  /* Layer 1: Background decorative elements */
  .bg-decor { position: absolute; inset: 0; z-index: 1; overflow: hidden; }

  /* Subtle arc in lower-left */
  .arc {
    position: absolute;
    width: 1200px;
    height: 1200px;
    border-radius: 50%;
    background: rgba(168, 78, 48, 0.04);
    left: -600px;
    top: 500px;
  }

  /* Grid lines */
  .grid-h, .grid-v {
    position: absolute;
    background: rgba(168, 78, 48, 0.03);
  }
  .grid-h { left: 0; right: 0; height: 0.5px; }
  .grid-v { top: 0; bottom: 0; width: 0.5px; }

  /* Layer 2: Structure */
  .structure-layer { position: absolute; inset: 0; z-index: 2; }

  .thick-line {
    position: absolute;
    left: 95px;
    top: 112px;
    width: 6px;
    height: 898px;
    background: #a84e30;
    border-radius: 3px;
  }

  .meta-line {
    position: absolute;
    left: 140px;
    bottom: 130px;
    width: 300px;
    height: 1px;
    background: rgba(168, 78, 48, 0.35);
  }

  /* Layer 3: Content */
  .content-layer { position: absolute; inset: 0; z-index: 3; }

  .kicker {
    position: absolute;
    left: 140px;
    top: 168px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 3px;
    color: rgba(28, 27, 25, 0.6);
    text-transform: uppercase;
  }

  .hero-title {
    position: absolute;
    left: 140px;
    top: 280px;
    width: 500px;
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 900;
    color: #1c1b19;
    line-height: 1.15;
  }

  .summary {
    position: absolute;
    left: 140px;
    top: 500px;
    width: 460px;
    font-family: 'Inter', sans-serif;
    font-size: 17px;
    font-weight: 300;
    color: rgba(28, 27, 25, 0.85);
    line-height: 1.65;
  }

  .meta {
    position: absolute;
    left: 140px;
    bottom: 60px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: rgba(28, 27, 25, 0.7);
    line-height: 2.0;
  }

  .coffee-brown-accent {
    position: absolute;
    right: 70px;
    top: 200px;
    width: 4px;
    height: 340px;
    background: #6D2932;
    opacity: 0.2;
    border-radius: 2px;
  }

  .year-watermark {
    position: absolute;
    right: 20px;
    top: 120px;
    font-family: 'Playfair Display', serif;
    font-size: 180px;
    font-weight: 900;
    color: rgba(168, 78, 48, 0.04);
    line-height: 1;
    pointer-events: none;
  }
</style>
</head>
<body>
  <!-- Layer 1: Background decorative -->
  <div class="bg-decor">
    <div class="arc"></div>
    <div class="year-watermark">2026</div>
    <div class="grid-h" style="top: 25%"></div>
    <div class="grid-h" style="top: 50%"></div>
    <div class="grid-h" style="top: 75%"></div>
    <div class="grid-v" style="left: 12%"></div>
    <div class="grid-v" style="left: 50%"></div>
    <div class="grid-v" style="left: 88%"></div>
  </div>

  <!-- Layer 2: Structure -->
  <div class="structure-layer">
    <div class="thick-line"></div>
    <div class="meta-line"></div>
    <div class="coffee-brown-accent"></div>
  </div>

  <!-- Layer 3: Content -->
  <div class="content-layer">
    <div class="kicker">E2E WORKFLOW &amp; DATA FLOW</div>
    <div class="hero-title">Terra Brew<br>Coffee Traceability<br>Platform</div>
    <div class="summary">
      Complete system architecture, role-based workflow maps, and end-to-end data flow guide
      for the multi-tenant coffee supply chain traceability platform. Covering seven entity
      types, eight user roles, and thirty-five functional modules across six global tenants.
    </div>
    <div class="meta">
      May 2026<br>
      Terra Brew Engineering Team
    </div>
  </div>
</body>
</html>'''

with open(COVER_HTML, 'w', encoding='utf-8') as f:
    f.write(cover_html)
print(f"Cover HTML created: {COVER_HTML}")

# ═══════════════════════════════════════════════════════════
# RENDER COVER
# ═══════════════════════════════════════════════════════════
PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
print("Rendering cover PDF...")
result = subprocess.run([
    'node', os.path.join(PDF_SKILL_DIR, 'scripts', 'html2poster.js'),
    COVER_HTML, '--output', COVER_PDF, '--width', '794px'
], capture_output=True, text=True)
print(result.stdout)
if result.returncode != 0:
    print(f"Cover render error: {result.stderr}")
    sys.exit(1)
print(f"Cover PDF created: {COVER_PDF}")
print(f"Cover PDF size: {os.path.getsize(COVER_PDF) / 1024:.1f} KB")

# ═══════════════════════════════════════════════════════════
# MERGE COVER + BODY
# ═══════════════════════════════════════════════════════════
from pypdf import PdfReader, PdfWriter, Transformation

A4_W, A4_H = 595.28, 841.89

def normalize_page_to_a4(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 2 or abs(h - A4_H) > 2:
        sx, sy = A4_W / w, A4_H / h
        page.add_transformation(Transformation().scale(sx=sx, sy=sy))
        page.mediabox.lower_left = (0, 0)
        page.mediabox.upper_right = (A4_W, A4_H)
    return page

writer = PdfWriter()
# Cover as page 1
cover_page = PdfReader(COVER_PDF).pages[0]
writer.add_page(normalize_page_to_a4(cover_page))
# Body pages follow
for page in PdfReader(BODY_PDF).pages:
    writer.add_page(normalize_page_to_a4(page))
writer.add_metadata({
    '/Title': 'Terra Brew Coffee Traceability Platform - E2E Workflow and Data Flow',
    '/Author': 'Terra Brew Engineering Team',
    '/Creator': 'Terra Brew Engineering Team',
    '/Subject': 'Complete System Architecture, Role Workflows, and Data Flow Guide',
})
with open(FINAL_PDF, 'wb') as f:
    writer.write(f)

print(f"\n{'='*60}")
print(f"FINAL PDF: {FINAL_PDF}")
print(f"Size: {os.path.getsize(FINAL_PDF) / 1024:.1f} KB")

# Count pages
reader = PdfReader(FINAL_PDF)
print(f"Pages: {len(reader.pages)}")
print(f"{'='*60}")

# Cleanup temp files
for f in [BODY_PDF, COVER_PDF, COVER_HTML]:
    try:
        os.remove(f)
    except:
        pass
print("Temporary files cleaned up.")

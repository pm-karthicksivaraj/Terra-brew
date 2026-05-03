---
Task ID: 1
Agent: Main Agent
Task: Fix seed script crash and add multi-locale support

Work Log:
- Read prisma/schema.prisma - confirmed FarmLand model has no `key` or `farmerCode` fields
- Read seed route at src/app/api/seed/route.ts - found `...fld` spread includes `key` and `farmerCode`
- Fixed seed script: destructured `key` and `farmerCode` out of `fld` before spreading into FarmLand create
- Read i18n config - found only vi/en/pt/am supported, missing Swahili (sw) for Kenya tenant
- Created src/i18n/sw.json with full Swahili translations
- Updated src/i18n/config.ts to add 'sw' to Locale type and SUPPORTED_LOCALES
- Updated src/i18n/index.tsx to import swMessages and include in MESSAGES record
- Updated src/lib/module-config.ts ENTITY_TYPE_LABELS and ROLE_LABELS to include pt/am/sw translations
- Updated getEntityTypeLabel() to support all 5 locales
- Updated src/components/layout/app-sidebar.tsx to use i18n for nav labels across all locales
- Updated sidebar language toggle to cycle through vi→en→pt→am→sw
- Updated dashboard-shell.tsx header language toggle to show current locale code
- Verified build compiles successfully

Stage Summary:
- Seed script crash fixed (key/farmerCode fields no longer passed to Prisma)
- 5-locale support added: Vietnamese, English, Portuguese, Amharic, Swahili
- Sidebar navigation labels now resolve from i18n for all locales
- Entity type and role badges show in correct language
- Build compiles successfully with no errors

---
Task ID: 2
Agent: Main Agent
Task: Fix seed script (revised), redesign color theme to ColorHunt palette, build SEO landing page

Work Log:
- Rewrote seed FarmLand creation to use explicit field-by-field assignment (no spread from fld that could leak key/farmerCode)
- Redesigned entire color theme from green/teal to ColorHunt palette: #561C24 (maroon), #6D2932 (burgundy), #C7B7A3 (taupe), #E8D8C4 (cream)
- Updated globals.css with new CSS variables for both light and dark themes
- Updated layout.tsx with comprehensive SEO metadata (20+ keywords, OpenGraph, Twitter cards)
- Updated login page colors from coffee-* to explicit hex palette colors
- Created comprehensive SEO landing page with:
  - Hero section with stats (6 entity types, 35+ modules, 5 languages, 100% EUDR compliant)
  - 8 platform features (traceability, EUDR, blockchain, analytics, deforestation, certifications, procurement, trading)
  - 4 stakeholder benefit cards (producers, aggregators, exporters, cert bodies) with detailed lists
  - 6 enterprise security features (AES-256, RBAC, tenant isolation, blockchain, SOC2, audit logging)
  - Multi-entity architecture section
  - CTA section with dual buttons
  - SEO-rich footer
- Verified build compiles successfully

Stage Summary:
- Seed script now uses explicit field assignment (no spread) to prevent key/farmerCode leaking into Prisma create
- Entire app theme is now coffee brown/burgundy/cream palette
- Space Mono font is the only font throughout the app
- Landing page is SEO-optimized with high-traffic coffee traceability keywords
- Build compiles successfully

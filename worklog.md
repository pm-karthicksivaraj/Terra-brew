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

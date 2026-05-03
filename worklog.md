---
Task ID: 1-7
Agent: Main Agent
Task: Add buyer role + global coffee price ticker to Terra Brew

Work Log:
- Added `buyer` to TenantRole type in module-config.ts
- Added buyer role labels: en: 'Buyer', vi: 'Người mua', pt: 'Comprador', am: 'ገዢ', sw: 'Mnunuzi'
- Added `buyer` access level to all 34 module roleAccess entries
- Buyer gets: full access to dashboard, marketplace, RFQ, trading-desk, buyers, trace-journey; view access to analytics, compliance, certifications, shipments, logistics, blockchain; hidden from farm ops, users, api-settings
- Created /api/coffee-prices/route.ts — simulated commodity price API with 8 coffee contracts (ICE Coffee C Arabica, London Robusta, Vietnam Robusta Grade 2, Brazil Santos NY2, Ethiopia Yirgacheffe Washed, Kenya AA Top, Colombia Excelso EP, ICCO Composite)
- Created CoffeePriceTicker component with scrolling marquee, green TrendingUp for price hikes, red TrendingDown for price drops, live indicator dot, hover-to-pause
- Added tickerScroll CSS animation to globals.css with pause-on-hover
- Integrated CoffeePriceTicker into landing page (dynamic import, placed between header and hero section)
- Updated schema User model role comment to include buyer
- Added 2 buyer users to seed script: buyer@euro-coffee-imports (Hans Müller), buyer2@euro-coffee-imports (Pierre Dupont)
- Updated security section description from "7-role" to "8-role RBAC system"
- TypeScript compilation passes with zero errors

Stage Summary:
- 8 roles now: tenant_admin, operations_manager, field_officer, quality_controller, trader, finance_manager, buyer, viewer
- Coffee price ticker shows 8 global coffee contracts with real-time simulated prices
- Green ▲ arrow for price increases, Red ▼ arrow for price decreases
- Ticker auto-refreshes every 60 seconds, pauses on hover
- 2 buyer users added to seed data for testing

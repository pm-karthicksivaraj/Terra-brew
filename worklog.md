---
Task ID: 1
Agent: Main Agent
Task: Audit and fix client login and super admin login for Metrang Coffee E2E Traceability Platform

Work Log:
- Read all authentication files: platform-login route, tenant login route, seed route, crypto module, Prisma schema, .env, client-app.tsx, layout.tsx, providers.tsx, sonner.tsx, login pages
- Verified database is properly seeded with both PlatformUser and User records
- Tested bcrypt password verification directly — both passwords work correctly
- Started Next.js dev server and tested both login API endpoints:
  - Super admin login (admin@terrabrew.platform / Admin@2024): ✅ Returns success with JWT token
  - Tenant login (admin@metrang-coffee.terrabrew.com / Admin@2024 / metrang-coffee): ✅ Returns success with JWT token
- Found seed API endpoint was crashing the server (too many sequential DB operations)
- Created prisma/seed.ts CLI seed script for reliable database seeding
- Added db:seed npm script to package.json
- Fixed dev script in package.json (removed `2>&1 | tee dev.log` pipe)
- Found framer-motion was STILL imported in 24 files despite previous sessions claiming to remove it
- Removed framer-motion from ALL 24 files and uninstalled the package
- Found mobile-app directory was NOT excluded from tsconfig.json, causing build failures
- Added "mobile-app" to tsconfig.json exclude list
- Production build now succeeds with all pages
- Server stays alive and all critical pages render correctly

Stage Summary:
- Both login APIs verified working: super admin and tenant admin
- Database is properly seeded with all demo data
- Created CLI seed command: `npm run db:seed`
- Removed framer-motion from 24 files (was causing compilation memory issues)
- Fixed tsconfig.json to exclude mobile-app directory
- Production build succeeds
- Key credentials:
  - Super Admin: admin@terrabrew.platform / Admin@2024
  - Tenant Admin: admin@metrang-coffee.terrabrew.com / Admin@2024
  - Tenant Slug: metrang-coffee

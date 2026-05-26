#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Terra Brew — Reset & Re-seed PostgreSQL Database
# Run this to wipe and re-seed all data
# ═══════════════════════════════════════════════════════════════════

set -e

echo ""
echo "⚠️  Terra Brew — Database Reset"
echo "================================"
echo "This will DELETE all data and re-seed from scratch."
echo ""

read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "🗑️  Dropping all tables..."
npx prisma db push --force-reset
echo "   ✅ Tables dropped"

echo ""
echo "🌱 Re-seeding database..."
npm run db:seed
echo "   ✅ Data seeded"

echo ""
echo "🎉 Reset complete! Login with:"
echo "   Tenant:    metrang-coffee"
echo "   Email:     admin@metrang-coffee.terrabrew.com"
echo "   Password:  Admin@2024"
echo ""

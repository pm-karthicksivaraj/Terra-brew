#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Terra Brew — PostgreSQL Setup Script
# Run this on your local machine to configure PostgreSQL + seed data
# ═══════════════════════════════════════════════════════════════════

set -e

echo ""
echo "☕ Terra Brew — PostgreSQL Setup"
echo "================================="
echo ""

# ─── Configuration ───────────────────────────────────────────────
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS="root@1234"
DB_NAME="terra_brew"

# URL-encode the @ symbol in password
DB_PASS_ENCODED="root%401234"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# ─── Step 1: Create Database ─────────────────────────────────────
echo "📦 Step 1: Creating database '${DB_NAME}'..."
PGPASSWORD="${DB_PASS}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
PGPASSWORD="${DB_PASS}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME}"
echo "   ✅ Database '${DB_NAME}' ready"
echo ""

# ─── Step 2: Update .env ─────────────────────────────────────────
echo "📝 Step 2: Updating .env file..."
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" "$ENV_FILE"
    else
      sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" "$ENV_FILE"
    fi
  else
    echo "DATABASE_URL=${DATABASE_URL}" >> "$ENV_FILE"
  fi
  echo "   ✅ .env updated with DATABASE_URL"
else
  echo "   ⚠️  .env not found, creating..."
  echo "DATABASE_URL=${DATABASE_URL}" > "$ENV_FILE"
  echo "   ✅ .env created"
fi
echo ""

# ─── Step 3: Ensure schema.prisma uses env() ─────────────────────
echo "🔍 Step 3: Checking schema.prisma datasource..."
SCHEMA_FILE="prisma/schema.prisma"
if [ -f "$SCHEMA_FILE" ]; then
  if grep -q 'url.*=.*"file:' "$SCHEMA_FILE" || grep -q 'url.*=.*"sqlite' "$SCHEMA_FILE"; then
    echo "   ⚠️  schema.prisma has hardcoded SQLite URL, fixing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's|url\s*=.*"file:.*"|url      = env("DATABASE_URL")|' "$SCHEMA_FILE"
      sed -i '' 's|provider\s*=.*"sqlite"|provider = "postgresql"|' "$SCHEMA_FILE"
    else
      sed -i 's|url\s*=.*"file:.*"|url      = env("DATABASE_URL")|' "$SCHEMA_FILE"
      sed -i 's|provider\s*=.*"sqlite"|provider = "postgresql"|' "$SCHEMA_FILE"
    fi
    echo "   ✅ schema.prisma fixed to use env(DATABASE_URL)"
  else
    echo "   ✅ schema.prisma already uses env(DATABASE_URL)"
  fi
else
  echo "   ❌ prisma/schema.prisma not found!"
  exit 1
fi
echo ""

# ─── Step 4: Generate Prisma Client ──────────────────────────────
echo "⚙️  Step 4: Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"
echo ""

# ─── Step 5: Push Schema (force-reset to wipe old data) ──────────
echo "🗄️  Step 5: Pushing schema to PostgreSQL (force-reset)..."
echo "   ⚠️  This will drop all existing data and recreate tables"
npx prisma db push --force-reset
echo "   ✅ Schema pushed successfully"
echo ""

# ─── Step 6: Seed Data ───────────────────────────────────────────
echo "🌱 Step 6: Seeding database with dummy data..."
npm run db:seed
echo "   ✅ Data seeded successfully"
echo ""

# ─── Done! ───────────────────────────────────────────────────────
echo "🎉 Setup Complete!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  LOGIN CREDENTIALS (all passwords: Admin@2024)"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Login URL: http://localhost:3000/login"
echo ""
echo "  🇻🇳 Vietnam — Metrang Coffee (slug: metrang-coffee)"
echo "     Admin:      admin@metrang-coffee.terrabrew.com"
echo "     Aggregator: aggregator@metrang-coffee.terrabrew.com"
echo "     Processor:  processor@metrang-coffee.terrabrew.com"
echo "     Exporter:   exporter@metrang-coffee.terrabrew.com"
echo ""
echo "  🇪🇹 Ethiopia — Yirgacheffe Union (slug: yirgacheffe-union)"
echo "     Admin:      tenant_admin@yirgacheffe-union.terrabrew.com"
echo "     Aggregator: aggregator@yirgacheffe-union.terrabrew.com"
echo "     Processor:  processor@yirgacheffe-union.terrabrew.com"
echo "     Exporter:   exporter@yirgacheffe-union.terrabrew.com"
echo ""
echo "  🇰🇪 Kenya — Nyeri Cooperative (slug: nyeri-cooperative)"
echo "     Admin:      tenant_admin@nyeri-cooperative.terrabrew.com"
echo "     Aggregator: aggregator@nyeri-cooperative.terrabrew.com"
echo "     Processor:  processor@nyeri-cooperative.terrabrew.com"
echo "     Exporter:   exporter@nyeri-cooperative.terrabrew.com"
echo ""
echo "  🇨🇴 Colombia — Huila Coffee (slug: huila-coffee)"
echo "     Admin:      tenant_admin@huila-coffee.terrabrew.com"
echo "     Aggregator: aggregator@huila-coffee.terrabrew.com"
echo "     Processor:  processor@huila-coffee.terrabrew.com"
echo "     Exporter:   exporter@huila-coffee.terrabrew.com"
echo ""
echo "  🔑 Platform Super Admin:"
echo "     URL:        http://localhost:3000/super-admin"
echo "     Email:      admin@terrabrew.platform"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  🚀 Start the dev server:"
echo "     npm run dev"
echo ""

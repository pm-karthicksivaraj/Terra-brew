import EmbeddedPostgres from 'embedded-postgres';
import { existsSync, mkdirSync } from 'fs';

const PG_DIR = '/home/z/my-project/.pgdata';
const PG_PORT = 5432;

async function main() {
  if (!existsSync(PG_DIR)) {
    mkdirSync(PG_DIR, { recursive: true });
  }

  const pg = new EmbeddedPostgres({
    database: 'terra_brew',
    user: 'postgres',
    port: PG_PORT,
    dataDir: PG_DIR,
    persistent: true,
  });

  console.log('[PG] Starting embedded PostgreSQL...');
  await pg.initialise();
  await pg.start();
  console.log('[PG] PostgreSQL started on port', PG_PORT);

  // Create database if it doesn't exist
  try {
    await pg.createDatabase('terra_brew');
    console.log('[PG] Database "terra_brew" created');
  } catch (e) {
    console.log('[PG] Database "terra_brew" already exists or error:', e.message);
  }

  const connStr = `postgresql://postgres:postgres@localhost:${PG_PORT}/terra_brew`;
  console.log('[PG] Connection string:', connStr);
  console.log('[PG] Press Ctrl+C to stop');

  // Keep the process alive
  process.on('SIGINT', async () => {
    console.log('[PG] Stopping...');
    await pg.stop();
    process.exit(0);
  });

  setInterval(() => {}, 60000);
}

main().catch(console.error);

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Glint DB] No DIRECT_URL or DATABASE_URL found in environment.');
    process.exit(1);
  }

  console.log('[Glint DB] Connecting to Supabase PostgreSQL...');
  const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    connect_timeout: 15,
  });

  try {
    const versionRes = await sql`SELECT version();`;
    console.log('[Glint DB] Connected successfully to:', versionRes[0]?.version?.slice(0, 50));

    const migrationFile = path.resolve(__dirname, '../migrations/0001_init_schema.sql');
    console.log('[Glint DB] Applying migration from:', migrationFile);
    const migrationSql = fs.readFileSync(migrationFile, 'utf8');

    await sql.unsafe(migrationSql);
    console.log('[Glint DB] Migration 0001_init_schema applied successfully!');

    // Check tables created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('[Glint DB] Public tables verified:', tables.map((t: any) => t.table_name).join(', '));
  } catch (err: any) {
    console.error('[Glint DB] Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();

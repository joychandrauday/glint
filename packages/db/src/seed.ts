import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Glint DB] No DIRECT_URL or DATABASE_URL found.');
    process.exit(1);
  }

  console.log('[Glint DB] Connecting to Supabase for seeding...');
  const sql = postgres(connectionString, { ssl: 'require', max: 1 });

  try {
    const seedsPath = path.resolve(__dirname, '../seeds/cheatsheets.json');
    const items = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));
    console.log(`[Glint DB] Seeding ${items.length} cheatsheets into Supabase...`);

    for (const item of items) {
      await sql`
        INSERT INTO public.cheatsheets (
          id, command, template, description, category, tags, variables, platform, is_popular, notes, danger_level
        ) VALUES (
          ${item.id},
          ${item.command},
          ${item.template},
          ${item.description},
          ${item.category},
          ${item.tags},
          ${JSON.stringify(item.variables)},
          ${item.platform || 'all'},
          ${item.isPopular || false},
          ${item.notes || null},
          ${item.dangerLevel || 'safe'}
        )
        ON CONFLICT (id) DO UPDATE SET
          command = EXCLUDED.command,
          template = EXCLUDED.template,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          tags = EXCLUDED.tags,
          variables = EXCLUDED.variables,
          updated_at = timezone('utc'::text, now());
      `;
    }

    const countRes = await sql`SELECT count(*) FROM public.cheatsheets;`;
    console.log(`[Glint DB] Seeding complete! Total cheatsheets in Supabase: ${countRes[0]?.count}`);
  } catch (err: any) {
    console.error('[Glint DB] Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();

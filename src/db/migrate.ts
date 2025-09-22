import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'devuser',
  password: 'devpass',
  database: 'devdb',
});

const db = drizzle(pool, { schema });

async function runMigrations() {
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations complete');
}

runMigrations().catch(console.error);

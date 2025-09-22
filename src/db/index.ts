import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import env from '@/util/env';
import * as schema from './schema';

const pool = new Pool({
  host: env.PGHOST,
  port: parseInt(env.PGPORT, 10),
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  ssl: false,
});

export const db = drizzle(pool, { schema });
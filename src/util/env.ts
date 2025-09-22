import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PGHOST: z.string(),
  PGPORT: z.string().regex(/^\d+$/),
  PGUSER: z.string(),
  PGPASSWORD: z.string(),
  PGDATABASE: z.string(),
});

const env = envSchema.parse(process.env);

export default env;

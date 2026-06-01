import "dotenv/config";
import { Pool } from 'pg';

export const pgPool = new Pool({
  connectionString: process.env.SUPABASE_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const sql = pgPool; 
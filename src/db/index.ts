import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __kisanDiaryPool?: Pool;
};

export const hasDatabase = Boolean(databaseUrl);

function createPool(): Pool {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  return new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }, // Required for Supabase / managed Postgres
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

// Reuse connection pool across both dev and production (prevents exhaustion)
export const pool = hasDatabase
  ? globalForDb.__kisanDiaryPool ?? (globalForDb.__kisanDiaryPool = createPool())
  : null;

// Route handlers already gate database access with `hasDatabase` where needed.
export const db = (pool ? drizzle(pool) : null) as ReturnType<typeof drizzle>;

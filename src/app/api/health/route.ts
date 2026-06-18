import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { sql } from "drizzle-orm";

const APP_VERSION = "1.0.0";
const START_TIME = Date.now();

export async function GET() {
  const start = Date.now();

  let dbStatus = "disabled";
  let dbLatencyMs: number | null = null;

  if (hasDatabase && db) {
    try {
      const dbStart = Date.now();
      await db.execute(sql`SELECT 1`);
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = "ok";
    } catch {
      dbStatus = "error";
    }
  }

  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const responseTimeMs = Date.now() - start;
  const overall = dbStatus === "error" ? "degraded" : "ok";

  return NextResponse.json(
    {
      status: overall,
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      uptime: uptimeSeconds,
      responseTime: `${responseTimeMs}ms`,
      services: {
        database: {
          status: dbStatus,
          latency: dbLatencyMs !== null ? `${dbLatencyMs}ms` : null,
        },
      },
    },
    {
      status: overall === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache",
      },
    }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, hasDatabase } from "@/db";
import { users, sessions } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils";
import { signJWT } from "@/lib/auth";
import { localFindUserByPhone, localCreateSession } from "@/lib/local-auth-store";

const schema = z.object({
  phone: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = schema.parse(body);

    const sessionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // ── Database path ──────────────────────────────
    if (hasDatabase && db) {
      const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

      if (rows.length) {
        const user = rows[0];
        const token = await signJWT({ userId: user.id, phone });
        await db.insert(sessions).values({ userId: user.id, token, expiresAt: sessionExpiry });
        return NextResponse.json(
          successResponse(
            {
              token,
              user: {
                id: user.id,
                phone: user.phone ?? phone,
                name: user.name,
                state: user.state,
                language: user.language,
                isAdmin: user.isAdmin,
                username: user.username,
              },
            },
            "फिंगरप्रिंट लॉगिन सफल"
          )
        );
      }
      return NextResponse.json(errorResponse("उपयोगकर्ता नहीं मिला"), { status: 404 });
    }

    // ── Local-file (dev / no-DB) path ─────────────
    const existingUser = await localFindUserByPhone(phone);
    if (existingUser) {
      const token = await signJWT({ userId: existingUser.id, phone });
      await localCreateSession({ userId: existingUser.id, token, expiresAt: sessionExpiry });
      return NextResponse.json(
        successResponse(
          {
            token,
            user: {
              id: existingUser.id,
              phone: existingUser.phone ?? phone,
              name: existingUser.name,
              state: existingUser.state,
              language: existingUser.language,
              isAdmin: existingUser.isAdmin,
              username: existingUser.username,
            },
          },
          "फिंगरप्रिंट लॉगिन सफल"
        )
      );
    }

    return NextResponse.json(errorResponse("उपयोगकर्ता नहीं मिला"), { status: 404 });

  } catch (error) {
    console.error("Biometric login error:", error);
    return NextResponse.json(errorResponse("लॉगिन विफल रहा।"), { status: 500 });
  }
}

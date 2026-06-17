import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, hasDatabase } from "@/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils";
import { localFindUserByPhone, localUpdateUser } from "@/lib/local-auth-store";

// ─────────────────────────────────────────────
// PIN hashing (matching phone-login)
// ─────────────────────────────────────────────
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode("kisan_pin_salt_v1:" + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────
// Request schema
// ─────────────────────────────────────────────
const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "अमान्य मोबाइल नंबर"),
  otp: z.string().min(6, "OTP 6 अंकों का होना चाहिए").max(6),
  newPin: z
    .string()
    .min(4, "PIN कम से कम 4 अंकों का होना चाहिए")
    .max(6, "PIN अधिकतम 6 अंकों का होना चाहिए")
    .regex(/^\d+$/, "PIN में केवल अंक होने चाहिए"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, newPin } = schema.parse(body);

    // MOCK OTP Validation for Development
    // In production, verify this OTP against your SMS provider (e.g. Twilio/Msg91)
    if (otp !== "123456") {
      return NextResponse.json(errorResponse("OTP गलत है। फिर से प्रयास करें।"), { status: 400 });
    }

    const newPinHash = await hashPin(newPin);

    // ── Database path ──────────────────────────────
    if (hasDatabase && db) {
      const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

      if (rows.length === 0) {
         return NextResponse.json(errorResponse("यह नंबर पंजीकृत नहीं है।"), { status: 404 });
      }

      await db
        .update(users)
        .set({ passwordHash: newPinHash, updatedAt: new Date() })
        .where(eq(users.phone, phone));

      return NextResponse.json(successResponse(null, "आपका PIN सफलतापूर्वक रीसेट कर दिया गया है।"));
    }

    // ── Local-file (dev / no-DB) path ─────────────
    const existingUser = await localFindUserByPhone(phone);
    if (!existingUser) {
        return NextResponse.json(errorResponse("यह नंबर पंजीकृत नहीं है।"), { status: 404 });
    }

    await localUpdateUser(existingUser.id, { passwordHash: newPinHash });

    return NextResponse.json(successResponse(null, "आपका PIN सफलतापूर्वक रीसेट कर दिया गया है।"));

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse(error.issues[0]?.message ?? "Validation error"),
        { status: 400 }
      );
    }
    console.error("Reset PIN error:", error);
    return NextResponse.json(errorResponse("PIN रीसेट विफल रहा।"), { status: 500 });
  }
}

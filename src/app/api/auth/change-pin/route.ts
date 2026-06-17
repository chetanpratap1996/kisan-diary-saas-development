import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, hasDatabase } from "@/db";
import { users } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { localUpdateUser } from "@/lib/local-auth-store";

const schema = z.object({
  currentPin: z.string().min(4).max(6).regex(/^\d+$/),
  newPin: z.string().min(4).max(6).regex(/^\d+$/),
});

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode("kisan_pin_salt_v1:" + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// PUT /api/auth/change-pin — verify current PIN, set new PIN
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { currentPin, newPin } = schema.parse(body);

    const currentHash = await hashPin(currentPin);
    const newHash = await hashPin(newPin);

    if (!hasDatabase || !db) {
      // Local store
      if (user.passwordHash !== currentHash) {
        return NextResponse.json(errorResponse("मौजूदा PIN गलत है।"), { status: 401 });
      }
      await localUpdateUser(user.id, { passwordHash: newHash });
      return NextResponse.json(successResponse(null, "PIN सफलतापूर्वक बदल दिया गया"));
    }

    // DB path — verify current PIN
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!dbUser || dbUser.passwordHash !== currentHash) {
      return NextResponse.json(errorResponse("मौजूदा PIN गलत है।"), { status: 401 });
    }

    await db.update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json(successResponse(null, "PIN सफलतापूर्वक बदल दिया गया"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0]?.message ?? "Validation error"), { status: 400 });
    }
    console.error("Change PIN error:", error);
    return NextResponse.json(errorResponse("PIN बदलने में विफल"), { status: 500 });
  }
}

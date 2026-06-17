import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, hasDatabase } from "@/db";
import { users, sessions } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/utils";
import { signJWT } from "@/lib/auth";
import {
  localFindUserByPhone,
  localCreateUser,
  localCreateSession,
} from "@/lib/local-auth-store";

// ─────────────────────────────────────────────
// Phone number validation
// ─────────────────────────────────────────────

/**
 * Returns an error string if the number is invalid/fake, or null if it's fine.
 *
 * Rules enforced:
 *  1. Exactly 10 digits, starts with 6-9               (telecom standard)
 *  2. Not all same digit          e.g. 9999999999
 *  3. Not ascending/descending sequential              e.g. 9876543210, 6789012345
 *  4. Not repeating 1- or 2-digit pattern             e.g. 9090909090, 121212121
 *  5. No single digit appearing ≥7 times              e.g. 9999912345
 *  6. Not "too sequential" — ≥8 consecutive pairs differing by ±1
 *  7. Not mirrored halves                              e.g. 1234512345
 *  8. Known test/dummy number block-list
 */
function validateIndianMobile(phone: string): string | null {
  // Basic format
  if (!/^\d{10}$/.test(phone)) return "10 अंकों का मोबाइल नंबर दर्ज करें।";
  if (!/^[6-9]/.test(phone)) return "मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए।";

  // All same digit
  if (/^(\d)\1{9}$/.test(phone)) return "यह मोबाइल नंबर अमान्य है।";

  // Hard block-list of known dummy/test numbers
  const blocklist = new Set([
    "9876543210", "8765432109", "7654321098", "6543210987",
    "9012345678", "8901234567", "7890123456", "6789012345",
    "1234567890", "0123456789",
    "9999900000", "8888800000", "7777700000", "6666600000",
    "9876512345", "9999911111", "9000000000", "8000000000",
    "7000000000", "6000000000",
  ]);
  if (blocklist.has(phone)) return "यह मोबाइल नंबर अमान्य है।";

  // Ascending sequential: digits differ by +1 each step for ≥8 pairs
  const digits = phone.split("").map(Number);
  let ascSeq = 0, descSeq = 0;
  for (let i = 0; i < digits.length - 1; i++) {
    const diff = digits[i + 1] - digits[i];
    if (diff === 1 || diff === -9) ascSeq++;   // wraps 9→0
    else ascSeq = 0;
    if (diff === -1 || diff === 9) descSeq++;  // wraps 0→9
    else descSeq = 0;
    if (ascSeq >= 7 || descSeq >= 7) return "यह मोबाइल नंबर अमान्य है।";
  }

  // Repeating 1-digit pattern (already caught above for all-same), 2-digit pattern
  if (/^(\d{2})\1{4}$/.test(phone)) return "यह मोबाइल नंबर अमान्य है।"; // e.g. 909090909 / 10 chars = 121212...
  if (/^(\d{1})\1{4,}/.test(phone.slice(0, 6))) return "यह मोबाइल नंबर अमान्य है।"; // leading 5+ same

  // Any digit appears ≥7 times
  for (let d = 0; d <= 9; d++) {
    const count = digits.filter((x) => x === d).length;
    if (count >= 7) return "यह मोबाइल नंबर अमान्य है।";
  }

  // Mirrored halves: first 5 digits == last 5 digits
  if (phone.slice(0, 5) === phone.slice(5)) return "यह मोबाइल नंबर अमान्य है।";

  // Too many consecutive equal digits (≥5 in a row)
  if (/(\d)\1{4,}/.test(phone)) return "यह मोबाइल नंबर अमान्य है।";

  return null; // valid
}

// ─────────────────────────────────────────────
// PIN hashing
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
  pin: z
    .string()
    .min(4, "PIN कम से कम 4 अंकों का होना चाहिए")
    .max(6, "PIN अधिकतम 6 अंकों का होना चाहिए")
    .regex(/^\d+$/, "PIN में केवल अंक होने चाहिए"),
  name: z.string().optional().transform(val => val?.trim() || undefined),
});

// ─────────────────────────────────────────────
// POST handler — login OR auto-register
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, pin, name } = schema.parse(body);

    // Extra phone validation (beyond regex)
    const phoneError = validateIndianMobile(phone);
    if (phoneError) {
      return NextResponse.json(errorResponse(phoneError), { status: 422 });
    }

    const pinHash = await hashPin(pin);
    // 1-year session so the user stays logged in
    const sessionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // ── Database path ──────────────────────────────
    if (hasDatabase && db) {
      const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

      if (rows.length) {
        // Existing user → verify PIN
        const user = rows[0];
        if (user.passwordHash !== pinHash) {
          return NextResponse.json(errorResponse("PIN गलत है। फिर से कोशिश करें।"), { status: 401 });
        }
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
            "लॉगिन सफल"
          )
        );
      }

      // New user → auto-register
      const [newUser] = await db
        .insert(users)
        .values({
          phone,
          username: `ph_${phone}`,
          passwordHash: pinHash,
          name: name || "किसान भाई",
          state: "India",
          language: "hi",
        })
        .returning();

      const token = await signJWT({ userId: newUser.id, phone });
      await db.insert(sessions).values({ userId: newUser.id, token, expiresAt: sessionExpiry });

      return NextResponse.json(
        successResponse(
          {
            token,
            isNewUser: true,
            user: {
              id: newUser.id,
              phone: newUser.phone ?? phone,
              name: newUser.name,
              state: newUser.state,
              language: newUser.language,
              isAdmin: newUser.isAdmin,
              username: newUser.username,
            },
          },
          "खाता बनाया गया"
        ),
        { status: 201 }
      );
    }

    // ── Local-file (dev / no-DB) path ─────────────
    const existingUser = await localFindUserByPhone(phone);

    if (existingUser) {
      if (existingUser.passwordHash !== pinHash) {
        return NextResponse.json(errorResponse("PIN गलत है। फिर से कोशिश करें।"), { status: 401 });
      }
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
          "लॉगिन सफल"
        )
      );
    }

    // New user (local store)
    const newUser = await localCreateUser({
      phone,
      username: `ph_${phone}`,
      passwordHash: pinHash,
      name: name || "किसान भाई",
      state: "India",
      language: "hi",
    });

    const token = await signJWT({ userId: newUser.id, phone });
    await localCreateSession({ userId: newUser.id, token, expiresAt: sessionExpiry });

    return NextResponse.json(
      successResponse(
        {
          token,
          isNewUser: true,
          user: {
            id: newUser.id,
            phone: newUser.phone ?? phone,
            name: newUser.name,
            state: newUser.state,
            language: newUser.language,
            isAdmin: newUser.isAdmin,
            username: newUser.username,
          },
        },
        "खाता बनाया गया"
      ),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse(error.issues[0]?.message ?? "Validation error"),
        { status: 400 }
      );
    }
    console.error("Phone login error:", error);
    return NextResponse.json(errorResponse("लॉगिन विफल रहा।"), { status: 500 });
  }
}

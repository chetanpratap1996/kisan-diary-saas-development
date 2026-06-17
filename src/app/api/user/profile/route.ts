import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, hasDatabase } from "@/db";
import { users } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { localUpdateUser } from "@/lib/local-auth-store";

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(50).optional(),
  district: z.string().max(100).optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/).optional().nullable(),
  pmKisanId: z.string().max(50).optional().nullable(),
});

// GET /api/user/profile — return current user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    return NextResponse.json(successResponse({
      id: user.id,
      phone: user.phone,
      name: user.name,
      state: user.state,
      district: (user as any).district ?? null,
      village: (user as any).village ?? null,
      pincode: (user as any).pincode ?? null,
      pmKisanId: (user as any).pm_kisan_id ?? (user as any).pmKisanId ?? null,
      language: user.language,
      isAdmin: user.isAdmin,
      username: user.username,
    }));
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(errorResponse("Failed to get profile"), { status: 500 });
  }
}

// PUT /api/user/profile — update user profile fields
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    const patch: Record<string, any> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.state !== undefined) patch.state = data.state;
    if ("district" in data) patch.district = data.district;
    if ("village" in data) patch.village = data.village;
    if ("pincode" in data) patch.pincode = data.pincode;
    if ("pmKisanId" in data) patch.pmKisanId = data.pmKisanId;

    if (!hasDatabase || !db) {
      // Local store path — only supports basic fields
      const localPatch: any = {};
      if (data.name) localPatch.name = data.name;
      if (data.state) localPatch.state = data.state;
      if ("district" in data) localPatch.district = data.district;
      if ("village" in data) localPatch.village = data.village;
      if ("pincode" in data) localPatch.pincode = data.pincode;
      if ("pmKisanId" in data) localPatch.pmKisanId = data.pmKisanId;
      const updated = await localUpdateUser(user.id, localPatch);
      if (!updated) {
        return NextResponse.json(errorResponse("User not found"), { status: 404 });
      }
      return NextResponse.json(successResponse({
        id: updated.id,
        phone: updated.phone,
        name: updated.name,
        state: updated.state,
        district: updated.district ?? null,
        village: updated.village ?? null,
        pincode: updated.pincode ?? null,
        pmKisanId: updated.pmKisanId ?? null,
        language: updated.language,
        isAdmin: updated.isAdmin,
        username: updated.username,
      }, "Profile updated"));
    }

    const [updated] = await db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json(successResponse({
      id: updated.id,
      phone: updated.phone,
      name: updated.name,
      state: updated.state,
      district: updated.district ?? null,
      village: updated.village ?? null,
      pincode: updated.pincode ?? null,
      pmKisanId: updated.pmKisanId ?? null,
      language: updated.language,
      isAdmin: updated.isAdmin,
      username: updated.username,
    }, "Profile updated successfully"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0]?.message ?? "Validation error"), { status: 400 });
    }
    console.error("Update profile error:", error);
    return NextResponse.json(errorResponse("Failed to update profile"), { status: 500 });
  }
}

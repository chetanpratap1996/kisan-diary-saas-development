import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { incomes, incomeCategoryEnum } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const incomeSchema = z.object({
  farmId: z.string().min(1),
  seasonId: z.string().optional().nullable(),
  category: z.enum(["crop_sales", "subsidy", "milk", "animal_husbandry", "other"]),
  amount: z.number().positive(),
  description: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    if (!farmId) {
      return NextResponse.json(errorResponse("farmId is required"), { status: 400 });
    }

    if (!hasDatabase || !db) {
      return NextResponse.json(successResponse([])); // fallback for local mode
    }

    const records = await db
      .select()
      .from(incomes)
      .where(eq(incomes.farmId, farmId))
      .orderBy(desc(incomes.createdAt));

    return NextResponse.json(successResponse(records));
  } catch (error) {
    console.error("Get incomes error:", error);
    return NextResponse.json(errorResponse("Failed to get incomes"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const data = incomeSchema.parse(body);

    if (!hasDatabase || !db) {
      // Mock for local without DB
      return NextResponse.json(
        successResponse({ id: "mock-id", ...data, createdAt: new Date() }, "Income created successfully"),
        { status: 201 }
      );
    }

    const [record] = await db.insert(incomes).values({
      ...data,
      seasonId: data.seasonId || null,
      description: data.description || null,
    }).returning();

    return NextResponse.json(successResponse(record, "Income created successfully"), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0]?.message ?? "Validation error"), { status: 400 });
    }
    console.error("Create income error:", error);
    return NextResponse.json(errorResponse("Failed to create income"), { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { inventory, inventoryCategoryEnum, inventoryUnitEnum } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const inventorySchema = z.object({
  farmId: z.string().min(1),
  itemName: z.string().min(1).max(100),
  category: z.enum(["seed", "fertilizer", "pesticide", "other"]),
  quantity: z.number().positive(),
  unit: z.enum(["kg", "liter", "bag", "unit"]),
  notes: z.string().optional().nullable(),
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
      return NextResponse.json(successResponse([])); 
    }

    const records = await db
      .select()
      .from(inventory)
      .where(eq(inventory.farmId, farmId))
      .orderBy(desc(inventory.createdAt));

    return NextResponse.json(successResponse(records));
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json(errorResponse("Failed to get inventory"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const data = inventorySchema.parse(body);

    if (!hasDatabase || !db) {
      return NextResponse.json(
        successResponse({ id: "mock-id", ...data, createdAt: new Date() }, "Inventory item added successfully"),
        { status: 201 }
      );
    }

    const [record] = await db.insert(inventory).values({
      ...data,
      notes: data.notes || null,
    }).returning();

    return NextResponse.json(successResponse(record, "Inventory item added successfully"), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0]?.message ?? "Validation error"), { status: 400 });
    }
    console.error("Create inventory error:", error);
    return NextResponse.json(errorResponse("Failed to add inventory item"), { status: 500 });
  }
}

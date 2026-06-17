import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { borrowings, borrowingTypeEnum, borrowingStatusEnum } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const borrowingSchema = z.object({
  type: z.enum(["given", "taken"]),
  counterpartyName: z.string().min(1).max(100),
  amount: z.number().positive(),
  interestRate: z.number().min(0).optional().default(0),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["pending", "settled"]).optional().default("pending"),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    if (!hasDatabase || !db) {
      return NextResponse.json(successResponse([])); 
    }

    const records = await db
      .select()
      .from(borrowings)
      .where(eq(borrowings.userId, user.id))
      .orderBy(desc(borrowings.createdAt));

    return NextResponse.json(successResponse(records));
  } catch (error) {
    console.error("Get borrowings error:", error);
    return NextResponse.json(errorResponse("Failed to get borrowings"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const data = borrowingSchema.parse(body);

    if (!hasDatabase || !db) {
      return NextResponse.json(
        successResponse({ id: "mock-id", ...data, userId: user.id, createdAt: new Date() }, "Borrowing created successfully"),
        { status: 201 }
      );
    }

    const [record] = await db.insert(borrowings).values({
      ...data,
      userId: user.id,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
    }).returning();

    return NextResponse.json(successResponse(record, "Borrowing created successfully"), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0]?.message ?? "Validation error"), { status: 400 });
    }
    console.error("Create borrowing error:", error);
    return NextResponse.json(errorResponse("Failed to create borrowing"), { status: 500 });
  }
}

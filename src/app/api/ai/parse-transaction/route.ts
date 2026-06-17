import { NextResponse } from "next/server";
import { parseTransactionWithAI } from "@/lib/ai/parser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const parsedData = await parseTransactionWithAI(text);
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Parse transaction API error:", error);
    return NextResponse.json(
      { error: "Failed to parse transaction" },
      { status: 500 }
    );
  }
}

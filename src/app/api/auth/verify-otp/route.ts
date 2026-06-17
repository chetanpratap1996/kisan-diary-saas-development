import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ success: false, message: "This endpoint has been removed." }, { status: 410 });
}

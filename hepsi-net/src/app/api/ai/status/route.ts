import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ configured: isAIConfigured() });
}

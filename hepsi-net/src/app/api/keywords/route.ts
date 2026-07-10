import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const keywords = await db.keyword.findMany({
      orderBy: [{ priority: "asc" }, { term: "asc" }],
      include: { _count: { select: { matches: true } } },
    });
    return NextResponse.json(
      keywords.map((k) => ({ ...k, matchCount: k._count.matches }))
    );
  } catch (err) {
    console.error("[API /keywords]", err);
    return NextResponse.json({ error: "Anahtar kelimeler alınamadı" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { term, priority, color, notifyEnabled, category, weight } = body;
    if (!term) return NextResponse.json({ error: "Terim gerekli" }, { status: 400 });

    const kw = await db.keyword.create({
      data: {
        term,
        priority: priority ?? "NORMAL",
        color: color ?? "#EF4444",
        notifyEnabled: notifyEnabled ?? true,
        category: category ?? null,
        weight: weight ?? 5,
      },
    });
    return NextResponse.json(kw);
  } catch (err) {
    console.error("[API /keywords POST]", err);
    return NextResponse.json({ error: "Anahtar kelime eklenemedi" }, { status: 500 });
  }
}

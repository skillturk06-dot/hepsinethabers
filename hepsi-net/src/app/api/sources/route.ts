import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sources = await db.newsSource.findMany({
      orderBy: [{ priority: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            stories: { where: { createdAt: { gte: today } } },
          },
        },
      },
    });

    return NextResponse.json(
      sources.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        type: s.type,
        feedUrl: s.feedUrl,
        active: s.active,
        priority: s.priority,
        lastFetchAt: s.lastFetchAt,
        lastErrorAt: s.lastErrorAt,
        lastError: s.lastError,
        storiesToday: s._count.stories,
      }))
    );
  } catch (err) {
    console.error("[API /sources]", err);
    return NextResponse.json({ error: "Kaynaklar alınamadı" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, domain, feedUrl, type, priority } = body;

    if (!name || !domain || !feedUrl) {
      return NextResponse.json({ error: "İsim, domain ve feed URL gerekli" }, { status: 400 });
    }

    const source = await db.newsSource.create({
      data: { name, domain, feedUrl, type: type ?? "RSS", priority: priority ?? 5 },
    });
    return NextResponse.json(source);
  } catch (err) {
    console.error("[API /sources POST]", err);
    return NextResponse.json({ error: "Kaynak eklenemedi" }, { status: 500 });
  }
}

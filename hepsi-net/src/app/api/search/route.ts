import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q");
    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const [stories, sources, keywords] = await Promise.all([
      db.newsStory.findMany({
        where: {
          isHidden: false,
          OR: [
            { headline: { contains: q } },
            { snippet: { contains: q } },
          ],
        },
        select: {
          id: true,
          headline: true,
          category: true,
          publishedAt: true,
          source: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 8,
      }),
      db.newsSource.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { domain: { contains: q } },
          ],
        },
        select: { id: true, name: true, domain: true, active: true },
        take: 4,
      }),
      db.keyword.findMany({
        where: { term: { contains: q } },
        select: { id: true, term: true, priority: true, color: true },
        take: 4,
      }),
    ]);

    return NextResponse.json({
      results: {
        stories: stories.map((s) => ({
          id: s.id,
          headline: s.headline,
          category: s.category,
          publishedAt: s.publishedAt,
          sourceName: s.source.name,
        })),
        sources,
        keywords,
      },
    });
  } catch (err) {
    console.error("[API /search]", err);
    return NextResponse.json({ error: "Arama başarısız" }, { status: 500 });
  }
}

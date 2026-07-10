import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      todayStories,
      lastHourStories,
      criticalStories,
      preparedContent,
      publishedContent,
      skippedStories,
    ] = await Promise.all([
      db.newsStory.count({ where: { detectedAt: { gte: todayStart } } }),
      db.newsStory.count({ where: { detectedAt: { gte: hourAgo } } }),
      db.newsStory.count({ where: { importanceScore: { gte: 75 } } }),
      db.contentDraft.count(),
      db.newsStory.count({ where: { editorialStatus: "YAYINLANDI" } }),
      db.newsStory.count({ where: { editorialStatus: "ATLANDI" } }),
    ]);

    // Category distribution
    const catRaw = await db.newsStory.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });
    const categoryDistribution = catRaw.map((r) => ({
      category: r.category,
      count: r._count.id,
    }));

    // Top sources today
    const srcRaw = await db.newsStory.groupBy({
      by: ["sourceId"],
      where: { detectedAt: { gte: todayStart } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    });
    const sourceIds = srcRaw.map((r) => r.sourceId);
    const sourceNames = await db.newsSource.findMany({
      where: { id: { in: sourceIds } },
      select: { id: true, name: true },
    });
    const srcNameMap = Object.fromEntries(sourceNames.map((s) => [s.id, s.name]));
    const topSources = srcRaw.map((r) => ({
      name: srcNameMap[r.sourceId] ?? r.sourceId,
      count: r._count.id,
    }));

    // Stories by hour (last 24h)
    const stories24h = await db.newsStory.findMany({
      where: { detectedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
      select: { detectedAt: true },
    });
    const hourBuckets: Record<string, number> = {};
    for (const s of stories24h) {
      const h = `${s.detectedAt.getHours().toString().padStart(2, "0")}:00`;
      hourBuckets[h] = (hourBuckets[h] ?? 0) + 1;
    }
    const storiesByHour = Object.entries(hourBuckets)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Trend topics (keywords with most recent matches)
    const topKeywords = await db.keyword.findMany({
      include: {
        _count: { select: { matches: true } },
        matches: {
          orderBy: { matchedAt: "desc" },
          take: 1,
          select: { matchedAt: true },
          where: { matchedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
        },
      },
      orderBy: { matches: { _count: "desc" } },
      take: 8,
    });

    const trendTopics = topKeywords
      .filter((k) => k._count.matches > 0)
      .map((k) => ({
        topic: k.term,
        storyCount: k._count.matches,
        sourceCount: Math.min(k._count.matches, 7),
        velocityPct: Math.round(50 + Math.random() * 200),
        firstSeen: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        lastSeen: k.matches[0]?.matchedAt ?? now,
      }));

    return NextResponse.json({
      todayStories,
      lastHourStories,
      criticalStories,
      preparedContent,
      publishedContent,
      skippedStories,
      categoryDistribution,
      topSources,
      storiesByHour,
      trendTopics,
    });
  } catch (err) {
    console.error("[API /analytics]", err);
    return NextResponse.json({ error: "Analitik alınamadı" }, { status: 500 });
  }
}

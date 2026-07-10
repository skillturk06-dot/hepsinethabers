import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const timeFilter = searchParams.get("time");
    const importance = searchParams.get("importance");
    const sort = searchParams.get("sort") || "EN_YENİ";
    const hasImage = searchParams.get("hasImage") === "true";
    const isBreaking = searchParams.get("breaking") === "true";
    const hasCluster = searchParams.get("clustered") === "true";
    const search = searchParams.get("q");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");

    const where: Record<string, unknown> = { isHidden: false };

    if (category && category !== "Tümü") {
      if (category === "Son Dakika") {
        where.isBreaking = true;
      } else {
        where.category = category;
      }
    }

    if (timeFilter) {
      const now = new Date();
      const cutoffs: Record<string, Date> = {
        "15m": new Date(now.getTime() - 15 * 60 * 1000),
        "1h": new Date(now.getTime() - 60 * 60 * 1000),
        today: new Date(now.setHours(0, 0, 0, 0)),
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
      };
      if (cutoffs[timeFilter]) {
        where.publishedAt = { gte: cutoffs[timeFilter] };
      }
    }

    if (importance && importance !== "all") {
      const ranges: Record<string, { gte?: number; lt?: number }> = {
        critical: { gte: 75 },
        high: { gte: 50, lt: 75 },
        normal: { lt: 50 },
      };
      if (ranges[importance]) {
        where.importanceScore = ranges[importance];
      }
    }

    if (hasImage) where.thumbnailUrl = { not: null };
    if (isBreaking) where.isBreaking = true;
    if (hasCluster) where.clusterId = { not: null };
    if (status) where.editorialStatus = status;

    if (search) {
      where.OR = [
        { headline: { contains: search } },
        { snippet: { contains: search } },
      ];
    }

    const orderBy =
      sort === "EN_ÖNEMLİ"
        ? [{ importanceScore: "desc" as const }, { publishedAt: "desc" as const }]
        : sort === "EN_HIZLI_YÜKSELEN"
        ? [{ trendScore: "desc" as const }, { publishedAt: "desc" as const }]
        : [{ publishedAt: "desc" as const }];

    const [stories, total] = await Promise.all([
      db.newsStory.findMany({
        where,
        include: {
          source: { select: { name: true, domain: true } },
          _count: { select: { keywordMatches: true } },
          cluster: { select: { sourceCount: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.newsStory.count({ where }),
    ]);

    const result = stories.map((s) => ({
      id: s.id,
      headline: s.headline,
      snippet: s.snippet,
      thumbnailUrl: s.thumbnailUrl,
      publishedAt: s.publishedAt,
      detectedAt: s.detectedAt,
      category: s.category,
      importanceScore: s.importanceScore,
      trendScore: s.trendScore,
      isBreaking: s.isBreaking,
      editorialStatus: s.editorialStatus,
      clusterId: s.clusterId,
      clusterSourceCount: s.cluster?.sourceCount ?? null,
      sourceName: s.source.name,
      sourceDomain: s.source.domain,
      keywordMatchCount: s._count.keywordMatches,
    }));

    return NextResponse.json({ stories: result, total, page, limit });
  } catch (err) {
    console.error("[API /news]", err);
    return NextResponse.json({ error: "Haber akışı alınamadı" }, { status: 500 });
  }
}

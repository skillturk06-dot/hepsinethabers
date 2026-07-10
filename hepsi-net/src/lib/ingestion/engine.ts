import { db } from "../db";
import { fetchRSSFeed } from "./rss-adapter";
import { computeSimilarity, SIMILARITY_THRESHOLD } from "../scoring/importance";

let isRunning = false;

export async function runIngestion(sourceId?: string): Promise<void> {
  if (isRunning) {
    console.log("[Ingestion] Already running, skipping");
    return;
  }
  isRunning = true;

  try {
    const where = sourceId ? { id: sourceId, active: true } : { active: true };
    const sources = await db.newsSource.findMany({ where });

    for (const source of sources) {
      const run = await db.ingestionRun.create({
        data: { sourceId: source.id, status: "RUNNING" },
      });

      try {
        const stories = await fetchRSSFeed(source.feedUrl, source.domain);
        let newCount = 0;

        for (const story of stories) {
          // Check for duplicate URL
          const existing = await db.newsStory.findUnique({
            where: { url: story.url },
          });
          if (existing) continue;

          const created = await db.newsStory.create({
            data: {
              sourceId: source.id,
              externalId: story.externalId,
              url: story.url,
              headline: story.headline,
              snippet: story.snippet,
              thumbnailUrl: story.thumbnailUrl,
              publishedAt: story.publishedAt,
              category: story.category,
              importanceScore: story.importanceScore,
              isBreaking: story.isBreaking,
            },
          });

          // Try to cluster
          await attemptClustering(created.id, story.headline);

          // Check keyword matches
          await checkKeywordMatches(created.id, story.headline, story.snippet ?? "");

          newCount++;
        }

        await db.ingestionRun.update({
          where: { id: run.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            storiesFetched: stories.length,
            storiesNew: newCount,
          },
        });

        await db.newsSource.update({
          where: { id: source.id },
          data: { lastFetchAt: new Date(), lastError: null },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await db.ingestionRun.update({
          where: { id: run.id },
          data: { status: "FAILED", completedAt: new Date(), error: msg },
        });
        await db.newsSource.update({
          where: { id: source.id },
          data: { lastErrorAt: new Date(), lastError: msg },
        });
        await db.notification.create({
          data: {
            type: "SOURCE_ERROR",
            title: `Kaynak bağlantı hatası: ${source.name}`,
            body: msg.slice(0, 200),
            sourceId: source.id,
          },
        });
      }
    }
  } finally {
    isRunning = false;
  }
}

async function attemptClustering(storyId: string, headline: string): Promise<void> {
  const recentStories = await db.newsStory.findMany({
    where: {
      detectedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      id: { not: storyId },
    },
    select: { id: true, headline: true, clusterId: true },
    take: 100,
    orderBy: { detectedAt: "desc" },
  });

  let bestMatch: { id: string; clusterId: string | null; score: number } | null = null;

  for (const other of recentStories) {
    const score = computeSimilarity(headline, other.headline);
    if (score >= SIMILARITY_THRESHOLD) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { id: other.id, clusterId: other.clusterId, score };
      }
    }
  }

  if (!bestMatch) return;

  if (bestMatch.clusterId) {
    // Add to existing cluster
    await db.storyClusterMember.upsert({
      where: { clusterId_storyId: { clusterId: bestMatch.clusterId, storyId } },
      create: { clusterId: bestMatch.clusterId, storyId },
      update: {},
    });
    await db.newsStory.update({ where: { id: storyId }, data: { clusterId: bestMatch.clusterId } });
    await db.storyCluster.update({
      where: { id: bestMatch.clusterId },
      data: { sourceCount: { increment: 1 } },
    });
  } else {
    // Create new cluster
    const cluster = await db.storyCluster.create({
      data: {
        primaryHeadline: headline,
        sourceCount: 2,
      },
    });
    await db.storyClusterMember.createMany({
      data: [
        { clusterId: cluster.id, storyId: bestMatch.id },
        { clusterId: cluster.id, storyId },
      ],
    });
    await db.newsStory.updateMany({
      where: { id: { in: [bestMatch.id, storyId] } },
      data: { clusterId: cluster.id },
    });
    await db.notification.create({
      data: {
        type: "CLUSTER",
        title: "Aynı haber birden fazla kaynaktan",
        body: `2 farklı kaynak aynı olayı bildiriyor`,
        storyId,
      },
    });
  }
}

async function checkKeywordMatches(storyId: string, headline: string, snippet: string): Promise<void> {
  const keywords = await db.keyword.findMany({ where: { notifyEnabled: true } });
  const text = `${headline} ${snippet}`.toLowerCase();

  for (const kw of keywords) {
    if (text.includes(kw.term.toLowerCase())) {
      await db.keywordMatch.upsert({
        where: { keywordId_storyId: { keywordId: kw.id, storyId } },
        create: { keywordId: kw.id, storyId },
        update: {},
      });
      await db.notification.create({
        data: {
          type: "KEYWORD_MATCH",
          title: `Anahtar kelime eşleşti: "${kw.term}"`,
          body: headline.slice(0, 150),
          storyId,
        },
      });
    }
  }
}

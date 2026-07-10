import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await db.newsStory.findUnique({
      where: { id },
      include: {
        source: { select: { name: true, domain: true } },
        cluster: {
          include: {
            members: {
              include: {
                story: {
                  include: { source: { select: { name: true, domain: true } } },
                },
              },
            },
          },
        },
        keywordMatches: {
          include: { keyword: { select: { term: true, color: true } } },
        },
        contentDrafts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    }

    const clusterMembers = story.cluster?.members
      .filter((m) => m.storyId !== id)
      .map((m) => ({
        storyId: m.storyId,
        headline: m.story.headline,
        sourceName: m.story.source.name,
        publishedAt: m.story.publishedAt,
        url: m.story.url,
      }));

    return NextResponse.json({
      ...story,
      sourceName: story.source.name,
      sourceDomain: story.source.domain,
      clusterMembers: clusterMembers ?? [],
      latestDraft: story.contentDrafts[0] ?? null,
    });
  } catch (err) {
    console.error("[API /news/:id]", err);
    return NextResponse.json({ error: "Haber detayı alınamadı" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { editorialStatus, isHidden } = body;

    const story = await db.newsStory.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (editorialStatus) {
      updates.editorialStatus = editorialStatus;
      await db.editorialStatusHistory.create({
        data: {
          storyId: id,
          fromStatus: story.editorialStatus,
          toStatus: editorialStatus,
        },
      });
    }
    if (typeof isHidden === "boolean") updates.isHidden = isHidden;

    const updated = await db.newsStory.update({ where: { id }, data: updates });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[API /news/:id PATCH]", err);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}

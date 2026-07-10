import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const storyId = searchParams.get("storyId");
    if (!storyId) return NextResponse.json({ error: "storyId gerekli" }, { status: 400 });

    const draft = await db.contentDraft.findFirst({
      where: { storyId },
      orderBy: { createdAt: "desc" },
      include: { versions: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    if (!draft) return NextResponse.json(null);
    return NextResponse.json({
      ...draft,
      hashtags: typeof draft.hashtags === "string" ? JSON.parse(draft.hashtags) : (draft.hashtags ?? []),
    });
  } catch (err) {
    console.error("[API /content GET]", err);
    return NextResponse.json({ error: "İçerik alınamadı" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyId, headline, overlayText, caption, hashtags, instagramUrl } = body;

    if (!storyId) return NextResponse.json({ error: "storyId gerekli" }, { status: 400 });

    // Upsert draft
    const existing = await db.contentDraft.findFirst({
      where: { storyId },
      orderBy: { createdAt: "desc" },
    });

    const existingHashtags = existing?.hashtags ? JSON.parse(existing.hashtags as string) : [];
    const draftData = {
      storyId,
      headline: headline ?? existing?.headline,
      overlayText: overlayText ?? existing?.overlayText,
      caption: caption ?? existing?.caption,
      hashtags: JSON.stringify(hashtags ?? existingHashtags),
      instagramUrl: instagramUrl ?? existing?.instagramUrl,
    };

    let draft;
    if (existing) {
      draft = await db.contentDraft.update({ where: { id: existing.id }, data: draftData });
    } else {
      draft = await db.contentDraft.create({ data: draftData });
    }

    // Update story status to TASLAK
    await db.newsStory.update({
      where: { id: storyId },
      data: { editorialStatus: "TASLAK" },
    });

    return NextResponse.json(draft);
  } catch (err) {
    console.error("[API /content POST]", err);
    return NextResponse.json({ error: "İçerik kaydedilemedi" }, { status: 500 });
  }
}

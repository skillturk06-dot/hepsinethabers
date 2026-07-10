import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import {
  generateContent,
  regenerateField,
  validateContent,
  isAIConfigured,
  type GeneratedContent,
} from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI yapılandırılmamış. ANTHROPIC_API_KEY ortam değişkeni gerekli." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { storyId, action, field, currentContent } = body;

    const story = await db.newsStory.findUnique({
      where: { id: storyId },
      include: { source: { select: { name: true, domain: true } } },
    });
    if (!story) {
      return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    }

    const context = {
      headline: story.headline,
      snippet: story.snippet,
      category: story.category,
      source: story.source.name,
      factWhat: story.factWhat,
      factWhere: story.factWhere,
      factWhen: story.factWhen,
      factWho: story.factWho,
      factResult: story.factResult,
      factDetails: story.factDetails,
    };

    let result: GeneratedContent;

    if (action && field) {
      // Regenerate single field
      const newValue = await regenerateField(context, field, action, currentContent ?? {});
      return NextResponse.json({ field, value: newValue });
    } else {
      // Generate full content
      result = await generateContent(context);
    }

    // Validate
    const validation = await validateContent(context, result);

    // Save draft
    const existing = await db.contentDraft.findFirst({
      where: { storyId },
      orderBy: { createdAt: "desc" },
    });

    const draftData = {
      storyId,
      headline: result.headline,
      overlayText: result.overlayText,
      caption: result.caption,
      hashtags: JSON.stringify(result.hashtags),
      validationStatus: validation.status,
      validationNotes: JSON.stringify(validation),
    };

    let draft;
    if (existing) {
      draft = await db.contentDraft.update({ where: { id: existing.id }, data: draftData });
    } else {
      draft = await db.contentDraft.create({ data: draftData });
    }

    // Save version
    await db.contentVersion.create({
      data: {
        draftId: draft.id,
        field: "full",
        content: JSON.stringify(result),
        action: "GENERATE",
      },
    });

    // Update story status
    await db.newsStory.update({
      where: { id: storyId },
      data: { editorialStatus: "TASLAK" },
    });

    return NextResponse.json({
      content: result,
      validation,
      draftId: draft.id,
    });
  } catch (err) {
    console.error("[API /ai/generate]", err);
    const msg = err instanceof Error ? err.message : "AI içerik üretilemedi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

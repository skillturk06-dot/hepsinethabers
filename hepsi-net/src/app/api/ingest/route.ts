import { NextRequest, NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingestion/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sourceId } = body;
    // Run in background, don't await
    runIngestion(sourceId).catch((e) => console.error("[Ingest]", e));
    return NextResponse.json({ ok: true, message: "Veri çekme başlatıldı" });
  } catch (err) {
    console.error("[API /ingest]", err);
    return NextResponse.json({ error: "Veri çekme başlatılamadı" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const runs = await (await import("@/lib/db")).db.ingestionRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { source: { select: { name: true } } },
    });
    return NextResponse.json(runs);
  } catch (err) {
    console.error("[API /ingest GET]", err);
    return NextResponse.json({ error: "Çalıştırma geçmişi alınamadı" }, { status: 500 });
  }
}

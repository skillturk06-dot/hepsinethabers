import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await db.notification.findMany({
      where: unreadOnly ? { isRead: false } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await db.notification.count({ where: { isRead: false } });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("[API /notifications]", err);
    return NextResponse.json({ error: "Bildirimler alınamadı" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await db.notification.updateMany({ data: { isRead: true } });
    } else if (id) {
      await db.notification.update({ where: { id }, data: { isRead: true } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API /notifications PATCH]", err);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}

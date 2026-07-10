import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const source = await db.newsSource.update({ where: { id }, data: body });
    return NextResponse.json(source);
  } catch (err) {
    console.error("[API /sources/:id PATCH]", err);
    return NextResponse.json({ error: "Kaynak güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.newsSource.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API /sources/:id DELETE]", err);
    return NextResponse.json({ error: "Kaynak silinemedi" }, { status: 500 });
  }
}

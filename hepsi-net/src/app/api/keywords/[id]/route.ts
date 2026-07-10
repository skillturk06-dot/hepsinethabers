import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const kw = await db.keyword.update({ where: { id }, data: body });
    return NextResponse.json(kw);
  } catch (err) {
    console.error("[API /keywords/:id PATCH]", err);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.keyword.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API /keywords/:id DELETE]", err);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}

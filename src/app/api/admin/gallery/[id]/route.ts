import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requirePermission("gallery:manage");
    const { id } = await params;
    const { published } = await req.json().catch(() => ({}));
    const item = await db.galleryItem.update({ where: { id }, data: { published: !!published } });
    return NextResponse.json(item);
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requirePermission("gallery:manage");
    const { id } = await params;
    await db.galleryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleError(e); }
}

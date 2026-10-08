import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin } from "@/lib/auth/rbac";
import { storage } from "@/lib/storage";
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
    const item = await db.galleryItem.findUnique({ where: { id } });
    await db.galleryItem.delete({ where: { id } });
    // Remove the stored file too (local disk or Blob). Never fails the request.
    if (item && !item.isDemo) await storage.remove(storageKeyOf(item.url));
    return NextResponse.json({ ok: true });
  } catch (e) { return handleError(e); }
}

/** Extracts the storage key from a resolveUrl() URL, or null for external URLs. */
function storageKeyOf(url: string): string {
  if (url.startsWith("http")) return url; // Blob key (full URL)
  const m = url.match(/^\/api\/uploads\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : "";
}

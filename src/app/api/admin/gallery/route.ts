import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { checkFile } from "@/lib/validation/upload";
import { storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await requirePermission("gallery:manage");
    const form = await req.formData();
    const categorySlug = String(form.get("categorySlug") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const alt = String(form.get("alt") ?? "").trim() || title;
    const urlInput = String(form.get("url") ?? "").trim();
    const file = form.get("file");
    if (!categorySlug) throw new HttpError(400, "Choose a category.");
    if (title.length < 2) throw new HttpError(400, "Enter a title.");

    let url = urlInput;
    if (file instanceof File && file.size > 0) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const check = checkFile(file.name, file.type, bytes);
      if (!check.ok) throw new HttpError(400, check.error);
      if (!check.mime.startsWith("image/")) throw new HttpError(400, "Only image files are allowed here.");
      const key = await storage.save(bytes, check.safeName, check.mime);
      url = storage.resolveUrl(key);
    }
    if (!url) throw new HttpError(400, "Upload an image or provide an image URL.");

    const item = await db.galleryItem.create({
      data: { categorySlug, title, alt, url, published: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) { return handleError(e); }
}

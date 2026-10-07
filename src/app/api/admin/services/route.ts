import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { serviceCreateSchema } from "@/lib/validation/admin";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await requirePermission("services:manage");
    const parsed = serviceCreateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Check the service details and try again.");
    const category = await db.serviceCategory.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) throw new HttpError(400, "Unknown category.");
    const base = slugify(parsed.data.name) || "service";
    const slug = (await db.service.findUnique({ where: { slug: base } })) ? `${base}-${Date.now().toString(36)}` : base;
    const service = await db.service.create({
      data: {
        slug, name: parsed.data.name, description: parsed.data.description,
        categoryId: parsed.data.categoryId,
        available: parsed.data.available ?? true, published: parsed.data.published ?? true,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (e) { return handleError(e); }
}

import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { tourSchema } from "@/lib/validation/admin";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requirePermission("tours:manage");
    const parsed = tourSchema.partial().safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid tour details.");
    const { id } = await params;
    const d = parsed.data;
    const tour = await db.tour.update({
      where: { id },
      data: {
        ...(d.name !== undefined ? { name: d.name } : {}),
        ...(d.destination !== undefined ? { destination: d.destination } : {}),
        ...(d.durationDays !== undefined ? { durationDays: d.durationDays } : {}),
        ...(d.shortDescription !== undefined ? { shortDescription: d.shortDescription } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.price !== undefined ? { price: d.price } : {}),
        ...(d.currency !== undefined ? { currency: d.currency } : {}),
        ...(d.mainImage !== undefined ? { mainImage: d.mainImage } : {}),
        ...(d.includedText !== undefined ? { included: d.includedText } : {}),
        ...(d.excludedText !== undefined ? { excluded: d.excludedText } : {}),
        ...(d.requirementsText !== undefined ? { requirements: d.requirementsText } : {}),
        ...(d.available !== undefined ? { available: d.available } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
        ...(d.archived !== undefined ? { archivedAt: d.archived ? new Date() : null } : {}),
      },
    });
    return NextResponse.json(tour);
  } catch (e) { return handleError(e); }
}

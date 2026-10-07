import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { servicePatchSchema } from "@/lib/validation/admin";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requirePermission("services:manage");
    const parsed = servicePatchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid update.");
    const { id } = await params;
    const service = await db.service.update({
      where: { id },
      data: {
        ...(parsed.data.published !== undefined ? { published: parsed.data.published } : {}),
        ...(parsed.data.available !== undefined ? { available: parsed.data.available } : {}),
      },
    });
    return NextResponse.json(service);
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requirePermission("services:manage");
    const { id } = await params;
    // Keep past requests for records: detach them from the deleted service.
    await db.$transaction([
      db.serviceRequest.updateMany({ where: { serviceId: id }, data: { serviceId: null } }),
      db.service.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) { return handleError(e); }
}

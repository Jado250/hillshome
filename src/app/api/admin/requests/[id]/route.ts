import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { statusUpdateSchema } from "@/lib/validation/admin";
import { updateRequest } from "@/server/requests/update";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = await requirePermission("requests:view-assigned");
    // Only ADMIN and above may reassign; staff checks live in updateRequest.
    const parsed = statusUpdateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid update.");
    const { id } = await params;
    return NextResponse.json(await updateRequest(id, user, parsed.data));
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    await requirePermission("requests:manage");
    const { id } = await params;
    // Quotes, notes, attachments and history are removed by cascade.
    await db.serviceRequest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleError(e); }
}

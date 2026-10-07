import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

/** Deletes a customer and ALL of their service requests (quotes, notes and history go with them). */
export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    await requirePermission("requests:manage");
    const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
    if (!email || !email.includes("@")) throw new HttpError(400, "Invalid customer email.");
    const deleted = await db.serviceRequest.deleteMany({ where: { email } });
    if (deleted.count === 0) throw new HttpError(404, "No requests found for that customer.");
    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (e) { return handleError(e); }
}

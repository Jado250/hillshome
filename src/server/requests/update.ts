import { db } from "@/lib/db";
import { HttpError } from "@/lib/auth/rbac";
import type { RequestStatus } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/session";
import { recordAudit } from "@/server/audit";
import { notifyStatusChanged } from "@/server/notifications";

export async function updateRequest(
  id: string,
  user: SessionUser,
  input: { status?: RequestStatus; assigneeId?: string | null; note?: string },
) {
  const existing = await db.serviceRequest.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Request not found.");

  // STAFF only touch requests assigned to them and cannot reassign.
  if (user.role === "STAFF") {
    if (existing.assigneeId !== user.id) throw new HttpError(403, "This request is not assigned to you.");
    if (input.assigneeId !== undefined) throw new HttpError(403, "Staff cannot reassign requests.");
  }

  return db.$transaction(async (tx) => {
    if (input.status && input.status !== existing.status) {
      await tx.serviceRequest.update({ where: { id }, data: { status: input.status } });
      await tx.requestStatusHistory.create({
        data: { requestId: id, fromStatus: existing.status, toStatus: input.status, changedById: user.id },
      });
      await recordAudit(tx, user.id, "request.status_changed", "ServiceRequest", id,
        { from: existing.status, to: input.status, reference: existing.reference });
    }
    if (input.assigneeId !== undefined) {
      await tx.serviceRequest.update({ where: { id }, data: { assigneeId: input.assigneeId } });
      await recordAudit(tx, user.id, "request.assigned", "ServiceRequest", id,
        { assigneeId: input.assigneeId, reference: existing.reference });
    }
    if (input.note) {
      await tx.internalNote.create({ data: { requestId: id, authorId: user.id, body: input.note } });
    }
    const updated = await tx.serviceRequest.findUnique({ where: { id } });
    if (input.status && updated && input.status !== existing.status) {
      // Fire-and-forget: email failures must not break the update.
      notifyStatusChanged(updated, existing.status, input.status).catch((e) => console.error("notify failed", e));
    }
    return updated;
  });
}

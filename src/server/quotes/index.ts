import { db } from "@/lib/db";
import { HttpError } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/session";
import { recordAudit } from "@/server/audit";
import { notifyQuoteCreated } from "@/server/notifications";

export async function createQuote(
  user: SessionUser,
  input: { requestId: string; amount: number; currency: string; details: string; validUntil?: string; notes?: string },
) {
  const request = await db.serviceRequest.findUnique({ where: { id: input.requestId } });
  if (!request) throw new HttpError(404, "Request not found.");
  return db.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        requestId: input.requestId, amount: input.amount, currency: input.currency.toUpperCase(),
        details: input.details, notes: input.notes,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
      },
    });
    await recordAudit(tx, user.id, "quote.created", "Quote", quote.id, { reference: request.reference });
    notifyQuoteCreated(request, quote.amount.toString(), quote.currency, quote.details, quote.validUntil)
      .catch((e) => console.error("notify failed", e));
    return quote;
  });
}

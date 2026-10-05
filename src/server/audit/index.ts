import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type Client = Prisma.TransactionClient | typeof db;

export function recordAudit(
  client: Client,
  userId: string | null,
  action: string,
  entity: string,
  entityId: string,
  meta?: Record<string, unknown>,
) {
  return client.auditLog.create({
    data: { userId, action, entity, entityId, meta: (meta ?? {}) as Prisma.InputJsonValue },
  });
}

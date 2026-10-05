import { NextResponse } from "next/server";
import type { Prisma, RequestStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/rbac";
import { handleError } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const user = await requirePermission("requests:view-assigned");
    const sp = new URL(req.url).searchParams;
    const where: Prisma.ServiceRequestWhereInput = {};
    if (user.role === "STAFF") where.assigneeId = user.id; // staff see only their own
    const status = sp.get("status");
    if (status) where.status = status as RequestStatus;
    const category = sp.get("category");
    if (category) where.category = { slug: category };
    const q = sp.get("q")?.slice(0, 80);
    if (q) where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    const items = await db.serviceRequest.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
      include: { category: { select: { name: true, slug: true } }, assignee: { select: { name: true } } },
    });
    return NextResponse.json(items);
  } catch (e) { return handleError(e); }
}

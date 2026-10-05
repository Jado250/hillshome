import { NextResponse } from "next/server";
import argon2 from "argon2";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { staffSchema } from "@/lib/validation/admin";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await requirePermission("staff:manage");
    const parsed = staffSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid staff details.");
    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) throw new HttpError(409, "That email is already in use.");
    const user = await db.user.create({
      data: {
        name: parsed.data.name, email: parsed.data.email, role: parsed.data.role,
        passwordHash: await argon2.hash(parsed.data.password),
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e) { return handleError(e); }
}

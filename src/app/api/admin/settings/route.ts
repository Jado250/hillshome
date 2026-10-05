import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { settingsSchema } from "@/lib/validation/admin";
import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function PUT(req: Request) {
  try {
    assertSameOrigin(req);
    await requirePermission("settings:manage");
    const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid settings payload.");
    const entries = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
    for (const [key, value] of entries) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: value as never },
        create: { key, value: value as never },
      });
    }
    return NextResponse.json({ ok: true, updated: entries.length });
  } catch (e) { return handleError(e); }
}

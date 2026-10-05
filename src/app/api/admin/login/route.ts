import { NextResponse } from "next/server";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation/admin";
import { setSessionCookie } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/auth/rbac";
import { handleError } from "@/lib/http";
import { recordAudit } from "@/server/audit";

// Real hash used when the user is unknown, so response time does not reveal valid emails.
const DUMMY_HASH = argon2.hash("hillshome-dummy-password");

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    if (!rateLimit(`login:${clientIp(req)}`, 8, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    const parsed = loginSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    const valid = user?.active
      ? await argon2.verify(user.passwordHash, parsed.data.password).catch(() => false)
      : await argon2.verify(await DUMMY_HASH, parsed.data.password).catch(() => false);

    if (!user || !user.active || !valid) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await setSessionCookie({ id: user.id, role: user.role, name: user.name });
    await recordAudit(db, user.id, "auth.login", "User", user.id);
    return NextResponse.json({ ok: true });
  } catch (e) { return handleError(e); }
}

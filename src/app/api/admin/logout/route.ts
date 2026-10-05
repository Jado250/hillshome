import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/auth/rbac";
import { handleError } from "@/lib/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) { return handleError(e); }
}

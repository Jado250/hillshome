import { NextResponse } from "next/server";
import { requirePermission, assertSameOrigin, HttpError } from "@/lib/auth/rbac";
import { quoteSchema } from "@/lib/validation/admin";
import { createQuote } from "@/server/quotes";
import { handleError } from "@/lib/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requirePermission("quotes:manage");
    const parsed = quoteSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Check the quote details and try again.");
    return NextResponse.json(await createQuote(user, parsed.data), { status: 201 });
  } catch (e) { return handleError(e); }
}

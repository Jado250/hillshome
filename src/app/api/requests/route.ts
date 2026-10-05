import { NextResponse } from "next/server";
import { createServiceRequest } from "@/server/requests/create";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/auth/rbac";
import { handleError } from "@/lib/http";

/** Accepts multipart/form-data: `category`, `data` (JSON string) and optional `files`. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    if (!rateLimit(`req:${clientIp(req)}`, 5, 10 * 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });
    }
    const form = await req.formData();
    const category = String(form.get("category") ?? "");
    let data: unknown;
    try { data = JSON.parse(String(form.get("data") ?? "{}")); }
    catch { return NextResponse.json({ error: "Invalid form data." }, { status: 400 }); }
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    const result = await createServiceRequest(category, data, files);
    if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: result.status });
    return NextResponse.json({ reference: result.reference }, { status: 201 });
  } catch (e) { return handleError(e); }
}

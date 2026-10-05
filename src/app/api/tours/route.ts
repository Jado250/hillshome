import { NextResponse } from "next/server";
import { listTours } from "@/server/tours";
import { handleError } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) || undefined;
    return NextResponse.json(await listTours(q));
  } catch (e) { return handleError(e); }
}

import { NextResponse } from "next/server";
import { listCategories } from "@/server/services";
import { handleError } from "@/lib/http";

export async function GET() {
  try { return NextResponse.json(await listCategories()); } catch (e) { return handleError(e); }
}

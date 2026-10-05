import { NextResponse } from "next/server";
import { HttpError } from "@/lib/auth/rbac";

export function handleError(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err); // server log only: never returned to the client
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

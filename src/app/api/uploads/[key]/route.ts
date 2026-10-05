import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };

/** Serves images uploaded to the local uploads dir (dev driver). */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
    const mime = MIME[ext];
    if (!mime) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const bytes = await storage.read(key);
    return new NextResponse(new Uint8Array(bytes), {
      headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}

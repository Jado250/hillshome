/**
 * One-shot: uploads existing local files (gallery images, attachments) to
 * Vercel Blob and rewrites their DB rows to the public Blob URLs.
 *
 * Usage (PowerShell) — run from D:\hillshome:
 *   $env:BLOB_READ_WRITE_TOKEN="<paste from Vercel -> Storage -> Blob -> .env.local>"
 *   $env:TARGET_DATABASE_URL="<db whose rows should be rewritten>"
 *   node scripts/migrate-uploads-to-blob.js
 *
 * TARGET defaults to .env DATABASE_URL (your local DB). To fix production rows,
 * point TARGET at the production connection string instead.
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { put } = require("@vercel/blob");

function envTarget() {
  if (process.env.TARGET_DATABASE_URL) return process.env.TARGET_DATABASE_URL;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
    if (m) return m[1].replace(/^"|"$/g, "").trim();
  }
  return "";
}

const MIME_BY_EXT = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf" };

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("Missing BLOB_READ_WRITE_TOKEN. Aborting.");
    process.exit(1);
  }
  const target = envTarget();
  console.log("target:", new URL(target).host);
  const db = new PrismaClient({ datasourceUrl: target });
  const uploadsDir = path.resolve("./uploads");
  let galleryDone = 0, galleryMissing = 0, attachDone = 0, attachMissing = 0;

  const items = await db.galleryItem.findMany({});
  for (const item of items) {
    const m = item.url.match(/^\/api\/uploads\/(.+)$/);
    if (!m) continue; // already a full URL (Blob, /demo, external)
    const file = path.resolve(uploadsDir, decodeURIComponent(m[1]));
    if (!fs.existsSync(file)) { galleryMissing++; continue; }
    const ext = path.extname(file).toLowerCase();
    const blob = await put(decodeURIComponent(m[1]), fs.readFileSync(file), {
      access: "public", contentType: MIME_BY_EXT[ext] || "application/octet-stream",
    });
    await db.galleryItem.update({ where: { id: item.id }, data: { url: blob.url } });
    galleryDone++;
  }

  const attachments = await db.requestAttachment.findMany({});
  for (const a of attachments) {
    if (/^https?:\/\//.test(a.storageKey)) continue;
    const file = path.resolve(uploadsDir, a.storageKey);
    if (!fs.existsSync(file)) { attachMissing++; continue; }
    const blob = await put(a.storageKey, fs.readFileSync(file), {
      access: "public", contentType: a.mimeType,
    });
    await db.requestAttachment.update({ where: { id: a.id }, data: { storageKey: blob.url } });
    attachDone++;
  }

  console.log(`gallery: ${galleryDone} moved, ${galleryMissing} files missing`);
  console.log(`attachments: ${attachDone} moved, ${attachMissing} files missing`);
  await db.$disconnect();
}

main().catch((e) => { console.log("FAILED:", e.message.split("\n")[0].slice(0, 200)); process.exit(1); });

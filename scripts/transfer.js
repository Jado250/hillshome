/**
 * Copies ALL data from one Hillshome database to another (e.g. local -> production).
 *
 * Usage (PowerShell):
 *   $env:SOURCE_DATABASE_URL="postgresql://postgres:123@localhost:5432/hillshome"
 *   $env:DEST_DATABASE_URL="<paste production connection string>"
 *   node scripts/transfer.js
 *
 * If the destination already holds requests, the script aborts unless you also set:
 *   $env:ALLOW_OVERWRITE="true"
 *
 * Notes:
 * - Destination tables must already exist (`prisma migrate deploy` first).
 * - Request attachments are SKIPPED: the files live on the source server's disk
 *   and do not exist in production. Re-upload gallery images via Admin -> Gallery.
 * - Staff password hashes copy over unchanged, so the same logins keep working.
 */
const { PrismaClient } = require("@prisma/client");

const src = new PrismaClient({ datasourceUrl: process.env.SOURCE_DATABASE_URL });
const dest = new PrismaClient({ datasourceUrl: process.env.DEST_DATABASE_URL });

// Parents first (insert order). Wipe runs in reverse.
const MODELS = [
  "user",
  "serviceCategory",
  "service",
  "tour",
  "tourImage",
  "galleryItem",
  "siteSetting",
  "serviceRequest",
  "requestStatusHistory",
  "internalNote",
  "quote",
  "counter",
  "auditLog",
];

const SKIPPED = ["requestAttachment"];

async function main() {
  if (!process.env.DEST_DATABASE_URL) {
    console.log("Missing DEST_DATABASE_URL. Aborting.");
    process.exit(1);
  }

  // 1. Destination must be migrated.
  try {
    await dest.user.count();
  } catch (e) {
    console.log("Destination looks unmigrated. Run `prisma migrate deploy` against it first.");
    console.log("Detail:", e.message.split("\n")[0].slice(0, 160));
    process.exit(1);
  }

  // 2. Safety: never silently wipe a live database.
  const destRequests = await dest.serviceRequest.count();
  if (destRequests > 0 && process.env.ALLOW_OVERWRITE !== "true") {
    console.log(`Destination already has ${destRequests} request(s). Set ALLOW_OVERWRITE=true to replace them. Aborting.`);
    process.exit(1);
  }

  // 3. Wipe destination (children first).
  for (const m of [...MODELS, ...SKIPPED].reverse()) {
    await dest[m].deleteMany({});
  }
  console.log("Destination cleared.");

  // 4. Copy everything with original IDs (relations stay intact).
  let skippedAttachments = 0;
  for (const m of MODELS) {
    const rows = await src[m].findMany({});
    if (rows.length > 0) await dest[m].createMany({ data: rows });
    console.log(`${m}: ${rows.length} copied`);
  }
  skippedAttachments = await src.requestAttachment.count();
  if (skippedAttachments > 0) {
    console.log(`requestAttachment: ${skippedAttachments} SKIPPED (files live on the source disk)`);
  }

  // 5. Keep reference numbers unique: counter must be >= highest copied reference.
  const refs = await dest.serviceRequest.findMany({ select: { reference: true } });
  const maxRef = refs.reduce((n, r) => {
    const num = parseInt((r.reference.match(/(\d+)\s*$/) || [])[1] || "0", 10);
    return Math.max(n, Number.isNaN(num) ? 0 : num);
  }, 0);
  const counter = await dest.counter.findUnique({ where: { key: "request" } });
  if (!counter || counter.value < maxRef) {
    await dest.counter.upsert({
      where: { key: "request" },
      update: { value: maxRef },
      create: { key: "request", value: maxRef },
    });
  }
  console.log(`request counter set to ${Math.max(counter?.value ?? 0, maxRef)} (highest reference: ${maxRef})`);

  // 6. Verify.
  let ok = true;
  for (const m of MODELS) {
    const [a, b] = await Promise.all([src[m].count(), dest[m].count()]);
    if (a !== b) { ok = false; console.log(`MISMATCH ${m}: source=${a} dest=${b}`); }
  }
  console.log(ok ? "Transfer complete: all counts match." : "Transfer finished WITH MISMATCHES (see above).");
}

main()
  .catch((e) => { console.log("FAILED:", e.message.split("\n")[0].slice(0, 200)); process.exit(1); })
  .finally(async () => { await src.$disconnect(); await dest.$disconnect(); });

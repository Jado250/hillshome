import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { checkFile, MAX_FILES } from "@/lib/validation/upload";
import { parseRequest } from "@/lib/validation/requests";
import { formatReference } from "./reference";
import { notifyRequestReceived } from "@/server/notifications";

export type CreateResult =
  | { ok: true; reference: string }
  | { ok: false; status: number; errors: Record<string, string[]> };

export async function createServiceRequest(
  categorySlug: string,
  raw: unknown,
  files: File[],
): Promise<CreateResult> {
  const parsed = parseRequest(categorySlug, raw);
  if (!parsed.ok) return { ok: false, status: 422, errors: parsed.errors };

  if (files.length > MAX_FILES) {
    return { ok: false, status: 422, errors: { files: [`Upload at most ${MAX_FILES} files.`] } };
  }

  // Validate every file before saving anything.
  const checked: { bytes: Uint8Array; mime: string; safeName: string }[] = [];
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    const res = checkFile(f.name, f.type, bytes);
    if (!res.ok) return { ok: false, status: 422, errors: { files: [res.error] } };
    checked.push({ bytes, mime: res.mime, safeName: res.safeName });
  }

  const category = await db.serviceCategory.findUnique({
    where: { slug: parsed.category, published: true },
  });
  if (!category) return { ok: false, status: 404, errors: { category: ["Service not found."] } };

  const { common, details } = parsed;

  const service = common.serviceSlug
    ? await db.service.findFirst({
        where: { slug: common.serviceSlug, categoryId: category.id, published: true, available: true },
      })
    : null;
  const tour = common.tourSlug
    ? await db.tour.findFirst({
        where: { slug: common.tourSlug, published: true, archivedAt: null, available: true },
      })
    : null;
  if (parsed.category === "tours" && !tour) {
    return { ok: false, status: 422, errors: { tourSlug: ["Choose an available tour."] } };
  }

  const saved = [] as { key: string; name: string; mime: string; size: number }[];
  for (const [i, c] of checked.entries()) {
    saved.push({
      key: await storage.save(c.bytes, c.safeName),
      name: c.safeName, mime: c.mime, size: files[i].size,
    });
  }

  const request = await db.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { key: "request" },
      update: { value: { increment: 1 } },
      create: { key: "request", value: 1 },
    });
    return tx.serviceRequest.create({
      data: {
        reference: formatReference(counter.value),
        categoryId: category.id,
        serviceId: service?.id,
        tourId: tour?.id,
        customerName: common.customerName,
        email: common.email,
        phone: common.phone,
        contactMethod: common.contactMethod,
        preferredDate: common.preferredDate ? new Date(common.preferredDate) : null,
        location: common.location,
        requirements: common.requirements,
        details: details as object,
        status: "PENDING",
        history: { create: { toStatus: "PENDING" } },
        attachments: {
          create: saved.map((s) => ({
            storageKey: s.key, originalName: s.name, mimeType: s.mime, sizeBytes: s.size,
          })),
        },
      },
    });
  });

  // Notification failures must never fail the customer's submission.
  notifyRequestReceived(request).catch((e) => console.error("notify failed", e));

  return { ok: true, reference: request.reference };
}

import { z } from "zod";

export const statusUpdateSchema = z.object({
  status: z.enum(["PENDING","IN_REVIEW","QUOTED","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"]).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  note: z.string().trim().min(1).max(2000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const quoteSchema = z.object({
  requestId: z.string().cuid(),
  amount: z.coerce.number().positive().max(1_000_000_000),
  currency: z.string().length(3).default("RWF"),
  details: z.string().trim().min(1).max(5000),
  validUntil: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

const lines = (v?: string) =>
  (v ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 50);

export const tourSchema = z.object({
  name: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(120),
  durationDays: z.coerce.number().int().min(1).max(365),
  shortDescription: z.string().trim().min(2).max(300),
  description: z.string().trim().min(2).max(5000),
  price: z.union([z.coerce.number().positive().max(1_000_000_000), z.literal(""), z.null()]).optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  currency: z.string().trim().length(3).default("USD"),
  mainImage: z.string().trim().max(500).optional().nullable().transform((v) => v || null),
  includedText: z.string().max(5000).optional().transform(lines),
  excludedText: z.string().max(5000).optional().transform(lines),
  requirementsText: z.string().max(5000).optional().transform(lines),
  available: z.boolean().optional(),
  published: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const servicePatchSchema = z.object({
  published: z.boolean().optional(),
  available: z.boolean().optional(),
  categoryPublished: z.boolean().optional(),
});

export const serviceCreateSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().transform((v) => v || null),
  available: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]).default("STAFF"),
});

export const SETTINGS_KEYS = [
  "company.name", "contact.phone", "contact.email", "contact.address", "contact.whatsapp",
  "contact.md.email", "contact.md.phone", "contact.it.email", "contact.it.phone",
  "social.links", "about.intro", "about.mission", "about.vision", "about.values",
  "home.whyChoose", "home.testimonials", "home.faq",
] as const;

const settingValue = z.union([z.string().max(10_000), z.array(z.unknown()), z.null()]);
export const settingsSchema = z.object({
  "company.name": settingValue.optional(),
  "contact.phone": settingValue.optional(),
  "contact.email": settingValue.optional(),
  "contact.address": settingValue.optional(),
  "contact.whatsapp": settingValue.optional(),
  "contact.md.email": settingValue.optional(),
  "contact.md.phone": settingValue.optional(),
  "contact.it.email": settingValue.optional(),
  "contact.it.phone": settingValue.optional(),
  "social.links": settingValue.optional(),
  "about.intro": settingValue.optional(),
  "about.mission": settingValue.optional(),
  "about.vision": settingValue.optional(),
  "about.values": settingValue.optional(),
  "home.whyChoose": settingValue.optional(),
  "home.testimonials": settingValue.optional(),
  "home.faq": settingValue.optional(),
}).strict();

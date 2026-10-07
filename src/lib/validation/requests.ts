import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  text(max).optional().transform((v) => (v ? v : undefined));

export const CATEGORY_SLUGS = [
  "transport", "construction", "cleaning-maintenance", "it-digital", "multimedia", "tours",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/** Fields shared by every request type. */
export const commonSchema = z.object({
  customerName: text(120).min(2, "Enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  phone: text(30).regex(/^[+0-9\s()-]{7,30}$/, "Enter a valid phone number."),
  contactMethod: z.enum(["CALL", "SMS", "WHATSAPP", "EMAIL"], {
    errorMap: () => ({ message: "Choose how we should contact you." }),
  }),
  preferredDate: optionalText(10).refine(
    (v) => !v || !Number.isNaN(Date.parse(v)), "Enter a valid date."),
  location: optionalText(200),
  requirements: optionalText(2000),
  serviceSlug: optionalText(80),
  tourSlug: optionalText(80),
});

export const detailSchemas = {
  transport: z.object({
    transportType: text(80).min(1, "Choose a transport type."),
    pickupLocation: text(200).min(1, "Enter a pickup location."),
    destination: text(200).min(1, "Enter a destination."),
    travelTime: optionalText(10),
    passengers: z.coerce.number().int().min(1, "At least 1 passenger.").max(500),
    tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]),
  }),
  tours: z.object({
    people: z.coerce.number().int().min(1, "At least 1 person.").max(200),
  }),
  construction: z.object({
    projectType: text(120).min(1, "Choose a project type."),
    description: text(3000).min(10, "Describe the project in a few words."),
    estimatedSize: optionalText(120),
    budget: optionalText(60),
  }),
  "cleaning-maintenance": z.object({
    buildingType: text(120).min(1, "Choose a building type."),
    serviceType: text(120).min(1, "Choose a service type."),
    approximateSize: optionalText(120),
    frequency: z.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "OTHER"]),
  }),
  "it-digital": z.object({
    itService: text(120).min(1, "Choose an IT service."),
    description: text(3000).min(10, "Describe the problem or project."),
    platform: optionalText(120),
    urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  }),
  multimedia: z.object({
    multimediaService: text(120).min(1, "Choose a service."),
    duration: optionalText(120),
    deliverables: text(1000).min(1, "List the deliverables you need."),
    description: optionalText(3000),
    budget: optionalText(60),
  }),
} satisfies Record<CategorySlug, z.ZodTypeAny>;

/** Patterns that signal a customer is sending credentials: rejected for safety. */
const SECRET_PATTERN = /\b(password|passcode|pin code|otp|cvv|card number)\s*[:=]/i;

export function parseRequest(categorySlug: string, raw: unknown) {
  if (!CATEGORY_SLUGS.includes(categorySlug as CategorySlug)) {
    return { ok: false as const, errors: { category: ["Unknown service category."] } as Record<string, string[]> };
  }
  const slug = categorySlug as CategorySlug;
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const common = commonSchema.safeParse(obj);
  const details = detailSchemas[slug].safeParse(obj);
  const errors: Record<string, string[]> = {};
  if (!common.success) Object.assign(errors, common.error.flatten().fieldErrors);
  if (!details.success) Object.assign(errors, details.error.flatten().fieldErrors);

  if (SECRET_PATTERN.test(JSON.stringify(obj))) {
    errors.requirements = ["Please do not include passwords, codes or card numbers."];
  }
  if (Object.keys(errors).length || !common.success || !details.success) {
    return { ok: false as const, errors };
  }
  return {
    ok: true as const,
    category: slug,
    common: common.data,
    details: details.data as Record<string, unknown>,
  };
}

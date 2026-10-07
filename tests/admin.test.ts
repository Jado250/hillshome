import { describe, it, expect } from "vitest";
import { tourSchema, quoteSchema, staffSchema, settingsSchema, statusUpdateSchema, serviceCreateSchema } from "@/lib/validation/admin";

describe("tour schema", () => {
  const valid = {
    name: "Kigali City Tour", destination: "Kigali", durationDays: 1,
    shortDescription: "City highlights", description: "A full day in Kigali.",
    price: "50000", currency: "RWF", includedText: "Guide\nTransport",
  };
  it("accepts a valid tour and splits included lines", () => {
    const r = tourSchema.parse(valid);
    expect(r.includedText).toEqual(["Guide", "Transport"]);
    expect(r.price).toBe(50000);
  });
  it("treats empty price as price on request", () => {
    const r = tourSchema.parse({ ...valid, price: "" });
    expect(r.price).toBeNull();
  });
  it("rejects a tour without a destination", () => {
    expect(tourSchema.safeParse({ ...valid, destination: "" }).success).toBe(false);
  });
});

describe("quote schema", () => {
  it("accepts a valid quote", () => {
    const r = quoteSchema.safeParse({ requestId: "clxxxxxxxxxxxxxxxxxxxxx1", amount: "25000", details: "Full service" });
    expect(r.success).toBe(true);
  });
  it("rejects zero/negative amounts", () => {
    const r = quoteSchema.safeParse({ requestId: "clxxxxxxxxxxxxxxxxxxxxx1", amount: "0", details: "x" });
    expect(r.success).toBe(false);
  });
});

describe("staff schema", () => {
  const valid = { name: "Josee Mukamana", email: "josee@hillshome.rw", password: "supersecret1", role: "STAFF" };
  it("accepts valid staff", () => expect(staffSchema.safeParse(valid).success).toBe(true));
  it("rejects short passwords", () => {
    expect(staffSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });
  it("rejects unknown roles", () => {
    expect(staffSchema.safeParse({ ...valid, role: "OWNER" }).success).toBe(false);
  });
});

describe("settings schema", () => {
  it("accepts known keys only", () => {
    expect(settingsSchema.safeParse({ "contact.email": "a@b.rw" }).success).toBe(true);
    expect(settingsSchema.safeParse({ "hacker.key": "x" }).success).toBe(false);
  });
});

describe("service create schema", () => {
  const valid = { categoryId: "clxxxxxxxxxxxxxxxxxxxxx1", name: "Apartment painting", description: "Interior painting" };
  it("accepts a valid service", () => {
    expect(serviceCreateSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a missing category and short names", () => {
    expect(serviceCreateSchema.safeParse({ ...valid, categoryId: "nope" }).success).toBe(false);
    expect(serviceCreateSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });
});

describe("status update schema", () => {
  it("accepts known statuses", () => {
    expect(statusUpdateSchema.safeParse({ status: "IN_REVIEW" }).success).toBe(true);
  });
  it("rejects unknown statuses", () => {
    expect(statusUpdateSchema.safeParse({ status: "PENDING-ish" }).success).toBe(false);
  });
});

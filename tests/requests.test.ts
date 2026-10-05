import { describe, it, expect } from "vitest";
import { parseRequest } from "@/lib/validation/requests";
import { formatReference } from "@/server/requests/reference";
import { checkFile } from "@/lib/validation/upload";
import { can } from "@/lib/auth/rbac";

const base = { customerName: "Aline Uwase", email: "aline@example.com", phone: "+250 788 000 000" };

describe("reference numbers", () => {
  it("pads to six digits", () => {
    expect(formatReference(1)).toBe("HS-REQ-000001");
    expect(formatReference(1234)).toBe("HS-REQ-001234");
  });
});

describe("request validation", () => {
  it("accepts a valid transport request", () => {
    const r = parseRequest("transport", { ...base, transportType: "Bus", pickupLocation: "A",
      destination: "B", passengers: "4", tripType: "ONE_WAY" });
    expect(r.ok).toBe(true);
  });
  it("rejects a bad email and missing fields", () => {
    const r = parseRequest("transport", { ...base, email: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toBeTruthy();
  });
  it("rejects unknown categories", () => {
    expect(parseRequest("payments", base).ok).toBe(false);
  });
  it("blocks credentials in IT requests", () => {
    const r = parseRequest("it-digital", { ...base, itService: "Technical support",
      description: "My laptop is slow, password: abc123", urgency: "LOW", contactMethod: "EMAIL" });
    expect(r.ok).toBe(false);
  });
});

describe("upload validation", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
  it("accepts a real PNG", () => expect(checkFile("a.png", "image/png", png).ok).toBe(true));
  it("rejects a disguised file", () =>
    expect(checkFile("a.png", "image/png", new Uint8Array([1, 2, 3, 4])).ok).toBe(false));
  it("rejects executables", () =>
    expect(checkFile("a.exe", "application/octet-stream", png).ok).toBe(false));
});

describe("role permissions", () => {
  it("limits staff", () => {
    expect(can("STAFF", "quotes:manage")).toBe(false);
    expect(can("ADMIN", "staff:manage")).toBe(false);
    expect(can("SUPER_ADMIN", "staff:manage")).toBe(true);
  });
});

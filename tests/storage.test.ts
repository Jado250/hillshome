import { describe, it, expect } from "vitest";
import { createStorageDriver } from "@/lib/storage";

describe("storage drivers", () => {
  it("local driver resolves keys to the uploads route", () => {
    const s = createStorageDriver("local");
    expect(s.isRemote).toBe(false);
    expect(s.resolveUrl("abc-photo.jpg")).toBe("/api/uploads/abc-photo.jpg");
  });

  it("blob driver treats keys as public URLs", () => {
    const s = createStorageDriver("blob");
    expect(s.isRemote).toBe(true);
    const url = "https://x.public.blob.vercel-storage.com/abc-photo.jpg";
    expect(s.resolveUrl(url)).toBe(url);
  });

  it("local remove of an invalid key does not throw", async () => {
    const s = createStorageDriver("local");
    await expect(s.remove("../evil")).resolves.toBeUndefined();
    await expect(s.remove("")).resolves.toBeUndefined();
  });
});

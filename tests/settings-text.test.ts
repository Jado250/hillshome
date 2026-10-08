import { describe, it, expect } from "vitest";
import {
  testimonialsToText, parseTestimonials,
  faqToText, parseFaq,
  socialLinksToText, parseSocialLinks,
} from "@/lib/settings/text";

describe("testimonials text format", () => {
  it("round-trips name, role and quote", () => {
    const value = [{ name: "Aline", role: "Manager", quote: "Great work." }];
    expect(testimonialsToText(value)).toBe("Aline | Manager | Great work.");
    expect(parseTestimonials("Aline | Manager | Great work.")).toEqual({ ok: true, value });
  });
  it("allows an empty role", () => {
    expect(parseTestimonials("Aline | Great work.")).toEqual({
      ok: true, value: [{ name: "Aline", role: "", quote: "Great work." }],
    });
  });
  it("rejects malformed lines with the line number", () => {
    const r = parseTestimonials("Just a sentence");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("line 1");
  });
});

describe("faq text format", () => {
  it("round-trips questions and answers", () => {
    const value = [{ q: "How?", a: "Like this." }];
    expect(faqToText(value)).toBe("How? | Like this.");
    expect(parseFaq("How? | Like this.")).toEqual({ ok: true, value });
  });
  it("rejects lines without an answer", () => {
    expect(parseFaq("How?").ok).toBe(false);
  });
});

describe("social links text format", () => {
  it("round-trips label and URL", () => {
    const value = [{ label: "Facebook", url: "https://facebook.com/x" }];
    expect(socialLinksToText(value)).toBe("Facebook | https://facebook.com/x");
    expect(parseSocialLinks("Facebook | https://facebook.com/x")).toEqual({ ok: true, value });
  });
  it("accepts a bare URL and derives the label", () => {
    const r = parseSocialLinks("https://x.com/someone");
    expect(r).toEqual({ ok: true, value: [{ label: "X", url: "https://x.com/someone" }] });
  });
  it("rejects non-links", () => {
    expect(parseSocialLinks("Facebook | not a link").ok).toBe(false);
  });
});

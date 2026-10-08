/**
 * Plain-text formats for editable site content, so admins never touch JSON.
 *
 * Testimonials:  Name | Role | Quote        (role may be empty)
 * FAQ:           Question | Answer
 * Social links:  Label | URL
 *
 * One entry per line. Lines are trimmed; blank lines are ignored.
 */

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const linesOf = (text: string) =>
  String(text ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

const splitParts = (line: string) => line.split("|").map((s) => s.trim());

export type Testimonial = { name: string; role: string; quote: string };
export type Faq = { q: string; a: string };
export type SocialLink = { label: string; url: string };

export function testimonialsToText(v: unknown): string {
  if (!Array.isArray(v)) return "";
  return v
    .map((t) => {
      if (!t || typeof t !== "object") return "";
      const o = t as Record<string, unknown>;
      return [o.name ?? "", o.role ?? "", o.quote ?? ""].map(String).join(" | ").trim();
    })
    .filter((l) => l.replace(/\|/g, "").trim())
    .join("\n");
}

export function parseTestimonials(text: string): ParseResult<Testimonial[]> {
  const out: Testimonial[] = [];
  for (const [i, line] of linesOf(text).entries()) {
    const parts = splitParts(line);
    if ((parts.length === 2 || parts.length === 3) && parts[0] && parts[parts.length - 1]) {
      out.push({ name: parts[0], role: parts.length === 3 ? parts[1] : "", quote: parts[parts.length - 1] });
    } else {
      return { ok: false, error: `Testimonial line ${i + 1}: write it as “Name | Role | Quote”.` };
    }
  }
  return { ok: true, value: out };
}

export function faqToText(v: unknown): string {
  if (!Array.isArray(v)) return "";
  return v
    .map((f) => {
      if (!f || typeof f !== "object") return "";
      const o = f as Record<string, unknown>;
      return `${o.q ?? ""} | ${o.a ?? ""}`.trim();
    })
    .filter((l) => l.replace(/\|/g, "").trim())
    .join("\n");
}

export function parseFaq(text: string): ParseResult<Faq[]> {
  const out: Faq[] = [];
  for (const [i, line] of linesOf(text).entries()) {
    const parts = splitParts(line);
    if (parts.length === 2 && parts[0] && parts[1]) {
      out.push({ q: parts[0], a: parts[1] });
    } else {
      return { ok: false, error: `FAQ line ${i + 1}: write it as “Question | Answer”.` };
    }
  }
  return { ok: true, value: out };
}

export function socialLinksToText(v: unknown): string {
  if (!Array.isArray(v)) {
    if (typeof v === "string" && v) return v; // legacy plain URL per line
    return "";
  }
  return v
    .map((l) => {
      if (typeof l === "string") return l;
      if (!l || typeof l !== "object") return "";
      const o = l as Record<string, unknown>;
      return `${o.label ?? ""} | ${o.url ?? ""}`.trim();
    })
    .filter((l) => l.replace(/\|/g, "").trim())
    .join("\n");
}

const validUrl = (u: string) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch { return false; }
};

export function parseSocialLinks(text: string): ParseResult<SocialLink[]> {
  const out: SocialLink[] = [];
  for (const [i, line] of linesOf(text).entries()) {
    const parts = splitParts(line);
    if (parts.length === 1 && validUrl(parts[0])) {
      // Bare URL: label derived from the host (Facebook, YouTube, X, Instagram…).
      const host = new URL(parts[0]).hostname.replace(/^www\./, "");
      const label = host.includes("facebook") ? "Facebook"
        : host.includes("youtube") || host.includes("youtu.be") ? "YouTube"
        : host.includes("instagram") ? "Instagram"
        : host.includes("x.com") || host.includes("twitter") ? "X"
        : host;
      out.push({ label, url: parts[0] });
    } else if (parts.length === 2 && parts[0] && validUrl(parts[1])) {
      out.push({ label: parts[0], url: parts[1] });
    } else {
      return { ok: false, error: `Social link line ${i + 1}: write it as “Label | https://…” or paste a plain link.` };
    }
  }
  return { ok: true, value: out };
}

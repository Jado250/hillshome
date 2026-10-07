import Link from "next/link";
import { db } from "@/lib/db";

type SocialLink = { label: string; url: string };

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { label: "Facebook", url: "https://www.facebook.com/share/1cNDUveQhx/" },
  { label: "YouTube", url: "https://youtube.com/@hillshometoursrwanda?si=Iq6F3TqSEeJUKVSk" },
  { label: "X", url: "https://x.com/JodaLavidkuez" },
  { label: "Instagram", url: "https://www.instagram.com/hillshometoursrw?stkn=MWdxZWFvMzFianBm" },
];

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return DEFAULT_SOCIAL_LINKS;
  const parsed = value
    .map((v) => {
      if (typeof v === "string") {
        try {
          const u = new URL(v);
          const host = u.hostname.replace(/^www\./, "");
          const label = host.includes("facebook") ? "Facebook"
            : host.includes("youtube") || host.includes("youtu.be") ? "YouTube"
            : host.includes("instagram") ? "Instagram"
            : host.includes("x.com") || host.includes("twitter") ? "X"
            : host;
          return { label, url: v };
        } catch { return null; }
      }
      if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        if (typeof o.url === "string" && typeof o.label === "string" && o.url && o.label) {
          return { label: o.label, url: o.url };
        }
      }
      return null;
    })
    .filter((x): x is SocialLink => x !== null);
  return parsed.length > 0 ? parsed : DEFAULT_SOCIAL_LINKS;
}

const ICONS: Record<string, React.ReactNode> = {
  Facebook: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
    </svg>
  ),
  YouTube: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  ),
  X: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M17.7 3H21l-7.1 8.1L22.2 21h-6.6l-5.1-6.1L4.6 21H1.3l7.6-8.7L1.8 3h6.7l4.6 5.6L17.7 3Zm-1.2 16h1.8L7 4.9H5L16.5 19Z" />
    </svg>
  ),
  Instagram: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
};

export async function Footer() {
  const rows = await db.siteSetting.findMany().catch(() => []);
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value as unknown]));
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const social = parseSocialLinks(s["social.links"]);
  return (
    <footer className="mt-24 bg-navy-950 text-sm text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl text-white">{str(s["company.name"]) || "Hillshome Tours Company LTD"}</p>
          <p className="mt-3 max-w-sm">Transport, construction, cleaning and maintenance, IT, multimedia and tours.</p>
          <ul className="mt-5 flex items-center gap-4" aria-label="Social media">
            {social.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label}
                  className="inline-flex rounded p-1 text-white/70 transition hover:text-gold-500">
                  {ICONS[l.label] ?? <span className="underline">{l.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/tours">Tours</Link></li>
            <li><Link href="/projects">Projects</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Contact</p>
          <ul className="mt-3 space-y-2">
            {str(s["contact.phone"]) && <li>{str(s["contact.phone"])}</li>}
            {str(s["contact.email"]) && <li>{str(s["contact.email"])}</li>}
            {str(s["contact.address"]) && <li>{str(s["contact.address"])}</li>}
            <li><Link href="/contact">Send a message</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-x flex flex-wrap justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Hillshome Tours Company LTD</p>
          <p className="space-x-4"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link></p>
        </div>
      </div>
    </footer>
  );
}

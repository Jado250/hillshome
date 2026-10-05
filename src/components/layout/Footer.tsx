import Link from "next/link";
import { db } from "@/lib/db";

export async function Footer() {
  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "contact." } } }).catch(() => []);
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value as string]));
  return (
    <footer className="mt-24 bg-navy-950 text-sm text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl text-white">Hillshome Tours Company LTD</p>
          <p className="mt-3 max-w-sm">Transport, construction, cleaning and maintenance, IT, multimedia and tours.</p>
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
            {s["contact.phone"] && <li>{s["contact.phone"]}</li>}
            {s["contact.email"] && <li>{s["contact.email"]}</li>}
            {s["contact.address"] && <li>{s["contact.address"]}</li>}
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

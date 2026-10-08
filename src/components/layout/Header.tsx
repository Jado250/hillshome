import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/tours", label: "Tours" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Hillshome Tours Company LTD — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="Hillshome Tours Company Limited logo" className="h-12 w-12 rounded-full object-cover" />
          <span className="font-display text-lg font-semibold text-navy-900">
            Hillshome <span className="text-gold-600">Tours</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-navy-900 hover:text-gold-600">{n.label}</Link>
          ))}
        </nav>
        <Link href="/request" className="btn-gold hidden md:inline-flex">Request a Quote</Link>

        <MobileNav links={NAV} />
      </div>
    </header>
  );
}

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-navy-950/95">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Hillshome Tours Company LTD — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="Hillshome Tours Company Limited logo" className="h-12 w-12 rounded-full object-cover" />
          <span className="font-display text-lg font-semibold text-navy-900 dark:text-white">
            Hillshome <span className="text-gold-600">Tours</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-navy-900 hover:text-gold-600 dark:text-white dark:hover:text-gold-500">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/request" className="btn-gold">Request a Quote</Link>
        </div>

        {/* Mobile menu: no JS needed, uses <details> */}
        <details className="relative md:hidden">
          <summary className="btn-outline cursor-pointer list-none" aria-label="Open menu">Menu</summary>
          <nav aria-label="Mobile" className="absolute right-0 mt-2 w-56 rounded border border-navy-900/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-navy-900">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded px-2 py-2 text-sm hover:bg-navy-100 dark:hover:bg-white/10">{n.label}</Link>
            ))}
            <span className="mt-2 flex items-center justify-between px-2 py-2 text-sm">
              Theme <ThemeToggle />
            </span>
            <Link href="/request" className="btn-gold mt-2 w-full">Request a Quote</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

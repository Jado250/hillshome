"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function HamburgerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close after navigation (covers programmatic redirects too).
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded border border-navy-900/25 text-navy-900"
      >
        {open ? <XIcon /> : <HamburgerIcon />}
      </button>
      {open && (
        <nav aria-label="Mobile" className="absolute right-0 mt-2 w-56 rounded border border-navy-900/10 bg-white p-3 shadow-lg">
          {links.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="block rounded px-2 py-2 text-sm hover:bg-navy-100">{n.label}</Link>
          ))}
          <Link href="/request" onClick={() => setOpen(false)} className="btn-gold mt-2 w-full">Request a Quote</Link>
        </nav>
      )}
    </div>
  );
}

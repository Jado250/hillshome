"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";

export type AdminNavLink = { href: string; label: string; icon: string };

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const common = {
    "aria-hidden": true, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
    className,
  } as const;
  switch (name) {
    case "dashboard": return (<svg {...common}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>);
    case "requests": return (<svg {...common}><path d="M3 13l2-8h14l2 8v6H3z" /><path d="M3 13h6l1 2h4l1-2h6" /></svg>);
    case "tours": return (<svg {...common}><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
    case "services": return (<svg {...common}><rect x="4" y="8" width="16" height="11" rx="1" /><path d="M9 8V5h6v3M4 13h16" /></svg>);
    case "quotes": return (<svg {...common}><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v4h4M10 12h5M10 16h5" /></svg>);
    case "gallery": return (<svg {...common}><rect x="4" y="5" width="16" height="14" rx="1" /><circle cx="9" cy="10" r="1.5" /><path d="M4 17l5-4 4 3 3-2 4 3" /></svg>);
    case "customers": return (<svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.5c2.6.7 4.5 2.9 4.5 5.5" /></svg>);
    case "staff": return (<svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>);
    case "reports": return (<svg {...common}><path d="M4 20h16M7 20v-6M12 20V6M17 20v-9" /></svg>);
    case "settings": return (<svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" /></svg>);
    case "menu": return (<svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
    case "close": return (<svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case "collapse": return (<svg {...common}><path d="M14 6l-6 6 6 6" /></svg>);
    case "expand": return (<svg {...common}><path d="M10 6l6 6-6 6" /></svg>);
    default: return (<svg {...common}><circle cx="12" cy="12" r="8" /></svg>);
  }
}

export function AdminSidebar({ links, userName, userRole }: {
  links: AdminNavLink[]; userName: string; userRole: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close the mobile drawer after navigation.
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const nav = (onNavigate?: () => void, showLabels = true) => (
    <nav aria-label="Admin" className="mt-6 flex flex-col gap-1">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href + "/"));
        return (
          <Link key={l.href} href={l.href} onClick={onNavigate} title={l.label} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded py-2 text-sm transition ${showLabels ? "px-3" : "justify-center px-0"} ${active ? "bg-gold-500 font-semibold text-navy-950" : "hover:bg-white/10"}`}>
            <Icon name={l.icon} />
            {showLabels && <span>{l.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  // eslint-disable-next-line @next/next/no-img-element
  const Logo = ({ size = "h-10 w-10" }: { size?: string }) => (
    <img src="/logo.jpeg" alt="Hillshome Tours logo" className={`${size} rounded-full object-cover`} />
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-navy-950 p-4 text-white md:hidden">
        <span className="flex items-center gap-2">
          <Logo size="h-9 w-9" />
          <p className="font-display">Hillshome Admin</p>
        </span>
        <button type="button" onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/25">
          <Icon name={mobileOpen ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Logo size="h-9 w-9" />
                <p className="font-display text-lg">Hillshome Admin</p>
              </span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/25">
                <Icon name="close" />
              </button>
            </div>
            <p className="mt-1 text-xs text-white/60">{userName} · {userRole}</p>
            <div className="flex-1 overflow-y-auto">{nav(() => setMobileOpen(false))}</div>
            <LogoutButton />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden min-h-screen flex-col bg-navy-950 p-5 text-white transition-all md:flex ${collapsed ? "w-[76px]" : "w-[220px]"}`}>
        <div className={`flex gap-2 ${collapsed ? "flex-col items-center" : "items-center justify-between"}`}>
          {collapsed ? <Logo size="h-10 w-10" /> : (
            <span className="flex items-center gap-2">
              <Logo size="h-10 w-10" />
              <p className="font-display text-lg">Hillshome Admin</p>
            </span>
          )}
          <button type="button" onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/25 hover:bg-white/10">
            <Icon name={collapsed ? "expand" : "collapse"} />
          </button>
        </div>
        {!collapsed && <p className="mt-1 text-xs text-white/60">{userName} · {userRole}</p>}
        <div className="flex-1">{nav(undefined, !collapsed)}</div>
        <LogoutButton />
      </aside>
    </>
  );
}

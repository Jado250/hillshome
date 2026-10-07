import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>; // login page (middleware guards the rest)

  const links = [
    { href: "/admin", label: "Dashboard", show: true },
    { href: "/admin/requests", label: "Requests", show: true },
    { href: "/admin/tours", label: "Tours", show: can(session.role, "tours:manage") },
    { href: "/admin/services", label: "Services", show: can(session.role, "services:manage") },
    { href: "/admin/quotes", label: "Quotes", show: can(session.role, "quotes:manage") },
    { href: "/admin/gallery", label: "Gallery", show: can(session.role, "gallery:manage") },
    { href: "/admin/customers", label: "Customers", show: can(session.role, "requests:manage") },
    { href: "/admin/staff", label: "Staff", show: can(session.role, "staff:manage") },
    { href: "/admin/reports", label: "Reports", show: can(session.role, "reports:view") },
    { href: "/admin/settings", label: "Settings", show: can(session.role, "settings:manage") },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="bg-navy-950 p-5 text-white dark:border-white/10 md:dark:border-r">
        <p className="font-display text-lg">Hillshome Admin</p>
        <p className="mt-1 text-xs text-white/60">{session.name} · {session.role.replace("_", " ").toLowerCase()}</p>
        <nav aria-label="Admin" className="mt-6 flex flex-wrap gap-2 md:flex-col">
          {links.map((l) => <Link key={l.href} href={l.href} className="rounded px-2 py-1.5 text-sm hover:bg-white/10">{l.label}</Link>)}
        </nav>
        <LogoutButton />
      </aside>
      <div className="p-6">{children}</div>
    </div>
  );
}

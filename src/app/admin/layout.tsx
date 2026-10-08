import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { AdminSidebar, type AdminNavLink } from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>; // login page (middleware guards the rest)

  const links: AdminNavLink[] = ([
    { href: "/admin", label: "Dashboard", icon: "dashboard", show: true },
    { href: "/admin/requests", label: "Requests", icon: "requests", show: true },
    { href: "/admin/tours", label: "Tours", icon: "tours", show: can(session.role, "tours:manage") },
    { href: "/admin/services", label: "Services", icon: "services", show: can(session.role, "services:manage") },
    { href: "/admin/quotes", label: "Quotes", icon: "quotes", show: can(session.role, "quotes:manage") },
    { href: "/admin/gallery", label: "Gallery", icon: "gallery", show: can(session.role, "gallery:manage") },
    { href: "/admin/customers", label: "Customers", icon: "customers", show: can(session.role, "requests:manage") },
    { href: "/admin/staff", label: "Staff", icon: "staff", show: can(session.role, "staff:manage") },
    { href: "/admin/reports", label: "Reports", icon: "reports", show: can(session.role, "reports:view") },
    { href: "/admin/settings", label: "Settings", icon: "settings", show: can(session.role, "settings:manage") },
  ] as (AdminNavLink & { show: boolean })[]).filter((l) => l.show);

  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar
        links={links}
        userName={session.name}
        userRole={session.role.replace("_", " ").toLowerCase()}
      />
      <div className="min-w-0 flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { ServiceToggle } from "@/components/admin/ServiceToggle";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const dynamic = "force-dynamic";

export default async function ServicesAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "services:manage")) redirect("/admin");
  const categories = await db.serviceCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { services: { orderBy: { name: "asc" } } } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">Services</h1>
      <ServiceForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      {categories.map((c) => (
        <section key={c.id} className="mt-8">
          <h2 className="text-xl font-semibold">{c.name}</h2>
          <table className="mt-3 w-full bg-white dark:bg-navy-900 text-left text-sm">
            <thead className="border-b dark:border-white/10"><tr>{["Service", "Published", "Available", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              {c.services.map((s) => (
                <tr key={s.id} className="border-b last:border-0 dark:border-white/10">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.published ? "Yes" : "No"}</td>
                  <td className="p-3">{s.available ? "Yes" : "No"}</td>
                  <td className="p-3"><ServiceToggle id={s.id} published={s.published} available={s.available} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { CustomerRowActions } from "@/components/admin/CustomerRowActions";

export const dynamic = "force-dynamic";

export default async function CustomersAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "requests:manage")) redirect("/admin");
  const all = await db.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, service: true, tour: true },
  });
  const groups = new Map<string, typeof all>();
  for (const r of all) {
    const list = groups.get(r.email) ?? [];
    list.push(r);
    groups.set(r.email, list);
  }
  const rows = [...groups.entries()].map(([email, reqs]) => {
    const latest = reqs[0];
    const services = [...new Set(reqs.map((r) =>
      r.service ? `${r.category.name} — ${r.service.name}`
      : r.tour ? `${r.category.name} — ${r.tour.name}`
      : r.category.name))];
    return {
      email, name: latest.customerName, phone: latest.phone,
      count: reqs.length, last: latest.createdAt, services,
    };
  });
  rows.sort((a, b) => b.count - a.count);
  return (
    <div>
      <h1 className="text-3xl font-semibold">Customers</h1>
      {rows.length === 0 ? <p className="mt-6">No customers yet.</p> : (
        <div className="mt-6 overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b"><tr>{["Name", "Email", "Phone", "Services requested", "Requests", "Last request", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-b last:border-0">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3"><ul className="list-disc pl-4">{r.services.map((s) => <li key={s}>{s}</li>)}</ul></td>
                  <td className="p-3">{r.count}</td>
                  <td className="p-3">{r.last.toLocaleDateString()}</td>
                  <td className="p-3"><CustomerRowActions email={r.email} count={r.count} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

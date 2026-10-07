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
  const groups = await db.serviceRequest.groupBy({
    by: ["email"],
    _count: { _all: true },
    _max: { createdAt: true },
  });
  const rows = await Promise.all(groups.map(async (g) => {
    const latest = await db.serviceRequest.findFirst({ where: { email: g.email }, orderBy: { createdAt: "desc" } });
    return { ...g, name: latest?.customerName ?? "—", phone: latest?.phone ?? "—" };
  }));
  rows.sort((a, b) => b._count._all - a._count._all);
  return (
    <div>
      <h1 className="text-3xl font-semibold">Customers</h1>
      {rows.length === 0 ? <p className="mt-6">No customers yet.</p> : (
        <div className="mt-6 overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b"><tr>{["Name", "Email", "Phone", "Requests", "Last request", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-b last:border-0">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">{r._count._all}</td>
                  <td className="p-3">{r._max.createdAt?.toLocaleDateString()}</td>
                  <td className="p-3"><CustomerRowActions email={r.email} count={r._count._all} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

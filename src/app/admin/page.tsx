import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [byStatus, recent, tours, services, users, quotes] = await Promise.all([
    db.serviceRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    db.serviceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { category: true } }),
    db.tour.count(),
    db.service.count({ where: { published: true } }),
    db.user.count({ where: { active: true } }),
    db.quote.count(),
  ]);
  const total = byStatus.reduce((n, r) => n + r._count._all, 0);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Requests" value={total} href="/admin/requests" />
        <Stat label="Tours" value={tours} href="/admin/tours" />
        <Stat label="Services" value={services} href="/admin/services" />
        <Stat label="Quotes" value={quotes} href="/admin/quotes" />
      </div>
      <h2 className="mt-10 text-xl font-semibold">Requests by status</h2>
      {byStatus.length === 0 ? (
        <p className="mt-3 text-ink/70">No requests yet.</p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {byStatus.map((r) => (
            <li key={r.status} className="bg-white p-3 text-sm">
              <span className="font-medium">{r.status.replace("_", " ")}</span>: {r._count._all}
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-10 text-xl font-semibold">Recent requests</h2>
      {recent.length === 0 ? (
        <p className="mt-3 text-ink/70">Nothing yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto bg-white">
          <table className="w-full min-w-[620px] bg-white text-left text-sm">
          <thead className="border-b"><tr>{["Reference", "Customer", "Service", "Status", "Date"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3"><Link href={`/admin/requests/${r.id}`} className="underline">{r.reference}</Link></td>
                <td className="p-3">{r.customerName}</td>
                <td className="p-3">{r.category.name}</td>
                <td className="p-3">{r.status.replace("_", " ")}</td>
                <td className="p-3">{r.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 text-sm text-ink/70">Active staff accounts: {users}</p>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white p-5 transition hover:shadow-sm">
      <p className="text-sm text-ink/70">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-navy-900">{value}</p>
    </Link>
  );
}

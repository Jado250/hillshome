import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function ReportsAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "reports:view")) redirect("/admin");

  const [byStatus, byCategory, quotes, acceptedValue, total, tours, gallery] = await Promise.all([
    db.serviceRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    db.serviceRequest.groupBy({ by: ["categoryId"], _count: { _all: true } }),
    db.quote.groupBy({ by: ["status"], _count: { _all: true } }),
    db.quote.aggregate({ where: { status: "ACCEPTED" }, _sum: { amount: true } }),
    db.serviceRequest.count(),
    db.tour.count({ where: { published: true, archivedAt: null } }),
    db.galleryItem.count({ where: { published: true } }),
  ]);
  const categories = await db.serviceCategory.findMany();
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <h1 className="text-3xl font-semibold">Reports</h1>
      <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Total requests: {total} · Published tours: {tours} · Gallery items: {gallery}</p>

      <h2 className="mt-8 text-xl font-semibold">Requests by status</h2>
      <ul className="mt-3 bg-white dark:bg-navy-900 p-4 text-sm">
        {byStatus.map((r) => <li key={r.status}>{r.status.replace("_", " ")}: {r._count._all}</li>)}
        {byStatus.length === 0 && <li>No data yet.</li>}
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Requests by category</h2>
      <ul className="mt-3 bg-white dark:bg-navy-900 p-4 text-sm">
        {byCategory.map((r) => <li key={r.categoryId}>{catName[r.categoryId] ?? r.categoryId}: {r._count._all}</li>)}
        {byCategory.length === 0 && <li>No data yet.</li>}
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Quotes</h2>
      <ul className="mt-3 bg-white dark:bg-navy-900 p-4 text-sm">
        {quotes.map((q) => <li key={q.status}>{q.status}: {q._count._all}</li>)}
        {quotes.length === 0 && <li>No data yet.</li>}
        <li>Accepted value total: {acceptedValue._sum.amount ? acceptedValue._sum.amount.toString() : "0"}</li>
      </ul>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function ToursAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "tours:manage")) redirect("/admin");
  const tours = await db.tour.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Tours</h1>
        <Link href="/admin/tours/new" className="btn-gold">Add tour</Link>
      </div>
      {tours.length === 0 ? <p className="mt-6">No tours yet.</p> : (
        <div className="mt-6 overflow-x-auto bg-white">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b"><tr>{["Name", "Destination", "Days", "Price", "Status", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              {tours.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3">{t.name}{t.isDemo && <span className="ml-2 text-xs text-gold-600">DEMO</span>}</td>
                  <td className="p-3">{t.destination}</td>
                  <td className="p-3">{t.durationDays}</td>
                  <td className="p-3">{t.price ? `${t.currency} ${t.price}` : "On request"}</td>
                  <td className="p-3">{t.archivedAt ? "Archived" : t.published ? "Published" : "Draft"}{!t.available && " · unavailable"}</td>
                  <td className="p-3"><Link href={`/admin/tours/${t.id}`} className="underline">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function QuotesAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "quotes:manage")) redirect("/admin");
  const quotes = await db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { request: true } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">Quotes</h1>
      {quotes.length === 0 ? <p className="mt-6">No quotes yet. Create one from a request.</p> : (
        <div className="mt-6 overflow-x-auto bg-white">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b"><tr>{["Reference", "Customer", "Amount", "Status", "Valid until", "Created"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b last:border-0">
                  <td className="p-3">{q.request.reference}</td>
                  <td className="p-3">{q.request.customerName}</td>
                  <td className="p-3">{q.currency} {q.amount.toString()}</td>
                  <td className="p-3">{q.status}</td>
                  <td className="p-3">{q.validUntil ? q.validUntil.toLocaleDateString() : "—"}</td>
                  <td className="p-3">{q.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

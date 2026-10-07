import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma, RequestStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Requests({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { q, status } = await searchParams;
  const where: Prisma.ServiceRequestWhereInput = {};
  if (session.role === "STAFF") where.assigneeId = session.id;
  if (status) where.status = status as RequestStatus;
  if (q) where.OR = [
    { reference: { contains: q, mode: "insensitive" } },
    { customerName: { contains: q, mode: "insensitive" } },
  ];
  const items = await db.serviceRequest.findMany({
    where, orderBy: { createdAt: "desc" }, take: 100, include: { category: true, assignee: true },
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold">Requests</h1>
      <form className="mt-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Reference or name" aria-label="Search requests" className="input max-w-xs" />
        <select name="status" defaultValue={status ?? ""} aria-label="Filter by status" className="input max-w-[11rem]">
          <option value="">All statuses</option>
          {["PENDING","IN_REVIEW","QUOTED","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <button className="btn-navy">Filter</button>
      </form>
      {items.length === 0 ? <p className="mt-6">No service requests found.</p> : (
        <div className="mt-6 overflow-x-auto bg-white">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b"><tr>{["Reference","Customer","Service","Status","Assigned"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3"><Link href={`/admin/requests/${r.id}`} className="font-medium underline">{r.reference}</Link></td>
                  <td className="p-3">{r.customerName}</td><td className="p-3">{r.category.name}</td>
                  <td className="p-3">{r.status.replace("_", " ")}</td><td className="p-3">{r.assignee?.name ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { RequestActions } from "@/components/admin/RequestActions";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { RequestDeleteButton } from "@/components/admin/RequestDeleteButton";

export const dynamic = "force-dynamic";

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const r = await db.serviceRequest.findUnique({
    where: { id },
    include: { category: true, service: true, tour: true, assignee: true, attachments: true,
      quotes: true, notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      history: { orderBy: { createdAt: "desc" } } },
  });
  if (!r || (session.role === "STAFF" && r.assigneeId !== session.id)) notFound();
  const staff = can(session.role, "requests:manage")
    ? await db.user.findMany({ where: { active: true }, select: { id: true, name: true } }) : [];

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => v ? <div><dt className="text-xs text-ink/60">{k}</dt><dd>{v}</dd></div> : null;
  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{r.reference}</h1>
        {can(session.role, "requests:manage") && <RequestDeleteButton id={r.id} reference={r.reference} />}
      </div>
      <section className="grid gap-3 bg-white p-5 sm:grid-cols-2">
        <Row k="Customer" v={r.customerName} /><Row k="Phone" v={r.phone} /><Row k="Email" v={r.email} />
        <Row k="Category" v={r.category.name} /><Row k="Service" v={r.service?.name} /><Row k="Tour" v={r.tour?.name} />
        <Row k="Preferred date" v={r.preferredDate?.toDateString()} /><Row k="Location" v={r.location} />
        <Row k="Requirements" v={r.requirements} />
      </section>
      <section className="bg-white p-5">
        <h2 className="font-semibold">Details</h2>
        <dl className="mt-2 grid gap-3 sm:grid-cols-2">
          {Object.entries(r.details as Record<string, unknown>).map(([k, v]) => <Row key={k} k={k} v={String(v)} />)}
        </dl>
      </section>
      {r.attachments.length > 0 && (
        <section className="bg-white p-5"><h2 className="font-semibold">Attachments</h2>
          <ul className="mt-2 text-sm">{r.attachments.map((a) => <li key={a.id}>{a.originalName} ({Math.round(a.sizeBytes / 1024)} KB)</li>)}</ul>
          <p className="mt-2 text-xs text-ink/60">Download route is not built yet.</p></section>
      )}
      <RequestActions id={r.id} status={r.status} assigneeId={r.assigneeId} staff={staff}
        canAssign={can(session.role, "requests:manage")} />
      <section className="bg-white p-5"><h2 className="font-semibold">Quotes</h2>
        {r.quotes.length === 0 ? <p className="mt-2 text-sm">No quotes yet.</p> : (
          <ul className="mt-2 space-y-1 text-sm">{r.quotes.map((q) => (
            <li key={q.id}>{q.currency} {q.amount.toString()} · {q.status} · {q.details.slice(0, 80)}</li>))}</ul>
        )}
        {can(session.role, "quotes:manage") && <QuoteForm requestId={r.id} />}
      </section>
      <section className="bg-white p-5"><h2 className="font-semibold">Internal notes</h2>
        {r.notes.length === 0 ? <p className="mt-2 text-sm">No notes yet.</p> :
          <ul className="mt-2 space-y-2 text-sm">{r.notes.map((n) => <li key={n.id}><b>{n.author.name}:</b> {n.body}</li>)}</ul>}</section>
      <section className="bg-white p-5"><h2 className="font-semibold">Activity</h2>
        <ul className="mt-2 space-y-1 text-sm">{r.history.map((h) => (
          <li key={h.id}>{h.createdAt.toDateString()}: {h.fromStatus ?? "New"} → {h.toStatus}</li>))}</ul></section>
    </div>
  );
}

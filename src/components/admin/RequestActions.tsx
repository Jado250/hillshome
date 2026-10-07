"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING","IN_REVIEW","QUOTED","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"];

type Props = { id: string; status: string; assigneeId: string | null; staff: { id: string; name: string }[]; canAssign: boolean };

export function RequestActions({ id, status, assigneeId, staff, canAssign }: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { status: fd.get("status") };
    if (canAssign) body.assigneeId = fd.get("assigneeId") || null;
    const note = String(fd.get("note") ?? "").trim();
    if (note) body.note = note;
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) { setMsg("Saved."); (e.target as HTMLFormElement).reset(); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not save changes.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-5">
      <h2 className="font-semibold">Update request</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" defaultValue={status} className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
        {canAssign && (
          <div><label htmlFor="assigneeId" className="label">Assigned to</label>
            <select id="assigneeId" name="assigneeId" defaultValue={assigneeId ?? ""} className="input">
              <option value="">Unassigned</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        )}
      </div>
      <div><label htmlFor="note" className="label">Add internal note</label>
        <textarea id="note" name="note" rows={3} className="input" /></div>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RequestDeleteButton({ id, reference }: { id: string; reference: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Delete request ${reference} permanently? Its quotes, notes and history will also be removed.`)) return;
    setBusy(true); setMsg("");
    const res = await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) { router.push("/admin/requests"); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not delete.");
  }

  return (
    <span className="flex items-center gap-3">
      <button onClick={remove} disabled={busy} className="btn-outline text-xs disabled:opacity-60">
        {busy ? "Deleting…" : "Delete request"}
      </button>
      {msg && <span className="text-xs text-red-700">{msg}</span>}
    </span>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function QuoteForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const body = {
      requestId,
      amount: fd.get("amount"),
      currency: fd.get("currency") || "RWF",
      details: fd.get("details"),
      validUntil: fd.get("validUntil") || undefined,
      notes: fd.get("notes") || undefined,
    };
    const res = await fetch("/api/admin/quotes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) { setMsg("Quote created."); (e.target as HTMLFormElement).reset(); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not save.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="q-amount">Amount</label><input id="q-amount" name="amount" type="number" step="0.01" min="0" required className="input" /></div>
        <div><label className="label" htmlFor="q-currency">Currency</label><input id="q-currency" name="currency" maxLength={3} defaultValue="RWF" className="input" /></div>
      </div>
      <div><label className="label" htmlFor="q-details">Quote details</label><textarea id="q-details" name="details" rows={3} required className="input" placeholder="What is included, payment terms, etc." /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="q-valid">Valid until</label><input id="q-valid" name="validUntil" type="date" className="input" /></div>
        <div><label className="label" htmlFor="q-notes">Internal notes</label><input id="q-notes" name="notes" className="input" /></div>
      </div>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Saving…" : "Create quote"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

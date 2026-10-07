"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ServiceForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/services", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: fd.get("categoryId"),
        name: fd.get("name"),
        description: fd.get("description") || undefined,
        available: fd.get("available") === "on",
        published: fd.get("published") === "on",
      }),
    });
    setBusy(false);
    if (res.ok) { setMsg("Service added."); (e.target as HTMLFormElement).reset(); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not add.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4 bg-white p-6">
      <h2 className="font-semibold">Add a new service</h2>
      <div><label className="label" htmlFor="sv-category">Category</label>
        <select id="sv-category" name="categoryId" required className="input" defaultValue="">
          <option value="" disabled>Choose…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label className="label" htmlFor="sv-name">Service name</label><input id="sv-name" name="name" required minLength={2} className="input" placeholder="e.g. Apartment painting" /></div>
      <div><label className="label" htmlFor="sv-desc">Description (optional)</label><textarea id="sv-desc" name="description" rows={2} className="input" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="available" defaultChecked /> Available</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Published (visible on website)</label>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Adding…" : "Add service"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

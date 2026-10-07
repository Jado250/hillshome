"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  name: string; destination: string; durationDays: number; shortDescription: string; description: string;
  price: string; currency: string; mainImage: string; included: string; excluded: string; requirements: string;
  available: boolean; published: boolean; archived: boolean;
};

export function TourForm({ action, method, initial }: { action: string; method: "POST" | "PATCH"; initial: Initial }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"), destination: fd.get("destination"), durationDays: fd.get("durationDays"),
      shortDescription: fd.get("shortDescription"), description: fd.get("description"),
      price: fd.get("price") || "", currency: fd.get("currency") || "USD", mainImage: fd.get("mainImage") || null,
      includedText: fd.get("included"), excludedText: fd.get("excluded"), requirementsText: fd.get("requirements"),
      available: fd.get("available") === "on", published: fd.get("published") === "on",
      archived: fd.get("archived") === "on",
    };
    const res = await fetch(action, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (res.ok) { router.push("/admin/tours"); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not save.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-4 bg-white p-6 dark:bg-navy-900">
      <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required defaultValue={initial.name} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="destination">Destination</label><input id="destination" name="destination" required defaultValue={initial.destination} className="input" /></div>
        <div><label className="label" htmlFor="durationDays">Duration (days)</label><input id="durationDays" name="durationDays" type="number" min={1} required defaultValue={initial.durationDays} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="shortDescription">Short description</label><input id="shortDescription" name="shortDescription" required defaultValue={initial.shortDescription} className="input" /></div>
      <div><label className="label" htmlFor="description">Description</label><textarea id="description" name="description" rows={4} required defaultValue={initial.description} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="price">Price (empty = on request)</label><input id="price" name="price" type="number" step="0.01" min={0} defaultValue={initial.price} className="input" /></div>
        <div><label className="label" htmlFor="currency">Currency</label><input id="currency" name="currency" maxLength={3} defaultValue={initial.currency} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="mainImage">Main image URL</label><input id="mainImage" name="mainImage" defaultValue={initial.mainImage} className="input" /></div>
      <div><label className="label" htmlFor="included">Included (one per line)</label><textarea id="included" name="included" rows={3} defaultValue={initial.included} className="input" /></div>
      <div><label className="label" htmlFor="excluded">Excluded (one per line)</label><textarea id="excluded" name="excluded" rows={3} defaultValue={initial.excluded} className="input" /></div>
      <div><label className="label" htmlFor="requirements">Requirements (one per line)</label><textarea id="requirements" name="requirements" rows={3} defaultValue={initial.requirements} className="input" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="available" defaultChecked={initial.available} /> Available</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={initial.published} /> Published (visible on website)</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="archived" defaultChecked={initial.archived} /> Archived</label>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Saving…" : "Save tour"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

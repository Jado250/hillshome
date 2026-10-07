"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GalleryForm({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/gallery", { method: "POST", body: new FormData(e.currentTarget) });
    setBusy(false);
    if (res.ok) { setMsg("Added."); (e.target as HTMLFormElement).reset(); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not add.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4 bg-white p-6 dark:bg-navy-900">
      <h2 className="font-semibold">Add a project / gallery image</h2>
      <div><label className="label" htmlFor="g-category">Category</label>
        <select id="g-category" name="categorySlug" required className="input" defaultValue="">
          <option value="" disabled>Choose…</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      <div><label className="label" htmlFor="g-title">Title</label><input id="g-title" name="title" required className="input" /></div>
      <div><label className="label" htmlFor="g-alt">Alt text (optional)</label><input id="g-alt" name="alt" className="input" /></div>
      <div><label className="label" htmlFor="g-file">Upload image (JPG/PNG, max 5 MB)</label><input id="g-file" name="file" type="file" accept="image/jpeg,image/png" className="input" /></div>
      <p className="text-xs text-ink/60 dark:text-white/60">…or paste an image URL instead:</p>
      <div><label className="label" htmlFor="g-url">Image URL</label><input id="g-url" name="url" placeholder="/demo/tours.svg or https://…" className="input" /></div>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Adding…" : "Add item"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

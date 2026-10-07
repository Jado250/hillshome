"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ServiceToggle({ id, published, available }: { id: string; published: boolean; available: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function toggle(field: "published" | "available") {
    setMsg("");
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field === "published" ? { published: !published } : { available: !available }),
    });
    if (res.ok) router.refresh();
    else setMsg((await res.json().catch(() => null))?.error ?? "Failed.");
  }

  async function remove() {
    if (!confirm("Delete this service? Past requests are kept but will no longer link to it.")) return;
    setMsg("");
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setMsg((await res.json().catch(() => null))?.error ?? "Failed.");
  }

  return (
    <span className="flex flex-wrap gap-2">
      <button onClick={() => toggle("published")} className="btn-outline text-xs">{published ? "Unpublish" : "Publish"}</button>
      <button onClick={() => toggle("available")} className="btn-outline text-xs">{available ? "Mark unavailable" : "Mark available"}</button>
      <button onClick={remove} className="btn-outline text-xs">Delete</button>
      {msg && <span className="text-xs text-red-700 dark:text-red-400">{msg}</span>}
    </span>
  );
}

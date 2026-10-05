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

  return (
    <span className="flex gap-2">
      <button onClick={() => toggle("published")} className="btn-outline text-xs">{published ? "Unpublish" : "Publish"}</button>
      <button onClick={() => toggle("available")} className="btn-outline text-xs">{available ? "Mark unavailable" : "Mark available"}</button>
      {msg && <span className="text-xs text-red-700">{msg}</span>}
    </span>
  );
}

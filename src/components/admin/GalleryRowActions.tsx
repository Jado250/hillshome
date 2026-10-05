"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GalleryRowActions({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function patch() {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }),
    });
    if (res.ok) router.refresh(); else setMsg("Failed.");
  }
  async function remove() {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); else setMsg("Failed.");
  }

  return (
    <div className="mt-2 flex gap-2">
      <button onClick={patch} className="btn-outline text-xs">{published ? "Hide" : "Publish"}</button>
      <button onClick={remove} className="btn-outline text-xs">Delete</button>
      {msg && <span className="text-xs text-red-700">{msg}</span>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerRowActions({ email, count }: { email: string; count: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function remove() {
    if (!confirm(`Delete this customer and ALL ${count} of their request(s)? Quotes, notes and history go with them. This cannot be undone.`)) return;
    setMsg("");
    const res = await fetch(`/api/admin/customers?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setMsg((await res.json().catch(() => null))?.error ?? "Failed.");
  }

  return (
    <span className="flex items-center gap-2">
      <button onClick={remove} className="btn-outline text-xs">Delete</button>
      {msg && <span className="text-xs text-red-700 dark:text-red-400">{msg}</span>}
    </span>
  );
}

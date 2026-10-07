"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StaffForm() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/staff", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), role: fd.get("role") }),
    });
    setBusy(false);
    if (res.ok) { setMsg("Staff member added."); (e.target as HTMLFormElement).reset(); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not add.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-4 bg-white p-6 dark:bg-navy-900">
      <h2 className="font-semibold">Add staff member</h2>
      <div><label className="label" htmlFor="s-name">Name</label><input id="s-name" name="name" required className="input" /></div>
      <div><label className="label" htmlFor="s-email">Email</label><input id="s-email" name="email" type="email" required className="input" /></div>
      <div><label className="label" htmlFor="s-password">Password (min 8 chars)</label><input id="s-password" name="password" type="password" minLength={8} required className="input" /></div>
      <div><label className="label" htmlFor="s-role">Role</label>
        <select id="s-role" name="role" className="input" defaultValue="STAFF">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super admin</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Adding…" : "Add staff"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) { router.push("/admin"); router.refresh(); return; }
    setError((await res?.json().catch(() => null))?.error ?? "Could not sign in. Try again.");
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm bg-white p-8 dark:bg-navy-900">
      <h1 className="text-2xl font-semibold">Staff sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div><label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required className="input" /></div>
        <div><label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
        <button disabled={busy} className="btn-navy w-full disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

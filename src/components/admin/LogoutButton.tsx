"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button className="mt-6 text-sm underline" onClick={async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login"); router.refresh();
    }}>Log out</button>
  );
}

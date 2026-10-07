"use client";

import { useRouter } from "next/navigation";

/** Goes to the previous page, or to `fallback` when there is no history. */
export function BackButton({ fallback, label = "Back", className = "btn-outline text-sm" }: {
  fallback: string; label?: string; className?: string;
}) {
  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  }
  return <button type="button" onClick={goBack} className={className}>← {label}</button>;
}

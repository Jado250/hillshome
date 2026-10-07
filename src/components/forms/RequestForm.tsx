"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoryFields, commonFields, allowsFiles, type Field } from "@/lib/forms/config";
import type { CategorySlug } from "@/lib/validation/requests";

type Props = { category: CategorySlug; tourSlug?: string; serviceSlug?: string; tours?: { slug: string; name: string }[] };

export function RequestForm({ category, tourSlug, serviceSlug, tours = [] }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError("");
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = { tourSlug, serviceSlug };
    if (category === "tours" && !tourSlug) data.tourSlug = String(fd.get("tourSlug") ?? "") || undefined;
    for (const f of [...commonFields, ...categoryFields[category]]) data[f.name] = fd.get(f.name) ?? "";

    const body = new FormData();
    body.set("category", category);
    body.set("data", JSON.stringify(data));
    for (const file of fd.getAll("files")) if (file instanceof File && file.size) body.append("files", file);

    try {
      const res = await fetch("/api/requests", { method: "POST", body });
      const json = await res.json();
      if (res.ok) { router.push(`/request/confirmation/${json.reference}`); return; }
      if (json.errors) setErrors(json.errors);
      setFormError(json.error ?? "Please fix the highlighted fields and send again.");
    } catch {
      setFormError("We could not send your request. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  const render = (f: Field) => {
    const err = errors[f.name]?.[0];
    const common = { id: f.name, name: f.name, required: f.required, className: "input",
      "aria-invalid": !!err, "aria-describedby": err ? `${f.name}-err` : undefined } as const;
    return (
      <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
        <label htmlFor={f.name} className="label">{f.label}{f.required && " *"}</label>
        {f.type === "textarea" ? <textarea {...common} rows={4} />
          : f.type === "select" ? (
            <select {...common} defaultValue="">
              <option value="" disabled>Choose…</option>
              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : <input {...common} type={f.type} min={f.type === "number" ? 1 : undefined} />}
        {f.help && <p className="mt-1 text-xs text-ink/70">{f.help}</p>}
        {err && <p id={`${f.name}-err`} role="alert" className="mt-1 text-xs text-red-700">{err}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {commonFields.map(render)}
        {category === "tours" && !tourSlug && (
          tours.length > 0 ? (
            <div>
              <label htmlFor="tourSlug" className="label">Select a tour *</label>
              <select id="tourSlug" name="tourSlug" required defaultValue="" className="input"
                aria-invalid={!!errors.tourSlug} aria-describedby={errors.tourSlug ? "tourSlug-err" : undefined}>
                <option value="" disabled>Choose…</option>
                {tours.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
              {errors.tourSlug && <p id="tourSlug-err" role="alert" className="mt-1 text-xs text-red-700">{errors.tourSlug[0]}</p>}
            </div>
          ) : <p className="text-sm text-ink/70">No tours are currently available for booking. Please check again later.</p>
        )}
        {categoryFields[category].map(render)}
        {allowsFiles.includes(category) && (
          <div className="sm:col-span-2">
            <label htmlFor="files" className="label">Photos or documents (optional)</label>
            <input id="files" name="files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="input" />
            <p className="mt-1 text-xs text-ink/70">Up to 5 files, JPG, PNG or PDF, 5 MB each.</p>
            {errors.files && <p role="alert" className="mt-1 text-xs text-red-700">{errors.files[0]}</p>}
          </div>
        )}
      </div>
      {formError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
      <button type="submit" disabled={busy} className="btn-gold disabled:opacity-60">
        {busy ? "Sending…" : "Send request"}
      </button>
      <p className="text-xs text-ink/70">Sending a request does not confirm a booking. Our team will review it and contact you.</p>
    </form>
  );
}

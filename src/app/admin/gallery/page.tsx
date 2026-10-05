import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { GalleryForm } from "@/components/admin/GalleryForm";
import { GalleryRowActions } from "@/components/admin/GalleryRowActions";

export const dynamic = "force-dynamic";

export default async function GalleryAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "gallery:manage")) redirect("/admin");
  const [items, categories] = await Promise.all([
    db.galleryItem.findMany({ orderBy: { id: "desc" } }),
    db.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-semibold">Projects & Gallery</h1>
      <GalleryForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <h2 className="mt-10 text-xl font-semibold">All items</h2>
      {items.length === 0 ? <p className="mt-3">No items yet.</p> : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <figure key={i.id} className="bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.url} alt={i.alt} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="mt-2 text-sm">{i.title} · <span className="text-ink/60">{i.categorySlug}</span>{i.isDemo && <span className="ml-1 text-xs text-gold-600">DEMO</span>}</figcaption>
              <p className="text-xs text-ink/60">{i.published ? "Published" : "Hidden"}</p>
              <GalleryRowActions id={i.id} published={i.published} />
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

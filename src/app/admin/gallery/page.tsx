import { redirect } from "next/navigation";
import Image from "next/image";
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
    db.galleryItem.findMany({ orderBy: { createdAt: "desc" } }),
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
            <figure key={i.id} className="group bg-white p-3 transition hover:shadow-md">
              <span className="relative block aspect-[4/3] w-full overflow-hidden">
                <Image src={i.url} alt={i.alt} fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105" />
              </span>
              <figcaption className="mt-2 text-sm">{i.title} · <span className="text-ink/70">{i.categorySlug}</span>{i.isDemo && <span className="ml-1 text-xs text-gold-600">DEMO</span>}</figcaption>
              <p className="text-xs text-ink/70">{i.published ? "Published" : "Hidden"}</p>
              <GalleryRowActions id={i.id} published={i.published} />
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

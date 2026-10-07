import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };

export default async function Projects() {
  const items = await db.galleryItem.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="container-x py-16">
      <h1 className="text-4xl font-semibold">Projects</h1>
      {items.length === 0 ? <p className="mt-6">No projects have been added yet.</p> : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <figure key={i.id} className="group overflow-hidden bg-white transition hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.url} alt={i.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" />
              <figcaption className="p-3 text-sm transition group-hover:text-gold-600">{i.title}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

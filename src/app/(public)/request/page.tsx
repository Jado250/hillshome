import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { listCategories } from "@/server/services";
import { RequestForm } from "@/components/forms/RequestForm";
import { CATEGORY_SLUGS, type CategorySlug } from "@/lib/validation/requests";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Request a service" };

type SP = { category?: string; tour?: string; service?: string };

export default async function RequestPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const categories = await listCategories();
  const selected = categories.find((c) => c.slug === sp.category && CATEGORY_SLUGS.includes(c.slug as CategorySlug));
  const tours = selected?.slug === "tours"
    ? await db.tour.findMany({
        where: { published: true, archivedAt: null, available: true },
        orderBy: { name: "asc" }, select: { slug: true, name: true },
      })
    : [];

  return (
    <div className="container-x max-w-3xl py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Request a service</h1>
      <nav aria-label="Service category" className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link key={c.id} href={`/request?category=${c.slug}`} aria-current={selected?.slug === c.slug}
            className={selected?.slug === c.slug ? "btn-navy" : "btn-outline"}>{c.name}</Link>
        ))}
      </nav>
      {selected ? (
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-semibold">{selected.name}</h2>
          <RequestForm category={selected.slug as CategorySlug} tourSlug={sp.tour} serviceSlug={sp.service} tours={tours} />
        </section>
      ) : <p className="mt-10">Choose a service above to open its request form.</p>}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { listTours } from "@/server/tours";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tours" };

export default async function Tours({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.slice(0, 80);
  const tours = await listTours(q);
  return (
    <div className="container-x py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Tours</h1>
      <form className="mt-6 flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search tours</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name or destination" className="input min-w-0" />
        <button className="btn-navy">Search</button>
      </form>
      {tours.length === 0 ? (
        <p className="mt-8">No tours are currently available. Please check again later.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => (
            <article key={t.id} className="bg-white p-6">
              <h2 className="text-xl font-semibold">{t.name}</h2>
              <p className="mt-1 text-sm text-ink/70">{t.destination} · {t.durationDays} day{t.durationDays > 1 ? "s" : ""}</p>
              <p className="mt-3 text-sm">{t.shortDescription}</p>
              <p className="mt-3 font-semibold">{t.price ? `${t.currency} ${t.price}` : "Price on request"}</p>
              <Link href={`/tours/${t.slug}`} className="btn-outline mt-4">View tour</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

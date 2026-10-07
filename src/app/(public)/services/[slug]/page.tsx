import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/server/services";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = await getCategory((await params).slug);
  return c ? { title: c.name, description: c.shortDescription } : {};
}

export default async function ServiceDetail({ params }: P) {
  const c = await getCategory((await params).slug);
  if (!c) notFound();
  return (
    <>
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-x">
          <h1 className="text-4xl font-semibold !text-white">{c.name}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{c.description}</p>
        </div>
      </section>
      <div className="container-x py-12">
        <BackButton fallback="/services" label="All services" />
        <div className="mt-8">
        {c.slug === "tours" ? (
          <Link href="/tours" className="btn-navy">Browse tours</Link>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">What is included</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {c.services.filter((s) => s.available).map((s) => (
                <li key={s.id} className="border-l-4 border-gold-500 bg-white p-4 dark:bg-navy-900">{s.name}</li>
              ))}
            </ul>
            <Link href={`/request?category=${c.slug}`} className="btn-gold mt-8">Request this service</Link>
          </>
        )}
        </div>
      </div>
    </>
  );
}

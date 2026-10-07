import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTour } from "@/server/tours";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const t = await getTour((await params).slug);
  return t ? { title: t.name, description: t.shortDescription } : {};
}

const List = ({ title, items }: { title: string; items: string[] }) =>
  items.length ? (
    <section><h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-2 list-disc pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul></section>
  ) : null;

export default async function TourDetail({ params }: P) {
  const t = await getTour((await params).slug);
  if (!t) notFound();
  return (
    <div className="container-x max-w-3xl py-16">
      <BackButton fallback="/tours" label="All tours" />
      <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{t.name}</h1>
      <p className="mt-2 text-ink/70">{t.destination} · {t.durationDays} day{t.durationDays > 1 ? "s" : ""}</p>
      <p className="mt-2 text-lg font-semibold">{t.price ? `${t.currency} ${t.price}` : "Price on request"}</p>
      <p className="mt-6 whitespace-pre-line">{t.description}</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <List title="Included" items={t.included} />
        <List title="Not included" items={t.excluded} />
        <List title="Requirements" items={t.requirements} />
      </div>
      {t.available
        ? <Link href={`/request?category=tours&tour=${t.slug}`} className="btn-gold mt-10">Book now</Link>
        : <p className="mt-10 rounded bg-gold-100 p-4">This tour is not currently available for booking.</p>}
    </div>
  );
}

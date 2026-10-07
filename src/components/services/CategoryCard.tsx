import Link from "next/link";

type Props = { slug: string; name: string; shortDescription: string; kind: "BOOKING" | "SERVICE" | "QUOTATION" };

export function CategoryCard({ slug, name, shortDescription, kind }: Props) {
  return (
    <article className="flex flex-col border-t-4 border-gold-500 bg-white p-6 dark:bg-navy-900">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="mt-2 flex-1 text-sm text-ink/80 dark:text-white/80">{shortDescription}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/services/${slug}`} className="btn-outline">Learn more</Link>
        <Link href={`/request?category=${slug}`} className="btn-navy">
          {kind === "BOOKING" ? "Book now" : "Request service"}
        </Link>
      </div>
    </article>
  );
}

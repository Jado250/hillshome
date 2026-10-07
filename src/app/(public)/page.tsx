import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { listCategories } from "@/server/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Home" };

type Testimonial = { name: string; role?: string; quote: string };
type Faq = { q: string; a: string };

export default async function Home() {
  const [categories, tours, gallery, services, settings] = await Promise.all([
    listCategories(),
    db.tour.findMany({ where: { published: true, archivedAt: null }, take: 3, orderBy: { name: "asc" } }),
    db.galleryItem.findMany({ where: { published: true }, take: 6, orderBy: { createdAt: "desc" } }),
    db.service.findMany({ where: { published: true, available: true }, include: { category: true }, take: 8, orderBy: { name: "asc" } }),
    db.siteSetting.findMany(),
  ]);
  const s = Object.fromEntries(settings.map((r) => [r.key, r.value])) as Record<string, unknown>;
  const companyName = (s["company.name"] as string) ?? "Hillshome Tours Company LTD";
  const intro = (s["about.intro"] as string) || "Hillshome Tours Company LTD is a multi-service company offering transport, construction, cleaning and facility maintenance, IT & digital solutions, multimedia and tours.";
  const whyChoose = Array.isArray(s["home.whyChoose"]) ? (s["home.whyChoose"] as string[]) : [];
  const testimonials = Array.isArray(s["home.testimonials"]) ? (s["home.testimonials"] as Testimonial[]) : [];
  const faq = Array.isArray(s["home.faq"]) ? (s["home.faq"] as Faq[]) : [];
  const contact = [
    ["Phone", s["contact.phone"]], ["Email", s["contact.email"]],
    ["WhatsApp", s["contact.whatsapp"]], ["Address", s["contact.address"]],
  ].filter(([, v]) => typeof v === "string" && v) as [string, string][];

  return (
    <>
      {/* 1. Hero */}
      <section className="bg-navy-950 py-20 text-white">
        <div className="container-x">
          <p className="text-sm uppercase tracking-widest text-gold-500">{companyName}</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold text-white sm:text-5xl">
            Transport • Construction • IT • Multimedia • Cleaning • Tourism
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            One company, many services. Tell us what you need and our team will review your request and get back to you with a clear quotation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className="btn-gold">Explore Services</Link>
            <Link href="/request" className="btn-outline border-white text-white hover:bg-white/10">Request a Quote</Link>
          </div>
        </div>
      </section>

      {/* 2. Company introduction */}
      <section className="container-x py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Who we are</h2>
        <p className="mt-3 max-w-3xl text-ink/80">{intro}</p>
        <Link href="/about" className="mt-4 inline-block underline">Learn more about us</Link>
      </section>

      {/* 3. Service categories */}
      <section className="bg-white py-14">
        <div className="container-x">
          <h2 className="text-2xl font-semibold sm:text-3xl">Our services</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/services/${c.slug}`} className="border border-navy-900/10 p-6 transition hover:border-gold-600">
                <h3 className="text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 text-sm text-ink/70">{c.shortDescription}</p>
                <span className="mt-4 inline-block text-sm font-medium text-gold-600">View details →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured services */}
      <section className="container-x py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Featured services</h2>
        {services.length === 0 ? (
          <p className="mt-4 text-ink/70">Services will appear here once published.</p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((sv) => (
              <li key={sv.id} className="border border-navy-900/10 bg-white p-4">
                <Link href={`/services/${sv.category.slug}`} className="font-medium hover:underline">{sv.name}</Link>
                <p className="mt-1 text-xs text-ink/70">{sv.category.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5. Featured tours */}
      <section className="bg-paper py-14">
        <div className="container-x">
          <h2 className="text-2xl font-semibold sm:text-3xl">Featured tours</h2>
          {tours.length === 0 ? (
            <p className="mt-4 text-ink/70">No tours available yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((t) => (
                <article key={t.id} className="bg-white p-6">
                  <h3 className="text-xl font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-ink/70">{t.destination} · {t.durationDays} day{t.durationDays > 1 ? "s" : ""}</p>
                  <p className="mt-3 text-sm">{t.shortDescription}</p>
                  <p className="mt-3 font-semibold">{t.price ? `${t.currency} ${t.price}` : "Price on request"}</p>
                  <Link href={`/tours/${t.slug}`} className="btn-outline mt-4">View tour</Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Projects / gallery */}
      <section className="container-x py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Projects & gallery</h2>
        {gallery.length === 0 ? (
          <p className="mt-4 text-ink/70">Project photos will appear here once added.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((i) => (
              <figure key={i.id} className="group">
                <span className="relative block aspect-[4/3] w-full overflow-hidden">
                  <Image src={i.url} alt={i.alt} fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105" />
                </span>
                <figcaption className="mt-2 text-sm transition group-hover:text-gold-600">{i.title}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* 7. Why choose Hillshome */}
      {whyChoose.length > 0 && (
        <section className="bg-white py-14">
          <div className="container-x">
            <h2 className="text-2xl font-semibold sm:text-3xl">Why choose Hillshome</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {whyChoose.map((w) => <li key={w} className="border-l-4 border-gold-500 pl-4">{w}</li>)}
            </ul>
          </div>
        </section>
      )}

      {/* 8. Testimonials */}
      {testimonials.length > 0 && (
        <section className="container-x py-14">
          <h2 className="text-2xl font-semibold sm:text-3xl">What customers say</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <blockquote key={i} className="border border-navy-900/10 bg-white p-6">
                <p>“{t.quote}”</p>
                <footer className="mt-3 text-sm font-medium text-navy-900">{t.name}{t.role ? ` · ${t.role}` : ""}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* 9. FAQ */}
      {faq.length > 0 && (
        <section className="bg-paper py-14">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">Frequently asked questions</h2>
            <div className="mt-8 space-y-3">
              {faq.map((f, i) => (
                <details key={i} className="border border-navy-900/10 bg-white p-4">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm text-ink/80">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Contact strip */}
      <section className="container-x py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Contact us</h2>
        {contact.length > 0 ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contact.map(([k, v]) => (
              <div key={k}><dt className="text-sm font-medium">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-ink/70">Contact details can be added in the admin settings.</p>
        )}
        <Link href="/contact" className="btn-navy mt-6">Get in touch</Link>
      </section>
    </>
  );
}

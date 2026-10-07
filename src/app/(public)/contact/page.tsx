import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact" };

const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

function PersonCard({ title, email, phone }: { title: string; email: string; phone: string }) {
  if (!email && !phone) return null;
  return (
    <section className="mt-8 border border-navy-900/10 bg-white p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {email && (
          <div>
            <dt className="font-medium">Email</dt>
            <dd><a href={`mailto:${email}`} className="underline hover:text-gold-600">{email}</a></dd>
          </div>
        )}
        {phone && (
          <div>
            <dt className="font-medium">Phone (call & WhatsApp)</dt>
            <dd className="flex flex-wrap items-center gap-3">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline hover:text-gold-600">{phone}</a>
              <a href={waLink(phone)} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs">Chat on WhatsApp</a>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export default async function Contact() {
  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "contact." } } });
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value as string]));
  const str = (k: string) => s[k] ?? "";
  const general = [["Phone", str("contact.phone")], ["Email", str("contact.email")],
    ["WhatsApp", str("contact.whatsapp")], ["Address", str("contact.address")]].filter(([, v]) => v);
  const hasOfficers = str("contact.md.email") || str("contact.md.phone") || str("contact.it.email") || str("contact.it.phone");
  return (
    <div className="container-x max-w-2xl py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Contact us</h1>
      {general.length > 0 && (
        <dl className="mt-6 space-y-3">
          {general.map(([k, v]) => <div key={k}><dt className="text-sm font-medium">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      <PersonCard title="Managing Director" email={str("contact.md.email")} phone={str("contact.md.phone")} />
      <PersonCard title="IT Officer" email={str("contact.it.email")} phone={str("contact.it.phone")} />
      {!general.length && !hasOfficers && (
        <p className="mt-6 rounded bg-gold-100 p-4 text-sm">Contact details have not been added yet. They can be set in the admin settings.</p>
      )}
      <p className="mt-8">To send us a message or ask for a price, use the request form.</p>
      <Link href="/request" className="btn-gold mt-4">Request a quote</Link>
    </div>
  );
}

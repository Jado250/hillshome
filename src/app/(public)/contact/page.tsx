import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact" };

export default async function Contact() {
  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "contact." } } });
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value as string]));
  const items = [["Phone", s["contact.phone"]], ["Email", s["contact.email"]],
    ["WhatsApp", s["contact.whatsapp"]], ["Address", s["contact.address"]]].filter(([, v]) => v);
  return (
    <div className="container-x max-w-2xl py-16">
      <h1 className="text-4xl font-semibold">Contact us</h1>
      {items.length ? (
        <dl className="mt-6 space-y-3">
          {items.map(([k, v]) => <div key={k}><dt className="text-sm font-medium">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      ) : <p className="mt-6 rounded bg-gold-100 p-4 text-sm">Contact details have not been added yet. They can be set in the admin settings.</p>}
      <p className="mt-8">To send us a message or ask for a price, use the request form.</p>
      <Link href="/request" className="btn-gold mt-4">Request a quote</Link>
    </div>
  );
}

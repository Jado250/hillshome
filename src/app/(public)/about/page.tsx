import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About" };

export default async function About() {
  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "about." } } }).catch(() => []);
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string | string[]>;
  const blocks = [
    ["Who we are", s["about.intro"]], ["Mission", s["about.mission"]], ["Vision", s["about.vision"]],
  ] as const;
  const values = (s["about.values"] as string[] | undefined) ?? [];
  const empty = blocks.every(([, v]) => !v) && !values.length;
  return (
    <div className="container-x max-w-3xl py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">About Hillshome Tours Company LTD</h1>
      <p className="mt-4 text-lg">Hillshome offers transport, construction, cleaning and maintenance, IT, multimedia and tourism services.</p>
      {empty && <p className="mt-8 rounded bg-gold-100 p-4 text-sm">Company profile content has not been added yet. It can be edited in the admin settings.</p>}
      {blocks.map(([title, text]) => text ? (
        <section key={title} className="mt-8"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-2">{text}</p></section>
      ) : null)}
      {values.length > 0 && (
        <section className="mt-8"><h2 className="text-2xl font-semibold">Values</h2>
          <ul className="mt-2 list-disc pl-5">{values.map((v) => <li key={v}>{v}</li>)}</ul></section>
      )}
    </div>
  );
}

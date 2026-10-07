import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "settings:manage")) redirect("/admin");
  const rows = await db.siteSetting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
  const initial = {
    companyName: str(s["company.name"]),
    phone: str(s["contact.phone"]),
    email: str(s["contact.email"]),
    address: str(s["contact.address"]),
    whatsapp: str(s["contact.whatsapp"]),
    aboutIntro: str(s["about.intro"]),
    mission: str(s["about.mission"]),
    vision: str(s["about.vision"]),
    values: arr(s["about.values"]).join("\n"),
    whyChoose: arr(s["home.whyChoose"]).join("\n"),
    socialLinks: JSON.stringify(s["social.links"] ?? [], null, 2),
    testimonials: JSON.stringify(s["home.testimonials"] ?? [], null, 2),
    faq: JSON.stringify(s["home.faq"] ?? [], null, 2),
  };
  return (
    <div>
      <h1 className="text-3xl font-semibold">Settings</h1>
      <SettingsForm initial={initial} />
    </div>
  );
}

function str(v: unknown) { return typeof v === "string" ? v : ""; }
function arr(v: unknown): string[] { return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; }

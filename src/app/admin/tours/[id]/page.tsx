import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { TourForm } from "@/components/admin/TourForm";

export const dynamic = "force-dynamic";

export default async function EditTour({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "tours:manage")) redirect("/admin");
  const { id } = await params;
  const t = await db.tour.findUnique({ where: { id } });
  if (!t) notFound();
  return (
    <div>
      <h1 className="text-3xl font-semibold">Edit tour</h1>
      <TourForm method="PATCH" action={`/api/admin/tours/${t.id}`} initial={{
        name: t.name, destination: t.destination, durationDays: t.durationDays,
        shortDescription: t.shortDescription, description: t.description,
        price: t.price ? String(t.price) : "", currency: t.currency, mainImage: t.mainImage ?? "",
        included: t.included.join("\n"), excluded: t.excluded.join("\n"), requirements: t.requirements.join("\n"),
        available: t.available, published: t.published, archived: !!t.archivedAt,
      }} />
    </div>
  );
}

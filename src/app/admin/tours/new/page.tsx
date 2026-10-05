import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { TourForm } from "@/components/admin/TourForm";

export const dynamic = "force-dynamic";

export default async function NewTour() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "tours:manage")) redirect("/admin");
  return (
    <div>
      <h1 className="text-3xl font-semibold">Add tour</h1>
      <TourForm method="POST" action="/api/admin/tours" initial={{
        name: "", destination: "", durationDays: 1, shortDescription: "", description: "",
        price: "", currency: "USD", mainImage: "", included: "", excluded: "", requirements: "",
        available: true, published: false, archived: false,
      }} />
    </div>
  );
}

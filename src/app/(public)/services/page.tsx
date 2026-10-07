import type { Metadata } from "next";
import { listCategories } from "@/server/services";
import { CategoryCard } from "@/components/services/CategoryCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services" };

export default async function Services() {
  const categories = await listCategories();
  return (
    <div className="container-x py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Our services</h1>
      {categories.length === 0 ? <p className="mt-6">No services are listed yet. Please check again later.</p> : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => <CategoryCard key={c.id} {...c} />)}
        </div>
      )}
    </div>
  );
}

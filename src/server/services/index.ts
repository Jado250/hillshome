import { db } from "@/lib/db";

export const listCategories = () =>
  db.serviceCategory.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });

export const getCategory = (slug: string) =>
  db.serviceCategory.findFirst({
    where: { slug, published: true },
    include: { services: { where: { published: true }, orderBy: { name: "asc" } } },
  });

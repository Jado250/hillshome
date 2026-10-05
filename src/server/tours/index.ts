import { db } from "@/lib/db";

const visible = { published: true, archivedAt: null } as const;

export function listTours(q?: string) {
  return db.tour.findMany({
    where: {
      ...visible,
      ...(q ? { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { destination: { contains: q, mode: "insensitive" } },
      ] } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export const getTour = (slug: string) =>
  db.tour.findFirst({ where: { slug, ...visible }, include: { images: { orderBy: { sortOrder: "asc" } } } });

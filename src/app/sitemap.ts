import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/services", "/tours", "/projects", "/contact", "/request"].map((p) => ({ url: `${base}${p}` }));
}

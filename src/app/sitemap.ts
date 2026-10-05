import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticPages = ["", "/about", "/academics", "/notices", "/gallery", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));

  let notices: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.notice.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    notices = rows.map((n) => ({
      url: `${base}/notices/${n.slug}`,
      lastModified: n.updatedAt,
    }));
  } catch {
    // DB unavailable at build time
  }

  return [...staticPages, ...notices];
}

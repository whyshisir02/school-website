import { prisma } from "./db";
import { GALLERY_PAGE_SIZE } from "./pagination";
import type { GalleryYearFilter } from "./gallery-year";

export async function getGalleryPage(page: number, album = "all", year: GalleryYearFilter = "all") {
  const where = {
    ...(album === "all" ? {} : { album: { slug: album } }),
    ...(year === "all" ? {} : { eventBsYear: year === "unspecified" ? null : year }),
  };
  const [images, total] = await Promise.all([
    prisma.galleryImage.findMany({
      where, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * GALLERY_PAGE_SIZE, take: GALLERY_PAGE_SIZE,
      select: { id: true, url: true, caption: true, eventBsYear: true, album: { select: { slug: true, title: true } } },
    }),
    prisma.galleryImage.count({ where }),
  ]);
  return { images, total, hasMore: page * GALLERY_PAGE_SIZE < total };
}

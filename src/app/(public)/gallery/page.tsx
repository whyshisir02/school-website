import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { getGalleryPage } from "@/lib/gallery-data";
export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: "Gallery", description: `School photos and memories at ${s.name}.` };
}
export default async function GalleryPage() {
  const [albums, initial, yearGroups] = await Promise.all([
    prisma.galleryAlbum.findMany({ where: { images: { some: {} } }, orderBy: { createdAt: "desc" }, select: { slug: true, title: true, _count: { select: { images: true } } } }),
    getGalleryPage(1),
    prisma.galleryImage.groupBy({ by: ["eventBsYear"] }),
  ]);
  return <><PageHeader title="Photo Gallery" breadcrumb="Gallery" /><div className="container-page py-12">
    <GalleryGrid albums={albums.map((a) => ({ slug: a.slug, title: a.title, count: a._count.images }))} initial={initial}
      years={yearGroups.flatMap((row) => row.eventBsYear === null ? [] : [row.eventBsYear]).sort((a, b) => b - a)}
      hasUnspecified={yearGroups.some((row) => row.eventBsYear === null)} />
  </div></>;
}

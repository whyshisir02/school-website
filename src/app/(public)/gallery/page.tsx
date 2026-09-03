import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo albums of events, sports and festivals at Eastern View English School.",
};

export default async function GalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    include: { images: { orderBy: { order: "asc" }, take: 20 } },
  });

  return (
    <>
      <PageHeader title="Photo Gallery" breadcrumb="Gallery" />
      <div className="container-page py-12">
        <GalleryGrid
          albums={albums.map((a) => ({
            slug: a.slug,
            title: a.title,
            images: a.images.map((i) => ({ url: i.url, caption: i.caption })),
          }))}
        />
      </div>
    </>
  );
}

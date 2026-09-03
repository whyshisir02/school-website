import { prisma } from "@/lib/db";
import GalleryAdmin from "@/components/admin/GalleryAdmin";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    include: { images: { orderBy: { order: "asc" } } },
  });

  return (
    <GalleryAdmin
      albums={albums.map((a) => ({
        id: a.id,
        title: a.title,
        images: a.images.map((i) => ({ id: i.id, url: i.url })),
      }))}
    />
  );
}

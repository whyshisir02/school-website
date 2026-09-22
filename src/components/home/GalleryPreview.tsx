import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

// NOTE: revalidate lives in the page (src/app/(public)/page.tsx), not here —
// exporting it from a component has no effect.

export default async function GalleryPreview() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { album: { select: { title: true } } },
  });

  if (images.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="container-page">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Gallery</h2>
          <Link href="/gallery" className="btn-outline !px-5 !py-2 text-sm">
            View Full Gallery
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => (
            <Link
              key={img.id}
              href="/gallery"
              className="group relative aspect-[16/9] overflow-hidden rounded-xl"
              title={img.album.title}
            >
              <Image
                src={img.url}
                alt={img.caption ?? img.album.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-110"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

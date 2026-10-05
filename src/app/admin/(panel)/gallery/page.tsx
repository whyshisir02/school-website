import { requirePageAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import { pageNumber, GALLERY_PAGE_SIZE } from "@/lib/pagination";
import { currentBsYear, parseGalleryYear, uploadYearChoices } from "@/lib/gallery-year";
export const dynamic = "force-dynamic";
export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ album?: string; page?: string; year?: string }> }) {
  await requirePageAccess("GALLERY");
  const params = await searchParams;
  const albums = await prisma.galleryAlbum.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, _count: { select: { images: true } } } });
  const active = albums.find((a) => a.id === params.album) ?? albums[0];
  const year = parseGalleryYear(params.year);
  const where = {
    albumId: active?.id ?? "",
    ...(year === "all" ? {} : { eventBsYear: year === "unspecified" ? null : year }),
  };
  const [total, yearGroups] = active ? await Promise.all([
    prisma.galleryImage.count({ where }),
    prisma.galleryImage.groupBy({ by: ["eventBsYear"], where: { albumId: active.id } }),
  ]) : [0, []];
  const page = Math.min(pageNumber(params.page), Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE)));
  const images = active ? await prisma.galleryImage.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * GALLERY_PAGE_SIZE, take: GALLERY_PAGE_SIZE, select: { id: true, url: true, eventBsYear: true } }) : [];
  const years = [...new Set([...uploadYearChoices(), ...yearGroups.flatMap((row) => row.eventBsYear === null ? [] : [row.eventBsYear])])].sort((a, b) => b - a);
  return <GalleryAdmin albums={albums.map((a) => ({ id: a.id, title: a.title, count: a._count.images }))} activeId={active?.id ?? ""} images={images} page={page} totalPages={Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE))}
    yearFilter={year} yearOptions={years} defaultUploadYear={currentBsYear()} hasUnspecified={yearGroups.some((row) => row.eventBsYear === null)} />;
}

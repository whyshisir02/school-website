"use server";
import { auditTransaction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { AlbumError, saveAlbumRecord, deleteEmptyAlbumRecord, moveAlbumPhotos } from "@/lib/gallery-albums";
import { requireAdmin } from "@/lib/auth-helpers";
import { cleanUnusedMedia } from "@/lib/media-cleanup";
import { validBsYear } from "@/lib/gallery-year";

export async function createAlbum(formData: FormData) {
  const session = await requireAdmin("GALLERY");
  try {
    const album = await auditTransaction<Awaited<ReturnType<typeof saveAlbumRecord>>>(session, (album) => ({ action: "ALBUM_CREATED", targetId: album.id }), (tx) => saveAlbumRecord(tx, formData.get("title")));
    refreshGallery();
    return { ok: true as const, id: album.id };
  } catch (error) { return albumFailure(error); }
}
function refreshGallery() { revalidatePath("/admin/gallery"); revalidatePath("/gallery"); revalidatePath("/"); }
function albumFailure(error: unknown) {
  return { ok: false as const, error: error instanceof AlbumError ? error.message : error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "An album with this name already exists." : "Could not update the album. Refresh and try again." };
}
export async function renameAlbum(id: string, title: string) {
  const session = await requireAdmin("GALLERY");
  if (typeof id !== "string" || !id) return { ok: false as const, error: "Select an album first." };
  try { await auditTransaction(session, { action: "ALBUM_RENAMED", targetId: id }, (tx) => saveAlbumRecord(tx, title, id)); refreshGallery(); return { ok: true as const }; }
  catch (error) { return albumFailure(error); }
}
export async function deleteAlbum(id: string) {
  const session = await requireAdmin("GALLERY");
  try { await auditTransaction(session, { action: "ALBUM_DELETED", targetId: id }, (tx) => deleteEmptyAlbumRecord(tx, id)); refreshGallery(); return { ok: true as const }; }
  catch (error) { return albumFailure(error); }
}
export async function movePhotos(source: string, destination: string, ids: string[]) {
  const session = await requireAdmin("GALLERY");
  try {
    const count = await auditTransaction<number>(session, (count) => ({ action: "PHOTOS_MOVED", targetId: destination, details: { count, sourceId: source, destinationId: destination } }), (tx) => moveAlbumPhotos(tx, source, destination, ids));
    refreshGallery(); return { ok: true as const, count };
  } catch (error) { return albumFailure(error); }
}
export async function deleteImage(imageId: string) {
  const session = await requireAdmin("GALLERY");
  try {
    const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) return { ok: false, error: "This photo is already removed. Refresh and try again." };
    await auditTransaction(session, { action: "PHOTO_DELETED", targetId: imageId }, async (tx) => {
      if (image.publicId) await tx.mediaCleanup.upsert({ where: { publicId: image.publicId }, create: { publicId: image.publicId }, update: { notBefore: new Date() } });
      await tx.galleryImage.delete({ where: { id: imageId } });
    });
    await cleanUnusedMedia().catch(() => null);
    revalidatePath("/admin/gallery"); revalidatePath("/gallery"); revalidatePath("/");
    return { ok: true };
  } catch { return { ok: false, error: "Could not delete this photo. Please try again." }; }
}
export async function cleanupMedia() {
  const session = await requireAdmin("SCHOOL_SETTINGS");
  try { return { ok: true as const, ...await cleanUnusedMedia() }; }
  catch { return { ok: false as const, error: "Cleanup could not complete. Please try again." }; }
}

/** Update only the selected images in the stated album. Older photos may stay undated. */
export async function assignGalleryBsYear(albumId: string, imageIds: string[], year: number | null) {
  const session = await requireAdmin("GALLERY");
  if (!albumId || !Array.isArray(imageIds) || imageIds.length === 0 || imageIds.length > 24 ||
      imageIds.some((id) => typeof id !== "string" || !id) || (year !== null && !validBsYear(year))) {
    return { ok: false, error: "Select up to 24 photos and a valid BS year." };
  }
  try {
    const result = await auditTransaction<{ count: number }>(session, (result) => { if (!result.count) throw new Error("No photos were updated."); return { action: "PHOTO_YEAR_CHANGED", targetId: albumId, details: { count: result.count, year } }; }, (tx) => tx.galleryImage.updateMany({
      where: { albumId, id: { in: [...new Set(imageIds)] } },
      data: { eventBsYear: year },
    }));
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");
    return result.count ? { ok: true, count: result.count } : { ok: false, error: "These photos are no longer in this album. Refresh and select them again." };
  } catch {
    return { ok: false, error: "Could not update photo years. Please try again." };
  }
}

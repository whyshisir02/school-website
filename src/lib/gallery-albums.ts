import { Prisma } from "@prisma/client";
import { slugify } from "./slugify";

export class AlbumError extends Error {}
export function albumName(value: unknown) {
  const title = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  const slug = slugify(title).replace(/^-+|-+$/g, "");
  if (!title || title.length > 80 || !slug) throw new AlbumError("Enter an album name up to 80 characters, including letters or numbers.");
  return { title, slug };
}
export async function saveAlbumRecord(tx: Prisma.TransactionClient, value: unknown, id?: string) {
  const data = albumName(value);
  const duplicate = await tx.galleryAlbum.findFirst({ where: {
    ...(id ? { id: { not: id } } : {}),
    OR: [{ slug: data.slug }, { title: { equals: data.title, mode: "insensitive" } }],
  } });
  if (duplicate) throw new AlbumError("An album with this name already exists.");
  return id ? tx.galleryAlbum.update({ where: { id }, data }) : tx.galleryAlbum.create({ data });
}
export async function deleteEmptyAlbumRecord(tx: Prisma.TransactionClient, id: string) {
  // Lock the parent before counting: new image FK inserts must wait for this transaction.
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "GalleryAlbum" WHERE id = ${id} FOR UPDATE`;
  if (!rows.length) throw new AlbumError("This album no longer exists. Refresh the gallery.");
  if (await tx.galleryImage.count({ where: { albumId: id } })) throw new AlbumError("Move all photos to another album before deleting this album.");
  await tx.galleryAlbum.delete({ where: { id } });
}
export async function moveAlbumPhotos(tx: Prisma.TransactionClient, source: string, destination: string, ids: string[]) {
  if (!source || !destination || source === destination || !Array.isArray(ids) || !ids.length || ids.length > 24 || ids.some((id) => typeof id !== "string" || !id) || new Set(ids).size !== ids.length)
    throw new AlbumError("Select up to 24 photos and a different destination album.");
  const albums = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "GalleryAlbum" WHERE id IN (${source}, ${destination}) ORDER BY id FOR UPDATE`;
  if (albums.length !== 2) throw new AlbumError("An album no longer exists. Refresh the gallery.");
  const result = await tx.galleryImage.updateMany({ where: { albumId: source, id: { in: ids } }, data: { albumId: destination } });
  // Throwing rolls back any partial move if another administrator changed the selection.
  if (result.count !== ids.length) throw new AlbumError("Some selected photos changed. Refresh and select them again.");
  return result.count;
}

"use server";

import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth-helpers";

export async function createAlbum(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const slug = slugify(title);
  const exists = await prisma.galleryAlbum.findUnique({ where: { slug } });
  if (exists) return;
  await prisma.galleryAlbum.create({ data: { title, slug } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function deleteImage(imageId: string) {
  await requireAdmin();
  const img = await prisma.galleryImage.findUnique({ where: { id: imageId } });
  if (img?.publicId) {
    try {
      await cloudinary.uploader.destroy(img.publicId);
    } catch {
      // ignore CDN deletion failure
    }
  }
  await prisma.galleryImage.delete({ where: { id: imageId } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

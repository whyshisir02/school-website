import { prisma } from "./db";
import { cloudinary } from "./cloudinary";
import { referencesMedia } from "./media-reference";

/** Durable retry queue: never forget an asset when a CDN deletion fails. */
export async function queueMediaCleanup(publicId: string, delayMs = 0) {
  await prisma.mediaCleanup.upsert({
    where: { publicId },
    create: { publicId, notBefore: new Date(Date.now() + delayMs) },
    update: { notBefore: new Date(Date.now() + delayMs) },
  });
}
export async function cleanUnusedMedia() {
  const tasks = await prisma.mediaCleanup.findMany({
    where: { notBefore: { lte: new Date() } }, orderBy: { notBefore: "asc" }, take: 30,
  });
  const settings = await prisma.settings.findUnique({ where: { id: "main" }, select: { announcement: true, branding: true, heroSlides: true, principal: true, chairman: true } });
  let deleted = 0;
  let failed = 0;
  for (const task of tasks) {
    // Protect any asset already committed to published content.
    const gallery = await prisma.galleryImage.count({ where: { publicId: task.publicId } });
    const notice = await prisma.notice.count({ where: { content: { contains: task.publicId } } });
    const staff = await prisma.staffMember.count({ where: { publicId: task.publicId } });
    if (referencesMedia(task.publicId, settings, notice, gallery, staff)) {
      // Recheck editor assets later so deleting an embedded photo also releases storage.
      await prisma.mediaCleanup.updateMany({ where: { publicId: task.publicId }, data: { notBefore: new Date(Date.now() + 7 * 86400_000) } });
      continue;
    }
    try {
      const result = await cloudinary.uploader.destroy(task.publicId, { invalidate: true });
      if (result.result !== "ok" && result.result !== "not found") throw new Error("Deletion failed");
      await prisma.mediaCleanup.deleteMany({ where: { publicId: task.publicId } });
      deleted++;
    } catch {
      failed++;
      await prisma.mediaCleanup.updateMany({ where: { publicId: task.publicId }, data: { notBefore: new Date(Date.now() + 5 * 60_000) } });
    }
  }
  return { deleted, failed, remaining: await prisma.mediaCleanup.count() };
}

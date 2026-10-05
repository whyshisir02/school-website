import type { Prisma } from "@prisma/client";
import { readAnnouncementState, validateAnnouncement, announcementTime, type AnnouncementIntent, type AnnouncementState } from "./announcement";
import { isSchoolUpload } from "./media-folder";

export async function saveAnnouncementState(tx: Prisma.TransactionClient, revision: string, intent: AnnouncementIntent, input: unknown): Promise<AnnouncementState> {
  if (!["draft", "publish", "hide", "remove"].includes(intent)) throw new Error("Unknown announcement action.");
  await tx.$queryRaw`SELECT id FROM "Settings" WHERE id = 'main' FOR UPDATE`;
  const row = await tx.settings.findUnique({ where: { id: "main" } });
  if (!row) throw new Error("Save the school settings first.");
  const previous = readAnnouncementState(row.announcement);
  if (revision !== previous.revision) throw new Error("Another admin updated this announcement. Reload the page before saving.");
  const next: AnnouncementState = { ...previous, revision: crypto.randomUUID() };
  if (intent === "hide") next.live = null;
  else if (intent === "remove") { next.live = null; next.draft = null; }
  else {
    const data = validateAnnouncement(input);
    if (!isSchoolUpload(data.url, data.publicId, "announcements", process.env.CLOUDINARY_CLOUD_NAME || "")) throw new Error("Choose an image uploaded through Announcements.");
    if (intent === "publish") {
      const end = announcementTime(data.endBS);
      if (end !== null && end <= Date.now()) throw new Error("The end date has already passed. Update it before publishing.");
      next.live = data;
    }
    next.draft = data;
  }
  const oldAssets = [previous.draft, previous.live].filter((x) => x !== null);
  const nextAssets = [next.draft, next.live].filter((x) => x !== null);
  for (const asset of nextAssets) {
    if (oldAssets.some((old) => old.publicId === asset.publicId && old.url === asset.url)) continue;
    const pending = await tx.mediaCleanup.findUnique({ where: { publicId: asset.publicId } });
    if (!pending || pending.notBefore <= new Date()) throw new Error("This upload expired. Please upload the image again.");
    // Both draft and live can refer to the same newly uploaded image.
  }
  for (const asset of nextAssets) await tx.mediaCleanup.deleteMany({ where: { publicId: asset.publicId } });
  for (const asset of oldAssets) if (!nextAssets.some((next) => next.publicId === asset.publicId)) {
    const notBefore = new Date(Date.now() + 86400_000);
    await tx.mediaCleanup.upsert({ where: { publicId: asset.publicId }, create: { publicId: asset.publicId, notBefore }, update: { notBefore } });
  }
  await tx.settings.update({ where: { id: "main" }, data: { announcement: next } });
  return next;
}

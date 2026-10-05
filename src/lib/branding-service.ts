import type { Prisma } from "@prisma/client";
import { normalizeBranding, type SchoolBranding } from "./school-branding";
import { isSchoolUpload } from "./media-folder";
export async function saveSchoolBranding(tx: Prisma.TransactionClient, data: SchoolBranding) {
  // Serialize asset reference changes with other branding saves.
  await tx.$queryRaw`SELECT id FROM "Settings" WHERE id = 'main' FOR UPDATE`;
  const row = await tx.settings.findUnique({ where: { id: "main" } });
  if (!row) throw new Error("Save school contact details before branding.");
  const old = normalizeBranding(row.branding);
  for (const key of ["logo", "signature"] as const) {
    const next = data[key], previous = old[key];
    if (next?.url === previous?.url && next?.publicId === previous?.publicId) continue;
    if (next) {
      if (!isSchoolUpload(next.url, next.publicId, "branding", process.env.CLOUDINARY_CLOUD_NAME || "")) throw new Error("Choose a logo or signature uploaded through this form.");
      const pending = await tx.mediaCleanup.findUnique({ where: { publicId: next.publicId } });
      if (!pending || pending.notBefore <= new Date()) throw new Error("This image upload expired. Upload it again.");
      await tx.mediaCleanup.delete({ where: { publicId: next.publicId } });
    }
    if (previous?.publicId) await tx.mediaCleanup.upsert({ where: { publicId: previous.publicId }, create: { publicId: previous.publicId, notBefore: new Date(Date.now() + 86400_000) }, update: { notBefore: new Date(Date.now() + 86400_000) } });
  }
  await tx.settings.update({ where: { id: "main" }, data: { branding: data } });
}

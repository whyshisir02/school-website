import type { Prisma } from "@prisma/client";
import { validateSettings } from "./settings-validation";
import { EMPTY_BRANDING, validateBranding } from "./school-branding";

export function validateSchoolSetup(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Use a school setup JSON object.");
  const input = raw as Record<string, unknown>;
  const contact = Object.fromEntries(["schoolName", "address", "phone", "email", "mapLink", "mapEmbed"].map((key) => [key, typeof input[key] === "string" ? input[key].trim() : ""])) as Record<"schoolName" | "address" | "phone" | "email" | "mapLink" | "mapEmbed", string>;
  const errors = validateSettings(contact);
  if (Object.keys(errors).length) throw new Error(`Correct the setup fields: ${Object.keys(errors).join(", ")}.`);
  const { data: branding, fieldErrors } = validateBranding(input.branding ?? EMPTY_BRANDING);
  if (Object.keys(fieldErrors).length) throw new Error(`Correct the branding fields: ${Object.keys(fieldErrors).join(", ")}.`);
  // A new deployment starts with no assets from another account.
  if (branding.logo || branding.signature) throw new Error("Upload the school's own logo and signature after initialization.");
  return { ...contact, branding };
}
export async function assertEmptySchool(tx: Prisma.TransactionClient) {
  const counts = await Promise.all([tx.settings.count(), tx.user.count(), tx.notice.count(), tx.galleryAlbum.count(), tx.galleryImage.count(), tx.staffMember.count(), tx.contactInquiry.count(), tx.activityLog.count(), tx.mediaCleanup.count(), tx.accountSetupToken.count()]);
  if (counts.some(Boolean)) throw new Error("Database contains school data. Initialization refused; use a separate empty database.");
}
export async function initializeSchool(tx: Prisma.TransactionClient, setup: ReturnType<typeof validateSchoolSetup>, passwordHash: string) {
  await assertEmptySchool(tx);
  await tx.settings.create({ data: { id: "main", ...setup, heroSlides: [], stats: [], principal: {}, chairman: {} } });
  await tx.user.create({ data: { name: "Website owner", email: "shisir@super.admin", role: "SUPER_ADMIN", permissions: [], passwordHash } });
}

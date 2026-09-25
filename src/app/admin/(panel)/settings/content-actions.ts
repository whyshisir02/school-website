"use server";

import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { sanitizeNoticeHtml } from "@/lib/sanitize";
import { SCHOOL } from "@/lib/school";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type SaveMessagesResult = { ok: boolean; error?: string };

/**
 * Persist the editable leadership messages (Principal excerpt + full letter,
 * Chairman name/title/message) onto the single Settings row. The public site
 * reads these via getSiteSettings(), falling back to PRINCIPAL/CHAIRMAN in
 * school.ts when a field is blank — so clearing a field reverts to the default.
 * Message HTML is run through the same sanitizer as notices before storing.
 */
export async function saveMessages(formData: FormData): Promise<SaveMessagesResult> {
  await requireAdmin();

  const principalExcerpt = String(formData.get("principalExcerpt") ?? "").trim().slice(0, 600);
  const principalMessageHtml = sanitizeNoticeHtml(
    String(formData.get("principalMessageHtml") ?? "").trim()
  );
  const chairmanName = String(formData.get("chairmanName") ?? "").trim().slice(0, 120);
  const chairmanTitle = String(formData.get("chairmanTitle") ?? "").trim().slice(0, 120);
  const chairmanMessageHtml = sanitizeNoticeHtml(
    String(formData.get("chairmanMessageHtml") ?? "").trim()
  );

  const principal = { excerpt: principalExcerpt, messageHtml: principalMessageHtml };
  const chairman = { name: chairmanName, title: chairmanTitle, messageHtml: chairmanMessageHtml };

  await prisma.settings.upsert({
    where: { id: "main" },
    // If no settings row exists yet, seed the required contact fields from
    // school.ts so the row is valid; getSiteSettings() still falls back to
    // those same defaults, so nothing visibly changes.
    create: {
      id: "main",
      schoolName: SCHOOL.name,
      address: SCHOOL.address,
      phone: SCHOOL.phone,
      email: SCHOOL.email,
      principal,
      chairman,
    },
    update: { principal, chairman },
  });

  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/admin/settings");

  return { ok: true };
}

export type HeroSlideInput = {
  url: string;
  alt: string;
  publicId?: string;
  objectPosition?: string;
};

const MAX_HERO_SLIDES = 8;

/**
 * Persist the ordered homepage hero slides onto the Settings row. Accepts the
 * full list (already reordered/edited client-side); an empty or all-invalid
 * list stores [] and getSiteSettings falls back to HERO_SLIDES in school.ts, so
 * the hero never goes blank.
 *
 * Any Cloudinary image whose publicId was in the previously-stored list but is
 * absent from the new one is destroyed, so removing a slide also frees the CDN
 * asset. Local /public fallback slides have no publicId and are left untouched.
 */
export async function saveHeroSlides(slides: HeroSlideInput[]): Promise<SaveMessagesResult> {
  await requireAdmin();

  const clean = (Array.isArray(slides) ? slides : [])
    .map((s) => ({
      url: String(s?.url ?? "").trim(),
      alt: String(s?.alt ?? "").trim().slice(0, 200),
      publicId: s?.publicId ? String(s.publicId).trim() : undefined,
      objectPosition: s?.objectPosition ? String(s.objectPosition).trim().slice(0, 40) : undefined,
    }))
    // Accept hosted https images (uploads) and local /public paths (fallbacks).
    .filter((s) => /^https:\/\//i.test(s.url) || s.url.startsWith("/"))
    .slice(0, MAX_HERO_SLIDES);

  // Delete Cloudinary assets for slides that were removed from the list.
  const existing = await prisma.settings
    .findUnique({ where: { id: "main" } })
    .catch(() => null);
  const prevSlides = Array.isArray(existing?.heroSlides) ? existing.heroSlides : [];
  const keptIds = new Set(
    clean.map((s) => s.publicId).filter((id): id is string => !!id)
  );
  const removedIds = prevSlides
    .map((s) =>
      s && typeof s === "object" && !Array.isArray(s)
        ? (s as Record<string, unknown>).publicId
        : undefined
    )
    .filter((id): id is string => typeof id === "string" && !keptIds.has(id));
  for (const id of removedIds) {
    try {
      await cloudinary.uploader.destroy(id);
    } catch {
      // ignore CDN deletion failure — the DB list is the source of truth
    }
  }

  await prisma.settings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      schoolName: SCHOOL.name,
      address: SCHOOL.address,
      phone: SCHOOL.phone,
      email: SCHOOL.email,
      heroSlides: clean,
    },
    update: { heroSlides: clean },
  });

  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/admin/settings");

  return { ok: true };
}

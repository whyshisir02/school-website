"use server";
import { auditTransaction } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { cleanUnusedMedia } from "@/lib/media-cleanup";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { sanitizeNoticeHtml } from "@/lib/sanitize";

export type SaveMessagesResult = { ok: boolean; error?: string };

/**
 * Persist the editable leadership messages (Principal excerpt + full letter,
 * Chairman name/title/message) onto the single Settings row. The public site
 * reads these via getSiteSettings(), falling back to PRINCIPAL/CHAIRMAN in
 * school.ts when a field is blank — so clearing a field reverts to the default.
 * Message HTML is run through the same sanitizer as notices before storing.
 */
export async function saveMessages(formData: FormData): Promise<SaveMessagesResult> {
  const session = await requireAdmin("MESSAGES");

  if (!formData.has("principalMessageHtml") || !formData.has("chairmanMessageHtml")) return { ok: false, error: "The editors are still loading. Please wait a moment and save again." };
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

  await auditTransaction(session, { action: "MESSAGES_SAVED", targetId: "main" }, (tx) => tx.settings.upsert({
    where: { id: "main" },
    // If no settings row exists yet, seed the required contact fields from
    // school.ts so the row is valid; getSiteSettings() still falls back to
    // those same defaults, so nothing visibly changes.
    create: {
      id: "main",
      schoolName: "School",
      address: "",
      phone: "",
      email: "",
      principal,
      chairman,
    },
    update: { principal, chairman },
  }));

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
  const session = await requireAdmin("HERO");

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

  if (slides.length > MAX_HERO_SLIDES) return { ok: false, error: "Choose up to eight homepage photos." };
  await auditTransaction(session, { action: "HERO_SAVED", targetId: "main", details: { count: clean.length } }, async (tx) => {
    const existing = await tx.settings.findUnique({ where: { id: "main" } });
    const prev = Array.isArray(existing?.heroSlides) ? existing.heroSlides : [];
    const previousIds = new Set(prev.flatMap((slide) => slide && typeof slide === "object" && !Array.isArray(slide) && typeof slide.publicId === "string" ? [slide.publicId] : []));
    const newIds = clean.flatMap((slide) => slide.publicId && !previousIds.has(slide.publicId) ? [slide.publicId] : []);
    if (newIds.length) {
      const pending = await tx.mediaCleanup.findMany({ where: { publicId: { in: newIds }, notBefore: { gt: new Date() } } });
      if (pending.length !== newIds.length) throw new Error("A photo has expired. Remove it and upload it again before saving.");
    }
    const kept = clean.flatMap((slide) => slide.publicId ? [slide.publicId] : []);
    await tx.settings.upsert({
      where: { id: "main" },
      create: { id: "main", schoolName: "School", address: "", phone: "", email: "", heroSlides: clean },
      update: { heroSlides: clean },
    });
    await tx.mediaCleanup.deleteMany({ where: { publicId: { in: kept } } });
    for (const slide of prev) {
      if (slide && typeof slide === "object" && !Array.isArray(slide) && typeof slide.publicId === "string" && !kept.includes(slide.publicId)) {
        await tx.mediaCleanup.upsert({ where: { publicId: slide.publicId }, create: { publicId: slide.publicId }, update: { notBefore: new Date() } });
      }
    }
  });
  // Commit the published list first; failed deletions stay queued for retry.
  await cleanUnusedMedia().catch(() => null);

  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/admin/settings");

  return { ok: true };
}

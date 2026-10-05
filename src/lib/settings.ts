import { cache } from "react";
import { prisma } from "@/lib/db";
import { normalizeBranding, type SchoolBranding } from "@/lib/school-branding";

/** Database-owned school content. Missing settings never borrow another school's identity. */

export type StatItem = { value: string; label: string; show: boolean; verified: boolean };

/**
 * A hero slide as consumed by the slideshow. `src` may be a Cloudinary URL
 * (admin-uploaded, carries a `publicId` for deletion) or a local /public path
 * (migrated local slides have no publicId).
 */
export type HeroSlideItem = {
  src: string;
  alt: string;
  objectPosition?: string;
  publicId?: string;
};

export type SiteSettings = {
  branding: SchoolBranding;
  name: string;
  address: string;
  phone: string;
  email: string;
  mapLink: string;
  mapEmbed: string;
  stats: StatItem[];
  heroSlides: HeroSlideItem[];
  // Optional leadership content.
  principalExcerpt: string;
  principalMessageHtml: string;
  chairmanName: string;
  chairmanTitle: string;
  chairmanMessageHtml: string;
};

/** Empty editable stat slots for a new school. */
const FALLBACK_STATS: StatItem[] = Array.from({ length: 4 }, () => ({ value: "", label: "", show: false, verified: false }));

/** New schools start without another school's photos. */
const FALLBACK_HERO: HeroSlideItem[] = [];

/** Defensively coerce a stored JSON value into a clean StatItem[]. */
function normalizeStats(raw: unknown): StatItem[] {
  if (!Array.isArray(raw)) return FALLBACK_STATS;
  const items = raw
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => ({
      value: typeof r.value === "string" ? r.value : "",
      label: typeof r.label === "string" ? r.label : "",
      show: r.show !== false, // Publication also requires explicit verification.
      verified: r.verified === true,
    }))
    .filter((s) => s.value.trim() !== "" || s.label.trim() !== "");
  return items.length > 0 ? items : FALLBACK_STATS;
}

/** Defensively coerce a stored JSON value into a clean HeroSlideItem[]. */
function normalizeHeroSlides(raw: unknown): HeroSlideItem[] {
  if (!Array.isArray(raw)) return FALLBACK_HERO;
  const items = raw
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => ({
      // stored shape uses `url` (like gallery); tolerate `src` too.
      src: typeof r.url === "string" ? r.url : typeof r.src === "string" ? r.src : "",
      alt: typeof r.alt === "string" ? r.alt : "",
      objectPosition: typeof r.objectPosition === "string" ? r.objectPosition : undefined,
      publicId: typeof r.publicId === "string" ? r.publicId : undefined,
    }))
    .filter((s) => s.src.trim() !== "");
  return items;
}

/** Narrow an unknown JSON value to a plain object (never an array/null). */
function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
const str = (v: unknown) => (typeof v === "string" ? v : "");

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.settings
    .findUnique({ where: { id: "main" } })
    .catch(() => null);

  const principal = asObject(row?.principal);
  const chairman = asObject(row?.chairman);

  return {
    branding: normalizeBranding(row?.branding),
    name: row?.schoolName?.trim() || "School",
    address: row?.address?.trim() || "",
    phone: row?.phone?.trim() || "",
    email: row?.email?.trim() || "",
    mapLink: row?.mapLink?.trim() || "",
    mapEmbed: row?.mapEmbed?.trim() || "",
    stats: normalizeStats(row?.stats),
    heroSlides: normalizeHeroSlides(row?.heroSlides),
    principalExcerpt: str(principal.excerpt).trim() || "",
    principalMessageHtml: str(principal.messageHtml).trim() || "",
    chairmanName: str(chairman.name).trim() || "",
    chairmanTitle: str(chairman.title).trim() || "",
    chairmanMessageHtml: str(chairman.messageHtml).trim() || "",
  };
});

/** Convenience: only the stat tiles the admin has marked visible. */
export async function getVisibleStats(): Promise<StatItem[]> {
  const { stats } = await getSiteSettings();
  return stats.filter((s) => s.show && s.verified);
}

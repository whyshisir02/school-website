import { cache } from "react";
import { prisma } from "@/lib/db";
import { SCHOOL, STATS, PRINCIPAL, CHAIRMAN, HERO_SLIDES } from "@/lib/school";

/**
 * DB-first site settings, with src/lib/school.ts as the fallback.
 *
 * The `Settings` table (single row, id="main") holds the handful of fields the
 * school actually edits from /admin/settings — contact info, map, and the
 * homepage stat tiles. Everything not stored there (registered name history,
 * regd. no., principal/chairman, motto, tagline, Facebook, letterhead identity)
 * stays static in school.ts because it rarely changes and/or is used by client
 * components and build-time metadata.
 *
 * `cache()` dedupes the query within a single render pass, so any number of
 * server components can call getSiteSettings()/getStats() freely and hit the DB
 * once. The `.catch(() => null)` keeps the site rendering (on school.ts values)
 * if the DB is unreachable or the row doesn't exist yet — including at build
 * time before anyone has saved settings.
 */

export type StatItem = { value: string; label: string; show: boolean };

/**
 * A hero slide as consumed by the slideshow. `src` may be a Cloudinary URL
 * (admin-uploaded, carries a `publicId` for deletion) or a local /public path
 * (the school.ts fallback slides, no publicId).
 */
export type HeroSlideItem = {
  src: string;
  alt: string;
  objectPosition?: string;
  publicId?: string;
};

export type SiteSettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  mapLink: string;
  mapEmbed: string;
  stats: StatItem[];
  heroSlides: HeroSlideItem[];
  // Leadership messages (see PRINCIPAL/CHAIRMAN in school.ts for the defaults).
  principalExcerpt: string;
  principalMessageHtml: string;
  chairmanName: string;
  chairmanTitle: string;
  chairmanMessageHtml: string;
};

/** school.ts STATS → the editable shape (all shown by default). */
const FALLBACK_STATS: StatItem[] = STATS.map((s) => ({
  value: s.value,
  label: s.label,
  show: true,
}));

/** school.ts HERO_SLIDES → the editable shape (local /public paths, no publicId). */
const FALLBACK_HERO: HeroSlideItem[] = HERO_SLIDES.map((s) => ({
  src: s.src,
  alt: s.alt,
  objectPosition: s.objectPosition,
}));

/** Defensively coerce a stored JSON value into a clean StatItem[]. */
function normalizeStats(raw: unknown): StatItem[] {
  if (!Array.isArray(raw)) return FALLBACK_STATS;
  const items = raw
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => ({
      value: typeof r.value === "string" ? r.value : "",
      label: typeof r.label === "string" ? r.label : "",
      show: r.show !== false, // default visible
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
  return items.length > 0 ? items : FALLBACK_HERO;
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
    name: row?.schoolName?.trim() || SCHOOL.name,
    address: row?.address?.trim() || SCHOOL.address,
    phone: row?.phone?.trim() || SCHOOL.phone,
    email: row?.email?.trim() || SCHOOL.email,
    mapLink: row?.mapLink?.trim() || SCHOOL.mapLink,
    mapEmbed: row?.mapEmbed?.trim() || SCHOOL.mapEmbed,
    stats: normalizeStats(row?.stats),
    heroSlides: normalizeHeroSlides(row?.heroSlides),
    principalExcerpt: str(principal.excerpt).trim() || PRINCIPAL.excerpt,
    principalMessageHtml: str(principal.messageHtml).trim() || PRINCIPAL.messageHtml,
    chairmanName: str(chairman.name).trim() || CHAIRMAN.name,
    chairmanTitle: str(chairman.title).trim() || CHAIRMAN.title,
    chairmanMessageHtml: str(chairman.messageHtml).trim() || CHAIRMAN.messageHtml,
  };
});

/** Convenience: only the stat tiles the admin has marked visible. */
export async function getVisibleStats(): Promise<StatItem[]> {
  const { stats } = await getSiteSettings();
  return stats.filter((s) => s.show);
}

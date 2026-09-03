import fs from "fs";
import path from "path";

/**
 * ─── Staff & Faculty ────────────────────────────────────────────────────────
 * ADD / REMOVE / EDIT members here — every page (About, Home) updates
 * automatically. No other code changes needed.
 *
 * PHOTOS (no code changes needed either):
 *   Drop a square photo (≥400×400, jpg/png/webp) named exactly `<slug>.jpg`
 *   into  public/images/staff/   e.g.  public/images/staff/jb-magar.jpg
 *   The site picks it up automatically.
 *   No photo yet? A clean initials avatar is generated for you.
 *
 * ⚠️ NAMES BELOW ARE TEMPORARY PLACEHOLDERS so the layout can be reviewed.
 *    Replace each one with the real person's name + role before launch,
 *    or delete the line. Real photos go in public/images/staff/.
 */
export type StaffMember = {
  slug: string; // filename for their photo, e.g. "jb-magar" → /images/staff/jb-magar.jpg
  name: string;
  role: string;
  subject?: string; // optional — shown after role
};

export const STAFF: StaffMember[] = [
  { slug: "jb-magar", name: "J.B. Magar", role: "Principal" },
  // ── ⚠️ PLACEHOLDER STAFF — replace with real names/photos ──
  { slug: "staff-02", name: "Staff Name 02", role: "Vice Principal" },
  { slug: "staff-03", name: "Staff Name 03", role: "Academic Coordinator" },
  { slug: "staff-04", name: "Staff Name 04", role: "Early Childhood Development", subject: "Nursery – KG" },
  { slug: "staff-05", name: "Staff Name 05", role: "Teacher", subject: "English" },
  { slug: "staff-06", name: "Staff Name 06", role: "Teacher", subject: "Mathematics" },
  { slug: "staff-07", name: "Staff Name 07", role: "Teacher", subject: "Science" },
  { slug: "staff-08", name: "Staff Name 08", role: "Teacher", subject: "Social Studies" },
  { slug: "staff-09", name: "Staff Name 09", role: "Teacher", subject: "Nepali" },
  { slug: "staff-10", name: "Staff Name 10", role: "Teacher", subject: "Computer Science" },
  { slug: "staff-11", name: "Staff Name 11", role: "Teacher", subject: "Health & P.E." },
  { slug: "staff-12", name: "Staff Name 12", role: "Sports Instructor" },
  { slug: "staff-13", name: "Staff Name 13", role: "Librarian" },
  { slug: "staff-14", name: "Staff Name 14", role: "Accounts & Administration" },
  { slug: "staff-15", name: "Staff Name 15", role: "Front Office" },
  { slug: "staff-16", name: "Staff Name 16", role: "Transport In-charge" },
];

export function getStaffMember(slug: string): StaffMember | undefined {
  return STAFF.find((s) => s.slug === slug);
}

export function staffInitials(name: string, slug?: string): string {
  // Placeholder roster entries ("Staff Name 02") show their number on the avatar
  const num = slug?.match(/(\d+)$/)?.[1];
  if (name.startsWith("Staff Name") && num) return num.slice(-2);
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Resolve a staff photo to a real file if one exists.
 * Checks /public/images/staff/<slug>.(webp|jpg|jpeg|png) — drop a file in with
 * the member's slug name and it's picked up automatically (rebuild for prod).
 * Returns null when no photo exists → callers render the initials avatar.
 * Server-side only (reads the filesystem).
 */
export function staffPhoto(slug: string): string | null {
  if (typeof window === "undefined") {
    for (const ext of [".webp", ".jpg", ".jpeg", ".png"]) {
      const p = path.join(process.cwd(), "public", "images", "staff", slug + ext);
      if (fs.existsSync(p)) return `/images/staff/${slug}${ext}`;
    }
  }
  return null;
}

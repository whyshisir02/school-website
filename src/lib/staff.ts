import fs from "fs";
import path from "path";

/**
 * Legacy roster and local-photo lookup for scripts/import-staff.ts.
 * Current public staff profiles come from the database and are managed through
 * Admin > Faculty & staff. Editing this roster does not update live profiles.
 * Keep these records and local assets for existing installation migrations.
 */
export type StaffMember = {
  slug: string; // filename for their photo, e.g. "jb-magar" → /images/staff/jb-magar.jpg
  name: string;
  role: string;
  subject?: string; // optional — shown after role
};

export const STAFF: StaffMember[] = [
  { slug: "rajeen-magar", name: "Rajeen Magar", role: "Principal" },
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

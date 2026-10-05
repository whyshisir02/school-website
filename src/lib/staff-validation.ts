import { isSchoolUpload } from "./media-folder";
import { STAFF_GROUPS, STAFF_STATUSES, type StaffInput } from "./staff-types";
export function validateStaff(raw: unknown): { ok: true; data: StaffInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid profile." };
  const r = raw as Record<string, unknown>;
  const fields = { name: 120, position: 100, subject: 120, qualifications: 200, bio: 1200 } as const;
  const text = {} as Record<keyof typeof fields, string>;
  for (const [key, max] of Object.entries(fields)) {
    if (typeof r[key] !== "string") return { ok: false, error: "Please check the profile fields." };
    const value = (r[key] as string).trim();
    if (value.length > max) return { ok: false, error: `${key} must be ${max} characters or less.` };
    text[key as keyof typeof fields] = value;
  }
  if (!text.name || !text.position) return { ok: false, error: "Name and position are required." };
  if (typeof r.group !== "string" || !Object.hasOwn(STAFF_GROUPS, r.group) || typeof r.status !== "string" || !Object.hasOwn(STAFF_STATUSES, r.status)) return { ok: false, error: "Choose a valid group and status." };
  if (typeof r.isPrincipal !== "boolean" || typeof r.id !== "string" || typeof r.updatedAt !== "string") return { ok: false, error: "Invalid profile details." };
  if (r.id && !Number.isFinite(Date.parse(r.updatedAt))) return { ok: false, error: "Reload this profile before saving." };
  if (r.isPrincipal && (r.group !== "LEADERSHIP" || r.status !== "PUBLISHED")) return { ok: false, error: "The principal must be a published leadership profile." };
  const photoUrl = r.photoUrl === null || r.photoUrl === "" ? null : r.photoUrl;
  const publicId = r.publicId === null || r.publicId === "" ? null : r.publicId;
  if (photoUrl !== null && (typeof photoUrl !== "string" || photoUrl.length > 1000)) return { ok: false, error: "Invalid photo." };
  if (publicId !== null && (typeof publicId !== "string" || publicId.length > 200)) return { ok: false, error: "Invalid photo reference." };
  if (!photoUrl && publicId) return { ok: false, error: "Choose a photo or remove its reference." };
  return { ok: true, data: { ...text, id: r.id, updatedAt: r.updatedAt, group: r.group as StaffInput["group"], status: r.status as StaffInput["status"], isPrincipal: r.isPrincipal, photoUrl: photoUrl as string | null, publicId: publicId as string | null } };
}

/** New uploads must belong to the configured school Cloudinary account and staff folder. */
export function isStaffUpload(url: string, publicId: string, cloudName: string): boolean {
  return isSchoolUpload(url, publicId, "staff", cloudName);
}

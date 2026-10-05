export const STAFF_GROUPS = { LEADERSHIP: "Leadership", TEACHING: "Teaching Faculty", SUPPORT: "Administration & Support" } as const;
export const STAFF_STATUSES = { DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" } as const;
export type StaffGroup = keyof typeof STAFF_GROUPS;
export type StaffStatus = keyof typeof STAFF_STATUSES;
export type StaffProfile = {
  id: string; name: string; position: string; group: StaffGroup; status: StaffStatus;
  subject: string; qualifications: string; bio: string; photoUrl: string | null;
  publicId: string | null; order: number; updatedAt: string; isPrincipal: boolean;
};
export type StaffInput = Omit<StaffProfile, "order">;
export function staffInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0] ?? "").join("").toUpperCase();
}

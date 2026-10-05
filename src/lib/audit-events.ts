export const AUDIT_EVENTS = {
  ANNOUNCEMENT_SAVED: ["Announcements", "Saved announcement draft"], ANNOUNCEMENT_PUBLISHED: ["Announcements", "Published announcement"], ANNOUNCEMENT_HIDDEN: ["Announcements", "Hid announcement"], ANNOUNCEMENT_REMOVED: ["Announcements", "Removed announcement"],
  NOTICE_SAVED: ["Notices", "Saved notice"], NOTICE_PUBLISHED: ["Notices", "Published notice"], NOTICE_UNPUBLISHED: ["Notices", "Unpublished notice"], NOTICE_DELETED: ["Notices", "Deleted notice"],
  ALBUM_CREATED: ["Gallery", "Created album"], ALBUM_RENAMED: ["Gallery", "Renamed album"], ALBUM_DELETED: ["Gallery", "Deleted empty album"], PHOTOS_MOVED: ["Gallery", "Moved photos"], PHOTO_DELETED: ["Gallery", "Deleted photo"], PHOTO_UPLOADED: ["Gallery", "Uploaded gallery photo"], PHOTO_YEAR_CHANGED: ["Gallery", "Changed photo years"],
  STAFF_SAVED: ["Faculty", "Saved staff profile"], STAFF_ARCHIVED: ["Faculty", "Archived staff profile"], STAFF_DELETED: ["Faculty", "Deleted staff profile"], STAFF_REORDERED: ["Faculty", "Reordered staff profiles"],
  INQUIRY_READ: ["Inquiries", "Marked inquiry read"], INQUIRY_UNREAD: ["Inquiries", "Marked inquiry unread"], INQUIRY_DELETED: ["Inquiries", "Deleted inquiry"],
  SETTINGS_SAVED: ["Settings", "Changed school settings"], HERO_SAVED: ["Settings", "Changed homepage slideshow"], MESSAGES_SAVED: ["Settings", "Changed leadership messages"],
  USER_CREATED: ["Accounts", "Created school admin and setup link"], USER_UPDATED: ["Accounts", "Changed account permissions or name"], USER_ENABLED: ["Accounts", "Enabled account"], USER_DISABLED: ["Accounts", "Disabled account"], SETUP_LINK_CREATED: ["Accounts", "Generated password setup link"], PASSWORD_SET: ["Security", "Set password using setup link"], PASSWORD_CHANGED: ["Security", "Changed own password"], SESSIONS_REVOKED: ["Security", "Signed out all devices"], OWNER_RECOVERED: ["Security", "Recovered Super Admin through maintainer command"],
} as const;
export type AuditAction = keyof typeof AUDIT_EVENTS;
export const AUDIT_AREAS = [...new Set(Object.values(AUDIT_EVENTS).map(([area]) => area))];
export type AuditDetails = { count?: number; year?: number | null; published?: boolean; permissions?: string[]; sourceId?: string; destinationId?: string };
export function safeAuditDetails(input: AuditDetails = {}) {
  const data: Record<string, string | number | boolean | null | string[]> = {};
  if (typeof input.count === "number" && Number.isFinite(input.count)) data.count = input.count;
  if (input.year === null || typeof input.year === "number" && Number.isFinite(input.year)) data.year = input.year;
  if (typeof input.published === "boolean") data.published = input.published;
  if (Array.isArray(input.permissions)) data.permissions = input.permissions.filter((p) => ["GALLERY", "NOTICES", "FACULTY", "INQUIRIES", "HERO", "MESSAGES"].includes(p));
  for (const key of ["sourceId", "destinationId"] as const) if (typeof input[key] === "string") data[key] = input[key].slice(0, 120);
  return data;
}

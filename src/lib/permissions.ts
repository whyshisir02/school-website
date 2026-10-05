export const PERMISSIONS = ["GALLERY", "NOTICES", "FACULTY", "INQUIRIES", "HERO", "MESSAGES", "SCHOOL_SETTINGS", "USERS", "AUDIT"] as const;
export type Permission = typeof PERMISSIONS[number];
export type Access = { role: string; permissions: readonly string[] };
export const DEFAULT_ADMIN_PERMISSIONS = ["GALLERY", "NOTICES", "FACULTY"];
export function isAdminRole(role: unknown) { return role === "ADMIN" || role === "SUPER_ADMIN"; }
export function canAccess(access: Access, permission: Permission) {
  if (!isAdminRole(access.role)) return false;
  if (access.role === "SUPER_ADMIN") return true;
  return permission !== "SCHOOL_SETTINGS" && permission !== "USERS" && permission !== "AUDIT" && access.permissions.includes(permission);
}
export function routePermission(path: string): Permission | null {
  if (path === "/admin/announcements" || path.startsWith("/admin/announcements/")) return "NOTICES";
  if (path === "/admin/activity" || path.startsWith("/admin/activity/")) return "AUDIT";
  if (path === "/admin/users" || path.startsWith("/admin/users/")) return "USERS";
  const routes: [string, Permission][] = [["/admin/gallery", "GALLERY"], ["/admin/notices", "NOTICES"], ["/admin/staff", "FACULTY"], ["/admin/inquiries", "INQUIRIES"], ["/admin/settings/hero", "HERO"], ["/admin/settings/messages", "MESSAGES"]];
  for (const [prefix, permission] of routes) if (path === prefix || path.startsWith(prefix + "/")) return permission;
  if (path === "/admin/settings/security") return null;
  if (path === "/admin/settings" || path.startsWith("/admin/settings/")) return "SCHOOL_SETTINGS";
  return null;
}

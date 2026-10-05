import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { canAccess, isAdminRole, type Permission, type Access } from "./permissions";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/**
 * Require an authenticated ADMIN session.
 * Throws UnauthorizedError (401) if no session or the user is not an admin.
 */
export class ForbiddenError extends Error {
  constructor() { super("You do not have permission to perform this action."); this.name = "ForbiddenError"; }
}
export async function requireAdmin(permission?: Permission) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !isAdminRole(role)) {
    throw new UnauthorizedError();
  }
  if (permission && !canAccess(session.user as typeof session.user & Access, permission)) throw new ForbiddenError();
  return session;
}
export async function requirePageAccess(permission?: Permission) {
  try { return await requireAdmin(permission); }
  catch (error) {
    if (error instanceof ForbiddenError) redirect("/admin/access-denied");
    if (error instanceof UnauthorizedError) redirect("/admin/login");
    throw error;
  }
}
export function accessFromSession(session: Awaited<ReturnType<typeof requireAdmin>>): Access {
  const user = session.user as typeof session.user & Access;
  return { role: user.role, permissions: user.permissions };
}

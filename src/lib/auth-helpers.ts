import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

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
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") {
    throw new UnauthorizedError();
  }
  return session;
}

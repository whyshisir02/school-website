import { requirePageAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import UsersManager from "@/components/admin/UsersManager";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
  await requirePageAccess("USERS");
  const users = await prisma.user.findMany({ orderBy: [{ role: "desc" }, { createdAt: "asc" }], select: { id: true, name: true, email: true, role: true, permissions: true, isActive: true, passwordReady: true, tokenVersion: true, createdAt: true } });
  return <UsersManager users={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))} />;
}

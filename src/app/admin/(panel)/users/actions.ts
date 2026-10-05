"use server";
import { auditTransaction } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { saveManagedUser, issueSetupToken, setManagedUserActive, UserManagementError } from "@/lib/user-management";
import type { UserInput } from "@/lib/user-management-types";
function failure(error: unknown) {
  return { ok: false as const, error: error instanceof UserManagementError ? error.message : error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "An account with this login email already exists." : "Could not update the account. Reload and try again." };
}
export async function saveUser(input: UserInput) {
  const session = await requireAdmin("USERS");
  try { const result = await auditTransaction<Awaited<ReturnType<typeof saveManagedUser>>>(session, (result) => ({ action: input.id ? "USER_UPDATED" : "USER_CREATED", targetId: result.id, details: { permissions: input.permissions } }), (tx) => saveManagedUser(tx, input)); revalidatePath("/admin/users"); return { ok: true as const, ...result }; }
  catch (error) { return failure(error); }
}
export async function changeUserStatus(id: string, version: number, active: boolean) {
  const session = await requireAdmin("USERS");
  try { await auditTransaction(session, { action: active ? "USER_ENABLED" : "USER_DISABLED", targetId: id }, (tx) => setManagedUserActive(tx, id, version, active)); revalidatePath("/admin/users"); return { ok: true as const }; }
  catch (error) { return failure(error); }
}
export async function generateSetupLink(id: string, version: number) {
  const session = await requireAdmin("USERS");
  try { const setup = await auditTransaction(session, { action: "SETUP_LINK_CREATED", targetId: id }, (tx) => issueSetupToken(tx, id, version)); return { ok: true as const, setup }; }
  catch (error) { return failure(error); }
}

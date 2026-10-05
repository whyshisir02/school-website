import { Prisma } from "@prisma/client";
import { writeAudit } from "./audit";
export async function recoverOwner(tx: Prisma.TransactionClient, email: string, passwordHash: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE email = ${email} FOR UPDATE`;
  const owner = await tx.user.findUnique({ where: { email } });
  if (!owner || owner.role !== "SUPER_ADMIN") throw new Error("Recovery requires an existing Super Admin account. No account was changed.");
  await tx.user.update({ where: { id: owner.id }, data: { passwordHash, passwordReady: true, isActive: true, failedAttempts: 0, lockedUntil: null, tokenVersion: { increment: 1 } } });
  await tx.accountSetupToken.deleteMany({ where: { userId: owner.id } });
  await writeAudit(tx, { id: null, email: "Local maintainer", role: "MAINTAINER" }, { action: "OWNER_RECOVERED", targetId: owner.id });
}

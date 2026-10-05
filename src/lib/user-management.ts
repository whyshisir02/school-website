import { writeAudit } from "./audit";
import { Prisma } from "@prisma/client";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { ASSIGNABLE_PERMISSIONS, type UserInput } from "./user-management-types";
export class UserManagementError extends Error {}
const invalidLink = "This setup link is invalid or expired. Ask the website owner for a new link.";
export function validateUserInput(input: UserInput) {
  if (!input || typeof input.id !== "string" || typeof input.email !== "string" || typeof input.name !== "string" || !Array.isArray(input.permissions) || input.permissions.some((p) => !Object.hasOwn(ASSIGNABLE_PERMISSIONS, p)) || !Number.isInteger(input.tokenVersion)) throw new UserManagementError("Check the account details and permissions.");
  const email = input.email.trim().toLowerCase(), name = input.name.trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length > 120) throw new UserManagementError("Enter a valid login email and a name up to 120 characters.");
  return { ...input, email, name, permissions: [...new Set(input.permissions)] };
}
async function lockUser(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`;
  const user = await tx.user.findUnique({ where: { id } });
  if (!user) throw new UserManagementError("This account no longer exists.");
  return user;
}
async function managedAdmin(tx: Prisma.TransactionClient, id: string, version: number) {
  const user = await lockUser(tx, id);
  if (user.role !== "ADMIN") throw new UserManagementError("The owner account cannot be changed through user management.");
  if (user.tokenVersion !== version) throw new UserManagementError("This account changed in another session. Reload before saving.");
  return user;
}
export async function issueSetupToken(tx: Prisma.TransactionClient, id: string, version: number) {
  const user = await managedAdmin(tx, id, version);
  if (!user.isActive) throw new UserManagementError("Enable the account before creating a setup link.");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 3600_000);
  await tx.accountSetupToken.upsert({ where: { userId: id }, create: { userId: id, tokenVersion: user.tokenVersion, tokenHash: hashToken(token), expiresAt }, update: { tokenVersion: user.tokenVersion, tokenHash: hashToken(token), expiresAt } });
  return { token, expiresAt: expiresAt.toISOString() };
}
export async function saveManagedUser(tx: Prisma.TransactionClient, input: UserInput) {
  const checked = validateUserInput(input);
  if (!checked.id) {
    const user = await tx.user.create({ data: { email: checked.email, name: checked.name, permissions: checked.permissions, role: "ADMIN", passwordReady: false, passwordHash: await bcrypt.hash(randomBytes(32).toString("base64url"), 12) } });
    return { id: user.id, setup: await issueSetupToken(tx, user.id, user.tokenVersion) };
  }
  const existing = await managedAdmin(tx, checked.id, checked.tokenVersion);
  if (existing.email !== checked.email) throw new UserManagementError("The login email cannot be changed here. Create a separate account if needed.");
  await tx.user.update({ where: { id: checked.id }, data: { name: checked.name, permissions: checked.permissions, tokenVersion: { increment: 1 } } });
  await tx.accountSetupToken.deleteMany({ where: { userId: checked.id } });
  return { id: checked.id, setup: null };
}
export async function setManagedUserActive(tx: Prisma.TransactionClient, id: string, version: number, active: boolean) {
  if (typeof active !== "boolean") throw new UserManagementError("Invalid account status.");
  await managedAdmin(tx, id, version);
  await tx.user.update({ where: { id }, data: { isActive: active, tokenVersion: { increment: 1 } } });
  await tx.accountSetupToken.deleteMany({ where: { userId: id } });
}
export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function validateSetupPassword(token: unknown, password: unknown, confirmation: unknown) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new UserManagementError(invalidLink);
  if (typeof password !== "string" || password.length < 10 || Buffer.byteLength(password, "utf8") > 72) throw new UserManagementError("Use at least 10 characters and no more than 72 UTF-8 bytes for your password.");
  if (password !== confirmation) throw new UserManagementError("The passwords do not match.");
  return { token, password };
}
export async function redeemSetupToken(tx: Prisma.TransactionClient, token: string, passwordHash: string) {
  const pending = await tx.accountSetupToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!pending) throw new UserManagementError(invalidLink);
  const user = await lockUser(tx, pending.userId);
  if (!user.isActive || user.role !== "ADMIN" || user.tokenVersion !== pending.tokenVersion) throw new UserManagementError(invalidLink);
  const consumed = await tx.accountSetupToken.deleteMany({ where: { id: pending.id, tokenHash: hashToken(token), expiresAt: { gt: new Date() }, tokenVersion: user.tokenVersion } });
  if (consumed.count !== 1) throw new UserManagementError(invalidLink);
  await tx.user.update({ where: { id: user.id }, data: { passwordHash, passwordReady: true, tokenVersion: { increment: 1 }, failedAttempts: 0, lockedUntil: null } });
  await writeAudit(tx, { id: user.id, email: user.email, role: user.role }, { action: "PASSWORD_SET", targetId: user.id });
}

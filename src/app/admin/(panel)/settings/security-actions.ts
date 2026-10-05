"use server";
import { auditTransaction } from "@/lib/audit";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export type ChangePasswordResult = { ok: boolean; error?: string };

const MIN_PASSWORD_LENGTH = 10;

/**
 * Let the signed-in admin change their own password from /admin/settings.
 * Verifies the current password first (so a hijacked open session can't
 * silently reset it) and rehashes the new one. Bumping `tokenVersion` in the
 * same update signs out *every* device — including this one — so a leaked
 * session can't outlive a password change; the UI then sends the current
 * device to the login screen to re-authenticate with the new password.
 */
export async function changePassword(formData: FormData): Promise<ChangePasswordResult> {
  const session = await requireAdmin();
  const userId = (session.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return { ok: false, error: "Could not identify your account. Please sign in again." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: "All fields are required." };
  }
  if (Buffer.byteLength(newPassword, "utf8") > 72) return { ok: false, error: "Password must not exceed 72 UTF-8 bytes." };
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "New password and confirmation do not match." };
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: "New password must be different from the current one." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await auditTransaction(session, { action: "PASSWORD_CHANGED", targetId: userId }, async (tx) => {
    const changed = await tx.user.updateMany({ where: { id: userId, passwordHash: user.passwordHash, tokenVersion: user.tokenVersion }, data: { passwordHash, tokenVersion: { increment: 1 } } });
    if (changed.count !== 1) throw new Error("Account changed. Sign in again before changing your password.");
    await tx.accountSetupToken.deleteMany({ where: { userId } });
  });

  return { ok: true };
}

/**
 * "Log out of all devices." Bumps `tokenVersion`, which instantly invalidates
 * every JWT ever issued for this account — this browser included. The caller
 * then signs the current device out and returns it to the login screen. Use
 * this if a session may have been left open somewhere or a device was lost.
 */
export async function logOutAllDevices(): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  const userId = (session.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return { ok: false, error: "Could not identify your account. Please sign in again." };
  }
  await auditTransaction(session, { action: "SESSIONS_REVOKED", targetId: userId }, async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
    await tx.accountSetupToken.deleteMany({ where: { userId } });
  });
  return { ok: true };
}

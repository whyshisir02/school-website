"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export type ChangePasswordResult = { ok: boolean; error?: string };

const MIN_PASSWORD_LENGTH = 10;

/**
 * Let the signed-in admin change their own password from /admin/settings.
 * Verifies the current password first (so a hijacked open session can't
 * silently reset it) and rehashes the new one. Note: with JWT sessions we
 * can't force-invalidate other logged-in sessions here — existing tokens stay
 * valid until they expire.
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
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { ok: true };
}

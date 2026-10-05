"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { hashToken, redeemSetupToken, validateSetupPassword, UserManagementError } from "@/lib/user-management";
export async function setAccountPassword(formData: FormData) {
  try {
    const input = validateSetupPassword(formData.get("token"), formData.get("password"), formData.get("confirmation"));
    // Reject unknown/expired tokens before the expensive password hash.
    const pending = await prisma.accountSetupToken.findUnique({ where: { tokenHash: hashToken(input.token) }, select: { expiresAt: true } });
    if (!pending || pending.expiresAt <= new Date()) throw new UserManagementError("This setup link is invalid or expired. Ask the website owner for a new link.");
    const passwordHash = await bcrypt.hash(input.password, 12);
    await prisma.$transaction((tx) => redeemSetupToken(tx, input.token, passwordHash), { timeout: 15000 });
    return { ok: true as const };
  } catch (error) { return { ok: false as const, error: error instanceof UserManagementError ? error.message : "Could not set the password. Try again or ask for a new link." }; }
}

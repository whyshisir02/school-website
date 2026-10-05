import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isAdminRole } from "./permissions";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Current token version for a user. Each JWT is minted carrying the version it
 * was issued with (token.ver); when this value moves ahead of that, every older
 * token is stale — this is how "log out all devices" and password changes take
 * effect across sessions we don't otherwise track (stateless JWT strategy).
 * Returns null if the user no longer exists.
 */
export async function currentTokenVersion(userId: string): Promise<number | null> {
  const u = await currentAccess(userId);
  return u?.tokenVersion ?? null;
}
export async function currentAccess(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, permissions: true, tokenVersion: true, isActive: true, passwordReady: true } });
  return user?.isActive && user.passwordReady && isAdminRole(user.role) ? user : null;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });
        if (!user || !user.isActive || !user.passwordReady || !isAdminRole(user.role)) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("locked");
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!valid) {
          const attempts = user.failedAttempts + 1;
          const lock = attempts >= MAX_FAILED_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: lock ? 0 : attempts,
              lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : null,
            },
          });
          throw new Error(lock ? "locked" : "invalid");
        }

        if (user.failedAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }

        return { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.uid = (user as { id?: string }).id;
        // Stamp the token with the account's version at sign-in. Never updated
        // afterwards, so bumping the DB value invalidates this token.
        token.ver = (user as { tokenVersion?: number }).tokenVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      const uid = token.uid as string | undefined;
      const ver = typeof token.ver === "number" ? token.ver : null;
      if (session.user && uid && ver !== null) {
        const current = await currentAccess(uid);
        if (current !== null && current.tokenVersion === ver) {
          (session.user as { role?: string }).role = current.role;
          (session.user as { permissions?: string[] }).permissions = current.permissions;
          session.user.email = current.email;
          (session.user as { id?: string }).id = uid;
          return session;
        }
      }
      // Logged out everywhere / password changed elsewhere, or a legacy token
      // minted before versioning existed. Drop the identity so requireAdmin()
      // (and anything reading the session) treats the request as signed out.
      (session as { user?: unknown }).user = undefined;
      return session;
    },
  },
};

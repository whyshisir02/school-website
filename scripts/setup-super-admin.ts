import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const email = "shisir@super.admin";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "SUPER_ADMIN") throw new Error("This login already belongs to a different role. Review its ownership before promotion.");
    console.log("Super Admin already configured; password left unchanged."); return;
  }
  if (await db.user.count({ where: { role: "SUPER_ADMIN" } })) throw new Error("A Super Admin already exists. Review ownership before creating another.");
  const password = randomBytes(24).toString("base64url");
  // Write credentials before committing, so a filesystem failure cannot leave an inaccessible owner.
  mkdirSync(".local", { recursive: true });
  writeFileSync(".local/super-admin-credentials.txt", `Login: ${email}\nTemporary password: ${password}\n\nSign in at /admin/login and change this password in Account security. Delete this file after saving the password in your password manager.\n`, { flag: "wx", mode: 0o600 });
  await db.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 12), role: "SUPER_ADMIN", permissions: [] } });
  console.log("Super Admin created. Credentials are in .local/super-admin-credentials.txt (excluded from Git).");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());

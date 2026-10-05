import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
import { recoverOwner } from "../src/lib/owner-recovery";
loadEnvConfig(process.cwd());
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || !args.length) {
    console.log("Usage: node node_modules/tsx/dist/cli.mjs scripts/recover-super-admin.ts --email shisir@super.admin [--dry-run]\nUses this workspace's configured database. Prompts for the email again before recovery. Generates a new password in a Git-excluded .local file; never accepts or prints passwords in shell arguments."); return;
  }
  const email = args[args.indexOf("--email") + 1]?.trim().toLowerCase();
  if (!args.includes("--email") || !email || !email.includes("@")) throw new Error("Provide the exact Super Admin email with --email.");
  const db = new PrismaClient();
  try {
    const owner = await db.user.findUnique({ where: { email }, select: { role: true } });
    if (owner?.role !== "SUPER_ADMIN") throw new Error("No matching Super Admin. No changes made.");
    if (args.includes("--dry-run")) { console.log(`Super Admin found: ${email}. No changes made.`); return; }
    if (!process.stdin.isTTY) throw new Error("Run this command in an interactive terminal to confirm recovery.");
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    let answer: string;
    try { answer = await prompt.question(`Recover ${email} and revoke all its sessions? Type the exact email to confirm: `); } finally { prompt.close(); }
    if (answer.trim().toLowerCase() !== email) throw new Error("Confirmation did not match. No changes made.");
    const password = randomBytes(24).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 12);
    const directory = resolve(process.cwd(), ".local");
    mkdirSync(directory, { recursive: true });
    const file = resolve(directory, `super-admin-recovery-${randomUUID()}.txt`);
    writeFileSync(file, `Login: ${email}\nTemporary password: ${password}\n\nSign in at /admin/login, change the password in Account security, and delete this file after saving the password securely.\n`, { flag: "wx", mode: 0o600 });
    try { await db.$transaction((tx) => recoverOwner(tx, email, passwordHash), { timeout: 15000 }); }
    catch (error) { unlinkSync(file); throw error; }
    console.log(`Recovery complete. Existing sessions and setup links were revoked. Credentials: ${file}`);
  } finally { await db.$disconnect(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });

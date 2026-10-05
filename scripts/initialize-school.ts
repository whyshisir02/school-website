import { PrismaClient } from "@prisma/client";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { assertEmptySchool, initializeSchool, validateSchoolSetup } from "../src/lib/school-initialization";
import { mediaFolder } from "../src/lib/media-folder";

const db = new PrismaClient();
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || !args.length) {
    console.log('Usage: initialize-school.ts --config path/to/school.json --dry-run\n       initialize-school.ts --config path/to/school.json --confirm-school "Exact school name"\nOnly an EMPTY database is accepted. Creates school settings and shisir@super.admin; no demo content or school admins.'); return;
  }
  const option = (key: string) => { const index = args.indexOf(key); return index >= 0 ? args[index + 1] : undefined; };
  const configPath = option("--config");
  if (!configPath) throw new Error("Pass --config with a school JSON file.");
  const setup = validateSchoolSetup(JSON.parse(readFileSync(configPath, "utf8").replace(/^\uFEFF/, "")));
  await db.$transaction(assertEmptySchool, { isolationLevel: "Serializable" });
  for (const key of ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_SITE_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLOUDINARY_FOLDER"]) if (!process.env[key]?.trim()) throw new Error(`Configure ${key} for this separate deployment first.`);
  mediaFolder();
  const publicUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!);
  const authUrl = new URL(process.env.NEXTAUTH_URL!);
  if (publicUrl.origin !== authUrl.origin || !["https:", "http:"].includes(publicUrl.protocol) || publicUrl.username || publicUrl.password) throw new Error("Set matching, valid public and authentication origins.");
  if (args.includes("--dry-run")) { console.log("Configuration accepted; database is empty. No records or credentials created."); return; }
  if (option("--confirm-school") !== setup.schoolName) throw new Error("Pass --confirm-school with the exact school name from the setup file.");
  const password = randomBytes(24).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);
  const file = `.local/new-school-owner-${Date.now()}-${randomBytes(4).toString("hex")}.txt`;
  mkdirSync(".local", { recursive: true });
  writeFileSync(file, `School: ${setup.schoolName}\nLogin: shisir@super.admin\nTemporary password: ${password}\nChange the password after signing in. Store it safely, then delete this file.\n`, { flag: "wx", mode: 0o600 });
  await db.$transaction((tx) => initializeSchool(tx, setup, passwordHash), { isolationLevel: "Serializable", timeout: 15000 });
  console.log(`School initialized. Owner credentials saved to ${file} (Git-excluded). Open /admin/login. No school content was copied.`);
}
main().catch((error) => { console.error(error instanceof Error && !("code" in error) ? error.message : "Initialization failed. Check the database connection. A credential file from a failed attempt is not an active login."); process.exitCode = 1; }).finally(() => db.$disconnect());

import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { checkDeploymentConfig } from "./lib/deployment-config";
loadEnvConfig(process.cwd());
async function main() {
  const result = checkDeploymentConfig(process.env, process.argv.includes("--production"));
  for (const line of result.warnings) console.log(`NOTE: ${line}`);
  for (const line of result.errors) console.error(`FAIL: ${line}`);
  if (result.errors.length) process.exitCode = 1;
  if (process.argv.includes("--online")) {
    const db = new PrismaClient();
    try {
      const [settings, owners] = await Promise.all([db.settings.findUnique({ where: { id: "main" }, select: { branding: true } }), db.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true, passwordReady: true }, select: { id: true } })]);
      if (!settings?.branding || owners.length !== 1) throw new Error();
      const direct = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });
      try {
        const directOwner = await direct.user.findUnique({ where: { id: owners[0].id }, select: { id: true } });
        if (!directOwner) throw new Error();
      } finally { await direct.$disconnect(); }
      console.log("PASS: database schema, branding and one active owner are present.");
    } catch { console.error("FAIL: database check failed. Verify connectivity, schema, branding, owner setup, and that DATABASE_URL and DIRECT_URL point to the same school."); process.exitCode = 1; }
    finally { await db.$disconnect(); }
    try {
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
      await cloudinary.api.ping(); console.log("PASS: Cloudinary credentials accepted (read-only check).");
    } catch { console.error("FAIL: Cloudinary check failed. Verify account credentials and connectivity."); process.exitCode = 1; }
  }
  if (!process.exitCode) console.log("Deployment configuration checks passed. No data or hosting settings changed.");
}
main().catch(() => { console.error("Configuration check could not finish. No secrets were printed."); process.exitCode = 1; });

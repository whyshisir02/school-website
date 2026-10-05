/** A real restore drill in a disposable, password-protected local PostgreSQL instance. */
import { loadEnvConfig } from "@next/env";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, realpath, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import assert from "node:assert/strict";
import { backupKey, decryptFile } from "./lib/backup-files";
import { postgresEnvironment, postgresTool } from "./lib/postgres-tools";
loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const option = (name: string, fallback = "") => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
async function freePort(): Promise<number> {
  const server = net.createServer();
  return new Promise((resolve, reject) => { server.on("error", reject); server.listen(0, "127.0.0.1", () => { const port = (server.address() as net.AddressInfo).port; server.close(() => resolve(port)); }); });
}
async function restore(args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/school-backup.ts", ...args], { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let errorOutput = "";
    child.stdout.resume(); child.stderr.on("data", (chunk) => { if (errorOutput.length < 2000) errorOutput += chunk.toString(); });
    child.on("error", () => reject(new Error("Could not launch restore drill.")));
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Restore drill failed: ${errorOutput.trim() || "no diagnostic returned"}. No production database was changed.`)));
  });
}
async function main() {
  if (!args.includes("--run") || !option("--backup")) { console.log("Usage: check-backup-restore.ts --run --backup directory [--key-file .local/backup.key]\nRequires PostgreSQL server tools (initdb, pg_ctl). Restores into a disposable, password-protected loopback-only instance, validates counts and session revocation, and removes that instance. Never uses the configured database as a restore target."); return; }
  const root = path.resolve(".local/restore-drills"); await mkdir(root, { recursive: true });
  const folder = path.join(root, randomUUID()); await mkdir(folder);
  const data = path.join(folder, "data"), passwordFile = path.join(folder, "password"), manifestFile = path.join(folder, "manifest.json");
  const keyFile = option("--key-file", ".local/backup.key"), backup = path.resolve(option("--backup"));
  let started = false, stopped = true;
  try {
    await decryptFile(path.join(backup, "manifest.aes"), manifestFile, await backupKey(keyFile));
    const manifest = JSON.parse(await readFile(manifestFile, "utf8")); await unlink(manifestFile);
    const password = randomBytes(32).toString("hex"), port = await freePort();
    await writeFile(passwordFile, password, { flag: "wx", mode: 0o600 });
    await postgresTool("initdb", ["-D", data, "--username=backup_drill", "--auth=scram-sha-256", "--encoding=UTF8", "--locale=C", "--pwfile", passwordFile]);
    await unlink(passwordFile);
    const url = `postgresql://backup_drill:${password}@127.0.0.1:${port}/postgres?sslmode=disable`;
    const env = postgresEnvironment(url);
    stopped = false;
    await postgresTool("pg_ctl", ["-D", data, "-l", path.join(folder, "server.log"), "-o", `-h 127.0.0.1 -p ${port}`, "-w", "-t", "45", "start"], env); started = true;
    await restore(["restore-db", "--backup", backup, "--key-file", keyFile, "--confirm-school", manifest.schoolName], { ...process.env, RESTORE_DATABASE_URL: url });
    const tables = ["User", "ActivityLog", "Notice", "GalleryAlbum", "GalleryImage", "Settings", "StaffMember", "ContactInquiry"];
    const counts = JSON.parse(await postgresTool("psql", ["-XAt", "--no-password", "--command", `SELECT json_build_object(${tables.map((t) => `'${t}',(SELECT count(*) FROM "${t}")`).join(",")},'links',(SELECT count(*) FROM "AccountSetupToken"),'cleanup',(SELECT count(*) FROM "MediaCleanup"),'oldSessions',(SELECT count(*) FROM "User" WHERE "tokenVersion"<1));`], env));
    for (const table of tables) assert.equal(counts[table], manifest.tableCounts[table], `Restored ${table} count differs from backup inventory.`);
    assert.equal(counts.links, 0); assert.equal(counts.cleanup, 0); assert.equal(counts.oldSessions, 0);
    await assert.rejects(restore(["restore-db", "--backup", backup, "--key-file", keyFile, "--confirm-school", manifest.schoolName], { ...process.env, RESTORE_DATABASE_URL: url }));
    console.log("PASS: real PostgreSQL restore, table counts, session/link invalidation, cleanup-queue reset and refusal to overwrite a populated target. Production data was not modified.");
  } finally {
    if (!stopped) {
      try { await postgresTool("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]); stopped = true; }
      catch { console.error("Local drill server could not be stopped automatically. Check .local/restore-drills before removing its data directory."); process.exitCode = 1; }
    }
    if (stopped) {
      // Resolve and verify the exact workspace-owned disposable target before recursive removal.
      const actualRoot = await realpath(root), actualFolder = await realpath(folder);
      if (path.dirname(actualFolder) !== actualRoot || !/^[a-f0-9-]{36}$/.test(path.basename(actualFolder))) throw new Error("Refusing to remove an unexpected restore-drill directory.");
      await rm(actualFolder, { recursive: true, force: false });
    }
  }
}
main().catch((error) => { console.error(error instanceof Error && !("code" in error) ? error.message : "Restore drill failed. Check local PostgreSQL tools and file permissions."); process.exitCode = 1; });

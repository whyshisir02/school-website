import { loadEnvConfig } from "@next/env";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile, unlink, copyFile } from "node:fs/promises";
import path from "node:path";
import { backupKey, decryptFile, encryptFile, fileRecord, inside } from "./lib/backup-files";
import { EMPTY_TARGET_SQL, postgresEnvironment, postgresTool, restoreList, dumpToolMajor } from "./lib/postgres-tools";
import { mediaFolder } from "../src/lib/media-folder";

loadEnvConfig(process.cwd());
const args = process.argv.slice(2), command = args[0];
const option = (key: string, fallback = "") => { const i = args.indexOf(key); return i < 0 ? fallback : args[i + 1] || ""; };
const keyPath = option("--key-file", ".local/backup.key");
const TABLES = ["User", "AccountSetupToken", "ActivityLog", "Notice", "GalleryAlbum", "GalleryImage", "Settings", "StaffMember", "ContactInquiry", "MediaCleanup"];
type Item = { file: string; sha256: string; bytes: number; kind: "database" | "cloudinary" | "public" | "schema"; original?: string; url?: string; format?: string };
type Manifest = { version: 1; createdAt: string; schoolName: string; database: string; serverVersion: string; tableCounts: Record<string, number>; cloudName: string; folder: string; mediaIncluded: boolean; items: Item[] };
const scratchFiles: string[] = [];
async function scratch(suffix: string) {
  await mkdir(".local/backup-work", { recursive: true });
  const file = path.resolve(`.local/backup-work/${randomUUID()}${suffix}`); scratchFiles.push(file); return file;
}
async function cleanup() { for (const file of scratchFiles) await unlink(file).catch(() => {}); }
function sourceEnvironment() {
  const url = process.env.BACKUP_DATABASE_URL || process.env.DIRECT_URL;
  if (!url) throw new Error("Set DIRECT_URL or BACKUP_DATABASE_URL to the intended school's direct/session database connection.");
  return postgresEnvironment(url);
}
async function capture(source: string, kind: Item["kind"], folder: string, key: Buffer, items: Item[], extra: Partial<Item> = {}) {
  const file = `${String(items.length).padStart(6, "0")}.aes`;
  const target = inside(folder, file); await encryptFile(source, target, key);
  items.push({ file, kind, ...extra, ...await fileRecord(target) });
}
async function publicFiles(folder: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Symlinks in public assets must be resolved before backup.");
    if (entry.isDirectory()) files.push(...await publicFiles(file)); else if (entry.isFile()) files.push(file);
  }
  return files;
}
async function createBackup() {
  const key = await backupKey(keyPath), env = sourceEnvironment();
  const previous = option("--reuse") ? await loadBackup(option("--reuse")) : undefined;
  const metadata = JSON.parse(await postgresTool("psql", ["-XAt", "--no-password", "--set", "ON_ERROR_STOP=1", "--command", `SELECT json_build_object('schoolName',(SELECT "schoolName" FROM "Settings" WHERE id='main'),'database',current_database(),'serverVersion',current_setting('server_version'),'tableCounts',json_build_object(${TABLES.map((t) => `'${t}',(SELECT count(*) FROM "${t}")`).join(",")}));`], env));
  if (!metadata.schoolName) throw new Error("Initialize school settings before creating a school backup.");
  console.log(`Backing up school: ${metadata.schoolName}`);
  const folder = path.resolve(option("--out", ".local/backups"), `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`);
  await mkdir(folder, { recursive: true });
  const manifest: Manifest = { version: 1, createdAt: new Date().toISOString(), ...metadata, cloudName: process.env.CLOUDINARY_CLOUD_NAME || "", folder: mediaFolder(), mediaIncluded: !args.includes("--database-only"), items: [] };
  if (previous && (previous.manifest.cloudName !== manifest.cloudName || previous.manifest.folder !== manifest.folder || previous.manifest.schoolName !== manifest.schoolName)) throw new Error("Reuse requires a backup from the same school, cloud account and media folder.");
  const dump = await scratch(".dump");
  await postgresTool("pg_dump", ["--no-password", "--schema=public", "--no-owner", "--no-acl", "--format=custom", "--file", dump], env);
  await capture(dump, "database", folder, key, manifest.items); await unlink(dump);
  await capture("prisma/schema.prisma", "schema", folder, key, manifest.items);
  if (manifest.mediaIncluded) {
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    let cursor: string | undefined;
    const seen = new Set<string>();
    do {
      const page = await cloudinary.api.resources({ resource_type: "image", type: "upload", prefix: `${manifest.folder}/`, max_results: 500, ...(cursor ? { next_cursor: cursor } : {}) });
      for (const asset of page.resources) {
        const url = new URL(asset.secure_url);
        if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.username || url.password || !url.pathname.startsWith(`/${manifest.cloudName}/image/upload/`) || !asset.public_id.startsWith(`${manifest.folder}/`)) throw new Error("Unexpected media account or download location. Backup stopped.");
        const cached = previous?.manifest.items.find((item) => item.kind === "cloudinary" && item.original === asset.public_id && item.url === asset.secure_url);
        if (previous && cached) {
          const file = `${String(manifest.items.length).padStart(6, "0")}.aes`;
          await copyFile(inside(previous.folder, cached.file), inside(folder, file));
          manifest.items.push({ ...cached, file }); continue;
        }
        const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(60000) });
        if (!response.ok) throw new Error("A Cloudinary original could not be downloaded. Backup remains incomplete.");
        // Stored uploads are capped at 700 KB; allow larger legacy originals, with a hard memory bound.
        const chunks: Uint8Array[] = []; let size = 0;
        for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
          size += chunk.length;
          if (size > 50 * 1024 * 1024) throw new Error("A legacy media file exceeds the 50 MB backup limit. Archive it separately.");
          chunks.push(chunk);
        }
        const temp = await scratch(".image"); await writeFile(temp, Buffer.concat(chunks), { flag: "wx", mode: 0o600 });
        await capture(temp, "cloudinary", folder, key, manifest.items, { original: asset.public_id, url: asset.secure_url, format: asset.format }); await unlink(temp);
      }
      cursor = page.next_cursor;
      if (cursor && seen.has(cursor)) throw new Error("Cloudinary pagination repeated. Backup stopped.");
      if (cursor) seen.add(cursor);
    } while (cursor);
    for (const file of await publicFiles("public")) await capture(file, "public", folder, key, manifest.items, { original: path.relative("public", file).split(path.sep).join("/") });
  }
  const manifestFile = await scratch(".json"); await writeFile(manifestFile, JSON.stringify(manifest, null, 2), { flag: "wx", mode: 0o600 });
  // The authenticated manifest is written LAST. A folder without it is an incomplete backup.
  await encryptFile(manifestFile, inside(folder, "manifest.aes"), key); await unlink(manifestFile);
  console.log(`Backup created: ${folder}\nEncrypted database + ${manifest.items.filter((i) => i.kind === "cloudinary").length} Cloudinary originals + ${manifest.items.filter((i) => i.kind === "public").length} local public files. Keep the key separately. Run verify before copying off-site.`);
}
async function loadBackup(directory = option("--backup")): Promise<{ manifest: Manifest; folder: string; key: Buffer }> {
  if (!directory) throw new Error("Pass --backup with a completed backup directory.");
  const folder = path.resolve(directory);
  const key = await backupKey(keyPath), temp = await scratch(".manifest.json");
  await decryptFile(inside(folder, "manifest.aes"), temp, key);
  const manifest = JSON.parse(await readFile(temp, "utf8")) as Manifest; await unlink(temp);
  if (manifest.version !== 1 || !manifest.schoolName || !Array.isArray(manifest.items) || manifest.items.filter((i) => i.kind === "database").length !== 1) throw new Error("Unsupported backup manifest.");
  const files = new Set<string>();
  for (const item of manifest.items) {
    if (!/^\d{6}\.aes$/.test(item.file) || files.has(item.file) || !/^[a-f0-9]{64}$/.test(item.sha256)) throw new Error("Invalid backup file index.");
    files.add(item.file);
    const record = await fileRecord(inside(folder, item.file));
    if (record.bytes !== item.bytes || record.sha256 !== item.sha256) throw new Error("Backup file is missing or changed. Verification failed.");
  }
  return { manifest, folder, key };
}
async function verifiedDump(backup: Awaited<ReturnType<typeof loadBackup>>) {
  const dump = await scratch(".dump");
  await decryptFile(inside(backup.folder, backup.manifest.items.find((i) => i.kind === "database")!.file), dump, backup.key);
  const toc = await postgresTool("pg_restore", ["--list", dump]);
  for (const table of TABLES) if (!toc.includes(`TABLE public ${table} `)) throw new Error(`Backup is missing required table ${table}.`);
  return { dump, toc };
}
async function verifyBackup() {
  const backup = await loadBackup();
  await verifiedDump(backup);
  for (const item of backup.manifest.items.filter((i) => i.kind !== "database")) {
    const temp = await scratch(".verify"); await decryptFile(inside(backup.folder, item.file), temp, backup.key); await unlink(temp);
  }
  console.log(`School: ${backup.manifest.schoolName}\nBackup verified: authenticated files and PostgreSQL archive table list checked. ${backup.manifest.mediaIncluded ? "Media included." : "DATABASE ONLY: media is not included."} This verification is not a database restore drill.`);
}
async function restoreDatabase() {
  const backup = await loadBackup();
  const { dump, toc } = await verifiedDump(backup);
  if (!process.env.RESTORE_DATABASE_URL) throw new Error("Set RESTORE_DATABASE_URL to a separate EMPTY recovery database; there is no default target.");
  const env = postgresEnvironment(process.env.RESTORE_DATABASE_URL);
  const dumpedBy = dumpToolMajor(toc);
  const targetVersion = Number((await postgresTool("psql", ["-XAt", "--no-password", "--set", "ON_ERROR_STOP=1", "--command", "SHOW server_version_num"], env)).trim());
  if (!dumpedBy || Math.floor(targetVersion / 10000) < dumpedBy) throw new Error("Recovery server must be the same or newer major version than pg_dump. Use matching client tools (PG_BIN) when backing up for an older recovery server.");
  // Check now for useful feedback; repeat inside the same transaction as restoration below.
  await postgresTool("psql", ["-X", "--no-password", "--set", "ON_ERROR_STOP=1", "--command", EMPTY_TARGET_SQL], env);
  if (args.includes("--dry-run")) { console.log(`School: ${backup.manifest.schoolName}\nArchive verified and recovery target is empty. No data restored.`); return; }
  if (option("--confirm-school") !== backup.manifest.schoolName) throw new Error("Pass --confirm-school with the exact school name in this backup.");
  const list = await scratch(".toc"), sql = await scratch(".sql"), guard = await scratch(".guard.sql"), revoke = await scratch(".revoke.sql");
  await writeFile(list, restoreList(toc), { flag: "wx", mode: 0o600 });
  await postgresTool("pg_restore", ["--no-owner", "--no-acl", "--use-list", list, "--file", sql, dump]);
  await writeFile(guard, EMPTY_TARGET_SQL, { flag: "wx", mode: 0o600 });
  // pg_restore deliberately clears search_path; qualify post-restore tables.
  await writeFile(revoke, 'DELETE FROM public."AccountSetupToken"; UPDATE public."User" SET "tokenVersion"="tokenVersion"+1; DELETE FROM public."MediaCleanup";', { flag: "wx", mode: 0o600 });
  await postgresTool("psql", ["-X", "--no-password", "--set", "ON_ERROR_STOP=1", "--single-transaction", "--file", guard, "--file", sql, "--file", revoke], env);
  console.log("Database restored into the empty recovery target. Sessions and setup links revoked; stale media deletion queue cleared. Passwords and content preserved. Validate this recovery database before switching hosting configuration.");
}
async function exportMedia() {
  const backup = await loadBackup();
  if (!backup.manifest.mediaIncluded) throw new Error("This backup does not include media.");
  if (!option("--out")) throw new Error("Pass --out with a NEW directory for decrypted media.");
  const output = path.resolve(option("--out")); await mkdir(output); // Refuse an existing folder.
  for (const item of backup.manifest.items.filter((i) => ["cloudinary", "public", "schema"].includes(i.kind))) {
    if (item.kind === "cloudinary" && !/^[a-z0-9]+$/i.test(item.format || "")) throw new Error("Invalid media format in backup.");
    const relative = item.kind === "schema" ? "schema.prisma" : `${item.kind}/${item.original}${item.kind === "cloudinary" ? `.${item.format}` : ""}`;
    const target = inside(output, relative); await mkdir(path.dirname(target), { recursive: true });
    await decryptFile(inside(backup.folder, item.file), target, backup.key);
  }
  await writeFile(inside(output, "media-index.json"), JSON.stringify(backup.manifest.items.filter((i) => i.kind === "cloudinary"), null, 2), { flag: "wx", mode: 0o600 });
  console.log("Media decrypted into the requested new directory. Cloudinary and public website files were not changed.");
}
async function main() {
  if (!command || args.includes("--help")) {
    console.log("School backup (maintainer terminal only)\n  key --key-file .local/backup.key\n  create [--database-only] [--reuse previous-backup] [--out .local/backups] [--key-file path]\n  verify --backup directory [--key-file path]\n  restore-db --backup directory --dry-run [--key-file path]\n  restore-db --backup directory --confirm-school \"Exact school name\" [--key-file path]\n  export-media --backup directory --out NEW-directory [--key-file path]\nRestore requires RESTORE_DATABASE_URL and an empty public schema. No hosting or cloud assets are modified by these commands. See docs/deployment-and-recovery.md."); return;
  }
  if (command === "key") { await backupKey(keyPath, true); console.log(`New encryption key saved to ${keyPath}. Keep a separate secure copy; it is required for recovery.`); }
  else if (command === "create") await createBackup();
  else if (command === "verify") await verifyBackup();
  else if (command === "restore-db") await restoreDatabase();
  else if (command === "export-media") await exportMedia();
  else throw new Error("Unknown command. Use --help.");
}
main().catch((error) => {
  // Known tool errors are deliberately redacted; do not forward provider payloads or SQL.
  const message = error instanceof Error && !("code" in error) ? error.message : "Backup operation failed. Check credentials, connectivity, file access and disk space.";
  console.error(message); process.exitCode = 1;
}).finally(cleanup);

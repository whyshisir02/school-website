import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const magic = Buffer.from("SBA1");
export function inside(root: string, relative: string) {
  const resolved = path.resolve(root, relative);
  if (!relative || path.isAbsolute(relative) || resolved === path.resolve(root) || !resolved.startsWith(path.resolve(root) + path.sep)) throw new Error("Unsafe backup file path.");
  return resolved;
}
export async function backupKey(file: string, create = false) {
  if (create) {
    await mkdir(path.dirname(path.resolve(file)), { recursive: true });
    await writeFile(file, randomBytes(32), { flag: "wx", mode: 0o600 });
  }
  const key = await readFile(file);
  if (key.length !== 32) throw new Error("Backup key must be the original 32-byte key file.");
  return key;
}
export async function sha256(file: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
export async function encryptFile(source: string, target: string, key: Buffer) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key, iv);
  const handle = await open(target, "wx", 0o600);
  try {
    await handle.write(Buffer.concat([magic, iv, Buffer.alloc(16)]));
    await pipeline(createReadStream(source), cipher, createWriteStream(target, { flags: "r+", start: 32 }));
    await handle.write(cipher.getAuthTag(), 0, 16, 16);
  } finally { await handle.close(); }
}
export async function decryptFile(source: string, target: string, key: Buffer) {
  const handle = await open(source, "r"), header = Buffer.alloc(32);
  try { if ((await handle.read(header, 0, 32, 0)).bytesRead !== 32 || !header.subarray(0, 4).equals(magic)) throw new Error("Invalid encrypted backup."); }
  finally { await handle.close(); }
  const decipher = createDecipheriv("aes-256-gcm", key, header.subarray(4, 16));
  decipher.setAuthTag(header.subarray(16, 32));
  // Never feed unauthenticated plaintext into pg_restore or psql.
  const output = await open(target, "wx", 0o600);
  try { await pipeline(createReadStream(source, { start: 32 }), decipher, output.createWriteStream()); }
  catch { await output.close().catch(() => {}); await unlink(target).catch(() => {}); throw new Error("Backup authentication failed: wrong key, truncated file or altered backup."); }
  finally { await output.close().catch(() => {}); }
}
export async function fileRecord(file: string) { return { sha256: await sha256(file), bytes: (await stat(file)).size }; }

import { spawn } from "node:child_process";
import path from "node:path";

/** Parse credentials into child-only environment variables, never shell arguments. */
export function postgresEnvironment(raw: string, base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("Invalid database URL."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) throw new Error("Invalid PostgreSQL connection.");
  if (url.searchParams.has("schema") && url.searchParams.get("schema") !== "public") throw new Error("Backup commands support only the public application schema.");
  const ssl = url.searchParams.get("sslmode") || (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? "disable" : "require");
  if (!["disable", "allow", "prefer", "require", "verify-ca", "verify-full"].includes(ssl)) throw new Error("Unsupported PostgreSQL SSL mode.");
  const env = Object.fromEntries(Object.entries(base).filter(([key]) => !key.startsWith("PG"))) as NodeJS.ProcessEnv;
  return { ...env, PGHOST: url.hostname.replace(/^\[|\]$/g, ""), PGPORT: url.port || "5432", PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: ssl, PGCONNECT_TIMEOUT: "15", PGAPPNAME: "school-backup", ...(base.PGSSLROOTCERT ? { PGSSLROOTCERT: base.PGSSLROOTCERT } : {}) };
}
export function postgresTool(name: "pg_dump" | "pg_restore" | "psql" | "initdb" | "pg_ctl", args: string[], env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const executable = process.env.PG_BIN ? path.join(process.env.PG_BIN, name + (process.platform === "win32" ? ".exe" : "")) : name;
  return new Promise((resolve, reject) => {
    // pg_ctl starts a long-lived server. Do not let it inherit pipes that keep
    // the Node child-process close event waiting until that server shuts down.
    const child = spawn(executable, name === "psql" ? ["--set", "VERBOSITY=sqlstate", ...args] : args, { env, shell: false, windowsHide: true, stdio: ["ignore", name === "pg_ctl" ? "ignore" : "pipe", name === "pg_ctl" ? "ignore" : "pipe"] });
    let output = "", diagnostic = "";
    child.stdout?.on("data", (data) => { if (output.length < 4_000_000) output += data.toString(); });
    // Do not print PostgreSQL error output: it can include connection details or private data.
    child.stderr?.on("data", (data) => { if (diagnostic.length < 16000) diagnostic += data.toString(); });
    const timer = setTimeout(() => { child.kill(); }, 15 * 60_000);
    child.on("error", () => { clearTimeout(timer); reject(new Error(`${name} could not start. Install PostgreSQL client tools or set PG_BIN.`)); });
    child.on("close", (code) => { clearTimeout(timer); const state = diagnostic.match(/(?:ERROR|FATAL):\s+([0-9A-Z]{5})\b/)?.[1]; code === 0 ? resolve(output) : reject(new Error(`${name} failed (exit ${code}${state ? `, SQLSTATE ${state}` : ""}). Check connection, tool/server versions, permissions and free disk space.`)); });
  });
}
export const EMPTY_TARGET_SQL = `DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f'))
 OR EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
 THEN RAISE EXCEPTION 'Restore target public schema is not empty'; END IF;
END $$;`;
export function restoreList(toc: string) {
  // A newly provisioned database already has its public schema.
  return toc.split(/\r?\n/).filter((line) => !/^\d+;.*\bSCHEMA - public\s/.test(line)).join("\n");
}
export function dumpToolMajor(toc: string) {
  const version = Number(toc.match(/Dumped by pg_dump version:?\s+(\d+)/)?.[1]);
  if (!version) throw new Error("Could not determine archive tool version.");
  return version;
}

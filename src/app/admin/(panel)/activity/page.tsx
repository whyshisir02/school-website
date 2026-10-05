import Link from "next/link";
import { Prisma } from "@prisma/client";
import { requirePageAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { AUDIT_AREAS, AUDIT_EVENTS, type AuditAction } from "@/lib/audit-events";
import { auditDateRange } from "@/lib/audit-filters";
import { pageNumber } from "@/lib/pagination";
export const dynamic = "force-dynamic";
const pageSize = 30;
export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePageAccess("AUDIT");
  const params = await searchParams;
  const text = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = text("q").trim().slice(0, 120), area = text("area"), from = text("from"), to = text("to");
  let error = "", createdAt = {};
  try { createdAt = auditDateRange(from, to); } catch (e) { error = e instanceof Error ? e.message : "Invalid date range."; }
  const where: Prisma.ActivityLogWhereInput = { createdAt,
    ...(AUDIT_AREAS.includes(area as typeof AUDIT_AREAS[number]) ? { area } : {}),
    ...(q ? { OR: [{ actorEmail: { contains: q, mode: "insensitive" } }, { targetId: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const count = error ? 0 : await prisma.activityLog.count({ where });
  const pages = Math.max(1, Math.ceil(count / pageSize)), page = Math.min(pageNumber(text("page")), pages);
  const entries = error ? [] : await prisma.activityLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize });
  const href = (p: number) => "/admin/activity?" + new URLSearchParams({ q, area, from, to, page: String(p) }).toString();
  const field = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal";
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Activity log</h1><p className="mt-2 text-sm text-slate-600">Review saved changes to school content, settings and accounts. Records begin when activity logging was enabled.</p></div>
    <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
      <label className="text-sm font-semibold">Account or record ID<input name="q" defaultValue={q} maxLength={120} placeholder="Login email or record ID" className={field} /></label>
      <label className="text-sm font-semibold">Section<select name="area" defaultValue={area} className={field}><option value="">All sections</option>{AUDIT_AREAS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="text-sm font-semibold">From (Nepal date)<input type="date" name="from" defaultValue={from} className={field} /></label>
      <label className="text-sm font-semibold">Through (Nepal date)<input type="date" name="to" defaultValue={to} className={field} /></label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-4"><button className="min-h-11 rounded-xl bg-navy px-5 font-semibold text-white">Apply filters</button><Link href="/admin/activity" className="flex min-h-11 items-center rounded-xl border px-4">Clear filters</Link><span className="text-sm text-slate-500">{count} records</span></div>
    </form>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <ol className="space-y-3">{entries.map((entry) => {
      const details = entry.details && typeof entry.details === "object" && !Array.isArray(entry.details) ? entry.details : {};
      return <li key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">{AUDIT_EVENTS[entry.action as AuditAction]?.[1] ?? entry.action}</h2><time dateTime={entry.createdAt.toISOString()} className="text-xs text-slate-500">{entry.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Kathmandu", dateStyle: "medium", timeStyle: "short" })} NPT</time></div>
        <p className="mt-2 break-all text-sm text-slate-600">{entry.actorEmail} <span className="text-xs text-slate-400">({entry.actorRole === "SUPER_ADMIN" ? "Super Admin" : entry.actorRole === "MAINTAINER" ? "Maintainer command" : "School Admin"})</span></p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500"><span>{entry.area}</span>{entry.targetId && <span className="break-all">Record: {entry.targetId}</span>}{typeof details.count === "number" && <span>Count: {details.count}</span>}{("year" in details) && <span>Year: {details.year === null ? "Unspecified" : `${details.year} BS`}</span>}{typeof details.published === "boolean" && <span>{details.published ? "Published" : "Draft"}</span>}</div>
        {Array.isArray(details.permissions) && <p className="mt-3 text-xs text-slate-600">Assigned access: {details.permissions.length ? details.permissions.join(", ") : "None"}</p>}
        {typeof details.sourceId === "string" && <p className="mt-2 break-all text-xs text-slate-500">From album {details.sourceId} to {String(details.destinationId ?? "")}</p>}
      </li>;
    })}</ol>
    {!error && !entries.length && <p className="rounded-2xl border border-dashed p-10 text-center text-slate-500">No activity matches these filters.</p>}
    {pages > 1 && <nav aria-label="Activity pages" className="flex items-center justify-between text-sm"><Link aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined} className={page === 1 ? "pointer-events-none opacity-40" : "font-semibold"} href={href(Math.max(1, page - 1))}>Previous</Link><span>Page {page} of {pages}</span><Link aria-disabled={page === pages} tabIndex={page === pages ? -1 : undefined} className={page === pages ? "pointer-events-none opacity-40" : "font-semibold"} href={href(Math.min(pages, page + 1))}>Next</Link></nav>}
  </div>;
}

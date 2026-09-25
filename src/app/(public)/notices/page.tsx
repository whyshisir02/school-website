import type { Metadata } from "next";
import Link from "next/link";
import { FiFileText } from "react-icons/fi";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { toBSDateString } from "@/lib/bs-date";

export const metadata: Metadata = {
  title: "Notices",
  description: "Latest notices, exam routines, holiday announcements and events.",
};

export const revalidate = 3600;

const PER_PAGE = 10;
const categories = ["ALL", "EXAM", "HOLIDAY", "EVENT", "GENERAL"] as const;

const categoryColors: Record<string, string> = {
  EXAM: "bg-blue-100 text-blue-700",
  HOLIDAY: "bg-green-100 text-green-700",
  EVENT: "bg-purple-100 text-purple-700",
  GENERAL: "bg-slate-100 text-slate-600",
};

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const category = sp.category && categories.includes(sp.category as never) ? sp.category : undefined;
  const q = sp.q?.trim();

  const where = {
    isPublished: true,
    ...(category ? { category: category as never } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.notice.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const latest = await prisma.notice.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { slug: true, title: true },
  });

  return (
    <>
      <PageHeader title="Notices & Announcements" breadcrumb="Notices" />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[7fr_3fr]">
        {/* List */}
        <div>
          {/* Filters */}
          <form className="mb-6 flex flex-wrap items-center gap-3">
            <input
              name="q" defaultValue={q} placeholder="Search notices…"
              className="w-full max-w-xs rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-gold"
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/notices${c !== "ALL" ? `?category=${c}` : ""}`}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                    (category ?? "ALL") === c
                      ? "bg-navy text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </form>

          {notices.length === 0 && (
            <p className="rounded-xl bg-white p-8 text-center text-slate-500">No notices found.</p>
          )}

          <div className="space-y-4">
            {notices.map((n) => {
              const d = n.publishedAt ?? n.createdAt;
              const bs = toBSDateString(d);
              const ad = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              return (
                <Link
                  key={n.id}
                  href={`/notices/${n.slug}`}
                  className="block rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[n.category]}`}>
                      {n.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {bs ? `${bs} BS · ${ad}` : ad}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{n.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {n.content.replace(/<[^>]+>/g, "").slice(0, 160)}…
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/notices?page=${i + 1}${category ? `&category=${category}` : ""}`}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    page === i + 1 ? "bg-navy text-white" : "bg-white hover:bg-slate-100"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="font-heading font-bold">Latest Notices</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {latest.map((l) => (
                <li key={l.slug}>
                  <Link href={`/notices/${l.slug}`} className="text-slate-600 hover:text-gold-dark">
                    • {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="font-heading font-bold">Academic Calendar</h3>
            {/* TODO(school): once the real 2082 calendar PDF exists, drop it in
                /public/documents/ and swap this for a working download link. */}
            <span className="mt-3 inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
              <FiFileText size={14} /> Calendar Coming Soon
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}

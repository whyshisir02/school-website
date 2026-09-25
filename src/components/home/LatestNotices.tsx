import Link from "next/link";
import { prisma } from "@/lib/db";

// NOTE: revalidate lives in the page (src/app/(public)/page.tsx), not here —
// exporting it from a component has no effect.

const categoryColors: Record<string, string> = {
  EXAM: "bg-blue-100 text-blue-700",
  HOLIDAY: "bg-green-100 text-green-700",
  EVENT: "bg-purple-100 text-purple-700",
  GENERAL: "bg-slate-100 text-slate-600",
};

export default async function LatestNotices() {
  const notices = await prisma.notice.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (notices.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="container-page">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Latest News & Notices</h2>
          <Link href="/notices" className="text-sm font-semibold text-gold-dark hover:underline">
            View All →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {notices.map((n) => {
            const d = n.publishedAt ?? n.createdAt;
            return (
              <Link
                key={n.id}
                href={`/notices/${n.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-navy text-white">
                    <span className="font-heading text-xl font-bold leading-none">{d.getDate()}</span>
                    <span className="text-[10px] uppercase">{d.toLocaleString("en", { month: "short" })}</span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[n.category]}`}>
                    {n.category}
                  </span>
                </div>
                <h3 className="mt-4 line-clamp-2 text-lg font-semibold">{n.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {n.content.replace(/<[^>]+>/g, "").slice(0, 120)}…
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-gold-dark">Read More →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

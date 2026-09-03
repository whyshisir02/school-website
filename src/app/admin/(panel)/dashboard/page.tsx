import Link from "next/link";
import { prisma } from "@/lib/db";
import { FiFileText, FiImage, FiPlus } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [noticeCount, albumCount, imageCount, recent] = await Promise.all([
    prisma.notice.count(),
    prisma.galleryAlbum.count(),
    prisma.galleryImage.count(),
    prisma.notice.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: "Total Notices", value: noticeCount, href: "/admin/notices", icon: FiFileText },
    { label: "Gallery Albums", value: albumCount, href: "/admin/gallery", icon: FiImage },
    { label: "Gallery Images", value: imageCount, href: "/admin/gallery", icon: FiImage },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/notices"
            className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy/90"
          >
            <FiFileText size={16} /> Manage Notices
          </Link>
          <Link
            href="/admin/gallery"
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:bg-gold/90"
          >
            <FiImage size={16} /> Manage Gallery
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <c.icon size={22} className="text-slate-400 transition group-hover:text-navy" />
            <div className="mt-3 font-heading text-3xl font-bold text-navy">{c.value}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-slate-500">{c.label}</span>
              <span className="text-xs font-semibold text-navy opacity-0 transition group-hover:opacity-100">
                Manage →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/notices"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:border-navy hover:text-navy"
          >
            <FiPlus size={14} /> Create Notice
          </Link>
          <Link
            href="/admin/gallery"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:border-navy hover:text-navy"
          >
            <FiPlus size={14} /> Upload Gallery Images
          </Link>
        </div>
      </section>

      <h2 className="mt-10 text-lg font-bold">Recent Notices</h2>
      <ul className="mt-4 divide-y rounded-xl bg-white shadow-sm">
        {recent.map((n) => (
          <li key={n.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <span>{n.title}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              n.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
            }`}>
              {n.isPublished ? "Published" : "Draft"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

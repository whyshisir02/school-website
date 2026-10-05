import { requirePageAccess, accessFromSession } from "@/lib/auth-helpers";
import { canAccess } from "@/lib/permissions";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUnreadInquiryCount } from "@/lib/admin-counts";
import { FiFileText, FiImage, FiMail, FiPlus, FiArrowUpRight, FiEdit3 } from "react-icons/fi";
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const access = accessFromSession(await requirePageAccess());
  const noticesAllowed = canAccess(access, "NOTICES");
  const galleryAllowed = canAccess(access, "GALLERY");
  const inquiriesAllowed = canAccess(access, "INQUIRIES");
  const [published, drafts, photos, unread, notices, inquiries] = await Promise.all([
    noticesAllowed ? prisma.notice.count({ where: { isPublished: true } }) : 0,
    noticesAllowed ? prisma.notice.count({ where: { isPublished: false } }) : 0,
    galleryAllowed ? prisma.galleryImage.count() : 0,
    inquiriesAllowed ? getUnreadInquiryCount() : 0,
    noticesAllowed ? prisma.notice.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, isPublished: true, updatedAt: true } }) : [],
    inquiriesAllowed ? prisma.contactInquiry.findMany({ where: { isRead: false }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, message: true, createdAt: true } }) : [],
  ]);
  const cards = [
    { label: "Published notices", value: published, icon: FiFileText, href: "/admin/notices", detail: "Updates visible to parents" },
    { label: "Draft notices", value: drafts, icon: FiEdit3, href: "/admin/notices", detail: "Ready for your next review" },
    { label: "Gallery photos", value: photos, icon: FiImage, href: "/admin/gallery", detail: "School moments shared" },
    { label: "Unread inquiries", value: unread, icon: FiMail, href: "/admin/inquiries", detail: unread ? "Parents are waiting to hear from you" : "You're all caught up" },
  ].filter((card) => card.href === "/admin/notices" ? noticesAllowed : card.href === "/admin/gallery" ? galleryAllowed : inquiriesAllowed);
  const date = (value: Date) => value.toLocaleDateString("en-GB", { timeZone: "Asia/Kathmandu", day: "numeric", month: "short" });
  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Your workspace</p><h1 className="font-heading text-3xl font-bold text-navy">Welcome back</h1><p className="mt-2 text-slate-500">Keep families informed and your school website up to date.</p></div>
      {noticesAllowed && <Link href="/admin/notices?new=1" className="btn-primary !rounded-xl"><FiPlus /> Create notice</Link>}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Link key={card.label} href={card.href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-gold hover:shadow-sm">
      <div className="flex items-center justify-between"><span className="rounded-xl bg-slate-50 p-3 text-navy"><card.icon size={20} /></span><FiArrowUpRight className="text-slate-400" /></div>
      <p className="mt-5 text-3xl font-bold text-navy">{card.value}</p><h2 className="mt-1 text-sm font-semibold">{card.label}</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">{card.detail}</p>
    </Link>)}</div>
    <section className="rounded-2xl bg-navy p-6 text-white"><h2 className="font-heading text-lg font-semibold">What would you like to update?</h2><div className="mt-4 flex flex-wrap gap-3">
      {canAccess(access, "GALLERY") && <Link href="/admin/gallery" className="rounded-xl bg-white/10 px-4 py-3 text-sm hover:bg-white/20">Upload school photos</Link>}
      {canAccess(access, "HERO") && <Link href="/admin/settings/hero" className="rounded-xl bg-white/10 px-4 py-3 text-sm hover:bg-white/20">Refresh homepage photos</Link>}
      {canAccess(access, "MESSAGES") && <Link href="/admin/settings/messages" className="rounded-xl bg-white/10 px-4 py-3 text-sm hover:bg-white/20">Edit leadership messages</Link>}
    </div></section>
    <div className="grid items-start gap-6 xl:grid-cols-[3fr_2fr]">
      {noticesAllowed && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b p-5"><h2 className="font-bold">Recent notices</h2><Link href="/admin/notices" className="text-sm font-medium text-slate-500">View all</Link></div>
        {notices.length ? <ul className="divide-y">{notices.map((notice) => <li key={notice.id}><Link href={`/admin/notices?edit=${notice.id}`} className="flex items-center gap-3 p-5 hover:bg-slate-50"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{notice.title}</p><p className="mt-1 text-xs text-slate-500">Updated {date(notice.updatedAt)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${notice.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{notice.isPublished ? "Published" : "Draft"}</span><FiEdit3 className="text-slate-400" /></Link></li>)}</ul> : <p className="p-6 text-sm text-slate-500">Create your first notice to share an update with families.</p>}
      </section>}
      {inquiriesAllowed && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b p-5"><h2 className="font-bold">Needs your attention</h2><FiMail className="text-gold-dark" /></div>
        {inquiries.length ? <ul className="divide-y">{inquiries.map((inquiry) => <li key={inquiry.id}><Link href="/admin/inquiries" className="block p-5 hover:bg-slate-50"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{inquiry.name}</p><span className="text-xs text-slate-400">{date(inquiry.createdAt)}</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-500">{inquiry.message}</p></Link></li>)}</ul> : <p className="p-6 text-sm text-slate-500">No unread inquiries. New messages will appear here.</p>}
      </section>}
    </div>
  </div>;
}

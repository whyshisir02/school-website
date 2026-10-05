import { requirePageAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { readAnnouncementState } from "@/lib/announcement";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";

export default async function AnnouncementsPage() {
  await requirePageAccess("NOTICES");
  const settings = await prisma.settings.findUnique({ where: { id: "main" }, select: { announcement: true } });
  return <><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">School announcements</p>
    <h1 className="mt-2 text-3xl font-bold text-navy">Welcome popup</h1>
    <p className="mt-2 text-sm text-slate-600">A greeting or notice shown when visitors open the website.</p>
    <AnnouncementsManager initial={readAnnouncementState(settings?.announcement)} /></>;
}

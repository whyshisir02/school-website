import { canAccess } from "@/lib/permissions";
import { requirePageAccess, accessFromSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import StaffManager from "@/components/admin/StaffManager";
export const dynamic = "force-dynamic";
export default async function StaffPage() {
  const access = accessFromSession(await requirePageAccess("FACULTY"));
  const [members, settings] = await Promise.all([
    prisma.staffMember.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }, { id: "asc" }] }),
    prisma.settings.findUnique({ where: { id: "main" }, select: { principalStaffId: true } }),
  ]);
  return <StaffManager canEditMessages={canAccess(access, "MESSAGES")} members={members.map((member) => ({ id: member.id, name: member.name, position: member.position, group: member.group, status: member.status, subject: member.subject, qualifications: member.qualifications, bio: member.bio, photoUrl: member.photoUrl, publicId: member.publicId, order: member.order, updatedAt: member.updatedAt.toISOString(), isPrincipal: member.id === settings?.principalStaffId }))} />;
}

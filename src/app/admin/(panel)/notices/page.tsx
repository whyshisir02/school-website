import { prisma } from "@/lib/db";
import NoticesManager from "@/components/admin/NoticesManager";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true, isPublished: true, content: true },
  });

  return <NoticesManager notices={notices} />;
}

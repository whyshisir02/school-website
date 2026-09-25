import { prisma } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await prisma.contactInquiry
    .count({ where: { isRead: false } })
    .catch(() => 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav unreadCount={unreadCount} />
      <div className="container-page py-8">{children}</div>
    </div>
  );
}

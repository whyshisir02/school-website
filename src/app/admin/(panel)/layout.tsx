import { getSiteSettings } from "@/lib/settings";
import { getUnreadInquiryCount } from "@/lib/admin-counts";
import AdminNav from "@/components/admin/AdminNav";
import { requirePageAccess, accessFromSession } from "@/lib/auth-helpers";
import { canAccess } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const access = accessFromSession(await requirePageAccess());
  const unreadCount = canAccess(access, "INQUIRIES") ? await getUnreadInquiryCount().catch(() => 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav name={settings.branding.shortName || settings.name} logo={settings.branding.logo?.url} unreadCount={unreadCount} access={access} />
      <main className="admin-content min-w-0 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

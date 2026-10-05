import SettingsTabs from "@/components/admin/SettingsTabs";
import { requirePageAccess, accessFromSession } from "@/lib/auth-helpers";
export const dynamic = "force-dynamic";
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const access = accessFromSession(await requirePageAccess());
  return <div className="max-w-5xl">
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Make it yours</p>
    <h1 className="font-heading text-3xl font-bold">{access.role === "SUPER_ADMIN" ? "Website settings" : "Account and assigned settings"}</h1>
    <SettingsTabs access={access} /><div className="mt-6">{children}</div>
  </div>;
}

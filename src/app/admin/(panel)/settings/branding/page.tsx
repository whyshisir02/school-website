import { requirePageAccess } from "@/lib/auth-helpers";
import { getSiteSettings } from "@/lib/settings";
import BrandingForm from "@/components/admin/BrandingForm";
export default async function BrandingPage() {
  await requirePageAccess("SCHOOL_SETTINGS");
  const settings = await getSiteSettings();
  return <><h2 className="mt-8 text-xl font-bold">School branding</h2><p className="mt-2 text-sm text-slate-500">Manage the public identity, homepage text and notice letterhead. Optional blank fields stay hidden.</p><BrandingForm branding={settings.branding} /></>;
}

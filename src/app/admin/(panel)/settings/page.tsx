import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsGeneralPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <p className="text-sm text-slate-500">
        Edit the school&rsquo;s contact details, map and homepage stat tiles. Changes
        go live across the site as soon as you save. Leave a field blank to fall back
        to the built-in default.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}

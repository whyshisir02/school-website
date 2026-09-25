import { getSiteSettings } from "@/lib/settings";
import HeroSlidesAdmin from "@/components/admin/HeroSlidesAdmin";

export const dynamic = "force-dynamic";

export default async function SettingsHeroPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h2 className="text-xl font-bold">Homepage hero</h2>
      <p className="mt-1 text-sm text-slate-500">
        The rotating photos in the homepage hero banner. Reorder, replace or remove
        them; if none are set the built-in default slides are shown.
      </p>
      <HeroSlidesAdmin slides={settings.heroSlides} />
    </div>
  );
}

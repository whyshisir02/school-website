import SettingsTabs from "@/components/admin/SettingsTabs";

export const dynamic = "force-dynamic";

// Shared shell for every /admin/settings/* page: the title and the tab strip
// render once here; each child page supplies just its own section below.
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <SettingsTabs />
      <div className="mt-8">{children}</div>
    </div>
  );
}

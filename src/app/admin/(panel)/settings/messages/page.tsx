import { getSiteSettings } from "@/lib/settings";
import MessagesForm from "@/components/admin/MessagesForm";

export const dynamic = "force-dynamic";

export default async function SettingsMessagesPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h2 className="text-xl font-bold">Leadership messages</h2>
      <p className="mt-1 text-sm text-slate-500">
        The Principal&rsquo;s and Chairman&rsquo;s messages shown on the homepage and About
        page. Leave a field blank to fall back to the built-in default.
      </p>
      <MessagesForm settings={settings} />
    </div>
  );
}

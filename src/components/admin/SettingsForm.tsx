"use client";

import { useState } from "react";
import { FiSave } from "react-icons/fi";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import type { SiteSettings } from "@/lib/settings";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  // Live preview of the embedded map as the URL is edited.
  const [mapEmbed, setMapEmbed] = useState(settings.mapEmbed);

  return (
    <form
      action={async (fd) => {
        setPending(true);
        setError("");
        setSaved(false);
        const res = await saveSettings(fd);
        setPending(false);
        if (res.ok) setSaved(true);
        else setError(res.error ?? "Could not save. Please try again.");
      }}
      className="mt-6 space-y-8"
    >
      {/* School identity + contact */}
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-navy">Contact information</h2>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">School name</span>
          <input name="schoolName" defaultValue={settings.name} required maxLength={120} className={`mt-1 ${inputCls}`} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Phone</span>
            <input name="phone" defaultValue={settings.phone} required maxLength={40} className={`mt-1 ${inputCls}`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email</span>
            <input name="email" type="email" defaultValue={settings.email} required maxLength={120} className={`mt-1 ${inputCls}`} />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Address</span>
          <input name="address" defaultValue={settings.address} required maxLength={200} className={`mt-1 ${inputCls}`} />
        </label>
      </section>
      {/* Map */}
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-navy">Location map</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Google Maps link (&ldquo;View on Map&rdquo; button)</span>
          <input name="mapLink" defaultValue={settings.mapLink} maxLength={500} placeholder="https://maps.app.goo.gl/…" className={`mt-1 ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Embedded map URL (the iframe on the site)</span>
          <input
            name="mapEmbed"
            value={mapEmbed}
            onChange={(e) => setMapEmbed(e.target.value)}
            maxLength={500}
            placeholder="https://www.google.com/maps?q=…&output=embed"
            className={`mt-1 ${inputCls}`}
          />
          <span className="mt-1 block text-xs text-slate-400">
            In Google Maps: Share → Embed a map → copy the <code>src</code> URL from the code.
          </span>
        </label>
        {mapEmbed && (
          <iframe
            src={mapEmbed}
            title="Map preview"
            className="h-[200px] w-full rounded-lg border border-slate-200"
            loading="lazy"
          />
        )}
      </section>

      {/* Homepage stat tiles */}
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-heading text-base font-bold text-navy">Homepage stats</h2>
          <p className="mt-1 text-sm text-slate-500">
            The number tiles on the homepage and About page. Enter real, verified figures —
            or untick <em>Show</em> to hide a tile you can&rsquo;t confirm rather than
            displaying a placeholder.
          </p>
        </div>

        <div className="space-y-3">
          {settings.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr,1.5fr,auto] items-center gap-3">
              <input
                name={`stat_value_${i}`}
                defaultValue={s.value}
                maxLength={20}
                placeholder="e.g. 18+"
                aria-label={`Stat ${i + 1} value`}
                className={inputCls}
              />
              <input
                name={`stat_label_${i}`}
                defaultValue={s.label}
                maxLength={40}
                placeholder="e.g. Years of Excellence"
                aria-label={`Stat ${i + 1} label`}
                className={inputCls}
              />
              <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-600">
                <input type="checkbox" name={`stat_show_${i}`} defaultChecked={s.show} className="accent-gold" />
                Show
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
          <FiSave /> {pending ? "Saving…" : "Save Settings"}
        </button>
        {saved && <p className="text-sm font-medium text-green-600">Settings saved.</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </form>
  );
}

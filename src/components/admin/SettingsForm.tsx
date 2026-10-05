"use client";

import { useState } from "react";
import SaveBar from "./SaveBar";
import UnsavedChangesGuard from "./UnsavedChangesGuard";
import { useSettingsSave } from "./useSettingsSave";
import { isMapsEmbed } from "@/lib/settings-validation";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import type { SiteSettings } from "@/lib/settings";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const state = useSettingsSave(saveSettings);
  // Live preview of the embedded map as the URL is edited.
  const [mapEmbed, setMapEmbed] = useState(settings.mapEmbed);

  return (
    <form
      key={state.resetKey} onChange={state.markDirty} onSubmit={(e) => { e.preventDefault(); void state.save(new FormData(e.currentTarget)); }}
      className="mt-6 space-y-6"
    >
      <UnsavedChangesGuard dirty={state.dirty} />
      {/* School identity + contact */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-heading text-base font-bold text-navy">Contact information</h2>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">School name</span>
          <input name="schoolName" aria-invalid={!!state.fieldErrors.schoolName} aria-describedby={state.fieldErrors.schoolName ? "schoolName-error" : undefined} defaultValue={settings.name} required maxLength={120} className={`mt-1 ${inputCls}`} />
          {state.fieldErrors.schoolName && <p id="schoolName-error" className="mt-1 text-xs text-red-600">{state.fieldErrors.schoolName}</p>}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Phone</span>
            <input name="phone" aria-invalid={!!state.fieldErrors.phone} aria-describedby={state.fieldErrors.phone ? "phone-error" : undefined} defaultValue={settings.phone} required maxLength={40} className={`mt-1 ${inputCls}`} />
          {state.fieldErrors.phone && <p id="phone-error" className="mt-1 text-xs text-red-600">{state.fieldErrors.phone}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email</span>
            <input name="email" aria-invalid={!!state.fieldErrors.email} aria-describedby={state.fieldErrors.email ? "email-error" : undefined} type="email" defaultValue={settings.email} required maxLength={120} className={`mt-1 ${inputCls}`} />
          {state.fieldErrors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Address</span>
          <input name="address" aria-invalid={!!state.fieldErrors.address} aria-describedby={state.fieldErrors.address ? "address-error" : undefined} defaultValue={settings.address} required maxLength={200} className={`mt-1 ${inputCls}`} />
          {state.fieldErrors.address && <p id="address-error" className="mt-1 text-xs text-red-600">{state.fieldErrors.address}</p>}
        </label>
      </section>
      {/* Map */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-heading text-base font-bold text-navy">Location map</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Google Maps link (&ldquo;View on Map&rdquo; button)</span>
          <input name="mapLink" aria-invalid={!!state.fieldErrors.mapLink} aria-describedby={state.fieldErrors.mapLink ? "mapLink-error" : undefined} defaultValue={settings.mapLink} maxLength={500} placeholder="https://maps.app.goo.gl/…" className={`mt-1 ${inputCls}`} />
          {state.fieldErrors.mapLink && <p id="mapLink-error" className="mt-1 text-xs text-red-600">{state.fieldErrors.mapLink}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Embedded map URL (the iframe on the site)</span>
          <input
            name="mapEmbed"
            aria-invalid={!!state.fieldErrors.mapEmbed}
            aria-describedby={state.fieldErrors.mapEmbed ? "mapEmbed-error" : undefined}
            value={mapEmbed}
            onChange={(e) => setMapEmbed(e.target.value)}
            maxLength={500}
            placeholder="https://www.google.com/maps?q=…&output=embed"
            className={`mt-1 ${inputCls}`}
          />
          {state.fieldErrors.mapEmbed && <p id="mapEmbed-error" className="mt-1 text-xs text-red-600">{state.fieldErrors.mapEmbed}</p>}
          <span className="mt-1 block text-xs text-slate-400">
            In Google Maps: Share → Embed a map → copy the <code>src</code> URL from the code.
          </span>
        </label>
        {isMapsEmbed(mapEmbed) && (
          <iframe
            src={mapEmbed}
            title="Map preview"
            className="h-[200px] w-full rounded-lg border border-slate-200"
            loading="lazy"
          />
        )}
      </section>

      {/* Homepage stat tiles */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="font-heading text-base font-bold text-navy">Homepage stats</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter school-confirmed figures, then tick <em>Verified; show</em> to publish each tile.
            Unconfirmed figures remain hidden on Home and About.
          </p>
        </div>

        <div className="space-y-3">
          {settings.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-1 items-center gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1.5fr_auto]">
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
                <input type="checkbox" name={`stat_show_${i}`} defaultChecked={s.show && s.verified} className="accent-gold" />
                Verified; show
              </label>
            </div>
          ))}
        </div>
      </section>

      <SaveBar {...state} onCancel={() => { state.cancel(); setMapEmbed(settings.mapEmbed); }} />
    </form>
  );
}

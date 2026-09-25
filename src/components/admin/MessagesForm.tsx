"use client";

import { useState } from "react";
import { FiSave } from "react-icons/fi";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { saveMessages } from "@/app/admin/(panel)/settings/content-actions";
import type { SiteSettings } from "@/lib/settings";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold";

/**
 * Edits the Principal & Chairman messages stored on the Settings row. Leaving a
 * field blank reverts that piece to the default in school.ts (see
 * getSiteSettings). The two long letters use the same RichTextEditor + upload
 * route as notices; the homepage excerpt is a short plain-text summary.
 */
export default function MessagesForm({ settings }: { settings: SiteSettings }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (fd) => {
        setPending(true);
        setError("");
        setSaved(false);
        const res = await saveMessages(fd);
        setPending(false);
        if (res.ok) setSaved(true);
        else setError(res.error ?? "Could not save. Please try again.");
      }}
      className="mt-6 space-y-8"
    >
      {/* Principal */}
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-heading text-base font-bold text-navy">Principal&rsquo;s message</h2>
          <p className="mt-1 text-sm text-slate-500">
            The short excerpt shows on the homepage; the full letter appears on the
            About page. Leave a field blank to use the built-in default.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Homepage excerpt (short quote)</span>
          <textarea
            name="principalExcerpt"
            defaultValue={settings.principalExcerpt}
            maxLength={600}
            rows={3}
            placeholder="One or two sentences shown on the homepage…"
            className={`mt-1 ${inputCls} resize-y`}
          />
        </label>

        <div className="block">
          <span className="text-sm font-medium text-slate-600">Full letter (About page)</span>
          <div className="mt-1">
            <RichTextEditor
              name="principalMessageHtml"
              initialHTML={settings.principalMessageHtml}
              uploadUrl="/api/admin/notices/upload"
            />
          </div>
        </div>
      </section>

      {/* Chairman */}
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-heading text-base font-bold text-navy">Chairman&rsquo;s message</h2>
          <p className="mt-1 text-sm text-slate-500">
            Appears on the About page. Leave the name blank to hide the
            attribution line until you can confirm it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Name</span>
            <input
              name="chairmanName"
              defaultValue={settings.chairmanName}
              maxLength={120}
              placeholder="e.g. Ram Bahadur…"
              className={`mt-1 ${inputCls}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Title</span>
            <input
              name="chairmanTitle"
              defaultValue={settings.chairmanTitle}
              maxLength={120}
              placeholder="Chairman, School Management Committee"
              className={`mt-1 ${inputCls}`}
            />
          </label>
        </div>

        <div className="block">
          <span className="text-sm font-medium text-slate-600">Message</span>
          <div className="mt-1">
            <RichTextEditor
              name="chairmanMessageHtml"
              initialHTML={settings.chairmanMessageHtml}
              uploadUrl="/api/admin/notices/upload"
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
          <FiSave /> {pending ? "Saving…" : "Save Messages"}
        </button>
        {saved && <p className="text-sm font-medium text-green-600">Messages saved.</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </form>
  );
}

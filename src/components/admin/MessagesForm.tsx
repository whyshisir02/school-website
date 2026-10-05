"use client";

import { useState } from "react";
import SaveBar from "./SaveBar";
import UnsavedChangesGuard from "./UnsavedChangesGuard";
import { useSettingsSave } from "./useSettingsSave";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100" /> });
import { saveMessages } from "@/app/admin/(panel)/settings/content-actions";
import type { SiteSettings } from "@/lib/settings";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold";

/**
 * Edits the Principal & Chairman messages stored on the Settings row. Leaving a
 * field blank removes that content from public display.
 * The homepage excerpt is a short plain-text summary.
 */
export default function MessagesForm({ settings }: { settings: SiteSettings }) {
  const state = useSettingsSave(saveMessages);

  return (
    <form
      key={state.resetKey} onChange={state.markDirty} onSubmit={(e) => { e.preventDefault(); void state.save(new FormData(e.currentTarget)); }}
      className="mt-6 space-y-8"
    >
      <UnsavedChangesGuard dirty={state.dirty} />
      {/* Principal */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="font-heading text-base font-bold text-navy">Principal&rsquo;s message</h2>
          <p className="mt-1 text-sm text-slate-500">
            The short excerpt shows on the homepage; the full letter appears on the
            About page. Leave a field blank to keep that content unpublished.
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
              onChange={state.markDirty}
              name="principalMessageHtml"
              initialHTML={settings.principalMessageHtml}
              uploadUrl="/api/admin/notices/upload"
            />
          </div>
        </div>
      </section>

      {/* Chairman */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
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
              onChange={state.markDirty}
              name="chairmanMessageHtml"
              initialHTML={settings.chairmanMessageHtml}
              uploadUrl="/api/admin/notices/upload"
            />
          </div>
        </div>
      </section>

      <SaveBar {...state} onCancel={state.cancel} label="Save messages" />
    </form>
  );
}
